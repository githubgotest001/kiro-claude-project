import * as cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { validate, deduplicate } from '@/lib/scraper/validator';
import { BuiltinScraper } from '@/lib/scraper/sources/builtin';
import { ArtificialAnalysisScraper } from '@/lib/scraper/sources/artificial-analysis';
import type { Scraper, RawScrapedData, ValidatedData, ScrapeResult } from '@/types';

const SCRAPER_TIMEOUT_MS = 30_000;

/**
 * 带超时的 Promise 包装器
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Scraper "${label}" timed out after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export class ScraperScheduler {
  private scrapers: Scraper[] = [];
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * 注册一个数据抓取器
   */
  register(scraper: Scraper): void {
    this.scrapers.push(scraper);
  }

  /**
   * 启动定时任务（默认每周日 00:00）
   */
  start(cronExpression = '0 0 * * 0'): void {
    this.stop();
    this.cronJob = cron.schedule(cronExpression, () => {
      this.runNow().catch((err) => {
        console.error('[ScraperScheduler] Scheduled run failed:', err);
      });
    });
  }

  /**
   * 停止定时任务
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  /**
   * 立即执行抓取任务
   * @param scraperName 可选，指定运行某个抓取器；不传则运行全部
   */
  async runNow(scraperName?: string): Promise<ScrapeResult[]> {
    const targets = scraperName
      ? this.scrapers.filter((s) => s.name === scraperName)
      : this.scrapers;

    const results: ScrapeResult[] = [];

    for (const scraper of targets) {
      const result = await this.executeScraper(scraper);
      results.push(result);
    }

    return results;
  }

  /**
   * 执行单个抓取器：抓取 → 校验去重 → 事务写入
   */
  private async executeScraper(scraper: Scraper): Promise<ScrapeResult> {
    const startedAt = new Date();
    const errors: string[] = [];

    // 1. 抓取原始数据（带超时）
    let rawData: RawScrapedData[];
    try {
      rawData = await withTimeout(
        scraper.scrape(),
        SCRAPER_TIMEOUT_MS,
        scraper.name,
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(errorMsg);

      // 记录抓取失败日志
      await this.logScrape(scraper.source, 'error', null, errorMsg, startedAt);

      return {
        source: scraper.source,
        status: 'error',
        recordsProcessed: 0,
        errors,
      };
    }

    // 2. 校验和去重
    const validated = validate(rawData);
    const deduped = deduplicate(validated);

    if (deduped.length === 0) {
      const msg = 'No valid records after validation and deduplication';
      errors.push(msg);
      await this.logScrape(scraper.source, 'error', JSON.stringify(rawData), msg, startedAt);

      return {
        source: scraper.source,
        status: 'error',
        recordsProcessed: 0,
        errors,
      };
    }

    // 3. 事务性写入数据库
    try {
      await this.writeToDatabase(scraper.source, rawData, deduped, startedAt);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Database write failed: ${errorMsg}`);

      // 事务回滚由 Prisma 自动处理，记录错误日志
      await this.logScrape(scraper.source, 'error', JSON.stringify(rawData), errorMsg, startedAt);

      return {
        source: scraper.source,
        status: 'error',
        recordsProcessed: 0,
        errors,
      };
    }

    const status = errors.length > 0 ? 'partial' : 'success';
    return {
      source: scraper.source,
      status,
      recordsProcessed: deduped.length,
      errors,
    };
  }

  /**
   * 事务性写入：upsert 模型、查找维度、创建评分、记录日志
   * 失败时 Prisma 自动回滚整个事务
   */
  private async writeToDatabase(
    source: string,
    rawData: RawScrapedData[],
    deduped: ValidatedData[],
    startedAt: Date,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const record of deduped) {
        // 从原始数据中提取模型元信息
        const rawRecord = rawData.find((r) => r.modelName === record.modelName);
        const meta = rawRecord?.modelMeta;

        // Upsert AIModel（按 name 匹配，有元信息时更新）
        const model = await tx.aIModel.upsert({
          where: { name: record.modelName },
          update: {
            updatedAt: new Date(),
            ...(meta?.vendor && { vendor: meta.vendor }),
            ...(meta?.releaseDate && { releaseDate: new Date(meta.releaseDate) }),
            ...(meta?.paramSize && { paramSize: meta.paramSize }),
            ...(meta?.openSource !== undefined && { openSource: meta.openSource }),
            ...(meta?.description && { description: meta.description }),
            ...(meta?.accessUrl && { accessUrl: meta.accessUrl }),
          },
          create: {
            name: record.modelName,
            vendor: meta?.vendor ?? 'Unknown',
            releaseDate: meta?.releaseDate ? new Date(meta.releaseDate) : null,
            paramSize: meta?.paramSize ?? null,
            openSource: meta?.openSource ?? false,
            description: meta?.description ?? null,
            accessUrl: meta?.accessUrl ?? null,
          },
        });

        // 查找匹配的 Dimension
        const dimension = await tx.dimension.findUnique({
          where: { name: record.normalizedDimensionName },
        });

        if (!dimension) {
          // 维度不存在则跳过该记录
          continue;
        }

        // 创建 Score 记录
        await tx.score.create({
          data: {
            modelId: model.id,
            dimensionId: dimension.id,
            value: record.score,
            source: record.source,
            scrapedAt: record.scrapedAt,
          },
        });
      }

      // 记录成功日志（原始数据 + 处理后数据）
      await tx.scrapeLog.create({
        data: {
          source,
          status: 'success',
          rawData: JSON.stringify({
            raw: rawData,
            processed: deduped,
          }),
          startedAt,
          endedAt: new Date(),
        },
      });
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
      console.error('[ScraperScheduler] Failed to write scrape log:', logErr);
    }
  }
}

// 导出预注册数据源的单例
// 如果配置了 ARTIFICIAL_ANALYSIS_API_KEY，则使用真实 API；否则使用内置数据
export const scraperScheduler = new ScraperScheduler();
if (process.env.ARTIFICIAL_ANALYSIS_API_KEY) {
  scraperScheduler.register(new ArtificialAnalysisScraper());
}
scraperScheduler.register(new BuiltinScraper());
