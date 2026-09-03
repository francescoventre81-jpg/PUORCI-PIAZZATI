-- PUORCIPIAZZATI: schede giocatore e collegamento con le news.
-- Migration incrementale. NON viene applicata automaticamente.

begin;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  slug text not null unique,
  display_name text not null,
  team_name text not null,
  role text not null,
  birth_date date,
  shirt_number integer,
  photo_path text,
  fantasy_advice text,
  status text not null default 'draft',
  constraint players_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint players_role_check check (role in ('goalkeeper', 'defender', 'midfielder', 'forward')),
  constraint players_shirt_number_check check (shirt_number is null or shirt_number between 1 and 99),
  constraint players_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.editorial_article_players (
  article_id uuid not null references public.editorial_articles(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  primary key (article_id, player_id)
);

alter table public.players enable row level security;
alter table public.players force row level security;
alter table public.editorial_article_players enable row level security;
alter table public.editorial_article_players force row level security;

grant select on public.players, public.editorial_article_players to anon, authenticated;
grant insert, update, delete on public.players, public.editorial_article_players to authenticated;

create policy "Published players are public" on public.players
for select to anon, authenticated using (status = 'published');
create policy "Admins manage players" on public.players
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Published player news links are public" on public.editorial_article_players
for select to anon, authenticated
using (
  exists (select 1 from public.players p where p.id = player_id and p.status = 'published')
  and exists (select 1 from public.editorial_articles a where a.id = article_id and a.status = 'published' and a.published_at <= now())
);
create policy "Admins manage player news links" on public.editorial_article_players
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create trigger set_players_updated_at
before update on public.players
for each row execute function public.set_editorial_updated_at();

commit;
