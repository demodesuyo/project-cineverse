-- Project CINEVERSE / Jishu Eiga Net
-- Public movie database foundation. Run this migration with the Supabase CLI
-- or in the SQL editor before configuring the static site.

create extension if not exists pgcrypto;

create type public.movie_status as enum ('draft', 'review', 'ready', 'published', 'archived');
create type public.editorial_status as enum ('unreviewed', 'needs_review', 'reviewed', 'approved');
create type public.processing_status as enum ('not_started', 'processing', 'completed', 'reviewed', 'failed');
create type public.permission_status as enum ('not_started', 'contact_pending', 'contacted', 'granted', 'denied', 'expired', 'revoked');
create type public.content_status as enum ('draft', 'review', 'published', 'archived');
create type public.article_type as enum ('feature', 'essay', 'making', 'news');
create type public.source_platform as enum ('youtube', 'vimeo', 'official_site', 'other');
create type public.discovery_review_status as enum ('new', 'screening', 'rejected', 'promoted');

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  code varchar(3) not null unique check (code = upper(code) and code ~ '^[A-Z]{2,3}$'),
  name_ja text not null,
  name_en text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  flag_emoji text,
  created_at timestamptz not null default now()
);

create table public.directors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_original text,
  country_id uuid references public.countries(id) on delete set null,
  bio_ja text,
  bio_original text,
  photo_url text,
  official_website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A separate table keeps social platforms extensible without exposing contact data.
create table public.director_social_links (
  id uuid primary key default gen_random_uuid(),
  director_id uuid not null references public.directors(id) on delete cascade,
  platform text not null,
  url text not null,
  created_at timestamptz not null default now(),
  unique (director_id, platform, url)
);

create table public.genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_ja text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_ja text not null,
  name_en text,
  created_at timestamptz not null default now()
);

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_ja text not null,
  title_original text,
  description_ja text,
  description_original text,
  summary_ja text,
  director_id uuid references public.directors(id) on delete set null,
  country_id uuid references public.countries(id) on delete set null,
  release_year smallint check (release_year between 1888 and 3000),
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  original_language text,
  subtitle_languages text[] not null default '{}',
  poster_url text,
  poster_style text,
  youtube_video_id text,
  youtube_url text,
  status public.movie_status not null default 'draft',
  featured boolean not null default false,
  town_featured boolean not null default false,
  translation_status public.processing_status not null default 'not_started',
  summary_status public.processing_status not null default 'not_started',
  editorial_status public.editorial_status not null default 'unreviewed',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published'),
  check (youtube_video_id is null or youtube_video_id ~ '^[A-Za-z0-9_-]{6,}$')
);

create table public.movie_genres (
  movie_id uuid not null references public.movies(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (movie_id, genre_id)
);

create table public.movie_tags (
  movie_id uuid not null references public.movies(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (movie_id, tag_id)
);

create table public.movie_sources (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  platform public.source_platform not null,
  source_url text not null,
  external_id text,
  channel_id text,
  channel_name text,
  is_primary boolean not null default false,
  discovered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index movie_sources_platform_external_id_key
  on public.movie_sources (platform, external_id)
  where external_id is not null;
create unique index movie_sources_one_primary_per_movie_key
  on public.movie_sources (movie_id)
  where is_primary;

-- This table is deliberately private: it can contain contact details and notes.
create table public.publication_permissions (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  status public.permission_status not null default 'not_started',
  contact_name text,
  contact_method text,
  contact_address text,
  requested_at timestamptz,
  responded_at timestamptz,
  permission_granted_at timestamptz,
  permission_denied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  director_id uuid not null references public.directors(id) on delete restrict,
  movie_id uuid references public.movies(id) on delete set null,
  title text not null,
  intro_ja text,
  intro_original text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  question_ja text,
  question_original text,
  answer_original text,
  answer_ja text,
  edited_answer_ja text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interview_id, sort_order)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type public.article_type not null,
  title text not null,
  excerpt text,
  content text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

-- Candidates are private until a human explicitly promotes them to movies.
create table public.discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  platform public.source_platform not null,
  external_id text,
  source_url text not null,
  channel_id text,
  channel_name text,
  title_original text,
  description_original text,
  published_at_source timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  thumbnail_url text,
  detected_country text,
  detected_language text,
  review_status public.discovery_review_status not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index discovery_candidates_platform_external_id_key
  on public.discovery_candidates (platform, external_id)
  where external_id is not null;

create index movies_status_published_at_idx on public.movies (status, published_at desc);
create index movies_country_id_idx on public.movies (country_id);
create index movies_director_id_idx on public.movies (director_id);
create index movies_release_year_idx on public.movies (release_year desc);
create index directors_slug_idx on public.directors (slug);
create index countries_slug_idx on public.countries (slug);
create index genres_slug_idx on public.genres (slug);
create index interviews_slug_idx on public.interviews (slug);
create index interviews_status_published_at_idx on public.interviews (status, published_at desc);
create index articles_status_published_at_idx on public.articles (status, published_at desc);
create index movie_genres_genre_id_idx on public.movie_genres (genre_id);
create index movie_tags_tag_id_idx on public.movie_tags (tag_id);
create index interview_questions_interview_id_sort_order_idx on public.interview_questions (interview_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger directors_set_updated_at before update on public.directors for each row execute function public.set_updated_at();
create trigger movies_set_updated_at before update on public.movies for each row execute function public.set_updated_at();
create trigger publication_permissions_set_updated_at before update on public.publication_permissions for each row execute function public.set_updated_at();
create trigger interviews_set_updated_at before update on public.interviews for each row execute function public.set_updated_at();
create trigger interview_questions_set_updated_at before update on public.interview_questions for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();
create trigger discovery_candidates_set_updated_at before update on public.discovery_candidates for each row execute function public.set_updated_at();

create or replace function public.is_public_movie(movie public.movies)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select movie.status = 'published' and movie.published_at is not null and movie.published_at <= now();
$$;

-- RPCs keep filtering, counts and random discovery on the database side. They
-- return only published records and run as the caller, so RLS still applies.
create or replace function public.search_published_movie_ids(
  p_query text default null,
  p_country_code text default null,
  p_genre_slug text default null,
  p_duration_bucket text default null,
  p_release_year smallint default null,
  p_original_language text default null,
  p_subtitle_language text default null,
  p_sort text default 'new',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (movie_id uuid, total_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select m.id, count(*) over ()
  from public.movies m
  left join public.countries c on c.id = m.country_id
  left join public.directors d on d.id = m.director_id
  left join lateral (
    select string_agg(concat_ws(' ', g.name_ja, g.name_en), ' ') as names
    from public.movie_genres mg join public.genres g on g.id = mg.genre_id
    where mg.movie_id = m.id
  ) genre_names on true
  left join lateral (
    select string_agg(concat_ws(' ', t.name_ja, t.name_en), ' ') as names
    from public.movie_tags mt join public.tags t on t.id = mt.tag_id
    where mt.movie_id = m.id
  ) tag_names on true
  where public.is_public_movie(m)
    and (nullif(trim(p_query), '') is null or concat_ws(' ', m.title_ja, m.title_original, m.description_ja, m.summary_ja, c.name_ja, c.name_en, d.name, d.name_original, genre_names.names, tag_names.names) ilike '%' || trim(p_query) || '%')
    and (nullif(trim(p_country_code), '') is null or c.code = upper(trim(p_country_code)))
    and (nullif(trim(p_genre_slug), '') is null or exists (
      select 1 from public.movie_genres mg join public.genres g on g.id = mg.genre_id
      where mg.movie_id = m.id and g.slug = trim(p_genre_slug)
    ))
    and (p_release_year is null or m.release_year = p_release_year)
    and (nullif(trim(p_original_language), '') is null or m.original_language = trim(p_original_language))
    and (nullif(trim(p_subtitle_language), '') is null or trim(p_subtitle_language) = any(m.subtitle_languages))
    and (nullif(trim(p_duration_bucket), '') is null
      or (p_duration_bucket = 'under-15' and m.duration_minutes <= 15)
      or (p_duration_bucket = '15-30' and m.duration_minutes > 15 and m.duration_minutes <= 30)
      or (p_duration_bucket = '30-60' and m.duration_minutes > 30 and m.duration_minutes <= 60)
      or (p_duration_bucket = 'over-60' and m.duration_minutes > 60)
    )
  order by
    case when p_sort = 'release-year' then m.release_year end desc nulls last,
    case when p_sort = 'featured' then m.featured end desc,
    m.published_at desc,
    m.created_at desc
  limit least(greatest(coalesce(p_limit, 24), 1), 24)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.get_public_country_counts()
returns table (country_id uuid, movie_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select m.country_id, count(*) from public.movies m
  where m.country_id is not null and public.is_public_movie(m)
  group by m.country_id;
$$;

create or replace function public.get_public_genre_counts()
returns table (genre_id uuid, movie_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select mg.genre_id, count(*) from public.movie_genres mg
  join public.movies m on m.id = mg.movie_id
  where public.is_public_movie(m)
  group by mg.genre_id;
$$;

create or replace function public.get_public_director_summaries()
returns table (director_id uuid, movie_count bigint, representative_title text, interview_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    d.id,
    count(distinct m.id) as movie_count,
    (array_agg(m.title_ja order by m.featured desc, m.published_at desc))[1] as representative_title,
    count(distinct i.id) filter (where i.status = 'published' and i.published_at <= now()) as interview_count
  from public.directors d
  join public.movies m on m.director_id = d.id and public.is_public_movie(m)
  left join public.interviews i on i.director_id = d.id
  group by d.id;
$$;

create or replace function public.get_public_movie_filter_options()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'years', coalesce((select jsonb_agg(release_year order by release_year desc) from (select distinct m.release_year from public.movies m where public.is_public_movie(m) and m.release_year is not null) years), '[]'::jsonb),
    'languages', coalesce((select jsonb_agg(original_language order by original_language) from (select distinct m.original_language from public.movies m where public.is_public_movie(m) and m.original_language is not null) languages), '[]'::jsonb),
    'subtitles', coalesce((select jsonb_agg(subtitle order by subtitle) from (select distinct unnest(m.subtitle_languages) as subtitle from public.movies m where public.is_public_movie(m)) subtitles), '[]'::jsonb)
  );
$$;

create or replace function public.get_random_published_movie_id()
returns uuid
language sql
volatile
security invoker
set search_path = public
as $$
  select m.id from public.movies m where public.is_public_movie(m) order by random() limit 1;
$$;

alter table public.countries enable row level security;
alter table public.directors enable row level security;
alter table public.director_social_links enable row level security;
alter table public.movies enable row level security;
alter table public.genres enable row level security;
alter table public.movie_genres enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.movie_tags enable row level security;
alter table public.movie_sources enable row level security;
alter table public.publication_permissions enable row level security;
alter table public.discovery_candidates enable row level security;

create policy "Public can read published movies" on public.movies for select to anon using (public.is_public_movie(movies));
create policy "Public can read countries with published movies" on public.countries for select to anon using (exists (select 1 from public.movies m where m.country_id = countries.id and public.is_public_movie(m)));
create policy "Public can read genres with published movies" on public.genres for select to anon using (exists (select 1 from public.movie_genres mg join public.movies m on m.id = mg.movie_id where mg.genre_id = genres.id and public.is_public_movie(m)));
create policy "Public can read tags with published movies" on public.tags for select to anon using (exists (select 1 from public.movie_tags mt join public.movies m on m.id = mt.movie_id where mt.tag_id = tags.id and public.is_public_movie(m)));
create policy "Public can read directors with public work" on public.directors for select to anon using (
  exists (select 1 from public.movies m where m.director_id = directors.id and public.is_public_movie(m))
  or exists (select 1 from public.interviews i where i.director_id = directors.id and i.status = 'published' and i.published_at <= now())
);
create policy "Public can read public director links" on public.director_social_links for select to anon using (exists (select 1 from public.directors d where d.id = director_social_links.director_id));
create policy "Public can read genres of published movies" on public.movie_genres for select to anon using (exists (select 1 from public.movies m where m.id = movie_genres.movie_id and public.is_public_movie(m)));
create policy "Public can read tags of published movies" on public.movie_tags for select to anon using (exists (select 1 from public.movies m where m.id = movie_tags.movie_id and public.is_public_movie(m)));
create policy "Public can read sources of published movies" on public.movie_sources for select to anon using (exists (select 1 from public.movies m where m.id = movie_sources.movie_id and public.is_public_movie(m)));
create policy "Public can read published interviews" on public.interviews for select to anon using (status = 'published' and published_at is not null and published_at <= now());
create policy "Public can read questions of published interviews" on public.interview_questions for select to anon using (exists (select 1 from public.interviews i where i.id = interview_questions.interview_id and i.status = 'published' and i.published_at <= now()));
create policy "Public can read published articles" on public.articles for select to anon using (status = 'published' and published_at is not null and published_at <= now());

grant usage on schema public to anon;
grant select on public.countries, public.directors, public.director_social_links, public.movies, public.genres, public.movie_genres, public.interviews, public.interview_questions, public.articles, public.tags, public.movie_tags, public.movie_sources to anon;
grant execute on function public.search_published_movie_ids(text, text, text, text, smallint, text, text, text, integer, integer) to anon;
grant execute on function public.get_public_country_counts() to anon;
grant execute on function public.get_public_genre_counts() to anon;
grant execute on function public.get_public_director_summaries() to anon;
grant execute on function public.get_public_movie_filter_options() to anon;
grant execute on function public.get_random_published_movie_id() to anon;

revoke all on public.publication_permissions, public.discovery_candidates from anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
