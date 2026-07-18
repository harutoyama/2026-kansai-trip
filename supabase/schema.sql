create type event_status as enum ('not_started','in_progress','completed','delayed','cancelled');
create table if not exists public.event_progress (
  event_id text primary key,
  status event_status not null default 'not_started',
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  delay_minutes integer not null default 0 check (delay_minutes between 0 and 1440),
  note text not null default '' check (char_length(note) <= 500),
  updated_at timestamptz not null default now()
);
alter table public.event_progress enable row level security;
create policy "anonymous read" on public.event_progress for select to anon using (true);
create policy "anonymous insert" on public.event_progress for insert to anon with check (char_length(event_id) between 1 and 100 and delay_minutes between 0 and 1440);
create policy "anonymous update" on public.event_progress for update to anon using (true) with check (char_length(event_id) between 1 and 100 and delay_minutes between 0 and 1440);
alter publication supabase_realtime add table public.event_progress;
