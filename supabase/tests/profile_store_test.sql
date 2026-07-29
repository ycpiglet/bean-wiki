begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'credentials', 'credentials table exists');
select has_table('public', 'quiz_attempts', 'quiz attempts table exists');
select has_function('public', 'touch_updated_at', 'updated_at trigger function exists');
select has_trigger(
  'public',
  'profiles',
  'profiles_touch_updated_at',
  'profiles updated_at trigger exists'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.credentials'::regclass),
  true,
  'credentials has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.quiz_attempts'::regclass),
  true,
  'quiz attempts has RLS enabled'
);

select is(
  has_table_privilege('anon', 'public.profiles', 'select'),
  false,
  'anon cannot select profiles'
);
select is(
  has_table_privilege('authenticated', 'public.credentials', 'insert'),
  false,
  'authenticated cannot insert credentials'
);
select is(
  has_table_privilege('service_role', 'public.profiles', 'select'),
  true,
  'service role can select profiles'
);

insert into public.profiles (account_key, display_name)
values ('dev@example.com', 'Developer');

insert into public.quiz_attempts (
  account_key,
  correct,
  total,
  percent,
  level
)
values ('dev@example.com', 8, 10, 80, '중급');

insert into public.credentials (
  account_key,
  kind,
  title
)
values ('dev@example.com', 'q_grader', 'Local Q Grader');

select is(
  (select count(*)::integer from public.profiles),
  1,
  'profile can be created'
);
select is(
  (select count(*)::integer from public.quiz_attempts),
  1,
  'assessment can be recorded'
);
select is(
  (select count(*)::integer from public.credentials),
  1,
  'credential can be submitted'
);

update public.profiles
set updated_at = '2000-01-01 00:00:00+00', nickname = 'developer'
where account_key = 'dev@example.com';

update public.profiles
set bio = 'trigger check'
where account_key = 'dev@example.com';

select ok(
  (select updated_at > '2000-01-01 00:00:00+00' from public.profiles),
  'profile updates refresh updated_at'
);

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public'),
  0,
  'server-only tables expose no client RLS policies'
);

select * from finish();

rollback;
