import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ModelDetail, ScoreHistory } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dbModel = await prisma.aIModel.findUnique({
      where: { id },
      include: {
        scores: {
          include: { dimension: true },
          orderBy: { scrapedAt: "desc" },
        },
      },
    });

    if (!dbModel) {
      return NextResponse.json({ error: "模型未找到" }, { status: 404 });
    }

    // Build latest scores per dimension
    const scores: Record<string, number | null> = {};
    const seenDimensions = new Set<string>();

    for (const score of dbModel.scores) {
      const dimName = score.dimension.name;
      if (!seenDimensions.has(dimName)) {
        seenDimensions.add(dimName);
        scores[dimName] = score.value;
      }
    }

    // Build full score history
    const scoreHistory: ScoreHistory[] = dbModel.scores.map((score: typeof dbModel.scores[number]) => ({
      dimensionName: score.dimension.name,
      value: score.value,
      source: score.source,
      scrapedAt: score.scrapedAt.toISOString(),
    }));

    const model: ModelDetail = {
      id: dbModel.id,
      name: dbModel.name,
      vendor: dbModel.vendor,
      releaseDate: dbModel.releaseDate?.toISOString() ?? null,
      paramSize: dbModel.paramSize,
      openSource: dbModel.openSource,
      description: dbModel.description,
      scores,
      scoreHistory,
    };

    return NextResponse.json({ model });
  } catch (error) {
    console.error("GET /api/models/:id error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
