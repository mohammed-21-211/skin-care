-- ════════════════════════════════════════════════════════════════════
--  Grant table privileges to the Supabase roles.
--  Without these, the service_role (used by Edge Functions) and the
--  authenticated role (used by the browser client) get
--  "permission denied for table ...". RLS still governs row visibility.
-- ════════════════════════════════════════════════════════════════════
grant usage on schema public to anon, authenticated, service_role;

-- Edge Functions run as service_role (bypasses RLS, needs table grants).
grant all privileges on public.analyses      to service_role;
grant all privileges on public.chat_sessions to service_role;
grant all privileges on public.chat_messages to service_role;

-- Browser client reads its own rows as the authenticated role (RLS-filtered).
grant select on public.analyses      to authenticated;
grant select on public.chat_sessions to authenticated;
grant select on public.chat_messages to authenticated;

