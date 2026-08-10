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
  const seasonObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setSeason(entry.target.dataset.seasonScene);
    }),
    { threshold: 0.55 }
  );
  scenes.forEach((scene) => seasonObserver.observe(scene));
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
      filmDialog.showModal();
    });
  });

  playButton?.addEventListener("click", () => {
    filmScreen?.classList.toggle("is-playing");
    const isPlaying = filmScreen?.classList.contains("is-playing");
    playButton.textContent = isPlaying ? "Ⅱ" : "▶";
    if (playCopy) playCopy.textContent = isPlaying ? "NOW PLAYING / DEMO REEL" : "TRAILER ROOM / CLICK PLAY";
  });

  document.querySelectorAll("[data-open-sponsor]").forEach((button) => {
    button.addEventListener("click", () => sponsorDialog?.showModal());
  });

  const motionStop = document.querySelector("[data-motion-stop]");
  motionStop?.addEventListener("click", () => {
    const isStopped = document.body.classList.toggle("is-town-motion-off");
    motionStop.textContent = isStopped ? "アニメーションを再生する" : "アニメーションを停止する";
  });

  [filmDialog, sponsorDialog].filter(Boolean).forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
}
