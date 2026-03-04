import { validateNews, deduplicateNews } from "@/lib/scraper/news-validator";
import type { RawNewsItem, ValidatedNewsItem } from "@/types";

// ── 测试辅助 ──

function makeRawNews(overrides?: Partial<RawNewsItem>): RawNewsItem {
  return {
    title: "GPT-5 发布",
    summary: "OpenAI 发布了最新的 GPT-5 模型",
    sourceName: "TechCrunch",
    sourceUrl: "https://techcrunch.com/gpt-5",
    publishedAt: new Date("2024-06-01"),
    tags: ["GPT-5", "OpenAI"],
    rawPayload: '{"raw": true}',
    ...overrides,
  };
}

function makeValidatedNews(
  overrides?: Partial<ValidatedNewsItem>
): ValidatedNewsItem {
  const raw = makeRawNews(overrides);
  return {
    ...raw,
    normalizedTitle: raw.title.trim().toLowerCase(),
    ...overrides,
  };
}

// ── validateNews 测试 ──

describe("validateNews", () => {
  it("有效数据通过校验并添加 normalizedTitle 字段", () => {
    const result = validateNews([makeRawNews()]);
    expect(result).toHaveLength(1);
    expect(result[0].normalizedTitle).toBe("gpt-5 发布");
  });

  it("空输入返回空数组", () => {
    expect(validateNews([])).toEqual([]);
  });

  it("过滤标题为空字符串的记录", () => {
    expect(validateNews([makeRawNews({ title: "" })])).toHaveLength(0);
  });

  it("过滤标题为纯空格的记录", () => {
    expect(validateNews([makeRawNews({ title: "   " })])).toHaveLength(0);
  });

  it("过滤来源名称为空字符串的记录", () => {
    expect(validateNews([makeRawNews({ sourceName: "" })])).toHaveLength(0);
  });

  it("过滤来源名称为纯空格的记录", () => {
    expect(validateNews([makeRawNews({ sourceName: "   " })])).toHaveLength(0);
  });

  it("过滤来源链接为空字符串的记录", () => {
    expect(validateNews([makeRawNews({ sourceUrl: "" })])).toHaveLength(0);
  });

  it("过滤来源链接不以 http:// 或 https:// 开头的记录", () => {
    expect(
      validateNews([makeRawNews({ sourceUrl: "ftp://example.com" })])
    ).toHaveLength(0);
    expect(
      validateNews([makeRawNews({ sourceUrl: "example.com" })])
    ).toHaveLength(0);
  });

  it("http:// 开头的链接通过校验", () => {
    const result = validateNews([
      makeRawNews({ sourceUrl: "http://example.com/news" }),
    ]);
    expect(result).toHaveLength(1);
  });

  it("过滤发布时间为无效日期的记录", () => {
    expect(
      validateNews([makeRawNews({ publishedAt: new Date("invalid") })])
    ).toHaveLength(0);
  });

  it("normalizedTitle 会 trim 和 lowercase", () => {
    const result = validateNews([makeRawNews({ title: "  GPT-5 发布  " })]);
    expect(result[0].normalizedTitle).toBe("gpt-5 发布");
  });

  it("混合有效和无效数据只保留有效记录", () => {
    const data: RawNewsItem[] = [
      makeRawNews({ title: "有效新闻 1" }),
      makeRawNews({ title: "" }),
      makeRawNews({ title: "有效新闻 2" }),
      makeRawNews({ sourceUrl: "invalid-url" }),
    ];
    const result = validateNews(data);
    expect(result).toHaveLength(2);
    expect(result[0].normalizedTitle).toBe("有效新闻 1");
    expect(result[1].normalizedTitle).toBe("有效新闻 2");
  });
});

// ── deduplicateNews 测试 ──

describe("deduplicateNews", () => {
  it("无重复数据原样返回", () => {
    const data: ValidatedNewsItem[] = [
      makeValidatedNews({ sourceUrl: "https://a.com/1" }),
      makeValidatedNews({ sourceUrl: "https://b.com/2" }),
    ];
    expect(deduplicateNews(data)).toHaveLength(2);
  });

  it("空输入返回空数组", () => {
    expect(deduplicateNews([])).toEqual([]);
  });

  it("相同 sourceUrl 的记录保留第一条", () => {
    const first = makeValidatedNews({
      sourceUrl: "https://example.com/same",
      title: "第一条",
    });
    const second = makeValidatedNews({
      sourceUrl: "https://example.com/same",
      title: "第二条",
    });
    const result = deduplicateNews([first, second]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("第一条");
  });

  it("不同 sourceUrl 不算重复", () => {
    const a = makeValidatedNews({ sourceUrl: "https://a.com/1" });
    const b = makeValidatedNews({ sourceUrl: "https://b.com/1" });
    expect(deduplicateNews([a, b])).toHaveLength(2);
  });

  it("多组重复各自保留第一条", () => {
    const data: ValidatedNewsItem[] = [
      makeValidatedNews({ sourceUrl: "https://a.com", title: "A1" }),
      makeValidatedNews({ sourceUrl: "https://b.com", title: "B1" }),
      makeValidatedNews({ sourceUrl: "https://a.com", title: "A2" }),
      makeValidatedNews({ sourceUrl: "https://b.com", title: "B2" }),
    ];
    const result = deduplicateNews(data);
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.sourceUrl === "https://a.com")?.title).toBe(
      "A1"
    );
    expect(result.find((r) => r.sourceUrl === "https://b.com")?.title).toBe(
      "B1"
    );
  });
});
