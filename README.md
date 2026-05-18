# Agent Trust

Agent Trust is an AI-powered escrow and task verification platform for freelancers, SMEs, delivery services, remote teams, digital agencies, gig platforms, and AI agents.

The product acts as a smart trust layer: a client creates a task, funds escrow, a worker or AI agent submits proof, the verification engine scores completion, and payment is released only when the work is verified.

## Problem

In Zambia and across African gig ecosystems, clients and workers face fraud, fake proof of completion, unfinished work, missing delivery evidence, and payment disputes. Businesses also need new controls for remote workers and AI agents that can produce outputs without reliable proof of completion.

## Solution

Agent Trust combines:

- Escrow wallet simulation
- Task and milestone management
- Explainable AI verification
- Trust and reputation scoring
- WhatsApp-style communication
- Dispute resolution
- QR verification concepts
- Multi-currency and mobile money payment concepts
- Smart-contract simulation
- Fraud risk indicators

## Product structure

```txt
src/app/
  page.tsx                 Landing page with product copy, schema, APIs, flows, and roadmap
  login/page.tsx           Login and signup concept
  dashboard/page.tsx       Client and worker dashboards
  tasks/new/page.tsx       Task creation and milestone setup
  escrow/page.tsx          Escrow and payment simulation
  verification/page.tsx    AI verification and explanation screen
  reputation/page.tsx      Trust profile and score history
  admin/page.tsx           Admin risk and reviewer dashboard
  disputes/page.tsx        Dispute center
  api/auth/register        User registration endpoint
  api/tasks                Task creation and listing
  api/escrow               Escrow fund/release/refund/split simulation
  api/verification         Explainable AI verification endpoint
  api/disputes             Dispute workflow endpoint
src/components/agent-trust/
  app-shell.tsx            Shared fintech shell, navigation, and glass UI helpers
src/lib/
  agent-trust-data.ts      Product data, page content, metrics, flows, roadmap
  trust-scoring.ts         Sample AI verification and scoring engine
prisma/schema.prisma       Database schema for task trust infrastructure
```

## Core user flow

1. Client creates a task with deliverables, milestones, due date, proof requirements, currency, and payment amount.
2. Client funds escrow through a simulated payment rail such as Airtel Money, MTN MoMo, bank transfer, card, wallet, or USDC.
3. Worker, delivery team, freelancer, or AI agent submits proof of completion.
4. Agent Trust analyzes proof through deterministic checks and optional OpenAI explanation.
5. The engine generates a trust score, pass/review/reject decision, evidence signals, fraud flags, and recommended action.
6. If approved, escrow can be released automatically.
7. If disputed or low-confidence, funds remain locked and a reviewer workflow opens.

## Database schema

The Prisma schema keeps the scaffold's original event models for compatibility and adds Agent Trust models:

- `User`: client, worker, AI agent, reviewer, or admin with role, KYC status, phone, wallet address, country, organization, and trust score.
- `Task`: job brief, deliverables, status, amount, currency, release threshold, payment rail, risk level, client, assignee, and due date.
- `Milestone`: payout percentages, due dates, scoped verification rules, and milestone status.
- `EscrowAccount`: locked balance, provider reference, simulated contract address, funding and release timestamps.
- `EscrowTransaction`: fund, release, refund, split, and fee ledger events.
- `ProofSubmission`: documents, screenshots, QR payloads, notes, file URLs, file hashes, and metadata.
- `VerificationResult`: AI score, decision, explanation, signal JSON, fraud flags, and model version.
- `Dispute`: review status, priority, reason, evidence summary, reviewer assignment, resolution, and payout decision.
- `ReputationEvent`: immutable trust score changes.
- `ActivityLog`: audit-safe workflow events.

## API architecture

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create role-aware accounts. |
| `GET` | `/api/tasks` | List tasks with clients, assignees, milestones, escrow, verification, and disputes. |
| `POST` | `/api/tasks` | Create a task, milestones, and optional funded escrow. |
| `POST` | `/api/escrow` | Simulate fund, release, refund, or split movements. |
| `POST` | `/api/verification` | Score submitted proof and optionally persist verification results. |
| `GET` | `/api/disputes` | Return dispute queue. |
| `POST` | `/api/disputes` | Open a dispute and lock the task into review. |

## Sample AI verification logic

`src/lib/trust-scoring.ts` implements a practical MVP scoring engine:

- Deliverable coverage: matches submitted proof against required deliverables and expected keywords.
- Evidence authenticity: rewards proof variety and file references.
- Text and file quality: checks proof detail, measurable evidence, and supporting files.
- Fraud resistance: flags duplicate filenames, placeholder language, short proof notes, and late submissions.
- Decision rules:
  - `approved`: score >= 80 with at most one fraud flag
  - `review`: score >= 58
  - `rejected`: score < 58

If `OPENAI_API_KEY` is present, `/api/verification` also calls OpenAI's chat completions API and requests a JSON explanation with risks, missing evidence, and reviewer summary. The deterministic score remains the auditable baseline.

## Scalable architecture

1. Experience layer: Next.js web app, mobile-first PWA, WhatsApp-style task room, admin console.
2. Trust workflow layer: task orchestration, milestone rules, escrow state machine, notification fan-out.
3. AI layer: OpenAI prompt gateway, deterministic risk engine, file comparison jobs, explainability store.
4. Financial layer: mobile money adapters, bank/card processor, wallet ledger, smart-contract simulation.
5. Data and compliance: PostgreSQL, object storage, audit trail, KYC/KYB, fraud analytics.

## MVP roadmap

### MVP

- Authentication
- Client and worker dashboards
- Task creation
- Milestone management
- Escrow simulation
- Proof submission
- AI trust scoring
- Dispute queue

### Pilot

- Zambia-first Airtel Money and MTN MoMo integration concepts
- QR delivery verification
- Reputation profiles
- Admin reviewer tooling
- Notification workflows

### Scale

- Partner trust APIs
- Webhooks for gig platforms and digital agencies
- Smart-contract settlement rails
- Advanced fraud graph
- AI-agent attestation and policy controls

## Local development

```bash
npm install
npx prisma generate
npm run dev
```

Build check:

```bash
npm run build
```
