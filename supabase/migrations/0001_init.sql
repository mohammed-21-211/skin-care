-- ════════════════════════════════════════════════════════════════════
--  Skin Care AI — initial schema
--  Tables, Row Level Security, and the Storage bucket for face photos.
-- ════════════════════════════════════════════════════════════════════

-- ── analyses ────────────────────────────────────────────────────────
-- One row per analyzed image. `report` holds the structured AI output.
create table if not exists public.analyses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  image_path  text not null,
  report      jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

-- ── chat_sessions ───────────────────────────────────────────────────
-- One session per analysis. Tracks the running assistant word count and
-- the 2-hour lock window. Source of truth for the chat limits.
create table if not exists public.chat_sessions (
  analysis_id   uuid primary key references public.analyses (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  total_words   integer not null default 0,
  locked_until  timestamptz,
  created_at    timestamptz not null default now()
);

-- ── chat_messages ───────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id           uuid primary key default gen_random_uuid(),
  analysis_id  uuid not null references public.analyses (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  word_count   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists chat_messages_analysis_idx
  on public.chat_messages (analysis_id, created_at);

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security — clients may only read their own rows.
--  All writes go through Edge Functions using the service-role key,
--  which bypasses RLS, so no INSERT/UPDATE policies are exposed here.
-- ════════════════════════════════════════════════════════════════════
alter table public.analyses      enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "read own analyses" on public.analyses;
create policy "read own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "read own chat sessions" on public.chat_sessions;
create policy "read own chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "read own chat messages" on public.chat_messages;
create policy "read own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
--  Storage bucket for face photos (private).
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('skin-photos', 'skin-photos', false)
on conflict (id) do nothing;

-- Users may only touch files inside a folder named after their own uid,
-- e.g.  <uid>/169...jpg
drop policy if exists "users manage own folder - select" on storage.objects;
create policy "users manage own folder - select"
  on storage.objects for select
  using (bucket_id = 'skin-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users manage own folder - insert" on storage.objects;
create policy "users manage own folder - insert"
  on storage.objects for insert
  with check (bucket_id = 'skin-photos' and (storage.foldername(name))[1] = auth.uid()::text);
