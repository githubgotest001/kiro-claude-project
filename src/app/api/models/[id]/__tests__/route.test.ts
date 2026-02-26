import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    aIModel: {
      findUnique: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.aIModel.findUnique as jest.Mock;

function makeRequest(): NextRequest {
  return new NextRequest(new URL("http://localhost/api/models/m1"));
}

const now = new Date("2024-01-15T00:00:00Z");
const earlier = new Date("2023-12-01T00:00:00Z");

const dbModel = {
  id: "m1",
  name: "GPT-4",
  vendor: "OpenAI",
  releaseDate: now,
  paramSize: "1.5T",
  openSource: false,
  description: "A powerful language model by OpenAI",
  scores: [
    { id: "s1", value: 92, source: "lmsys", scrapedAt: now, dimension: { name: "coding", displayName: "编码能力" } },
    { id: "s2", value: 88, source: "lmsys", scrapedAt: earlier, dimension: { name: "coding", displayName: "编码能力" } },
    { id: "s3", value: 90, source: "openllm", scrapedAt: now, dimension: { name: "reasoning", displayName: "推理能力" } },
  ],
};

describe("GET /api/models/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns model detail with latest scores and full history", async () => {
    mockFindUnique.mockResolvedValue(dbModel);

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "m1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.model.id).toBe("m1");
    expect(body.model.name).toBe("GPT-4");
    expect(body.model.description).toBe("A powerful language model by OpenAI");
    // Latest scores
    expect(body.model.scores.coding).toBe(92);
    expect(body.model.scores.reasoning).toBe(90);
  });

  it("includes full score history", async () => {
    mockFindUnique.mockResolvedValue(dbModel);

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "m1" }) });
    const body = await res.json();

    expect(body.model.scoreHistory).toHaveLength(3);
    expect(body.model.scoreHistory[0]).toEqual({
      dimensionName: "coding",
      value: 92,
      source: "lmsys",
      scrapedAt: now.toISOString(),
    });
  });

  it("returns 404 when model not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "nonexistent" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("模型未找到");
  });

  it("handles model with no scores", async () => {
    mockFindUnique.mockResolvedValue({
      ...dbModel,
      scores: [],
      description: null,
    });

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "m1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.model.scores).toEqual({});
    expect(body.model.scoreHistory).toEqual([]);
    expect(body.model.description).toBeNull();
  });

  it("handles null releaseDate", async () => {
    mockFindUnique.mockResolvedValue({
      ...dbModel,
      releaseDate: null,
    });

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "m1" }) });
    const body = await res.json();

    expect(body.model.releaseDate).toBeNull();
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "m1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("服务器错误");
  });
});
