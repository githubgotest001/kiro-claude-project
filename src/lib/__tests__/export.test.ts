import { exportToCSV, exportToJSON, parseCSV, parseExportJSON } from "@/lib/export";
import type { Model, ExportMeta, FilterState } from "@/types";

// ── 测试数据 ──

const defaultFilters: FilterState = {
  vendor: null,
  openSource: null,
  minParams: null,
  maxParams: null,
  search: "",
};

const sampleMeta: ExportMeta = {
  exportedAt: "2024-01-15T10:30:00Z",
  source: "LMSYS Chatbot Arena",
  filters: defaultFilters,
  dataLastUpdated: "2024-01-14T08:00:00Z",
};

const dimensions = ["coding", "reasoning", "math"];

const sampleModels: Model[] = [
  {
    id: "1",
    name: "GPT-4",
    vendor: "OpenAI",
    releaseDate: "2023-03-14",
    paramSize: "1.5T",
    openSource: false,
    scores: { coding: 90, reasoning: 95, math: 88 },
  },
  {
    id: "2",
    name: "Llama 3",
    vendor: "Meta",
    releaseDate: "2024-04-18",
    paramSize: "70B",
    openSource: true,
    scores: { coding: 80, reasoning: 82, math: 75 },
  },
];

// ── CSV 导出与解析 ──

describe("exportToCSV", () => {
  it("生成包含元信息注释行的 CSV", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toContain("source=LMSYS Chatbot Arena");
    expect(firstLine).toContain("exportedAt=2024-01-15T10:30:00Z");
    expect(firstLine).toContain("dataLastUpdated=2024-01-14T08:00:00Z");
  });

  it("生成正确的表头行", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const headerLine = csv.split("\n")[1];
    expect(headerLine).toBe("id,name,vendor,releaseDate,paramSize,openSource,coding,reasoning,math");
  });

  it("生成正确的数据行", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const lines = csv.split("\n");
    expect(lines[2]).toBe("1,GPT-4,OpenAI,2023-03-14,1.5T,false,90,95,88");
    expect(lines[3]).toBe("2,Llama 3,Meta,2024-04-18,70B,true,80,82,75");
  });

  it("null 评分导出为空字符串", () => {
    const models: Model[] = [
      {
        id: "3",
        name: "TestModel",
        vendor: "TestVendor",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        scores: { coding: 88, reasoning: null, math: null },
      },
    ];
    const csv = exportToCSV(models, sampleMeta, dimensions);
    const dataLine = csv.split("\n")[2];
    expect(dataLine).toBe("3,TestModel,TestVendor,,,false,88,,");
  });

  it("正确转义包含逗号的字段", () => {
    const models: Model[] = [
      {
        id: "4",
        name: "Model, with comma",
        vendor: "Vendor, Inc.",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        scores: {},
      },
    ];
    const csv = exportToCSV(models, sampleMeta, []);
    const dataLine = csv.split("\n")[2];
    expect(dataLine).toContain('"Model, with comma"');
    expect(dataLine).toContain('"Vendor, Inc."');
  });

  it("正确转义包含双引号的字段", () => {
    const models: Model[] = [
      {
        id: "5",
        name: 'Model "Pro"',
        vendor: "TestVendor",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        scores: {},
      },
    ];
    const csv = exportToCSV(models, sampleMeta, []);
    const dataLine = csv.split("\n")[2];
    expect(dataLine).toContain('"Model ""Pro"""');
  });

  it("空模型列表只输出注释行和表头", () => {
    const csv = exportToCSV([], sampleMeta, dimensions);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0].startsWith("#")).toBe(true);
  });
});

// ── CSV 解析 ──

describe("parseCSV", () => {
  it("解析 CSV 还原模型数据", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const { models } = parseCSV(csv);
    expect(models).toHaveLength(2);
    expect(models[0].name).toBe("GPT-4");
    expect(models[0].scores.coding).toBe(90);
    expect(models[1].name).toBe("Llama 3");
    expect(models[1].openSource).toBe(true);
  });

  it("解析元信息", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const { meta } = parseCSV(csv);
    expect(meta.source).toBe("LMSYS Chatbot Arena");
    expect(meta.exportedAt).toBe("2024-01-15T10:30:00Z");
    expect(meta.dataLastUpdated).toBe("2024-01-14T08:00:00Z");
  });

  it("解析包含转义字段的 CSV", () => {
    const models: Model[] = [
      {
        id: "1",
        name: 'Model, "Special"',
        vendor: "Vendor, Inc.",
        releaseDate: null,
        paramSize: null,
        openSource: true,
        scores: { coding: 85 },
      },
    ];
    const csv = exportToCSV(models, sampleMeta, ["coding"]);
    const { models: parsed } = parseCSV(csv);
    expect(parsed[0].name).toBe('Model, "Special"');
    expect(parsed[0].vendor).toBe("Vendor, Inc.");
  });

  it("空模型列表解析为空数组", () => {
    const csv = exportToCSV([], sampleMeta, dimensions);
    const { models } = parseCSV(csv);
    expect(models).toEqual([]);
  });
});

// ── CSV 往返一致性 ──

describe("CSV roundtrip", () => {
  it("导出后再解析还原原始数据", () => {
    const csv = exportToCSV(sampleModels, sampleMeta, dimensions);
    const { models } = parseCSV(csv);

    expect(models).toHaveLength(sampleModels.length);
    for (let i = 0; i < sampleModels.length; i++) {
      expect(models[i].id).toBe(sampleModels[i].id);
      expect(models[i].name).toBe(sampleModels[i].name);
      expect(models[i].vendor).toBe(sampleModels[i].vendor);
      expect(models[i].releaseDate).toBe(sampleModels[i].releaseDate);
      expect(models[i].paramSize).toBe(sampleModels[i].paramSize);
      expect(models[i].openSource).toBe(sampleModels[i].openSource);
      for (const dim of dimensions) {
        expect(models[i].scores[dim]).toBe(sampleModels[i].scores[dim]);
      }
    }
  });

  it("null 值往返一致", () => {
    const models: Model[] = [
      {
        id: "x",
        name: "NullModel",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        scores: { coding: null, reasoning: 50, math: null },
      },
    ];
    const csv = exportToCSV(models, sampleMeta, dimensions);
    const { models: parsed } = parseCSV(csv);
    expect(parsed[0].releaseDate).toBeNull();
    expect(parsed[0].paramSize).toBeNull();
    expect(parsed[0].scores.coding).toBeNull();
    expect(parsed[0].scores.reasoning).toBe(50);
    expect(parsed[0].scores.math).toBeNull();
  });
});

// ── JSON 导出与解析 ──

describe("exportToJSON", () => {
  it("生成包含 meta 和 models 的 JSON", () => {
    const json = exportToJSON(sampleModels, sampleMeta);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty("meta");
    expect(parsed).toHaveProperty("models");
  });

  it("JSON 格式化为 2 空格缩进", () => {
    const json = exportToJSON(sampleModels, sampleMeta);
    // 2-space indentation means lines start with "  "
    const lines = json.split("\n");
    const indentedLines = lines.filter((l) => l.startsWith("  "));
    expect(indentedLines.length).toBeGreaterThan(0);
  });

  it("保留完整的 meta 信息", () => {
    const json = exportToJSON(sampleModels, sampleMeta);
    const parsed = JSON.parse(json);
    expect(parsed.meta.source).toBe(sampleMeta.source);
    expect(parsed.meta.exportedAt).toBe(sampleMeta.exportedAt);
    expect(parsed.meta.dataLastUpdated).toBe(sampleMeta.dataLastUpdated);
    expect(parsed.meta.filters).toEqual(sampleMeta.filters);
  });

  it("空模型列表生成空数组", () => {
    const json = exportToJSON([], sampleMeta);
    const parsed = JSON.parse(json);
    expect(parsed.models).toEqual([]);
  });
});

describe("parseExportJSON", () => {
  it("解析 JSON 还原模型数据和元信息", () => {
    const json = exportToJSON(sampleModels, sampleMeta);
    const { models, meta } = parseExportJSON(json);
    expect(models).toHaveLength(2);
    expect(models[0].name).toBe("GPT-4");
    expect(meta.source).toBe("LMSYS Chatbot Arena");
  });
});

// ── JSON 往返一致性 ──

describe("JSON roundtrip", () => {
  it("导出后再解析还原原始数据", () => {
    const json = exportToJSON(sampleModels, sampleMeta);
    const { models, meta } = parseExportJSON(json);

    expect(models).toEqual(sampleModels);
    expect(meta).toEqual(sampleMeta);
  });

  it("null 值往返一致", () => {
    const models: Model[] = [
      {
        id: "x",
        name: "NullModel",
        vendor: "V",
        releaseDate: null,
        paramSize: null,
        openSource: false,
        scores: { coding: null, reasoning: 50 },
      },
    ];
    const json = exportToJSON(models, sampleMeta);
    const { models: parsed } = parseExportJSON(json);
    expect(parsed[0].releaseDate).toBeNull();
    expect(parsed[0].paramSize).toBeNull();
    expect(parsed[0].scores.coding).toBeNull();
    expect(parsed[0].scores.reasoning).toBe(50);
  });

  it("特殊字符模型名称往返一致", () => {
    const models: Model[] = [
      {
        id: "s",
        name: 'Model "Pro" v2.0 (beta)',
        vendor: "Vendor & Co.",
        releaseDate: "2024-01-01",
        paramSize: "7B",
        openSource: true,
        scores: { coding: 77 },
      },
    ];
    const json = exportToJSON(models, sampleMeta);
    const { models: parsed } = parseExportJSON(json);
    expect(parsed[0].name).toBe('Model "Pro" v2.0 (beta)');
    expect(parsed[0].vendor).toBe("Vendor & Co.");
  });
});
