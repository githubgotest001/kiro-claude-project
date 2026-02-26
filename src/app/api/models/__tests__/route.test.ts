import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    aIModel: {
      findMany: jest.fn(),
    },
  },
}));

const mockFindMany = prisma.aIModel.findMany as jest.Mock;

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/models");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

const now = new Date("2024-01-15T00:00:00Z");

const dbModels = [
  {
    id: "m1",
    name: "GPT-4",
    vendor: "OpenAI",
    releaseDate: now,
    paramSize: "1.5T",
    openSource: false,
    description: "A large language model",
    scores: [
      { id: "s1", value: 92, scrapedAt: now, dimension: { name: "coding", displayName: "编码能力" } },
      { id: "s2", value: 95, scrapedAt: new Date("2023-12-01"), dimension: { name: "coding", displayName: "编码能力" } },
      { id: "s3", value: 88, scrapedAt: now, dimension: { name: "reasoning", displayName: "推理能力" } },
    ],
  },
  {
    id: "m2",
    name: "Llama 3",
    vendor: "Meta",
    releaseDate: null,
    paramSize: "70B",
    openSource: true,
    description: null,
    scores: [
      { id: "s4", value: 80, scrapedAt: now, dimension: { name: "coding", displayName: "编码能力" } },
      { id: "s5", value: 75, scrapedAt: now, dimension: { name: "reasoning", displayName: "推理能力" } },
    ],
  },
  {
    id: "m3",
    name: "Claude 3",
    vendor: "Anthropic",
    releaseDate: now,
    paramSize: null,
    openSource: false,
    description: null,
    scores: [],
  },
];

describe("GET /api/models", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue(dbModels);
  });

  it("returns all models with default pagination", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.models).toHaveLength(3);
  });

  it("transforms DB records to Model type with latest scores", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    const gpt4 = body.models.find((m: { id: string }) => m.id === "m1");
    expect(gpt4.name).toBe("GPT-4");
    expect(gpt4.vendor).toBe("OpenAI");
    expect(gpt4.openSource).toBe(false);
    expect(gpt4.scores.coding).toBe(92); // latest score (most recent scrapedAt)
    expect(gpt4.scores.reasoning).toBe(88);
  });

  it("handles models with no scores", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    const claude = body.models.find((m: { id: string }) => m.id === "m3");
    expect(claude.scores).toEqual({});
  });

  it("filters by vendor", async () => {
    const res = await GET(makeRequest({ vendor: "Meta" }));
    const body = await res.json();

    expect(body.total).toBe(1);
    expect(body.models[0].name).toBe("Llama 3");
  });

  it("filters by openSource=true", async () => {
    const res = await GET(makeRequest({ openSource: "true" }));
    const body = await res.json();

    expect(body.total).toBe(1);
    expect(body.models[0].name).toBe("Llama 3");
  });

  it("filters by search keyword", async () => {
    const res = await GET(makeRequest({ search: "gpt" }));
    const body = await res.json();

    expect(body.total).toBe(1);
    expect(body.models[0].name).toBe("GPT-4");
  });

  it("sorts by dimension score descending", async () => {
    const res = await GET(makeRequest({ dimension: "coding" }));
    const body = await res.json();

    expect(body.models[0].scores.coding).toBe(92);
    expect(body.models[1].scores.coding).toBe(80);
    // Claude 3 has no coding score, should be last
    expect(body.models[2].id).toBe("m3");
  });

  it("applies pagination", async () => {
    const res = await GET(makeRequest({ page: "1", pageSize: "2" }));
    const body = await res.json();

    expect(body.total).toBe(3);
    expect(body.models).toHaveLength(2);
  });

  it("returns second page", async () => {
    const res = await GET(makeRequest({ page: "2", pageSize: "2" }));
    const body = await res.json();

    expect(body.total).toBe(3);
    expect(body.models).toHaveLength(1);
  });

  it("returns empty page when page exceeds total", async () => {
    const res = await GET(makeRequest({ page: "100", pageSize: "20" }));
    const body = await res.json();

    expect(body.total).toBe(3);
    expect(body.models).toHaveLength(0);
  });

  it("handles combined filters", async () => {
    const res = await GET(makeRequest({ openSource: "false", search: "claude" }));
    const body = await res.json();

    expect(body.total).toBe(1);
    expect(body.models[0].name).toBe("Claude 3");
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB connection failed"));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("服务器错误");
  });
});
