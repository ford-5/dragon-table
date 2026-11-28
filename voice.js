// =====================================================================
// VOICE: a speaker (🔊 read text aloud) and a microphone (🎤 speak instead of typing)
// that any page can add with one line. Both use features built into the browser.
//
//   Voice.speakButton(function () { return "text to read"; })   -> a 🔊 button (or null if unsupported)
//   Voice.micButton(inputOrTextarea)                           -> a 🎤 button next to a box (or null)
//   Voice.textOf(element)                                      -> the readable text inside an element
//   Voice.speak("some text")   Voice.stop()
//   Voice.voicePicker()                                        -> a "Voice and speed" box (or null)
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

  // =====================================================================
  // WHICH VOICE TO USE
  // A device has several voices, and they don't sound alike. "Premium", "Enhanced",
  // "Natural" and "Neural" voices sound most like a person, so they are picked first.
  // Novelty voices (Zarvox, Bells...) are used only when nothing else is there.
  // The user can choose a voice and a speed in the "Voice and speed" box. The choice is
  // saved in this browser (key "readAloudVoice") and used on every page of the app.
  // =====================================================================
  const SAVED_VOICE_KEY = "readAloudVoice";
  const NOVELTY_VOICE = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|hysterical|deranged)\b/i;
  const CHARACTER_VOICE = /\b(eddy|flo|fred|grandma|grandpa|junior|ralph|reed|rocko|sandy|shelley)\b/i;
  const VOICE_SPEEDS = [["0.85", "Slower"], ["1", "Normal"], ["1.2", "Faster"]];

  // The saved choice: { voice: the voice's name ("" means the best one), rate: the speed }
  function savedChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(SAVED_VOICE_KEY));
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};   // storage is blocked or the saved text is damaged: use the defaults
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(SAVED_VOICE_KEY, JSON.stringify(choice));
    } catch (error) {
      // Can't remember it: the choice lasts until the page is closed.
    }
  }

  function savedRate() {
    const rate = Number(savedChoice().rate);
    return rate >= 0.5 && rate <= 2 ? rate : 1;
  }

  function userLanguage() {
    return (navigator.language || "en-US").replace("_", "-").toLowerCase();
  }

  // How natural a voice is likely to sound. Higher is better.
  function voiceQuality(voice) {
    const name = voice.name || "";
    if (NOVELTY_VOICE.test(name)) return -100;
    let score = 0;
    if (CHARACTER_VOICE.test(name)) score -= 20;   // character voices (Grandma, Junior...) come after plain ones
    if (/premium/i.test(name)) score += 40;
    else if (/enhanced/i.test(name)) score += 30;
    if (/natural|neural|online/i.test(name)) score += 35;   // Windows and Edge "Natural" voices
    if (/siri/i.test(name)) score += 30;
    if (/google/i.test(name)) score += 20;                  // Chrome's Google voices
    if (voice.localService) score += 5;                     // works without the internet
    return score;
  }

  // How well a voice fits the user's language: the same language and region (en-US) scores 30,
  // the same language in another region (en-GB) scores 0, and another language is never used.
  function languageScore(voice, language) {
    const voiceLanguage = (voice.lang || "").replace("_", "-").toLowerCase();
    if (voiceLanguage === language) return 30;
    if (voiceLanguage.split("-")[0] === language.split("-")[0]) return 0;
    return -1000;
  }

  // The best voice on this device for the user's language, or null if there is none.
  function bestVoice(voices) {
    const language = userLanguage();
    let best = null;
    let bestScore = -Infinity;
    for (const voice of voices) {
      const score = languageScore(voice, language) + voiceQuality(voice);
      if (score > bestScore) {
        best = voice;
        bestScore = score;
      }
    }
    return bestScore > -500 ? best : null;   // below -500 means "another language"
  }

  // The voice to read with: the one the user chose, otherwise the best one here.
  // Returns null if there is none (the browser then uses its own).
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    const chosen = savedChoice().voice;
    const saved = typeof chosen === "string" && chosen
      ? voices.find(function (voice) { return voice.name === chosen; })
      : null;
    return saved || bestVoice(voices);
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
    const rate = savedRate();
    pieces.forEach(function (piece, i) {
      const utterance = new SpeechSynthesisUtterance(piece);
      utterance.lang = navigator.language || "en-US";
      utterance.rate = rate;
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
    for (const skip of clone.querySelectorAll(".speak-btn, .mic-btn, .voice-picker, button, select, input, textarea, script")) skip.remove();
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

  // =====================================================================
  // A PATIENT LISTENER
  // Browsers stop listening at the first little pause, which cuts people off
  // mid-sentence. This one keeps going until you've been quiet for a while:
  //   quietMs:     how long a silence ends it (4 seconds)
  //   firstWordMs: how long to wait for you to START talking (8 seconds)
  // If the browser stops early by itself, we quietly start it again and keep
  // everything heard so far.
  //   onText(words)  is called with everything heard so far, while you talk
  //   onEnd(reason)  is called once at the end: "quiet", "stopped", or an error name
  // Returns { stop() } so a button can end it early.
  // =====================================================================
  function patientListen(options) {
    const Recognition = recognitionClass();
    const quietMs = options.quietMs || 4000;
    const firstWordMs = options.firstWordMs || 8000;
    let heardFinal = "";      // the words the browser is sure about
    let wanted = true;        // false once we've decided to finish
    let endReason = "";
    let current = null;       // the browser's listener right now
    let restarts = 0;
    let quietTimer = null;

    const joinWords = function (a, b) {
      a = a.trim();
      b = b.trim();
      return a && b ? a + " " + b : a + b;
    };
    const waitThenFinish = function (ms) {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(function () { finish("quiet"); }, ms);
    };
    const finish = function (reason) {
      if (!wanted) return;
      wanted = false;
      endReason = reason;
      clearTimeout(quietTimer);
      if (current) {
        try { current.stop(); } catch (error) { /* already stopped */ }
      } else {
        options.onEnd(endReason);
      }
    };

    const startOne = function () {
      const listener = new Recognition();
      current = listener;
      listener.lang = navigator.language || "en-US";
      listener.interimResults = true;   // show words while you're still talking
      listener.continuous = true;       // don't stop at the first pause
      listener.onresult = function (event) {
        let notSureYet = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) heardFinal = joinWords(heardFinal, result[0].transcript);
          else notSureYet = joinWords(notSureYet, result[0].transcript);
        }
        options.onText(joinWords(heardFinal, notSureYet));
        waitThenFinish(quietMs);   // you're talking: start the quiet countdown again
      };
      listener.onerror = function (event) {
        // "no-speech" and "aborted" just mean a pause: keep listening.
        if (event.error === "no-speech" || event.error === "aborted") return;
        wanted = false;
        endReason = event.error;
      };
      listener.onend = function () {
        current = null;
        if (wanted && restarts < 30) {
          restarts++;
          try {
            startOne();   // the browser stopped by itself: carry on listening
            return;
          } catch (error) {
            endReason = "stopped";
          }
        }
        wanted = false;
        clearTimeout(quietTimer);
        options.onEnd(endReason || "stopped");
      };
      listener.start();
    };

    waitThenFinish(firstWordMs);
    startOne();
    return { stop: function () { finish("stopped"); } };
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

    // handle = the listener that finished. Only clear the shared "who's listening"
    // if it's still this one (another 🎤 may have taken over in the meantime).
    const done = function (message, handle) {
      if (!handle || recognizer === handle) {
        recognizer = null;
        currentMic = null;
      }
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
      currentMic = button;
      button.textContent = "⏹";
      status.textContent = "Listening… (stops after a few quiet seconds)";
      let handle = null;
      try {
        handle = recognizer = patientListen({
          onText: function (heard) {
            input.value = before + heard;
            input.dispatchEvent(new Event("input", { bubbles: true }));   // so searches and saves see it
          },
          onEnd: function (reason) {
            const messages = {
              "not-allowed": "The microphone is blocked. Allow it in your browser's address bar.",
              "service-not-allowed": "The microphone is blocked. Allow it in your browser's address bar.",
              "audio-capture": "No microphone was found.",
              "network": "Voice typing needs an internet connection."
            };
            done(messages[reason] || (input.value.trim() === before.trim() ? "I didn't hear anything." : ""), handle);
          }
        });
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

  // The "Voice and speed" box. Put one on a page that reads aloud (it applies to every page).
  // Returns null where reading aloud isn't possible.
  function voicePicker() {
    if (!canSpeak()) return null;

    const box = document.createElement("details");
    box.className = "voice-picker";
    const summary = document.createElement("summary");
    summary.textContent = "🔊 Voice and speed";
    const body = document.createElement("div");
    body.className = "voice-picker-body";

    const voiceLabel = document.createElement("label");
    voiceLabel.textContent = "Voice ";
    const voiceSelect = document.createElement("select");
    voiceLabel.append(voiceSelect);

    const speedLabel = document.createElement("label");
    speedLabel.textContent = "Speed ";
    const speedSelect = document.createElement("select");
    for (const pair of VOICE_SPEEDS) speedSelect.append(new Option(pair[1], pair[0]));
    speedLabel.append(speedSelect);

    const tryButton = document.createElement("button");
    tryButton.type = "button";
    tryButton.className = "small-button";
    tryButton.textContent = "▶ Try it";
    tryButton.addEventListener("click", function () {
      speak("Hello, adventurer. Welcome to the table.");
    });

    body.append(voiceLabel, speedLabel, tryButton);
    box.append(summary, body);

    // The voices for this language, best first. The first line ("") lets the app choose.
    const fillVoices = function () {
      const voices = speechSynthesis.getVoices();
      const main = userLanguage().split("-")[0];
      let list = voices.filter(function (voice) {
        return (voice.lang || "").replace("_", "-").toLowerCase().split("-")[0] === main;
      });
      if (!list.length) list = voices.slice();   // none for this language: show them all
      list.sort(function (a, b) {
        return voiceQuality(b) - voiceQuality(a) || a.name.localeCompare(b.name);
      });
      const best = bestVoice(voices);
      const chosen = savedChoice().voice;
      voiceSelect.innerHTML = "";
      voiceSelect.append(new Option(best ? "Best on this device: " + best.name : "Best on this device", ""));
      for (const voice of list) voiceSelect.append(new Option(voice.name, voice.name));
      voiceSelect.value = list.some(function (voice) { return voice.name === chosen; }) ? chosen : "";
    };

    const speedText = String(savedRate());
    speedSelect.value = VOICE_SPEEDS.some(function (pair) { return pair[0] === speedText; }) ? speedText : "1";

    voiceSelect.addEventListener("change", function () {
      saveChoice(Object.assign(savedChoice(), { voice: voiceSelect.value }));
    });
    speedSelect.addEventListener("change", function () {
      saveChoice(Object.assign(savedChoice(), { rate: Number(speedSelect.value) }));
    });

    fillVoices();
    // Some browsers find their voices a moment after the page opens.
    speechSynthesis.addEventListener("voiceschanged", fillVoices);
    return box;
  }

  window.Voice = {
    canSpeak: canSpeak,
    canListen: function () { return Boolean(recognitionClass()); },
    speak: speak,
    stop: stop,
    speakButton: speakButton,
    micButton: micButton,
    voicePicker: voicePicker,
    pickVoice: pickVoice,
    readingSpeed: savedRate,
    textOf: textOf,
    patientListen: patientListen
  };
})();
