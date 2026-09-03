-- PUORCIPIAZZATI: contenuti editoriali gestiti dal pannello amministratore.
-- Migration incrementale: non modifica utenti, registrazioni o pagamenti.
-- NON viene applicata automaticamente.

begin;

create table if not exists public.editorial_articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null,
  category text not null,
  summary text not null,
  body text not null,
  fantasy_takeaway text,
  reliability text not null default 'in_evolution',
  image_path text,
  image_alt text,
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  constraint editorial_articles_title_check
    check (char_length(trim(title)) between 3 and 180),
  constraint editorial_articles_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint editorial_articles_category_check
    check (char_length(trim(category)) between 2 and 80),
  constraint editorial_articles_summary_check
    check (char_length(trim(summary)) between 10 and 500),
  constraint editorial_articles_body_check
    check (char_length(trim(body)) >= 20),
  constraint editorial_articles_reliability_check
    check (reliability in ('high', 'medium', 'in_evolution')),
  constraint editorial_articles_sources_check
    check (jsonb_typeof(sources) = 'array'),
  constraint editorial_articles_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint editorial_articles_published_at_check
    check (status <> 'published' or published_at is not null)
);

create unique index if not exists editorial_articles_slug_key
  on public.editorial_articles (slug);
create index if not exists editorial_articles_publication_idx
  on public.editorial_articles (status, featured desc, sort_order, published_at desc);

create table if not exists public.editorial_advice (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  matchday integer not null default 1,
  category text not null,
  subject text not null,
  reason text not null,
  match_label text,
  image_path text,
  image_alt text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  constraint editorial_advice_category_check
    check (category in ('start', 'avoid', 'differential', 'top', 'flop')),
  constraint editorial_advice_matchday_check
    check (matchday between 1 and 38),
  constraint editorial_advice_subject_check
    check (char_length(trim(subject)) between 2 and 120),
  constraint editorial_advice_reason_check
    check (char_length(trim(reason)) between 10 and 500),
  constraint editorial_advice_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint editorial_advice_published_at_check
    check (status <> 'published' or published_at is not null)
);

create index if not exists editorial_advice_publication_idx
  on public.editorial_advice (status, matchday, category, sort_order, published_at desc);

create or replace function public.set_editorial_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_editorial_articles_updated_at
  on public.editorial_articles;
create trigger set_editorial_articles_updated_at
before update on public.editorial_articles
for each row execute function public.set_editorial_updated_at();

drop trigger if exists set_editorial_advice_updated_at
  on public.editorial_advice;
create trigger set_editorial_advice_updated_at
before update on public.editorial_advice
for each row execute function public.set_editorial_updated_at();

alter table public.editorial_articles enable row level security;
alter table public.editorial_articles force row level security;
alter table public.editorial_advice enable row level security;
alter table public.editorial_advice force row level security;

revoke all on public.editorial_articles from anon, authenticated;
revoke all on public.editorial_advice from anon, authenticated;
grant select on public.editorial_articles to anon, authenticated;
grant select on public.editorial_advice to anon, authenticated;
grant insert, update, delete on public.editorial_articles to authenticated;
grant insert, update, delete on public.editorial_advice to authenticated;

drop policy if exists "Published articles are public"
  on public.editorial_articles;
create policy "Published articles are public"
on public.editorial_articles
for select
to anon, authenticated
using (status = 'published' and published_at <= now());

drop policy if exists "Admins can read every article"
  on public.editorial_articles;
create policy "Admins can read every article"
on public.editorial_articles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can create articles"
  on public.editorial_articles;
create policy "Admins can create articles"
on public.editorial_articles
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Admins can update articles"
  on public.editorial_articles;
create policy "Admins can update articles"
on public.editorial_articles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (
  public.is_admin(auth.uid())
  and updated_by = auth.uid()
);

drop policy if exists "Admins can delete articles"
  on public.editorial_articles;
create policy "Admins can delete articles"
on public.editorial_articles
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Published advice is public"
  on public.editorial_advice;
create policy "Published advice is public"
on public.editorial_advice
for select
to anon, authenticated
using (status = 'published' and published_at <= now());

drop policy if exists "Admins can read every advice item"
  on public.editorial_advice;
create policy "Admins can read every advice item"
on public.editorial_advice
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can create advice"
  on public.editorial_advice;
create policy "Admins can create advice"
on public.editorial_advice
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Admins can update advice"
  on public.editorial_advice;
create policy "Admins can update advice"
on public.editorial_advice
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (
  public.is_admin(auth.uid())
  and updated_by = auth.uid()
);

drop policy if exists "Admins can delete advice"
  on public.editorial_advice;
create policy "Admins can delete advice"
on public.editorial_advice
for delete
to authenticated
using (public.is_admin(auth.uid()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'editorial-images',
  'editorial-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Editorial images are public"
  on storage.objects;
create policy "Editorial images are public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'editorial-images');

drop policy if exists "Admins can upload editorial images"
  on storage.objects;
create policy "Admins can upload editorial images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'editorial-images'
  and public.is_admin(auth.uid())
);

drop policy if exists "Admins can update editorial images"
  on storage.objects;
create policy "Admins can update editorial images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'editorial-images'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'editorial-images'
  and public.is_admin(auth.uid())
);

drop policy if exists "Admins can delete editorial images"
  on storage.objects;
create policy "Admins can delete editorial images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'editorial-images'
  and public.is_admin(auth.uid())
);

commit;
