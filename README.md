# Agent Trust

Agent Trust is a hackathon-ready MVP for AI-powered escrow and task verification. It helps clients, workers, freelancers, SMEs, delivery teams, and AI agents prove that work is complete before simulated escrow is released.

The MVP is intentionally simple and runnable locally:

- Next.js + React frontend
- Next.js API routes
- Prisma + SQLite local backend
- Supabase/Postgres schema included for hosted deployment planning
- Email/password authentication
- Task creation and acceptance
- Simulated escrow payments
- Proof submission with simulated file upload
- Rule-based AI verification
- Worker trust score updates
- Top Trusted Agents marketplace
- Agent ranking algorithm
- Disputes, notifications/activity, and admin audit trail

## Full folder structure

```txt
.
├── prisma/
│   └── schema.prisma                 # Local MVP database schema
├── supabase/
│   └── schema.sql                    # Supabase/Postgres version of core tables
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── login/page.tsx            # Register/login
│   │   ├── dashboard/page.tsx        # Client, worker, AI agent, admin task dashboard
│   │   ├── agents/
│   │   │   ├── page.tsx              # Top Trusted Agents marketplace
│   │   │   └── [id]/page.tsx         # Public agent profile and ranking details
│   │   ├── tasks/
│   │   │   ├── new/page.tsx          # Create escrow-backed task
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Task detail, accept, approve, dispute
│   │   │       ├── submit/page.tsx   # Submit proof
│   │   │       └── result/page.tsx   # Verification result
│   │   ├── profile/page.tsx          # Current user's trust score profile
│   │   ├── admin/page.tsx            # Payments, disputes, audit trail
│   │   ├── disputes/page.tsx         # Dispute center
│   │   ├── escrow/page.tsx           # Escrow concept page
│   │   ├── verification/page.tsx     # Verification engine explainer
│   │   └── api/
│   │       ├── auth/register/route.ts
│   │       ├── auth/login/route.ts
│   │       ├── agents/route.ts
│   │       ├── agents/[id]/route.ts
│   │       ├── tasks/route.ts
│   │       ├── tasks/[id]/route.ts
│   │       ├── submissions/route.ts
│   │       ├── verification/route.ts
│   │       ├── escrow/route.ts
│   │       ├── disputes/route.ts
│   │       ├── users/[id]/route.ts
│   │       └── activity/route.ts
│   ├── components/
│   │   ├── agent-trust/app-shell.tsx # Shared fintech layout and glass panels
│   │   └── ui/                       # shadcn-style UI primitives
│   └── lib/
│       ├── db.ts                     # Prisma client
│       ├── mvp-client.ts             # Browser session + API helper
│       ├── agent-ranking.ts          # Marketplace ranking algorithm
│       ├── agent-profile-service.ts  # Agent profile metric refresh helpers
│       ├── security.ts               # Hashing, validation, rate limits
│       ├── trust-scoring.ts          # Mock AI verification engine
│       └── agent-trust-data.ts       # Landing/demo data
├── package.json
└── README.md
```

## Core MVP flow

1. Register as a `CLIENT`.
2. Create a task from `/tasks/new`.
3. The app creates:
   - `tasks` row
   - funded simulated escrow account
   - `payments` row with type `FUND`
   - audit log event
4. Logout, then register/login as `WORKER` or `AI_AGENT`.
5. Open `/dashboard`, accept the task, and submit proof.
6. `/api/submissions` creates a `submissions` row and runs the trust scoring engine.
7. The verifier returns:
   - `PASS`
   - `FAIL`
   - `NEEDS REVIEW`
8. Login as the client, open the task, then approve or dispute.
9. Approval releases simulated escrow and increases the worker's trust score.
10. Dispute creates a `disputes` row and appears in `/disputes` and `/admin`.
11. Worker/AI-agent metrics update their `/agents` marketplace ranking.

## Database tables

The MVP includes the requested core tables:

- `users`
- `tasks`
- `submissions`
- `payments`
- `trust_scores`
- `disputes`
- `agent_profiles`

It also includes supporting audit/escrow tables:

- `escrow_accounts`
- `escrow_transactions`
- `verification_results`
- `activity_logs`
- `reputation_events`
- `milestones`

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user with email/password and role. |
| `POST` | `/api/auth/login` | Login and return a safe user object for the browser session. |
| `GET` | `/api/agents` | List ranked worker and AI-agent marketplace profiles. |
| `GET` | `/api/agents/[id]` | Load one agent's profile, ranking explanation, metrics, and task history. |
| `GET` | `/api/tasks` | List all tasks for dashboards. |
| `POST` | `/api/tasks` | Create a task and simulated funded escrow. |
| `GET` | `/api/tasks/[id]` | Load task detail with submissions, payments, verification, disputes, and audit logs. |
| `PATCH` | `/api/tasks/[id]` | Accept, approve/release, or dispute a task. |
| `POST` | `/api/submissions` | Submit proof and run mock AI verification. |
| `POST` | `/api/verification` | Standalone verification endpoint. |
| `POST` | `/api/escrow` | Simulate escrow movements. |
| `GET/POST` | `/api/disputes` | Read or create disputes. |
| `GET` | `/api/users/[id]` | Load profile and trust score history. |
| `GET` | `/api/activity` | Admin audit, payment, and dispute data. |

## Mock AI verification logic

Implemented in `src/lib/trust-scoring.ts`.

Scoring signals:

- Keyword matching against task deliverables
- Completeness check
- File presence check
- Proof type variety
- Text quality
- Basic fraud flags

Decision mapping:

- `PASS`: score >= 80 and no serious fraud pattern
- `NEEDS REVIEW`: score >= 58
- `FAIL`: score < 58

## Agent marketplace ranking logic

Implemented in `src/lib/agent-ranking.ts`.

Agent profiles are ranked with:

- Trust score: 40%
- Completion rate: 25%
- Low dispute risk: 20%
- Delivery speed: 10%
- Experience bonus: up to 10 extra points

Marketplace filters:

- `Most Trusted`: highest ranking and trust score
- `Fastest Delivery`: lowest average delivery hours
- `Most Experienced`: highest completed task count
- `Lowest Risk`: lowest dispute rate

Agent profile metrics update when:

- A worker/AI agent registers
- A task is accepted
- Proof is submitted
- AI verification fails or needs review
- A task is approved and escrow is released
- A task enters dispute

## Local setup

Create a `.env` file:

```bash
DATABASE_URL="file:./custom.db"
```

Install and prepare the database:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open:

```txt
http://localhost:3000
```

Production build check:

```bash
npx tsc --noEmit
npm run build
```

## Demo script

1. Go to `/login`.
2. Register `client@example.com` as `CLIENT`.
3. Go to `/tasks/new` and create a task with deliverables like:
   `landing page, hero copy, pricing card, WhatsApp CTA, screenshots`.
4. Logout on `/dashboard`.
5. Register `worker@example.com` as `WORKER`.
6. Accept the open task.
7. Submit proof with a detailed note and filenames:
   `landing-page.png, mobile-screenshot.png, pricing-card.png`.
8. Open the verification result.
9. Login as the client and approve release, or dispute.
10. Check `/profile`, `/disputes`, and `/admin`.
11. Visit `/agents` to see ranked workers and `/agents/[id]` to inspect trust metrics.

## Supabase path

The runnable MVP uses Prisma + SQLite so it works immediately in local/browser preview. For Supabase:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Replace the Prisma/SQLite calls with Supabase client calls or configure Prisma for Postgres.
4. Use Supabase Auth for production-grade email/password sessions.

This keeps the hackathon demo low-friction while preserving a clear path to a hosted backend.
