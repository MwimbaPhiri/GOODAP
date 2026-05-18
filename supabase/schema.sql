-- Agent Trust AI governance schema for Supabase/Postgres.
-- The local MVP uses Prisma + SQLite; this SQL mirrors the core governance tables.

create table if not exists users (
  id text primary key,
  email text unique not null,
  name text,
  role text default 'OPERATOR',
  created_at timestamptz default now()
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  requirements jsonb not null default '[]'::jsonb,
  risk_context text,
  created_at timestamptz default now()
);

create table if not exists submissions (
  id text primary key,
  agent_name text not null,
  agent_type text default 'autonomous_agent',
  task_title text not null,
  task_requirements jsonb not null default '[]'::jsonb,
  output_text text not null,
  explanation text not null,
  evidence_files jsonb default '[]'::jsonb,
  risk_context text,
  status text default 'REVIEW',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists verification_results (
  id text primary key,
  submission_id text unique references submissions(id),
  completeness_score integer not null,
  relevance_score integer not null,
  evidence_score integer not null,
  coherence_score integer not null,
  hallucination_risk integer not null,
  final_trust_score integer not null,
  decision text not null,
  explanation text not null,
  flags jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists execution_history (
  id text primary key,
  submission_id text references submissions(id),
  action_label text not null,
  status text not null,
  reason text not null,
  actor text default 'Agent Trust Gate',
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id text primary key,
  submission_id text references submissions(id),
  event_type text not null,
  actor text default 'system',
  details text not null,
  created_at timestamptz default now()
);
