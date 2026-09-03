create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  phone text not null,
  email text not null,
  team_name text not null,
  fantasy_username text not null,
  referral_code_used text,
  payment_method text not null,
  payment_status text not null default 'pending',
  registration_status text not null default 'pending',
  personal_referral_code text,
  privacy_accepted boolean not null,
  rules_accepted boolean not null,

  constraint registrations_payment_method_check
    check (payment_method in ('bank_transfer', 'cash')),
  constraint registrations_payment_status_check
    check (payment_status in ('pending', 'verified', 'rejected')),
  constraint registrations_registration_status_check
    check (registration_status in ('pending', 'confirmed', 'cancelled')),
  constraint registrations_privacy_accepted_check
    check (privacy_accepted is true),
  constraint registrations_rules_accepted_check
    check (rules_accepted is true)
);

alter table public.registrations enable row level security;
alter table public.registrations force row level security;

-- Restituisce l'email dell'utente corrente soltanto se confermata.
-- SECURITY DEFINER consente il controllo su auth.users senza esporre la tabella.
create function public.current_user_verified_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(users.email)
  from auth.users as users
  where users.id = (select auth.uid())
    and users.email_confirmed_at is not null
$$;

revoke all on function public.current_user_verified_email() from public;
revoke all on function public.current_user_verified_email() from anon;
grant execute on function public.current_user_verified_email() to authenticated;

-- Nessun accesso alla tabella è concesso ai visitatori anonimi.
revoke all on table public.registrations from anon, authenticated;

-- Gli utenti autenticati possono leggere soltanto tramite la policy RLS.
grant select on table public.registrations to authenticated;

-- Gli utenti autenticati possono inserire solo i campi compilabili.
-- Stati, date automatiche e personal_referral_code non sono impostabili dal client.
grant insert (
  user_id,
  first_name,
  last_name,
  birth_date,
  phone,
  email,
  team_name,
  fantasy_username,
  referral_code_used,
  payment_method,
  privacy_accepted,
  rules_accepted
) on table public.registrations to authenticated;

create policy "Verified users can create their own registration"
on public.registrations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and lower(email) = public.current_user_verified_email()
  and payment_status = 'pending'
  and registration_status = 'pending'
  and personal_referral_code is null
  and privacy_accepted is true
  and rules_accepted is true
);

create policy "Users can read only their own registration"
on public.registrations
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_user_verified_email() is not null
);

-- Non vengono create policy UPDATE o DELETE per gli utenti.
-- Il vincolo UNIQUE su user_id garantisce una sola richiesta per account.
