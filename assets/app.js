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
    message.textContent = name
      ? `${name}さん、登録の準備ができました。次の画面でプロフィールを作成しましょう。`
      : "お名前を入力してください。";
  });
});

const cineverseFilms = window.CINEVERSE_FILMS || [];
const cineverseArticles = window.CINEVERSE_ARTICLES || [];
const getFilm = (slug) => cineverseFilms.find((film) => film.slug === slug);
const detailUrl = (film) => {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  if (/\/films\/[^/]+$/.test(pathname)) return `../${film.slug}/`;
  if (/\/films$/.test(pathname)) return `${film.slug}/`;
  return `films/${film.slug}/`;
};
const posterMarkup = (film, compact = false) => `
  <div class="film-poster film-poster--${film.poster}${compact ? " film-poster--compact" : ""}" aria-hidden="true">
    <span>${film.countryCode}</span><strong>${film.title}</strong><i>${film.year}</i>
  </div>`;
const filmCardMarkup = (film) => `
  <a class="database-film-card" href="${detailUrl(film)}">
    ${posterMarkup(film)}
    <div class="database-film-card__body">
      <p>${film.country} <span>／</span> ${film.genre}</p>
      <h2>${film.title}</h2>
      <small>${film.originalTitle}</small>
      <dl><div><dt>上映時間</dt><dd>${film.runtime}分</dd></div><div><dt>公開年</dt><dd>${film.year}</dd></div></dl>
    </div>
  </a>`;

document.querySelectorAll("[data-film-count]").forEach((element) => {
  element.textContent = String(cineverseFilms.length);
});

document.querySelectorAll("[data-film-list]").forEach((list) => {
  const searchInput = document.querySelector("[data-film-search]");
  const countrySelect = document.querySelector("[data-film-country]");
  const genreSelect = document.querySelector("[data-film-genre]");
  const sortSelect = document.querySelector("[data-film-sort]");
  const resultCount = document.querySelector("[data-film-result-count]");
  const urlParams = new URLSearchParams(window.location.search);
  if (countrySelect && urlParams.get("country")) countrySelect.value = urlParams.get("country");
  if (genreSelect && urlParams.get("genre")) genreSelect.value = urlParams.get("genre");
  const renderFilmList = () => {
    const keyword = searchInput?.value.trim().toLocaleLowerCase("ja") || "";
    const country = countrySelect?.value || "";
    const genre = genreSelect?.value || "";
    const order = sortSelect?.value || "new";
    const filtered = cineverseFilms.filter((film) => {
      const haystack = [film.title, film.originalTitle, film.country, film.genre, film.director.name, film.summary, ...film.tags].join(" ").toLocaleLowerCase("ja");
      return (!keyword || haystack.includes(keyword)) && (!country || film.country === country) && (!genre || film.genre === genre);
    });
    filtered.sort((a, b) => {
      if (order === "year") return b.year - a.year;
      if (order === "runtime") return b.runtime - a.runtime;
      return b.year - a.year || b.featured - a.featured;
    });
    list.innerHTML = filtered.length ? filtered.map(filmCardMarkup).join("") : '<p class="no-results">条件に合う作品がありません。条件を変えてお試しください。</p>';
    if (resultCount) resultCount.textContent = `${filtered.length} 作品`;
  };
  [searchInput, countrySelect, genreSelect, sortSelect].filter(Boolean).forEach((control) => control.addEventListener("input", renderFilmList));
  renderFilmList();
});

document.querySelectorAll("[data-film-detail]").forEach((page) => {
  const film = getFilm(page.dataset.filmDetail);
  if (!film) return;
  document.title = `${film.title} | 自主映画ねっと`;
  page.querySelectorAll("[data-detail-title]").forEach((element) => { element.textContent = film.title; });
  page.querySelectorAll("[data-detail-original]").forEach((element) => { element.textContent = film.originalTitle; });
  page.querySelectorAll("[data-detail-country]").forEach((element) => { element.textContent = film.country; });
  page.querySelectorAll("[data-detail-year]").forEach((element) => { element.textContent = film.year; });
  page.querySelectorAll("[data-detail-runtime]").forEach((element) => { element.textContent = `${film.runtime}分`; });
  page.querySelectorAll("[data-detail-genre]").forEach((element) => { element.textContent = film.genre; });
  page.querySelectorAll("[data-detail-language]").forEach((element) => { element.textContent = film.language; });
  page.querySelectorAll("[data-detail-director]").forEach((element) => { element.textContent = film.director.name; });
  page.querySelectorAll("[data-detail-summary]").forEach((element) => { element.textContent = film.summary; });
  page.querySelectorAll("[data-detail-background]").forEach((element) => { element.textContent = film.background; });
  page.querySelectorAll("[data-detail-tags]").forEach((element) => { element.innerHTML = film.tags.map((tag) => `<span># ${tag}</span>`).join(""); });
  page.querySelectorAll("[data-detail-poster]").forEach((element) => { element.innerHTML = posterMarkup(film); });
  page.querySelectorAll("[data-detail-director-link]").forEach((element) => {
    if (film.director.slug === "kim-yoonji") {
      element.href = `../../directors/${film.director.slug}/`;
      element.textContent = "監督プロフィールを見る ↗";
    } else {
      element.href = "../../directors/";
      element.textContent = "監督一覧を見る ↗";
    }
  });
  const related = cineverseFilms.filter((candidate) => candidate.slug !== film.slug && (candidate.country === film.country || candidate.genre === film.genre || candidate.tags.some((tag) => film.tags.includes(tag)))).slice(0, 3);
  page.querySelectorAll("[data-related-films]").forEach((element) => { element.innerHTML = related.map(filmCardMarkup).join(""); });
});

document.querySelectorAll("[data-article-list]").forEach((list) => {
  list.innerHTML = cineverseArticles.map((article) => article.slug === "kim-yoonji-listening"
    ? `<a class="article-card" href="kim-yoonji-listening/"><p>${article.category} <span>／</span> ${article.date}</p><h2>${article.title}</h2><small>${article.excerpt}</small><i>↗</i></a>`
    : `<article class="article-card article-card--pending"><p>${article.category} <span>／</span> ${article.date}</p><h2>${article.title}</h2><small>${article.excerpt}</small><i>掲載準備中</i></article>`).join("");
});

const town = document.querySelector("[data-town]");
if (town) {
  const seasonLabels = {
    spring: "SPRING / 2026",
    summer: "SUMMER / 2026",
    autumn: "AUTUMN / 2026",
    winter: "WINTER / 2026",
  };
  const seasonLabel = document.querySelector("[data-season-label]");
  const scenes = town.querySelectorAll("[data-season-scene]");
  const setSeason = (season) => {
    document.body.dataset.season = season;
    if (seasonLabel) seasonLabel.textContent = seasonLabels[season];
  };
  if ("IntersectionObserver" in window) {
    const seasonObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setSeason(entry.target.dataset.seasonScene);
      }),
      { threshold: 0.55 }
    );
    scenes.forEach((scene) => seasonObserver.observe(scene));
  }
  const restoreSpringAtTownEntrance = () => {
    if (town.getBoundingClientRect().top >= -1) setSeason("spring");
  };
  window.addEventListener("scroll", restoreSpringAtTownEntrance, { passive: true });
  restoreSpringAtTownEntrance();

  const filmDialog = document.querySelector("#film-dialog");
  const sponsorDialog = document.querySelector("#sponsor-dialog");
  const filmTitle = filmDialog?.querySelector("[data-film-title]");
  const filmMeta = filmDialog?.querySelector("[data-film-meta]");
  const filmByline = filmDialog?.querySelector("[data-film-byline]");
  const filmScreen = filmDialog?.querySelector("[data-film-screen]");
  const playButton = filmDialog?.querySelector("[data-play-demo]");
  const playCopy = filmDialog?.querySelector("[data-play-copy]");
  const openDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else {
      dialog.setAttribute("open", "");
      dialog.setAttribute("aria-modal", "true");
    }
  };
  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else {
      dialog.removeAttribute("open");
      dialog.removeAttribute("aria-modal");
    }
  };

  document.querySelectorAll("[data-film]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!filmDialog) return;
      if (filmTitle) filmTitle.textContent = button.dataset.filmTitle || "作品タイトル";
      if (filmMeta) filmMeta.textContent = button.dataset.filmMeta || "SHORT FILM";
      if (filmByline) filmByline.textContent = button.dataset.filmByline || "";
      if (filmScreen) {
        filmScreen.style.setProperty("--film-color", button.dataset.filmColor || "#ffda52");
        filmScreen.classList.remove("is-playing");
      }
      if (playButton) playButton.textContent = "▶";
      if (playCopy) playCopy.textContent = "TRAILER ROOM / CLICK PLAY";
      openDialog(filmDialog);
    });
  });

  document.querySelectorAll("[data-film-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const film = getFilm(button.dataset.filmOpen);
      if (!film || !filmDialog) return;
      if (filmTitle) filmTitle.textContent = film.title;
      if (filmMeta) filmMeta.textContent = `${film.country.toUpperCase()} / ${film.year} / ${film.runtime} MIN / ${film.genre.toUpperCase()}`;
      if (filmByline) filmByline.textContent = `監督：${film.director.name}`;
      if (filmScreen) {
        filmScreen.style.setProperty("--film-color", "#ffda52");
        filmScreen.classList.remove("is-playing");
      }
      if (playButton) playButton.textContent = "▶";
      if (playCopy) playCopy.textContent = "TRAILER ROOM / DEMO DATA";
      const detailLink = filmDialog.querySelector("[data-film-page]");
      if (detailLink) detailLink.href = `films/${film.slug}/`;
      openDialog(filmDialog);
    });
  });

  playButton?.addEventListener("click", () => {
    filmScreen?.classList.toggle("is-playing");
    const isPlaying = filmScreen?.classList.contains("is-playing");
    playButton.textContent = isPlaying ? "Ⅱ" : "▶";
    if (playCopy) playCopy.textContent = isPlaying ? "NOW PLAYING / DEMO REEL" : "TRAILER ROOM / CLICK PLAY";
  });

  document.querySelectorAll("[data-open-sponsor]").forEach((button) => {
    button.addEventListener("click", () => openDialog(sponsorDialog));
  });

  const motionStops = document.querySelectorAll("[data-motion-stop]");
  motionStops.forEach((motionStop) => motionStop.addEventListener("click", () => {
    const isStopped = document.body.classList.toggle("is-town-motion-off");
    motionStops.forEach((control) => { control.textContent = isStopped ? "アニメーションを再生する" : "アニメーションを停止する"; });
  }));

  [filmDialog, sponsorDialog].filter(Boolean).forEach((dialog) => {
    dialog.querySelectorAll(".dialog-close").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        closeDialog(dialog);
      });
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
  });
}
