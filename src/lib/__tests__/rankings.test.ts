import { rankByDimension, rankByComposite } from "@/lib/rankings";
import type { Model, Dimension } from "@/types";

// ── 测试数据 ──

const sampleModels: Model[] = [
  {
    id: "1",
    name: "GPT-4",
    vendor: "OpenAI",
    releaseDate: "2023-03-14",
    paramSize: "1.5T",
    openSource: false,
    accessUrl: null,
    scores: { coding: 90, reasoning: 95, math: 88 },
  },
  {
    id: "2",
    name: "Llama 3",
    vendor: "Meta",
    releaseDate: "2024-04-18",
    paramSize: "70B",
    openSource: true,
    accessUrl: null,
    scores: { coding: 80, reasoning: 82, math: 75 },
  },
  {
    id: "3",
    name: "Claude 3 Opus",
    vendor: "Anthropic",
    releaseDate: "2024-03-04",
    paramSize: null,
    openSource: false,
    accessUrl: null,
    scores: { coding: 88, reasoning: 92, math: null },
  },
  {
    id: "4",
    name: "Gemini Pro",
    vendor: "Google",
    releaseDate: "2023-12-06",
    paramSize: "175B",
    openSource: false,
    accessUrl: null,
    scores: { coding: 85, reasoning: 88, math: 90 },
  },
  {
    id: "5",
    name: "Mistral 7B",
    vendor: "Mistral",
    releaseDate: "2023-09-27",
    paramSize: "7B",
    openSource: true,
    accessUrl: null,
    scores: { coding: null, reasoning: null, math: null },
  },
];

const sampleDimensions: Dimension[] = [
  { id: "d1", name: "coding", displayName: "编码能力", weight: 2 },
  { id: "d2", name: "reasoning", displayName: "推理能力", weight: 3 },
  { id: "d3", name: "math", displayName: "数学能力", weight: 1 },
];

// ── rankByDimension 测试 ──

describe("rankByDimension", () => {
  it("按单一维度降序排列并分配排名", () => {
    const result = rankByDimension(sampleModels, "coding");

    expect(result[0].name).toBe("GPT-4");
    expect(result[0].rank).toBe(1);
    expect(result[0].dimensionScore).toBe(90);

    expect(result[1].name).toBe("Claude 3 Opus");
    expect(result[1].rank).toBe(2);
    expect(result[1].dimensionScore).toBe(88);

    expect(result[2].name).toBe("Gemini Pro");
    expect(result[2].rank).toBe(3);
    expect(result[2].dimensionScore).toBe(85);

    expect(result[3].name).toBe("Llama 3");
    expect(result[3].rank).toBe(4);
    expect(result[3].dimensionScore).toBe(80);
  });

  it("null 评分的模型排在末尾", () => {
    const result = rankByDimension(sampleModels, "coding");

    // Mistral 7B coding 为 null，应排在最后
    expect(result[result.length - 1].name).toBe("Mistral 7B");
    expect(result[result.length - 1].dimensionScore).toBeNull();
    expect(result[result.length - 1].rank).toBe(5);
  });

  it("所有模型该维度评分为 null 时全部排在末尾", () => {
    const models: Model[] = [
      {
        id: "a",
        name: "Model A",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        accessUrl: null,
        scores: { coding: 90 },
      },
      {
        id: "b",
        name: "Model B",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        accessUrl: null,
        scores: { coding: 80 },
      },
    ];

    const result = rankByDimension(models, "nonexistent");
    expect(result).toHaveLength(2);
    expect(result[0].dimensionScore).toBeNull();
    expect(result[1].dimensionScore).toBeNull();
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  it("空模型列表返回空数组", () => {
    const result = rankByDimension([], "coding");
    expect(result).toEqual([]);
  });

  it("维度不存在时所有模型 dimensionScore 为 null", () => {
    const result = rankByDimension(sampleModels, "unknown_dimension");
    expect(result.every((m) => m.dimensionScore === null)).toBe(true);
  });

  it("保留模型的原始属性", () => {
    const result = rankByDimension(sampleModels, "coding");
    const gpt4 = result.find((m) => m.name === "GPT-4")!;
    expect(gpt4.vendor).toBe("OpenAI");
    expect(gpt4.openSource).toBe(false);
    expect(gpt4.scores).toEqual({ coding: 90, reasoning: 95, math: 88 });
  });
});

// ── rankByComposite 测试 ──

describe("rankByComposite", () => {
  it("按加权平均综合分降序排列", () => {
    const result = rankByComposite(sampleModels, sampleDimensions);

    // GPT-4: (90*2 + 95*3 + 88*1) / (2+3+1) = (180+285+88)/6 = 553/6 ≈ 92.17
    // Gemini Pro: (85*2 + 88*3 + 90*1) / 6 = (170+264+90)/6 = 524/6 ≈ 87.33
    // Claude 3 Opus: (88*2 + 92*3) / (2+3) = (176+276)/5 = 452/5 = 90.4 (math 为 null，不参与计算)
    // Llama 3: (80*2 + 82*3 + 75*1) / 6 = (160+246+75)/6 = 481/6 ≈ 80.17
    // Mistral 7B: 全部为 null -> null

    expect(result[0].name).toBe("GPT-4");
    expect(result[0].rank).toBe(1);

    expect(result[1].name).toBe("Claude 3 Opus");
    expect(result[1].rank).toBe(2);

    expect(result[2].name).toBe("Gemini Pro");
    expect(result[2].rank).toBe(3);

    expect(result[3].name).toBe("Llama 3");
    expect(result[3].rank).toBe(4);
  });

  it("综合分计算正确（加权平均）", () => {
    const result = rankByComposite(sampleModels, sampleDimensions);

    const gpt4 = result.find((m) => m.name === "GPT-4")!;
    const expected = (90 * 2 + 95 * 3 + 88 * 1) / (2 + 3 + 1);
    expect(gpt4.dimensionScore).toBeCloseTo(expected, 10);
  });

  it("缺失部分维度评分时仅用有效维度计算加权平均", () => {
    const result = rankByComposite(sampleModels, sampleDimensions);

    // Claude 3 Opus: math 为 null，只用 coding 和 reasoning
    const claude = result.find((m) => m.name === "Claude 3 Opus")!;
    const expected = (88 * 2 + 92 * 3) / (2 + 3);
    expect(claude.dimensionScore).toBeCloseTo(expected, 10);
  });

  it("所有维度评分为 null 的模型排在末尾且 dimensionScore 为 null", () => {
    const result = rankByComposite(sampleModels, sampleDimensions);

    const mistral = result.find((m) => m.name === "Mistral 7B")!;
    expect(mistral.dimensionScore).toBeNull();
    expect(mistral.rank).toBe(5);
  });

  it("不同权重影响排序结果", () => {
    const models: Model[] = [
      {
        id: "a",
        name: "Model A",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        accessUrl: null,
        scores: { dim1: 100, dim2: 50 },
      },
      {
        id: "b",
        name: "Model B",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        accessUrl: null,
        scores: { dim1: 50, dim2: 100 },
      },
    ];

    // dim2 权重更高时，Model B 应排第一
    const dims: Dimension[] = [
      { id: "d1", name: "dim1", displayName: "Dim 1", weight: 1 },
      { id: "d2", name: "dim2", displayName: "Dim 2", weight: 3 },
    ];

    const result = rankByComposite(models, dims);
    expect(result[0].name).toBe("Model B");
    expect(result[1].name).toBe("Model A");

    // Model B: (50*1 + 100*3) / 4 = 350/4 = 87.5
    // Model A: (100*1 + 50*3) / 4 = 250/4 = 62.5
    expect(result[0].dimensionScore).toBeCloseTo(87.5, 10);
    expect(result[1].dimensionScore).toBeCloseTo(62.5, 10);
  });

  it("空模型列表返回空数组", () => {
    const result = rankByComposite([], sampleDimensions);
    expect(result).toEqual([]);
  });

  it("空维度列表时所有模型 dimensionScore 为 null", () => {
    const result = rankByComposite(sampleModels, []);
    expect(result.every((m) => m.dimensionScore === null)).toBe(true);
  });

  it("保留模型的原始属性", () => {
    const result = rankByComposite(sampleModels, sampleDimensions);
    const llama = result.find((m) => m.name === "Llama 3")!;
    expect(llama.vendor).toBe("Meta");
    expect(llama.openSource).toBe(true);
    expect(llama.scores).toEqual({ coding: 80, reasoning: 82, math: 75 });
  });
});
