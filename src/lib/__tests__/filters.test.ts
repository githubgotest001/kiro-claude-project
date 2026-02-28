import { filterModels, parseParamSize } from "@/lib/filters";
import type { Model, FilterState } from "@/types";

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
    scores: { coding: 90, reasoning: 95 },
  },
  {
    id: "2",
    name: "Llama 3",
    vendor: "Meta",
    releaseDate: "2024-04-18",
    paramSize: "70B",
    openSource: true,
    accessUrl: null,
    scores: { coding: 80, reasoning: 82 },
  },
  {
    id: "3",
    name: "Claude 3 Opus",
    vendor: "Anthropic",
    releaseDate: "2024-03-04",
    paramSize: null,
    openSource: false,
    accessUrl: null,
    scores: { coding: 88, reasoning: 92 },
  },
  {
    id: "4",
    name: "Gemini Pro",
    vendor: "Google",
    releaseDate: "2023-12-06",
    paramSize: "175B",
    openSource: false,
    accessUrl: null,
    scores: { coding: 85, reasoning: 88 },
  },
  {
    id: "5",
    name: "Mistral 7B",
    vendor: "Mistral",
    releaseDate: "2023-09-27",
    paramSize: "7B",
    openSource: true,
    accessUrl: null,
    scores: { coding: 65, reasoning: 70 },
  },
];

const emptyFilter: FilterState = {
  vendor: null,
  openSource: null,
  minParams: null,
  maxParams: null,
  search: "",
};

// ── parseParamSize 测试 ──

describe("parseParamSize", () => {
  it("解析 B 后缀", () => {
    expect(parseParamSize("175B")).toBe(175);
    expect(parseParamSize("7B")).toBe(7);
    expect(parseParamSize("70B")).toBe(70);
  });

  it("解析 T 后缀（转换为十亿）", () => {
    expect(parseParamSize("1.5T")).toBe(1500);
    expect(parseParamSize("1T")).toBe(1000);
  });

  it("解析 M 后缀（转换为十亿）", () => {
    expect(parseParamSize("500M")).toBe(0.5);
  });

  it("解析小数", () => {
    expect(parseParamSize("1.5B")).toBe(1.5);
    expect(parseParamSize("0.5T")).toBe(500);
  });

  it("null 或空字符串返回 null", () => {
    expect(parseParamSize(null)).toBeNull();
    expect(parseParamSize("")).toBeNull();
    expect(parseParamSize("  ")).toBeNull();
  });

  it("无法识别的格式返回 null", () => {
    expect(parseParamSize("abc")).toBeNull();
    expect(parseParamSize("B175")).toBeNull();
  });

  it("忽略前后空格", () => {
    expect(parseParamSize(" 70B ")).toBe(70);
  });

  it("大小写不敏感", () => {
    expect(parseParamSize("7b")).toBe(7);
    expect(parseParamSize("1.5t")).toBe(1500);
  });
});

// ── filterModels 测试 ──

describe("filterModels", () => {
  describe("空筛选条件", () => {
    it("所有筛选条件为空时返回全部模型", () => {
      const result = filterModels(sampleModels, emptyFilter);
      expect(result).toHaveLength(sampleModels.length);
    });

    it("空模型列表返回空数组", () => {
      const result = filterModels([], emptyFilter);
      expect(result).toEqual([]);
    });
  });

  describe("按开发商筛选", () => {
    it("精确匹配开发商（大小写不敏感）", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        vendor: "openai",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("GPT-4");
    });

    it("大小写混合匹配", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        vendor: "META",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Llama 3");
    });

    it("不存在的开发商返回空", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        vendor: "Unknown",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("按开源状态筛选", () => {
    it("筛选开源模型", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        openSource: true,
      });
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.openSource)).toBe(true);
    });

    it("筛选非开源模型", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        openSource: false,
      });
      expect(result).toHaveLength(3);
      expect(result.every((m) => !m.openSource)).toBe(true);
    });
  });

  describe("按参数规模范围筛选", () => {
    it("设置最小参数规模", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        minParams: 100,
      });
      // 175B 和 1.5T(=1500B) 满足 >= 100
      expect(result).toHaveLength(2);
    });

    it("设置最大参数规模", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        maxParams: 70,
      });
      // 7B 和 70B 满足 <= 70
      expect(result).toHaveLength(2);
    });

    it("设置范围", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        minParams: 10,
        maxParams: 200,
      });
      // 70B 和 175B 满足 10 <= x <= 200
      expect(result).toHaveLength(2);
    });

    it("paramSize 为 null 的模型被排除", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        minParams: 0,
      });
      // Claude 3 Opus (paramSize: null) 被排除
      expect(result.find((m) => m.name === "Claude 3 Opus")).toBeUndefined();
    });
  });

  describe("按搜索关键词筛选", () => {
    it("匹配模型名称子串（大小写不敏感）", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        search: "gpt",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("GPT-4");
    });

    it("部分匹配", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        search: "llama",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Llama 3");
    });

    it("空搜索字符串不过滤", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        search: "",
      });
      expect(result).toHaveLength(sampleModels.length);
    });

    it("无匹配结果", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        search: "nonexistent",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("多条件 AND 组合", () => {
    it("开发商 + 开源状态", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        vendor: "Meta",
        openSource: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Llama 3");
    });

    it("开源 + 参数范围", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        openSource: true,
        maxParams: 10,
      });
      // 只有 Mistral 7B 是开源且 <= 10B
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Mistral 7B");
    });

    it("所有条件组合", () => {
      const result = filterModels(sampleModels, {
        vendor: "Meta",
        openSource: true,
        minParams: 50,
        maxParams: 100,
        search: "llama",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Llama 3");
    });

    it("矛盾条件返回空", () => {
      const result = filterModels(sampleModels, {
        ...emptyFilter,
        vendor: "OpenAI",
        openSource: true, // OpenAI 的 GPT-4 不是开源的
      });
      expect(result).toHaveLength(0);
    });
  });
});
