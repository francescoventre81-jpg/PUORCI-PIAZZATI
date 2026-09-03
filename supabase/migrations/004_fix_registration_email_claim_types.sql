-- Corregge esclusivamente il tipo restituito dalle funzioni di claim email.
-- auth.users.email e' varchar(255), mentre l'API delle funzioni restituisce text.

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

revoke all on function public.claim_welcome_registration_emails(uuid, integer)
  from public, anon, authenticated;
revoke all on function public.claim_registration_reminders(integer)
  from public, anon, authenticated;

grant execute on function public.claim_welcome_registration_emails(uuid, integer)
  to service_role;
grant execute on function public.claim_registration_reminders(integer)
  to service_role;
