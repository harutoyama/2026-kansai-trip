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
