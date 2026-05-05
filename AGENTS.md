# AGENTS.md

## Project

Telegram Mini App for managing **sewing/embroidery thread inventory** (Marathon Rayon brand). "Thread" = a spool of thread, NOT an OS thread.

## Stack

- **Framework**: Next.js 16 (App Router, `src/` dir, Turbopack)
- **UI**: shadcn/ui (base-nova style) + Tailwind CSS v4
- **ORM**: Prisma 7 (new `prisma-client` provider, generated to `src/generated/prisma/client`)
- **DB**: Supabase PostgreSQL (connection details in `.env`)
- **Bot**: grammY (minimal — `/start` → WebApp button)
- **Telegram SDK**: @twa-dev/sdk (client-side WebApp)

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema to DB (use direct connection URL)
npx prisma migrate dev --name <name>  # Create & apply migration
npm run db:seed      # Seed Marathon Rayon CSV data into DB
npm run bot          # Start Telegram bot (separate process)
```

## Database Setup

Database must be reachable for migrations/seeding. Two connection modes in `.env`:
- **Direct** (`db.*.supabase.co:5432`) — for Prisma migrations
- **Pooler** (`aws-0-eu-central-1.pooler.supabase.com:6543`) — for app runtime (PgBouncer)

Prisma 7 uses `@prisma/adapter-pg` + `pg.Pool` for connection (see `src/lib/prisma.ts`). The `PrismaClient` is instantiated with an adapter, not via `@prisma/client` directly.

## Architecture

```
src/
  app/
    page.tsx                  # Catalog — thread grid with search
    thread/[id]/page.tsx      # Thread detail — color, +/- spool count
    todo/page.tsx             # Shopping list (Todo CRUD)
    api/
      catalog/route.ts        # GET catalogs with threads
      threads/[id]/route.ts   # GET single thread with items
      thread-items/route.ts   # POST add, DELETE remove spool
      todos/route.ts           # GET, POST, PATCH, DELETE
  components/
    thread-card.tsx           # Color square in catalog grid
    thread-detail.tsx          # Spool counters (+1/−1 small/big) — client component
    todo-list.tsx              # Todo CRUD form — client component
  lib/
    prisma.ts                 # PrismaClient singleton with PgAdapter
    telegram.ts                # init_data validation for API auth
    utils.ts                  # shadcn cn() utility
  bot/
    index.ts                  # grammY bot — /start → WebApp button
    config.ts                 # BOT_TOKEN
prisma/
  schema.prisma               # Catalog, Thread, ThreadItem, Todo models
  seed.ts                      # Seeds CSV → PostgreSQL
data/
  marathonVol3.csv             # Marathon Rayon color data (~300+ entries)
legacy/                        # Old Python/aiogram code (deprecated)
```

## Key Patterns

- All DB-facing pages use `export const dynamic = "force-dynamic"` (no static prerender — requires live DB)
- Client components (`"use client"`) only where needed: counters, forms, interactive UI
- Prisma 7 import: `import { PrismaClient } from "@/generated/prisma/client"` (NOT `@prisma/client`)
- API routes validate Telegram `initData` via `src/lib/telegram.ts` (not currently enforced — add `src/proxy.ts` when ready)
- **Proxy**: Next.js 16 uses `src/proxy.ts` (not `middleware.ts`) for request interception. The `proxy` file convention replaces the deprecated `middleware` convention.
- CSV color data is seeded to DB via `prisma/seed.ts`; app reads colors from `Thread.name` / `Thread.color` columns

## Supabase Connection Notes

If direct connection (`db.*.supabase.co:5432`) is blocked by firewall:
- The pooler (`aws-0-eu-central-1.pooler.supabase.com:6543`) may still work
- For Prisma migrations, you may need to run them from a cloud environment (Vercel, Supabase SQL editor, etc.)
- Prisma 7's `db push` and `migrate` require the direct connection URL