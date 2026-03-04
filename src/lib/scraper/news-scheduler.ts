/**
 * 新闻抓取调度模块
 *
 * 负责新闻抓取的完整流程：抓取 → 校验去重 → 事务写入 NewsItem 表 → 记录 ScrapeLog。
 * 通过适配器模式将 NewsScraperInterface 包装为 Scraper 接口，注册到现有 ScraperScheduler。
 */
import { prisma } from '@/lib/prisma';
import { validateNews, deduplicateNews } from '@/lib/scraper/news-validator';
import type {
  NewsScraperInterface,
  RawNewsItem,
  ValidatedNewsItem,
  Scraper,
  RawScrapedData,
} from '@/types';

/** 抓取超时时间（复用现有 30 秒超时） */
const SCRAPER_TIMEOUT_MS = 30_000;

/**
 * 带超时的 Promise 包装器
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`新闻抓取器 "${label}" 超时（${ms}ms）`));
    }, ms);

    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/** 新闻存储上限 */
const NEWS_MAX_COUNT = 1000;

/**
 * 新闻抓取运行器
 *
 * 负责执行单个新闻抓取器的完整流程：
 * 抓取原始数据 → 校验过滤 → 去重 → 事务写入 NewsItem 表 → 清理超限旧新闻 → 记录 ScrapeLog
 */
export class NewsScraperRunner {
  /**
   * 执行单个新闻抓取器的完整流程
   */
  async runNewsScraper(scraper: NewsScraperInterface): Promise<void> {
    const startedAt = new Date();

    // 1. 抓取原始数据（带超时）
    let rawItems: RawNewsItem[];
    try {
      rawItems = await withTimeout(
        scraper.scrapeNews(),
        SCRAPER_TIMEOUT_MS,
        scraper.name,
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await this.logScrape(scraper.source, 'error', null, errorMsg, startedAt);
      return;
    }

    // 2. 校验和去重
    const validatedItems = validateNews(rawItems);
    const dedupedItems = deduplicateNews(validatedItems);

    if (dedupedItems.length === 0) {
      await this.logScrape(
        scraper.source,
        'error',
        JSON.stringify({ raw: rawItems, processed: [] }),
        '校验去重后无有效记录',
        startedAt,
      );
      return;
    }

    // 3. 事务写入 NewsItem 表 + 记录 ScrapeLog
    try {
      await this.writeNewsToDatabase(scraper.source, rawItems, dedupedItems, validatedItems, startedAt);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await this.logScrape(
        scraper.source,
        'error',
        JSON.stringify({ raw: rawItems, processed: validatedItems }),
        `数据库写入失败: ${errorMsg}`,
        startedAt,
      );
    }
  }

  /**
   * 事务写入：upsert NewsItem + 记录 ScrapeLog
   */
  private async writeNewsToDatabase(
    source: string,
    rawItems: RawNewsItem[],
    dedupedItems: ValidatedNewsItem[],
    validatedItems: ValidatedNewsItem[],
    startedAt: Date,
  ): Promise<void> {
    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      // 逐条 upsert，基于 sourceUrl 避免重复
      for (const item of dedupedItems) {
        await tx.newsItem.upsert({
          where: { sourceUrl: item.sourceUrl },
          update: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            sourceName: item.sourceName,
            publishedAt: item.publishedAt,
            tags: JSON.stringify(item.tags),
            scrapedAt: new Date(),
          },
          create: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            publishedAt: item.publishedAt,
            tags: JSON.stringify(item.tags),
            scrapedAt: new Date(),
          },
        });
      }

      // 记录成功日志
      await tx.scrapeLog.create({
        data: {
          source,
          status: 'success',
          rawData: JSON.stringify({ raw: rawItems, processed: validatedItems }),
          startedAt,
          endedAt: new Date(),
        },
      });

      // 清理超限旧新闻：保留最新的 NEWS_MAX_COUNT 条
      const totalCount = await tx.newsItem.count();
      if (totalCount > NEWS_MAX_COUNT) {
        const cutoff = await tx.newsItem.findMany({
          orderBy: { publishedAt: 'desc' },
          skip: NEWS_MAX_COUNT,
          take: 1,
          select: { publishedAt: true },
        });
        if (cutoff.length > 0) {
          await tx.newsItem.deleteMany({
            where: { publishedAt: { lte: cutoff[0].publishedAt } },
          });
        }
      }
    });
  }

  /**
   * 记录抓取日志（在事务外部，确保即使事务回滚也能记录）
   */
  private async logScrape(
    source: string,
    status: string,
    rawData: string | null,
    error: string,
    startedAt: Date,
  ): Promise<void> {
    try {
      await prisma.scrapeLog.create({
        data: {
          source,
          status,
          rawData,
          error,
          startedAt,
          endedAt: new Date(),
        },
      });
    } catch (logErr) {
      console.error('[NewsScraperRunner] 写入抓取日志失败:', logErr);
    }
  }
}

/** NewsScraperRunner 单例 */
export const newsScraperRunner = new NewsScraperRunner();

/** 新闻独立定时任务（默认每 6 小时） */
let newsCronJob: ReturnType<typeof import('node-cron').schedule> | null = null;

/**
 * 启动新闻独立定时抓取（每 6 小时）
 * 与模型数据抓取的 cron 独立运行
 */
export function startNewsCron(scraper: NewsScraperInterface, cronExpression = '0 */6 * * *'): void {
  stopNewsCron();
  // 动态导入 node-cron 避免循环依赖
  const cron = require('node-cron');
  newsCronJob = cron.schedule(cronExpression, () => {
    newsScraperRunner.runNewsScraper(scraper).catch((err: unknown) => {
      console.error('[NewsCron] 新闻定时抓取失败:', err);
    });
  });
}

/**
 * 停止新闻定时任务
 */
export function stopNewsCron(): void {
  if (newsCronJob) {
    (newsCronJob as { stop: () => void }).stop();
    newsCronJob = null;
  }
}

/**
 * 将 NewsScraperInterface 适配为 Scraper 接口
 *
 * 在 scrape() 方法中调用 NewsScraperRunner 执行新闻抓取完整流程，
 * 返回空的 RawScrapedData[]（因为新闻数据已直接写入 NewsItem 表）。
 */
export function createNewsScraperAdapter(scraper: NewsScraperInterface): Scraper {
  return {
    name: scraper.name,
    source: scraper.source,
    async scrape(): Promise<RawScrapedData[]> {
      await newsScraperRunner.runNewsScraper(scraper);
      // 新闻数据已在 runNewsScraper 中直接写入 NewsItem 表，返回空数组
      return [];
    },
  };
}
