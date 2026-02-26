import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterModels } from "@/lib/filters";
import { exportToCSV, exportToJSON } from "@/lib/export";
import type { Model, FilterState, ExportMeta } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse format parameter (required)
    const format = searchParams.get("format");
    if (!format || (format !== "csv" && format !== "json")) {
      return NextResponse.json(
        { error: "不支持的导出格式", details: ["format 参数必须为 'csv' 或 'json'"] },
        { status: 400 }
      );
    }

    // Parse filter parameters (same as /api/models)
    const vendor = searchParams.get("vendor");
    const openSourceParam = searchParams.get("openSource");
    const minParamsParam = searchParams.get("minParams");
    const maxParamsParam = searchParams.get("maxParams");
    const search = searchParams.get("search");
    const dimension = searchParams.get("dimension");

    const openSource =
      openSourceParam === "true" ? true : openSourceParam === "false" ? false : null;
    const minParams = minParamsParam ? parseFloat(minParamsParam) : null;
    const maxParams = maxParamsParam ? parseFloat(maxParamsParam) : null;

    if (minParams !== null && isNaN(minParams)) {
      return NextResponse.json(
        { error: "参数错误", details: ["minParams 必须为数字"] },
        { status: 400 }
      );
    }
    if (maxParams !== null && isNaN(maxParams)) {
      return NextResponse.json(
        { error: "参数错误", details: ["maxParams 必须为数字"] },
        { status: 400 }
      );
    }

    // Fetch all models with scores
    const dbModels = await prisma.aIModel.findMany({
      include: {
        scores: {
          include: { dimension: true },
          orderBy: { scrapedAt: "desc" },
        },
      },
    });

    // Transform to Model[]
    const models: Model[] = dbModels.map((dbModel: typeof dbModels[number]) => {
      const scores: Record<string, number | null> = {};
      const seenDimensions = new Set<string>();

      for (const score of dbModel.scores) {
        const dimName = score.dimension.name;
        if (!seenDimensions.has(dimName)) {
          seenDimensions.add(dimName);
          scores[dimName] = score.value;
        }
      }

      return {
        id: dbModel.id,
        name: dbModel.name,
        vendor: dbModel.vendor,
        releaseDate: dbModel.releaseDate?.toISOString() ?? null,
        paramSize: dbModel.paramSize,
        openSource: dbModel.openSource,
        scores,
      };
    });

    // Apply filters
    const filters: FilterState = {
      vendor: vendor ?? null,
      openSource,
      minParams: minParams !== null && !isNaN(minParams) ? minParams : null,
      maxParams: maxParams !== null && !isNaN(maxParams) ? maxParams : null,
      search: search ?? "",
    };

    let filtered = filterModels(models, filters);

    // Sort by dimension if specified
    if (dimension) {
      filtered.sort((a, b) => {
        const scoreA = a.scores[dimension] ?? -Infinity;
        const scoreB = b.scores[dimension] ?? -Infinity;
        return scoreB - scoreA;
      });
    }

    // Get dimension names for CSV headers
    const dimensions = await prisma.dimension.findMany({ orderBy: { name: "asc" } });
    const dimensionNames = dimensions.map((d: { name: string }) => d.name);

    // Get latest scrape time
    const latestScrape = await prisma.scrapeLog.findFirst({
      where: { status: "success" },
      orderBy: { endedAt: "desc" },
    });

    // Build export meta
    const meta: ExportMeta = {
      exportedAt: new Date().toISOString(),
      source: "AI Model Leaderboard",
      filters,
      dataLastUpdated: latestScrape?.endedAt?.toISOString() ?? "N/A",
    };

    // Generate export content
    if (format === "csv") {
      const csv = exportToCSV(filtered, meta, dimensionNames);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="ai-models-export.csv"',
        },
      });
    }

    const json = exportToJSON(filtered, meta);
    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ai-models-export.json"',
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
