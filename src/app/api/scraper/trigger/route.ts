import { NextRequest, NextResponse } from "next/server";
import { scraperScheduler } from "@/lib/scraper/scheduler";

export async function POST(request: NextRequest) {
  try {
    let source: string | undefined;

    try {
      const body = await request.json();
      source = body?.source;
    } catch {
      // Empty body or invalid JSON is fine — source is optional
    }

    await scraperScheduler.runNow(source);

    return NextResponse.json({
      status: "started",
      message: source
        ? `抓取任务已启动，数据源: ${source}`
        : "抓取任务已启动，运行所有数据源",
    });
  } catch (error) {
    console.error("POST /api/scraper/trigger error:", error);
    const message =
      error instanceof Error ? error.message : "抓取任务启动失败";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
