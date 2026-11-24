// =====================================================================
// "SEND FEEDBACK" LINK — added to the bottom of every page.
// It opens the feedback Google Form with the page's name already filled in.
// Until FEEDBACK_FORM.url is set, nothing is shown.
// =====================================================================
const FEEDBACK_FORM = {
  url: "https://docs.google.com/forms/d/e/1FAIpQLSc6mzEOC7KGhhMYi9wMsypieXHVu5UJA6Y-HbZ07Kzs-N1s1Q/viewform",
  pageField: "entry.1084252444"    // the form's "Which page?" question
};

(function addFeedbackLink() {
  const ready = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/.test(FEEDBACK_FORM.url) &&
    /^entry\.\d+$/.test(FEEDBACK_FORM.pageField);
  if (!ready) return;

  // A pre-filled link: the form opens with this page's title in "Which page?".
  const link = new URL(FEEDBACK_FORM.url);
  link.searchParams.set("usp", "pp_url");
  link.searchParams.set(FEEDBACK_FORM.pageField, document.title + " (" + location.pathname.split("/").pop() + ")");

  const p = document.createElement("p");
  p.className = "feedback-link";
  const a = document.createElement("a");
  a.href = link.href;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "💬 Send feedback: something broken, confusing, or a great idea?";
  p.append(a);
  document.body.append(p);
})();
