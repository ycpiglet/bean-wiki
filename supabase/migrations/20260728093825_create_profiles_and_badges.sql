-- Bean Wiki account profiles.
-- account_key mirrors PlatformUser.accountKey (lowercased email, or
-- "<provider>:<id>" when an account has no email). All writes go through the
-- Next.js server using the service-role key; RLS therefore denies everything
-- by default and no client ever talks to Postgres directly.

create table if not exists profiles (
  account_key      text primary key,
  -- identity
  display_name     text not null,
  nickname         text unique,
  full_name        text,
  gender           text check (gender in ('female','male','other','undisclosed')) default 'undisclosed',
  pronouns         text,
  bio              text check (char_length(bio) <= 500),
  region           text,
  website          text,
  -- coffee self-description
  role             text check (role in ('enthusiast','home_brewer','barista','roaster','q_grader','educator','producer','other')) default 'enthusiast',
  years_experience integer check (years_experience between 0 and 80),
  -- skill, derived from quiz results (never user-writable)
  quiz_score       integer not null default 0,
  quiz_attempts    integer not null default 0,
  quiz_best_pct    integer not null default 0 check (quiz_best_pct between 0 and 100),
  skill_tier       text not null default 'unranked'
                     check (skill_tier in ('unranked','beginner','intermediate','advanced','expert')),
  -- staff
  is_admin         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table profiles is 'Bean Wiki account profile, keyed by PlatformUser.accountKey.';
comment on column profiles.skill_tier is 'Derived from quiz_best_pct by the app; not user-writable.';

-- Credential badges (SCA certificates, cupping judge, etc.).
-- Self-declared on submit, then an admin approves or rejects.
create table if not exists credentials (
  id            uuid primary key default gen_random_uuid(),
  account_key   text not null references profiles(account_key) on delete cascade,
  kind          text not null check (kind in (
                  'sca_barista','sca_brewing','sca_roasting','sca_sensory','sca_green',
                  'q_grader','cqi_r_grader','wbc_competitor','other')),
  title         text not null,
  issuer        text,
  credential_id text,
  issued_on     date,
  expires_on    date,
  evidence_url  text,
  status        text not null default 'pending' check (status in ('pending','verified','rejected')),
  review_note   text,
  reviewed_by   text,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists credentials_account_idx on credentials (account_key);
create index if not exists credentials_status_idx  on credentials (status);

comment on table credentials is 'Self-declared expertise credentials; badge shows only once status = verified.';

-- Quiz attempts feed skill_tier. One row per graded attempt.
create table if not exists quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  account_key text not null references profiles(account_key) on delete cascade,
  correct     integer not null check (correct >= 0),
  total       integer not null check (total > 0),
  percent     integer not null check (percent between 0 and 100),
  level       text,
  created_at  timestamptz not null default now()
);

create index if not exists quiz_attempts_account_idx on quiz_attempts (account_key, created_at desc);

-- Server-only access: enable RLS with no policies, so the anon/publishable key
-- can read and write nothing. The service-role key bypasses RLS.
alter table profiles      enable row level security;
alter table credentials   enable row level security;
alter table quiz_attempts enable row level security;

create or replace function touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on profiles;
create trigger profiles_touch_updated_at
  before update on profiles
  for each row execute function touch_updated_at();
