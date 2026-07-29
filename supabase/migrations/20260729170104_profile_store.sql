-- These tables are a server-only store. RLS has intentionally no client
-- policies; the application uses the service role from its server data layer.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.credentials from anon, authenticated;
revoke all on table public.quiz_attempts from anon, authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.credentials to service_role;
grant select, insert, update, delete on table public.quiz_attempts to service_role;
