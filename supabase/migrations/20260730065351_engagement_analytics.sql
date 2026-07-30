-- Server-only engagement and privacy-preserving traffic store.
-- No browser receives the service role. RLS is enabled with no client policy.

create table if not exists public.article_reviews (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  actor_key text not null,
  display_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_slug, actor_key)
);

create index if not exists article_reviews_slug_idx
  on public.article_reviews (article_slug, updated_at desc);

create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  actor_key text not null,
  display_name text not null,
  body text not null check (char_length(body) <= 1200),
  parent_id uuid references public.article_comments(id) on delete set null,
  actor_type text not null default 'human'
    check (actor_type in ('human', 'agent')),
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists article_comments_slug_idx
  on public.article_comments (article_slug, created_at);
create index if not exists article_comments_parent_idx
  on public.article_comments (parent_id, created_at);

create table if not exists public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  actor_key text not null,
  display_name text not null,
  actor_type text not null default 'human'
    check (actor_type in ('human', 'agent')),
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  unique (article_slug, actor_key)
);

create index if not exists article_likes_slug_idx
  on public.article_likes (article_slug, created_at);

create table if not exists public.engagement_events (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  action text not null,
  actor_key text not null,
  actor_type text not null default 'human'
    check (actor_type in ('human', 'agent')),
  subject_id text not null default '',
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists engagement_events_article_idx
  on public.engagement_events (article_slug, created_at desc);
create index if not exists engagement_events_action_idx
  on public.engagement_events (action, created_at desc);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) <= 300),
  entity_type text not null default '',
  entity_key text not null default '' check (char_length(entity_key) <= 160),
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  day date not null,
  session_hash text not null check (char_length(session_hash) = 32),
  referrer_class text not null default 'direct',
  country_code text not null default 'ZZ'
    check (country_code ~ '^[A-Z]{2}$'),
  hour_bucket integer not null default 0 check (hour_bucket between 0 and 23),
  device_class text not null default 'unknown'
    check (device_class in ('desktop', 'mobile', 'tablet', 'bot', 'unknown')),
  created_at timestamptz not null default now()
);

create index if not exists page_views_day_entity_idx
  on public.page_views (day, entity_type, entity_key);
create index if not exists page_views_created_idx
  on public.page_views (created_at);

alter table public.article_reviews enable row level security;
alter table public.article_comments enable row level security;
alter table public.article_likes enable row level security;
alter table public.engagement_events enable row level security;
alter table public.page_views enable row level security;

revoke all on table public.article_reviews from anon, authenticated;
revoke all on table public.article_comments from anon, authenticated;
revoke all on table public.article_likes from anon, authenticated;
revoke all on table public.engagement_events from anon, authenticated;
revoke all on table public.page_views from anon, authenticated;

grant select, insert, update, delete on table public.article_reviews to service_role;
grant select, insert, update, delete on table public.article_comments to service_role;
grant select, insert, update, delete on table public.article_likes to service_role;
grant select, insert, update, delete on table public.engagement_events to service_role;
grant select, insert, update, delete on table public.page_views to service_role;

create or replace function public.bean_wiki_analytics_dashboard(
  window_days integer default 14
) returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with bounds as (
    select
      current_date as to_day,
      current_date - (least(90, greatest(1, window_days)) - 1) as from_day,
      least(90, greatest(1, window_days)) as days
  ),
  view_rows as (
    select pv.*
      from public.page_views pv, bounds b
     where pv.day between b.from_day and b.to_day
  ),
  view_totals as (
    select count(*)::integer as views,
           count(distinct day::text || ':' || session_hash)::integer
             as unique_daily_readers
      from view_rows
  ),
  like_totals as (
    select
      count(*) filter (where actor_type = 'human')::integer as human_likes,
      count(*) filter (where actor_type = 'agent')::integer as agent_likes
      from public.article_likes
     where is_synthetic = false
  ),
  comment_totals as (
    select count(*)::integer as comments
      from public.article_comments
     where is_synthetic = false and deleted_at is null
  ),
  article_views as (
    select entity_key as slug, count(*)::integer as views
      from view_rows
     where entity_type = 'article'
     group by entity_key
    having count(distinct session_hash) >= 5
     order by views desc
     limit 12
  ),
  article_likes as (
    select article_slug as slug, count(*)::integer as likes
      from public.article_likes
     where is_synthetic = false
     group by article_slug
  ),
  article_comments as (
    select article_slug as slug, count(*)::integer as comments
      from public.article_comments
     where is_synthetic = false and deleted_at is null
     group by article_slug
  )
  select jsonb_build_object(
    'available', true,
    'windowDays', (select days from bounds),
    'generatedAt', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'totals', jsonb_build_object(
      'views', (select case when unique_daily_readers >= 5 then views else 0 end
                  from view_totals),
      'uniqueDailyReaders',
        (select case when unique_daily_readers >= 5
                     then unique_daily_readers else 0 end from view_totals),
      'humanLikes', coalesce((select human_likes from like_totals), 0),
      'agentLikes', coalesce((select agent_likes from like_totals), 0),
      'likes',
        coalesce((select human_likes + agent_likes from like_totals), 0),
      'comments', coalesce((select comments from comment_totals), 0)
    ),
    'trend', coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', day::text,
        'value', views,
        'secondary', readers
      ) order by day)
      from (
        select day, count(*)::integer as views,
               count(distinct session_hash)::integer as readers
          from view_rows group by day
        having count(distinct session_hash) >= 5
      ) trend_rows
    ), '[]'::jsonb),
    'topArticles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', av.slug,
        'views', av.views,
        'likes', coalesce(al.likes, 0),
        'comments', coalesce(ac.comments, 0)
      ) order by av.views desc)
      from article_views av
      left join article_likes al using (slug)
      left join article_comments ac using (slug)
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('key', referrer_class, 'value', total)
                       order by total desc)
      from (
        select referrer_class, count(*)::integer as total
          from view_rows group by referrer_class
        having count(distinct session_hash) >= 5
      ) rows
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('key', country_code, 'value', total)
                       order by total desc)
      from (
        select country_code, count(*)::integer as total
          from view_rows group by country_code
        having count(distinct session_hash) >= 5
         order by total desc limit 12
      ) rows
    ), '[]'::jsonb),
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', hour_bucket::text, 'value', total
      ) order by hour_bucket)
      from (
        select hour_bucket, count(*)::integer as total
          from view_rows group by hour_bucket
        having count(distinct session_hash) >= 5
      ) rows
    ), '[]'::jsonb)
  );
$$;

revoke execute on function public.bean_wiki_analytics_dashboard(integer)
  from public, anon, authenticated;
grant execute on function public.bean_wiki_analytics_dashboard(integer)
  to service_role;

create or replace function public.bean_wiki_article_feedback_summary(
  requested_slug text
) returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'review_average', (
      select round(avg(r.rating)::numeric, 1)
        from public.article_reviews r
       where r.article_slug = requested_slug
    ),
    'review_count', (
      select count(*)::integer
        from public.article_reviews r
       where r.article_slug = requested_slug
    ),
    'human_likes', (
      select count(*)::integer
        from public.article_likes l
       where l.article_slug = requested_slug
         and l.actor_type = 'human'
         and l.is_synthetic = false
    ),
    'agent_likes', (
      select count(*)::integer
        from public.article_likes l
       where l.article_slug = requested_slug
         and l.actor_type = 'agent'
         and l.is_synthetic = false
    ),
    'view_count', (
      select count(*)::integer
        from public.page_views pv
       where pv.entity_type = 'article'
         and pv.entity_key = requested_slug
    )
  );
$$;

revoke execute on function public.bean_wiki_article_feedback_summary(text)
  from public, anon, authenticated;
grant execute on function public.bean_wiki_article_feedback_summary(text)
  to service_role;

create or replace function public.bean_wiki_prune_page_views(
  before_day date
) returns integer
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  deleted_rows integer;
begin
  delete from public.page_views where day < before_day;
  get diagnostics deleted_rows = row_count;
  return deleted_rows;
end;
$$;

revoke execute on function public.bean_wiki_prune_page_views(date)
  from public, anon, authenticated;
grant execute on function public.bean_wiki_prune_page_views(date)
  to service_role;
