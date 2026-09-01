/* Project CINEVERSE shared browser application */
(function startCineverseApplication() {
  const initialScriptUrl = document.currentScript?.src || new URL("assets/app.js", window.location.href).href;
  const assetBaseUrl = new URL(".", initialScriptUrl).href;
  // GitHub Pages serves static files with a short cache lifetime. Keep every
  // dynamically loaded data-layer asset on the same build version as app.js,
  // so a newly deployed public runtime configuration is never masked by an
  // older cached copy.
  const assetVersion = new URL(initialScriptUrl).searchParams.get("v");
  const pathName = window.location.pathname;
  const jishuSegment = "/jishu-eiga-net/";
  const jishuSegmentIndex = pathName.indexOf(jishuSegment);
  const jishuBasePath = jishuSegmentIndex >= 0 ? pathName.slice(0, jishuSegmentIndex + jishuSegment.length) : "";
  const jishuRoute = jishuBasePath ? pathName.slice(jishuBasePath.length) : "";
  const jishuUrl = (route = "") => `${jishuBasePath}${route}`;
  const productionJishuUrl = (route = "") => `https://demodesuyo.github.io/project-cineverse/jishu-eiga-net/${route}`;
  const emptyData = { countries: [], genres: [], directors: [], movies: [], interviews: [], articles: [] };
  const fallbackData = window.CINEVERSE_DATA || emptyData;
  let cineverseData = emptyData;
  let publicMovies = [];
  let dataSource = "sample";
  let repository = null;
  let dataMeta = { movieCount: null, filterOptions: { years: [], languages: [], subtitles: [] } };

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const toArray = (value) => Array.isArray(value) ? value : [];
  const uniqueById = (records) => [...new Map(records.filter(Boolean).map((record) => [record.id, record])).values()];
  const currentParams = () => new URLSearchParams(window.location.search);
  const currentDetailSlug = (selector, param = "slug") => document.querySelector(selector)?.dataset[selector === "[data-film-detail]" ? "filmDetail" : selector === "[data-director-detail]" ? "directorDetail" : "interviewDetail"] || currentParams().get(param) || "";
  const getMovie = (slug) => publicMovies.find((movie) => movie.slug === slug);
  const getDirector = (id) => cineverseData.directors.find((director) => director.id === id) || publicMovies.find((movie) => movie.directorId === id)?.director || null;
  const getCountry = (code) => cineverseData.countries.find((country) => country.code === code) || publicMovies.find((movie) => movie.countryCode === code)?.country || null;
  const getGenre = (id) => cineverseData.genres.find((genre) => genre.id === id) || null;
  const getMovieGenres = (movie) => movie?.genres?.length ? movie.genres : toArray(movie?.genreIds).map(getGenre).filter(Boolean);
  const getMovieCountry = (movie) => movie?.country || getCountry(movie?.countryCode);
  const movieUrl = (movie) => dataSource === "supabase" ? jishuUrl(`film.html?slug=${encodeURIComponent(movie.slug)}`) : jishuUrl(`films/${movie.slug}/`);
  const directorUrl = (director) => dataSource === "supabase" ? jishuUrl(`director.html?slug=${encodeURIComponent(director.slug)}`) : jishuUrl(`directors/${director.slug}/`);
  const interviewUrl = (interview) => dataSource === "supabase" ? jishuUrl(`interview.html?slug=${encodeURIComponent(interview.slug)}`) : jishuUrl(`interviews/${interview.slug}/`);
  const countriesWithMovies = () => cineverseData.countries.filter((country) => dataSource === "supabase" ? country.movieCount > 0 : publicMovies.some((movie) => movie.countryCode === country.code));
  const genresWithMovies = () => cineverseData.genres.filter((genre) => dataSource === "supabase" ? genre.movieCount > 0 : publicMovies.some((movie) => movie.genreIds.includes(genre.id)));
  const visibleMovieCount = (predicate) => dataSource === "supabase" ? null : publicMovies.filter(predicate).length;

  const renderJishuNavigation = () => {
    if (!jishuBasePath) return;
    const navItems = [
      { label: "街を歩く", route: "", active: jishuRoute === "" || jishuRoute === "index.html" },
      { label: "映画を探す", route: "films/", active: jishuRoute.startsWith("films/") || jishuRoute === "film.html" },
      { label: "国から探す", route: "countries/", active: jishuRoute.startsWith("countries/") },
      { label: "ジャンル", route: "genres/", active: jishuRoute.startsWith("genres/") },
      { label: "監督", route: "directors/", active: jishuRoute.startsWith("directors/") || jishuRoute === "director.html" },
      { label: "インタビュー", route: "interviews/", active: jishuRoute.startsWith("interviews/") || jishuRoute === "interview.html" },
      { label: "特集・制作日記", route: "features/", active: jishuRoute.startsWith("features/") },
      { label: "自主映画ねっとについて", route: "about.html", active: jishuRoute === "about.html" }
    ];
    document.querySelectorAll(".site-nav").forEach((nav) => {
      nav.innerHTML = `${navItems.map((item) => `<a href="${jishuUrl(item.route)}"${item.active ? ' aria-current="page"' : ""}>${item.label}</a>`).join("")}<a class="nav-service" href="${jishuUrl("../eiga-kantoku/index.html")}">映画監督になろう ↗</a>`;
    });
  };

  const initialiseSharedInteractions = () => {
    document.querySelectorAll(".mobile-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const nav = button.parentElement.querySelector(".site-nav");
        const isOpen = nav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
        button.textContent = isOpen ? "×" : "☰";
      });
    });
    document.querySelectorAll("[data-upload-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = form.querySelector(".form-message");
        const name = form.elements.name.value.trim();
        message.textContent = name ? `${name}さん、登録の準備ができました。次の画面でプロフィールを作成しましょう。` : "お名前を入力してください。";
      });
    });
  };

  const loadAssetScript = (filename) => new Promise((resolve, reject) => {
    const assetUrl = new URL(filename, assetBaseUrl);
    if (assetVersion) assetUrl.searchParams.set("v", assetVersion);
    const src = assetUrl.href;
    if ([...document.scripts].some((script) => script.src === src)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${filename}`));
    document.head.append(script);
  });

  const getRepository = async () => {
    try {
      await loadAssetScript("runtime-config.js");
      await loadAssetScript("supabase-client.js");
      await loadAssetScript("cineverse-repository.js");
      return window.CINEVERSE_REPOSITORY || null;
    } catch (error) {
      console.info("CINEVERSE data layer is unavailable; sample content remains visible.");
      return null;
    }
  };

  const setDataStatus = (status, message = "") => {
    document.body.dataset.cineverseData = status;
    document.querySelectorAll("[data-cineverse-status]").forEach((element) => { element.textContent = message; });
    document.querySelectorAll("[data-cineverse-data-label]").forEach((element) => { element.textContent = message; });
  };

  const renderLoading = (container) => {
    if (container) container.innerHTML = '<div class="data-loading" role="status"><span aria-hidden="true">✦</span> 映画の光を集めています…</div>';
  };

  const renderDataError = (container) => {
    if (container) container.innerHTML = '<div class="data-error" role="alert"><p>映画情報を読み込めませんでした。</p><button type="button" data-reload-data>再読み込み</button></div>';
  };

  const mergeData = ({ references, movies, featured, townFeatured, directors, interviews, articles }) => {
    const movieRecords = uniqueById([...movies, ...featured, ...townFeatured]);
    const relatedDirectors = movieRecords.map((movie) => movie.director);
    const relatedCountries = movieRecords.map((movie) => movie.country);
    const relatedGenres = movieRecords.flatMap((movie) => movie.genres || []);
    return {
      countries: uniqueById([...(references?.countries || []), ...relatedCountries]),
      genres: uniqueById([...(references?.genres || []), ...relatedGenres]),
      directors: uniqueById([...(directors || []), ...relatedDirectors, ...interviews.map((interview) => interview.director)]),
      movies: movieRecords,
      interviews: interviews || [],
      articles: articles || []
    };
  };

  const useSampleData = (reason) => {
    dataSource = "sample";
    cineverseData = fallbackData;
    publicMovies = toArray(cineverseData.movies).filter((movie) => movie.status === "published");
    dataMeta = {
      movieCount: publicMovies.length,
      filterOptions: {
        years: [...new Set(publicMovies.map((movie) => movie.releaseYear))],
        languages: [...new Set(publicMovies.map((movie) => movie.originalLanguage))],
        subtitles: [...new Set(publicMovies.flatMap((movie) => movie.subtitleLanguages))]
      }
    };
    setDataStatus("sample", "BETA / SAMPLE DATA");
    if (reason) console.info(reason);
  };

  const loadInitialData = async () => {
    repository = await getRepository();
    if (!repository) { useSampleData("Supabase data layer is not installed."); return; }
    const connection = await repository.getConnectionState();
    if (connection.status === "unconfigured") { useSampleData("Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to connect real data."); return; }
    if (connection.status !== "ready") {
      dataSource = "error";
      cineverseData = emptyData;
      publicMovies = [];
      setDataStatus("error", "映画情報は一時的に利用できません。");
      return;
    }
    try {
      const [references, list, featured, townFeatured, directors, interviews, articles, movieCount] = await Promise.all([
        repository.getReferenceData(),
        repository.getPublishedMovies({}, 0),
        repository.getFeaturedMovies(),
        repository.getTownFeaturedMovies(),
        repository.getDirectors(),
        repository.getPublishedInterviews(),
        repository.getPublishedArticles(),
        repository.getPublishedMovieCount()
      ]);
      dataSource = "supabase";
      cineverseData = mergeData({ references, movies: list.movies, featured, townFeatured, directors, interviews, articles });
      publicMovies = cineverseData.movies;
      dataMeta = { movieCount, filterOptions: references.filterOptions };
      setDataStatus("supabase", "BETA / SUPABASE DATA");
    } catch (error) {
      dataSource = "error";
      cineverseData = emptyData;
      publicMovies = [];
      setDataStatus("error", "映画情報は一時的に利用できません。");
      console.error("CINEVERSE public data request failed.");
    }
  };

  const posterMarkup = (movie, compact = false) => {
    const country = getMovieCountry(movie);
    const style = movie.poster?.style || "placeholder";
    const image = movie.posterUrl ? `<img src="${escapeHtml(movie.posterUrl)}" alt="" loading="lazy" />` : "";
    return `<div class="film-poster film-poster--${escapeHtml(style)}${compact ? " film-poster--compact" : ""}" aria-hidden="true">${image}<span>${escapeHtml(country?.code || "--")}</span><strong>${escapeHtml(movie.title)}</strong><i>${escapeHtml(movie.releaseYear || "")}</i></div>`;
  };

  const directorInitials = (director) => String(director?.romanName || director?.name || "?").split(" ").map((part) => part[0]).join("").slice(0, 2);
  const directorAvatarMarkup = (director, small = false) => `<div class="director-avatar${small ? " director-avatar--small" : ""}" aria-hidden="true">${director?.photo ? `<img src="${escapeHtml(director.photo)}" alt="" loading="lazy" />` : `<span>${escapeHtml(directorInitials(director))}</span>`}</div>`;

  const filmCardMarkup = (movie) => {
    const country = getMovieCountry(movie);
    const director = movie.director || getDirector(movie.directorId);
    const genres = getMovieGenres(movie);
    const badges = [movie.isNew ? "NEW" : "", movie.featured ? "FEATURED" : ""].filter(Boolean);
    return `<a class="database-film-card" href="${movieUrl(movie)}">${posterMarkup(movie)}<div class="database-film-card__body"><div class="film-card-badges">${badges.map((badge) => `<span>${badge}</span>`).join("")}</div><p>${escapeHtml(country?.name || "不明")} <span>／</span> ${escapeHtml(genres.map((genre) => genre.name).join("・"))}</p><h2>${escapeHtml(movie.title)}</h2><small>${escapeHtml(movie.originalTitle)}</small><dl><div><dt>公開年</dt><dd>${escapeHtml(movie.releaseYear || "—")}</dd></div><div><dt>上映時間</dt><dd>${movie.durationMinutes ? `${movie.durationMinutes}分` : "—"}</dd></div><div><dt>監督</dt><dd>${escapeHtml(director?.name || "不明")}</dd></div></dl>${movie.subtitleLanguages?.length ? `<em>字幕：${escapeHtml(movie.subtitleLanguages.join("・"))}</em>` : ""}</div></a>`;
  };

  const setMovieCount = () => {
    document.querySelectorAll("[data-film-count]").forEach((element) => {
      if (dataSource === "error" || dataMeta.movieCount === null) { element.parentElement.hidden = true; return; }
      element.parentElement.hidden = false;
      element.textContent = String(dataMeta.movieCount);
    });
  };

  const filterMovieList = () => {
    const lists = document.querySelectorAll("[data-film-list]");
    if (!lists.length) return;
    const params = currentParams();
    const state = {
      query: params.get("q") || "",
      country: params.get("country") || "",
      genre: params.get("genre") || "",
      duration: params.get("duration") || "",
      year: params.get("year") || "",
      language: params.get("language") || "",
      subtitle: params.get("subtitle") || "",
      sort: params.get("sort") || "new"
    };
    const controls = [...document.querySelectorAll("[data-filter-key]")];
    let page = 0;
    let visibleMovies = [];
    let hasMore = false;
    let requestVersion = 0;
    let pagination = document.querySelector("[data-film-pagination]");
    if (!pagination) {
      pagination = document.createElement("div");
      pagination.className = "film-pagination";
      pagination.dataset.filmPagination = "";
      lists[0].after(pagination);
    }
    const optionMap = {
      country: countriesWithMovies().map((country) => ({ value: country.code, label: country.name })),
      genre: genresWithMovies().map((genre) => ({ value: genre.id, label: genre.name })),
      year: toArray(dataMeta.filterOptions.years).map((year) => ({ value: year, label: `${year}年` })),
      language: toArray(dataMeta.filterOptions.languages).map((language) => ({ value: language, label: language })),
      subtitle: toArray(dataMeta.filterOptions.subtitles).map((language) => ({ value: language, label: `${language}字幕` }))
    };
    const populateSelect = (control) => {
      const key = control.dataset.filterKey;
      if (!optionMap[key]) return;
      const labels = { country: "すべての国", genre: "すべてのジャンル", year: "すべての公開年", language: "すべての言語", subtitle: "字幕を問わない" };
      control.innerHTML = `<option value="">${labels[key]}</option>${optionMap[key].map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("")}`;
    };
    const syncControls = () => controls.forEach((control) => { const key = control.dataset.filterKey; if (key in state) control.value = state[key]; });
    const updateUrl = () => {
      const url = new URL(window.location.href);
      Object.entries(state).forEach(([key, value]) => {
        if (!value || (key === "sort" && value === "new")) url.searchParams.delete(key);
        else url.searchParams.set(key === "query" ? "q" : key, value);
      });
      history.replaceState({}, "", url);
    };
    const localResults = () => {
      const matchesDuration = (movie) => ({ "under-15": movie.durationMinutes <= 15, "15-30": movie.durationMinutes > 15 && movie.durationMinutes <= 30, "30-60": movie.durationMinutes > 30 && movie.durationMinutes <= 60, "over-60": movie.durationMinutes > 60 })[state.duration] ?? true;
      const results = publicMovies.filter((movie) => {
        const country = getMovieCountry(movie);
        const director = movie.director || getDirector(movie.directorId);
        const genres = getMovieGenres(movie).map((genre) => `${genre.name} ${genre.label}`);
        const haystack = [movie.title, movie.originalTitle, movie.translatedDescription, movie.summary, country?.name, director?.name, ...genres, ...(movie.tags || [])].join(" ").toLocaleLowerCase("ja");
        return (!state.query || haystack.includes(state.query.toLocaleLowerCase("ja"))) && (!state.country || movie.countryCode === state.country) && (!state.genre || movie.genreIds.includes(state.genre)) && matchesDuration(movie) && (!state.year || String(movie.releaseYear) === state.year) && (!state.language || movie.originalLanguage === state.language) && (!state.subtitle || movie.subtitleLanguages.includes(state.subtitle));
      });
      results.sort((a, b) => state.sort === "release-year" ? b.releaseYear - a.releaseYear : state.sort === "featured" ? Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt) : b.publishedAt.localeCompare(a.publishedAt));
      return results;
    };
    const render = (total) => {
      lists.forEach((list) => {
        list.innerHTML = visibleMovies.length ? visibleMovies.map(filmCardMarkup).join("") : '<div class="no-results"><p>現在、この条件の作品はありません。</p><button type="button" data-clear-filters>フィルターを解除する</button></div>';
      });
      document.querySelectorAll("[data-film-result-count]").forEach((element) => { element.textContent = `${total}作品見つかりました`; });
      document.querySelectorAll("[data-active-filter-count]").forEach((element) => { element.textContent = String(Object.entries(state).filter(([key, value]) => value && key !== "sort").length); });
      pagination.innerHTML = hasMore ? '<button type="button" class="load-more-button" data-film-load-more>もっと見る</button>' : "";
      updateUrl();
    };
    const load = async (reset = true) => {
      const version = ++requestVersion;
      if (reset) { page = 0; visibleMovies = []; }
      if (dataSource === "error") { lists.forEach(renderDataError); return; }
      lists.forEach(renderLoading);
      try {
        if (dataSource === "supabase") {
          const result = await repository.searchMovies(state, page);
          if (version !== requestVersion) return;
          visibleMovies = reset ? result.movies : [...visibleMovies, ...result.movies];
          hasMore = result.hasMore;
          render(result.total);
        } else {
          const all = localResults();
          const limit = repository?.pageSize || 24;
          visibleMovies = reset ? all.slice(0, limit) : [...visibleMovies, ...all.slice(page * limit, (page + 1) * limit)];
          hasMore = (page + 1) * limit < all.length;
          render(all.length);
        }
      } catch (error) {
        lists.forEach(renderDataError);
      }
    };
    const reset = () => {
      Object.assign(state, { query: "", country: "", genre: "", duration: "", year: "", language: "", subtitle: "", sort: "new" });
      syncControls();
      load(true);
    };
    controls.forEach(populateSelect);
    controls.forEach((control) => control.addEventListener("input", () => { state[control.dataset.filterKey] = control.value; syncControls(); load(true); }));
    lists.forEach((list) => list.addEventListener("click", (event) => { if (event.target.closest("[data-clear-filters]")) reset(); }));
    pagination.addEventListener("click", (event) => { if (event.target.closest("[data-film-load-more]")) { page += 1; load(false); } });
    document.querySelectorAll("[data-filter-reset]").forEach((button) => button.addEventListener("click", reset));
    const filterDialog = document.querySelector("#filter-dialog");
    const openFilterDialog = () => { if (!filterDialog) return; if (typeof filterDialog.showModal === "function") filterDialog.showModal(); else filterDialog.setAttribute("open", ""); };
    const closeFilterDialog = () => { if (!filterDialog) return; if (typeof filterDialog.close === "function") filterDialog.close(); else filterDialog.removeAttribute("open"); };
    document.querySelectorAll("[data-open-filter]").forEach((button) => button.addEventListener("click", openFilterDialog));
    document.querySelectorAll("[data-close-filter]").forEach((button) => button.addEventListener("click", closeFilterDialog));
    document.querySelectorAll("[data-apply-filter]").forEach((button) => button.addEventListener("click", closeFilterDialog));
    syncControls();
    load(true);
  };

  const renderCountryAndGenreDirectories = () => {
    document.querySelectorAll("[data-country-list]").forEach((list) => {
      if (dataSource === "error") { renderDataError(list); return; }
      list.innerHTML = countriesWithMovies().map((country) => {
        const count = dataSource === "supabase" ? country.movieCount : visibleMovieCount((movie) => movie.countryCode === country.code);
        return `<a class="country-directory-card" href="${jishuUrl(`films/?country=${encodeURIComponent(country.code)}`)}"><b>${escapeHtml(country.code)}</b><h2>${escapeHtml(country.name)}</h2><p>${escapeHtml(country.region || country.nameEn || "")}</p><span>${count}作品 ↗</span></a>`;
      }).join("") || '<p class="no-results">公開中の国別作品はありません。</p>';
    });
    document.querySelectorAll("[data-genre-list]").forEach((list) => {
      if (dataSource === "error") { renderDataError(list); return; }
      list.innerHTML = genresWithMovies().map((genre) => {
        const count = dataSource === "supabase" ? genre.movieCount : visibleMovieCount((movie) => movie.genreIds.includes(genre.id));
        return `<a class="genre-directory-card" href="${jishuUrl(`films/?genre=${encodeURIComponent(genre.id)}`)}"><p>${escapeHtml(genre.label || "GENRE")}</p><h2>${escapeHtml(genre.name)}</h2><span>${count}作品 ↗</span></a>`;
      }).join("") || '<p class="no-results">公開中のジャンルはありません。</p>';
    });
  };

  const directorCardMarkup = (director) => {
    const country = cineverseData.countries.find((item) => item.id === director.countryId) || null;
    const films = publicMovies.filter((movie) => movie.directorId === director.id);
    const interviews = cineverseData.interviews.filter((interview) => interview.directorId === director.id);
    const movieCount = dataSource === "supabase" ? director.movieCount : films.length;
    const representativeTitle = dataSource === "supabase" ? director.representativeTitle : films[0]?.title;
    const hasInterview = dataSource === "supabase" ? director.interviewCount > 0 : interviews.length > 0;
    return `<a class="director-directory-card" href="${directorUrl(director)}">${directorAvatarMarkup(director)}<div><p>${escapeHtml(country?.name || "不明")} / ${movieCount}作品</p><h2>${escapeHtml(director.name)}</h2><small>${escapeHtml(director.romanName)}</small><span>代表作：${escapeHtml(representativeTitle || "未登録")}${hasInterview ? " ／ インタビューあり" : ""}</span></div><i>↗</i></a>`;
  };

  const interviewCardMarkup = (interview) => {
    const director = interview.director || getDirector(interview.directorId);
    const movie = interview.movie || publicMovies.find((candidate) => candidate.id === interview.movieId);
    return `<a class="interview-directory-card" href="${interviewUrl(interview)}">${directorAvatarMarkup(director, true)}<div><p>INTERVIEW / ${String(interview.publishedAt || "").replaceAll("-", ".")}</p><h2>${escapeHtml(interview.title)}</h2><small>${escapeHtml(director?.name || "不明")} ／ ${escapeHtml(movie?.title || "作品未登録")}</small><span>${escapeHtml(interview.intro)}</span></div><i>↗</i></a>`;
  };

  const renderEditorialDirectories = () => {
    document.querySelectorAll("[data-director-list]").forEach((list) => {
      if (dataSource === "error") { renderDataError(list); return; }
      list.innerHTML = cineverseData.directors.length ? cineverseData.directors.map(directorCardMarkup).join("") : '<p class="no-results">公開中の監督情報はありません。</p>';
    });
    document.querySelectorAll("[data-interview-list]").forEach((list) => {
      if (dataSource === "error") { renderDataError(list); return; }
      list.innerHTML = cineverseData.interviews.length ? cineverseData.interviews.map(interviewCardMarkup).join("") : '<p class="no-results">公開中のインタビューはありません。</p>';
    });
    document.querySelectorAll("[data-feature-list]").forEach((list) => {
      if (dataSource === "error") { renderDataError(list); return; }
      list.innerHTML = cineverseData.articles.length ? cineverseData.articles.map((article) => `<article class="feature-directory-card"><p>${escapeHtml(article.type)} ／ ${String(article.publishedAt || "").replaceAll("-", ".")}</p><h2>${escapeHtml(article.title)}</h2><span>${escapeHtml(article.excerpt)}</span></article>`).join("") : '<p class="no-results">公開中の記事はありません。</p>';
    });
  };

  const videoEmbedMarkup = (movie) => {
    const url = movie.youtubeUrl || "";
    const extractedId = movie.youtubeVideoId || (url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/) || [])[1];
    if (!extractedId) return '<div class="watch-placeholder"><span>YOUTUBE OFFICIAL PLAYER</span><strong>映像URLは未登録です</strong><p>制作者が許可したYouTube公式プレイヤーのみを埋め込みます。外部作品を独自サーバーへ転載しません。</p></div>';
    return `<div class="youtube-embed"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(extractedId)}" title="${escapeHtml(movie.title)} のYouTube動画" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=${escapeHtml(extractedId)}" target="_blank" rel="noopener noreferrer">YouTubeで見る ↗</a></div>`;
  };

  const setSeoForMovie = (movie) => {
    document.title = `${movie.title} | 自主映画ねっと`;
    const description = `${movie.title} — ${movie.summary}`;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) { descriptionMeta = document.createElement("meta"); descriptionMeta.name = "description"; document.head.append(descriptionMeta); }
    descriptionMeta.content = description;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
    canonical.href = dataSource === "supabase" ? `${productionJishuUrl("film.html")}?slug=${encodeURIComponent(movie.slug)}` : productionJishuUrl(`films/${movie.slug}/`);
  };

  const renderFilmDetail = async () => {
    const page = document.querySelector("[data-film-detail]");
    if (!page) return;
    if (dataSource === "error") { renderDataError(page); return; }
    const slug = currentDetailSlug("[data-film-detail]");
    let movie = getMovie(slug);
    try {
      if (dataSource === "supabase" && slug) movie = await repository.getMovieBySlug(slug);
      if (!movie) { page.innerHTML = `<div class="data-empty"><h1>この映画は見つかりませんでした。</h1><p>公開済みの映画一覧からお探しください。</p><a class="button-secondary" href="${jishuUrl("films/")}">映画を探す <span>↗</span></a></div>`; return; }
      if (!publicMovies.some((item) => item.id === movie.id)) publicMovies = uniqueById([...publicMovies, movie]);
      if (!cineverseData.directors.some((item) => item.id === movie.director?.id)) cineverseData.directors = uniqueById([...cineverseData.directors, movie.director]);
      if (!cineverseData.countries.some((item) => item.code === movie.country?.code)) cineverseData.countries = uniqueById([...cineverseData.countries, movie.country]);
      const country = getMovieCountry(movie);
      const director = movie.director || getDirector(movie.directorId);
      const genres = getMovieGenres(movie);
      const interviews = dataSource === "supabase" ? await repository.getInterviewsByMovie(movie.id) : cineverseData.interviews.filter((item) => item.movieId === movie.id);
      const interview = interviews[0] || null;
      const related = dataSource === "supabase" ? await repository.getRelatedMovies(movie) : publicMovies.filter((candidate) => candidate.id !== movie.id && (candidate.genreIds.some((id) => movie.genreIds.includes(id)) || candidate.countryCode === movie.countryCode || candidate.directorId === movie.directorId || candidate.tags.some((tag) => movie.tags.includes(tag)))).slice(0, 3);
      setSeoForMovie(movie);
      page.querySelectorAll("[data-detail-title]").forEach((element) => { element.textContent = movie.title; });
      page.querySelectorAll("[data-detail-original]").forEach((element) => { element.textContent = movie.originalTitle; });
      page.querySelectorAll("[data-detail-country]").forEach((element) => { element.textContent = country?.name || "不明"; });
      page.querySelectorAll("[data-detail-year]").forEach((element) => { element.textContent = String(movie.releaseYear || "—"); });
      page.querySelectorAll("[data-detail-runtime]").forEach((element) => { element.textContent = movie.durationMinutes ? `${movie.durationMinutes}分` : "—"; });
      page.querySelectorAll("[data-detail-genre]").forEach((element) => { element.textContent = genres.map((genre) => genre.name).join("・") || "未登録"; });
      page.querySelectorAll("[data-detail-language]").forEach((element) => { element.textContent = movie.originalLanguage || "未登録"; });
      page.querySelectorAll("[data-detail-subtitles]").forEach((element) => { element.textContent = movie.subtitleLanguages?.length ? movie.subtitleLanguages.join("・") : "未登録"; });
      page.querySelectorAll("[data-detail-summary]").forEach((element) => { element.textContent = movie.summary || "紹介文は準備中です。"; });
      page.querySelectorAll("[data-detail-description]").forEach((element) => { element.textContent = movie.translatedDescription || "日本語紹介文は準備中です。"; });
      page.querySelectorAll("[data-detail-tags]").forEach((element) => { element.innerHTML = toArray(movie.tags).map((tag) => `<span># ${escapeHtml(tag)}</span>`).join(""); });
      page.querySelectorAll("[data-detail-poster]").forEach((element) => { element.innerHTML = posterMarkup(movie); });
      page.querySelectorAll("[data-detail-video]").forEach((element) => { element.innerHTML = videoEmbedMarkup(movie); });
      page.querySelectorAll("[data-detail-original-description]").forEach((element) => { element.textContent = movie.originalDescription || "制作者による原文情報は、確認・登録後に掲載します。"; });
      page.querySelectorAll("[data-detail-director-card]").forEach((element) => {
        element.innerHTML = director ? `${directorAvatarMarkup(director)}<div><p>${escapeHtml(country?.name || "不明")} / DIRECTOR</p><h2>${escapeHtml(director.name)}</h2><small>${escapeHtml(director.romanName)}</small><p>${escapeHtml(director.bio || "プロフィールは準備中です。")}</p><div><a class="button-secondary" href="${directorUrl(director)}">監督について <span>↗</span></a>${interview ? `<a class="text-link" href="${interviewUrl(interview)}">インタビューを読む ↗</a>` : ""}</div></div>` : "";
      });
      page.querySelectorAll("[data-detail-interview-section]").forEach((element) => {
        if (!interview) { element.hidden = true; return; }
        element.hidden = false;
        element.innerHTML = `<p class="eyebrow">INTERVIEW</p><h2>監督に聞きました。</h2><p>${escapeHtml(interview.intro)}</p><a class="button-secondary" href="${interviewUrl(interview)}">インタビューを読む <span>↗</span></a>`;
      });
      page.querySelectorAll("[data-related-films]").forEach((element) => { element.innerHTML = related.length ? related.map(filmCardMarkup).join("") : '<p class="no-results">関連作品は準備中です。</p>'; });
    } catch (error) { renderDataError(page); }
  };

  const renderDirectorDetail = async () => {
    const page = document.querySelector("[data-director-detail]");
    if (!page) return;
    if (dataSource === "error") { renderDataError(page); return; }
    const slug = currentDetailSlug("[data-director-detail]");
    let director = cineverseData.directors.find((candidate) => candidate.slug === slug);
    try {
      if (dataSource === "supabase" && slug) director = await repository.getDirectorBySlug(slug);
      if (!director) { page.innerHTML = `<div class="data-empty"><h1>この監督は見つかりませんでした。</h1><a class="button-secondary" href="${jishuUrl("directors/")}">監督を探す <span>↗</span></a></div>`; return; }
      const country = cineverseData.countries.find((candidate) => candidate.id === director.countryId) || null;
      const films = dataSource === "supabase" ? await repository.getMoviesByDirector(director.id) : publicMovies.filter((movie) => movie.directorId === director.id);
      const interviews = dataSource === "supabase" ? await repository.getInterviewsByDirector(director.id) : cineverseData.interviews.filter((interview) => interview.directorId === director.id);
      document.title = `${director.name} | 自主映画ねっと`;
      page.querySelectorAll("[data-director-name]").forEach((element) => { element.textContent = director.name; });
      page.querySelectorAll("[data-director-roman]").forEach((element) => { element.textContent = director.romanName; });
      page.querySelectorAll("[data-director-country]").forEach((element) => { element.textContent = country?.name || "未登録"; });
      page.querySelectorAll("[data-director-bio]").forEach((element) => { element.textContent = director.bio || "プロフィールは準備中です。"; });
      page.querySelectorAll("[data-director-avatar]").forEach((element) => { element.innerHTML = directorAvatarMarkup(director); });
      page.querySelectorAll("[data-director-works]").forEach((element) => { element.innerHTML = films.length ? films.map(filmCardMarkup).join("") : '<p class="no-results">公開中の作品はありません。</p>'; });
      page.querySelectorAll("[data-director-interviews]").forEach((element) => { element.innerHTML = interviews.length ? interviews.map(interviewCardMarkup).join("") : '<p class="no-results">公開中のインタビューはありません。</p>'; });
      page.querySelectorAll("[data-director-links]").forEach((element) => { element.hidden = !director.officialWebsite && !director.socialLinks?.length; });
    } catch (error) { renderDataError(page); }
  };

  const renderInterviewDetail = async () => {
    const page = document.querySelector("[data-interview-detail]");
    if (!page) return;
    if (dataSource === "error") { renderDataError(page); return; }
    const slug = currentDetailSlug("[data-interview-detail]");
    let interview = cineverseData.interviews.find((candidate) => candidate.slug === slug);
    try {
      if (dataSource === "supabase" && slug) interview = await repository.getInterviewBySlug(slug);
      if (!interview) { page.innerHTML = `<div class="data-empty"><h1>このインタビューは見つかりませんでした。</h1><a class="button-secondary" href="${jishuUrl("interviews/")}">インタビュー一覧 <span>↗</span></a></div>`; return; }
      const director = interview.director || getDirector(interview.directorId);
      const movie = interview.movie || publicMovies.find((candidate) => candidate.id === interview.movieId);
      document.title = `${interview.title} | 自主映画ねっと`;
      page.querySelectorAll("[data-interview-title]").forEach((element) => { element.textContent = interview.title; });
      page.querySelectorAll("[data-interview-intro]").forEach((element) => { element.textContent = interview.intro; });
      page.querySelectorAll("[data-interview-director]").forEach((element) => { element.textContent = director?.name || "不明"; });
      page.querySelectorAll("[data-interview-date]").forEach((element) => { element.textContent = String(interview.publishedAt || "").replaceAll("-", "."); });
      page.querySelectorAll("[data-interview-movie]").forEach((element) => { element.textContent = movie?.title || "作品未登録"; if (movie) element.href = movieUrl(movie); });
      page.querySelectorAll("[data-interview-qa]").forEach((element) => { element.innerHTML = toArray(interview.questionsAndAnswers).map((item, index) => `<section class="interview-qa"><h2><span>Q${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.editedAnswer || item.translatedAnswer || "回答は準備中です。")}</p></section>`).join("") || '<p class="no-results">本文は準備中です。</p>'; });
      page.querySelectorAll("[data-interview-director-card]").forEach((element) => { element.innerHTML = director ? `${directorAvatarMarkup(director, true)}<div><p>DIRECTOR</p><h2>${escapeHtml(director.name)}</h2><a href="${directorUrl(director)}">監督プロフィールを見る ↗</a></div>` : ""; });
      page.querySelectorAll("[data-interview-movie-card]").forEach((element) => { element.innerHTML = movie ? `<a href="${movieUrl(movie)}">${posterMarkup(movie, true)}<span>${escapeHtml(movie.title)} ↗</span></a>` : ""; });
    } catch (error) { renderDataError(page); }
  };

  const initialiseTown = () => {
    const town = document.querySelector("[data-town]");
    if (!town) return;
    const townMovies = publicMovies.filter((movie) => movie.townFeatured);
    document.querySelectorAll("[data-town-film]").forEach((element, index) => {
      const movie = getMovie(element.dataset.townFilm) || townMovies[index % townMovies.length];
      if (!movie) return;
      element.dataset.filmOpen = movie.slug;
      const title = element.querySelector("[data-town-film-title]");
      if (title) title.textContent = movie.title;
      if (element.tagName === "A") element.href = movieUrl(movie);
    });
    const featuredMovie = publicMovies.find((movie) => movie.featured) || townMovies[0];
    document.querySelectorAll("[data-town-featured]").forEach((element) => {
      if (!featuredMovie) { element.hidden = true; return; }
      const title = element.querySelector("[data-town-featured-title]");
      const original = element.querySelector("[data-town-featured-original]");
      const description = element.querySelector("[data-town-featured-description]");
      const poster = element.querySelector("[data-town-featured-poster]");
      const facts = element.querySelector("[data-town-featured-facts]");
      const detail = element.querySelector("[data-town-featured-detail]");
      const trailer = element.querySelector("[data-town-featured-trailer]");
      const country = getMovieCountry(featuredMovie);
      const director = featuredMovie.director || getDirector(featuredMovie.directorId);
      if (title) title.textContent = featuredMovie.title;
      if (original) original.textContent = featuredMovie.originalTitle;
      if (description) description.textContent = featuredMovie.translatedDescription;
      if (poster) poster.innerHTML = posterMarkup(featuredMovie);
      if (facts) facts.innerHTML = `<div><dt>国</dt><dd>${escapeHtml(country?.name || "不明")}</dd></div><div><dt>上映時間</dt><dd>${featuredMovie.durationMinutes || "—"}分</dd></div><div><dt>監督</dt><dd>${escapeHtml(director?.name || "不明")}</dd></div>`;
      if (detail) detail.href = movieUrl(featuredMovie);
      if (trailer) trailer.dataset.filmOpen = featuredMovie.slug;
    });
    const seasonLabels = { spring: "SPRING / 2026", summer: "SUMMER / 2026", autumn: "AUTUMN / 2026", winter: "WINTER / 2026" };
    const seasonLabel = document.querySelector("[data-season-label]");
    const setSeason = (season) => { document.body.dataset.season = season; if (seasonLabel) seasonLabel.textContent = seasonLabels[season]; };
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setSeason(entry.target.dataset.seasonScene); }), { threshold: 0.55 });
      town.querySelectorAll("[data-season-scene]").forEach((scene) => observer.observe(scene));
    }
    window.addEventListener("scroll", () => { if (town.getBoundingClientRect().top >= -1) setSeason("spring"); }, { passive: true });
    const filmDialog = document.querySelector("#film-dialog");
    const sponsorDialog = document.querySelector("#sponsor-dialog");
    const openDialog = (dialog) => { if (!dialog) return; if (typeof dialog.showModal === "function") dialog.showModal(); else { dialog.setAttribute("open", ""); dialog.setAttribute("aria-modal", "true"); } };
    const closeDialog = (dialog) => { if (!dialog) return; if (typeof dialog.close === "function") dialog.close(); else { dialog.removeAttribute("open"); dialog.removeAttribute("aria-modal"); } };
    document.querySelectorAll("[data-film-open]").forEach((trigger) => trigger.addEventListener("click", (event) => {
      const movie = getMovie(trigger.dataset.filmOpen);
      if (!movie || !filmDialog) return;
      if (trigger.tagName === "A") event.preventDefault();
      const country = getMovieCountry(movie);
      const genres = getMovieGenres(movie);
      const director = movie.director || getDirector(movie.directorId);
      filmDialog.querySelector("[data-film-title]").textContent = movie.title;
      filmDialog.querySelector("[data-film-meta]").textContent = `${country?.name || "不明"} / ${movie.releaseYear || "—"} / ${movie.durationMinutes || "—"} MIN / ${genres.map((genre) => genre.label).join("・")}`;
      filmDialog.querySelector("[data-film-byline]").textContent = `監督：${director?.name || "不明"}`;
      const detailLink = filmDialog.querySelector("[data-film-page]");
      if (detailLink) detailLink.href = movieUrl(movie);
      openDialog(filmDialog);
    }));
    document.querySelectorAll("[data-open-sponsor]").forEach((button) => button.addEventListener("click", () => openDialog(sponsorDialog)));
    const motionStops = document.querySelectorAll("[data-motion-stop]");
    motionStops.forEach((button) => button.addEventListener("click", () => { const stopped = document.body.classList.toggle("is-town-motion-off"); motionStops.forEach((control) => { control.textContent = stopped ? "アニメーションを再生する" : "アニメーションを停止する"; }); }));
    const playDemo = filmDialog?.querySelector("[data-play-demo]");
    const playCopy = filmDialog?.querySelector("[data-play-copy]");
    playDemo?.addEventListener("click", () => { const playing = playDemo.classList.toggle("is-playing"); playDemo.textContent = playing ? "Ⅱ" : "▶"; if (playCopy) playCopy.textContent = playing ? "TRAILER ROOM / DEMO PLAYING" : "TRAILER ROOM / DEMO DATA"; });
    [filmDialog, sponsorDialog].filter(Boolean).forEach((dialog) => dialog.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); closeDialog(dialog); })));
  };

  const initialiseRandomDiscovery = () => {
    document.querySelectorAll("[data-random-film]").forEach((button) => button.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        const movie = dataSource === "supabase" ? await repository.getRandomPublishedMovie() : publicMovies[Math.floor(Math.random() * publicMovies.length)];
        if (movie) window.location.assign(movieUrl(movie));
      } catch (error) { window.location.assign(jishuUrl("films/")); }
    }));
  };

  const initialiseJishu = async () => {
    renderJishuNavigation();
    document.querySelectorAll("[data-film-list], [data-country-list], [data-genre-list], [data-director-list], [data-interview-list], [data-feature-list]").forEach(renderLoading);
    await loadInitialData();
    setMovieCount();
    filterMovieList();
    renderCountryAndGenreDirectories();
    renderEditorialDirectories();
    await renderFilmDetail();
    await renderDirectorDetail();
    await renderInterviewDetail();
    initialiseTown();
    initialiseRandomDiscovery();
    document.querySelectorAll("[data-reload-data]").forEach((button) => button.addEventListener("click", () => window.location.reload()));
  };

  initialiseSharedInteractions();
  if (jishuBasePath) initialiseJishu();
})();
