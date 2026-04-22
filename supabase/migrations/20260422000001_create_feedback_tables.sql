-- prediction_outcomes: stores user feedback on prediction accuracy
-- Used by swarmLearningStore.ts to improve company confidence scores.
create table if not exists prediction_outcomes (
  id              uuid primary key default gen_random_uuid(),
  company_role    text not null,          -- "meta::software-engineer"
  swarm_score     numeric(5,2) not null,
  engine_score    numeric(5,2) not null,
  actual_outcome  numeric(5,2) not null,  -- 0=safe, 100=layoff occurred
  accuracy_score  numeric(5,4),           -- 0–1, 1=perfect match
  predicted_at    timestamptz,
  recorded_at     timestamptz default now()
);

create index if not exists prediction_outcomes_company_role_idx
  on prediction_outcomes(company_role);

-- Row-level security: any authenticated user can insert; no one reads others' rows
alter table prediction_outcomes enable row level security;
create policy "insert_own_outcome" on prediction_outcomes
  for insert with check (true);

-- company_discovery_queue: captures unknown companies for manual enrichment
create table if not exists company_discovery_queue (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text,
  role_searched text,
  searched_at   timestamptz default now(),
  status        text default 'pending' check (status in ('pending', 'enriched', 'rejected'))
);

create index if not exists company_discovery_queue_name_idx
  on company_discovery_queue(name);
create index if not exists company_discovery_queue_status_idx
  on company_discovery_queue(status);

alter table company_discovery_queue enable row level security;
create policy "insert_discovery" on company_discovery_queue
  for insert with check (true);
