-- FANTAPUORCI: pagamenti, ritiri contanti, referral e premi.
-- Questa migration è incrementale e richiede 001_create_registrations.sql.
-- NON viene applicata automaticamente.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.registration_pricing_tier(
  calculated_at timestamptz default now()
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when calculated_at < timestamptz '2026-08-11 00:00:00+02'
      then 'early_bird'
    else 'standard'
  end;
$$;

create or replace function public.registration_amount_due_cents(
  calculated_at timestamptz default now()
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when calculated_at < timestamptz '2026-08-11 00:00:00+02'
      then 3500
    else 4000
  end;
$$;

revoke all on function public.registration_pricing_tier(timestamptz)
from public, anon, authenticated;
revoke all on function public.registration_amount_due_cents(timestamptz)
from public, anon, authenticated;
grant execute on function public.registration_pricing_tier(timestamptz)
to service_role;
grant execute on function public.registration_amount_due_cents(timestamptz)
to service_role;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin(candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = candidate_user_id
      and (
        auth.uid() = candidate_user_id
        or auth.role() = 'service_role'
      )
  );
$$;

revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

alter table public.registrations
  drop constraint if exists registrations_payment_method_check,
  drop constraint if exists registrations_payment_status_check,
  drop constraint if exists registrations_registration_status_check;

update public.registrations
set payment_method = 'instant_bank_transfer'
where payment_method = 'bank_transfer';

update public.registrations
set payment_status = 'paid'
where payment_status = 'verified';

alter table public.registrations
  add column if not exists amount_due_cents integer not null
    default public.registration_amount_due_cents(now()),
  add column if not exists amount_paid_cents integer,
  add column if not exists currency text not null default 'EUR',
  add column if not exists pricing_tier text not null
    default public.registration_pricing_tier(now()),
  add column if not exists price_calculated_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists paid_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid references auth.users(id) on delete set null,
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists legacy_payment_data boolean not null default false,
  add column if not exists bank_transfer_reference text,
  add column if not exists bank_transfer_cro_trn text,
  add column if not exists bank_transfer_declared_at date,
  add column if not exists bank_transfer_verified_at timestamptz,
  add column if not exists bank_transfer_receipt_path text,
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists cash_pickup_status text,
  add column if not exists cash_city text,
  add column if not exists cash_province text,
  add column if not exists cash_postal_code text,
  add column if not exists cash_address text,
  add column if not exists cash_street_number text,
  add column if not exists cash_locality text,
  add column if not exists cash_notes text,
  add column if not exists cash_preferred_times text,
  add column if not exists cash_contact_phone text,
  add column if not exists cash_scheduled_at timestamptz,
  add column if not exists cash_scheduled_time_window text,
  add column if not exists cash_schedule_notes text,
  add column if not exists cash_assigned_organizer text;

-- Le eventuali richieste create con la versione precedente non avevano ancora
-- tutti i dettagli bancari/di ritiro. Restano consultabili ma non sono
-- considerate nuove richieste conformi al flusso corrente.
update public.registrations
set
  legacy_payment_data = true,
  amount_due_cents = public.registration_amount_due_cents(created_at),
  pricing_tier = public.registration_pricing_tier(created_at),
  price_calculated_at = created_at;

update public.registrations
set
  registration_status = 'confirmed',
  paid_at = coalesce(paid_at, created_at),
  payment_confirmed_at = coalesce(payment_confirmed_at, paid_at, created_at),
  amount_paid_cents = coalesce(amount_paid_cents, amount_due_cents)
where payment_status = 'paid';

update public.registrations
set registration_status = 'pending'
where payment_status <> 'paid'
  and registration_status = 'confirmed';

do $$
declare
  registration_record record;
  generated_code text;
begin
  for registration_record in
    select id
    from public.registrations
    where payment_status = 'paid'
      and personal_referral_code is null
  loop
    loop
      generated_code :=
        'FP-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 6));
      exit when not exists (
        select 1
        from public.registrations
        where personal_referral_code = generated_code
      );
    end loop;

    update public.registrations
    set personal_referral_code = generated_code
    where id = registration_record.id;
  end loop;
end;
$$;

alter table public.registrations
  add constraint registrations_payment_method_check
    check (payment_method in ('paypal', 'instant_bank_transfer', 'cash')),
  add constraint registrations_payment_status_check
    check (payment_status in ('pending', 'paid', 'rejected')),
  add constraint registrations_registration_status_check
    check (registration_status in ('pending', 'confirmed', 'cancelled')),
  add constraint registrations_amounts_check
    check (
      amount_due_cents in (3500, 4000)
      and (amount_paid_cents is null or amount_paid_cents > 0)
      and currency = 'EUR'
      and pricing_tier in ('early_bird', 'standard')
      and (
        legacy_payment_data is true
        or (pricing_tier = 'early_bird' and amount_due_cents = 3500)
        or (pricing_tier = 'standard' and amount_due_cents = 4000)
      )
    ),
  add constraint registrations_paid_state_check
    check (
      (payment_status = 'paid'
        and registration_status = 'confirmed'
        and paid_at is not null
        and payment_confirmed_at is not null
        and amount_paid_cents is not null
        and amount_paid_cents >= amount_due_cents
        and personal_referral_code is not null)
      or
      (payment_status <> 'paid'
        and registration_status <> 'confirmed'
        and paid_at is null
        and payment_confirmed_at is null
        and amount_paid_cents is null)
    ),
  add constraint registrations_payment_details_check
    check (
      legacy_payment_data is true
      or
      (payment_method = 'paypal'
        and bank_transfer_reference is null
        and cash_pickup_status is null)
      or
      (payment_method = 'instant_bank_transfer'
        and bank_transfer_reference is not null
        and cash_pickup_status is null)
      or
      (payment_method = 'cash'
        and cash_pickup_status is not null
        and cash_city is not null
        and cash_province is not null
        and cash_postal_code is not null
        and cash_address is not null
        and cash_street_number is not null
        and cash_preferred_times is not null
        and cash_contact_phone is not null)
    ),
  add constraint registrations_cash_pickup_status_check
    check (
      cash_pickup_status is null
      or cash_pickup_status in (
        'requested',
        'approved',
        'rejected',
        'scheduled',
        'collected',
        'cancelled'
      )
    );

create unique index if not exists registrations_bank_transfer_reference_key
  on public.registrations (bank_transfer_reference)
  where bank_transfer_reference is not null;

create unique index if not exists registrations_paypal_order_id_key
  on public.registrations (paypal_order_id)
  where paypal_order_id is not null;

create unique index if not exists registrations_paypal_capture_id_key
  on public.registrations (paypal_capture_id)
  where paypal_capture_id is not null;

create unique index if not exists registrations_personal_referral_code_key
  on public.registrations (personal_referral_code)
  where personal_referral_code is not null;

create index if not exists registrations_referral_code_used_idx
  on public.registrations (upper(referral_code_used))
  where referral_code_used is not null;

create index if not exists registrations_payment_review_idx
  on public.registrations (payment_method, payment_status, cash_pickup_status, created_at);

create table if not exists public.payment_audit_log (
  id bigint generated always as identity primary key,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  action text not null,
  previous_payment_status text,
  new_payment_status text,
  previous_registration_status text,
  new_registration_status text,
  previous_cash_pickup_status text,
  new_cash_pickup_status text,
  performed_by uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.payment_audit_log enable row level security;
alter table public.payment_audit_log force row level security;
revoke all on public.payment_audit_log from anon, authenticated;

create table if not exists public.paypal_webhook_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

alter table public.paypal_webhook_events enable row level security;
alter table public.paypal_webhook_events force row level security;
revoke all on public.paypal_webhook_events from anon, authenticated;

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  owner_registration_id uuid not null unique
    references public.registrations(id) on delete cascade,
  reward_code text not null unique,
  unlocked_at timestamptz not null default now(),
  congratulations_email_sent_at timestamptz,
  delivered_at timestamptz,
  delivered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint referral_rewards_delivery_check check (
    (delivered_at is null and delivered_by is null)
    or (delivered_at is not null and delivered_by is not null)
  )
);

alter table public.referral_rewards enable row level security;
alter table public.referral_rewards force row level security;
revoke all on public.referral_rewards from anon, authenticated;

drop policy if exists "Verified users can create their registration" on public.registrations;

revoke all on public.registrations from anon;
revoke all on public.registrations from authenticated;

grant select (
  id,
  created_at,
  updated_at,
  first_name,
  last_name,
  birth_date,
  phone,
  email,
  team_name,
  fantasy_username,
  referral_code_used,
  payment_method,
  payment_status,
  registration_status,
  personal_referral_code,
  amount_due_cents,
  amount_paid_cents,
  currency,
  pricing_tier,
  price_calculated_at,
  paid_at,
  payment_confirmed_at,
  bank_transfer_reference,
  bank_transfer_cro_trn,
  bank_transfer_declared_at,
  paypal_order_id,
  cash_pickup_status,
  cash_scheduled_at,
  cash_scheduled_time_window,
  cash_schedule_notes,
  confirmation_email_sent_at
) on public.registrations to authenticated;

create or replace function public.set_registration_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_registrations_updated_at on public.registrations;
create trigger set_registrations_updated_at
before update on public.registrations
for each row execute function public.set_registration_updated_at();

create or replace function public.protect_confirmed_registration_price()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.payment_status = 'paid' and (
    new.amount_due_cents is distinct from old.amount_due_cents
    or new.amount_paid_cents is distinct from old.amount_paid_cents
    or new.currency is distinct from old.currency
    or new.pricing_tier is distinct from old.pricing_tier
    or new.price_calculated_at is distinct from old.price_calculated_at
    or new.payment_confirmed_at is distinct from old.payment_confirmed_at
  ) then
    raise exception 'confirmed_pricing_is_immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_confirmed_registration_price
on public.registrations;
create trigger protect_confirmed_registration_price
before update on public.registrations
for each row execute function public.protect_confirmed_registration_price();

create or replace function public.finalize_registration_payment(
  target_registration_id uuid,
  confirmation_source text,
  confirming_admin_id uuid default null,
  provider_order_id text default null,
  provider_capture_id text default null,
  confirmed_amount_cents integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_registration public.registrations%rowtype;
  inviter_registration_id uuid;
  confirmed_referrals integer := 0;
  generated_referral_code text;
  generated_reward_code text;
  unlocked_reward public.referral_rewards%rowtype;
  reward_created boolean := false;
begin
  select *
  into target_registration
  from public.registrations
  where id = target_registration_id
  for update;

  if not found then
    raise exception 'registration_not_found';
  end if;

  if confirmation_source not in ('paypal_webhook', 'bank_admin', 'cash_admin') then
    raise exception 'invalid_confirmation_source';
  end if;

  if confirmation_source = 'paypal_webhook'
     and target_registration.payment_method <> 'paypal' then
    raise exception 'payment_method_mismatch';
  end if;

  if confirmation_source = 'bank_admin'
     and target_registration.payment_method <> 'instant_bank_transfer' then
    raise exception 'payment_method_mismatch';
  end if;

  if confirmation_source = 'cash_admin'
     and target_registration.payment_method <> 'cash' then
    raise exception 'payment_method_mismatch';
  end if;

  if confirmation_source in ('bank_admin', 'cash_admin')
     and not public.is_admin(confirming_admin_id) then
    raise exception 'administrator_required';
  end if;

  if target_registration.payment_status = 'paid' then
    select *
    into unlocked_reward
    from public.referral_rewards
    where owner_registration_id = target_registration.id;

    return jsonb_build_object(
      'registration_id', target_registration.id,
      'referral_code', target_registration.personal_referral_code,
      'reward_code', unlocked_reward.reward_code,
      'reward_created', false,
      'already_confirmed', true
    );
  end if;

  if confirmed_amount_cents is null
     or confirmed_amount_cents < target_registration.amount_due_cents then
    raise exception 'insufficient_payment_amount';
  end if;

  if confirmation_source = 'paypal_webhook'
     and confirmed_amount_cents <> target_registration.amount_due_cents then
    raise exception 'paypal_amount_mismatch';
  end if;

  loop
    generated_referral_code :=
      'FP-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (
      select 1
      from public.registrations
      where personal_referral_code = generated_referral_code
    );
  end loop;

  update public.registrations
  set
    payment_status = 'paid',
    registration_status = 'confirmed',
    paid_at = now(),
    payment_confirmed_at = now(),
    amount_paid_cents = confirmed_amount_cents,
    payment_confirmed_by = confirming_admin_id,
    personal_referral_code = generated_referral_code,
    paypal_order_id = coalesce(provider_order_id, paypal_order_id),
    paypal_capture_id = coalesce(provider_capture_id, paypal_capture_id),
    cash_pickup_status = case
      when confirmation_source = 'cash_admin' then 'collected'
      else cash_pickup_status
    end
  where id = target_registration.id;

  insert into public.payment_audit_log (
    registration_id,
    action,
    previous_payment_status,
    new_payment_status,
    previous_registration_status,
    new_registration_status,
    previous_cash_pickup_status,
    new_cash_pickup_status,
    performed_by,
    details
  ) values (
    target_registration.id,
    confirmation_source,
    target_registration.payment_status,
    'paid',
    target_registration.registration_status,
    'confirmed',
    target_registration.cash_pickup_status,
    case
      when confirmation_source = 'cash_admin' then 'collected'
      else target_registration.cash_pickup_status
    end,
    confirming_admin_id,
    jsonb_build_object(
      'provider_order_id', provider_order_id,
      'provider_capture_id', provider_capture_id,
      'amount_due_cents', target_registration.amount_due_cents,
      'amount_paid_cents', confirmed_amount_cents,
      'pricing_tier', target_registration.pricing_tier
    )
  );

  if nullif(trim(target_registration.referral_code_used), '') is not null then
    select id
    into inviter_registration_id
    from public.registrations
    where upper(personal_referral_code) =
      upper(trim(target_registration.referral_code_used))
      and payment_status = 'paid'
      and registration_status = 'confirmed'
    limit 1;
  end if;

  if inviter_registration_id is not null then
    select count(*)::integer
    into confirmed_referrals
    from public.registrations invited
    join public.registrations inviter
      on inviter.id = inviter_registration_id
    where upper(trim(invited.referral_code_used)) =
      upper(inviter.personal_referral_code)
      and invited.payment_status = 'paid'
      and invited.registration_status = 'confirmed';

    if confirmed_referrals >= 5
       and not exists (
         select 1
         from public.referral_rewards
         where owner_registration_id = inviter_registration_id
       ) then
      loop
        generated_reward_code :=
          'MAGLIA-' ||
          upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 8));
        exit when not exists (
          select 1
          from public.referral_rewards
          where reward_code = generated_reward_code
        );
      end loop;

      insert into public.referral_rewards (
        owner_registration_id,
        reward_code
      ) values (
        inviter_registration_id,
        generated_reward_code
      )
      on conflict (owner_registration_id) do nothing
      returning * into unlocked_reward;

      reward_created := found;
    end if;
  end if;

  return jsonb_build_object(
    'registration_id', target_registration.id,
    'referral_code', generated_referral_code,
    'reward_code', unlocked_reward.reward_code,
    'reward_owner_registration_id', inviter_registration_id,
    'reward_created', reward_created,
    'already_confirmed', false
  );
end;
$$;

revoke all on function public.finalize_registration_payment(
  uuid, text, uuid, text, text, integer
) from public, anon, authenticated;
grant execute on function public.finalize_registration_payment(
  uuid, text, uuid, text, text, integer
) to service_role;

create or replace function public.review_bank_transfer(
  target_registration_id uuid,
  confirming_admin_id uuid,
  approve_payment boolean,
  confirmed_amount_cents integer default null,
  verified_payment_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_registration public.registrations%rowtype;
begin
  if not public.is_admin(confirming_admin_id) then
    raise exception 'administrator_required';
  end if;

  select *
  into target_registration
  from public.registrations
  where id = target_registration_id
  for update;

  if not found or target_registration.payment_method <> 'instant_bank_transfer' then
    raise exception 'bank_registration_not_found';
  end if;

  if approve_payment then
    if confirmed_amount_cents is null or verified_payment_at is null then
      raise exception 'verified_bank_details_required';
    end if;

    update public.registrations
    set
      amount_due_cents =
        public.registration_amount_due_cents(verified_payment_at),
      pricing_tier = public.registration_pricing_tier(verified_payment_at),
      price_calculated_at = now(),
      bank_transfer_verified_at = verified_payment_at
    where id = target_registration_id;

    return public.finalize_registration_payment(
      target_registration_id,
      'bank_admin',
      confirming_admin_id,
      null,
      null,
      confirmed_amount_cents
    );
  end if;

  if target_registration.payment_status = 'paid' then
    raise exception 'paid_registration_cannot_be_rejected';
  end if;

  update public.registrations
  set payment_status = 'rejected'
  where id = target_registration_id;

  insert into public.payment_audit_log (
    registration_id,
    action,
    previous_payment_status,
    new_payment_status,
    previous_registration_status,
    new_registration_status,
    performed_by
  ) values (
    target_registration_id,
    'bank_rejected',
    target_registration.payment_status,
    'rejected',
    target_registration.registration_status,
    target_registration.registration_status,
    confirming_admin_id
  );

  return jsonb_build_object('registration_id', target_registration_id);
end;
$$;

revoke all on function public.review_bank_transfer(
  uuid, uuid, boolean, integer, timestamptz
)
from public, anon, authenticated;
grant execute on function public.review_bank_transfer(
  uuid, uuid, boolean, integer, timestamptz
)
to service_role;

create or replace function public.update_cash_pickup(
  target_registration_id uuid,
  confirming_admin_id uuid,
  next_status text,
  scheduled_at_value timestamptz default null,
  scheduled_time_window_value text default null,
  schedule_notes_value text default null,
  assigned_organizer_value text default null,
  confirmed_amount_cents integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_registration public.registrations%rowtype;
begin
  if not public.is_admin(confirming_admin_id) then
    raise exception 'administrator_required';
  end if;

  select *
  into target_registration
  from public.registrations
  where id = target_registration_id
  for update;

  if not found or target_registration.payment_method <> 'cash' then
    raise exception 'cash_registration_not_found';
  end if;

  if next_status not in (
    'approved', 'rejected', 'scheduled', 'collected', 'cancelled'
  ) then
    raise exception 'invalid_cash_pickup_status';
  end if;

  if target_registration.payment_status = 'paid' and next_status <> 'collected' then
    raise exception 'paid_registration_cannot_change_pickup_status';
  end if;

  if next_status = 'scheduled' and (
    scheduled_at_value is null
    or nullif(trim(scheduled_time_window_value), '') is null
    or nullif(trim(assigned_organizer_value), '') is null
  ) then
    raise exception 'cash_schedule_details_required';
  end if;

  if next_status = 'collected' then
    if target_registration.cash_pickup_status not in ('approved', 'scheduled') then
      raise exception 'cash_pickup_must_be_approved_before_collection';
    end if;

    if confirmed_amount_cents is null
       or confirmed_amount_cents <>
         public.registration_amount_due_cents(now()) then
      raise exception 'cash_amount_mismatch';
    end if;

    update public.registrations
    set
      amount_due_cents = public.registration_amount_due_cents(now()),
      pricing_tier = public.registration_pricing_tier(now()),
      price_calculated_at = now()
    where id = target_registration_id;

    return public.finalize_registration_payment(
      target_registration_id,
      'cash_admin',
      confirming_admin_id,
      null,
      null,
      confirmed_amount_cents
    );
  end if;

  update public.registrations
  set
    cash_pickup_status = next_status,
    registration_status = case
      when next_status = 'cancelled' then 'cancelled'
      else registration_status
    end,
    cash_scheduled_at = case
      when next_status = 'scheduled' then scheduled_at_value
      else cash_scheduled_at
    end,
    cash_scheduled_time_window = case
      when next_status = 'scheduled' then scheduled_time_window_value
      else cash_scheduled_time_window
    end,
    cash_schedule_notes = case
      when next_status = 'scheduled' then schedule_notes_value
      else cash_schedule_notes
    end,
    cash_assigned_organizer = case
      when next_status = 'scheduled' then assigned_organizer_value
      else cash_assigned_organizer
    end
  where id = target_registration_id;

  insert into public.payment_audit_log (
    registration_id,
    action,
    previous_payment_status,
    new_payment_status,
    previous_registration_status,
    new_registration_status,
    previous_cash_pickup_status,
    new_cash_pickup_status,
    performed_by,
    details
  ) values (
    target_registration_id,
    'cash_' || next_status,
    target_registration.payment_status,
    target_registration.payment_status,
    target_registration.registration_status,
    case
      when next_status = 'cancelled' then 'cancelled'
      else target_registration.registration_status
    end,
    target_registration.cash_pickup_status,
    next_status,
    confirming_admin_id,
    jsonb_build_object(
      'scheduled_at', scheduled_at_value,
      'time_window', scheduled_time_window_value,
      'notes', schedule_notes_value,
      'assigned_organizer', assigned_organizer_value
    )
  );

  return jsonb_build_object(
    'registration_id', target_registration_id,
    'cash_pickup_status', next_status
  );
end;
$$;

revoke all on function public.update_cash_pickup(
  uuid, uuid, text, timestamptz, text, text, text, integer
) from public, anon, authenticated;
grant execute on function public.update_cash_pickup(
  uuid, uuid, text, timestamptz, text, text, text, integer
) to service_role;

create or replace function public.get_my_referral_summary()
returns table (
  confirmed_friends integer,
  pending_requests integer,
  reward_unlocked boolean,
  reward_code text,
  reward_unlocked_at timestamptz,
  reward_delivered_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with owner as (
    select id, personal_referral_code
    from public.registrations
    where user_id = auth.uid()
    limit 1
  ),
  counts as (
    select
      count(*) filter (
        where invited.payment_status = 'paid'
          and invited.registration_status = 'confirmed'
      )::integer as confirmed_friends,
      count(*) filter (
        where invited.payment_status <> 'paid'
          or invited.registration_status <> 'confirmed'
      )::integer as pending_requests
    from owner
    left join public.registrations invited
      on upper(trim(invited.referral_code_used)) =
        upper(owner.personal_referral_code)
      and owner.personal_referral_code is not null
  )
  select
    coalesce(counts.confirmed_friends, 0),
    coalesce(counts.pending_requests, 0),
    reward.id is not null,
    reward.reward_code,
    reward.unlocked_at,
    reward.delivered_at
  from counts
  left join owner on true
  left join public.referral_rewards reward
    on reward.owner_registration_id = owner.id;
$$;

revoke all on function public.get_my_referral_summary() from public, anon;
grant execute on function public.get_my_referral_summary() to authenticated;

create or replace function public.mark_reward_delivered(
  target_reward_id uuid,
  confirming_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin(confirming_admin_id) then
    raise exception 'administrator_required';
  end if;

  update public.referral_rewards
  set
    delivered_at = now(),
    delivered_by = confirming_admin_id
  where id = target_reward_id
    and delivered_at is null;

  if not found then
    raise exception 'reward_not_found_or_already_delivered';
  end if;
end;
$$;

revoke all on function public.mark_reward_delivered(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.mark_reward_delivered(uuid, uuid)
to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'registration-receipts',
  'registration-receipts',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their bank receipt" on storage.objects;
create policy "Users can upload their bank receipt"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'registration-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.registrations
    where user_id = auth.uid()
      and payment_method = 'instant_bank_transfer'
      and payment_status = 'pending'
  )
);

drop policy if exists "Admins can read bank receipts" on storage.objects;
create policy "Admins can read bank receipts"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'registration-receipts'
  and public.is_admin(auth.uid())
);
