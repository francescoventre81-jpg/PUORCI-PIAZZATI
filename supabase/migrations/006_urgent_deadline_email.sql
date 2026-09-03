-- Secondo avviso una tantum, classificato chiaramente come URGENTE.
-- Non cancella né modifica iscrizioni o pagamenti.

alter table public.registration_email_notifications
  add column if not exists urgent_deadline_email_claimed_at timestamptz,
  add column if not exists urgent_deadline_email_sent_at timestamptz;

create or replace function public.claim_urgent_deadline_emails(
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
    where notifications.urgent_deadline_email_sent_at is null
      and now() <= timestamptz '2026-08-10T23:59:59+02:00'
      and (
        notifications.urgent_deadline_email_claimed_at is null
        or notifications.urgent_deadline_email_claimed_at < now() - interval '30 minutes'
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
    order by notifications.email_verified_at
    limit greatest(1, least(coalesce(max_jobs_value, 50), 100))
    for update of notifications skip locked
  )
  update public.registration_email_notifications as notifications
  set
    urgent_deadline_email_claimed_at = clock_timestamp(),
    updated_at = clock_timestamp()
  from candidates
  where notifications.user_id = candidates.user_id
  returning
    notifications.user_id,
    candidates.email,
    candidates.first_name,
    notifications.urgent_deadline_email_claimed_at;
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
    set welcome_registration_email_sent_at = now(),
        welcome_registration_email_claimed_at = null,
        registration_reminder_due_at = now() + interval '5 hours',
        updated_at = now()
    where user_id = target_user_id_value
      and welcome_registration_email_sent_at is null
      and welcome_registration_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'reminder' then
    update public.registration_email_notifications
    set registration_reminder_sent_at = now(),
        registration_reminder_claimed_at = null,
        updated_at = now()
    where user_id = target_user_id_value
      and registration_reminder_sent_at is null
      and registration_reminder_claimed_at = claimed_at_value;
  elsif email_kind_value = 'promotion_deadline' then
    update public.registration_email_notifications
    set promotion_deadline_email_sent_at = now(),
        promotion_deadline_email_claimed_at = null,
        updated_at = now()
    where user_id = target_user_id_value
      and promotion_deadline_email_sent_at is null
      and promotion_deadline_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'urgent_deadline' then
    update public.registration_email_notifications
    set urgent_deadline_email_sent_at = now(),
        urgent_deadline_email_claimed_at = null,
        updated_at = now()
    where user_id = target_user_id_value
      and urgent_deadline_email_sent_at is null
      and urgent_deadline_email_claimed_at = claimed_at_value;
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
    set welcome_registration_email_claimed_at = null, updated_at = now()
    where user_id = target_user_id_value
      and welcome_registration_email_sent_at is null
      and welcome_registration_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'reminder' then
    update public.registration_email_notifications
    set registration_reminder_claimed_at = null, updated_at = now()
    where user_id = target_user_id_value
      and registration_reminder_sent_at is null
      and registration_reminder_claimed_at = claimed_at_value;
  elsif email_kind_value = 'promotion_deadline' then
    update public.registration_email_notifications
    set promotion_deadline_email_claimed_at = null, updated_at = now()
    where user_id = target_user_id_value
      and promotion_deadline_email_sent_at is null
      and promotion_deadline_email_claimed_at = claimed_at_value;
  elsif email_kind_value = 'urgent_deadline' then
    update public.registration_email_notifications
    set urgent_deadline_email_claimed_at = null, updated_at = now()
    where user_id = target_user_id_value
      and urgent_deadline_email_sent_at is null
      and urgent_deadline_email_claimed_at = claimed_at_value;
  else
    raise exception 'invalid_registration_email_kind';
  end if;

  return found;
end;
$$;

revoke all on function public.claim_urgent_deadline_emails(integer)
  from public, anon, authenticated;
grant execute on function public.claim_urgent_deadline_emails(integer)
  to service_role;
