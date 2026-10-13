-- Kissa Soko · Communauté + Veille visuelle
-- À exécuter dans le SQL Editor du projet Supabase (une seule fois).
-- Lecture publique, écriture uniquement sous identité Supabase authentifiée.
create extension if not exists pgcrypto;

create table if not exists public.ks_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 32),
  created_at timestamptz not null default now()
);
alter table public.ks_profiles enable row level security;
create policy "profils publics" on public.ks_profiles for select to anon, authenticated using (true);
create policy "modifier son profil" on public.ks_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function public.ks_create_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.ks_profiles (id, display_name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Membre ' || left(new.id::text, 8)), 32))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists ks_after_signup on auth.users;
create trigger ks_after_signup after insert on auth.users
for each row execute function public.ks_create_profile();
-- Utilisateurs préexistants, le cas échéant.
insert into public.ks_profiles(id, display_name)
select id, 'Membre ' || left(id::text, 8) from auth.users
on conflict(id) do nothing;

create table if not exists public.ks_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.ks_moderators enable row level security;
-- Uniquement attribuable depuis le SQL Editor / service role.
create or replace function public.ks_is_moderator() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists(select 1 from public.ks_moderators where user_id = (select auth.uid()));
$$;
revoke all on function public.ks_is_moderator() from public;
grant execute on function public.ks_is_moderator() to authenticated;

create table if not exists public.ks_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.ks_profiles(id) on delete restrict,
  category text not null check (category in ('discussion','questions','extraction','torrefaction','origines','materiel')),
  title text not null check (char_length(trim(title)) between 8 and 140),
  body text not null check (char_length(trim(body)) between 10 and 10000),
  created_at timestamptz not null default now(),
  locked boolean not null default false
);
create index if not exists ks_topics_created on public.ks_topics(created_at desc);
alter table public.ks_topics enable row level security;
create policy "sujets lisibles par tous" on public.ks_topics for select to anon, authenticated using (true);
create policy "sujet par son auteur" on public.ks_topics for insert to authenticated
  with check (author_id = (select auth.uid()) and locked = false);
create policy "retirer son sujet ou moderer" on public.ks_topics for delete to authenticated
  using (author_id = (select auth.uid()) or public.ks_is_moderator());
-- Pas de policy UPDATE : ni auteur ni client ne peuvent verrouiller un sujet.

create table if not exists public.ks_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.ks_topics(id) on delete cascade,
  author_id uuid not null references public.ks_profiles(id) on delete restrict,
  parent_id uuid references public.ks_comments(id) on delete set null,
  body text not null check (char_length(trim(body)) between 2 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists ks_comments_topic on public.ks_comments(topic_id, created_at);
alter table public.ks_comments enable row level security;
create policy "reponses publiques" on public.ks_comments for select to anon, authenticated using (true);
create policy "reponse par son auteur" on public.ks_comments for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "supprimer sa reponse ou moderer" on public.ks_comments for delete to authenticated
  using (author_id = (select auth.uid()) or public.ks_is_moderator());

create or replace function public.ks_check_comment() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if (select locked from public.ks_topics where id = new.topic_id) then
    raise exception 'Discussion verrouillée';
  end if;
  if new.parent_id is not null and not exists (
    select 1 from public.ks_comments where id = new.parent_id and topic_id = new.topic_id
  ) then raise exception 'Réponse parente invalide'; end if;
  return new;
end;
$$;
drop trigger if exists ks_comment_guard on public.ks_comments;
create trigger ks_comment_guard before insert on public.ks_comments
for each row execute function public.ks_check_comment();

create table if not exists public.ks_topic_votes (
  topic_id uuid not null references public.ks_topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  direction smallint not null check (direction in (-1,1)),
  primary key(topic_id, user_id)
);
alter table public.ks_topic_votes enable row level security;
create policy "son propre vote seulement" on public.ks_topic_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "voter pour soi" on public.ks_topic_votes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "modifier son vote" on public.ks_topic_votes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "annuler son vote" on public.ks_topic_votes for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.ks_watch_votes (
  post_id text not null check (char_length(post_id) between 5 and 120),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction smallint not null check (direction in (-1,1)),
  primary key(post_id, user_id)
);
alter table public.ks_watch_votes enable row level security;
create policy "consulter son vote veille" on public.ks_watch_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "voter veille" on public.ks_watch_votes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "modifier vote veille" on public.ks_watch_votes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "retirer vote veille" on public.ks_watch_votes for delete to authenticated using (user_id = (select auth.uid()));

-- Compteurs agrégés sans exposer les identifiants des personnes ayant voté.
create or replace function public.ks_topic_stats()
returns table(topic_id uuid, score bigint, ups bigint, downs bigint, comments bigint, mine integer)
language sql stable security definer set search_path = ''
as $$
  select t.id,
    coalesce(v.ups,0)-coalesce(v.downs,0),
    coalesce(v.ups,0), coalesce(v.downs,0), coalesce(c.n,0),
    coalesce(v.mine,0)::integer
  from public.ks_topics t
  left join lateral (
    select count(*) filter(where direction=1) as ups,
           count(*) filter(where direction=-1) as downs,
           max(direction) filter(where user_id = (select auth.uid())) as mine
    from public.ks_topic_votes where topic_id=t.id
  ) v on true
  left join lateral (select count(*) as n from public.ks_comments where topic_id=t.id) c on true;
$$;
create or replace function public.ks_watch_stats()
returns table(post_id text, ups bigint, downs bigint, mine integer)
language sql stable security definer set search_path = ''
as $$
  select v.post_id,
    count(*) filter(where v.direction=1),
    count(*) filter(where v.direction=-1),
    coalesce(max(v.direction) filter(where v.user_id = (select auth.uid())),0)::integer
  from public.ks_watch_votes v group by v.post_id;
$$;
revoke all on function public.ks_topic_stats() from public;
revoke all on function public.ks_watch_stats() from public;
grant execute on function public.ks_topic_stats() to anon, authenticated;
grant execute on function public.ks_watch_stats() to anon, authenticated;

create table if not exists public.ks_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.ks_topics(id) on delete cascade,
  comment_id uuid references public.ks_comments(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  created_at timestamptz not null default now(),
  constraint ks_report_one_target check ((topic_id is null) <> (comment_id is null)),
  unique(reporter_id, topic_id, comment_id)
);
create unique index if not exists ks_report_topic_one_per_member
  on public.ks_reports(reporter_id,topic_id) where topic_id is not null;
create unique index if not exists ks_report_comment_one_per_member
  on public.ks_reports(reporter_id,comment_id) where comment_id is not null;
alter table public.ks_reports enable row level security;
create policy "signaler en etant membre" on public.ks_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "moderateurs voient signalements" on public.ks_reports for select to authenticated
  using (public.ks_is_moderator());

-- Limite les privilèges : le client ne peut modifier l'identité ni les droits des autres.
revoke all on public.ks_moderators from anon, authenticated;
grant select on public.ks_profiles, public.ks_topics, public.ks_comments to anon, authenticated;
grant update(display_name) on public.ks_profiles to authenticated;
grant insert on public.ks_topics, public.ks_comments, public.ks_reports to authenticated;
grant delete on public.ks_topics, public.ks_comments to authenticated;
grant select, insert, update, delete on public.ks_topic_votes, public.ks_watch_votes to authenticated;
-- Le champ locked ne sera modifiable que via intervention de modération côté serveur.

-- Durcissement exécuté lors de la première installation :
-- Ne pas rendre ces fonctions internes appelables via l'API publique.
revoke execute on function public.ks_create_profile() from public, anon, authenticated;
revoke execute on function public.ks_is_moderator() from public, anon;
grant execute on function public.ks_is_moderator() to authenticated;
-- Statistiques publiques intentionnelles (agrégats uniquement).
revoke execute on function public.ks_topic_stats() from public;
revoke execute on function public.ks_watch_stats() from public;
grant execute on function public.ks_topic_stats() to anon, authenticated;
grant execute on function public.ks_watch_stats() to anon, authenticated;

-- Déclencheur de contrôle des commentaires, non appelé directement.
revoke execute on function public.ks_check_comment() from public, anon, authenticated;
