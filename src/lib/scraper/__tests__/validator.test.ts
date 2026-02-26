import { validate, deduplicate } from "@/lib/scraper/validator";
import type { RawScrapedData, ValidatedData } from "@/types";

// ── 测试辅助 ──

function makeRaw(overrides?: Partial<RawScrapedData>): RawScrapedData {
  return {
    source: "lmsys",
    modelName: "GPT-4",
    dimensionName: "coding",
    score: 92.5,
    scrapedAt: new Date("2024-01-15"),
    rawPayload: '{"raw": true}',
    ...overrides,
  };
}

function makeValidated(overrides?: Partial<ValidatedData>): ValidatedData {
  const raw = makeRaw(overrides);
  return {
    ...raw,
    normalizedModelName: raw.modelName.trim().toLowerCase(),
    normalizedDimensionName: raw.dimensionName.trim().toLowerCase(),
    ...overrides,
  };
}

// ── validate 测试 ──

describe("validate", () => {
  it("有效数据通过校验并添加归一化字段", () => {
    const result = validate([makeRaw()]);
    expect(result).toHaveLength(1);
    expect(result[0].normalizedModelName).toBe("gpt-4");
    expect(result[0].normalizedDimensionName).toBe("coding");
  });

  it("空输入返回空数组", () => {
    expect(validate([])).toEqual([]);
  });

  it("过滤 source 为空字符串的记录", () => {
    const result = validate([makeRaw({ source: "" })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 source 为纯空格的记录", () => {
    const result = validate([makeRaw({ source: "   " })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 modelName 为空的记录", () => {
    const result = validate([makeRaw({ modelName: "" })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 dimensionName 为空的记录", () => {
    const result = validate([makeRaw({ dimensionName: "" })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 score 为 NaN 的记录", () => {
    const result = validate([makeRaw({ score: NaN })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 score 为 Infinity 的记录", () => {
    const result = validate([makeRaw({ score: Infinity })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 score 为 -Infinity 的记录", () => {
    const result = validate([makeRaw({ score: -Infinity })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 scrapedAt 为无效 Date 的记录", () => {
    const result = validate([makeRaw({ scrapedAt: new Date("invalid") })]);
    expect(result).toHaveLength(0);
  });

  it("过滤 rawPayload 非字符串的记录", () => {
    const result = validate([makeRaw({ rawPayload: undefined as unknown as string })]);
    expect(result).toHaveLength(0);
  });

  it("归一化会 trim 和 lowercase", () => {
    const result = validate([makeRaw({ modelName: "  GPT-4o  ", dimensionName: "  Coding  " })]);
    expect(result[0].normalizedModelName).toBe("gpt-4o");
    expect(result[0].normalizedDimensionName).toBe("coding");
  });

  it("混合有效和无效数据只保留有效记录", () => {
    const data: RawScrapedData[] = [
      makeRaw({ modelName: "Valid-1" }),
      makeRaw({ score: NaN }),
      makeRaw({ modelName: "Valid-2" }),
      makeRaw({ source: "" }),
    ];
    const result = validate(data);
    expect(result).toHaveLength(2);
    expect(result[0].normalizedModelName).toBe("valid-1");
    expect(result[1].normalizedModelName).toBe("valid-2");
  });

  it("score 为 0 是有效的", () => {
    const result = validate([makeRaw({ score: 0 })]);
    expect(result).toHaveLength(1);
  });

  it("score 为负数是有效的", () => {
    const result = validate([makeRaw({ score: -5 })]);
    expect(result).toHaveLength(1);
  });

  it("rawPayload 为空字符串是有效的", () => {
    const result = validate([makeRaw({ rawPayload: "" })]);
    expect(result).toHaveLength(1);
  });
});

// ── deduplicate 测试 ──

describe("deduplicate", () => {
  it("无重复数据原样返回", () => {
    const data: ValidatedData[] = [
      makeValidated({ modelName: "A", normalizedModelName: "a" }),
      makeValidated({ modelName: "B", normalizedModelName: "b" }),
    ];
    const result = deduplicate(data);
    expect(result).toHaveLength(2);
  });

  it("空输入返回空数组", () => {
    expect(deduplicate([])).toEqual([]);
  });

  it("重复记录保留 scrapedAt 最新的", () => {
    const older = makeValidated({
      scrapedAt: new Date("2024-01-01"),
      score: 80,
    });
    const newer = makeValidated({
      scrapedAt: new Date("2024-06-01"),
      score: 90,
    });
    const result = deduplicate([older, newer]);
    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(90);
  });

  it("不同 source 不算重复", () => {
    const a = makeValidated({ source: "lmsys" });
    const b = makeValidated({ source: "openllm" });
    const result = deduplicate([a, b]);
    expect(result).toHaveLength(2);
  });

  it("不同 dimensionName 不算重复", () => {
    const a = makeValidated({ dimensionName: "coding", normalizedDimensionName: "coding" });
    const b = makeValidated({ dimensionName: "reasoning", normalizedDimensionName: "reasoning" });
    const result = deduplicate([a, b]);
    expect(result).toHaveLength(2);
  });

  it("不同 modelName 不算重复", () => {
    const a = makeValidated({ modelName: "GPT-4", normalizedModelName: "gpt-4" });
    const b = makeValidated({ modelName: "Claude", normalizedModelName: "claude" });
    const result = deduplicate([a, b]);
    expect(result).toHaveLength(2);
  });

  it("多组重复各自保留最新", () => {
    const data: ValidatedData[] = [
      makeValidated({ normalizedModelName: "a", normalizedDimensionName: "x", source: "s1", scrapedAt: new Date("2024-01-01"), score: 1 }),
      makeValidated({ normalizedModelName: "a", normalizedDimensionName: "x", source: "s1", scrapedAt: new Date("2024-06-01"), score: 2 }),
      makeValidated({ normalizedModelName: "b", normalizedDimensionName: "y", source: "s1", scrapedAt: new Date("2024-02-01"), score: 3 }),
      makeValidated({ normalizedModelName: "b", normalizedDimensionName: "y", source: "s1", scrapedAt: new Date("2024-07-01"), score: 4 }),
    ];
    const result = deduplicate(data);
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.normalizedModelName === "a")?.score).toBe(2);
    expect(result.find((r) => r.normalizedModelName === "b")?.score).toBe(4);
  });
});
