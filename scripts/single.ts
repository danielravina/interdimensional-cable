import { prisma } from "../lib/db";
import { fetchComments, fetchSubredditPosts } from "../lib/reddit";

const sub = process.argv[2];
if (!sub) { console.error("Usage: npx tsx scripts/single.ts <subreddit>"); process.exit(1); }

async function main() {
  const posts = await fetchSubredditPosts(sub, 10000);
  let added = 0;
  let skipped = 0;
  let commentAdded = 0;
  let commentSkipped = 0;
  for (const post of posts) {
    const existing = await prisma.video.findUnique({ where: { redditId: post.id } });
    if (existing) {
      skipped++;
      const comments = await fetchComments(post.subreddit, post.id);
      for (const c of comments) {
        const existingComment = await prisma.comment.findUnique({ where: { redditId: c.id } });
        if (existingComment) { commentSkipped++; continue; }
        await prisma.comment.create({
          data: {
            redditId: c.id, body: c.body, author: c.author,
            score: c.score, createdAt: c.createdAt, videoId: existing.id,
          },
        });
        commentAdded++;
      }
      continue;
    }
    if (!post.videoUrl) continue;
    const created = await prisma.video.create({
      data: {
        redditId: post.id, title: post.title, subreddit: post.subreddit,
        videoUrl: post.videoUrl, hlsUrl: post.hlsUrl, thumbnail: post.thumbnail,
        duration: post.duration, width: post.width, height: post.height,
        author: post.author, permalink: post.permalink, score: post.score,
        isGif: post.isGif, createdAt: post.createdAt,
      },
    });
    added++;
    const comments = await fetchComments(post.subreddit, post.id);
    for (const c of comments) {
      const existingComment = await prisma.comment.findUnique({
        where: { redditId: c.id },
      });
      if (existingComment) { commentSkipped++; continue; }
      await prisma.comment.create({
        data: {
          redditId: c.id, body: c.body, author: c.author,
          score: c.score, createdAt: c.createdAt, videoId: created.id,
        },
      });
      commentAdded++;
    }
  }
  const count = await prisma.video.count({ where: { subreddit: sub } });
  console.log(`r/${sub}: +${added} videos, -${skipped} existing, comments: +${commentAdded} skipped ${commentSkipped}, total ${count}`);
}

main().then(() => process.exit(0)).catch(console.error);
