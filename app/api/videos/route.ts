import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-static";

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos);
}
