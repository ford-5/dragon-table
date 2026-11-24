// =====================================================================
// WAYS TO SUPPORT DRAGON TABLE: the only file you edit to switch them on.
// Everything here is PUBLIC (it's part of the website). Links are meant to be public.
// Anything left as "" simply doesn't show up.
// =====================================================================

// Your public web address (used for the Share button and search engines).
const SITE_URL = "https://ford-5.github.io/dragon-table/";

// ---------- Tip jar / memberships ----------
// Make a free page on one of these, then paste its address here.
// Only addresses starting with one of these websites are accepted.
const SUPPORT_LINKS = [
  { label: "☕ Leave a tip (Ko-fi)",            url: "",  hint: "ko-fi.com: free to start, one-time tips" },
  { label: "☕ Buy me a coffee",                 url: "",  hint: "buymeacoffee.com: free to start" },
  { label: "💜 Become a monthly supporter (Patreon)", url: "", hint: "patreon.com: monthly memberships" },
  { label: "💛 Sponsor on GitHub",              url: "",  hint: "github.com/sponsors/your-name" }
];
const SUPPORT_HOSTS = ["ko-fi.com", "buymeacoffee.com", "www.buymeacoffee.com", "patreon.com", "www.patreon.com", "github.com"];

// ---------- A waiting list for the online AI Game Master ----------
// A Google Form (like your order and feedback forms) with an "Email" question.
// Paste the form's link ending in /viewform. Until then, the waiting-list buttons stay hidden.
const WAITLIST_FORM = { url: "" };

// ---------------------------------------------------------------------
// Helpers used by the pages (no need to change these)
// ---------------------------------------------------------------------
function supportLinks() {
  return SUPPORT_LINKS.filter(function (link) {
    try {
      const u = new URL(link.url);
      return u.protocol === "https:" && SUPPORT_HOSTS.includes(u.hostname);
    } catch (error) {
      return false;
    }
  });
}

function waitlistUrl() {
  return /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/.test(WAITLIST_FORM.url) ? WAITLIST_FORM.url : "";
}

// Share the app: the phone's share sheet when there is one, otherwise copy the link.
function shareApp(statusBox) {
  const data = { title: "Dragon Table", text: "A beginner-friendly fifth-edition tabletop app: characters, free rules, battle maps and more.", url: SITE_URL };
  const done = function (message) {
    if (statusBox) statusBox.textContent = message;
  };
  if (navigator.share) {
    navigator.share(data).catch(function () {
      // Closed the share sheet: nothing to do.
    });
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(SITE_URL).then(function () {
      done("🔗 Link copied. Paste it to a friend!");
    }, function () {
      done("Share this address: " + SITE_URL);
    });
  } else {
    done("Share this address: " + SITE_URL);
  }
}
