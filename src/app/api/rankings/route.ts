import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankByDimension, rankByComposite } from "@/lib/rankings";
import type { Model, Dimension } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dimension = searchParams.get("dimension");
    const limitParam = searchParams.get("limit");

    // dimension is required
    if (!dimension) {
      return NextResponse.json(
        { error: "参数错误", details: ["dimension 参数为必填项"] },
        { status: 400 }
      );
    }

    // Validate limit if provided
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    if (limitParam && (isNaN(limit!) || limit! < 1)) {
      return NextResponse.json(
        { error: "参数错误", details: ["limit 必须为正整数"] },
        { status: 400 }
      );
    }

    // Fetch all models with their latest scores per dimension
    const dbModels = await prisma.aIModel.findMany({
      include: {
        scores: {
          include: { dimension: true },
          orderBy: { scrapedAt: "desc" },
        },
      },
    });

    // Transform to Model[] with latest score per dimension
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

    // Fetch all dimensions from DB
    const dbDimensions = await prisma.dimension.findMany();
    const dimensions: Dimension[] = dbDimensions.map((d: typeof dbDimensions[number]) => ({
      id: d.id,
      name: d.name,
      displayName: d.displayName,
      weight: d.weight,
    }));

    // Rank models
    let rankings;
    if (dimension === "composite") {
      rankings = rankByComposite(models, dimensions);
    } else {
      rankings = rankByDimension(models, dimension);
    }

    // Apply limit if provided
    if (limit) {
      rankings = rankings.slice(0, limit);
    }

    // 查询最后一次成功抓取的时间
    const lastScrape = await prisma.scrapeLog.findFirst({
      where: { status: 'success' },
      orderBy: { endedAt: 'desc' },
      select: { endedAt: true, source: true },
    });

    return NextResponse.json({
      rankings,
      lastUpdated: lastScrape?.endedAt?.toISOString() ?? null,
      dataSource: lastScrape?.source ?? null,
    });
  } catch (error) {
    console.error("GET /api/rankings error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
