import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - 获取单条新闻详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.newsItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "新闻不存在" }, { status: 404 });
    }

    let tags: string[] = [];
    try {
      const parsed = JSON.parse(item.tags);
      tags = Array.isArray(parsed) ? parsed : [];
    } catch {
      tags = [];
    }

    return NextResponse.json({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt.toISOString(),
      tags,
      scrapedAt: item.scrapedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/news/:id error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
