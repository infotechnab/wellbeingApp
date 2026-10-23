-- Wellbeing app schema.
-- Content tables are readable by everyone (including anonymous users) and edited from the
-- Supabase dashboard. User tables are private to their owner through row level security.

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table public.emotions (
  id text primary key,
  name text not null,
  theme text not null,
  need text not null,
  body_response text not null,
  color text not null,
  sort_order int not null default 0
);

create table public.activities (
  id text primary key,
  emotion_id text not null references public.emotions (id) on delete cascade,
  sort_order int not null,
  kind text not null check (kind in ('breath', 'timer', 'prompt', 'share', 'write', 'grounding', 'focus-dot')),
  title text not null,
  instruction text not null,
  duration_sec int,
  breath jsonb,
  steps jsonb,
  templates jsonb,
  placeholder text,
  research text,
  active boolean not null default true,
  unique (emotion_id, sort_order)
);

create table public.affirmations (
  id bigint generated always as identity primary key,
  text text not null,
  active boolean not null default true
);

alter table public.emotions enable row level security;
alter table public.activities enable row level security;
alter table public.affirmations enable row level security;

create policy "Content is public" on public.emotions for select using (true);
create policy "Content is public" on public.activities for select using (true);
create policy "Content is public" on public.affirmations for select using (true);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ids are generated on the device so records can be created offline and uploaded later. The key
-- includes the owner, so a device that signs into a different account can upload its journal again
-- under that account without clashing with the copy saved by the previous (e.g. guest) account.
create table public.session_summaries (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  emotion_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  completed int not null,
  skipped int not null,
  total int not null,
  redos int not null,
  primary key (user_id, id)
);

create table public.activity_events (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id text not null,
  emotion_id text not null,
  activity_id text,
  type text not null check (
    type in ('session_start', 'session_end', 'start', 'complete', 'skip', 'redo', 'like', 'dislike', 'reaction_cleared')
  ),
  at timestamptz not null,
  primary key (user_id, id)
);

create index activity_events_activity_idx on public.activity_events (activity_id, type);

create table public.feedback (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id text,
  emotion_id text,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null,
  primary key (user_id, id)
);

create table public.sketches (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  width int not null,
  height int not null,
  strokes jsonb not null,
  created_at timestamptz not null,
  primary key (user_id, id)
);

create table public.notes (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  activity_id text not null,
  emotion_id text not null,
  text text not null check (char_length(text) between 1 and 280),
  created_at timestamptz not null,
  primary key (user_id, id)
);

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'session_summaries', 'activity_events', 'feedback', 'sketches', 'notes'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

create policy "Own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array['session_summaries', 'activity_events', 'feedback', 'sketches', 'notes'] loop
    execute format(
      'create policy "Own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end;
$$;

-- Aggregate like/dislike/redo counts per activity, for deciding which activities to improve.
-- Security invoker keeps row level security in force, so only the service role sees everyone's data.
create view public.activity_preferences with (security_invoker = true) as
select
  activity_id,
  count(*) filter (where type = 'like') as likes,
  count(*) filter (where type = 'dislike') as dislikes,
  count(*) filter (where type = 'complete') as completions,
  count(*) filter (where type = 'skip') as skips,
  count(*) filter (where type = 'redo') as redos
from public.activity_events
where activity_id is not null
group by activity_id;
