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
