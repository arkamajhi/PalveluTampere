(() => {
  let language = "fi";
  const toggle = document.getElementById("lang");
  const menu = document.getElementById("menu");
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.querySelectorAll("[data-fi][data-en]").forEach(el => {
      if (el.tagName === "OPTION") { el.textContent = el.dataset[next]; return; }
      el.innerHTML = el.dataset[next];
    });
    toggle.innerHTML = next === "fi" ? "<span class='active'>FI</span> / <span>EN</span>" : "<span>FI</span> / <span class='active'>EN</span>";
  }
  toggle?.addEventListener("click", () => setLanguage(language === "fi" ? "en" : "fi"));
  menu?.addEventListener("click", () => document.getElementById("nav")?.classList.toggle("open"));
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => document.getElementById("nav")?.classList.remove("open")));
  document.querySelectorAll("form[data-service]").forEach(form => form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form), select = form.querySelector("select"), service = select?.options[select.selectedIndex]?.dataset[language] || form.dataset.service;
    const labels = language === "fi" ? ["Hei, pyydän tarjousta Palvelu Tampereelta.", "Nimi", "Puhelin", "Palvelu", "Päivä", "Lisätiedot"] : ["Hello, I would like a quote from Palvelu Tampere.", "Name", "Phone", "Service", "Date", "Details"];
    const message = [labels[0], "", labels[1] + ": " + f.get("name"), labels[2] + ": " + f.get("contact"), labels[3] + ": " + service, f.get("date") ? labels[4] + ": " + f.get("date") : "", f.get("details") ? labels[5] + ": " + f.get("details") : ""].filter(Boolean).join("\n");
    window.open("https://wa.me/358449318824?text=" + encodeURIComponent(message), "_blank", "noopener");
  }));
})();
