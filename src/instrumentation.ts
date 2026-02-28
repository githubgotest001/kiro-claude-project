/**
 * Next.js Instrumentation - 应用启动时自动执行
 * 用于启动定时抓取任务
 */
export async function register() {
  // 仅在 Node.js 运行时启动（不在 Edge 运行时）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scraperScheduler } = await import('@/lib/scraper/scheduler');

    // 启动定时抓取（每 3 天凌晨 2:00）
    scraperScheduler.start();
    console.log('[Instrumentation] 定时抓取任务已启动（每 3 天执行一次）');
  }
}
