// =====================================================================
// SCENE MUSIC — made live by the browser (the Web Audio API). No sound files.
//
// Each mood is a little recipe: a key (root note + scale), a speed (tempo),
// a chord pattern, which instruments to use, and what rhythm to play. The player
// "composes" endlessly from the recipe, so the tune is a bit different every time.
//
// Usage (see ai-dm.html):
//   const ctx = new AudioContext();            // must follow a click: browsers block sound until you interact
//   const music = createMusicPlayer(ctx);
//   music.setMood("tavern");
//   setInterval(function () { music.scheduleUntil(ctx.currentTime + 1.5); }, 200);
// =====================================================================

//   root:   the key's lowest note as a MIDI number (60 = middle C)
//   scale:  the notes of the key, in semitones above the root
//   chords: which scale step each bar's chord starts on (bars loop)
//   pad / lead: oscillator shapes ("sine" is soft, "triangle" mellow, "sawtooth" and "square" buzzy)
//   leadChance: how busy the melody is (0 = silent, 1 = a note on every beat)
//   bass and drums: rhythm styles, see playStep()
//   brightness: how much high sound gets through the filter (lower = darker)
const MUSIC_MOODS = {
  calm:        { label: "Calm",        root: 62, scale: [0, 2, 4, 7, 9],         tempo: 64,  chords: [0, 3, 4, 0],
                 pad: "sine",     lead: "sine",     leadChance: 0.25, bass: "slow",   drums: "none",      brightness: 1200 },
  tavern:      { label: "Tavern",      root: 67, scale: [0, 2, 4, 5, 7, 9, 10],  tempo: 112, chords: [0, 3, 4, 0],
                 pad: "triangle", lead: "triangle", leadChance: 0.65, bass: "bounce", drums: "light",     brightness: 2600 },
  exploration: { label: "Exploration", root: 62, scale: [0, 2, 3, 5, 7, 9, 10],  tempo: 84,  chords: [0, 6, 3, 4],
                 pad: "triangle", lead: "sine",     leadChance: 0.4,  bass: "slow",   drums: "none",      brightness: 1800 },
  mystery:     { label: "Mystery",     root: 57, scale: [0, 1, 3, 5, 7, 8, 10],  tempo: 66,  chords: [0, 1, 0, 5],
                 pad: "sine",     lead: "triangle", leadChance: 0.15, bass: "drone",  drums: "none",      brightness: 900 },
  danger:      { label: "Danger",      root: 52, scale: [0, 1, 3, 5, 7, 8, 10],  tempo: 92,  chords: [0, 1, 0, 6],
                 pad: "sawtooth", lead: "triangle", leadChance: 0.2,  bass: "pulse",  drums: "heartbeat", brightness: 700 },
  battle:      { label: "Battle",      root: 50, scale: [0, 2, 3, 5, 7, 8, 11],  tempo: 140, chords: [0, 5, 6, 4],
                 pad: "sawtooth", lead: "square",   leadChance: 0.5,  bass: "drive",  drums: "battle",    brightness: 1600 },
  victory:     { label: "Victory",     root: 60, scale: [0, 2, 4, 5, 7, 9, 11],  tempo: 100, chords: [0, 3, 4, 0],
                 pad: "triangle", lead: "triangle", leadChance: 0.7,  bass: "slow",   drums: "light",     brightness: 3000 }
};

// MIDI note number -> frequency in Hz (A above middle C = 69 = 440 Hz).
function midiToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// A note from the mood's scale. "degree" counts scale steps; it wraps into higher octaves.
function scaleNote(mood, degree, octave) {
  const steps = mood.scale.length;
  const index = ((degree % steps) + steps) % steps;
  const extraOctaves = Math.floor(degree / steps);
  return mood.root + mood.scale[index] + 12 * (extraOctaves + octave);
}

function createMusicPlayer(ctx) {
  // master volume -> a gentle compressor (keeps it from ever getting too loud) -> speakers
  const master = ctx.createGain();
  master.gain.value = 0.4;
  const compressor = ctx.createDynamicsCompressor();
  master.connect(compressor);
  compressor.connect(ctx.destination);

  // One second of random noise, used for drums and hi-hats.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const noiseData = noise.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

  let current = null;   // the mood being played: { name, mood, out, step, nextTime, melody }

  // ---------- Instruments ----------

  // A note: oscillator -> low-pass filter -> volume envelope (fade in, hold, fade out).
  function playTone(out, frequency, time, length, shape, volume, attack, release, brightness) {
    const oscillator = ctx.createOscillator();
    oscillator.type = shape;
    oscillator.frequency.value = frequency;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = brightness;

    const envelope = ctx.createGain();
    const fadeOutStart = time + Math.max(attack, length - release);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + attack);
    envelope.gain.setValueAtTime(volume, fadeOutStart);
    envelope.gain.linearRampToValueAtTime(0, time + length);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(out);
    oscillator.start(time);
    oscillator.stop(time + length + 0.05);
  }

  // A burst of noise: hi-hats (short, high) and snares (longer, lower).
  function playNoise(out, time, length, volume, highpass) {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + length);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(out);
    source.start(time);
    source.stop(time + length + 0.05);
  }

  // A kick drum: a low note that quickly drops in pitch.
  function playKick(out, time, volume) {
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(120, time);
    oscillator.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    oscillator.connect(envelope);
    envelope.connect(out);
    oscillator.start(time);
    oscillator.stop(time + 0.35);
  }

  // ---------- The composer: plays one eighth-note "step" ----------
  function playStep(state, time) {
    const mood = state.mood;
    const step = state.step;
    const eighth = 60 / mood.tempo / 2;                       // length of one step in seconds
    const bar = Math.floor(step / 8) % mood.chords.length;    // 8 steps per bar
    const chord = mood.chords[bar];
    const out = state.out;

    // Pad: a soft chord held for the whole bar
    if (step % 8 === 0) {
      for (const offset of [0, 2, 4]) {
        playTone(out, midiToFrequency(scaleNote(mood, chord + offset, 0)), time, eighth * 8 + 0.3,
                 mood.pad, 0.045, eighth * 2, eighth * 3, mood.brightness);
      }
    }

    // Bass
    const bassNote = midiToFrequency(scaleNote(mood, chord, -1));
    if (mood.bass === "slow" && step % 8 === 0) {
      playTone(out, bassNote, time, eighth * 8, "triangle", 0.12, 0.05, eighth * 2, 800);
    } else if (mood.bass === "bounce" && step % 2 === 0) {
      const note = step % 4 === 0 ? bassNote : midiToFrequency(scaleNote(mood, chord + 4, -1));
      playTone(out, note, time, eighth * 1.5, "triangle", 0.13, 0.01, eighth, 900);
    } else if (mood.bass === "drone" && step % 16 === 0) {
      playTone(out, midiToFrequency(scaleNote(mood, 0, -1)), time, eighth * 16 + 0.5, "sine", 0.14, eighth * 4, eighth * 4, 600);
    } else if (mood.bass === "pulse" && step % 2 === 0) {
      playTone(out, bassNote, time, eighth * 0.9, "sawtooth", 0.07, 0.01, eighth * 0.5, 400);
    } else if (mood.bass === "drive") {
      playTone(out, bassNote, time, eighth * 0.8, "sawtooth", 0.08, 0.005, eighth * 0.4, 700);
    }

    // Melody: wanders up and down the scale one or two steps at a time
    const fast = mood.tempo >= 100;
    if ((fast || step % 2 === 0) && Math.random() < mood.leadChance) {
      state.melody += Math.floor(Math.random() * 5) - 2;          // move -2 .. +2 scale steps
      state.melody = Math.min(Math.max(state.melody, 0), 10);
      const long = Math.random() < 0.3 ? 2 : 1;
      playTone(out, midiToFrequency(scaleNote(mood, chord + state.melody, 1)), time, eighth * long,
               mood.lead, mood.lead === "square" ? 0.03 : 0.06, 0.01, eighth * 0.6, mood.brightness);
    }

    // Drums
    if (mood.drums === "light") {
      if (step % 2 === 1) playNoise(out, time, 0.04, 0.05, 7000);    // tambourine on the off-beats
      if (step % 8 === 0) playKick(out, time, 0.25);
    } else if (mood.drums === "heartbeat") {
      if (step % 8 === 0) playKick(out, time, 0.5);                  // lub...
      if (step % 8 === 1) playKick(out, time, 0.35);                 // ...dub
    } else if (mood.drums === "battle") {
      if (step % 4 === 0) playKick(out, time, 0.55);
      if (step % 4 === 2) playNoise(out, time, 0.14, 0.22, 1500);    // snare
      playNoise(out, time, 0.03, 0.035, 8000);                       // hi-hat on every step
    }

    state.step++;
  }

  // ---------- Controls ----------

  // Plan notes up to "endTime". Call this often (a little ahead of time) so the music never stops.
  function scheduleUntil(endTime) {
    if (!current) return;
    while (current.nextTime < endTime) {
      playStep(current, current.nextTime);
      current.nextTime += 60 / current.mood.tempo / 2;
    }
  }

  // Smoothly switch to another mood: the old one fades out while the new one fades in.
  function setMood(name) {
    const mood = MUSIC_MOODS[name];
    if (!mood || (current && current.name === name)) return;
    fadeOutCurrent();

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, ctx.currentTime);
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    out.connect(master);
    current = { name: name, mood: mood, out: out, step: 0, nextTime: ctx.currentTime + 0.05, melody: 5 };
  }

  function fadeOutCurrent() {
    if (!current) return;
    const old = current.out;
    old.gain.cancelScheduledValues(ctx.currentTime);
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    setTimeout(function () {
      old.disconnect();
    }, 5000);
    current = null;
  }

  function stop() {
    fadeOutCurrent();
  }

  // 0 (silent) to 1 (full).
  function setVolume(level) {
    master.gain.setTargetAtTime(Math.max(0, Math.min(level, 1)), ctx.currentTime, 0.15);
  }

  return {
    setMood: setMood,
    stop: stop,
    setVolume: setVolume,
    scheduleUntil: scheduleUntil,
    currentMood: function () {
      return current ? current.name : null;
    }
  };
}

// ---------------------------------------------------------------------
// A READY-MADE MUSIC CONTROLLER (used by the live-game pages)
// Wraps everything a page needs: it makes the sound system on the first start (browsers only
// allow sound after a tap or click), keeps composing a little ahead, and has simple controls.
//   const music = createMusicController();
//   music.start();  music.setMood("battle");  music.setVolume(0.5);  music.stop();
// (The AI Game Master page has its own, older copy of this logic.)
// ---------------------------------------------------------------------
function createMusicController() {
  let ctx = null;
  let player = null;
  let on = false;
  let mood = "calm";
  let level = 0.4;   // the volume slider, 0 to 1

  // Sliders feel more natural when squared; the player adds its own gentle limiter.
  const volume = function () {
    return level * level * 0.8;
  };

  return {
    // Can this browser make music at all?
    supported: function () {
      return Boolean(window.AudioContext || window.webkitAudioContext);
    },

    // Call this from a click or tap.
    start: function () {
      if (!ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;
        ctx = new AudioContextClass();
        player = createMusicPlayer(ctx);
        // Keep composing about 1.5 seconds ahead, so the music never runs out.
        setInterval(function () {
          if (on) player.scheduleUntil(ctx.currentTime + 1.5);
        }, 200);
      }
      ctx.resume();
      on = true;
      player.setVolume(volume());
      player.setMood(mood);
      return true;
    },

    stop: function () {
      on = false;
      if (player) player.stop();
    },

    // Change the mood. If the music isn't playing, it's remembered for the next start.
    setMood: function (name) {
      if (!MUSIC_MOODS[name]) return;
      mood = name;
      if (on && player) player.setMood(name);
    },

    setVolume: function (zeroToOne) {
      level = Math.max(0, Math.min(Number(zeroToOne) || 0, 1));
      if (player) player.setVolume(volume());
    },

    isOn: function () {
      return on;
    },

    mood: function () {
      return mood;
    }
  };
}
