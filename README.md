# ZMind

A self-hosted, AI-powered web clipping and bookmarking app with a cyberpunk vaporwave aesthetic.

Save links, notes, and full-page archives. Chat with your collection using Claude. Clip pages instantly with the Chrome extension.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![Claude](https://img.shields.io/badge/Claude-AI_Chat-orange)


<img width="2046" height="970" alt="Screenshot 2026-02-26 at 3 47 59 AM" src="https://github.com/user-attachments/assets/ab94ef85-d684-4756-a3db-226c221edf0b" />

## Features

- **Masonry dashboard** — clips displayed as typed cards (articles, videos, images, notes, music, tools, etc.)
- **One-click clipping** — Chrome extension captures any page with auto-generated tags
- **Vault** — opt-in full-page HTML archival to Supabase Storage
- **AI Chat** — ask Claude about your saved clips with full collection context
- **Auto-tagging** — Claude analyzes clipped pages and suggests relevant tags
- **Full-text search** — Postgres tsvector-powered search across all clips
- **Favorites** — bookmark your best clips for quick access
- **Cyberpunk UI** — dark theme with neon pink/cyan accents and a rotating wireframe globe background

## Tech Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Postgres + Storage)
- **Claude API** (Anthropic SDK) for chat and auto-tagging
- **Three.js** for the animated background
- **Chrome Extension** (Manifest V3)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/zmind.git
cd zmind
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in the Supabase SQL editor:

```bash
# Copy the contents of this file into the Supabase SQL editor:
cat supabase/migrations/001_initial_schema.sql
```

3. Add the `favorited` column (run in the SQL editor):

```sql
ALTER TABLE clips ADD COLUMN favorited BOOLEAN NOT NULL DEFAULT false;
```

4. Create a storage bucket called `clip-archives` (Settings > Storage > New bucket)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your values:
- `ZMIND_API_KEY` / `NEXT_PUBLIC_ZMIND_API_KEY` — any strong random string (must match)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings > API > Service Role Key
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Chrome Extension

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. Click the ZMind icon on any page to clip it
5. Configure your API URL and key in the extension settings (gear icon)

## Importing from MyMind

If you're migrating from MyMind, export your data and run:

```bash
source .env.local
node scripts/import-mymind.mjs /path/to/mymind/cards.csv
```

## Deployment

### Vercel

```bash
npm i -g vercel
vercel env add ZMIND_API_KEY
vercel env add NEXT_PUBLIC_ZMIND_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel deploy --prod
```

The `vercel.json` is already configured with appropriate function timeouts.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes (clips, chat, tags, vault)
    chat/                 # AI chat page
    favorites/            # Favorites page
    vault/                # Full-page archive vault
  components/
    background/           # Animated cyberpunk globe
    cards/                # Typed clip cards (article, video, note, etc.)
    chat/                 # Chat UI components
    dashboard/            # Dashboard components (masonry grid, modals)
    layout/               # App shell, sidebar, top bar
  hooks/                  # React hooks (useClips, useChat, useSearch)
  lib/                    # Shared utilities, types, config
extension/                # Chrome extension (Manifest V3)
supabase/                 # Database migrations
scripts/                  # Import scripts
```

## License

MIT
