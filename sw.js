// =====================================================================
// THE OFFLINE HELPER (a "service worker")
// The browser runs this file in the background. It keeps a copy of the app's
// files on the device, so Dragon Table opens even with no internet.
//
// How it answers each request for one of our files:
//   1. Ask the internet for the newest version (so updates arrive right away).
//      "no-cache" makes the browser check with the website every time instead of
//      using its own short-term memory (GitHub lets browsers keep files 10 minutes,
//      which made fresh updates look like they hadn't happened).
//   2. If that works, save a copy and use it.
//   3. If there's no internet (or it takes more than 4 seconds), use the saved copy.
// The AI Game Master (api/...), live games and the order forms always need the
// internet, so they're never answered from the copy.
//
// ⚠️ When you add a new page or file to the app, add it to APP_FILES below too,
//    and change CACHE_NAME (v1 → v2) so phones fetch the new list.
// =====================================================================
const CACHE_NAME = "dragon-table-v25";

const APP_FILES = [
  "./",
  "index.html", "player.html", "ai-dm.html", "join.html", "character.html", "dice.html",
  "dm-start.html", "dm-learn.html", "dm.html", "battle.html", "map.html",
  "equipment.html", "mini.html", "policies.html", "library.html", "support.html", "sheet.html", "adventure.html", "solo.html", "learn-play.html", "create.html", "book.html",
  "style.css", "dice.js", "rules.js", "play.js", "music.js", "monsters.js", "maps.js", "combat.js", "premade.js",
  "equipment.js", "mini3d.js", "feedback.js", "pwa.js", "spells.js", "monetize.js", "voice.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"
];

// When the helper is first installed: save every app file.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // cache: "reload" = download each file fresh, never from the browser's memory
      return cache.addAll(APP_FILES.map(function (file) {
        return new Request(file, { cache: "reload" });
      }));
    }).then(function () {
      return self.skipWaiting();   // start working straight away
    })
  );
});

// When a new version takes over: throw away copies saved by older versions.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) {
        return name.startsWith("dragon-table-") && name !== CACHE_NAME;
      }).map(function (name) {
        return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);
  // Only our own files, only reading (GET), and never the AI helper.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.includes("/api/")) return;

  event.respondWith(networkFirst(request));
});

function networkFirst(request) {
  // A page load can't be copied with new settings, so we ask for its address instead.
  const fromNetwork = fetch(request.url, { cache: "no-cache", credentials: "same-origin" }).then(function (response) {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, copy);
      });
    }
    return response;
  });

  // ignoreSearch: "join.html?code=K7M4QX" can use the saved "join.html".
  const fromCopy = function () {
    return caches.match(request, { ignoreSearch: true });
  };

  // Whichever comes first: the network, or (after 4 seconds) the saved copy.
  const slow = new Promise(function (resolve) {
    setTimeout(function () {
      fromCopy().then(function (copy) {
        if (copy) resolve(copy);
      });
    }, 4000);
  });

  return Promise.race([fromNetwork, slow]).catch(function () {
    // No internet at all: use the saved copy (or a simple message if there isn't one).
    return fromCopy().then(function (copy) {
      return copy || new Response("You're offline, and this page hasn't been saved on this device yet.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    });
  });
}
