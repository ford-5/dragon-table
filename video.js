// =====================================================================
// VIDEO CHAT (see everyone's faces) for live games: dm.html and join.html.
// Needs PeerJS (already loaded by those pages).
//
// How it works, simply:
//   - The GM's screen keeps the list of PEOPLE at the table: the GM and every accepted
//     player, with their PeerJS address and whether their camera is on.
//   - Everyone whose camera is on "calls" everyone else with their picture (video only;
//     sound stays in voice chat). The others answer and show the picture in a tile.
//   - A call is only answered if it comes from someone on the GM's list, and only for
//     video. Nothing is recorded: pictures go straight between the browsers.
// Every camera sends to everyone, so the picture gets smaller as the table grows
// (adjustQuality). Works well up to about 8 people.
// =====================================================================
function createVideoChat(options) {
  // options: { getPeer(), grid (element for the tiles), onChange() (redraw buttons) }
  let localStream = null;
  let people = [];                 // [{ id, name, cam }]
  const outgoing = new Map();      // their id -> the call carrying MY picture to them
  const incoming = new Map();      // their id -> { call, tile }
  const waiting = [];              // calls that arrived before the GM's list told us who they are
  const retries = new Map();       // their id -> how many times we tried to reach them

  function myId() {
    const peer = options.getPeer();
    return peer ? peer.id : "";
  }

  function nameOf(id) {
    const person = people.find(function (p) { return p.id === id; });
    return person ? person.name : "Someone";
  }

  function makeTile(id, stream, label, mine) {
    removeTile(id);
    const tile = document.createElement("div");
    tile.className = "video-tile" + (mine ? " mine" : "");
    tile.dataset.id = id;
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;            // sound comes through voice chat, not here
    video.srcObject = stream;
    video.play().catch(function () { /* starts after the next tap */ });
    const name = document.createElement("span");
    name.className = "video-name";
    name.textContent = label;      // textContent: never treated as HTML
    tile.append(video, name);
    options.grid.append(tile);
    return tile;
  }

  function removeTile(id) {
    for (const tile of options.grid.querySelectorAll(".video-tile")) {
      if (tile.dataset.id === id) {
        const video = tile.querySelector("video");
        if (video) video.srcObject = null;
        tile.remove();
      }
    }
  }

  // Send my picture to everyone at the table I'm not already sending it to.
  function callEveryone() {
    const peer = options.getPeer();
    if (!localStream || !peer) return;
    for (const person of people) {
      if (person.id === myId() || outgoing.has(person.id)) continue;
      try {
        const call = peer.call(person.id, localStream, { metadata: { kind: "video" } });
        if (!call) continue;
        outgoing.set(person.id, call);
        // If this call drops, try again a few times (a busy network, or they reloaded)
        const forget = function () {
          if (outgoing.get(person.id) !== call) return;
          outgoing.delete(person.id);
          const tries = (retries.get(person.id) || 0) + 1;
          retries.set(person.id, tries);
          if (tries <= 3) setTimeout(callEveryone, 2000 * tries);
        };
        call.on("close", forget);
        call.on("error", forget);
      } catch (error) {
        // That person isn't reachable right now; we'll try again when the list changes.
      }
    }
  }

  function closeCall(call) {
    try { call.close(); } catch (error) { /* already closed */ }
  }

  // The more cameras at the table, the smaller each picture, so nobody's internet gets swamped:
  // up to 3 cameras 320×240 at 15 frames a second, 4–5 cameras 240×180 at 12, 6+ cameras 160×120 at 10.
  function adjustQuality() {
    if (!localStream) return;
    const cams = people.filter(function (p) { return p.cam; }).length;
    const size = cams >= 6 ? [160, 120, 10] : cams >= 4 ? [240, 180, 12] : [320, 240, 15];
    for (const track of localStream.getVideoTracks()) {
      if (track.applyConstraints) {
        track.applyConstraints({ width: { ideal: size[0] }, height: { ideal: size[1] }, frameRate: { ideal: size[2], max: size[2] } })
          .catch(function () { /* this camera can't change size: fine */ });
      }
    }
  }

  // Answer a video call from someone on the list (or refuse it).
  function answerCall(call) {
    const person = people.find(function (p) { return p.id === call.peer && p.cam; });
    if (!person) { closeCall(call); return; }   // not someone at our table
    const old = incoming.get(call.peer);
    if (old && old.call !== call) closeCall(old.call);
    const entry = { call: call, tile: null };
    incoming.set(call.peer, entry);
    call.answer();   // we only watch this call; our own picture goes in our own call
    call.on("stream", function (remote) {
      if (incoming.get(call.peer) !== entry) return;
      entry.tile = makeTile(call.peer, remote, nameOf(call.peer), false);
    });
    const forget = function () {
      if (incoming.get(call.peer) === entry) { incoming.delete(call.peer); removeTile(call.peer); }
    };
    call.on("close", forget);
    call.on("error", forget);
  }

  // Calls that came in before the list: answer the ones the list now knows about.
  function checkWaiting() {
    for (const item of waiting.slice()) {
      if (people.some(function (p) { return p.id === item.call.peer && p.cam; })) {
        waiting.splice(waiting.indexOf(item), 1);
        clearTimeout(item.timer);
        answerCall(item.call);
      }
    }
  }

  return {
    isOn: function () { return Boolean(localStream); },

    // The GM's list of who's at the table changed.
    setPeople: function (list) {
      people = list;
      const ids = people.map(function (p) { return p.id; });
      // Stop sending to people who left
      for (const [id, call] of Array.from(outgoing)) {
        if (!ids.includes(id)) { outgoing.delete(id); closeCall(call); }
      }
      for (const id of Array.from(retries.keys())) if (!ids.includes(id)) retries.delete(id);
      // Remove pictures of people who left or turned their camera off
      for (const [id, entry] of Array.from(incoming)) {
        const person = people.find(function (p) { return p.id === id; });
        if (!person || !person.cam) { closeCall(entry.call); incoming.delete(id); removeTile(id); }
        else {
          const label = entry.tile && entry.tile.querySelector(".video-name");
          if (label) label.textContent = person.name;
        }
      }
      checkWaiting();
      callEveryone();
      adjustQuality();
      if (options.onChange) options.onChange();
    },

    // Turn my camera on. Returns true if it worked.
    startCamera: async function () {
      if (localStream) return true;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" }, audio: false });
      } catch (error) {
        localStream = null;
        return false;
      }
      makeTile("me", localStream, "You", true);
      retries.clear();
      adjustQuality();
      callEveryone();
      if (options.onChange) options.onChange();
      return true;
    },

    stopCamera: function () {
      if (!localStream) return;
      for (const track of localStream.getTracks()) track.stop();   // the camera light goes off
      localStream = null;
      for (const call of outgoing.values()) closeCall(call);
      outgoing.clear();
      removeTile("me");
      if (options.onChange) options.onChange();
    },

    // A call came in. Returns true if it was a video call (answered or refused here).
    handleCall: function (call) {
      if (!call.metadata || call.metadata.kind !== "video") return false;
      if (people.some(function (p) { return p.id === call.peer && p.cam; })) {
        answerCall(call);
      } else if (waiting.length < 12) {
        // Not on our list YET: the GM's list may still be on its way. Wait up to 5 seconds.
        const item = { call: call, timer: null };
        item.timer = setTimeout(function () {
          const i = waiting.indexOf(item);
          if (i >= 0) { waiting.splice(i, 1); closeCall(call); }   // still a stranger: refuse
        }, 5000);
        waiting.push(item);
      } else {
        closeCall(call);
      }
      return true;
    },

    // Leave completely (closing the game, or leaving it)
    closeAll: function () {
      this.stopCamera();
      for (const entry of incoming.values()) closeCall(entry.call);
      incoming.clear();
      for (const item of waiting) { clearTimeout(item.timer); closeCall(item.call); }
      waiting.length = 0;
      retries.clear();
      people = [];
      options.grid.innerHTML = "";
      if (options.onChange) options.onChange();
    },

    tileCount: function () { return options.grid.querySelectorAll(".video-tile").length; }
  };
}
