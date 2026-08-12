-- Development-only sample data. Every person and work below is fictional.
-- Do not present these records as real films or real creators.

insert into public.countries (code, name_ja, name_en, slug, flag_emoji)
values ('JP', '日本', 'Japan', 'japan', '🇯🇵')
on conflict (code) do update set name_ja = excluded.name_ja, name_en = excluded.name_en, slug = excluded.slug, flag_emoji = excluded.flag_emoji;

insert into public.directors (slug, name, name_original, country_id, bio_ja, bio_original)
values (
  'sample-director-a',
  'サンプル監督A',
  'Sample Director A',
  (select id from public.countries where code = 'JP'),
  'このプロフィールはSupabase接続確認のための架空データです。',
  'This profile is fictional sample data for connection testing.'
)
on conflict (slug) do update set name = excluded.name, name_original = excluded.name_original, country_id = excluded.country_id, bio_ja = excluded.bio_ja, bio_original = excluded.bio_original;

insert into public.genres (slug, name_ja, name_en)
values ('sample-drama', 'サンプルドラマ', 'Sample drama')
on conflict (slug) do update set name_ja = excluded.name_ja, name_en = excluded.name_en;

insert into public.tags (slug, name_ja, name_en)
values ('sample', 'サンプル', 'Sample')
on conflict (slug) do update set name_ja = excluded.name_ja, name_en = excluded.name_en;

insert into public.movies (slug, title_ja, title_original, description_ja, description_original, summary_ja, director_id, country_id, release_year, duration_minutes, original_language, subtitle_languages, poster_style, status, featured, town_featured, translation_status, summary_status, editorial_status, published_at)
values (
  'sample-film-a',
  'サンプル映画A',
  'Sample Film A',
  'この作品はSupabaseと画面の接続を確認するためだけの架空サンプルです。',
  'This is fictional sample content for testing the Supabase connection.',
  '本番公開前に実在作品の確認済み情報へ置き換えてください。',
  (select id from public.directors where slug = 'sample-director-a'),
  (select id from public.countries where code = 'JP'),
  2026,
  10,
  '日本語',
  array['英語'],
  'blue',
  'published',
  true,
  true,
  'reviewed',
  'reviewed',
  'approved',
  now()
)
on conflict (slug) do update set title_ja = excluded.title_ja, title_original = excluded.title_original, description_ja = excluded.description_ja, description_original = excluded.description_original, summary_ja = excluded.summary_ja, director_id = excluded.director_id, country_id = excluded.country_id, release_year = excluded.release_year, duration_minutes = excluded.duration_minutes, original_language = excluded.original_language, subtitle_languages = excluded.subtitle_languages, poster_style = excluded.poster_style, status = excluded.status, featured = excluded.featured, town_featured = excluded.town_featured, translation_status = excluded.translation_status, summary_status = excluded.summary_status, editorial_status = excluded.editorial_status, published_at = excluded.published_at;

insert into public.movies (slug, title_ja, director_id, country_id, status, editorial_status)
values ('sample-film-draft', '非公開サンプル映画', (select id from public.directors where slug = 'sample-director-a'), (select id from public.countries where code = 'JP'), 'draft', 'unreviewed')
on conflict (slug) do nothing;

insert into public.movie_genres (movie_id, genre_id)
values ((select id from public.movies where slug = 'sample-film-a'), (select id from public.genres where slug = 'sample-drama'))
on conflict do nothing;

insert into public.movie_tags (movie_id, tag_id)
values ((select id from public.movies where slug = 'sample-film-a'), (select id from public.tags where slug = 'sample'))
on conflict do nothing;

insert into public.movie_sources (movie_id, platform, source_url, external_id, is_primary, metadata)
values ((select id from public.movies where slug = 'sample-film-a'), 'official_site', 'https://example.com/sample-film-a', 'sample-film-a-source', true, '{"is_sample": true}'::jsonb)
on conflict (platform, external_id) where external_id is not null do nothing;

insert into public.publication_permissions (movie_id, status, contact_name, contact_method, contact_address, notes)
select m.id, 'granted', 'Sample contact', 'email', 'sample@example.invalid', 'Fictional data used to verify that this table is not public.'
from public.movies m
where m.slug = 'sample-film-a'
  and not exists (
    select 1 from public.publication_permissions p where p.movie_id = m.id and p.contact_address = 'sample@example.invalid'
  );

insert into public.interviews (slug, director_id, movie_id, title, intro_ja, intro_original, status, published_at)
values ('sample-interview-a', (select id from public.directors where slug = 'sample-director-a'), (select id from public.movies where slug = 'sample-film-a'), 'サンプル監督A インタビュー', 'Supabase接続確認のための架空インタビューです。', 'This is fictional sample interview content for connection testing.', 'published', now())
on conflict (slug) do update set title = excluded.title, intro_ja = excluded.intro_ja, intro_original = excluded.intro_original, status = excluded.status, published_at = excluded.published_at;

insert into public.interview_questions (interview_id, sort_order, question_ja, answer_original, answer_ja)
values ((select id from public.interviews where slug = 'sample-interview-a'), 1, 'このサンプルについて教えてください。', 'This is sample content.', 'この内容は接続確認用の架空データです。')
on conflict (interview_id, sort_order) do update set question_ja = excluded.question_ja, answer_original = excluded.answer_original, answer_ja = excluded.answer_ja;

insert into public.articles (slug, type, title, excerpt, content, status, published_at)
values ('sample-feature-a', 'feature', 'サンプル特集A', 'Supabase接続確認用の架空記事です。', '本番公開前に確認済みの編集記事へ置き換えてください。', 'published', now())
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, status = excluded.status, published_at = excluded.published_at;
