import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterModels } from "@/lib/filters";
import type { Model, FilterState } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const vendor = searchParams.get("vendor");
    const openSourceParam = searchParams.get("openSource");
    const minParamsParam = searchParams.get("minParams");
    const maxParamsParam = searchParams.get("maxParams");
    const search = searchParams.get("search");
    const dimension = searchParams.get("dimension");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));

    const openSource =
      openSourceParam === "true" ? true : openSourceParam === "false" ? false : null;
    const minParams = minParamsParam ? parseFloat(minParamsParam) : null;
    const maxParams = maxParamsParam ? parseFloat(maxParamsParam) : null;

    // Validate numeric params
    if (minParams !== null && isNaN(minParams)) {
      return NextResponse.json({ error: "参数错误", details: ["minParams 必须为数字"] }, { status: 400 });
    }
    if (maxParams !== null && isNaN(maxParams)) {
      return NextResponse.json({ error: "参数错误", details: ["maxParams 必须为数字"] }, { status: 400 });
    }

    // Fetch all models with their scores and dimension info
    const dbModels = await prisma.aIModel.findMany({
      include: {
        scores: {
          include: { dimension: true },
          orderBy: { scrapedAt: "desc" },
        },
      },
    });

    // Transform DB records to Model[] type
    const models: Model[] = dbModels.map((dbModel: typeof dbModels[number]) => {
      // Get latest score per dimension
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

    // Sort by dimension score if specified
    if (dimension) {
      filtered.sort((a, b) => {
        const scoreA = a.scores[dimension] ?? -Infinity;
        const scoreB = b.scores[dimension] ?? -Infinity;
        return scoreB - scoreA;
      });
    }

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return NextResponse.json({ models: paged, total });
  } catch (error) {
    console.error("GET /api/models error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
