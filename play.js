// =====================================================================
// SHARED PLAY HELPERS — used by ai-dm.html, join.html and dm.html.
// Load AFTER dice.js and rules.js:
//   <script src="dice.js"></script>
//   <script src="rules.js"></script>
//   <script src="play.js"></script>
// =====================================================================

// "Level 3 Dwarf Fighter", or "Level 3 Dwarf Fighter 2 / Rogue 1" with two classes
function characterLine(c) {
  return "Level " + c.level + " " + c.species + " " + classSummary(c);
}

// ---------------------------------------------------------------------
// ROLLING CHECKS FROM A CHARACTER SHEET
// ---------------------------------------------------------------------

// Every roll a character can make: initiative, ability checks, saving throws, skills,
// and weapon attacks. Each entry: { label, bonus, ability, skill (skills only) }.
// "ability" and "skill" let items and armor give Advantage or Disadvantage.
function getCheckList(character) {
  const list = [];
  list.push({ label: "Initiative", bonus: getModifier(getAbilityScore(character, "dex")), ability: "dex" });
  for (const ability of ABILITIES) {
    list.push({ label: ability.name + " check", bonus: getModifier(getAbilityScore(character, ability.key)), ability: ability.key });
  }
  for (const ability of ABILITIES) {
    list.push({ label: ability.name + " save", bonus: getSaveBonus(character, ability.key), ability: ability.key });
  }
  for (const skill of SKILLS) {
    list.push({ label: skill.name, bonus: getSkillBonus(character, skill), skill: skill.name, ability: skill.ability });
  }
  for (const attack of getAttacks(character)) {
    list.push({ label: attack.name + " attack", bonus: attack.toHit, ability: attack.ability });
  }
  // Spell attacks, for the spells the character has chosen (needs spells.js on the page).
  for (const entry of getSpellcastingClasses(character)) {
    const book = getSpellbook(character, entry.name);
    for (const name of book.cantrips.concat(book.prepared)) {
      const spell = findSpell(name);
      if (spell && spell.atk && !list.some(function (e) { return e.label === name + " attack"; })) {
        list.push({ label: name + " attack", bonus: getSpellAttackBonus(character, entry.name) });
      }
    }
  }
  return list;
}

// ---------------------------------------------------------------------
// PASS OR FAIL, WORKED OUT FOR YOU
// ---------------------------------------------------------------------
// A roll succeeds when the total meets or beats the number to beat: a DC for checks and
// saves, or the target's Armor Class for attacks. On an ATTACK, a natural 20 always hits
// and a natural 1 always misses (SRD "D20 Tests"); on anything else, only the total counts.
function isAttackLabel(label) {
  return /attack/i.test(label);
}

// The words for the number to beat: "DC" for checks and saves, "AC" for attacks.
function targetWord(label) {
  return isAttackLabel(label) ? "AC" : "DC";
}

// Returns { success, text }, or null when there is no number to beat.
//   total: the final number   natural: the d20 that was rolled   target: the number to beat
function resolveOutcome(label, total, natural, target) {
  const number = Number(target);
  if (!number || number < 1) return null;
  const attack = isAttackLabel(label);
  let success = total >= number;
  if (attack && natural === 20) success = true;
  if (attack && natural === 1) success = false;
  const word = targetWord(label);
  const text = attack
    ? (success ? "✅ HIT!" : "❌ MISS") + " (" + total + " vs AC " + number + ")"
    : (success ? "✅ SUCCESS!" : "❌ FAILED") + " (" + total + " vs DC " + number + ")";
  return { success: success, text: text, word: word };
}

// Roll one check. mode is "normal", "advantage" or "disadvantage". target (optional) is the
// number to beat: the result then says whether it worked.
// Returns { text, total, success } where text is ready to show, like "🎲 Stealth: 14 +3 = 17 ✅ SUCCESS!".
function rollCharacterCheck(character, entry, mode, target) {
  // Magic items and armor can change Normal / Advantage / Disadvantage (rules.js).
  const resolved = resolveRollMode(character, mode, { skill: entry.skill, ability: entry.ability });
  mode = resolved.mode;
  const note = resolved.note;

  let roll;
  let shown;
  if (mode === "normal") {
    roll = rollOneDie(20);
    shown = String(roll) + note;
  } else {
    const result = rollD20WithMode(mode);   // from dice.js
    roll = result.kept;
    shown = roll + " (rolled " + result.rolls.join(" & ") + ", " + mode + note + ")";
  }

  const total = roll + entry.bonus;
  let text = "🎲 " + entry.label + ": " + shown + " " + formatBonus(entry.bonus) + " = " + total;
  if (roll === 20) text += "  🎉 Natural 20!";
  if (roll === 1)  text += "  💀 Natural 1...";
  const outcome = resolveOutcome(entry.label, total, roll, target);
  if (outcome) text += "  " + outcome.text;
  return { text: text, total: total, success: outcome ? outcome.success : null };
}

// Fill a <select> with every check the character can roll (the option value is its position).
function fillCheckSelect(select, character) {
  select.innerHTML = "";
  getCheckList(character).forEach(function (entry, index) {
    select.append(new Option(entry.label + " (" + formatBonus(entry.bonus) + ")", index));
  });
}

// ---------------------------------------------------------------------
// AI DUNGEON MASTER TAGS
// The AI ends some replies with hidden tags like [ROLL: Perception] or [MUSIC: battle].
// These functions find them, and remove them before the text is shown or read aloud.
// ---------------------------------------------------------------------
const MUSIC_TAG_MOODS = ["calm", "tavern", "exploration", "mystery", "danger", "battle", "victory"];

function stripDmTags(text) {
  return String(text)
    .replace(/\[(ROLL|MUSIC)\s*:[^\]]*\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// "battle", or null if the reply has no (valid) music tag.
function findMusicTag(text) {
  const match = String(text).match(/\[MUSIC\s*:\s*([a-z]+)\s*\]/i);
  if (!match) return null;
  const mood = match[1].toLowerCase();
  return MUSIC_TAG_MOODS.includes(mood) ? mood : null;
}

// What roll does the Game Master want? Returns null, or one of:
//   { type: "check", entry, index, mode, label }        a roll from the sheet (the bonus comes from the sheet)
//   { type: "dice", count, sides, modifier, mode, label } dice the GM wrote out (attacks, damage)
function findRollRequest(text, character) {
  const tag = String(text).match(/\[ROLL\s*:\s*([^\]]+)\]/i);
  if (tag) return parseRollRequest(tag[1], character);
  return guessRollFromText(stripDmTags(text), character);
}

function parseRollRequest(raw, character) {
  let words = String(raw).trim().toLowerCase();

  // The Game Master may name the number to beat: "Perception DC 15" or "Longsword attack vs AC 14".
  let target = 0;
  const targetMatch = words.match(/\s*(?:\bvs\.?\s*)?\b(?:dc|ac)\s*(\d{1,2})\b/);
  if (targetMatch) {
    target = Math.min(Math.max(Number(targetMatch[1]), 1), 40);
    words = words.replace(targetMatch[0], "").trim();
  }

  let mode = "normal";
  if (/\bdisadvantage\b/.test(words)) mode = "disadvantage";
  else if (/\badvantage\b/.test(words)) mode = "advantage";
  words = words.replace(/\s*(with\s+)?(dis)?advantage\b/g, "").trim();

  // Dice written out, like "1d20+5 attack", "2d6 damage" or "d20-1"
  const dice = words.match(/^(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?\s*(.*)$/);
  if (dice) {
    const count = Math.min(Math.max(Number(dice[1] || 1), 1), 20);
    const sides = Number(dice[2]);
    if (![4, 6, 8, 10, 12, 20, 100].includes(sides)) return null;
    const modifier = dice[3] ? Math.min(Math.max(Number(dice[3].replace(/\s/g, "")), -50), 50) : 0;
    const what = dice[4].trim();
    const label = (what ? what.charAt(0).toUpperCase() + what.slice(1) + " " : "") +
      "(" + count + "d" + sides + formatModifier(modifier) + ")";
    // Advantage only makes sense for a single d20.
    return { type: "dice", count: count, sides: sides, modifier: modifier,
             mode: count === 1 && sides === 20 ? mode : "normal", label: label, target: target };
  }

  const found = findCheckEntry(words, character);
  if (!found) return null;
  return { type: "check", entry: found.entry, index: found.index, mode: mode, label: found.entry.label, target: target };
}

// Match words like "perception", "dex save", "strength saving throw", "initiative"
// to an entry in the character's check list.
function findCheckEntry(words, character) {
  const list = getCheckList(character);
  let w = words.replace(/saving throw/g, "save").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  for (const ability of ABILITIES) {
    w = w.replace(new RegExp("\\b" + ability.key + "\\b"), ability.name.toLowerCase());   // "dex" -> "dexterity"
  }
  const attempts = [w, w.replace(/ check$/, ""), w + " check"];
  for (const attempt of attempts) {
    const index = list.findIndex(function (entry) {
      return entry.label.toLowerCase() === attempt;
    });
    if (index !== -1) return { entry: list[index], index: index };
  }
  return null;
}

// If the AI forgot the tag, look for "Make a Perception check" or "a Dexterity saving throw"
// near the END of the reply (earlier mentions are usually describing a past result).
function guessRollFromText(text, character) {
  const tail = text.toLowerCase().slice(-220);
  if (/roll (for )?initiative/.test(tail)) return parseRollRequest("initiative", character);
  for (const skill of SKILLS) {
    if (new RegExp("\\b" + skill.name.toLowerCase() + "\\)? check").test(tail)) return parseRollRequest(skill.name, character);
  }
  for (const ability of ABILITIES) {
    const name = ability.name.toLowerCase();
    if (new RegExp("\\b" + name + " (saving throw|save)").test(tail)) return parseRollRequest(name + " save", character);
    if (new RegExp("\\b" + name + " check").test(tail)) return parseRollRequest(name + " check", character);
  }
  return null;
}

// The button text for a request: "🎲 Roll Perception (+2)".
function describeRollRequest(request) {
  const extra = request.mode !== "normal" ? " with " + request.mode : "";
  if (request.type === "check") {
    const against = request.target ? " against " + targetWord(request.label) + " " + request.target : "";
    return "🎲 Roll " + request.label + " (" + formatBonus(request.entry.bonus) + ")" + extra + against;
  }
  return "🎲 Roll " + request.label + extra;
}

// Roll whatever was requested. "fallbackTarget" is the number to beat typed by the player,
// used when the Game Master didn't name one. Returns { text, total, success }.
function rollRequest(character, request, fallbackTarget) {
  if (request.type === "check") return rollCharacterCheck(character, request.entry, request.mode, request.target || fallbackTarget);

  let rolls = [];
  let shown;
  if (request.mode !== "normal") {
    const result = rollD20WithMode(request.mode);
    rolls = [result.kept];
    shown = result.kept + " (rolled " + result.rolls.join(" & ") + ", " + request.mode + ")";
  } else {
    for (let i = 0; i < request.count; i++) rolls.push(rollOneDie(request.sides));
    shown = rolls.length > 1 ? "[" + rolls.join(", ") + "]" : String(rolls[0]);
  }

  const total = rolls.reduce(function (sum, n) { return sum + n; }, 0) + request.modifier;
  let text = "🎲 " + request.label + ": " + shown +
    (request.modifier ? " " + formatBonus(request.modifier) : "") + " = " + total;
  if (request.sides === 20 && rolls.length === 1) {
    if (rolls[0] === 20) text += "  🎉 Natural 20!";
    if (rolls[0] === 1)  text += "  💀 Natural 1...";
  }
  return { text: text, total: total };
}

// ---------------------------------------------------------------------
// THE CHARACTER SHEET AS TEXT (sent to the AI Game Master)
// ---------------------------------------------------------------------
function makeSheetText(c) {
  const species = findByName(SPECIES, c.species);
  const lines = [];

  lines.push("Name: " + c.name);
  lines.push(characterLine(c) + (c.background ? " (" + c.background + " background)" : ""));
  lines.push("HP " + c.hp + "/" + getMaxHp(c) + " | AC " + getAc(c) + " | Speed " + getSpeed(c) + " ft | " +
             "Proficiency " + formatBonus(getProficiencyBonus(c.level)) + " | Passive Perception " + getPassivePerception(c));

  lines.push("Abilities: " + ABILITIES.map(function (a) {
    const score = getAbilityScore(c, a.key);
    return a.key.toUpperCase() + " " + score + " (" + formatBonus(getModifier(score)) + ")";
  }).join(", "));

  lines.push("Saving throws: " + ABILITIES.map(function (a) {
    return a.key.toUpperCase() + " " + formatBonus(getSaveBonus(c, a.key)) + (isSaveProficient(c, a.key) ? "*" : "");
  }).join(", ") + "  (* = proficient)");

  const trained = SKILLS.filter(function (s) {
    return c.proficientSkills.includes(s.name);
  }).map(function (s) {
    return s.name + " " + formatBonus(getSkillBonus(c, s));
  });
  lines.push("Skill proficiencies: " + (trained.length ? trained.join(", ") : "none"));

  for (const entry of getClassLevels(c)) {
    if (entry.data) lines.push(entry.name + " features: " + entry.data.features.join(", "));
  }

  // Spellcasting: save DC, spell attack, slots left and the chosen spells.
  for (const entry of getSpellcastingClasses(c)) {
    const book = getSpellbook(c, entry.name);
    lines.push(entry.name + " spellcasting: spell save DC " + getSpellSaveDc(c, entry.name) + ", spell attack " + formatBonus(getSpellAttackBonus(c, entry.name)));
    if (book.cantrips.length) lines.push(entry.name + " cantrips: " + book.cantrips.join(", "));
    if (book.prepared.length) lines.push(entry.name + " prepared spells: " + book.prepared.join(", "));
  }
  if (isSpellcaster(c)) {
    const left = getSpellSlotsLeft(c), total = getSpellSlotTotals(c);
    const slotText = total.map(function (t, i) { return t ? "level " + (i + 1) + ": " + left[i] + "/" + t : ""; }).filter(Boolean);
    const pact = getPactSlots(c);
    if (pact) slotText.push("Pact Magic level " + pact.level + ": " + getPactSlotsLeft(c) + "/" + pact.count);
    if (slotText.length) lines.push("Spell slots left: " + slotText.join(", "));
  }

  // Weapons and armor, so the Game Master uses the real numbers.
  const armor = wornArmor(c);
  if (usesArmorRules(c)) lines.push("Armor: " + (armor ? armor.name : "none") + (c.shield ? " and a Shield" : ""));
  lines.push("Attacks: " + getAttacks(c).map(function (a) {
    return a.name + " " + formatBonus(a.toHit) + " to hit, " + a.damage + " " + a.type.toLowerCase() +
      (a.twoHanded ? " (" + a.twoHanded + " two-handed)" : "");
  }).join("; "));
  if (species)    lines.push("Species traits: " + species.traits.join(", "));

  if (c.specialItem) {
    const item = c.specialItem;
    const tidy = function (s) {
      return String(s).trim().replace(/[.\s]+$/, "");   // drop trailing full stops so we don't print ".."
    };
    let text = "Special item: " + item.name + " (" + [item.type, item.rarity].filter(Boolean).join(", ") + ")";
    if (item.powers)     text += ". Powers: " + tidy(item.powers);
    if (item.appearance) text += ". Looks like: " + tidy(item.appearance);
    lines.push(text + ".");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// LIVE GAMES: identity, game codes, and what a player shares with a GM
// ---------------------------------------------------------------------

// Every browser gets a random id, so a GM can recognise a returning player.
// (It's random and unguessable, but it is not a password.)
let cachedClientId = null;
function getClientId() {
  if (cachedClientId) return cachedClientId;
  try {
    cachedClientId = localStorage.getItem("clientId");
  } catch (error) {
    cachedClientId = null;
  }
  if (!cachedClientId) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);   // the browser's secure random number generator
    cachedClientId = Array.from(bytes).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    try {
      localStorage.setItem("clientId", cachedClientId);
    } catch (error) {
      // Storage blocked: the id lasts only until the page closes.
    }
  }
  return cachedClientId;
}

// Game codes avoid look-alike characters (no 0/O, 1/I).
const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PEER_PREFIX = "dndtable-";

function makeGameCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(function (b) {
    return CODE_LETTERS[b % CODE_LETTERS.length];
  }).join("");
}

// Accepts "k7m-4qx", " K7M4QX " and so on.
function normalizeCode(text) {
  return String(text || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function peerIdFromCode(code) {
  return PEER_PREFIX + normalizeCode(code);
}

// The small summary of a character that a player sends to the GM.
// Deliberately leaves out inventory notes and the player's real name.
function makeSharedCharacter(c) {
  const item = c.specialItem;
  return {
    key: getClientId() + ":" + c.id,
    name: c.name,
    className: classSummary(c),   // "Fighter" or "Fighter 2 / Rogue 1"
    species: c.species,
    level: c.level,
    hp: c.hp,
    maxHp: getMaxHp(c),
    ac: getAc(c),
    passive: getPassivePerception(c),
    item: item ? {
      name: item.name, type: item.type, rarity: item.rarity, attunement: item.attunement,
      appearance: item.appearance, powers: item.powers
    } : null
  };
}

// Anything that arrives over the internet is untrusted. Make sure it is the right
// shape and a sensible size before using it. (The pages also only ever show it with
// textContent, never as HTML.)
function cleanText(value, maxLength) {
  return String(value === undefined || value === null ? "" : value).slice(0, maxLength);
}

function cleanNumber(value, min, max, fallback) {
  const n = Math.round(Number(value));
  if (!isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function cleanSharedCharacter(raw) {
  if (!raw || typeof raw !== "object") return null;
  const item = raw.item && typeof raw.item === "object" ? {
    name: cleanText(raw.item.name, 60),
    type: cleanText(raw.item.type, 40),
    rarity: cleanText(raw.item.rarity, 20),
    attunement: cleanText(raw.item.attunement, 60),
    appearance: cleanText(raw.item.appearance, 400),
    powers: cleanText(raw.item.powers, 600)
  } : null;

  const maxHp = cleanNumber(raw.maxHp, 1, 999, 1);
  return {
    key: cleanText(raw.key, 80),
    name: cleanText(raw.name, 40) || "Unnamed adventurer",
    className: cleanText(raw.className, 40),
    species: cleanText(raw.species, 30),
    level: cleanNumber(raw.level, 1, 20, 1),
    maxHp: maxHp,
    hp: cleanNumber(raw.hp, 0, maxHp, maxHp),
    ac: cleanNumber(raw.ac, 0, 99, 10),
    passive: cleanNumber(raw.passive, 0, 99, 10),
    item: item && item.name ? item : null
  };
}

// ---------------------------------------------------------------------
// THE SHARED BATTLE MAP (what the GM shows players)
// ---------------------------------------------------------------------
const MAP_TERRAIN_KEYS = ["wall", "tree", "rubble", "water"];
const MAP_GROUNDS = ["stone", "grass", "sand", "wood"];
const MAP_STATUSES = ["Unhurt", "Hurt", "Bloodied", "Down"];

// Check the map the GM sent: the right shape, sensible sizes, only known kinds of terrain.
// Returns a clean copy, or null if it isn't a map.
function cleanMapSnapshot(raw) {
  if (!raw || typeof raw !== "object") return null;
  const cols = cleanNumber(raw.cols, 8, 40, 0);
  const rows = cleanNumber(raw.rows, 8, 40, 0);
  if (!cols || !rows) return null;

  const terrain = {};
  if (raw.terrain && typeof raw.terrain === "object") {
    let seen = 0;
    for (const key in raw.terrain) {
      if (++seen > 1700) break;   // a 40 × 40 map has 1600 squares
      const match = /^(\d{1,2}),(\d{1,2})$/.exec(key);
      if (!match || Number(match[1]) >= cols || Number(match[2]) >= rows) continue;
      if (MAP_TERRAIN_KEYS.includes(raw.terrain[key])) terrain[key] = raw.terrain[key];
    }
  }

  const tokens = [];
  for (const t of (Array.isArray(raw.tokens) ? raw.tokens : []).slice(0, 120)) {
    if (!t || typeof t !== "object" || !["hero", "monster", "other"].includes(t.side)) continue;
    const token = {
      id: cleanNumber(t.id, 0, 100000, 0),
      side: t.side,
      name: cleanText(t.name, 40),
      label: cleanText(t.label, 4),
      size: cleanNumber(t.size, 1, 4, 1),
      x: cleanNumber(t.x, 0, cols - 1, 0),
      y: cleanNumber(t.y, 0, rows - 1, 0),
      status: MAP_STATUSES.includes(t.status) ? t.status : "Unhurt",
      conditions: (Array.isArray(t.conditions) ? t.conditions : []).slice(0, 14).map(function (c) { return cleanText(c, 20); })
    };
    if (t.side === "hero") {
      token.maxHp = cleanNumber(t.maxHp, 1, 999, 1);
      token.hp = cleanNumber(t.hp, 0, token.maxHp, token.maxHp);
    }
    tokens.push(token);
  }
  return { cols: cols, rows: rows, ground: MAP_GROUNDS.includes(raw.ground) ? raw.ground : "stone", terrain: terrain, tokens: tokens };
}

// ---------------------------------------------------------------------
// SHARING A CHARACTER BY LINK (the printable sheet page opens it read-only)
// ---------------------------------------------------------------------
// The hero is packed into the part of the web address after "#". That part is never sent
// to any server: it stays in the browser. It leaves out the player's real name and inventory notes.
// Anything that arrives in a link is untrusted, so it is checked against the rules before use.

// The small, safe summary of a hero that goes into the link.
function makeShareableSheet(c) {
  const item = c.specialItem;
  const share = {
    v: 1,
    n: c.name, cl: c.className, c2: c.secondClass || "", l2: c.secondClassLevel || 0,
    sp: c.species, bg: c.background || "", lv: c.level,
    ab: ABILITIES.map(function (a) { return c.abilities[a.key]; }),
    sk: c.proficientSkills || [],
    ar: typeof c.armor === "string" ? c.armor : null,   // null = an older hero whose AC was typed in
    sh: c.shield === true, ac: c.ac,
    w: c.weapons || [], mw: c.magicWeapon || "",
    sb: c.spellbook || {}, hp: c.hp
  };
  if (item) {
    share.it = { s: item.source, n: item.name, t: item.type, r: item.rarity, a: item.attuned !== false,
                 p: item.powers || "", l: item.appearance || "" };
  }
  return share;
}

// Pack and unpack as web-safe text (base64url).
function encodeShare(object) {
  const bytes = new TextEncoder().encode(JSON.stringify(object));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeShare(text) {
  try {
    if (typeof text !== "string" || text.length > 30000) return null;   // far bigger than any hero
    const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, function (ch) { return ch.charCodeAt(0); });
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    return null;
  }
}

// Turn what the link says into a real character object, keeping only what the rules allow.
// Returns null when it isn't a usable hero.
function cleanSharedSheet(raw) {
  if (!raw || typeof raw !== "object") return null;
  const charClass = findByName(CLASSES, raw.cl);
  const species = findByName(SPECIES, raw.sp);
  if (!charClass || !species || !Array.isArray(raw.ab) || raw.ab.length !== 6) return null;

  const abilities = {};
  ABILITIES.forEach(function (a, i) {
    abilities[a.key] = cleanNumber(raw.ab[i], 1, 30, 10);
  });
  const level = cleanNumber(raw.lv, 1, 20, 1);
  const names = function (list, allowed, max) {
    const seen = [];
    for (const item of Array.isArray(list) ? list.slice(0, 80) : []) {
      if (typeof item === "string" && allowed.includes(item) && !seen.includes(item) && seen.length < max) seen.push(item);
    }
    return seen;
  };

  const c = {
    id: 0, name: cleanText(raw.n, 40) || "Unnamed hero", playerName: "",
    className: charClass.name, species: species.name,
    background: findByName(BACKGROUNDS, raw.bg) ? raw.bg : "",
    level: level, abilities: abilities,
    proficientSkills: names(raw.sk, ALL_SKILL_NAMES, 18),
    shield: raw.sh === true, weapons: names(raw.w, WEAPONS.map(function (w) { return w.name; }), 12),
    inventory: ""
  };
  c.magicWeapon = c.weapons.includes(raw.mw) ? raw.mw : "";
  if (typeof raw.ar === "string" && (raw.ar === "none" || findByName(ARMOR, raw.ar))) c.armor = raw.ar;
  c.ac = cleanNumber(raw.ac, 1, 40, 10);

  const second = findByName(CLASSES, raw.c2);
  if (second && second.name !== charClass.name && level >= 2) {
    c.secondClass = second.name;
    c.secondClassLevel = cleanNumber(raw.l2, 1, level - 1, 1);
  }

  // Spells: only real spell names, only for classes the hero has
  if (raw.sb && typeof raw.sb === "object") {
    const book = {};
    for (const entry of getSpellcastingClasses(c)) {
      const mine = raw.sb[entry.name];
      if (!mine || typeof mine !== "object") continue;
      const real = typeof SPELLS === "undefined" ? function () { return true; } : function (n) { return Boolean(findSpell(n)); };
      const clean = function (list, max) {
        return (Array.isArray(list) ? list.slice(0, 80) : []).filter(function (n, i, all) {
          return typeof n === "string" && n.length < 50 && real(n) && all.indexOf(n) === i;   // real, and only once
        }).slice(0, max);
      };
      book[entry.name] = { cantrips: clean(mine.cantrips, 10), prepared: clean(mine.prepared, 40) };
    }
    c.spellbook = book;
  }

  if (raw.it && typeof raw.it === "object" && typeof raw.it.n === "string") {
    const known = findByName(MAGIC_ITEMS, raw.it.n);
    c.specialItem = {
      source: raw.it.s === "srd" && known ? "srd" : "custom",
      name: cleanText(raw.it.n, 60), type: cleanText(raw.it.t, 40),
      rarity: cleanText(raw.it.r, 20), attunement: known ? known.attunement : "",
      attuned: raw.it.a !== false,
      powers: cleanText(raw.it.p, 600), appearance: cleanText(raw.it.l, 400)
    };
  }
  c.hp = cleanNumber(raw.hp, 0, getMaxHp(c), getMaxHp(c));
  return c;
}
