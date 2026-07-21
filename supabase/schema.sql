create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type event_status as enum ('not_started', 'in_progress', 'completed', 'delayed', 'cancelled');
  end if;
end
$$;

create table if not exists public.event_progress (
  event_id text primary key,
  status event_status not null default 'not_started',
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  delay_minutes integer not null default 0 check (delay_minutes between 0 and 1440),
  note text not null default '' check (char_length(note) <= 500),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_pages (
  slug text primary key check (slug in ('usj', 'dining', 'kyoto')),
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 300),
  content text not null default '' check (char_length(content) <= 10000),
  updated_by text not null default '家族' check (char_length(updated_by) between 1 and 20),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_memos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('general', 'usj', 'dining', 'kyoto', 'transport')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null check (char_length(content) between 1 and 5000),
  author text not null default '家族' check (char_length(author) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_event_progress_updated_at on public.event_progress;
create trigger set_event_progress_updated_at
before update on public.event_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_shared_pages_updated_at on public.shared_pages;
create trigger set_shared_pages_updated_at
before update on public.shared_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_shared_memos_updated_at on public.shared_memos;
create trigger set_shared_memos_updated_at
before update on public.shared_memos
for each row execute function public.set_updated_at();

insert into public.shared_pages (slug, title, description, content, updated_by)
values
  (
    'usj',
    'USJ作戦',
    '朝一番の動線、優先アトラクション、食事と休憩の方針を共有します。',
    E'入園後はスーパー・ニンテンドー・ワールド方面を第一候補にします。エリア入場状況を確認し、難しい場合はハリー・ポッター方面へ切り替えます。\n\n家族全員が絶対に乗りたいものを2つまで決め、それ以外は待ち時間と疲労で柔軟に選びます。昼食は混雑のピークを避け、11時台または14時以降を候補にします。',
    '初期設定'
  ),
  (
    'dining',
    '食事候補',
    '京都・大阪・USJ周辺の夕食候補と、店を選ぶ基準をまとめます。',
    E'京都は旅行らしさを感じられる和食を第一候補とし、価格、椅子席、予約のしやすさを比較します。大阪は移動の負担が少なく、家族4人で入りやすい店を優先します。\n\n候補を追加するときは、店名だけでなく、エリア、予算、予約要否、行きたい理由をメモに残します。',
    '初期設定'
  ),
  (
    'kyoto',
    '京都メモ',
    '行きたい場所、甘味、暑さ対策を含めて、無理のない一日を組み立てます。',
    E'観光地を数多く回るより、主目的地を1から2か所に絞り、移動、昼食、甘味、夕食を無理なくつなげます。\n\n抹茶や和菓子を楽しむ時間を確保し、暑さが厳しい場合は屋内や休憩時間を増やします。家族から候補が出たら、理由と一緒に共有メモへ追加します。',
    '初期設定'
  )
on conflict (slug) do nothing;

insert into public.shared_memos (id, category, title, content, author, created_at, updated_at)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'usj',
    '朝一番の第一候補',
    'ドンキーコングかマリオカートを第一候補として、エリア入場状況で切り替える。',
    '晴',
    '2026-07-20T12:00:00+09:00',
    '2026-07-20T12:00:00+09:00'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'dining',
    '京都の夕食で確認したい条件',
    '椅子席、家族4人で会話しやすいこと、予約の可否、予算を候補ごとに確認する。',
    '母',
    '2026-07-20T11:30:00+09:00',
    '2026-07-20T11:30:00+09:00'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'kyoto',
    '予定を詰め込みすぎない',
    '主目的地を1から2か所に絞り、昼食と休憩の時間を先に確保する。',
    '父',
    '2026-07-20T11:00:00+09:00',
    '2026-07-20T11:00:00+09:00'
  )
on conflict (id) do nothing;

alter table public.event_progress enable row level security;
alter table public.shared_pages enable row level security;
alter table public.shared_memos enable row level security;

grant usage on schema public to anon;
grant select, insert, update on public.event_progress to anon;
grant select, insert, update on public.shared_pages to anon;
grant select, insert, update, delete on public.shared_memos to anon;

drop policy if exists "anonymous read" on public.event_progress;
drop policy if exists "anonymous insert" on public.event_progress;
drop policy if exists "anonymous update" on public.event_progress;
create policy "anonymous read" on public.event_progress for select to anon using (true);
create policy "anonymous insert" on public.event_progress for insert to anon
with check (char_length(event_id) between 1 and 100 and delay_minutes between 0 and 1440);
create policy "anonymous update" on public.event_progress for update to anon
using (true)
with check (char_length(event_id) between 1 and 100 and delay_minutes between 0 and 1440);

drop policy if exists "anonymous read shared pages" on public.shared_pages;
drop policy if exists "anonymous insert shared pages" on public.shared_pages;
drop policy if exists "anonymous update shared pages" on public.shared_pages;
create policy "anonymous read shared pages" on public.shared_pages for select to anon using (true);
create policy "anonymous insert shared pages" on public.shared_pages for insert to anon
with check (
  slug in ('usj', 'dining', 'kyoto')
  and char_length(content) <= 10000
  and char_length(updated_by) between 1 and 20
);
create policy "anonymous update shared pages" on public.shared_pages for update to anon
using (true)
with check (
  slug in ('usj', 'dining', 'kyoto')
  and char_length(content) <= 10000
  and char_length(updated_by) between 1 and 20
);

drop policy if exists "anonymous read shared memos" on public.shared_memos;
drop policy if exists "anonymous insert shared memos" on public.shared_memos;
drop policy if exists "anonymous update shared memos" on public.shared_memos;
drop policy if exists "anonymous delete shared memos" on public.shared_memos;
create policy "anonymous read shared memos" on public.shared_memos for select to anon using (true);
create policy "anonymous insert shared memos" on public.shared_memos for insert to anon
with check (
  category in ('general', 'usj', 'dining', 'kyoto', 'transport')
  and char_length(title) between 1 and 120
  and char_length(content) between 1 and 5000
  and char_length(author) between 1 and 20
);
create policy "anonymous update shared memos" on public.shared_memos for update to anon
using (true)
with check (
  category in ('general', 'usj', 'dining', 'kyoto', 'transport')
  and char_length(title) between 1 and 120
  and char_length(content) between 1 and 5000
  and char_length(author) between 1 and 20
);
create policy "anonymous delete shared memos" on public.shared_memos for delete to anon using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_progress'
  ) then
    alter publication supabase_realtime add table public.event_progress;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shared_pages'
  ) then
    alter publication supabase_realtime add table public.shared_pages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shared_memos'
  ) then
    alter publication supabase_realtime add table public.shared_memos;
  end if;
end
$$;

-- BEGIN TRIP PIN ACCESS
create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists private.trip_access_config (
  singleton boolean primary key default true check (singleton),
  pin_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.trip_access_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  authorized_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Configure the PIN only through a private, uncommitted SQL script.

create or replace function public.verify_trip_pin(input_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
declare
  configured_hash text;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    return false;
  end if;

  if input_pin is null or input_pin !~ '^[0-9]{4}$' then
    perform pg_sleep(0.35);
    return false;
  end if;

  select pin_hash
  into configured_hash
  from private.trip_access_config
  where singleton = true;

  if configured_hash is null or crypt(input_pin, configured_hash) <> configured_hash then
    perform pg_sleep(0.35);
    return false;
  end if;

  delete from private.trip_access_members
  where expires_at <= now();

  insert into private.trip_access_members (user_id, authorized_at, expires_at)
  values (current_user_id, now(), now() + interval '180 days')
  on conflict (user_id) do update
  set authorized_at = excluded.authorized_at,
      expires_at = excluded.expires_at;

  return true;
end;
$$;

create or replace function public.has_valid_trip_access()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from private.trip_access_members
    where user_id = auth.uid()
      and expires_at > now()
  );
$$;

create or replace function public.validate_trip_access()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select public.has_valid_trip_access();
$$;

revoke all on function public.verify_trip_pin(text) from public;
revoke all on function public.has_valid_trip_access() from public;
revoke all on function public.validate_trip_access() from public;

grant execute on function public.verify_trip_pin(text) to authenticated;
grant execute on function public.has_valid_trip_access() to authenticated;
grant execute on function public.validate_trip_access() to authenticated;

revoke select, insert, update on public.event_progress from anon;
revoke select, insert, update on public.shared_pages from anon;
revoke select, insert, update, delete on public.shared_memos from anon;

grant select, insert, update on public.event_progress to authenticated;
grant select, insert, update on public.shared_pages to authenticated;
grant select, insert, update, delete on public.shared_memos to authenticated;

drop policy if exists "anonymous read" on public.event_progress;
drop policy if exists "anonymous insert" on public.event_progress;
drop policy if exists "anonymous update" on public.event_progress;
drop policy if exists "family read" on public.event_progress;
drop policy if exists "family insert" on public.event_progress;
drop policy if exists "family update" on public.event_progress;
create policy "family read" on public.event_progress for select to authenticated
using (public.has_valid_trip_access());
create policy "family insert" on public.event_progress for insert to authenticated
with check (
  public.has_valid_trip_access()
  and char_length(event_id) between 1 and 100
  and delay_minutes between 0 and 1440
);
create policy "family update" on public.event_progress for update to authenticated
using (public.has_valid_trip_access())
with check (
  public.has_valid_trip_access()
  and char_length(event_id) between 1 and 100
  and delay_minutes between 0 and 1440
);

drop policy if exists "anonymous read shared pages" on public.shared_pages;
drop policy if exists "anonymous insert shared pages" on public.shared_pages;
drop policy if exists "anonymous update shared pages" on public.shared_pages;
drop policy if exists "family read shared pages" on public.shared_pages;
drop policy if exists "family insert shared pages" on public.shared_pages;
drop policy if exists "family update shared pages" on public.shared_pages;
create policy "family read shared pages" on public.shared_pages for select to authenticated
using (public.has_valid_trip_access());
create policy "family insert shared pages" on public.shared_pages for insert to authenticated
with check (
  public.has_valid_trip_access()
  and slug in ('usj', 'dining', 'kyoto')
  and char_length(content) <= 10000
  and char_length(updated_by) between 1 and 20
);
create policy "family update shared pages" on public.shared_pages for update to authenticated
using (public.has_valid_trip_access())
with check (
  public.has_valid_trip_access()
  and slug in ('usj', 'dining', 'kyoto')
  and char_length(content) <= 10000
  and char_length(updated_by) between 1 and 20
);

drop policy if exists "anonymous read shared memos" on public.shared_memos;
drop policy if exists "anonymous insert shared memos" on public.shared_memos;
drop policy if exists "anonymous update shared memos" on public.shared_memos;
drop policy if exists "anonymous delete shared memos" on public.shared_memos;
drop policy if exists "family read shared memos" on public.shared_memos;
drop policy if exists "family insert shared memos" on public.shared_memos;
drop policy if exists "family update shared memos" on public.shared_memos;
drop policy if exists "family delete shared memos" on public.shared_memos;
create policy "family read shared memos" on public.shared_memos for select to authenticated
using (public.has_valid_trip_access());
create policy "family insert shared memos" on public.shared_memos for insert to authenticated
with check (
  public.has_valid_trip_access()
  and category in ('general', 'usj', 'dining', 'kyoto', 'transport')
  and char_length(title) between 1 and 120
  and char_length(content) between 1 and 5000
  and char_length(author) between 1 and 20
);
create policy "family update shared memos" on public.shared_memos for update to authenticated
using (public.has_valid_trip_access())
with check (
  public.has_valid_trip_access()
  and category in ('general', 'usj', 'dining', 'kyoto', 'transport')
  and char_length(title) between 1 and 120
  and char_length(content) between 1 and 5000
  and char_length(author) between 1 and 20
);
create policy "family delete shared memos" on public.shared_memos for delete to authenticated
using (public.has_valid_trip_access());
-- END TRIP PIN ACCESS
