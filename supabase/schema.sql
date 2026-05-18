-- Agent Trust Supabase/Postgres schema for hosted deployments.
-- The local hackathon MVP uses Prisma + SQLite for zero-setup browser previews.

create table if not exists users (
  id text primary key,
  email text unique not null,
  password_hash text,
  name text,
  phone text,
  country text default 'Zambia',
  role text default 'CLIENT',
  kyc_status text default 'PENDING',
  trust_score integer default 70,
  organization_name text,
  wallet_address text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  description text not null,
  deliverables jsonb not null default '[]'::jsonb,
  amount numeric not null,
  currency text default 'ZMW',
  status text default 'DRAFT',
  release_threshold integer default 80,
  risk_level text default 'LOW',
  payment_rail text,
  smart_contract_ref text,
  due_at timestamptz,
  client_id text references users(id),
  assignee_id text references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists submissions (
  id text primary key,
  task_id text references tasks(id),
  submitted_by_id text references users(id),
  type text default 'DOCUMENT',
  notes text not null,
  file_urls jsonb default '[]'::jsonb,
  file_hashes jsonb default '[]'::jsonb,
  qr_payload text,
  metadata jsonb default '{}'::jsonb,
  submitted_at timestamptz default now()
);

create table if not exists payments (
  id text primary key,
  task_id text references tasks(id),
  amount numeric not null,
  currency text default 'ZMW',
  type text not null,
  status text default 'PENDING',
  provider text,
  reference text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists verification_results (
  id text primary key,
  task_id text references tasks(id),
  proof_submission_id text references submissions(id),
  score integer not null,
  decision text not null,
  explanation text not null,
  signals jsonb default '[]'::jsonb,
  fraud_flags jsonb default '[]'::jsonb,
  model text not null,
  created_at timestamptz default now()
);

create table if not exists trust_scores (
  id text primary key,
  user_id text references users(id),
  task_id text,
  score integer not null,
  delta integer not null,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists disputes (
  id text primary key,
  task_id text references tasks(id),
  opened_by_id text references users(id),
  assigned_reviewer_id text references users(id),
  status text default 'OPEN',
  priority text default 'MEDIUM',
  reason text not null,
  evidence_summary text,
  resolution text,
  payout_decision text,
  opened_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists activity_logs (
  id text primary key,
  user_id text references users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb default '{}'::jsonb,
  task_id text references tasks(id),
  created_at timestamptz default now()
);
