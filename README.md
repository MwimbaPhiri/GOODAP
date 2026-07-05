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

## 🗄️ Switching to PostgreSQL

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Point `DATABASE_URL` at your Postgres/Supabase instance.
3. `npm run db:push` (or `prisma migrate deploy`).

The schema avoids native enums/array columns, so the same models run on both engines.

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
