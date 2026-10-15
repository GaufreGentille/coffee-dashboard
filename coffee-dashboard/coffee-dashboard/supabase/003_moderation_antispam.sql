-- Kissa Soko : modération minimale et frein au spam.
-- Ce script est additif : aucun compte ni contenu existant n'est effacé.
alter table public.ks_reports add column if not exists status text not null default 'open';
alter table public.ks_reports add column if not exists resolved_at timestamptz;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ks_reports_status_allowed') then
    alter table public.ks_reports add constraint ks_reports_status_allowed check (status in ('open','reviewed','dismissed'));
  end if;
end $$;
create index if not exists ks_reports_status_created on public.ks_reports(status, created_at desc);

-- Seuls les modérateurs peuvent changer l'état d'un signalement.
create policy "moderateurs traitent signalements" on public.ks_reports
  for update to authenticated using (public.ks_is_moderator())
  with check (public.ks_is_moderator());
grant update(status,resolved_at) on public.ks_reports to authenticated;

-- Frein sur les publications : 1 sujet / 60 s et 12 sujets / 24 h.
-- Réponses : 1 / 12 s et 120 / 24 h. Le verrou réduit les courses concurrentes.
create or replace function public.ks_limit_contributions() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  t_last timestamptz;
  t_day bigint;
  v_is_topic boolean := TG_TABLE_NAME = 'ks_topics';
begin
  if new.author_id is distinct from (select auth.uid()) then
    raise exception 'Identité de publication invalide';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text, 9341));
  if v_is_topic then
    select max(created_at),count(*) filter (where created_at >= now() - interval '24 hours')
      into t_last,t_day from public.ks_topics where author_id = new.author_id;
    if t_last > now() - interval '60 seconds' or t_day >= 12 then
      raise exception 'Publication trop fréquente : merci de patienter avant de créer un autre sujet';
    end if;
  else
    select max(created_at),count(*) filter (where created_at >= now() - interval '24 hours')
      into t_last,t_day from public.ks_comments where author_id = new.author_id;
    if t_last > now() - interval '12 seconds' or t_day >= 120 then
      raise exception 'Réponses trop rapprochées : merci de patienter avant de répondre';
    end if;
  end if;
  return new;
end $$;

revoke all on function public.ks_limit_contributions() from public,anon,authenticated;
drop trigger if exists ks_limit_topic_posting on public.ks_topics;
create trigger ks_limit_topic_posting before insert on public.ks_topics
for each row execute function public.ks_limit_contributions();
drop trigger if exists ks_limit_comment_posting on public.ks_comments;
create trigger ks_limit_comment_posting before insert on public.ks_comments
for each row execute function public.ks_limit_contributions();
