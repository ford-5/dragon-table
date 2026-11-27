// =====================================================================
// COMBAT ACTIONS: attacks and spells that roll and deal damage by the rules
// (SRD 5.2.1 "Combat" and "Spells"). Shared by:
//   dm.html    the GM Screen's turn cards (the GM's device rolls every die)
//   join.html  players choosing their own attack or spell in a live game
//   solo.html  solo dungeons (the monsters fight back by themselves)
// Needs dice.js, rules.js, spells.js and play.js loaded first.
// =====================================================================

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const SAVE_KEYS = { Strength: "str", Dexterity: "dex", Constitution: "con", Intelligence: "int", Wisdom: "wis", Charisma: "cha" };

// ---------------------------------------------------------------------
// 1. A HERO'S COMBAT PROFILE: everything needed to fight, worked out from
//    the saved character by the rules. Small enough to send to the GM.
// ---------------------------------------------------------------------
function makeCombatProfile(character) {
  const features = getCombatFeatures(character);   // rules.js: Second Wind, Sneak Attack, Rage...
  const attacks = getAttacks(character).map(function (a) {
    const weapon = a.weapon;
    const melee = !weapon || weapon.kind !== "Ranged";
    let dmg = a.damage;
    if (features.radiantStrikes && melee) dmg += "+1d8";   // Paladin 11: Radiant Strikes
    return {
      n: a.name, toHit: a.toHit, dmg: dmg, type: a.type,
      melee: melee,                                       // melee weapon (or an unarmed strike)
      str: a.ability === "str",                           // uses Strength (Rage adds damage)
      finesse: Boolean(weapon && (weapon.props.includes("Finesse") || weapon.kind === "Ranged"))   // Sneak Attack works
    };
  });
  const spells = [];
  for (const entry of getSpellcastingClasses(character)) {
    const book = getSpellbook(character, entry.name);
    const atk = getSpellAttackBonus(character, entry.name);
    const dc = getSpellSaveDc(character, entry.name);
    const mod = getSpellModifier(character, entry.name);
    for (const name of book.cantrips.concat(book.prepared)) {
      if (!spells.some(function (s) { return s.n === name; })) {
        spells.push({ n: name, cls: entry.name, atk: atk, dc: dc, mod: mod });
      }
    }
  }
  const saves = {};
  for (const key of ABILITY_KEYS) saves[key] = getSaveBonus(character, key);
  const pact = getPactSlots(character);
  return {
    level: character.level,
    attacksPerAction: getAttacksPerAction(character),   // Extra Attack (rules.js)
    features: features,
    attacks: attacks,
    spells: spells,
    saves: saves,
    slots: getSpellSlotsLeft(character),
    pact: pact ? { level: pact.level, left: getPactSlotsLeft(character) } : null
  };
}

// Dice like "1d8+3" or "2d6": only digits, d, + and -, and not too big.
function cleanDiceText(text) {
  const t = String(text || "").replace(/\s+/g, "").slice(0, 30);
  return /^\d{1,2}(d\d{1,3})?([+-]\d{1,2}(d\d{1,3})?){0,4}$/.test(t) ? t : null;
}

// A profile that arrived over the internet: keep only what the rules allow.
// "Plausible" checks, all tied to the hero's LEVEL:
//   weapons must be real weapons; spells must be real spells of that class and of a
//   level they could cast; bonuses can't be higher than ability (+5) + proficiency
//   + a magic item (+3); spell slots can't be more than the rules give at that level.
function cleanCombatProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const level = cleanNumber(raw.level, 1, 20, 1);
  const prof = getProficiencyBonus(level);
  const maxBonus = 5 + prof + 3;
  const maxSlots = MULTICLASS_SLOTS[level - 1];   // the most slots anyone that level can have
  let topSlotLevel = 0;
  maxSlots.forEach(function (n, i) { if (n > 0) topSlotLevel = i + 1; });
  // A Warlock's Pact Magic slots go up to level 5 (from Warlock level 9).
  const topPactLevel = Math.min(Math.ceil(level / 2), 5);

  const attacks = [];
  for (const a of (Array.isArray(raw.attacks) ? raw.attacks : []).slice(0, 12)) {
    if (!a || typeof a !== "object") continue;
    const realWeapon = a.n === "Unarmed Strike" || WEAPONS.some(function (w) { return w.name === a.n; });
    const dmg = cleanDiceText(a.dmg);
    if (!realWeapon || !dmg || averageDamage(dmg) > 20) continue;
    if (attacks.some(function (x) { return x.n === a.n; })) continue;
    attacks.push({ n: a.n, toHit: cleanNumber(a.toHit, -5, maxBonus, 0), dmg: dmg, type: cleanText(a.type, 20),
                   melee: a.melee !== false, str: a.str === true, finesse: a.finesse === true });
  }

  const pact = raw.pact && typeof raw.pact === "object"
    ? { level: cleanNumber(raw.pact.level, 1, topPactLevel, 1), left: cleanNumber(raw.pact.left, 0, 4, 0) } : null;
  const castable = Math.max(topSlotLevel, pact ? pact.level : 0);

  const spells = [];
  for (const s of (Array.isArray(raw.spells) ? raw.spells : []).slice(0, 80)) {
    if (!s || typeof s !== "object") continue;
    const spell = findSpell(s.n);
    if (!spell || !SPELLCASTING[s.cls] || !spell.classes.includes(s.cls)) continue;
    if (spell.level > castable) continue;   // a spell too high for any slot they could have
    if (spells.some(function (x) { return x.n === spell.n; })) continue;
    spells.push({ n: spell.n, cls: s.cls, atk: cleanNumber(s.atk, -3, prof + 5 + 3, 0),
                  dc: cleanNumber(s.dc, 8, 8 + prof + 5 + 3, 10), mod: cleanNumber(s.mod, -3, 5, 0) });
  }

  const saves = {};
  const rawSaves = raw.saves && typeof raw.saves === "object" ? raw.saves : {};
  for (const key of ABILITY_KEYS) saves[key] = cleanNumber(rawSaves[key], -5, maxBonus, 0);
  const slots = [];
  for (let i = 0; i < 9; i++) slots.push(cleanNumber(Array.isArray(raw.slots) ? raw.slots[i] : 0, 0, maxSlots[i], 0));
  // Extra Attack: never more than a level 20 Fighter's 4, and 1 below level 5
  const extra = level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
  const attacksPerAction = cleanNumber(raw.attacksPerAction, 1, extra, 1);
  return { level: level, attacksPerAction: attacksPerAction, features: cleanFeatures(raw.features, level),
           attacks: attacks, spells: spells, saves: saves, slots: slots, pact: pact };
}

// Class features from another device: only what a hero of that level could have.
function cleanFeatures(raw, level) {
  const f = {};
  if (!raw || typeof raw !== "object") return f;
  if (raw.secondWind && typeof raw.secondWind === "object") {
    f.secondWind = { uses: cleanNumber(raw.secondWind.uses, 0, level >= 10 ? 4 : level >= 4 ? 3 : 2, 2),
                     heal: "1d10+" + cleanNumber(String(raw.secondWind.heal).split("+")[1], 1, level, 1) };
  }
  if (raw.actionSurge && level >= 2) f.actionSurge = cleanNumber(raw.actionSurge, 1, level >= 17 ? 2 : 1, 1);
  if (raw.sneakDice) f.sneakDice = cleanNumber(raw.sneakDice, 1, Math.ceil(level / 2), 1);
  if (raw.steadyAim === true && level >= 3) f.steadyAim = true;
  if (raw.rage && typeof raw.rage === "object") {
    f.rage = { uses: cleanNumber(raw.rage.uses, 0, level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2, 2),
               bonus: cleanNumber(raw.rage.bonus, 2, level >= 16 ? 4 : level >= 9 ? 3 : 2, 2) };
  }
  if (raw.layOnHands) f.layOnHands = cleanNumber(raw.layOnHands, 0, 5 * level, 5);
  if (raw.radiantStrikes === true && level >= 11) f.radiantStrikes = true;
  if (raw.focus && level >= 2) f.focus = cleanNumber(raw.focus, 0, level, 0);
  return f;
}

// ---------------------------------------------------------------------
// FEATURE STATE: what's left during a fight or an adventure (uses, Rage on or off).
// Kept by the page (Solo: on the game; GM Screen: on each combatant) and passed in.
// ---------------------------------------------------------------------
function newFeatureState(profile) {
  const f = (profile && profile.features) || {};
  return {
    secondWind: f.secondWind ? f.secondWind.uses : 0,
    actionSurge: f.actionSurge || 0,
    rage: f.rage ? f.rage.uses : 0,
    layOnHands: f.layOnHands || 0,
    focus: f.focus || 0,
    raging: false,       // Rage lasts until the fight ends
    aimed: false,        // Steady Aim: Advantage on the next attack this turn
    sneakUsed: false,    // Sneak Attack: once per turn
    surged: false        // Action Surge: once per turn
  };
}

// A new turn starts: the once-per-turn things come back.
function startFeatureTurn(state) {
  if (!state) return;
  state.aimed = false;
  state.sneakUsed = false;
  state.surged = false;
}

// A Short Rest: Second Wind gets one use back, Action Surge and Focus all, Rage one (SRD 5.2.1).
function shortRestFeatures(state, profile) {
  const f = (profile && profile.features) || {};
  if (!state) return;
  if (f.secondWind) state.secondWind = Math.min(state.secondWind + 1, f.secondWind.uses);
  if (f.actionSurge) state.actionSurge = f.actionSurge;
  if (f.focus) state.focus = f.focus;
  if (f.rage) state.rage = Math.min(state.rage + 1, f.rage.uses);
}

// Spells you cast right after hitting with a weapon (Divine Smite and the other smites).
function isWeaponRider(spell) {
  return /immediately after hitting/i.test(spell.time || "");
}

// ---------------------------------------------------------------------
// 2. WHAT SOMEONE CAN DO: a list of actions to show as buttons.
//    Each action: { key, kind: "weapon" | "spell" | "monster", name, label, ... }
// ---------------------------------------------------------------------
function spellShortInfo(spell) {
  const bits = [spell.level === 0 ? "cantrip" : "level " + spell.level];
  if (spell.atk) bits.push("spell attack");
  if (spell.save) bits.push(spell.save + " save");
  if (spell.heal) bits.push("healing");
  if (spell.dmg && !spell.atk && !spell.save) bits.push("hits automatically");
  if (!spell.dmg && !spell.heal) bits.push("no dice");
  return bits.join(", ");
}

// state (optional): the feature state; features that are used up or switched on don't show.
function heroActions(profile, state) {
  const list = [];
  if (!profile) return list;
  const times = Math.max(Number(profile.attacksPerAction) || 1, 1);   // Extra Attack
  const riders = [];
  for (const a of profile.attacks) {
    list.push({ key: "w:" + a.n, kind: "weapon", name: a.n, attack: a, times: times,
                label: "🗡️ " + a.n + (times > 1 ? " ×" + times : "") + " (" + formatBonus(a.toHit) + ", " + a.dmg + ")" });
  }
  for (const s of profile.spells) {
    const spell = findSpell(s.n);
    if (!spell) continue;
    if (isWeaponRider(spell)) { if (spell.dmg) riders.push({ spell: spell, caster: s }); continue; }
    const bonus = /^Bonus Action/i.test(spell.time || "");
    list.push({ key: "s:" + s.n, kind: "spell", name: s.n, spell: spell, caster: s, bonus: bonus,
                label: (spell.level === 0 ? "✨ " : "🔮 ") + s.n + " (" + spellShortInfo(spell) + (bonus ? ", bonus action" : "") + ")" });
  }
  // A smite: a melee weapon attack that adds the spell's damage on the first hit (and only then uses the slot)
  for (const r of riders) {
    for (const a of profile.attacks) {
      if (!a.melee) continue;
      list.push({ key: "w:" + a.n + "+s:" + r.spell.n, kind: "weapon", name: a.n + " + " + r.spell.n, attack: a, times: times,
                  rider: r.spell, caster: r.caster,
                  label: "🗡️ " + a.n + (times > 1 ? " ×" + times : "") + " + ✨ " + r.spell.n + " (+" + r.spell.dmg + " on a hit, uses a slot only if you hit)" });
    }
  }
  // Class features (rules.js getCombatFeatures)
  const f = profile.features || {};
  const st = state || newFeatureState(profile);
  const unarmed = profile.attacks.find(function (a) { return a.n === "Unarmed Strike"; });
  if (f.secondWind && st.secondWind > 0) {
    list.push({ key: "f:secondWind", kind: "feature", feature: "secondWind", bonus: true, self: true, name: "Second Wind",
                label: "💚 Second Wind (bonus action: heal " + f.secondWind.heal + ", " + st.secondWind + " left)" });
  }
  if (f.rage && st.rage > 0 && !st.raging) {
    list.push({ key: "f:rage", kind: "feature", feature: "rage", bonus: true, self: true, name: "Rage",
                label: "😤 Rage (bonus action: +" + f.rage.bonus + " Strength damage, half weapon damage taken, " + st.rage + " left)" });
  }
  if (f.steadyAim && !st.aimed) {
    list.push({ key: "f:steadyAim", kind: "feature", feature: "steadyAim", bonus: true, self: true, name: "Steady Aim",
                label: "🎯 Steady Aim (bonus action, only if you haven't moved: Advantage on your next attack)" });
  }
  if (f.layOnHands && st.layOnHands > 0) {
    list.push({ key: "f:layOnHands", kind: "feature", feature: "layOnHands", bonus: true, heals: true, name: "Lay On Hands",
                label: "🙌 Lay On Hands (bonus action: heal from your pool, " + st.layOnHands + " HP left)" });
  }
  if (f.focus && st.focus > 0 && unarmed) {
    list.push({ key: "f:flurry", kind: "feature", feature: "flurry", bonus: true, name: "Flurry of Blows", attack: unarmed, times: 2,
                label: "👊 Flurry of Blows (bonus action: two unarmed strikes, " + st.focus + " Focus left)" });
  }
  if (f.actionSurge && st.actionSurge > 0 && !st.surged) {
    list.push({ key: "f:actionSurge", kind: "feature", feature: "actionSurge", free: true, self: true, name: "Action Surge",
                label: "⚡ Action Surge (take one more action this turn, " + st.actionSurge + " left)" });
  }
  return list;
}

// A monster's attacks from its SRD stat block, plus Multiattack if it has one
// (Multiattack here = its strongest attack that many times; the SRD sometimes mixes attacks).
function monsterActions(monster) {
  const list = [];
  if (!monster || !Array.isArray(monster.atk)) return list;
  const attacks = monster.atk.map(function (a) {
    return { n: a.n, toHit: a.hit, dmg: a.dice, type: a.type };
  });
  if (monster.multi > 1 && attacks.length) {
    const best = attacks.slice().sort(function (a, b) { return averageDamage(b.dmg) - averageDamage(a.dmg); })[0];
    list.push({ key: "multi", kind: "monster", name: "Multiattack", attack: best, times: monster.multi,
                label: "⚔️ Multiattack (" + monster.multi + "× " + best.n + ")" });
  }
  for (const a of attacks) {
    list.push({ key: "m:" + a.n, kind: "monster", name: a.n, attack: a, times: 1,
                label: "🐾 " + a.n + " (" + formatBonus(a.toHit) + ", " + a.dmg + ")" });
  }
  return list;
}

// A monster's saving throws: its ability modifiers (the SRD's extra save
// proficiencies aren't in our monster list, so this is a close approximation).
function monsterSaves(monster) {
  const saves = {};
  ABILITY_KEYS.forEach(function (key, i) {
    saves[key] = monster && monster.abil ? getModifier(monster.abil[i]) : 0;
  });
  return saves;
}

// The spell slots that could cast this spell: [{ kind: "slot" | "pact", level, left }].
function profileSlotChoices(profile, spell) {
  if (!profile || spell.level === 0) return [];
  const choices = [];
  profile.slots.forEach(function (left, i) {
    if (i + 1 >= spell.level && left > 0) choices.push({ kind: "slot", level: i + 1, left: left });
  });
  if (profile.pact && profile.pact.left > 0 && profile.pact.level >= spell.level) {
    choices.push({ kind: "pact", level: profile.pact.level, left: profile.pact.left });
  }
  return choices;
}

// The damage type, read from the spell's own description ("... 1d10 Fire damage").
const DAMAGE_TYPES = ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"];
const DAMAGE_TYPE_PATTERN = new RegExp("\\d+d\\d+[^.]{0,20}?\\b(" + DAMAGE_TYPES.join("|") + ")\\s+damage", "i");
function spellDamageType(spell) {
  const match = DAMAGE_TYPE_PATTERN.exec((spell.text || []).join(" "));
  return match ? match[1].toLowerCase() : "";
}

// Spells that only affect the caster (range "Self", like Shield).
function isSelfSpell(spell) {
  return /^Self$/i.test(String(spell.range || "").trim());
}

// Does the spell hit an AREA (so it may have several targets)?
function isAreaSpell(spell) {
  return /^Self \(/.test(spell.range || "") || (spell.text || []).join(" ").includes("each creature");
}

// How many darts / rays / beams this spell makes at this slot level (1 for most spells).
function spellRepeats(spell, profile, slotLevel) {
  if (spell.n === "Magic Missile") return 3 + Math.max((slotLevel || 1) - 1, 0);
  if (spell.n === "Scorching Ray") return 3 + Math.max((slotLevel || 2) - 2, 0);
  const damage = getSpellDamage(spell, { level: profile ? profile.level : 1 }, slotLevel);
  return damage ? damage.beams : 1;
}

// The most targets an action may have (so nobody's Fire Bolt hits five goblins).
function maxTargets(action, profile, slotLevel) {
  if (action.kind !== "spell") return 1;
  const spell = action.spell;
  if (spell.heal) return /Mass/.test(spell.n) ? 6 : 1;
  if (spell.save && isAreaSpell(spell)) return 8;
  const repeats = spellRepeats(spell, profile, slotLevel);
  return Math.max(repeats, 1);
}

// ---------------------------------------------------------------------
// 3. DOING IT: roll the dice and work out the damage. Nothing is changed here:
//    it returns { lines: [text], changes: [{ id, amount }] } and the page
//    applies the changes (negative = damage, positive = healing).
//    targets: [{ id, name, ac, saves }]   mode: "normal" | "advantage" | "disadvantage"
// ---------------------------------------------------------------------
function rollD20Plus(bonus, mode) {
  if (mode === "advantage" || mode === "disadvantage") {
    const r = rollD20WithMode(mode);
    return { d20: r.kept, total: r.kept + bonus, shown: r.kept + " (" + r.rolls.join(" & ") + ")" };
  }
  const d20 = rollOneDie(20);
  return { d20: d20, total: d20 + bonus, shown: String(d20) };
}

// One attack roll against one target.
// onHit (optional): returns extra damage for this hit, like { dice: "2d6", why: "Sneak Attack" }
// target.resist (optional): damage types it takes half damage from (a raging Barbarian).
// Returns true on a hit.
function attackOnce(what, bonus, dice, type, target, mode, result, onHit) {
  const roll = rollD20Plus(bonus, mode);
  const crit = roll.d20 === 20;
  const hit = crit || (roll.d20 !== 1 && roll.total >= target.ac);
  let line = what + " at " + target.name + ": 🎲 " + roll.shown + " " + formatBonus(bonus) + " = " + roll.total + " vs AC " + target.ac;
  if (!hit) {
    result.lines.push(line + (roll.d20 === 1 ? " → natural 1, miss." : " → miss."));
    return false;
  }
  const extras = onHit ? onHit() : [];
  const damage = rollDiceText(dice, crit);   // a critical hit doubles the dice
  let total = damage.total;
  let text = damage.text;
  const why = [];
  for (const extra of extras) {
    const more = rollDiceText(extra.dice, crit && !/^\d+$/.test(extra.dice));   // flat bonuses aren't doubled
    total += more.total;
    text += (more.text.startsWith("+") ? " " : " + ") + more.text;   // "+2", not "+ +2"
    why.push(extra.why);
  }
  // Resistance: half damage (rounded down). The first type named decides, e.g. "piercing + poison".
  const firstType = String(type || "").toLowerCase().split(/[^a-z]+/).filter(Boolean)[0] || "";
  let halved = "";
  if (target.resist && firstType && target.resist.includes(firstType)) {
    total = Math.floor(total / 2);
    halved = " (halved by Rage)";
  }
  result.changes.push({ id: target.id, amount: -total });
  result.lines.push(line + (crit ? " → CRITICAL HIT! " : " → hit! ") + total + " " +
    (type ? String(type).toLowerCase() + " " : "") + "damage " + text + (why.length ? " (with " + why.join(" and ") + ")" : "") + halved + ".");
  return true;
}

function resolveAction(actorName, action, targets, options) {
  const result = { lines: [], changes: [] };
  const mode = (options && options.mode) || "normal";
  const slotLevel = options && options.slotLevel;
  const profile = options && options.profile;
  if (!targets.length) targets = [{ id: null, name: "nobody", ac: 10, saves: {} }];

  const state = options && options.state;        // feature state (Rage, Sneak Attack used...), changed here
  const f = (profile && profile.features) || {};
  result.usedAction = !action.bonus && !action.free;
  result.usedBonus = Boolean(action.bonus);

  // Weapons, monster attacks and Flurry of Blows
  if (action.kind === "weapon" || action.kind === "monster" || (action.kind === "feature" && action.feature === "flurry")) {
    if (action.feature === "flurry") {
      state.focus = Math.max(state.focus - 1, 0);
      result.lines.push("👊 " + actorName + " uses Flurry of Blows (1 Focus Point).");
    }
    const a = action.attack;
    const times = action.times || 1;
    for (let i = 0; i < times; i++) {
      let attackMode = mode;
      if (state && state.aimed) { attackMode = "advantage"; state.aimed = false; }   // Steady Aim
      const onHit = function () {
        const extras = [];
        if (state && state.raging && a.melee && a.str && f.rage) extras.push({ dice: String(f.rage.bonus), why: "Rage +" + f.rage.bonus });
        if (state && f.sneakDice && !state.sneakUsed && a.finesse && (attackMode === "advantage" || (options && options.allyNear))) {
          state.sneakUsed = true;
          extras.push({ dice: f.sneakDice + "d6", why: "Sneak Attack " + f.sneakDice + "d6" });
        }
        if (action.rider && !result.riderUsed) {
          result.riderUsed = true;   // the slot is spent only now, on a hit
          const castAt = Math.max(slotLevel || action.rider.level, action.rider.level);
          let dice = action.rider.dmg;
          if (action.rider.up && castAt > action.rider.up[1]) dice = addDice(dice, action.rider.up[0], castAt - action.rider.up[1]);
          extras.push({ dice: dice, why: action.rider.n });
        }
        return extras;
      };
      attackOnce(actorName + "'s " + a.n + (attackMode === "advantage" && mode !== "advantage" ? " (Steady Aim: Advantage)" : ""),
                 a.toHit, a.dmg, a.type, targets[i % targets.length], attackMode, result, onHit);
    }
    if (action.rider && !result.riderUsed) result.lines.push("(No hit, so " + action.rider.n + " wasn't cast and no slot was used.)");
    return result;
  }

  // Other class features
  if (action.kind === "feature") {
    if (action.feature === "secondWind") {
      state.secondWind = Math.max(state.secondWind - 1, 0);
      const heal = rollDiceText(f.secondWind.heal, false);
      result.changes.push({ id: options.selfId, amount: heal.total });
      result.lines.push("💚 " + actorName + " uses Second Wind: heals " + heal.total + " HP " + heal.text + ".");
    } else if (action.feature === "rage") {
      state.rage = Math.max(state.rage - 1, 0);
      state.raging = true;
      result.lines.push("😤 " + actorName + " RAGES! +" + f.rage.bonus + " damage with Strength attacks, and half damage from bludgeoning, piercing and slashing until the fight ends.");
    } else if (action.feature === "steadyAim") {
      state.aimed = true;
      result.noMove = true;
      result.lines.push("🎯 " + actorName + " takes Steady Aim: Advantage on the next attack (and no more moving this turn).");
    } else if (action.feature === "actionSurge") {
      state.actionSurge = Math.max(state.actionSurge - 1, 0);
      state.surged = true;
      result.extraAction = true;
      result.lines.push("⚡ " + actorName + " uses Action Surge: one more action this turn!");
    } else if (action.feature === "layOnHands") {
      const t = targets[0];
      // Heal exactly what's missing (or what's left in the pool), so no points are wasted
      const missing = Number.isFinite(t.maxHp) ? Math.max(t.maxHp - (t.hp || 0), 0) : state.layOnHands;
      const amount = Math.min(state.layOnHands, missing);
      if (amount <= 0) {
        result.usedBonus = false;
        result.lines.push("🙌 " + t.name + " is already at full HP, so Lay On Hands isn't needed.");
        return result;
      }
      state.layOnHands -= amount;
      result.changes.push({ id: t.id, amount: amount });
      result.lines.push("🙌 " + actorName + " uses Lay On Hands on " + t.name + ": heals " + amount + " HP (" + state.layOnHands + " left in the pool).");
    }
    return result;
  }

  // Spells
  const spell = action.spell;
  const caster = action.caster;
  const castAt = spell.level === 0 ? 0 : Math.max(slotLevel || spell.level, spell.level);
  const title = actorName + " casts " + spell.n + (castAt > spell.level ? " (level " + castAt + " slot)" : "");

  if (spell.heal) {
    let dice = spell.heal;
    if (spell.up && !spell.dmg && castAt > spell.up[1]) dice = addDice(dice, spell.up[0], castAt - spell.up[1]);
    if (spell.healMod && caster.mod) dice += (caster.mod > 0 ? "+" : "") + caster.mod;
    for (const target of targets) {
      const heal = rollDiceText(dice, false);
      result.changes.push({ id: target.id, amount: heal.total });
      result.lines.push(title + " on " + target.name + ": 💚 heals " + heal.total + " HP " + heal.text + ".");
    }
    return result;
  }

  const damage = getSpellDamage(spell, { level: profile ? profile.level : 1 }, castAt);
  if (!damage) {
    result.lines.push(title + (targets[0].id !== null ? " on " + targets.map(function (t) { return t.name; }).join(", ") : "") +
      ". (No dice: the GM decides what happens.)");
    return result;
  }

  if (spell.atk) {
    const repeats = spellRepeats(spell, profile, castAt);
    for (let i = 0; i < repeats; i++) {
      attackOnce(title + (repeats > 1 ? " (" + (i + 1) + "/" + repeats + ")" : ""), caster.atk, damage.dice, spellDamageType(spell),
                 targets[i % targets.length], mode, result);
    }
    return result;
  }

  if (spell.save) {
    // Everyone in the area takes the SAME damage roll; each target rolls their own save.
    const key = SAVE_KEYS[spell.save];
    const halfOnSave = (spell.text || []).join(" ").includes("half as much damage");
    const rolled = rollDiceText(damage.dice, false);
    result.lines.push(title + ": " + rolled.total + " " + spellDamageType(spell) + " damage " + rolled.text +
      ", " + spell.save + " save DC " + caster.dc + (halfOnSave ? " (half on a success)" : "") + ".");
    for (const target of targets) {
      const bonus = (target.saves && target.saves[key]) || 0;
      const save = rollD20Plus(bonus, "normal");
      const saved = save.total >= caster.dc;
      const taken = saved ? (halfOnSave ? Math.floor(rolled.total / 2) : 0) : rolled.total;
      if (taken) result.changes.push({ id: target.id, amount: -taken });
      result.lines.push("  " + target.name + " saves: 🎲 " + save.shown + " " + formatBonus(bonus) + " = " + save.total +
        (saved ? " → success, takes " + taken + "." : " → fail, takes " + taken + "."));
    }
    return result;
  }

  // Hits automatically (Magic Missile's darts and the like)
  const repeats = spellRepeats(spell, profile, castAt);
  for (let i = 0; i < repeats; i++) {
    const target = targets[i % targets.length];
    const rolled = rollDiceText(damage.dice, false);
    result.changes.push({ id: target.id, amount: -rolled.total });
    result.lines.push(title + (repeats > 1 ? " (" + (i + 1) + "/" + repeats + ")" : "") + " hits " + target.name + ": " +
      rolled.total + " " + spellDamageType(spell) + " damage " + rolled.text + ".");
  }
  return result;
}
