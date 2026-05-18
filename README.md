# Agent Trust

Agent Trust is an AI safety and governance infrastructure MVP for autonomous AI agents.

It is **not a fintech app**. It is a trust gate that sits between AI-generated outputs and real-world consequences. No AI agent output is trusted by default; every output must be verified before simulated execution is allowed.

## What it demonstrates

- AI output submission interface
- Rule-based verification engine
- PASS / REVIEW / FAIL decisions
- Execution gate that only executes PASS outputs
- Human override for REVIEW cases
- Full audit log for every decision
- Dashboard for submissions, scores, blocked executions, and execution history

## Project structure

```txt
src/app/
  page.tsx                         Landing page for AI safety infrastructure
  dashboard/page.tsx                Governance mission-control dashboard
  submit/page.tsx                   AI output submission form
  submissions/[id]/result/page.tsx  Verification result and human override
  audit/page.tsx                    Audit log
  executions/page.tsx               Execution history
  api/submissions/route.ts          Create/list AI output submissions
  api/submissions/[id]/route.ts     Submission detail + REVIEW override
  api/governance/summary/route.ts   Dashboard, audit, execution summary
src/components/agent-trust/
  app-shell.tsx                     Shared dark governance shell
src/lib/
  governance-verification.ts        Core verification and scoring logic
  mvp-client.ts                     Browser API helper and status colors
prisma/schema.prisma                Local SQLite schema
supabase/schema.sql                 Supabase/Postgres schema
```

## Core flow

1. An AI agent submits an output:
   - task title
   - task requirements
   - output text
   - explanation
   - supporting evidence filenames
   - downstream action label
2. Agent Trust scores the output for:
   - completeness
   - relevance
   - evidence presence
   - logical coherence
   - hallucination risk
3. The system returns:
   - `PASS`: safe to execute
   - `REVIEW`: uncertain, requires human oversight
   - `FAIL`: unsafe or incomplete
4. Execution gate:
   - `PASS` creates an `EXECUTED` event
   - `REVIEW` and `FAIL` create a `BLOCKED` event
   - `REVIEW` can be manually overridden by a human reviewer
5. Every step is recorded in `audit_logs`.

## Verification logic

Implemented in `src/lib/governance-verification.ts`.

Scores:

- `completenessScore`: how many task requirements are covered
- `relevanceScore`: requirement match plus output depth
- `evidenceScore`: supporting file presence
- `coherenceScore`: contradiction detection
- `hallucinationRisk`: risky language, uncertainty, missing evidence, thin explanations
- `finalTrustScore`: weighted aggregate

Decision thresholds:

- `80-100`: `PASS`
- `50-79`: `REVIEW`
- `0-49`: `FAIL`

## Database schema

Core tables:

- `users`
- `tasks`
- `submissions`
- `verification_results`
- `execution_history`
- `audit_logs`

The Prisma schema also retains older prototype tables, but the active AI governance MVP uses the dedicated governance models mapped to the tables above.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/submissions` | List AI output submissions. |
| `POST` | `/api/submissions` | Submit output, run verification, create execution gate event, write audit logs. |
| `GET` | `/api/submissions/[id]` | Load one submission with verification, execution, and audit history. |
| `PATCH` | `/api/submissions/[id]` | Human override for REVIEW submissions. |
| `GET` | `/api/governance/summary` | Dashboard metrics, submissions, executions, and audit logs. |

## Text architecture diagram

```txt
AI Agent Output
      |
      v
Submission API
      |
      v
Verification Engine
  - completeness
  - relevance
  - evidence
  - coherence
  - hallucination risk
      |
      v
Decision: PASS / REVIEW / FAIL
      |
      +--> PASS   -> Execution Gate -> Simulated execution allowed -> Audit log
      +--> REVIEW -> Execution Gate -> Blocked -> Human override possible -> Audit log
      +--> FAIL   -> Execution Gate -> Blocked -> Audit log
```

## Local setup

Create `.env`:

```bash
DATABASE_URL="file:./custom.db"
```

Install and run:

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

## Demo walkthrough

1. Open `/`.
2. Click **Submit AI output**.
3. Enter:
   - Agent: `OpsAgent-7`
   - Requirements: `vendor identity, risk score, supporting documents, approval recommendation`
   - Output: a detailed AI-generated recommendation
   - Explanation: how the agent reached the result
   - Evidence files: `vendor-report.pdf, risk-check.png`
4. Submit to the trust gate.
5. View the result:
   - PASS executes
   - REVIEW/FAIL blocks execution
6. Open `/dashboard` to view the system overview.
7. Open `/audit` to inspect every decision.
8. Open `/executions` to see allowed, blocked, and overridden actions.

## Supabase deployment path

For a hosted backend:

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Set Vercel `DATABASE_URL` to your hosted Postgres connection string.
4. Configure Prisma for PostgreSQL if moving beyond the SQLite local demo.

The MVP is intentionally simple, but the architecture demonstrates a scalable AI governance trust layer for autonomous agent systems.
