-- Tracciamento interno dell'annullamento dell'edizione e dei rimborsi.
-- Non esegue alcun rimborso e non invia email.

alter table public.registrations
  add column if not exists refund_status text,
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_method text,
  add column if not exists edition_cancellation_email_claimed_at timestamptz,
  add column if not exists edition_cancellation_email_sent_at timestamptz;

alter table public.registrations
  drop constraint if exists registrations_refund_status_check,
  drop constraint if exists registrations_refund_method_check,
  drop constraint if exists registrations_refund_consistency_check;

alter table public.registrations
  add constraint registrations_refund_status_check
    check (
      refund_status is null
      or refund_status in ('refund_pending', 'refund_completed')
    ),
  add constraint registrations_refund_method_check
    check (
      refund_method is null
      or refund_method in ('paypal', 'instant_bank_transfer', 'cash')
    ),
  add constraint registrations_refund_consistency_check
    check (
      (refund_status is null and refunded_at is null)
      or
      (
        refund_status = 'refund_pending'
        and refunded_at is null
        and refund_method is not null
      )
      or
      (
        refund_status = 'refund_completed'
        and refunded_at is not null
        and refund_method is not null
      )
    );

create index if not exists registrations_refund_status_idx
  on public.registrations (refund_status, refund_method)
  where refund_status is not null;

-- I nuovi campi restano non accessibili ai ruoli browser.
-- Le operazioni sono eseguite esclusivamente dal server con RLS già attiva.
