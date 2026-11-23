// =====================================================================
// GAME RULES DATA + RULE CALCULATIONS
// Based on the System Reference Document 5.2.1 (the 2024 rules) by
// Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd,
// licensed under the Creative Commons Attribution 4.0 International License.
//
// PROOFREAD on 2026-11-21 against the official SRD 5.2.1 PDF
// (https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf):
// hit dice, saving throws, skill lists, level 1 features, Unarmored Defense,
// species sizes/speeds/traits, backgrounds, Standard Array, level 1 HP,
// fixed HP per level, and the proficiency bonus table all match.
//
// This file is DATA about the game, kept separate from the page code.
// To add or fix a class, species or background, change it here and
// every page that loads rules.js gets the update.
// =====================================================================

// ---------- The six abilities ----------
const ABILITIES = [
  { key: "str", name: "Strength" },
  { key: "dex", name: "Dexterity" },
  { key: "con", name: "Constitution" },
  { key: "int", name: "Intelligence" },
  { key: "wis", name: "Wisdom" },
  { key: "cha", name: "Charisma" }
];

// ---------- Skills, and which ability each one uses ----------
const SKILLS = [
  { name: "Acrobatics",      ability: "dex" },
  { name: "Animal Handling", ability: "wis" },
  { name: "Arcana",          ability: "int" },
  { name: "Athletics",       ability: "str" },
  { name: "Deception",       ability: "cha" },
  { name: "History",         ability: "int" },
  { name: "Insight",         ability: "wis" },
  { name: "Intimidation",    ability: "cha" },
  { name: "Investigation",   ability: "int" },
  { name: "Medicine",        ability: "wis" },
  { name: "Nature",          ability: "int" },
  { name: "Perception",      ability: "wis" },
  { name: "Performance",     ability: "cha" },
  { name: "Persuasion",      ability: "cha" },
  { name: "Religion",        ability: "int" },
  { name: "Sleight of Hand", ability: "dex" },
  { name: "Stealth",         ability: "dex" },
  { name: "Survival",        ability: "wis" }
];

// A list of just the skill names, e.g. for the Bard and Human, who can pick any skill.
const ALL_SKILL_NAMES = SKILLS.map(function (skill) {
  return skill.name;
});

// ---------- Classes ----------
//   hitDie:       the die you roll for HP (d12 = 12)
//   saves:        the two saving throws you're proficient in
//   skillCount:   how many skills you choose...
//   skillOptions: ...from this list
//   unarmoredDefense: (optional) the ability added to AC when not wearing armor
//   primary:      the class's Primary Ability. To MULTICLASS into or out of a class you
//                 need 13 or more in it (SRD "Multiclassing"). primaryAnyOne: true means
//                 13 in EITHER ability is enough (Fighter: Strength or Dexterity).
//   multiclassSkill: true if taking this as a SECOND class gives one skill from its list
//                 (Bard: any skill; Ranger and Rogue: one from their own lists).
const CLASSES = [
  {
    name: "Barbarian", primary: ["str"], hitDie: 12, saves: ["str", "con"], skillCount: 2,
    skillOptions: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
    unarmoredDefense: "con",
    features: ["Rage", "Unarmored Defense", "Weapon Mastery"]
  },
  {
    name: "Bard", primary: ["cha"], multiclassSkill: true, hitDie: 8, saves: ["dex", "cha"], skillCount: 3,
    skillOptions: ALL_SKILL_NAMES,
    features: ["Bardic Inspiration", "Spellcasting"]
  },
  {
    name: "Cleric", primary: ["wis"], hitDie: 8, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    features: ["Spellcasting", "Divine Order"]
  },
  {
    name: "Druid", primary: ["wis"], hitDie: 8, saves: ["int", "wis"], skillCount: 2,
    skillOptions: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
    features: ["Spellcasting", "Druidic", "Primal Order"]
  },
  {
    name: "Fighter", primary: ["str", "dex"], primaryAnyOne: true, hitDie: 10, saves: ["str", "con"], skillCount: 2,
    skillOptions: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Persuasion", "Perception", "Survival"],
    features: ["Fighting Style", "Second Wind", "Weapon Mastery"]
  },
  {
    name: "Monk", primary: ["dex", "wis"], hitDie: 8, saves: ["str", "dex"], skillCount: 2,
    skillOptions: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
    unarmoredDefense: "wis",
    features: ["Martial Arts", "Unarmored Defense"]
  },
  {
    name: "Paladin", primary: ["str", "cha"], hitDie: 10, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
    features: ["Lay On Hands", "Spellcasting", "Weapon Mastery"]
  },
  {
    name: "Ranger", primary: ["dex", "wis"], multiclassSkill: true, hitDie: 10, saves: ["str", "dex"], skillCount: 3,
    skillOptions: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
    features: ["Spellcasting", "Favored Enemy", "Weapon Mastery"]
  },
  {
    name: "Rogue", primary: ["dex"], multiclassSkill: true, hitDie: 8, saves: ["dex", "int"], skillCount: 4,
    skillOptions: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Persuasion", "Sleight of Hand", "Stealth"],
    features: ["Expertise", "Sneak Attack", "Thieves' Cant", "Weapon Mastery"]
  },
  {
    name: "Sorcerer", primary: ["cha"], hitDie: 6, saves: ["con", "cha"], skillCount: 2,
    skillOptions: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
    features: ["Spellcasting", "Innate Sorcery"]
  },
  {
    name: "Warlock", primary: ["cha"], hitDie: 8, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
    features: ["Eldritch Invocations", "Pact Magic"]
  },
  {
    name: "Wizard", primary: ["int"], hitDie: 6, saves: ["int", "wis"], skillCount: 2,
    skillOptions: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Nature", "Religion"],
    features: ["Spellcasting", "Ritual Adept", "Arcane Recovery"]
  }
];

// ---------- Species ----------
//   bonusHpPerLevel: (optional) extra HP every level (Dwarven Toughness)
//   skillChoice:     (optional) an extra skill to pick
const SPECIES = [
  { name: "Dragonborn", size: "Medium", speed: 30,
    traits: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance", "Darkvision (60 ft)", "Draconic Flight (level 5)"] },
  { name: "Dwarf", size: "Medium", speed: 30, bonusHpPerLevel: 1,
    traits: ["Darkvision (120 ft)", "Dwarven Resilience", "Dwarven Toughness", "Stonecunning"] },
  { name: "Elf", size: "Medium", speed: 30,
    skillChoice: { count: 1, options: ["Insight", "Perception", "Survival"] },
    traits: ["Darkvision (60 ft)", "Elven Lineage", "Fey Ancestry", "Keen Senses", "Trance"] },
  { name: "Gnome", size: "Small", speed: 30,
    traits: ["Darkvision (60 ft)", "Gnomish Cunning", "Gnomish Lineage"] },
  { name: "Goliath", size: "Medium", speed: 35,
    traits: ["Giant Ancestry", "Large Form (level 5)", "Powerful Build"] },
  { name: "Halfling", size: "Small", speed: 30,
    traits: ["Brave", "Halfling Nimbleness", "Luck", "Naturally Stealthy"] },
  { name: "Human", size: "Medium or Small", speed: 30,
    skillChoice: { count: 1, options: ALL_SKILL_NAMES },
    traits: ["Resourceful", "Skillful", "Versatile"] },
  { name: "Orc", size: "Medium", speed: 30,
    traits: ["Adrenaline Rush", "Darkvision (120 ft)", "Relentless Endurance"] },
  { name: "Tiefling", size: "Medium or Small", speed: 30,
    traits: ["Darkvision (60 ft)", "Fiendish Legacy", "Otherworldly Presence"] }
];

// ---------- Backgrounds ----------
// In the 2024 rules your BACKGROUND raises your ability scores:
// pick +2 and +1 among its three abilities, or +1 to all three.
// "tool" is the one tool proficiency each background gives.
const BACKGROUNDS = [
  { name: "Acolyte",  abilities: ["int", "wis", "cha"], skills: ["Insight", "Religion"],        feat: "Magic Initiate (Cleric)", tool: "Calligrapher's Supplies" },
  { name: "Criminal", abilities: ["dex", "con", "int"], skills: ["Sleight of Hand", "Stealth"], feat: "Alert",                   tool: "Thieves' Tools" },
  { name: "Sage",     abilities: ["con", "int", "wis"], skills: ["Arcana", "History"],          feat: "Magic Initiate (Wizard)", tool: "Calligrapher's Supplies" },
  { name: "Soldier",  abilities: ["str", "dex", "con"], skills: ["Athletics", "Intimidation"],  feat: "Savage Attacker",         tool: "One kind of Gaming Set (your choice)" }
];

// ---------- Special items ----------
// Magic items from the SRD 5.2.1 "Magic Items A-Z" chapter. These are Common and
// Uncommon ones (the kind a new adventurer might plausibly own), with the powers
// summarized in plain words. The SRD gives powers but not looks, so players
// describe what their item looks like themselves.
//   attunement: "" if none, otherwise the note shown on the sheet. Attuned items
//   only work after a Short Rest spent bonding with them (SRD "Attunement").
//   effects: (optional) the numbers an item changes on the character sheet:
//     ac: +N Armor Class                saves: +N to every saving throw
//     setAbility: { str: 19 }           an ability becomes at least this high
//     advantageSkills: ["Stealth"]      Advantage on these skill checks
//     climbSpeed: true                  gain a Climb Speed equal to your Speed
//     minSpeed: 30                      Speed is at least this
//   Items with no "effects" are described in words only (spells, charges, and
//   so on are for the player and DM to run at the table).
const MAGIC_ITEMS = [
  { name: "Weapon, +1", type: "Weapon", rarity: "Uncommon", attunement: "",
    powers: "A magic weapon of any simple or martial kind. You get +1 to attack rolls and +1 to damage rolls made with it." },
  { name: "Shield, +1", type: "Armor (Shield)", rarity: "Uncommon", attunement: "", effects: { ac: 1 },
    powers: "While you hold it, you get +1 Armor Class on top of the shield's normal bonus." },
  { name: "Cloak of Protection", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { ac: 1, saves: 1 },
    powers: "While you wear it, you get +1 to Armor Class and +1 to all saving throws." },
  { name: "Cloak of Elvenkind", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { advantageSkills: ["Stealth"] },
    powers: "Creatures have Disadvantage on Wisdom (Perception) checks to notice you, and you have Advantage on Dexterity (Stealth) checks." },
  { name: "Gauntlets of Ogre Power", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { setAbility: { str: 19 } },
    powers: "Your Strength is 19 while you wear them. They do nothing if your Strength is already 19 or higher." },
  { name: "Headband of Intellect", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { setAbility: { int: 19 } },
    powers: "Your Intelligence is 19 while you wear it. It does nothing if your Intelligence is already 19 or higher." },
  { name: "Bracers of Archery", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "While you wear them, you are proficient with the longbow and shortbow, and you get +2 to damage rolls with those weapons." },
  { name: "Brooch of Shielding", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "While you wear it, you have Resistance to Force damage and you are immune to damage from the Magic Missile spell." },
  { name: "Broom of Flying", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "An ordinary-looking broom until you stand astride it and use a Magic action to make it hover. It flies at 50 feet per round (30 if carrying over 200 pounds) and can carry up to 400 pounds." },
  { name: "Ring of Jumping", type: "Ring", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "While you wear it, you can cast the Jump spell from it, but only on yourself." },
  { name: "Ring of Mind Shielding", type: "Ring", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "You are immune to magic that reads your thoughts, tells whether you are lying, or reveals your alignment or creature type. Others can speak to your mind only if you allow it. You can make the ring invisible." },
  { name: "Hat of Disguise", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "While you wear it, you can cast the Disguise Self spell from it. The spell ends if you take the hat off." },
  { name: "Eyes of Charming", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "Crystal lenses with 3 charges. While you wear them, you can spend charges to cast Charm Person (save DC 13); each extra charge raises the spell's level by one. All charges return at dawn." },
  { name: "Pearl of Power", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement by a spellcaster",
    powers: "Use a Magic action to regain one spent spell slot of level 3 or lower. Once used, it can't be used again until the next dawn." },
  { name: "Periapt of Health", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "While you wear it, you can use a Magic action to regain 2d4 + 2 Hit Points (once, then again after the next dawn). You also have Advantage on saves against the Poisoned condition." },
  { name: "Staff of the Python", type: "Staff", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "Use a Magic action to throw the staff: it becomes a Giant Constrictor Snake that you control. It acts right after you in the initiative order." },
  { name: "Slippers of Spider Climbing", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { climbSpeed: true },
    powers: "You can climb walls and ceilings with your hands free, at a Climb Speed equal to your Speed. It doesn't work on slippery surfaces such as ice or oil." },
  { name: "Boots of Striding and Springing", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { minSpeed: 30 },
    powers: "Your Speed is at least 30 feet and isn't slowed by heavy armor or carrying too much. Once on each of your turns, you can jump up to 30 feet by spending only 10 feet of movement." },
  { name: "Helm of Telepathy", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement",
    powers: "You have telepathy with a range of 30 feet. You can also cast Detect Thoughts or Suggestion (save DC 13) from it; each spell can be cast once, then not again until the next dawn." }
];

// Make the object saved as character.specialItem (used by the character sheet
// and the AI Dungeon Master's setup, so both save items the same way).
function makeSrdItem(itemName, appearance) {
  const chosen = findByName(MAGIC_ITEMS, itemName);
  if (!chosen) return null;
  return {
    source: "srd",
    name: chosen.name,
    type: chosen.type,
    rarity: chosen.rarity,
    attunement: chosen.attunement,
    attuned: true,   // the character starts out bonded to it; they can untick this on the sheet
    powers: chosen.powers,
    appearance: appearance
  };
}

function makeCustomItem(itemName, type, powers, appearance) {
  return { source: "custom", name: itemName, type: type, rarity: "", attunement: "", powers: powers, appearance: appearance };
}

// The kinds of item a player can pick for a custom item.
const ITEM_TYPES = ["Weapon", "Armor or shield", "Ring", "Staff", "Wand", "Rod", "Wondrous item", "Potion or scroll", "Other"];

// The six scores everyone can use instead of rolling.
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Point Cost method (SRD "Ability Score Point Costs"): every ability starts at 8
// and you have 27 points to spend. Scores can only be 8 to 15 this way.
const POINT_BUY_BUDGET = 27;
const POINT_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_MIN = 8;
const POINT_BUY_MAX = 15;

// Total points spent on a set of scores like { str: 15, dex: 14, ... }.
function getPointCost(scores) {
  let total = 0;
  for (const key in scores) {
    total = total + POINT_COSTS[scores[key]];
  }
  return total;
}

// =====================================================================
// LOOKUP HELPERS
// =====================================================================

// Find an item in a list by its name, e.g. findByName(CLASSES, "Wizard").
function findByName(list, name) {
  return list.find(function (item) {
    return item.name === name;
  });
}

// Turn "str" into "Strength".
function abilityName(key) {
  const ability = ABILITIES.find(function (a) {
    return a.key === key;
  });
  return ability.name;
}

// =====================================================================
// RULE CALCULATIONS
// Everything a character sheet can work out from the rules.
// =====================================================================

// Score 10-11 -> +0, 12-13 -> +1, 8-9 -> -1, 16 -> +3, and so on.
function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

// ---------- Special item effects ----------

// The effects of the character's special item, but ONLY if it is working right now.
// Rules (SRD "Attunement"): an item that requires attunement only gives its magical
// benefits while you are attuned to it. A custom item has no automatic effects.
function getActiveItemEffects(character) {
  const item = character.specialItem;
  if (!item || item.source !== "srd") return {};

  const data = findByName(MAGIC_ITEMS, item.name);
  if (!data || !data.effects) return {};

  const needsAttunement = Boolean(data.attunement);
  if (needsAttunement && item.attuned === false) return {};   // not attuned: no magic
  return data.effects;
}

// An ability score with item effects applied. A "setAbility" item (Gauntlets of Ogre
// Power, Headband of Intellect) makes the score AT LEAST that high, never lower.
function getAbilityScore(character, abilityKey) {
  let score = character.abilities[abilityKey];
  const set = getActiveItemEffects(character).setAbility;
  if (set && set[abilityKey]) {
    score = Math.max(score, set[abilityKey]);
  }
  return score;
}

// Armor Class: the number the player entered (armor and so on) + bonuses from the item.
function getAc(character) {
  return character.ac + (getActiveItemEffects(character).ac || 0);
}

// Speed in feet: the species' speed, raised by an item that sets a minimum.
function getSpeed(character) {
  const species = findByName(SPECIES, character.species);
  let speed = species ? species.speed : 30;
  const minSpeed = getActiveItemEffects(character).minSpeed;
  if (minSpeed) speed = Math.max(speed, minSpeed);
  return speed;
}

// Does the item give Advantage on this skill? (Cloak of Elvenkind and Stealth.)
function itemGivesAdvantage(character, skillName) {
  const list = getActiveItemEffects(character).advantageSkills;
  return Boolean(list) && list.includes(skillName);
}

// A plain-words list of what the item changes, for showing on the sheet.
function describeItemEffects(effects) {
  const lines = [];
  if (effects.ac)    lines.push("+" + effects.ac + " Armor Class");
  if (effects.saves) lines.push("+" + effects.saves + " to every saving throw");
  if (effects.setAbility) {
    for (const key in effects.setAbility) {
      lines.push(abilityName(key) + " becomes " + effects.setAbility[key] + " (if it was lower)");
    }
  }
  if (effects.advantageSkills) lines.push("Advantage on " + effects.advantageSkills.join(" and ") + " checks (rolled for you)");
  if (effects.climbSpeed)      lines.push("Climb Speed equal to your Speed");
  if (effects.minSpeed)        lines.push("Speed is at least " + effects.minSpeed + " ft");
  return lines;
}

// Levels 1-4 -> +2, 5-8 -> +3, 9-12 -> +4, 13-16 -> +5, 17-20 -> +6.
function getProficiencyBonus(level) {
  return Math.floor((level - 1) / 4) + 2;
}

// ---------- Multiclassing (SRD "Multiclassing") ----------
// A character can have a SECOND class: c.secondClass ("Rogue") and c.secondClassLevel (2).
// c.level is always the TOTAL level; the first class has the rest of the levels.

// [{ name, data, levels }] for each class the character has, first class first.
function getClassLevels(character) {
  const second = character.secondClass ? findByName(CLASSES, character.secondClass) : null;
  let secondLevels = second ? Number(character.secondClassLevel) || 0 : 0;
  secondLevels = Math.min(Math.max(secondLevels, 0), character.level - 1);   // the first class keeps at least 1 level

  const list = [{ name: character.className, data: findByName(CLASSES, character.className), levels: character.level - secondLevels }];
  if (second && secondLevels > 0) list.push({ name: second.name, data: second, levels: secondLevels });
  return list;
}

// "Fighter" or "Fighter 2 / Rogue 1"
function classSummary(character) {
  const list = getClassLevels(character);
  if (list.length === 1) return character.className || "";
  return list.map(function (entry) {
    return entry.name + " " + entry.levels;
  }).join(" / ");
}

// "Strength or Dexterity" / "Dexterity and Wisdom"
function describePrimary(charClass) {
  return charClass.primary.map(abilityName).join(charClass.primaryAnyOne ? " or " : " and ");
}

// Does this set of scores have 13+ in the class's Primary Ability?
function meetsPrimary(abilities, charClass) {
  const checks = charClass.primary.map(function (key) {
    return abilities[key] >= 13;
  });
  return charClass.primaryAnyOne ? checks.includes(true) : !checks.includes(false);
}

// To multiclass you need 13+ in the Primary Ability of BOTH classes.
// Returns a list of problems (empty = allowed).
function getMulticlassProblems(abilities, firstClass, secondClass) {
  const problems = [];
  if (!firstClass || !secondClass) return problems;
  if (firstClass.name === secondClass.name) problems.push("Your second class must be different from your first.");
  if (!meetsPrimary(abilities, firstClass))  problems.push("To multiclass, a " + firstClass.name + " needs 13+ in " + describePrimary(firstClass) + ".");
  if (!meetsPrimary(abilities, secondClass)) problems.push("To become a " + secondClass.name + " you need 13+ in " + describePrimary(secondClass) + ".");
  return problems;
}

// Hit Dice: "3d10" or "2d10 + 1d8" (dice of the same size are pooled together).
function getHitDiceText(character) {
  const pool = {};
  for (const entry of getClassLevels(character)) {
    const die = entry.data ? entry.data.hitDie : 8;
    pool[die] = (pool[die] || 0) + entry.levels;
  }
  return Object.keys(pool).sort(function (a, b) {
    return b - a;
  }).map(function (die) {
    return pool[die] + "d" + die;
  }).join(" + ");
}

// Max HP: at level 1, your FIRST class's hit die's highest number + Con modifier.
// Every level after that (in either class): that class's hit die average (rounded up) + Con modifier.
function getMaxHp(character) {
  const species = findByName(SPECIES, character.species);
  const conMod = getModifier(getAbilityScore(character, "con"));
  const classes = getClassLevels(character);

  let hp = 0;
  classes.forEach(function (entry, index) {
    const hitDie = entry.data ? entry.data.hitDie : 8;
    let levels = entry.levels;
    if (index === 0) {
      hp = hp + hitDie + conMod;   // level 1 is always in the first class
      levels = levels - 1;
    }
    hp = hp + levels * (hitDie / 2 + 1 + conMod);
  });

  if (species && species.bonusHpPerLevel) {
    hp = hp + species.bonusHpPerLevel * character.level;
  }
  return Math.max(hp, 1);   // you always have at least 1 HP
}

// AC without armor: 10 + Dex modifier.
// Barbarians and Monks (Unarmored Defense) also add another ability.
// A multiclass Barbarian/Monk can only use ONE Unarmored Defense (SRD "Armor Class");
// we use the first class's.
function getUnarmoredAc(character) {
  let ac = 10 + getModifier(getAbilityScore(character, "dex"));
  const withDefense = getClassLevels(character).find(function (entry) {
    return entry.data && entry.data.unarmoredDefense;
  });
  if (withDefense) {
    ac = ac + getModifier(getAbilityScore(character, withDefense.data.unarmoredDefense));
  }
  return ac;
}

function getSkillBonus(character, skill) {
  let bonus = getModifier(getAbilityScore(character, skill.ability));
  if (character.proficientSkills.includes(skill.name)) {
    bonus = bonus + getProficiencyBonus(character.level);
  }
  return bonus;
}

// Saving throws come from your FIRST class only (a second class doesn't add any).
function isSaveProficient(character, abilityKey) {
  const charClass = findByName(CLASSES, character.className);
  return Boolean(charClass) && charClass.saves.includes(abilityKey);
}

function getSaveBonus(character, abilityKey) {
  let bonus = getModifier(getAbilityScore(character, abilityKey));
  if (isSaveProficient(character, abilityKey)) {
    bonus = bonus + getProficiencyBonus(character.level);
  }
  bonus = bonus + (getActiveItemEffects(character).saves || 0);   // e.g. Cloak of Protection
  return bonus;
}

// Passive Perception: 10 + your Perception bonus. The DM uses it to see
// whether you notice hidden things without rolling.
function getPassivePerception(character) {
  return 10 + getSkillBonus(character, findByName(SKILLS, "Perception"));
}

// =====================================================================
// SAVED CHARACTERS (shared by the character page and the DM page)
// =====================================================================
function loadCharacters() {
  try {
    const savedText = localStorage.getItem("characters");
    if (savedText) return JSON.parse(savedText);
  } catch (error) {
    // Storage blocked: start with an empty list.
  }
  return [];
}

function saveCharacters(characters) {
  try {
    localStorage.setItem("characters", JSON.stringify(characters));
    return true;
  } catch (error) {
    return false;
  }
}
