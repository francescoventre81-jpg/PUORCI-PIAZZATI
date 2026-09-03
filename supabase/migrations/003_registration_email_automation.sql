-- FANTAPUORCI: email automatiche per account verificati ma non ancora iscritti.
-- Migration incrementale: richiede 001 e 002.
-- NON viene applicata automaticamente.

create table if not exists public.registration_email_notifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_created_at timestamptz not null,
  email_verified_at timestamptz not null,
  welcome_registration_email_claimed_at timestamptz,
  welcome_registration_email_sent_at timestamptz,
  registration_reminder_due_at timestamptz not null,
  registration_reminder_claimed_at timestamptz,
  registration_reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_email_notifications_order_check check (
    registration_reminder_sent_at is null
    or welcome_registration_email_sent_at is not null
  )
);

alter table public.registration_email_notifications enable row level security;
alter table public.registration_email_notifications force row level security;

revoke all on public.registration_email_notifications from public, anon, authenticated;

create index if not exists registration_email_notifications_welcome_idx
  on public.registration_email_notifications (
    welcome_registration_email_sent_at,
    welcome_registration_email_claimed_at,
    email_verified_at
  );

create index if not exists registration_email_notifications_reminder_idx
  on public.registration_email_notifications (
    registration_reminder_sent_at,
    registration_reminder_due_at,
    registration_reminder_claimed_at
  );

create or replace function public.sync_registration_email_notifications(
  target_user_id_value uuid default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_rows integer;
begin
  insert into public.registration_email_notifications (
    user_id,
    account_created_at,
    email_verified_at,
    registration_reminder_due_at
  )
  select
    users.id,
    users.created_at,
    users.email_confirmed_at,
    greatest(users.email_confirmed_at + interval '5 hours', now() + interval '5 hours')
  from auth.users as users
  where users.email_confirmed_at is not null
    and users.email is not null
    and (target_user_id_value is null or users.id = target_user_id_value)
    and not exists (
      select 1
      from public.admin_users as admins
      where admins.user_id = users.id
    )
  on conflict (user_id) do update
  set
    email_verified_at = excluded.email_verified_at,
    updated_at = now();

  get diagnostics inserted_rows = row_count;
  return inserted_rows;
end;
$$;

create or replace function public.claim_welcome_registration_emails(
  target_user_id_value uuid default null,
  max_jobs_value integer default 50
)
returns table (
  user_id uuid,
  email text,
  first_name text,
  claimed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_registration_email_notifications(target_user_id_value);

  return query
  with candidates as (
    select
      notifications.user_id,
      users.email::text as email,
      coalesce(users.raw_user_meta_data ->> 'first_name', '') as first_name
    from public.registration_email_notifications as notifications
    join auth.users as users on users.id = notifications.user_id
    where notifications.welcome_registration_email_sent_at is null
      and (
        notifications.welcome_registration_email_claimed_at is null
        or notifications.welcome_registration_email_claimed_at < now() - interval '30 minutes'
      )
      and (target_user_id_value is null or notifications.user_id = target_user_id_value)
      and not exists (
        select 1
        from public.admin_users as admins
        where admins.user_id = notifications.user_id
      )
      and not exists (
        select 1
        from public.registrations as registrations
        where registrations.user_id = notifications.user_id
          and (
            registrations.payment_status = 'paid'
            or registrations.registration_status = 'confirmed'
          )
      )
    order by notifications.email_verified_at
    limit greatest(1, least(coalesce(max_jobs_value, 50), 100))
    for update of notifications skip locked
  )
  update public.registration_email_notifications as notifications
  set
    welcome_registration_email_claimed_at = clock_timestamp(),
    updated_at = clock_timestamp()
  from candidates
  where notifications.user_id = candidates.user_id
  returning
    notifications.user_id,
    candidates.email,
    candidates.first_name,
    notifications.welcome_registration_email_claimed_at;
end;
$$;

create or replace function public.claim_registration_reminders(
  max_jobs_value integer default 50
)
returns table (
  user_id uuid,
  email text,
  first_name text,
  claimed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_registration_email_notifications(null);

  return query
  with candidates as (
    select
      notifications.user_id,
      users.email::text as email,
      coalesce(users.raw_user_meta_data ->> 'first_name', '') as first_name
    from public.registration_email_notifications as notifications
    join auth.users as users on users.id = notifications.user_id
    where notifications.welcome_registration_email_sent_at is not null
      and notifications.registration_reminder_sent_at is null
      and notifications.registration_reminder_due_at <= now()
      and (
        notifications.registration_reminder_claimed_at is null
        or notifications.registration_reminder_claimed_at < now() - interval '30 minutes'
      )
      and not exists (
        select 1
        from public.admin_users as admins
        where admins.user_id = notifications.user_id
      )
      and not exists (
        select 1
        from public.registrations as registrations
        where registrations.user_id = notifications.user_id
          and (
            registrations.payment_status = 'paid'
            or registrations.registration_status = 'confirmed'
          )
      )
    order by notifications.registration_reminder_due_at
    limit greatest(1, least(coalesce(max_jobs_value, 50), 100))
    for update of notifications skip locked
  )
  update public.registration_email_notifications as notifications
  set
    registration_reminder_claimed_at = clock_timestamp(),
    updated_at = clock_timestamp()
  from candidates
  where notifications.user_id = candidates.user_id
  returning
    notifications.user_id,
    candidates.email,
    candidates.first_name,
    notifications.registration_reminder_claimed_at;
end;
$$;

create or replace function public.complete_registration_email_job(
  target_user_id_value uuid,
  email_kind_value text,
  claimed_at_value timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if email_kind_value = 'welcome' then
    update public.registration_email_notifications
    set
      welcome_registration_email_sent_at = now(),
      welcome_registration_email_claimed_at = null,
      registration_reminder_due_at = now() + interval '5 hours',
      updated_at = now()
    where user_id = target_user_id_value
      and welcome_registration_email_sent_at is null
      and welcome_registration_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'reminder' then
    update public.registration_email_notifications
    set
      registration_reminder_sent_at = now(),
      registration_reminder_claimed_at = null,
      updated_at = now()
    where user_id = target_user_id_value
      and registration_reminder_sent_at is null
      and registration_reminder_claimed_at = claimed_at_value;
  else
    raise exception 'invalid_registration_email_kind';
  end if;

  return found;
end;
$$;

create or replace function public.release_registration_email_job(
  target_user_id_value uuid,
  email_kind_value text,
  claimed_at_value timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if email_kind_value = 'welcome' then
    update public.registration_email_notifications
    set
      welcome_registration_email_claimed_at = null,
      updated_at = now()
    where user_id = target_user_id_value
      and welcome_registration_email_sent_at is null
      and welcome_registration_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'reminder' then
    update public.registration_email_notifications
    set
      registration_reminder_claimed_at = null,
      updated_at = now()
    where user_id = target_user_id_value
      and registration_reminder_sent_at is null
      and registration_reminder_claimed_at = claimed_at_value;
  else
    raise exception 'invalid_registration_email_kind';
  end if;

  return found;
end;
$$;

revoke all on function public.sync_registration_email_notifications(uuid)
from public, anon, authenticated;
revoke all on function public.claim_welcome_registration_emails(uuid, integer)
from public, anon, authenticated;
revoke all on function public.claim_registration_reminders(integer)
from public, anon, authenticated;
revoke all on function public.complete_registration_email_job(uuid, text, timestamptz)
from public, anon, authenticated;
revoke all on function public.release_registration_email_job(uuid, text, timestamptz)
from public, anon, authenticated;

grant execute on function public.sync_registration_email_notifications(uuid)
to service_role;
grant execute on function public.claim_welcome_registration_emails(uuid, integer)
to service_role;
grant execute on function public.claim_registration_reminders(integer)
to service_role;
grant execute on function public.complete_registration_email_job(uuid, text, timestamptz)
to service_role;
grant execute on function public.release_registration_email_job(uuid, text, timestamptz)
to service_role;
