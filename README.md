# MediaPulse AI

**AI-powered PR & Media Monitoring platform.** Monitor how your organization is
mentioned across news and public content, analyze sentiment, detect reputation
risks, generate reports, and get AI-powered communication insights.

Built with an enterprise-grade, modular architecture that is easy to extend to
social media, TV, radio and competitor benchmarking.

---

## ✨ Features

- **Executive dashboard** — total/today/positive/neutral/negative mentions, sentiment trend, coverage timeline, top sources, keyword performance, trending topics, competitor share-of-voice, recent alerts, recent articles and Quick AI insights. All charts interactive (Recharts).
- **Modular media-collection engine** — pluggable `Collector` registry with RSS, Google News and website-scraper collectors, automatic de-duplication, keyword & competitor attribution.
- **Automated article analysis** — sentiment + confidence, topics, named entities, risk level, category, reading time, AI summary, suggested PR response and suggested social post.
- **AI assistant (RAG)** — ask questions about your coverage; answers are grounded in your collected media with citations. Works offline with a deterministic engine and upgrades automatically when an OpenAI key is present.
- **Alerts** — negative sentiment, keyword spikes, competitor activity, specific publications and breaking news across browser / email / digest channels.
- **Reports** — one-click executive/coverage/sentiment/competitor reports with charts, tables, AI commentary and recommendations, exportable to **PDF**.
- **Competitor intelligence** — share of voice, sentiment comparison and coverage volume.
- **Advanced search** — filter by keyword, date, source, sentiment, publication, author, country, language, topic and risk level.
- **Auth & RBAC** — sign up, login, forgot/reset password, organization invitations and 5 roles (Administrator, Organization Manager, Communications Officer, Analyst, Viewer).
- **Polished SaaS UI** — responsive sidebar + top bar, global ⌘K command palette, notifications, dark/light theme, loading skeletons, empty/error states and smooth animations.
- **Security** — JWT (httpOnly cookies), bcrypt hashing, role-based access control, Zod input validation, audit logs and security headers.

## 🧱 Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query, Framer Motion, Recharts |
| Backend   | Next.js Route Handlers (serverless-friendly), Prisma ORM |
| Database  | PostgreSQL in production · SQLite for zero-config local demo |
| Auth      | JWT + bcrypt (Supabase Auth-ready) |
| AI        | OpenAI-compatible API with deterministic offline fallback + RAG |
| Cache     | In-memory (Redis-ready) |
| Realtime  | Socket.IO (org rooms) |
| Deploy    | Vercel (+ Cron), Docker |

### Why Next.js Route Handlers over a separate FastAPI service?

A single deployable, Vercel-native codebase minimizes operational overhead and
latency, shares types end-to-end, and still scales horizontally via serverless
functions. The business logic lives in framework-agnostic modules under
`src/lib/*` (monitoring engine, analysis, AI, reports), so it could be lifted
into a standalone service later without rewrites.

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # defaults work out of the box (SQLite)

# 3. Set up the database + seed demo data
npm run db:push
npm run db:seed

# 4. Run the dev server (Next.js + Socket.IO)
npm run dev
```

Open http://localhost:3000.

**Demo accounts** (password `Password123!` for all):

| Role | Email |
|------|-------|
| Administrator | admin@mediapulse.ai |
| Organization Manager | manager@mediapulse.ai |
| Communications Officer | comms@mediapulse.ai |
| Analyst | analyst@mediapulse.ai |
| Viewer | viewer@mediapulse.ai |

## 🔑 Environment variables

See [`.env.example`](./.env.example). Key ones:

- `DATABASE_URL` — SQLite file (default) or PostgreSQL connection string.
- `JWT_SECRET` — signing secret for session tokens (generate a strong value in prod).
- `OPENAI_API_KEY` — optional; enables LLM-enhanced analysis, assistant and reports. Without it everything still works via the deterministic engine.
- `CRON_SECRET` — bearer token protecting the scheduled monitoring endpoint.
- `REDIS_URL` — optional; swap the in-memory cache for Redis.

## 🗄️ Databases (SQLite ⇄ PostgreSQL)

The Prisma datasource provider is chosen **automatically** from `DATABASE_URL`
by `scripts/prepare-db.mjs` (runs on `postinstall` and `vercel-build`):

- No/`file:` URL → **SQLite** (local zero-config demo)
- `postgres://…` URL → **PostgreSQL** (production)

The schema avoids native enums/array columns, so the same models run on both engines.

## ▲ Deploy to Vercel

The repo is Vercel-ready. Vercel does not run the custom `server.ts` (Socket.IO);
the app runs as serverless functions and the UI falls back to polling for
notifications — everything else works unchanged. **A PostgreSQL database is
required** (Vercel's filesystem is read-only, so SQLite can't be used in prod).

1. **Create a Postgres database** — e.g. [Vercel Postgres](https://vercel.com/storage/postgres), [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy its connection string.
2. **Import the repo** into Vercel (New Project → import this GitHub repo). Framework is auto-detected as Next.js.
3. **Add environment variables** in Project → Settings → Environment Variables:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | your `postgres://…` connection string (**required**) |
   | `JWT_SECRET` | a strong random string (`openssl rand -base64 48`) |
   | `CRON_SECRET` | a random string (protects the cron endpoint) |
   | `NEXT_PUBLIC_APP_URL` | your deployment URL, e.g. `https://your-app.vercel.app` |
   | `OPENAI_API_KEY` | *(optional)* enables LLM-enhanced AI features |

4. **Deploy.** The `vercel-build` script runs `prisma db push` to create the
   schema, then `next build`. `vercel.json` registers an hourly monitoring cron
   (Vercel automatically sends `Authorization: Bearer $CRON_SECRET`).
5. **(Optional) Seed demo data** — from your machine with the production
   `DATABASE_URL` exported: `npm run db:seed`.

CLI alternative:

```bash
npm i -g vercel
vercel link
vercel env add DATABASE_URL           # + JWT_SECRET, CRON_SECRET, …
vercel --prod
```

## ⏰ Scheduled monitoring

`GET/POST /api/monitoring/cron` runs collection for every organization. It is
protected by `CRON_SECRET` (sent as `Authorization: Bearer <secret>`).
[`vercel.json`](./vercel.json) registers an hourly Vercel Cron. You can also run
collection on demand from the dashboard ("Run collection").

## 📁 Project structure

```
prisma/                  Prisma schema + seed
src/
  app/
    (auth)/              Login, register, forgot/reset password
    (dashboard)/         App shell + all authenticated pages
    api/                 Route handlers (auth, articles, keywords, alerts, …)
    page.tsx             Marketing landing page
  components/
    layout/              Sidebar, topbar, command palette, org switcher, …
    dashboard/ articles/ keywords/ …   Feature components
    ui/                  shadcn/ui primitives
  lib/
    auth/                JWT, password, session, cookies, RBAC
    monitoring/          Collectors, dedupe, engine
    analysis/            Sentiment / entities / topics / risk / summaries
    ai/                  OpenAI client + RAG
    reports.ts stats.ts insights.ts pdf.ts cache.ts constants.ts
```

## 🐳 Docker

```bash
docker build -t mediapulse-ai .
docker run -p 3000:3000 --env-file .env mediapulse-ai
```

## 🧭 Extending

- **New data source** — implement the `Collector` interface in `src/lib/monitoring/collectors/` and register it. TV/radio/social collectors slot in the same way.
- **Swap auth for Supabase** — replace `src/lib/auth/*` with Supabase client calls; the session interface is small and centralized.
- **Vector RAG** — replace the keyword retriever in `src/lib/ai/rag.ts` with pgvector/embeddings without touching the assistant UI.

---

Built as a production-ready foundation — scalable, typed end-to-end, and easy to extend.
