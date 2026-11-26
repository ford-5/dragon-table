// =====================================================================
// INSTALLING DRAGON TABLE AS AN APP (loaded on every page)
//   1. Starts the offline helper (sw.js), so the app works without internet.
//   2. On the home page, shows an "Install the app" button or instructions.
// =====================================================================
(function () {
  // Service workers only run on https:// (or localhost), not on files opened from Finder.
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    // Was an older helper already running this page? Then a "controllerchange" later
    // means a NEW version just arrived.
    const hadHelper = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").catch(function () {
      // Couldn't start the offline helper: the app still works online.
    });
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      // Only the main page shows it (not the pages inside the GM Screen's middle).
      if (!hadHelper || window.parent !== window || document.getElementById("updateNote")) return;
      // We don't reload by ourselves: that would end a live game on the GM Screen.
      const note = document.createElement("div");
      note.id = "updateNote";
      note.className = "update-note";
      const button = document.createElement("button");
      button.className = "small-button";
      button.textContent = "🔄 A new version of Dragon Table is ready: tap to update";
      button.addEventListener("click", function () { location.reload(); });
      note.append(button);
      document.body.append(note);
    });
  }

  const box = document.getElementById("installBox");   // only the home page has this
  if (!box) return;

  // Already opened as an installed app? Then there's nothing to offer.
  const installed = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (installed) return;

  const show = function (parts) {
    box.innerHTML = "";
    for (const part of parts) box.append(part);
    box.classList.remove("hidden");
  };
  const para = function (text, className) {
    const p = document.createElement("p");
    p.textContent = text;
    if (className) p.className = className;
    return p;
  };

  // Chrome, Edge and Android: the browser lets us show our own Install button.
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();   // don't show the browser's own banner; we'll ask with our button
    const button = document.createElement("button");
    button.textContent = "📲 Install Dragon Table as an app";
    button.addEventListener("click", function () {
      event.prompt();
      event.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") box.classList.add("hidden");
      });
    });
    show([button, para("Get an app icon, full screen, and the dice, characters and maps work offline.", "hint")]);
  });

  // iPhone and iPad: Safari has no Install button, so explain the two taps.
  const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);   // iPads say they're Macs
  if (isApple) {
    show([
      para("📲 Put Dragon Table on your home screen:"),
      para("In Safari, tap the Share button (the square with an arrow pointing up), then tap \"Add to Home Screen\"."),
      para("Note: the home-screen app keeps its own saved characters, separate from Safari's.", "hint")
    ]);
  }
})();
