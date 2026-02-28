import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scraperScheduler } from "@/lib/scraper/scheduler";

/**
 * GET - 查看抓取历史记录
 */
export async function GET() {
  try {
    const logs = await prisma.scrapeLog.findMany({
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

    return NextResponse.json({
      schedule: '每 3 天凌晨 2:00 自动执行',
      history: logs,
    });
  } catch (error) {
    console.error("GET /api/scraper/trigger error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

/**
 * POST - 手动触发抓取（不重试，失败记录日志即可）
 */
export async function POST(request: NextRequest) {
  try {
    let source: string | undefined;

    try {
      const body = await request.json();
      source = body?.source;
    } catch {
      // 空 body 或无效 JSON 没关系，source 是可选的
    }

    const results = await scraperScheduler.runNow(source);

    return NextResponse.json({
      status: "completed",
      message: source
        ? `抓取完成，数据源: ${source}`
        : "抓取完成，已运行所有数据源",
      results,
    });
  } catch (error) {
    console.error("POST /api/scraper/trigger error:", error);
    const message =
      error instanceof Error ? error.message : "抓取任务执行失败";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
