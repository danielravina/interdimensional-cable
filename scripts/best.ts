import { prisma } from "../lib/db";
import { fetchComments, fetchSubredditTopPosts, SUBREDDITS } from "../lib/reddit";

async function scrape() {
  console.log("Resetting all isBest flags...");
  const resetResult = await prisma.video.updateMany({
    data: { isBest: false },
  });
  console.log(`  Cleared isBest on ${resetResult.count} videos\n`);

  let totalAdded = 0;
  let totalUpdated = 0;

  for (const sub of SUBREDDITS) {
    console.log(`Fetching top 10 of r/${sub} for the past year...`);

    const posts = await fetchSubredditTopPosts(sub, 10);
    if (posts.length === 0) {
      console.log(`  No video posts found\n`);
      continue;
    }

    let added = 0;
    let updated = 0;

    for (const post of posts) {
      const existing = await prisma.video.findUnique({
        where: { redditId: post.id },
      });

      let videoId: string;

      if (existing) {
        videoId = existing.id;
        await prisma.video.update({
          where: { redditId: post.id },
          data: {
            isBest: true,
            hlsUrl: post.hlsUrl ?? existing.hlsUrl,
            width: post.width ?? existing.width,
            height: post.height ?? existing.height,
            author: post.author,
            permalink: post.permalink,
            score: post.score,
            isGif: post.isGif,
          },
        });
        updated++;
      } else {
        if (!post.videoUrl) continue;

        const created = await prisma.video.create({
          data: {
            redditId: post.id,
            title: post.title,
            subreddit: post.subreddit,
            videoUrl: post.videoUrl,
            hlsUrl: post.hlsUrl,
            thumbnail: post.thumbnail,
            duration: post.duration,
            width: post.width,
            height: post.height,
            author: post.author,
            permalink: post.permalink,
            score: post.score,
            isGif: post.isGif,
            isBest: true,
            createdAt: post.createdAt,
          },
        });
        videoId = created.id;
        added++;
      }

      const comments = await fetchComments(post.subreddit, post.id);
      let commentAdded = 0;
      for (const c of comments) {
        const existingComment = await prisma.comment.findUnique({
          where: { redditId: c.id },
        });
        if (existingComment) continue;
        await prisma.comment.create({
          data: {
            redditId: c.id,
            body: c.body,
            author: c.author,
            score: c.score,
            createdAt: c.createdAt,
            videoId,
          },
        });
        commentAdded++;
      }
      if (commentAdded > 0) {
        console.log(`    +${commentAdded} comments for "${post.title.slice(0, 40)}"`);
      }
    }

    console.log(`  ${posts.length} posts, added ${added}, updated ${updated}\n`);
    totalAdded += added;
    totalUpdated += updated;
  }

  const bestCount = await prisma.video.count({ where: { isBest: true } });
  const totalCount = await prisma.video.count();
  console.log(`Done! ${bestCount} videos flagged isBest (${totalCount} total in database)`);
  console.log(`  Added: ${totalAdded}, Updated: ${totalUpdated}`);
}

scrape()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Best scrape failed:", err);
    process.exit(1);
  });
