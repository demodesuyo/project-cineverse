/*
 * Public data access layer for Jishu Eiga Net.
 * UI code calls these functions instead of calling supabase.from(...) directly.
 */
(function initialiseCineverseRepository() {
  const pageSize = 24;
  const movieColumns = [
    "id", "slug", "title_ja", "title_original", "description_ja", "description_original", "summary_ja",
    "director_id", "country_id", "release_year", "duration_minutes", "original_language", "subtitle_languages",
    "poster_url", "poster_style", "youtube_video_id", "youtube_url", "featured", "town_featured",
    "translation_status", "summary_status", "editorial_status", "published_at", "created_at",
    "directors!movies_director_id_fkey(id,slug,name,name_original,country_id,bio_ja,bio_original,photo_url,official_website)",
    "countries!movies_country_id_fkey(id,code,name_ja,name_en,slug,flag_emoji)",
    "movie_genres(genres!movie_genres_genre_id_fkey(id,slug,name_ja,name_en))",
    "movie_tags(tags!movie_tags_tag_id_fkey(id,slug,name_ja,name_en))",
    "movie_sources(platform,source_url,external_id,is_primary)"
  ].join(",");

  const publishedInterviewColumns = [
    "id", "slug", "title", "intro_ja", "intro_original", "published_at",
    "directors!interviews_director_id_fkey(id,slug,name,name_original,country_id,bio_ja,bio_original,photo_url,official_website)",
    "movies!interviews_movie_id_fkey(id,slug,title_ja,title_original,country_id,release_year,duration_minutes,original_language,subtitle_languages,poster_url,poster_style,youtube_video_id,youtube_url,featured,town_featured,published_at,created_at)"
  ].join(",");

  const publicError = () => new Error("映画情報を読み込めませんでした。");
  const toArray = (value) => Array.isArray(value) ? value : [];
  const toOne = (value) => Array.isArray(value) ? value[0] || null : value || null;
  const isRecent = (value) => value && (Date.now() - new Date(value).getTime()) < 1000 * 60 * 60 * 24 * 30;

  const mapCountry = (row, movieCount = null) => row ? {
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.name_ja,
    nameEn: row.name_en,
    flagEmoji: row.flag_emoji || "",
    region: "",
    movieCount
  } : null;

  const mapGenre = (row, movieCount = null) => row ? {
    id: row.slug,
    databaseId: row.id,
    slug: row.slug,
    name: row.name_ja,
    label: row.name_en,
    movieCount
  } : null;

  const mapDirector = (row, summary = {}) => row ? {
    id: row.id,
    slug: row.slug,
    name: row.name,
    romanName: row.name_original || row.name,
    countryId: row.country_id || null,
    photo: row.photo_url || null,
    bio: row.bio_ja || row.bio_original || null,
    officialWebsite: row.official_website || null,
    socialLinks: [],
    movieCount: Number(summary.movie_count || 0),
    representativeTitle: summary.representative_title || null,
    interviewCount: Number(summary.interview_count || 0)
  } : null;

  const mapMovie = (row) => {
    const country = mapCountry(toOne(row.countries));
    const director = mapDirector(toOne(row.directors));
    const genres = toArray(row.movie_genres).map((relation) => mapGenre(toOne(relation.genres))).filter(Boolean);
    const tags = toArray(row.movie_tags).map((relation) => toOne(relation.tags)?.name_ja).filter(Boolean);
    const sources = toArray(row.movie_sources);
    const primarySource = sources.find((source) => source.is_primary) || sources[0] || null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title_ja,
      originalTitle: row.title_original || "",
      translatedDescription: row.description_ja || "",
      originalDescription: row.description_original || null,
      summary: row.summary_ja || "",
      countryCode: country?.code || "",
      country,
      genreIds: genres.map((genre) => genre.id),
      genres,
      releaseYear: row.release_year,
      durationMinutes: row.duration_minutes,
      originalLanguage: row.original_language || "",
      subtitleLanguages: toArray(row.subtitle_languages),
      directorId: director?.id || row.director_id || null,
      director,
      posterUrl: row.poster_url || null,
      poster: { type: row.poster_url ? "image" : "placeholder", style: row.poster_style || "placeholder" },
      youtubeVideoId: row.youtube_video_id || (primarySource?.platform === "youtube" ? primarySource.external_id : null),
      youtubeUrl: row.youtube_url || (primarySource?.platform === "youtube" ? primarySource.source_url : null),
      tags,
      featured: Boolean(row.featured),
      townFeatured: Boolean(row.town_featured),
      publishedAt: row.published_at || row.created_at || null,
      status: "published",
      translationStatus: row.translation_status,
      summaryStatus: row.summary_status,
      editorialStatus: row.editorial_status,
      humanReviewed: row.editorial_status === "approved",
      isNew: isRecent(row.published_at)
    };
  };

  const mapInterview = (row, includeQuestions = false) => {
    const director = mapDirector(toOne(row.directors));
    const movieRow = toOne(row.movies);
    const movie = movieRow ? mapMovie(movieRow) : null;
    return {
      id: row.id,
      slug: row.slug,
      directorId: director?.id || row.director_id || null,
      director,
      movieId: movie?.id || row.movie_id || null,
      movie,
      title: row.title,
      intro: row.intro_ja || row.intro_original || "",
      publishedAt: row.published_at,
      status: "published",
      questionsAndAnswers: includeQuestions ? toArray(row.interview_questions).sort((a, b) => a.sort_order - b.sort_order).map((question) => ({
        question: question.question_ja || question.question_original || "",
        originalAnswer: question.answer_original || null,
        translatedAnswer: question.answer_ja || null,
        editedAnswer: question.edited_answer_ja || null
      })) : []
    };
  };

  const mapArticle = (row) => ({ id: row.id, slug: row.slug, type: row.type.toUpperCase(), title: row.title, excerpt: row.excerpt || "", publishedAt: row.published_at, status: "published" });

  const getClient = async () => {
    const state = window.CINEVERSE_SUPABASE;
    if (!state) return { client: null, status: "unconfigured" };
    const client = await state.ready;
    return { client, status: state.status };
  };

  const assertClient = async () => {
    const { client, status } = await getClient();
    if (!client || status !== "ready") throw publicError();
    return client;
  };

  const fetchMoviesByIds = async (client, ids) => {
    if (!ids.length) return [];
    const { data, error } = await client.from("movies").select(movieColumns).in("id", ids);
    if (error) throw publicError();
    const byId = new Map(toArray(data).map((row) => [row.id, mapMovie(row)]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  };

  const getPublishedMovies = async (filters = {}, page = 0) => {
    const client = await assertClient();
    const { data, error } = await client.rpc("search_published_movie_ids", {
      p_query: filters.query || null,
      p_country_code: filters.country || null,
      p_genre_slug: filters.genre || null,
      p_duration_bucket: filters.duration || null,
      p_release_year: filters.year ? Number(filters.year) : null,
      p_original_language: filters.language || null,
      p_subtitle_language: filters.subtitle || null,
      p_sort: filters.sort || "new",
      p_limit: pageSize,
      p_offset: page * pageSize
    });
    if (error) throw publicError();
    const rows = toArray(data);
    const ids = rows.map((row) => row.movie_id);
    const movies = await fetchMoviesByIds(client, ids);
    const total = Number(rows[0]?.total_count || 0);
    return { movies, total, hasMore: (page + 1) * pageSize < total };
  };

  const getMovieBySlug = async (slug) => {
    const client = await assertClient();
    const { data, error } = await client.from("movies").select(movieColumns).eq("slug", slug).maybeSingle();
    if (error) throw publicError();
    return data ? mapMovie(data) : null;
  };

  const getFeaturedMovies = async () => {
    const client = await assertClient();
    const { data, error } = await client.from("movies").select(movieColumns).eq("status", "published").eq("featured", true).order("published_at", { ascending: false }).range(0, 5);
    if (error) throw publicError();
    return toArray(data).map(mapMovie);
  };

  const getTownFeaturedMovies = async () => {
    const client = await assertClient();
    const { data, error } = await client.from("movies").select(movieColumns).eq("status", "published").eq("town_featured", true).order("published_at", { ascending: false }).range(0, 5);
    if (error) throw publicError();
    return toArray(data).map(mapMovie);
  };

  const getPublishedMovieCount = async () => {
    const client = await assertClient();
    const { count, error } = await client.from("movies").select("id", { count: "exact", head: true }).eq("status", "published");
    if (error) throw publicError();
    return Number(count || 0);
  };

  const getReferenceData = async () => {
    const client = await assertClient();
    const [countriesResponse, genresResponse, countryCountsResponse, genreCountsResponse, filterOptionsResponse] = await Promise.all([
      client.from("countries").select("id,code,name_ja,name_en,slug,flag_emoji").order("name_ja"),
      client.from("genres").select("id,slug,name_ja,name_en").order("name_ja"),
      client.rpc("get_public_country_counts"),
      client.rpc("get_public_genre_counts"),
      client.rpc("get_public_movie_filter_options")
    ]);
    if (countriesResponse.error || genresResponse.error || countryCountsResponse.error || genreCountsResponse.error || filterOptionsResponse.error) throw publicError();
    const countryCounts = new Map(toArray(countryCountsResponse.data).map((row) => [row.country_id, Number(row.movie_count)]));
    const genreCounts = new Map(toArray(genreCountsResponse.data).map((row) => [row.genre_id, Number(row.movie_count)]));
    return {
      countries: toArray(countriesResponse.data).map((row) => mapCountry(row, countryCounts.get(row.id) || 0)),
      genres: toArray(genresResponse.data).map((row) => mapGenre(row, genreCounts.get(row.id) || 0)),
      filterOptions: filterOptionsResponse.data || { years: [], languages: [], subtitles: [] }
    };
  };

  const getDirectors = async (page = 0) => {
    const client = await assertClient();
    const [directorsResponse, summariesResponse] = await Promise.all([
      client.from("directors").select("id,slug,name,name_original,country_id,bio_ja,bio_original,photo_url,official_website").order("name").range(page * pageSize, page * pageSize + pageSize - 1),
      client.rpc("get_public_director_summaries")
    ]);
    if (directorsResponse.error || summariesResponse.error) throw publicError();
    const summaries = new Map(toArray(summariesResponse.data).map((row) => [row.director_id, row]));
    return toArray(directorsResponse.data).map((row) => mapDirector(row, summaries.get(row.id)));
  };

  const getDirectorBySlug = async (slug) => {
    const client = await assertClient();
    const { data, error } = await client.from("directors").select("id,slug,name,name_original,country_id,bio_ja,bio_original,photo_url,official_website").eq("slug", slug).maybeSingle();
    if (error) throw publicError();
    return data ? mapDirector(data) : null;
  };

  const getMoviesByDirector = async (directorId) => {
    const client = await assertClient();
    const { data, error } = await client.from("movies").select(movieColumns).eq("director_id", directorId).eq("status", "published").order("published_at", { ascending: false }).range(0, pageSize - 1);
    if (error) throw publicError();
    return toArray(data).map(mapMovie);
  };

  const getPublishedInterviews = async (page = 0) => {
    const client = await assertClient();
    const { data, error } = await client.from("interviews").select(publishedInterviewColumns).eq("status", "published").order("published_at", { ascending: false }).range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw publicError();
    return toArray(data).map((row) => mapInterview(row));
  };

  const getInterviewBySlug = async (slug) => {
    const client = await assertClient();
    const columns = `${publishedInterviewColumns},interview_questions(id,sort_order,question_ja,question_original,answer_original,answer_ja,edited_answer_ja)`;
    const { data, error } = await client.from("interviews").select(columns).eq("slug", slug).maybeSingle();
    if (error) throw publicError();
    return data ? mapInterview(data, true) : null;
  };

  const getInterviewsByDirector = async (directorId) => {
    const client = await assertClient();
    const { data, error } = await client.from("interviews").select(publishedInterviewColumns).eq("director_id", directorId).eq("status", "published").order("published_at", { ascending: false }).range(0, pageSize - 1);
    if (error) throw publicError();
    return toArray(data).map((row) => mapInterview(row));
  };

  const getInterviewsByMovie = async (movieId) => {
    const client = await assertClient();
    const { data, error } = await client.from("interviews").select(publishedInterviewColumns).eq("movie_id", movieId).eq("status", "published").order("published_at", { ascending: false }).range(0, pageSize - 1);
    if (error) throw publicError();
    return toArray(data).map((row) => mapInterview(row));
  };

  const getPublishedArticles = async () => {
    const client = await assertClient();
    const { data, error } = await client.from("articles").select("id,slug,type,title,excerpt,published_at").eq("status", "published").order("published_at", { ascending: false }).range(0, pageSize - 1);
    if (error) throw publicError();
    return toArray(data).map(mapArticle);
  };

  const getRandomPublishedMovie = async () => {
    const client = await assertClient();
    const { data, error } = await client.rpc("get_random_published_movie_id");
    if (error || !data) return null;
    return fetchMoviesByIds(client, [data]).then((movies) => movies[0] || null);
  };

  const getRelatedMovies = async (movie) => {
    const sameCountry = await getPublishedMovies({ country: movie.countryCode, sort: "featured" }, 0);
    const related = sameCountry.movies.filter((candidate) => candidate.id !== movie.id);
    if (related.length >= 3 || !movie.genreIds[0]) return related.slice(0, 3);
    const sameGenre = await getPublishedMovies({ genre: movie.genreIds[0], sort: "featured" }, 0);
    return [...related, ...sameGenre.movies.filter((candidate) => candidate.id !== movie.id && !related.some((existing) => existing.id === candidate.id))].slice(0, 3);
  };

  window.CINEVERSE_REPOSITORY = {
    pageSize,
    getConnectionState: getClient,
    getPublishedMovies,
    searchMovies: getPublishedMovies,
    getMovieBySlug,
    getFeaturedMovies,
    getTownFeaturedMovies,
    getPublishedMovieCount,
    getReferenceData,
    getDirectors,
    getDirectorBySlug,
    getMoviesByDirector,
    getPublishedInterviews,
    getInterviewBySlug,
    getInterviewsByDirector,
    getInterviewsByMovie,
    getPublishedArticles,
    getRandomPublishedMovie,
    getRelatedMovies
  };
})();
