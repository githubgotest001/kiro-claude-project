import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 解析分页参数
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const keyword = searchParams.get("keyword");

    // 校验 page 参数：必须为正整数
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageParam !== null && (isNaN(page) || page < 1 || !Number.isInteger(Number(pageParam)))) {
      return NextResponse.json(
        { error: "参数错误", details: ["page 必须为正整数"] },
        { status: 400 }
      );
    }

    // 校验 pageSize 参数：范围 1-100
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;
    if (pageSizeParam !== null && (isNaN(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isInteger(Number(pageSizeParam)))) {
      return NextResponse.json(
        { error: "参数错误", details: ["pageSize 必须为 1-100 之间的整数"] },
        { status: 400 }
      );
    }

    // 构建查询条件
    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { summary: { contains: keyword } },
          ],
        }
      : {};

    // 查询总数和分页数据
    const [total, items] = await Promise.all([
      prisma.newsItem.count({ where }),
      prisma.newsItem.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // 转换响应格式：tags 从 JSON 字符串解析为数组
    const news = items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt.toISOString(),
      tags: parseTags(item.tags),
    }));

    return NextResponse.json({
      news,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

/** 安全解析 tags JSON 字符串为数组 */
function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
