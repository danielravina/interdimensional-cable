import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  const outPath = join(process.cwd(), "public", "videos.json");
  writeFileSync(outPath, JSON.stringify(videos, null, 2));
  console.log(`Exported ${videos.length} videos to ${outPath}`);

  await prisma.$disconnect();
}

main();
