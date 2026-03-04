/**
 * Next.js Instrumentation - 应用启动时自动执行
 * 用于启动定时抓取任务：
 * - 模型数据：每 3 天凌晨 2:00
 * - 新闻数据：每 6 小时
 */
export async function register() {
  // 仅在 Node.js 运行时启动（不在 Edge 运行时）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scraperScheduler } = await import('@/lib/scraper/scheduler');
    const { startNewsCron } = await import('@/lib/scraper/news-scheduler');
    const { BuiltinNewsScraper } = await import('@/lib/scraper/sources/news-builtin');

    // 启动模型数据定时抓取（每 3 天凌晨 2:00）
    scraperScheduler.start();

    // 启动新闻独立定时抓取（每 6 小时）
    startNewsCron(new BuiltinNewsScraper());

    console.log('[Instrumentation] 定时任务已启动（模型数据: 每 3 天, 新闻: 每 6 小时）');
  }
}
