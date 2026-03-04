import { NewsScraperRunner, createNewsScraperAdapter } from '@/lib/scraper/news-scheduler';
import { prisma } from '@/lib/prisma';
import type { NewsScraperInterface, RawNewsItem } from '@/types';

// ── Prisma Mock ──

const mockUpsert = jest.fn().mockResolvedValue({});
const mockScrapeLogCreate = jest.fn().mockResolvedValue({});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({
        newsItem: { upsert: mockUpsert },
        scrapeLog: { create: mockScrapeLogCreate },
      });
    }),
    scrapeLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

const mockOuterScrapeLogCreate = prisma.scrapeLog.create as jest.Mock;

// ── 测试辅助 ──

function makeRawNewsItem(overrides?: Partial<RawNewsItem>): RawNewsItem {
  return {
    title: 'GPT-5 发布',
    summary: 'OpenAI 发布了最新的 GPT-5 模型',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/gpt-5',
    publishedAt: new Date('2024-06-01'),
    tags: ['GPT-5', 'OpenAI'],
    rawPayload: '{"raw": true}',
    ...overrides,
  };
}

function makeMockScraper(
  overrides?: Partial<NewsScraperInterface> & { items?: RawNewsItem[] },
): NewsScraperInterface {
  return {
    name: overrides?.name ?? 'test-news-scraper',
    source: overrides?.source ?? 'Test News Source',
    scrapeNews: jest.fn().mockResolvedValue(overrides?.items ?? [makeRawNewsItem()]),
  };
}

// ── 测试 ──

describe('NewsScraperRunner', () => {
  let runner: NewsScraperRunner;

  beforeEach(() => {
    jest.clearAllMocks();
    runner = new NewsScraperRunner();
  });

  it('成功抓取时 upsert NewsItem 并记录成功日志', async () => {
    const scraper = makeMockScraper();

    await runner.runNewsScraper(scraper);

    // 验证调用了 scrapeNews
    expect(scraper.scrapeNews).toHaveBeenCalledTimes(1);
    // 验证 upsert 被调用
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceUrl: 'https://techcrunch.com/gpt-5' },
        create: expect.objectContaining({
          title: 'GPT-5 发布',
          sourceName: 'TechCrunch',
          sourceUrl: 'https://techcrunch.com/gpt-5',
        }),
      }),
    );
    // 验证事务内记录了成功日志
    expect(mockScrapeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'Test News Source',
          status: 'success',
        }),
      }),
    );
  });

  it('多条有效新闻逐条 upsert', async () => {
    const items = [
      makeRawNewsItem({ sourceUrl: 'https://a.com/1', title: '新闻 A' }),
      makeRawNewsItem({ sourceUrl: 'https://b.com/2', title: '新闻 B' }),
    ];
    const scraper = makeMockScraper({ items });

    await runner.runNewsScraper(scraper);

    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });

  it('tags 以 JSON 字符串写入数据库', async () => {
    const items = [makeRawNewsItem({ tags: ['Claude', 'Anthropic'] })];
    const scraper = makeMockScraper({ items });

    await runner.runNewsScraper(scraper);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          tags: JSON.stringify(['Claude', 'Anthropic']),
        }),
      }),
    );
  });

  it('抓取抛出异常时记录错误日志', async () => {
    const scraper: NewsScraperInterface = {
      name: 'error-scraper',
      source: 'Error Source',
      scrapeNews: jest.fn().mockRejectedValue(new Error('网络错误')),
    };

    await runner.runNewsScraper(scraper);

    // 不应写入 NewsItem
    expect(mockUpsert).not.toHaveBeenCalled();
    // 应在事务外记录错误日志
    expect(mockOuterScrapeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'Error Source',
          status: 'error',
          error: '网络错误',
        }),
      }),
    );
  });

  it('校验去重后无有效记录时记录错误日志', async () => {
    // 所有记录标题为空，校验后为空
    const items = [makeRawNewsItem({ title: '' })];
    const scraper = makeMockScraper({ items });

    await runner.runNewsScraper(scraper);

    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockOuterScrapeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'error',
          error: '校验去重后无有效记录',
        }),
      }),
    );
  });

  it('数据库写入失败时记录错误日志', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('数据库连接失败'));
    const scraper = makeMockScraper();

    await runner.runNewsScraper(scraper);

    expect(mockOuterScrapeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'error',
          error: expect.stringContaining('数据库写入失败'),
        }),
      }),
    );
  });

  it('重复 sourceUrl 的新闻去重后只 upsert 一次', async () => {
    const items = [
      makeRawNewsItem({ sourceUrl: 'https://same.com/news', title: '第一条' }),
      makeRawNewsItem({ sourceUrl: 'https://same.com/news', title: '第二条' }),
    ];
    const scraper = makeMockScraper({ items });

    await runner.runNewsScraper(scraper);

    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });
});

describe('createNewsScraperAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('适配器保留原始 name 和 source', () => {
    const scraper = makeMockScraper({ name: 'my-news', source: 'My Source' });
    const adapter = createNewsScraperAdapter(scraper);

    expect(adapter.name).toBe('my-news');
    expect(adapter.source).toBe('My Source');
  });

  it('scrape() 返回空的 RawScrapedData 数组', async () => {
    const scraper = makeMockScraper();
    const adapter = createNewsScraperAdapter(scraper);

    const result = await adapter.scrape();

    expect(result).toEqual([]);
  });

  it('scrape() 内部调用了 scrapeNews', async () => {
    const scraper = makeMockScraper();
    const adapter = createNewsScraperAdapter(scraper);

    await adapter.scrape();

    expect(scraper.scrapeNews).toHaveBeenCalledTimes(1);
  });
});
