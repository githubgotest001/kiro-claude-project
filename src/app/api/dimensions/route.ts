import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Dimension } from "@/types";

export async function GET() {
  try {
    const dbDimensions = await prisma.dimension.findMany();

    const dimensions: Dimension[] = dbDimensions.map((d: typeof dbDimensions[number]) => ({
      id: d.id,
      name: d.name,
      displayName: d.displayName,
      weight: d.weight,
    }));

    return NextResponse.json({ dimensions });
  } catch (error) {
    console.error("GET /api/dimensions error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
