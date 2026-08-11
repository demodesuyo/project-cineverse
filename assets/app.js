const cineverseData = window.CINEVERSE_DATA || { countries: [], genres: [], directors: [], movies: [], interviews: [], articles: [] };
const publicMovies = cineverseData.movies.filter((movie) => movie.status === "published");
const pathName = window.location.pathname;
const jishuSegment = "/jishu-eiga-net/";
const jishuSegmentIndex = pathName.indexOf(jishuSegment);
const jishuBasePath = jishuSegmentIndex >= 0 ? pathName.slice(0, jishuSegmentIndex + jishuSegment.length) : "";
const jishuRoute = jishuBasePath ? pathName.slice(jishuBasePath.length) : "";
const jishuUrl = (route = "") => `${jishuBasePath}${route}`;
const productionJishuUrl = (route = "") => `https://demodesuyo.github.io/project-cineverse/jishu-eiga-net/${route}`;

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const getMovie = (slug) => publicMovies.find((movie) => movie.slug === slug);
const getDirector = (id) => cineverseData.directors.find((director) => director.id === id);
const getCountry = (code) => cineverseData.countries.find((country) => country.code === code);
const getGenre = (id) => cineverseData.genres.find((genre) => genre.id === id);
const getMovieGenres = (movie) => movie.genreIds.map(getGenre).filter(Boolean);
const getMovieCountry = (movie) => getCountry(movie.countryCode);
const movieUrl = (movie) => jishuUrl(`films/${movie.slug}/`);
const directorUrl = (director) => jishuUrl(`directors/${director.slug}/`);
const interviewUrl = (interview) => jishuUrl(`interviews/${interview.slug}/`);
const countriesWithMovies = () => cineverseData.countries.filter((country) => publicMovies.some((movie) => movie.countryCode === country.code));
const genresWithMovies = () => cineverseData.genres.filter((genre) => publicMovies.some((movie) => movie.genreIds.includes(genre.id)));
const countMovies = (predicate) => publicMovies.filter(predicate).length;

const renderJishuNavigation = () => {
  if (!jishuBasePath) return;
  const navItems = [
    { label: "街を歩く", route: "", active: jishuRoute === "" || jishuRoute === "index.html" },
    { label: "映画を探す", route: "films/", active: jishuRoute.startsWith("films/") },
    { label: "国から探す", route: "countries/", active: jishuRoute.startsWith("countries/") },
    { label: "ジャンル", route: "genres/", active: jishuRoute.startsWith("genres/") },
    { label: "監督", route: "directors/", active: jishuRoute.startsWith("directors/") },
    { label: "インタビュー", route: "interviews/", active: jishuRoute.startsWith("interviews/") },
    { label: "特集・制作日記", route: "features/", active: jishuRoute.startsWith("features/") },
    { label: "自主映画ねっとについて", route: "about.html", active: jishuRoute === "about.html" },
  ];
  document.querySelectorAll(".site-nav").forEach((nav) => {
    nav.innerHTML = `${navItems.map((item) => `<a href="${jishuUrl(item.route)}"${item.active ? ' aria-current="page"' : ""}>${item.label}</a>`).join("")}<a class="nav-service" href="${jishuUrl("../eiga-kantoku/index.html")}">映画監督になろう ↗</a>`;
  });
};

renderJishuNavigation();

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

const posterMarkup = (movie, compact = false) => {
  const country = getMovieCountry(movie);
  const style = movie.poster?.style || "placeholder";
  return `<div class="film-poster film-poster--${escapeHtml(style)}${compact ? " film-poster--compact" : ""}" aria-hidden="true"><span>${escapeHtml(country?.code || "--")}</span><strong>${escapeHtml(movie.title)}</strong><i>${movie.releaseYear}</i></div>`;
};

const directorInitials = (director) => director.romanName.split(" ").map((part) => part[0]).join("").slice(0, 2);
const directorAvatarMarkup = (director, small = false) => `<div class="director-avatar${small ? " director-avatar--small" : ""}" aria-hidden="true"><span>${escapeHtml(directorInitials(director))}</span></div>`;

const filmCardMarkup = (movie) => {
  const country = getMovieCountry(movie);
  const director = getDirector(movie.directorId);
  const genres = getMovieGenres(movie);
  const badges = [movie.isNew ? "NEW" : "", movie.featured ? "FEATURED" : ""].filter(Boolean);
  return `<a class="database-film-card" href="${movieUrl(movie)}">${posterMarkup(movie)}<div class="database-film-card__body"><div class="film-card-badges">${badges.map((badge) => `<span>${badge}</span>`).join("")}</div><p>${escapeHtml(country?.name || "不明")} <span>／</span> ${escapeHtml(genres.map((genre) => genre.name).join("・"))}</p><h2>${escapeHtml(movie.title)}</h2><small>${escapeHtml(movie.originalTitle)}</small><dl><div><dt>公開年</dt><dd>${movie.releaseYear}</dd></div><div><dt>上映時間</dt><dd>${movie.durationMinutes}分</dd></div><div><dt>監督</dt><dd>${escapeHtml(director?.name || "不明")}</dd></div></dl>${movie.subtitleLanguages.length ? `<em>字幕：${escapeHtml(movie.subtitleLanguages.join("・"))}</em>` : ""}</div></a>`;
};

document.querySelectorAll("[data-film-count]").forEach((element) => { element.textContent = String(publicMovies.length); });

const filterMovieList = () => {
  const lists = document.querySelectorAll("[data-film-list]");
  if (!lists.length) return;

  const params = new URLSearchParams(window.location.search);
  const state = {
    query: params.get("q") || "",
    country: params.get("country") || "",
    genre: params.get("genre") || "",
    duration: params.get("duration") || "",
    year: params.get("year") || "",
    language: params.get("language") || "",
    subtitle: params.get("subtitle") || "",
    sort: params.get("sort") || "new",
  };
  const controls = [...document.querySelectorAll("[data-filter-key]")];
  const optionMap = {
    country: countriesWithMovies().map((country) => ({ value: country.code, label: country.name })),
    genre: genresWithMovies().map((genre) => ({ value: genre.id, label: genre.name })),
    year: [...new Set(publicMovies.map((movie) => movie.releaseYear))].sort((a, b) => b - a).map((year) => ({ value: year, label: `${year}年` })),
    language: [...new Set(publicMovies.map((movie) => movie.originalLanguage))].sort().map((language) => ({ value: language, label: language })),
    subtitle: [...new Set(publicMovies.flatMap((movie) => movie.subtitleLanguages))].sort().map((language) => ({ value: language, label: `${language}字幕` })),
  };
  const populateSelect = (control) => {
    const key = control.dataset.filterKey;
    if (!optionMap[key]) return;
    const labels = { country: "すべての国", genre: "すべてのジャンル", year: "すべての公開年", language: "すべての言語", subtitle: "字幕を問わない" };
    control.innerHTML = `<option value="">${labels[key]}</option>${optionMap[key].map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("")}`;
  };
  controls.forEach(populateSelect);
  const syncControls = () => controls.forEach((control) => { const key = control.dataset.filterKey; if (key in state) control.value = state[key]; });
  const matchesDuration = (movie) => ({ "under-15": movie.durationMinutes <= 15, "15-30": movie.durationMinutes > 15 && movie.durationMinutes <= 30, "30-60": movie.durationMinutes > 30 && movie.durationMinutes <= 60, "over-60": movie.durationMinutes > 60 })[state.duration] ?? true;
  const getFiltered = () => publicMovies.filter((movie) => {
    const country = getMovieCountry(movie);
    const director = getDirector(movie.directorId);
    const genreNames = getMovieGenres(movie).map((genre) => `${genre.name} ${genre.label}`);
    const haystack = [movie.title, movie.originalTitle, movie.translatedDescription, movie.summary, country?.name, director?.name, ...genreNames, ...movie.tags].join(" ").toLocaleLowerCase("ja");
    return (!state.query || haystack.includes(state.query.toLocaleLowerCase("ja")))
      && (!state.country || movie.countryCode === state.country)
      && (!state.genre || movie.genreIds.includes(state.genre))
      && matchesDuration(movie)
      && (!state.year || String(movie.releaseYear) === state.year)
      && (!state.language || movie.originalLanguage === state.language)
      && (!state.subtitle || movie.subtitleLanguages.includes(state.subtitle));
  });
  const updateUrl = () => {
    const url = new URL(window.location.href);
    Object.entries(state).forEach(([key, value]) => {
      if (!value || (key === "sort" && value === "new")) url.searchParams.delete(key);
      else url.searchParams.set(key === "query" ? "q" : key, value);
    });
    history.replaceState({}, "", url);
  };
  const render = () => {
    const filtered = getFiltered();
    filtered.sort((a, b) => {
      if (state.sort === "release-year") return b.releaseYear - a.releaseYear || b.publishedAt.localeCompare(a.publishedAt);
      if (state.sort === "featured") return Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt);
      return b.publishedAt.localeCompare(a.publishedAt);
    });
    lists.forEach((list) => { list.innerHTML = filtered.length ? filtered.map(filmCardMarkup).join("") : '<div class="no-results"><p>条件に一致する映画が見つかりませんでした。</p><button type="button" data-clear-filters>フィルターを解除する</button></div>'; });
    document.querySelectorAll("[data-film-result-count]").forEach((element) => { element.textContent = `${filtered.length}作品見つかりました`; });
    document.querySelectorAll("[data-active-filter-count]").forEach((element) => { element.textContent = String(Object.entries(state).filter(([key, value]) => value && key !== "sort").length); });
    updateUrl();
  };
  const reset = () => {
    Object.assign(state, { query: "", country: "", genre: "", duration: "", year: "", language: "", subtitle: "", sort: "new" });
    syncControls();
    render();
  };
  controls.forEach((control) => control.addEventListener("input", () => { state[control.dataset.filterKey] = control.value; syncControls(); render(); }));
  lists.forEach((list) => list.addEventListener("click", (event) => { if (event.target.closest("[data-clear-filters]")) reset(); }));
  document.querySelectorAll("[data-filter-reset]").forEach((button) => button.addEventListener("click", reset));
  const filterDialog = document.querySelector("#filter-dialog");
  const openFilterDialog = () => { if (!filterDialog) return; if (typeof filterDialog.showModal === "function") filterDialog.showModal(); else filterDialog.setAttribute("open", ""); };
  const closeFilterDialog = () => { if (!filterDialog) return; if (typeof filterDialog.close === "function") filterDialog.close(); else filterDialog.removeAttribute("open"); };
  document.querySelectorAll("[data-open-filter]").forEach((button) => button.addEventListener("click", openFilterDialog));
  document.querySelectorAll("[data-close-filter]").forEach((button) => button.addEventListener("click", closeFilterDialog));
  document.querySelectorAll("[data-apply-filter]").forEach((button) => button.addEventListener("click", closeFilterDialog));
  syncControls();
  render();
};

filterMovieList();

document.querySelectorAll("[data-country-list]").forEach((list) => {
  list.innerHTML = countriesWithMovies().map((country) => `<a class="country-directory-card" href="${jishuUrl(`films/?country=${encodeURIComponent(country.code)}`)}"><b>${country.code}</b><h2>${escapeHtml(country.name)}</h2><p>${escapeHtml(country.region)}</p><span>${countMovies((movie) => movie.countryCode === country.code)}作品 ↗</span></a>`).join("");
});

document.querySelectorAll("[data-genre-list]").forEach((list) => {
  list.innerHTML = genresWithMovies().map((genre) => `<a class="genre-directory-card" href="${jishuUrl(`films/?genre=${encodeURIComponent(genre.id)}`)}"><p>${genre.label}</p><h2>${escapeHtml(genre.name)}</h2><span>${countMovies((movie) => movie.genreIds.includes(genre.id))}作品 ↗</span></a>`).join("");
});

const directorCardMarkup = (director) => {
  const country = getCountry(director.countryCode);
  const films = publicMovies.filter((movie) => movie.directorId === director.id);
  const interviews = cineverseData.interviews.filter((interview) => interview.directorId === director.id && interview.status === "published");
  return `<a class="director-directory-card" href="${directorUrl(director)}">${directorAvatarMarkup(director)}<div><p>${escapeHtml(country?.name || "不明")} / ${films.length}作品</p><h2>${escapeHtml(director.name)}</h2><small>${escapeHtml(director.romanName)}</small><span>代表作：${escapeHtml(films[0]?.title || "未登録")}${interviews.length ? " ／ インタビューあり" : ""}</span></div><i>↗</i></a>`;
};

document.querySelectorAll("[data-director-list]").forEach((list) => { list.innerHTML = cineverseData.directors.map(directorCardMarkup).join(""); });

const interviewCardMarkup = (interview) => {
  const director = getDirector(interview.directorId);
  const movie = publicMovies.find((candidate) => candidate.id === interview.movieId);
  return `<a class="interview-directory-card" href="${interviewUrl(interview)}">${directorAvatarMarkup(director, true)}<div><p>INTERVIEW / ${interview.publishedAt.replaceAll("-", ".")}</p><h2>${escapeHtml(interview.title)}</h2><small>${escapeHtml(director?.name || "不明")} ／ ${escapeHtml(movie?.title || "作品未登録")}</small><span>${escapeHtml(interview.intro)}</span></div><i>↗</i></a>`;
};

document.querySelectorAll("[data-interview-list]").forEach((list) => { list.innerHTML = cineverseData.interviews.filter((interview) => interview.status === "published").map(interviewCardMarkup).join(""); });
document.querySelectorAll("[data-feature-list]").forEach((list) => { list.innerHTML = cineverseData.articles.filter((article) => article.status === "published").map((article) => `<article class="feature-directory-card"><p>${article.type} ／ ${article.publishedAt.replaceAll("-", ".")}</p><h2>${escapeHtml(article.title)}</h2><span>${escapeHtml(article.excerpt)}</span></article>`).join(""); });

const videoEmbedMarkup = (movie) => {
  const url = movie.youtubeUrl || "";
  const extractedId = movie.youtubeVideoId || (url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/) || [])[1];
  if (!extractedId) return '<div class="watch-placeholder"><span>YOUTUBE OFFICIAL PLAYER</span><strong>映像URLは未登録です</strong><p>正式公開時は、制作者が許可したYouTube公式プレイヤーのみを埋め込みます。外部作品を独自サーバーへ転載しません。</p></div>';
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
  canonical.href = productionJishuUrl(`films/${movie.slug}/`);
  [["og:title", `${movie.title} | 自主映画ねっと`], ["og:description", description]].forEach(([property, content]) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("property", property); document.head.append(meta); }
    meta.content = content;
  });
};

document.querySelectorAll("[data-film-detail]").forEach((page) => {
  const movie = getMovie(page.dataset.filmDetail);
  if (!movie) return;
  const country = getMovieCountry(movie);
  const director = getDirector(movie.directorId);
  const genres = getMovieGenres(movie);
  const interview = cineverseData.interviews.find((candidate) => candidate.movieId === movie.id && candidate.status === "published");
  setSeoForMovie(movie);
  page.querySelectorAll("[data-detail-title]").forEach((element) => { element.textContent = movie.title; });
  page.querySelectorAll("[data-detail-original]").forEach((element) => { element.textContent = movie.originalTitle; });
  page.querySelectorAll("[data-detail-country]").forEach((element) => { element.textContent = country?.name || "不明"; });
  page.querySelectorAll("[data-detail-year]").forEach((element) => { element.textContent = String(movie.releaseYear); });
  page.querySelectorAll("[data-detail-runtime]").forEach((element) => { element.textContent = `${movie.durationMinutes}分`; });
  page.querySelectorAll("[data-detail-genre]").forEach((element) => { element.textContent = genres.map((genre) => genre.name).join("・") || "不明"; });
  page.querySelectorAll("[data-detail-language]").forEach((element) => { element.textContent = movie.originalLanguage || "不明"; });
  page.querySelectorAll("[data-detail-subtitles]").forEach((element) => { element.textContent = movie.subtitleLanguages.length ? movie.subtitleLanguages.join("・") : "不明"; });
  page.querySelectorAll("[data-detail-summary]").forEach((element) => { element.textContent = movie.summary || "不明"; });
  page.querySelectorAll("[data-detail-description]").forEach((element) => { element.textContent = movie.translatedDescription || "不明"; });
  page.querySelectorAll("[data-detail-tags]").forEach((element) => { element.innerHTML = movie.tags.map((tag) => `<span># ${escapeHtml(tag)}</span>`).join(""); });
  page.querySelectorAll("[data-detail-poster]").forEach((element) => { element.innerHTML = posterMarkup(movie); });
  page.querySelectorAll("[data-detail-video]").forEach((element) => { element.innerHTML = videoEmbedMarkup(movie); });
  page.querySelectorAll("[data-detail-original-description]").forEach((element) => { element.textContent = movie.originalDescription || "制作者による原文情報は、正式公開時に確認・登録します。"; });
  page.querySelectorAll("[data-detail-director-card]").forEach((element) => {
    element.innerHTML = `${directorAvatarMarkup(director)}<div><p>${escapeHtml(country?.name || "不明")} / DIRECTOR</p><h2>${escapeHtml(director.name)}</h2><small>${escapeHtml(director.romanName)}</small><p>${escapeHtml(director.bio || "プロフィールは準備中です。")}</p><div><a class="button-secondary" href="${directorUrl(director)}">監督について <span>↗</span></a>${interview ? `<a class="text-link" href="${interviewUrl(interview)}">インタビューを読む ↗</a>` : ""}</div></div>`;
  });
  page.querySelectorAll("[data-detail-interview-section]").forEach((element) => {
    if (!interview) { element.hidden = true; return; }
    element.innerHTML = `<p class="eyebrow">INTERVIEW</p><h2>監督に聞きました。</h2><p>${escapeHtml(interview.intro)}</p><a class="button-secondary" href="${interviewUrl(interview)}">インタビューを読む <span>↗</span></a>`;
  });
  const related = publicMovies.filter((candidate) => candidate.id !== movie.id && (candidate.genreIds.some((id) => movie.genreIds.includes(id)) || candidate.countryCode === movie.countryCode || candidate.directorId === movie.directorId || candidate.tags.some((tag) => movie.tags.includes(tag)))).slice(0, 3);
  page.querySelectorAll("[data-related-films]").forEach((element) => { element.innerHTML = related.map(filmCardMarkup).join(""); });
});

document.querySelectorAll("[data-director-detail]").forEach((page) => {
  const director = cineverseData.directors.find((candidate) => candidate.slug === page.dataset.directorDetail);
  if (!director) return;
  const country = getCountry(director.countryCode);
  const films = publicMovies.filter((movie) => movie.directorId === director.id);
  const interviews = cineverseData.interviews.filter((interview) => interview.directorId === director.id && interview.status === "published");
  document.title = `${director.name} | 自主映画ねっと`;
  page.querySelectorAll("[data-director-name]").forEach((element) => { element.textContent = director.name; });
  page.querySelectorAll("[data-director-roman]").forEach((element) => { element.textContent = director.romanName; });
  page.querySelectorAll("[data-director-country]").forEach((element) => { element.textContent = country?.name || "不明"; });
  page.querySelectorAll("[data-director-bio]").forEach((element) => { element.textContent = director.bio || "プロフィールは準備中です。"; });
  page.querySelectorAll("[data-director-avatar]").forEach((element) => { element.innerHTML = directorAvatarMarkup(director); });
  page.querySelectorAll("[data-director-works]").forEach((element) => { element.innerHTML = films.map(filmCardMarkup).join(""); });
  page.querySelectorAll("[data-director-interviews]").forEach((element) => { element.innerHTML = interviews.length ? interviews.map(interviewCardMarkup).join("") : '<p class="no-results">公開中のインタビューはありません。</p>'; });
  page.querySelectorAll("[data-director-links]").forEach((element) => { element.hidden = !director.officialWebsite && !director.socialLinks.length; });
});

document.querySelectorAll("[data-interview-detail]").forEach((page) => {
  const interview = cineverseData.interviews.find((candidate) => candidate.slug === page.dataset.interviewDetail && candidate.status === "published");
  if (!interview) return;
  const director = getDirector(interview.directorId);
  const movie = publicMovies.find((candidate) => candidate.id === interview.movieId);
  document.title = `${interview.title} | 自主映画ねっと`;
  page.querySelectorAll("[data-interview-title]").forEach((element) => { element.textContent = interview.title; });
  page.querySelectorAll("[data-interview-intro]").forEach((element) => { element.textContent = interview.intro; });
  page.querySelectorAll("[data-interview-director]").forEach((element) => { element.textContent = director?.name || "不明"; });
  page.querySelectorAll("[data-interview-date]").forEach((element) => { element.textContent = interview.publishedAt.replaceAll("-", "."); });
  page.querySelectorAll("[data-interview-movie]").forEach((element) => { element.textContent = movie?.title || "不明"; element.href = movie ? movieUrl(movie) : "#"; });
  page.querySelectorAll("[data-interview-qa]").forEach((element) => { element.innerHTML = interview.questionsAndAnswers.map((item, index) => `<section class="interview-qa"><h2><span>Q${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.editedAnswer || item.translatedAnswer || "回答は準備中です。")}</p></section>`).join(""); });
  page.querySelectorAll("[data-interview-director-card]").forEach((element) => { element.innerHTML = `${directorAvatarMarkup(director, true)}<div><p>DIRECTOR</p><h2>${escapeHtml(director.name)}</h2><a href="${directorUrl(director)}">監督プロフィールを見る ↗</a></div>`; });
  page.querySelectorAll("[data-interview-movie-card]").forEach((element) => { element.innerHTML = movie ? `<a href="${movieUrl(movie)}">${posterMarkup(movie, true)}<span>${escapeHtml(movie.title)} ↗</span></a>` : ""; });
});

const town = document.querySelector("[data-town]");
if (town) {
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
    if (!featuredMovie) return;
    const title = element.querySelector("[data-town-featured-title]");
    const original = element.querySelector("[data-town-featured-original]");
    const description = element.querySelector("[data-town-featured-description]");
    const poster = element.querySelector("[data-town-featured-poster]");
    const facts = element.querySelector("[data-town-featured-facts]");
    const detail = element.querySelector("[data-town-featured-detail]");
    const trailer = element.querySelector("[data-town-featured-trailer]");
    if (title) title.textContent = featuredMovie.title;
    if (original) original.textContent = featuredMovie.originalTitle;
    if (description) description.textContent = featuredMovie.translatedDescription;
    if (poster) poster.innerHTML = posterMarkup(featuredMovie);
    if (facts) { const country = getMovieCountry(featuredMovie); const director = getDirector(featuredMovie.directorId); facts.innerHTML = `<div><dt>国</dt><dd>${escapeHtml(country?.name || "不明")}</dd></div><div><dt>上映時間</dt><dd>${featuredMovie.durationMinutes}分</dd></div><div><dt>監督</dt><dd>${escapeHtml(director?.name || "不明")}</dd></div>`; }
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
    const director = getDirector(movie.directorId);
    filmDialog.querySelector("[data-film-title]").textContent = movie.title;
    filmDialog.querySelector("[data-film-meta]").textContent = `${country?.name || "不明"} / ${movie.releaseYear} / ${movie.durationMinutes} MIN / ${genres.map((genre) => genre.label).join("・")}`;
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
  playDemo?.addEventListener("click", () => {
    const isPlaying = playDemo.classList.toggle("is-playing");
    playDemo.textContent = isPlaying ? "Ⅱ" : "▶";
    if (playCopy) playCopy.textContent = isPlaying ? "TRAILER ROOM / DEMO PLAYING" : "TRAILER ROOM / DEMO DATA";
  });
  [filmDialog, sponsorDialog].filter(Boolean).forEach((dialog) => dialog.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); closeDialog(dialog); })));
}

document.querySelectorAll("[data-random-film]").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); const movie = publicMovies[Math.floor(Math.random() * publicMovies.length)]; if (movie) window.location.assign(movieUrl(movie)); }));
