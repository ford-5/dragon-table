// =====================================================================
// VOICE: a speaker (🔊 read text aloud) and a microphone (🎤 speak instead of typing)
// that any page can add with one line. Both use features built into the browser.
//
//   Voice.speakButton(function () { return "text to read"; })   -> a 🔊 button (or null if unsupported)
//   Voice.micButton(inputOrTextarea)                           -> a 🎤 button next to a box (or null)
//   Voice.textOf(element)                                      -> the readable text inside an element
//   Voice.speak("some text")   Voice.stop()
//
// Privacy: reading aloud happens on your device. Voice typing uses your browser's speech
// service, which may send your voice to Google (Chrome) or Apple (Safari).
// =====================================================================
(function () {
  let currentSpeakButton = null;   // the 🔊 button that is reading right now
  let recognizer = null;           // the listener, while someone is dictating
  let currentMic = null;           // the 🎤 button that is listening

  function canSpeak() {
    return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  }

  function recognitionClass() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  // A voice that matches the browser's language, if there is one.
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    const language = (navigator.language || "en-US").toLowerCase();
    return voices.find(function (v) { return v.lang.toLowerCase() === language; }) ||
           voices.find(function (v) { return v.lang.toLowerCase().startsWith(language.slice(0, 2)); }) ||
           null;
  }

  // Cut text into short pieces. Some browsers stop reading long text halfway.
  function toPieces(text) {
    const pieces = [];
    for (const sentence of String(text).match(/[^.!?\n]+[.!?]*\s*/g) || []) {
      let rest = sentence.trim();
      while (rest.length > 200) {   // a very long sentence: break at a comma or space
        let cut = rest.lastIndexOf(", ", 200);
        if (cut < 60) cut = rest.lastIndexOf(" ", 200);
        if (cut < 1) cut = 200;
        pieces.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) pieces.push(rest);
    }
    return pieces;
  }

  function resetSpeakButton() {
    if (currentSpeakButton) {
      currentSpeakButton.textContent = "🔊 Read aloud";
      currentSpeakButton = null;
    }
  }

  function stop() {
    if (canSpeak()) speechSynthesis.cancel();
    resetSpeakButton();
  }

  // Read text out loud. "button" (optional) is the 🔊 button to switch back when it's finished.
  function speak(text, button) {
    if (!canSpeak()) return;
    speechSynthesis.cancel();
    resetSpeakButton();
    if (button) {
      currentSpeakButton = button;
      button.textContent = "⏹ Stop";
    }
    // Speech engines would read emoji out loud ("compass"), so leave them out, and turn "·" into a pause.
    const spoken = String(text).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/\s*·\s*/g, ", ").replace(/\s+([.,!?])/g, "$1");
    const pieces = toPieces(spoken);
    const voice = pickVoice();
    pieces.forEach(function (piece, i) {
      const utterance = new SpeechSynthesisUtterance(piece);
      utterance.lang = navigator.language || "en-US";
      if (voice) utterance.voice = voice;
      if (i === pieces.length - 1) {
        utterance.onend = utterance.onerror = function () {
          if (button && currentSpeakButton === button) resetSpeakButton();
        };
      }
      speechSynthesis.speak(utterance);
    });
  }

  // The readable text inside an element: headings, paragraphs, list items and table cells,
  // each as its own sentence. Buttons and other controls are left out.
  function textOf(container) {
    const clone = container.cloneNode(true);
    for (const skip of clone.querySelectorAll(".speak-btn, .mic-btn, button, select, input, textarea, script")) skip.remove();
    const blocks = clone.querySelectorAll("summary, h1, h2, h3, p, li, td, th, .adv-label");
    const parts = [];
    for (const block of blocks) {
      if (block.matches(".adv-label")) continue;   // "READ ALOUD" is a label, not part of the story
      if (block.querySelector("p, li, td")) continue;   // read the inner pieces instead
      const text = block.textContent.replace(/\s+/g, " ").trim();
      if (text) parts.push(/[.!?:]$/.test(text) ? text : text + ".");
    }
    return parts.length ? parts.join(" ") : clone.textContent.replace(/\s+/g, " ").trim();
  }

  // A 🔊 button. Press to read, press again to stop.
  function speakButton(getText) {
    if (!canSpeak()) return null;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "small-button speak-btn";
    button.textContent = "🔊 Read aloud";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();   // (so a button inside a <summary> doesn't also fold the section)
      if (currentSpeakButton === button) {
        stop();
      } else {
        speak(getText(), button);
      }
    });
    return button;
  }

  // A 🎤 button for a text box: press, speak, and the words appear in the box.
  // "parent" (optional): where to put the button. Otherwise it goes right after the box.
  function micButton(input, parent) {
    const Recognition = recognitionClass();
    if (!Recognition || !input) return null;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "small-button mic-btn";
    button.textContent = "🎤";
    button.title = "Speak instead of typing";
    button.setAttribute("aria-label", "Speak instead of typing");
    const status = document.createElement("span");
    status.className = "hint mic-status";
    status.setAttribute("aria-live", "polite");

    const done = function (message) {
      recognizer = null;
      currentMic = null;
      button.textContent = "🎤";
      status.textContent = message || "";
    };

    button.addEventListener("click", function () {
      // Pressing the button that is listening means "stop".
      if (recognizer && currentMic === button) {
        recognizer.stop();
        return;
      }
      if (recognizer) recognizer.stop();   // another box was listening: switch over
      stop();                              // and stop any reading, so the mic doesn't hear it

      const before = input.value.trim() ? input.value.trim() + " " : "";   // keep what's already typed
      const listener = new Recognition();
      listener.lang = navigator.language || "en-US";
      listener.interimResults = true;   // show words while you're still talking
      listener.continuous = false;      // stop after you pause
      listener.onresult = function (event) {
        let heard = "";
        for (const result of event.results) heard += result[0].transcript;
        input.value = before + heard;
        input.dispatchEvent(new Event("input", { bubbles: true }));   // so searches and saves see it
      };
      listener.onerror = function (event) {
        const messages = {
          "not-allowed": "The microphone is blocked. Allow it in your browser's address bar.",
          "service-not-allowed": "The microphone is blocked. Allow it in your browser's address bar.",
          "no-speech": "I didn't hear anything.",
          "audio-capture": "No microphone was found.",
          "network": "Voice typing needs an internet connection."
        };
        done(messages[event.error] || "Voice typing stopped.");
      };
      listener.onend = function () {
        if (currentMic === button) done(status.textContent === "Listening…" ? "" : status.textContent);
      };
      try {
        recognizer = listener;
        currentMic = button;
        listener.start();
        button.textContent = "⏹";
        status.textContent = "Listening…";
      } catch (error) {
        done("Couldn't start voice typing.");
      }
    });

    if (parent) {
      parent.append(button, status);
    } else if (input.parentNode) {
      input.insertAdjacentElement("afterend", status);
      input.insertAdjacentElement("afterend", button);
    }
    return button;
  }

  window.Voice = {
    canSpeak: canSpeak,
    canListen: function () { return Boolean(recognitionClass()); },
    speak: speak,
    stop: stop,
    speakButton: speakButton,
    micButton: micButton,
    textOf: textOf
  };
})();
