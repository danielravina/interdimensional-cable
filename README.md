<img width="60" height="60" alt="ico" src="https://github.com/user-attachments/assets/8ba36091-a7d7-4018-8dbf-f6eda006ae0b" />



# Interdimensional Cable

A TV simulator that plays random AI-generated videos from Reddit, channel-surfing style. Inspired by *Rick and Morty*.

## How it works

- Scrapes video posts from 15 AI/weird subreddits (`r/aivideo`, `r/weirddalle`, `r/SoraAi`, etc.)
- Each subreddit is a channel — flip through them with the remote or number keys
- Videos play in a retro CRT-style screen with scanlines, flicker, and static noise
- Built-in TV guide shows what's currently playing on each channel

## Stack

- **Next.js** (App Router) — React 19
- **Tailwind CSS v4**
- **Prisma** / SQLite — video metadata storage
- **HLS.js** — video playback
- **Reddit OAuth** — data source

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run scrape` | Scrape latest videos from all channels |
| `npm run scrape:best` | Scrape all-time top posts |
| `npm run export-data` | Export DB to static JSON |
| `npm run build` | Export data + build |
| `npm run deploy` | Build and push to GitHub Pages |
| `npm run lint` | Lint |

## Environment

```
REDDIT_CLIENT_ID=your_app_id
REDDIT_CLIENT_SECRET=your_app_secret
```

## Deploy

`npm run deploy` builds with `GITHUB_PAGES=true` and force-pushes the static export to the `gh-pages` branch.
