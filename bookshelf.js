// =====================================================================
// BOOKS ON THE EDGES (the player's screen and Solo Adventures; the AM Screen has its own).
// Puts book spines in two edge columns. Clicking one opens the book (book.html) over the
// page; its "📚 Put it back" button closes it again.
//   addBookEdges(leftElement, rightElement, [left book keys], [right book keys])
// =====================================================================
const BOOK_SPINES = {
  rules:    { title: "📕 The Rules",         color: "#7a2a2a" },
  spells:   { title: "📗 Spellbook",         color: "#2f5e34" },
  monsters: { title: "📘 Bestiary",          color: "#1f3550" },
  items:    { title: "📙 Magic Items",       color: "#8a5a12" },
  gear:     { title: "📒 Weapons & Armor",   color: "#5a4630" },
  heroes:   { title: "📓 Classes",           color: "#34244a" }
};

let bookOverlay = null;   // the open book, if any

function openBookOverlay(key) {
  closeBookOverlay();
  bookOverlay = document.createElement("div");
  bookOverlay.className = "book-overlay";
  const frame = document.createElement("iframe");
  frame.title = BOOK_SPINES[key] ? BOOK_SPINES[key].title : "Book";
  frame.src = "book.html?embed=1#" + key;
  bookOverlay.append(frame);
  // Clicking the dark space around the book also puts it back
  bookOverlay.addEventListener("click", function (event) {
    if (event.target === bookOverlay) closeBookOverlay();
  });
  document.body.append(bookOverlay);
  document.body.classList.add("book-open");
}

function closeBookOverlay() {
  if (bookOverlay) bookOverlay.remove();
  bookOverlay = null;
  document.body.classList.remove("book-open");
  for (const spine of document.querySelectorAll(".book-edge .book-spine")) spine.classList.remove("out");
}

// book.html's "📚 Put it back" (only from our own pages)
window.addEventListener("message", function (event) {
  if (event.origin === location.origin && event.data && event.data.type === "closeBook") closeBookOverlay();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && bookOverlay) closeBookOverlay();
});

function addBookEdges(left, right, leftKeys, rightKeys) {
  const fill = function (edge, keys) {
    if (!edge) return;
    edge.innerHTML = "";
    for (const key of keys) {
      const info = BOOK_SPINES[key];
      if (!info) continue;
      const spine = document.createElement("button");
      spine.className = "book-spine";
      spine.style.backgroundColor = info.color;
      spine.textContent = info.title;
      spine.title = "Pull out " + info.title.replace(/^\S+\s/, "");
      spine.addEventListener("click", function () {
        const wasOpen = spine.classList.contains("out");
        closeBookOverlay();
        if (wasOpen) return;   // click the same book again to put it back
        openBookOverlay(key);
        spine.classList.add("out");
      });
      edge.append(spine);
    }
  };
  fill(left, leftKeys);
  fill(right, rightKeys);
}
