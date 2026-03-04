import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsScraperRunner } from "@/lib/scraper/news-scheduler";
import { BuiltinNewsScraper } from "@/lib/scraper/sources/news-builtin";

/**
 * GET - 查看新闻抓取历史
 */
export async function GET() {
  try {
    const logs = await prisma.scrapeLog.findMany({
      where: { source: { contains: 'News' } },
      orderBy: { endedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        source: true,
        status: true,
        error: true,
        startedAt: true,
        endedAt: true,
      },
    });

    const totalNews = await prisma.newsItem.count();

    return NextResponse.json({
      schedule: '每 6 小时自动执行',
      maxCount: 1000,
      currentCount: totalNews,
      history: logs,
    });
  } catch (error) {
    console.error("GET /api/news/trigger error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

/**
 * POST - 手动触发新闻抓取
 */
export async function POST() {
  try {
    const scraper = new BuiltinNewsScraper();
    await newsScraperRunner.runNewsScraper(scraper);

    const totalNews = await prisma.newsItem.count();

    const lastScrape = await prisma.scrapeLog.findFirst({
      where: { source: { contains: 'News' }, status: 'success' },
      orderBy: { endedAt: 'desc' },
      select: { endedAt: true },
    });

    return NextResponse.json({
      status: "completed",
      message: "新闻抓取完成",
      currentCount: totalNews,
      lastUpdated: lastScrape?.endedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("POST /api/news/trigger error:", error);
    const message = error instanceof Error ? error.message : "新闻抓取任务执行失败";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
