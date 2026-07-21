create extension if not exists pgcrypto;
create schema if not exists private;

do $$
begin
  if pg_catalog.to_regprocedure('extensions.crypt(text,text)') is null then
    raise exception 'pgcrypto function extensions.crypt(text,text) is unavailable';
  end if;
end
$$;

alter table private.trip_access_config enable row level security;
alter table private.trip_access_members enable row level security;

revoke all on schema private from public, anon, authenticated;
revoke all on table private.trip_access_config from public, anon, authenticated;
revoke all on table private.trip_access_members from public, anon, authenticated;

create or replace function public.verify_trip_pin(input_pin text)
returns boolean
language plpgsql
security definer
set search_path = ''
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
    perform pg_catalog.pg_sleep(0.35);
    return false;
  end if;

  select config.pin_hash
  into configured_hash
  from private.trip_access_config as config
  where config.singleton = true;

  if configured_hash is null
    or extensions.crypt(input_pin, configured_hash) <> configured_hash then
    perform pg_catalog.pg_sleep(0.35);
    return false;
  end if;

  delete from private.trip_access_members as members
  where members.expires_at <= pg_catalog.now();

  insert into private.trip_access_members (user_id, authorized_at, expires_at)
  values (
    current_user_id,
    pg_catalog.now(),
    pg_catalog.now() + interval '180 days'
  )
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
set search_path = ''
as $$
  select exists (
    select 1
    from private.trip_access_members as members
    where members.user_id = (select auth.uid())
      and members.expires_at > pg_catalog.now()
  );
$$;

create or replace function public.validate_trip_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_valid_trip_access();
$$;

revoke execute on function public.verify_trip_pin(text) from public, anon, authenticated;
revoke execute on function public.has_valid_trip_access() from public, anon, authenticated;
revoke execute on function public.validate_trip_access() from public, anon, authenticated;

grant execute on function public.verify_trip_pin(text) to authenticated;
grant execute on function public.has_valid_trip_access() to authenticated;
grant execute on function public.validate_trip_access() to authenticated;
