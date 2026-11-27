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
//     weaponBonus: 1                    +N to attack and damage with the weapon marked as magic
//     archery: 2                        proficiency with Longbow and Shortbow, +N damage with them
//   Items with no "effects" are described in words only (spells, charges, and
//   so on are for the player and AM to run at the table).
const MAGIC_ITEMS = [
  { name: "Weapon, +1", type: "Weapon", rarity: "Uncommon", attunement: "", effects: { weaponBonus: 1 },
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
  { name: "Bracers of Archery", type: "Wondrous Item", rarity: "Uncommon", attunement: "Requires attunement", effects: { archery: 2 },
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
// and the AI App Master's setup, so both save items the same way).
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

// ---------- Spellcasting (SRD 5.2.1: each class's features table, and "Multiclassing") ----------
//   ability:  the spellcasting ability     kind: "full", "half" (Paladin, Ranger) or "pact" (Warlock)
//   cantrips / prepared: how many you know / prepare, by CLASS level (index 0 = level 1)
//   pactSlots / pactLevel: a Warlock's slots and their level, by class level
// Spell slots for everyone but Warlocks come from MULTICLASS_SLOTS (below), because the
// SRD's single-class tables match it: full casters use their level, half casters half their
// level rounded up (checked against every class table when this data was made).
const SPELLCASTING = {
  Bard: {
    ability: "cha", kind: "full",
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    prepared: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  },
  Cleric: {
    ability: "wis", kind: "full",
    cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    prepared: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  },
  Druid: {
    ability: "wis", kind: "full",
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    prepared: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  },
  Paladin: {
    ability: "cha", kind: "half",
    cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    prepared: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  },
  Ranger: {
    ability: "wis", kind: "half",
    cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    prepared: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  },
  Sorcerer: {
    ability: "cha", kind: "full",
    cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    prepared: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  },
  Warlock: {
    ability: "cha", kind: "pact",
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    prepared: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
    pactSlots: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
    pactLevel: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  },
  Wizard: {
    ability: "int", kind: "full",
    cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    prepared: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
  }
};

// Spell slots by "caster level" 1-20: [level 1 slots, level 2 slots, ... level 9 slots].
// (SRD "Multiclass Spellcaster" table)
const MULTICLASS_SLOTS = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1]
];

// ---------- Weapons (SRD 5.2.1 "Weapons" table) ----------
//   damage: the die rolled     type: damage type     props: weapon properties
//   range: for thrown and ammunition weapons (normal/long, in feet)
//   versatile: the bigger die when used with two hands     mastery: its Weapon Mastery property
const WEAPONS = [
  // Simple melee
  { name: "Club",          category: "Simple",  kind: "Melee",  damage: "1d4",  type: "Bludgeoning", props: ["Light"], mastery: "Slow" },
  { name: "Dagger",        category: "Simple",  kind: "Melee",  damage: "1d4",  type: "Piercing",    props: ["Finesse", "Light", "Thrown"], range: "20/60", mastery: "Nick" },
  { name: "Greatclub",     category: "Simple",  kind: "Melee",  damage: "1d8",  type: "Bludgeoning", props: ["Two-Handed"], mastery: "Push" },
  { name: "Handaxe",       category: "Simple",  kind: "Melee",  damage: "1d6",  type: "Slashing",    props: ["Light", "Thrown"], range: "20/60", mastery: "Vex" },
  { name: "Javelin",       category: "Simple",  kind: "Melee",  damage: "1d6",  type: "Piercing",    props: ["Thrown"], range: "30/120", mastery: "Slow" },
  { name: "Light Hammer",  category: "Simple",  kind: "Melee",  damage: "1d4",  type: "Bludgeoning", props: ["Light", "Thrown"], range: "20/60", mastery: "Nick" },
  { name: "Mace",          category: "Simple",  kind: "Melee",  damage: "1d6",  type: "Bludgeoning", props: [], mastery: "Sap" },
  { name: "Quarterstaff",  category: "Simple",  kind: "Melee",  damage: "1d6",  type: "Bludgeoning", props: ["Versatile"], versatile: "1d8", mastery: "Topple" },
  { name: "Sickle",        category: "Simple",  kind: "Melee",  damage: "1d4",  type: "Slashing",    props: ["Light"], mastery: "Nick" },
  { name: "Spear",         category: "Simple",  kind: "Melee",  damage: "1d6",  type: "Piercing",    props: ["Thrown", "Versatile"], range: "20/60", versatile: "1d8", mastery: "Sap" },
  // Simple ranged
  { name: "Dart",          category: "Simple",  kind: "Ranged", damage: "1d4",  type: "Piercing",    props: ["Finesse", "Thrown"], range: "20/60", mastery: "Vex" },
  { name: "Light Crossbow", category: "Simple", kind: "Ranged", damage: "1d8",  type: "Piercing",    props: ["Ammunition", "Loading", "Two-Handed"], range: "80/320", mastery: "Slow" },
  { name: "Shortbow",      category: "Simple",  kind: "Ranged", damage: "1d6",  type: "Piercing",    props: ["Ammunition", "Two-Handed"], range: "80/320", mastery: "Vex" },
  { name: "Sling",         category: "Simple",  kind: "Ranged", damage: "1d4",  type: "Bludgeoning", props: ["Ammunition"], range: "30/120", mastery: "Slow" },
  // Martial melee
  { name: "Battleaxe",     category: "Martial", kind: "Melee",  damage: "1d8",  type: "Slashing",    props: ["Versatile"], versatile: "1d10", mastery: "Topple" },
  { name: "Flail",         category: "Martial", kind: "Melee",  damage: "1d8",  type: "Bludgeoning", props: [], mastery: "Sap" },
  { name: "Glaive",        category: "Martial", kind: "Melee",  damage: "1d10", type: "Slashing",    props: ["Heavy", "Reach", "Two-Handed"], mastery: "Graze" },
  { name: "Greataxe",      category: "Martial", kind: "Melee",  damage: "1d12", type: "Slashing",    props: ["Heavy", "Two-Handed"], mastery: "Cleave" },
  { name: "Greatsword",    category: "Martial", kind: "Melee",  damage: "2d6",  type: "Slashing",    props: ["Heavy", "Two-Handed"], mastery: "Graze" },
  { name: "Halberd",       category: "Martial", kind: "Melee",  damage: "1d10", type: "Slashing",    props: ["Heavy", "Reach", "Two-Handed"], mastery: "Cleave" },
  { name: "Lance",         category: "Martial", kind: "Melee",  damage: "1d10", type: "Piercing",    props: ["Heavy", "Reach", "Two-Handed (unless mounted)"], mastery: "Topple" },
  { name: "Longsword",     category: "Martial", kind: "Melee",  damage: "1d8",  type: "Slashing",    props: ["Versatile"], versatile: "1d10", mastery: "Sap" },
  { name: "Maul",          category: "Martial", kind: "Melee",  damage: "2d6",  type: "Bludgeoning", props: ["Heavy", "Two-Handed"], mastery: "Topple" },
  { name: "Morningstar",   category: "Martial", kind: "Melee",  damage: "1d8",  type: "Piercing",    props: [], mastery: "Sap" },
  { name: "Pike",          category: "Martial", kind: "Melee",  damage: "1d10", type: "Piercing",    props: ["Heavy", "Reach", "Two-Handed"], mastery: "Push" },
  { name: "Rapier",        category: "Martial", kind: "Melee",  damage: "1d8",  type: "Piercing",    props: ["Finesse"], mastery: "Vex" },
  { name: "Scimitar",      category: "Martial", kind: "Melee",  damage: "1d6",  type: "Slashing",    props: ["Finesse", "Light"], mastery: "Nick" },
  { name: "Shortsword",    category: "Martial", kind: "Melee",  damage: "1d6",  type: "Piercing",    props: ["Finesse", "Light"], mastery: "Vex" },
  { name: "Trident",       category: "Martial", kind: "Melee",  damage: "1d8",  type: "Piercing",    props: ["Thrown", "Versatile"], range: "20/60", versatile: "1d10", mastery: "Topple" },
  { name: "Warhammer",     category: "Martial", kind: "Melee",  damage: "1d8",  type: "Bludgeoning", props: ["Versatile"], versatile: "1d10", mastery: "Push" },
  { name: "War Pick",      category: "Martial", kind: "Melee",  damage: "1d8",  type: "Piercing",    props: ["Versatile"], versatile: "1d10", mastery: "Sap" },
  { name: "Whip",          category: "Martial", kind: "Melee",  damage: "1d4",  type: "Slashing",    props: ["Finesse", "Reach"], mastery: "Slow" },
  // Martial ranged
  { name: "Blowgun",       category: "Martial", kind: "Ranged", damage: "1",    type: "Piercing",    props: ["Ammunition", "Loading"], range: "25/100", mastery: "Vex" },
  { name: "Hand Crossbow", category: "Martial", kind: "Ranged", damage: "1d6",  type: "Piercing",    props: ["Ammunition", "Light", "Loading"], range: "30/120", mastery: "Vex" },
  { name: "Heavy Crossbow", category: "Martial", kind: "Ranged", damage: "1d10", type: "Piercing",   props: ["Ammunition", "Heavy", "Loading", "Two-Handed"], range: "100/400", mastery: "Push" },
  { name: "Longbow",       category: "Martial", kind: "Ranged", damage: "1d8",  type: "Piercing",    props: ["Ammunition", "Heavy", "Two-Handed"], range: "150/600", mastery: "Slow" },
  { name: "Musket",        category: "Martial", kind: "Ranged", damage: "1d12", type: "Piercing",    props: ["Ammunition", "Loading", "Two-Handed"], range: "40/120", mastery: "Slow" },
  { name: "Pistol",        category: "Martial", kind: "Ranged", damage: "1d10", type: "Piercing",    props: ["Ammunition", "Loading"], range: "30/90", mastery: "Vex" }
];

// ---------- Armor (SRD 5.2.1 "Armor" table) ----------
//   base: the AC number     dexMax: how much Dex can add (null = all of it, 0 = none)
//   strength: the Strength score needed, or your Speed drops by 10 ft
//   stealth: true = Disadvantage on Dexterity (Stealth) checks
const ARMOR = [
  { name: "Padded Armor",          category: "Light",  base: 11, dexMax: null, stealth: true },
  { name: "Leather Armor",         category: "Light",  base: 11, dexMax: null },
  { name: "Studded Leather Armor", category: "Light",  base: 12, dexMax: null },
  { name: "Hide Armor",            category: "Medium", base: 12, dexMax: 2 },
  { name: "Chain Shirt",           category: "Medium", base: 13, dexMax: 2 },
  { name: "Scale Mail",            category: "Medium", base: 14, dexMax: 2, stealth: true },
  { name: "Breastplate",           category: "Medium", base: 14, dexMax: 2 },
  { name: "Half Plate Armor",      category: "Medium", base: 15, dexMax: 2, stealth: true },
  { name: "Ring Mail",             category: "Heavy",  base: 14, dexMax: 0, stealth: true },
  { name: "Chain Mail",            category: "Heavy",  base: 16, dexMax: 0, strength: 13, stealth: true },
  { name: "Splint Armor",          category: "Heavy",  base: 17, dexMax: 0, strength: 15, stealth: true },
  { name: "Plate Armor",           category: "Heavy",  base: 18, dexMax: 0, strength: 15, stealth: true }
];
const SHIELD_BONUS = 2;

// ---------- Weapon and armor training, by class (SRD "Core ... Traits") ----------
//   weapons: "simple", "martial", "martialLight" (Monk), "martialFinesseOrLight" (Rogue)
//   armor: "light", "medium", "heavy", "shield"
// A SECOND class (multiclassing) only gives part of this: see "multiclass".
const CLASS_TRAINING = {
  Barbarian: { weapons: ["simple", "martial"], armor: ["light", "medium", "shield"], multiclass: { weapons: ["martial"], armor: ["shield"] } },
  Bard:      { weapons: ["simple"], armor: ["light"], multiclass: { weapons: [], armor: ["light"] } },
  Cleric:    { weapons: ["simple"], armor: ["light", "medium", "shield"], multiclass: { weapons: [], armor: ["light", "medium", "shield"] } },
  Druid:     { weapons: ["simple"], armor: ["light", "shield"], multiclass: { weapons: [], armor: ["light", "shield"] } },
  Fighter:   { weapons: ["simple", "martial"], armor: ["light", "medium", "heavy", "shield"], multiclass: { weapons: ["martial"], armor: ["light", "medium", "shield"] } },
  Monk:      { weapons: ["simple", "martialLight"], armor: [], multiclass: { weapons: [], armor: [] } },
  Paladin:   { weapons: ["simple", "martial"], armor: ["light", "medium", "heavy", "shield"], multiclass: { weapons: ["martial"], armor: ["light", "medium", "shield"] } },
  Ranger:    { weapons: ["simple", "martial"], armor: ["light", "medium", "shield"], multiclass: { weapons: ["martial"], armor: ["light", "medium", "shield"] } },
  Rogue:     { weapons: ["simple", "martialFinesseOrLight"], armor: ["light"], multiclass: { weapons: [], armor: ["light"] } },
  Sorcerer:  { weapons: ["simple"], armor: [], multiclass: { weapons: [], armor: [] } },
  Warlock:   { weapons: ["simple"], armor: ["light"], multiclass: { weapons: [], armor: ["light"] } },
  Wizard:    { weapons: ["simple"], armor: [], multiclass: { weapons: [], armor: [] } }
};

// The six scores everyone can use instead of rolling.
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Where each class wants its scores, best first. The class's Primary Ability
// always comes first, then usually Constitution (more HP). This is our own
// suggestion for beginners; players can still move any number by hand.
const ABILITY_ORDER_BY_CLASS = {
  Barbarian: ["str", "con", "dex", "wis", "cha", "int"],
  Bard:      ["cha", "dex", "con", "wis", "int", "str"],
  Cleric:    ["wis", "con", "str", "cha", "int", "dex"],
  Druid:     ["wis", "con", "dex", "int", "cha", "str"],
  Fighter:   ["str", "con", "dex", "wis", "cha", "int"],
  Monk:      ["dex", "wis", "con", "str", "int", "cha"],
  Paladin:   ["str", "cha", "con", "wis", "dex", "int"],
  Ranger:    ["dex", "wis", "con", "str", "int", "cha"],
  Rogue:     ["dex", "con", "int", "wis", "cha", "str"],
  Sorcerer:  ["cha", "con", "dex", "wis", "int", "str"],
  Warlock:   ["cha", "con", "dex", "wis", "int", "str"],
  Wizard:    ["int", "con", "dex", "wis", "cha", "str"]
};

// The best order for a hero. With a second class, that class's Primary
// Ability moves up right after the first class's, because multiclassing
// needs 13 or more in both.
function getAbilityOrder(firstClass, secondClass) {
  const order = (firstClass && ABILITY_ORDER_BY_CLASS[firstClass.name] ||
                 ["str", "dex", "con", "int", "wis", "cha"]).slice();
  if (!secondClass) return order;

  let mustBeHigh = [];
  if (firstClass) mustBeHigh = firstClass.primaryAnyOne ? [order[0]] : firstClass.primary.slice();
  // Fighter needs only ONE of Str/Dex, so their first choice is enough.
  const secondNeeds = secondClass.primaryAnyOne ? [secondClass.primary[0]] : secondClass.primary;
  for (const key of secondNeeds) {
    if (!mustBeHigh.includes(key)) mustBeHigh.push(key);
  }
  const rest = order.filter(function (key) { return !mustBeHigh.includes(key); });
  return mustBeHigh.concat(rest);
}

// Pair the numbers with the order: the biggest number goes to the most
// important ability. Returns { str: positionInList, dex: ..., ... }.
function placeScores(numbers, order) {
  const positions = numbers.map(function (number, index) { return index; });
  positions.sort(function (a, b) { return numbers[b] - numbers[a]; });   // biggest first
  const assignments = {};
  order.forEach(function (key, rank) {
    assignments[key] = positions[rank];
  });
  return assignments;
}

// The background's +2 and +1 go to its two abilities that matter most.
function pickBackgroundBonus(backgroundAbilities, order) {
  const ranked = backgroundAbilities.slice().sort(function (a, b) {
    return order.indexOf(a) - order.indexOf(b);
  });
  return { plusTwo: ranked[0], plusOne: ranked[1] };
}

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

// ---------- Conditions (paraphrased from the SRD 5.2.1 "Rules Glossary") ----------
// "Rules in brief": a quick refresher in our own words (Library and the AM Screen's books).
const RULES_BRIEF = [
  { title: "How a turn works", lines: [
    "Fights are played in rounds of about 6 seconds. At the start, everyone rolls Initiative (a Dexterity check) to set the turn order.",
    "On your turn you can move up to your Speed and take one action. Some features add a bonus action. You also get one reaction per round, such as an opportunity attack when an enemy leaves your reach." ] },
  { title: "Ability checks, saves and Difficulty Classes", lines: [
    "To try something risky, roll a d20 and add the right ability modifier (and your proficiency bonus if you're trained). Meet or beat the Difficulty Class (DC) to succeed.",
    "Typical DCs: Very easy 5, Easy 10, Medium 15, Hard 20, Very hard 25, Nearly impossible 30.",
    "A saving throw works the same way: you roll to resist something, like a fireball or poison. Your Passive Perception is 10 plus your Perception bonus." ] },
  { title: "Advantage and Disadvantage", lines: [
    "With Advantage you roll two d20s and take the higher. With Disadvantage you take the lower.",
    "Several sources of Advantage still only give you one extra die, and if you have both Advantage and Disadvantage they cancel out." ] },
  { title: "Attacks, damage and Armor Class", lines: [
    "To attack, roll a d20 and add your attack bonus. If the total meets or beats the target's Armor Class (AC), you hit and roll damage.",
    "A natural 20 always hits and is a critical hit: roll the damage dice twice. A natural 1 always misses." ] },
  { title: "Actions you can take", lines: [
    "Attack: make an attack. Dash: gain extra movement equal to your Speed. Disengage: your movement doesn't provoke opportunity attacks. Dodge: attacks against you are at a disadvantage until your next turn.",
    "Help: give an ally Advantage on a check or attack. Hide: try to slip out of sight. Influence: persuade or scare someone. Magic: cast a spell or use a magic item.",
    "Ready: prepare a reaction to a trigger. Search: look for something. Study: recall lore or investigate. Utilize: use an object." ] },
  { title: "Hit Points, resting and dying", lines: [
    "Damage lowers your Hit Points (HP). At 0 HP you fall unconscious and make death saving throws on your turns: roll a d20, 10 or more is a success, and three successes make you stable. Three failures mean death. A natural 20 brings you back with 1 HP, and a natural 1 counts as two failures.",
    "A Short Rest (about an hour) lets you spend Hit Point Dice to heal. A Long Rest (about 8 hours) restores all your HP, some Hit Dice, and your spell slots." ] },
  { title: "Moving on a grid", lines: [
    "Each square is 5 feet. Moving costs 1 square per step, including diagonals. Difficult terrain costs 2 squares to enter. You can't cut the corner of a wall diagonally.",
    "To measure the range between two creatures, count the squares between them by the shortest route." ] }
];

const CONDITIONS = [
  { name: "Blinded",       text: "Can't see, and automatically fails any check that needs sight. Attacks against it have advantage; its attacks have disadvantage." },
  { name: "Charmed",       text: "Can't attack the charmer or target them with harmful abilities or magic. The charmer has advantage on social checks against it." },
  { name: "Deafened",      text: "Can't hear, and automatically fails any check that needs hearing." },
  { name: "Exhaustion",    text: "Stacks in levels 1–6. Each level gives −2 to every d20 test and −5 ft of speed. Level 6 means death. A long rest removes one level." },
  { name: "Frightened",    text: "Disadvantage on ability checks and attacks while the source of fear is in sight. Can't willingly move closer to it." },
  { name: "Grappled",      text: "Speed is 0. Disadvantage on attacks against anyone except the grappler. The grappler can drag it along (at extra movement cost)." },
  { name: "Incapacitated", text: "Can't take actions, bonus actions or reactions. Concentration ends, and it can't speak." },
  { name: "Invisible",     text: "Can't be seen without special senses. Attacks against it have disadvantage; its attacks have advantage. Advantage on initiative." },
  { name: "Paralyzed",     text: "Incapacitated, speed 0. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits." },
  { name: "Petrified",     text: "Turned to stone: incapacitated, speed 0. Automatically fails Strength and Dexterity saves; attacks against it have advantage. Resistant to all damage and immune to poison." },
  { name: "Poisoned",      text: "Disadvantage on attack rolls and ability checks." },
  { name: "Prone",         text: "Can only crawl, or spend half its speed to stand up. Its attacks have disadvantage. Attacks against it have advantage within 5 ft, disadvantage from farther away." },
  { name: "Restrained",    text: "Speed 0. Attacks against it have advantage; its attacks have disadvantage. Disadvantage on Dexterity saves." },
  { name: "Stunned",       text: "Incapacitated. Automatically fails Strength and Dexterity saves. Attacks against it have advantage." },
  { name: "Unconscious",   text: "Incapacitated and prone, drops what it's holding, unaware of its surroundings. Speed 0, fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits." }
];

// ---------- Encounter difficulty (SRD 5.2.1 "Combat Encounters": XP Budget per Character) ----------
// By the party's level: [Low, Moderate, High] XP for EACH character. Multiply by the number of heroes.
const XP_BUDGET = {
  1: [50, 75, 100], 2: [100, 150, 200], 3: [150, 225, 400], 4: [250, 375, 500], 5: [500, 750, 1100],
  6: [600, 1000, 1400], 7: [750, 1300, 1700], 8: [1000, 1700, 2100], 9: [1300, 2000, 2600], 10: [1600, 2300, 3100],
  11: [1900, 2900, 4100], 12: [2200, 3700, 4700], 13: [2600, 4200, 5400], 14: [2900, 4900, 6200], 15: [3300, 5400, 7800],
  16: [3800, 6100, 9800], 17: [4500, 7200, 11700], 18: [5000, 8700, 14200], 19: [5500, 10700, 17200], 20: [6400, 13200, 22000]
};

// The three budgets for a whole party: { low, moderate, high }.
function getEncounterBudgets(level, partySize) {
  const row = XP_BUDGET[Math.min(Math.max(Math.round(level), 1), 20)];
  return { low: row[0] * partySize, moderate: row[1] * partySize, high: row[2] * partySize };
}

// "Low", "Moderate" or "High" for this much monster XP (or "Over High", or "Below Low").
function describeEncounterXp(xp, level, partySize) {
  const budgets = getEncounterBudgets(level, partySize);
  if (xp > budgets.high) return "Over High";
  if (xp > budgets.moderate) return "High";
  if (xp > budgets.low) return "Moderate";
  return xp > 0 ? "Low" : "None";
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

// Armor Class: from the armor the character wears (worked out by the rules), or, for
// characters from before armor could be chosen, the number the player typed in.
// Then bonuses from the special item are added on top.
function getAc(character) {
  const base = usesArmorRules(character) ? getArmorAc(character) : character.ac;
  return base + (getActiveItemEffects(character).ac || 0);
}

// Speed in feet: the species' speed, raised by an item that sets a minimum.
function getSpeed(character) {
  const species = findByName(SPECIES, character.species);
  let speed = species ? species.speed : 30;
  // Heavy armor without enough Strength: Speed drops by 10 ft (SRD "Armor").
  const armor = wornArmor(character);
  if (armor && armor.strength && character.abilities.str < armor.strength) speed = speed - 10;
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
  if (effects.weaponBonus)     lines.push("+" + effects.weaponBonus + " to attack and damage with the weapon you mark ✨ in Weapons & Armor");
  if (effects.archery)         lines.push("Proficient with Longbow and Shortbow, +" + effects.archery + " damage with them");
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

// How many attacks a character makes when they take the Attack action (SRD 5.2.1 class
// features): Extra Attack at level 5 for Barbarians, Fighters, Monks, Paladins and Rangers
// (2 attacks); a Fighter gets 3 at level 11 and 4 at level 20. With two classes they
// don't add up: you use the best one.
const EXTRA_ATTACK_CLASSES = ["Barbarian", "Fighter", "Monk", "Paladin", "Ranger"];
function getAttacksPerAction(character) {
  let best = 1;
  for (const entry of getClassLevels(character)) {
    if (!EXTRA_ATTACK_CLASSES.includes(entry.name)) continue;
    let n = entry.levels >= 5 ? 2 : 1;
    if (entry.name === "Fighter" && entry.levels >= 11) n = 3;
    if (entry.name === "Fighter" && entry.levels >= 20) n = 4;
    best = Math.max(best, n);
  }
  return best;
}

// =====================================================================
// CLASS FEATURES BY LEVEL (SRD 5.2.1 class tables; the descriptions are short and
// in our own words, so read the SRD for the full rules). "Subclass feature" levels
// depend on the subclass the player picks.
// Each entry: [level, name, what it does]
// =====================================================================
const ASI = "Ability Score Improvement: raise your scores (or take a feat instead).";
const CLASS_FEATURES = {
  Barbarian: [
    [1, "Rage", "A Bonus Action: hit harder with Strength attacks and take half damage from weapons."],
    [1, "Unarmored Defense", "Without armor, your AC is 10 + Dexterity + Constitution."],
    [1, "Weapon Mastery", "Use the special mastery property of some weapons you know."],
    [2, "Danger Sense", "Advantage on Dexterity saves against things you can see."],
    [2, "Reckless Attack", "Attack with Advantage, but enemies get Advantage against you too."],
    [3, "Barbarian Subclass", "Choose your Path (the SRD has the Path of the Berserker)."],
    [3, "Primal Knowledge", "Learn one more skill, and use Strength for some skills while raging."],
    [4, ASI.split(":")[0], ASI],
    [5, "Extra Attack", "Attack twice when you take the Attack action."],
    [5, "Fast Movement", "Your Speed goes up by 10 feet without heavy armor."],
    [6, "Subclass feature", "A new power from your Path."],
    [7, "Feral Instinct", "Advantage on Initiative rolls."],
    [7, "Instinctive Pounce", "Move up to half your Speed when you start a Rage."],
    [8, ASI.split(":")[0], ASI],
    [9, "Brutal Strike", "Give up Advantage from Reckless Attack for extra damage and a special effect."],
    [10, "Subclass feature", "A new power from your Path."],
    [11, "Relentless Rage", "While raging, a Constitution save can keep you on your feet at 0 HP."],
    [12, ASI.split(":")[0], ASI],
    [13, "Improved Brutal Strike", "More Brutal Strike effects."],
    [14, "Subclass feature", "A new power from your Path."],
    [15, "Persistent Rage", "Your Rage lasts longer and only ends when you choose."],
    [16, ASI.split(":")[0], ASI],
    [17, "Improved Brutal Strike", "Brutal Strike gets even stronger."],
    [18, "Indomitable Might", "Strength checks can't roll lower than your Strength score."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Primal Champion", "Strength and Constitution go up by 4 (to a maximum of 25)."]
  ],
  Bard: [
    [1, "Bardic Inspiration", "A Bonus Action: give a friend a die to add to a roll."],
    [1, "Spellcasting", "Cast bard spells using Charisma."],
    [2, "Expertise", "Double your proficiency bonus for two skills."],
    [2, "Jack of All Trades", "Add half your proficiency bonus to checks you aren't trained in."],
    [3, "Bard Subclass", "Choose your College (the SRD has the College of Lore)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Font of Inspiration", "Bardic Inspiration comes back after a Short Rest too."],
    [6, "Subclass feature", "A new power from your College."],
    [7, "Countercharm", "Help a friend reroll a failed save against being charmed or frightened."],
    [8, ASI.split(":")[0], ASI],
    [9, "Expertise", "Double proficiency for two more skills."],
    [10, "Magical Secrets", "Learn spells from other classes' lists."],
    [12, ASI.split(":")[0], ASI],
    [14, "Subclass feature", "A new power from your College."],
    [16, ASI.split(":")[0], ASI],
    [18, "Superior Inspiration", "Regain Bardic Inspiration when you roll Initiative."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Words of Creation", "Two famous spells are always ready, and can affect two creatures."]
  ],
  Cleric: [
    [1, "Spellcasting", "Cast cleric spells using Wisdom."],
    [1, "Divine Order", "Choose to be a Protector (armor and weapons) or a Thaumaturge (extra magic)."],
    [2, "Channel Divinity", "Divine power a few times per rest: turn undead or a domain power."],
    [3, "Cleric Subclass", "Choose your Domain (the SRD has the Life Domain)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Sear Undead", "Turning undead also burns them with radiant damage."],
    [6, "Subclass feature", "A new power from your Domain."],
    [7, "Blessed Strikes", "Extra radiant damage on hits, or stronger cantrips."],
    [8, ASI.split(":")[0], ASI],
    [10, "Divine Intervention", "Ask your god to cast a spell for you."],
    [12, ASI.split(":")[0], ASI],
    [14, "Improved Blessed Strikes", "Blessed Strikes gets stronger."],
    [16, ASI.split(":")[0], ASI],
    [17, "Subclass feature", "A new power from your Domain."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Greater Divine Intervention", "Divine Intervention can even cast Wish."]
  ],
  Druid: [
    [1, "Spellcasting", "Cast druid spells using Wisdom."],
    [1, "Druidic", "The secret language of druids."],
    [1, "Primal Order", "Choose to be a Magician (extra cantrip) or a Warden (armor and weapons)."],
    [2, "Wild Shape", "Turn into an animal for a while."],
    [2, "Wild Companion", "Summon a spirit animal friend."],
    [3, "Druid Subclass", "Choose your Circle (the SRD has the Circle of the Land)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Wild Resurgence", "Trade spell slots and Wild Shape uses."],
    [6, "Subclass feature", "A new power from your Circle."],
    [7, "Elemental Fury", "Extra elemental damage on hits, or stronger cantrips."],
    [8, ASI.split(":")[0], ASI],
    [10, "Subclass feature", "A new power from your Circle."],
    [12, ASI.split(":")[0], ASI],
    [14, "Subclass feature", "A new power from your Circle."],
    [15, "Improved Elemental Fury", "Elemental Fury gets stronger."],
    [16, ASI.split(":")[0], ASI],
    [18, "Beast Spells", "Cast spells while in Wild Shape."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Archdruid", "Wild Shape almost never runs out."]
  ],
  Fighter: [
    [1, "Fighting Style", "A fighting specialty, like a bonus with bows or with a shield."],
    [1, "Second Wind", "A Bonus Action: heal 1d10 + your fighter level."],
    [1, "Weapon Mastery", "Use the special mastery property of some weapons you know."],
    [2, "Action Surge", "Once per rest, take one extra action on your turn."],
    [2, "Tactical Mind", "Spend a Second Wind to add 1d10 to a failed check."],
    [3, "Fighter Subclass", "Choose your path (the SRD has the Champion)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Extra Attack", "Attack twice when you take the Attack action."],
    [5, "Tactical Shift", "Second Wind also lets you move without provoking attacks."],
    [6, ASI.split(":")[0], ASI],
    [7, "Subclass feature", "A new power from your subclass."],
    [8, ASI.split(":")[0], ASI],
    [9, "Indomitable", "Reroll a failed saving throw (with a bonus)."],
    [9, "Tactical Master", "Change a weapon's mastery property for an attack."],
    [10, "Subclass feature", "A new power from your subclass."],
    [11, "Two Extra Attacks", "Attack three times when you take the Attack action."],
    [12, ASI.split(":")[0], ASI],
    [13, "Indomitable (two uses)", "Use Indomitable twice per rest."],
    [13, "Studied Attacks", "After a miss, your next attack on that target has Advantage."],
    [14, ASI.split(":")[0], ASI],
    [15, "Subclass feature", "A new power from your subclass."],
    [16, ASI.split(":")[0], ASI],
    [17, "Action Surge (two uses)", "Use Action Surge twice per rest (once per turn)."],
    [17, "Indomitable (three uses)", "Use Indomitable three times per rest."],
    [18, "Subclass feature", "A new power from your subclass."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Three Extra Attacks", "Attack four times when you take the Attack action."]
  ],
  Monk: [
    [1, "Martial Arts", "Use Dexterity and a Martial Arts die with unarmed strikes and monk weapons."],
    [1, "Unarmored Defense", "Without armor, your AC is 10 + Dexterity + Wisdom."],
    [2, "Monk's Focus", "Focus Points for Flurry of Blows (two quick strikes), Patient Defense and Step of the Wind."],
    [2, "Unarmored Movement", "Your Speed goes up without armor."],
    [2, "Uncanny Metabolism", "When you roll Initiative, regain Focus and some HP once per rest."],
    [3, "Deflect Attacks", "Use your Reaction to reduce damage from an attack."],
    [3, "Monk Subclass", "Choose your Warrior path (the SRD has the Warrior of the Open Hand)."],
    [4, ASI.split(":")[0], ASI],
    [4, "Slow Fall", "Take less damage from falling."],
    [5, "Extra Attack", "Attack twice when you take the Attack action."],
    [5, "Stunning Strike", "Spend Focus to try to stun a creature you hit."],
    [6, "Empowered Strikes", "Your unarmed strikes can deal force damage."],
    [6, "Subclass feature", "A new power from your subclass."],
    [7, "Evasion", "Take no damage (or half) from many area effects."],
    [8, ASI.split(":")[0], ASI],
    [9, "Acrobatic Movement", "Run along walls and across water."],
    [10, "Heightened Focus", "Flurry of Blows and your other Focus moves get stronger."],
    [10, "Self-Restoration", "End being charmed, frightened or poisoned on yourself."],
    [11, "Subclass feature", "A new power from your subclass."],
    [12, ASI.split(":")[0], ASI],
    [13, "Deflect Energy", "Deflect Attacks works against any damage type."],
    [14, "Disciplined Survivor", "Proficiency in all saving throws, and spend Focus to reroll one."],
    [15, "Perfect Focus", "Regain Focus when you roll Initiative."],
    [16, ASI.split(":")[0], ASI],
    [17, "Subclass feature", "A new power from your subclass."],
    [18, "Superior Defense", "Spend Focus to resist all damage except force for a minute."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Body and Mind", "Dexterity and Wisdom go up by 4 (to a maximum of 25)."]
  ],
  Paladin: [
    [1, "Lay On Hands", "A Bonus Action: heal someone from a pool of 5 HP per paladin level."],
    [1, "Spellcasting", "Cast paladin spells using Charisma."],
    [1, "Weapon Mastery", "Use the special mastery property of some weapons you know."],
    [2, "Fighting Style", "A fighting specialty, like a bonus with a shield or two hands."],
    [2, "Paladin's Smite", "You always have Divine Smite ready: extra radiant damage right after a hit."],
    [3, "Channel Divinity", "Divine power a few times per rest."],
    [3, "Paladin Subclass", "Swear your Oath (the SRD has the Oath of Devotion)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Extra Attack", "Attack twice when you take the Attack action."],
    [5, "Faithful Steed", "Find Steed is always ready, and once per day costs no slot."],
    [6, "Aura of Protection", "You and nearby friends add your Charisma to saving throws."],
    [7, "Subclass feature", "A new power from your Oath."],
    [8, ASI.split(":")[0], ASI],
    [9, "Abjure Foes", "Use Channel Divinity to frighten enemies."],
    [10, "Aura of Courage", "You and nearby friends can't be frightened."],
    [11, "Radiant Strikes", "Your melee weapon hits deal an extra 1d8 radiant damage."],
    [12, ASI.split(":")[0], ASI],
    [14, "Restoring Touch", "Lay On Hands can also end conditions."],
    [15, "Subclass feature", "A new power from your Oath."],
    [16, ASI.split(":")[0], ASI],
    [18, "Aura Expansion", "Your auras reach farther."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Subclass feature", "The greatest power of your Oath."]
  ],
  Ranger: [
    [1, "Spellcasting", "Cast ranger spells using Wisdom."],
    [1, "Favored Enemy", "Hunter's Mark is always ready, and some casts cost no slot."],
    [1, "Weapon Mastery", "Use the special mastery property of some weapons you know."],
    [2, "Deft Explorer", "Expertise in a skill, and more languages."],
    [2, "Fighting Style", "A fighting specialty, like a bonus with bows."],
    [3, "Ranger Subclass", "Choose your path (the SRD has the Hunter)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Extra Attack", "Attack twice when you take the Attack action."],
    [6, "Roving", "Your Speed goes up, and you can climb and swim."],
    [7, "Subclass feature", "A new power from your subclass."],
    [8, ASI.split(":")[0], ASI],
    [9, "Expertise", "Double your proficiency bonus for two skills."],
    [10, "Tireless", "Gain temporary HP and shake off exhaustion."],
    [11, "Subclass feature", "A new power from your subclass."],
    [12, ASI.split(":")[0], ASI],
    [13, "Relentless Hunter", "Damage can't break your concentration on Hunter's Mark."],
    [14, "Nature's Veil", "Turn invisible for a moment."],
    [15, "Subclass feature", "A new power from your subclass."],
    [16, ASI.split(":")[0], ASI],
    [17, "Precise Hunter", "Advantage on attacks against your Hunter's Mark target."],
    [18, "Feral Senses", "Sense nearby creatures even when you can't see them."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Foe Slayer", "Hunter's Mark deals more damage."]
  ],
  Rogue: [
    [1, "Expertise", "Double your proficiency bonus for two skills."],
    [1, "Sneak Attack", "Once per turn, extra damage (1d6 per two rogue levels) with a finesse or ranged weapon when you have Advantage or a friend is next to the target."],
    [1, "Thieves' Cant", "The secret language of rogues."],
    [1, "Weapon Mastery", "Use the special mastery property of some weapons you know."],
    [2, "Cunning Action", "A Bonus Action to Dash, Disengage or Hide."],
    [3, "Rogue Subclass", "Choose your path (the SRD has the Thief)."],
    [3, "Steady Aim", "A Bonus Action: if you haven't moved, gain Advantage on your next attack."],
    [4, ASI.split(":")[0], ASI],
    [5, "Cunning Strike", "Trade Sneak Attack dice for tricks like tripping or poisoning."],
    [5, "Uncanny Dodge", "Use your Reaction to halve the damage of an attack."],
    [6, "Expertise", "Double proficiency for two more skills."],
    [7, "Evasion", "Take no damage (or half) from many area effects."],
    [7, "Reliable Talent", "Trained skill checks can't roll lower than 10."],
    [8, ASI.split(":")[0], ASI],
    [9, "Subclass feature", "A new power from your subclass."],
    [10, ASI.split(":")[0], ASI],
    [11, "Improved Cunning Strike", "Use two Cunning Strike tricks at once."],
    [12, ASI.split(":")[0], ASI],
    [13, "Subclass feature", "A new power from your subclass."],
    [14, "Devious Strikes", "New, stronger Cunning Strike tricks."],
    [15, "Slippery Mind", "Proficiency in Wisdom and Charisma saves."],
    [16, ASI.split(":")[0], ASI],
    [17, "Subclass feature", "A new power from your subclass."],
    [18, "Elusive", "Attacks can't have Advantage against you."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Stroke of Luck", "Turn a failed d20 roll into a 20, once per rest."]
  ],
  Sorcerer: [
    [1, "Spellcasting", "Cast sorcerer spells using Charisma."],
    [1, "Innate Sorcery", "A Bonus Action: for a minute your spells are harder to resist and hit more often."],
    [2, "Font of Magic", "Sorcery Points to make spell slots (and the other way round)."],
    [2, "Metamagic", "Change how your spells work, like casting them silently or farther."],
    [3, "Sorcerer Subclass", "Choose your origin (the SRD has Draconic Sorcery)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Sorcerous Restoration", "Regain some Sorcery Points on a Short Rest."],
    [6, "Subclass feature", "A new power from your origin."],
    [7, "Sorcery Incarnate", "Use Innate Sorcery more often, with two Metamagic options at once."],
    [8, ASI.split(":")[0], ASI],
    [10, "Metamagic", "Learn more Metamagic options."],
    [12, ASI.split(":")[0], ASI],
    [14, "Subclass feature", "A new power from your origin."],
    [16, ASI.split(":")[0], ASI],
    [17, "Metamagic", "Learn more Metamagic options."],
    [18, "Subclass feature", "A new power from your origin."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Arcane Apotheosis", "Use one Metamagic option per turn for free while Innate Sorcery is on."]
  ],
  Warlock: [
    [1, "Eldritch Invocations", "Special magical gifts from your patron."],
    [1, "Pact Magic", "A few spell slots that come back after a Short Rest."],
    [2, "Magical Cunning", "Regain some Pact Magic slots once per day."],
    [3, "Warlock Subclass", "Choose your Patron (the SRD has the Fiend)."],
    [4, ASI.split(":")[0], ASI],
    [6, "Subclass feature", "A new power from your Patron."],
    [8, ASI.split(":")[0], ASI],
    [9, "Contact Patron", "Speak with your patron to ask questions."],
    [10, "Subclass feature", "A new power from your Patron."],
    [11, "Mystic Arcanum (level 6 spell)", "Cast one level 6 spell once per day."],
    [12, ASI.split(":")[0], ASI],
    [13, "Mystic Arcanum (level 7 spell)", "Cast one level 7 spell once per day."],
    [14, "Subclass feature", "A new power from your Patron."],
    [15, "Mystic Arcanum (level 8 spell)", "Cast one level 8 spell once per day."],
    [16, ASI.split(":")[0], ASI],
    [17, "Mystic Arcanum (level 9 spell)", "Cast one level 9 spell once per day."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Eldritch Master", "Magical Cunning brings back all your Pact Magic slots."]
  ],
  Wizard: [
    [1, "Spellcasting", "Cast wizard spells from your spellbook, using Intelligence."],
    [1, "Ritual Adept", "Cast ritual spells straight from your spellbook."],
    [1, "Arcane Recovery", "Once a day, regain some spell slots on a Short Rest."],
    [2, "Scholar", "Expertise in one knowledge skill."],
    [3, "Wizard Subclass", "Choose your school (the SRD has the Evoker)."],
    [4, ASI.split(":")[0], ASI],
    [5, "Memorize Spell", "Swap one prepared spell after a Short Rest."],
    [6, "Subclass feature", "A new power from your school."],
    [8, ASI.split(":")[0], ASI],
    [10, "Subclass feature", "A new power from your school."],
    [12, ASI.split(":")[0], ASI],
    [14, "Subclass feature", "A new power from your school."],
    [16, ASI.split(":")[0], ASI],
    [18, "Spell Mastery", "Cast one level 1 and one level 2 spell at will."],
    [19, "Epic Boon", "A powerful feat for legendary heroes."],
    [20, "Signature Spells", "Two level 3 spells are always ready, and free once per rest."]
  ]
};

// The features a character has, class by class: [{ className, levels, features: [[level, name, text]] }]
function getClassFeatures(character) {
  return getClassLevels(character).map(function (entry) {
    const all = CLASS_FEATURES[entry.name] || [];
    return {
      className: entry.name,
      levels: entry.levels,
      features: all.filter(function (f) { return f[0] <= entry.levels; })
    };
  });
}

// ---------------------------------------------------------------------
// The numbers behind the features that matter in a fight. Worked out from the
// class levels (a two-class hero uses each class's own levels).
//   secondWind: { uses, heal }          (Fighter) Bonus Action, heal 1d10 + fighter level
//   actionSurge: uses                   (Fighter 2+) one extra action, once per turn
//   sneakDice: number of d6             (Rogue) once per turn
//   steadyAim: true                     (Rogue 3+) Bonus Action: Advantage on your next attack if you haven't moved
//   rage: { uses, bonus }               (Barbarian) Bonus Action; + damage on Strength weapon hits; half weapon damage
//   layOnHands: pool of HP              (Paladin) Bonus Action, heal from the pool
//   radiantStrikes: true                (Paladin 11+) +1d8 radiant on melee weapon hits
//   focus: points                       (Monk 2+) Flurry of Blows costs 1: two unarmed strikes as a Bonus Action
// ---------------------------------------------------------------------
function getCombatFeatures(character) {
  const f = {};
  for (const entry of getClassLevels(character)) {
    const n = entry.levels;
    if (entry.name === "Fighter") {
      f.secondWind = { uses: n >= 10 ? 4 : n >= 4 ? 3 : 2, heal: "1d10+" + n };
      if (n >= 2) f.actionSurge = n >= 17 ? 2 : 1;
    }
    if (entry.name === "Rogue") {
      f.sneakDice = Math.ceil(n / 2);
      if (n >= 3) f.steadyAim = true;
    }
    if (entry.name === "Barbarian") {
      f.rage = { uses: n >= 17 ? 6 : n >= 12 ? 5 : n >= 6 ? 4 : n >= 3 ? 3 : 2, bonus: n >= 16 ? 4 : n >= 9 ? 3 : 2 };
    }
    if (entry.name === "Paladin") {
      f.layOnHands = 5 * n;
      if (n >= 11) f.radiantStrikes = true;
    }
    if (entry.name === "Monk" && n >= 2) f.focus = n;
  }
  return f;
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

// =====================================================================
// WEAPONS AND ARMOR: the rules
// =====================================================================

// Characters made before armor could be chosen have no "armor" property: they keep
// the AC number typed on their sheet until the player picks their armor.
function usesArmorRules(character) {
  return typeof character.armor === "string";
}

// The armor the character is wearing (the ARMOR entry), or null for none.
function wornArmor(character) {
  return usesArmorRules(character) ? findByName(ARMOR, character.armor) || null : null;
}

// Which weapon and armor training a character has, from all their classes.
function getTraining(character) {
  const weapons = new Set(), armor = new Set();
  getClassLevels(character).forEach(function (entry, index) {
    const training = CLASS_TRAINING[entry.name];
    if (!training) return;
    const part = index === 0 ? training : training.multiclass;   // a second class gives less
    for (const w of part.weapons) weapons.add(w);
    for (const a of part.armor) armor.add(a);
  });
  return { weapons: weapons, armor: armor };
}

function isWeaponProficient(character, weapon) {
  const w = getTraining(character).weapons;
  if (weapon.category === "Simple" && w.has("simple")) return true;
  if (weapon.category === "Martial") {
    if (w.has("martial")) return true;
    if (w.has("martialLight") && weapon.props.includes("Light")) return true;
    if (w.has("martialFinesseOrLight") && (weapon.props.includes("Light") || weapon.props.includes("Finesse"))) return true;
  }
  // Bracers of Archery: proficiency with the Longbow and Shortbow.
  if (getActiveItemEffects(character).archery && (weapon.name === "Longbow" || weapon.name === "Shortbow")) return true;
  return false;
}

function isArmorTrained(character, armor) {
  return getTraining(character).armor.has(armor.category.toLowerCase());
}

function isShieldTrained(character) {
  return getTraining(character).armor.has("shield");
}

// Is the character a Monk (for Martial Arts)? A Monk weapon is a Simple Melee weapon,
// or a Martial Melee weapon with the Light property.
function monkLevel(character) {
  const entry = getClassLevels(character).find(function (e) { return e.name === "Monk"; });
  return entry ? entry.levels : 0;
}
function isMonkWeapon(weapon) {
  return weapon.kind === "Melee" && (weapon.category === "Simple" || weapon.props.includes("Light"));
}
// Martial Arts die by Monk level: d6, d8 at 5, d10 at 11, d12 at 17.
function martialArtsDie(level) {
  return level >= 17 ? 12 : level >= 11 ? 10 : level >= 5 ? 8 : 6;
}

// Armor Class from what the character is wearing (SRD "Armor"):
//   no armor: 10 + Dex (or Unarmored Defense)     light: base + Dex
//   medium: base + Dex, at most +2               heavy: base only
//   a Shield adds +2, but only with Shield training. A Monk's Unarmored Defense needs no Shield.
function getArmorAc(character) {
  const dex = getModifier(getAbilityScore(character, "dex"));
  const armor = wornArmor(character);
  const shield = character.shield === true;
  let ac;
  if (!armor) {
    const withDefense = getClassLevels(character).find(function (entry) {
      return entry.data && entry.data.unarmoredDefense && !(entry.name === "Monk" && shield);
    });
    ac = 10 + dex + (withDefense ? getModifier(getAbilityScore(character, withDefense.data.unarmoredDefense)) : 0);
  } else {
    const dexPart = armor.dexMax === null ? dex : Math.min(dex, armor.dexMax);
    ac = armor.base + dexPart;
  }
  if (shield && isShieldTrained(character)) ac = ac + SHIELD_BONUS;
  return ac;
}

// Problems with the character's armor, in plain words (empty list = all fine).
function getArmorWarnings(character) {
  const warnings = [];
  const armor = wornArmor(character);
  if (armor && !isArmorTrained(character, armor)) {
    warnings.push("Not trained with " + armor.category.toLowerCase() + " armor: Disadvantage on every d20 roll using Strength or Dexterity, and no spellcasting.");
  }
  if (character.shield && !isShieldTrained(character)) {
    warnings.push("Not trained with Shields: the Shield gives no AC.");
  }
  if (armor && armor.strength && character.abilities.str < armor.strength) {
    warnings.push(armor.name + " needs Strength " + armor.strength + ": Speed is 10 ft slower.");
  }
  if (armor && armor.stealth) warnings.push(armor.name + ": Disadvantage on Stealth checks (rolled for you).");
  return warnings;
}

// Everything about one weapon attack, worked out by the rules:
//   { name, toHit, damage: "1d8+3", twoHanded: "1d10+3" (Versatile), type, proficient, notes }
// Melee weapons use Strength, ranged use Dexterity, Finesse uses the better of the two.
// A Monk can use Dexterity with Monk weapons and roll the Martial Arts die instead.
function getWeaponAttack(character, weaponName) {
  const weapon = findByName(WEAPONS, weaponName);
  if (!weapon) return null;
  const str = getModifier(getAbilityScore(character, "str"));
  const dex = getModifier(getAbilityScore(character, "dex"));
  const monk = monkLevel(character) > 0 && isMonkWeapon(weapon);

  let mod = weapon.kind === "Ranged" ? dex : str;
  if (weapon.props.includes("Finesse") || monk) mod = Math.max(str, dex);

  const proficient = isWeaponProficient(character, weapon);
  const effects = getActiveItemEffects(character);
  const magic = effects.weaponBonus && character.magicWeapon === weapon.name ? effects.weaponBonus : 0;
  const archery = effects.archery && (weapon.name === "Longbow" || weapon.name === "Shortbow") ? effects.archery : 0;

  let die = weapon.damage;
  const notes = [];
  if (monk) {
    const maDie = martialArtsDie(monkLevel(character));
    const sides = Number((die.split("d")[1]) || 0);
    if (maDie > sides && !die.startsWith("2")) {
      die = "1d" + maDie;
      notes.push("Martial Arts die");
    }
  }
  const bonus = mod + magic + archery;
  const withBonus = function (dice) {
    return dice + (bonus ? formatBonus(bonus) : "");   // "1d8" + "+3" = "1d8+3"
  };

  if (!proficient) notes.push("not proficient: no proficiency bonus");
  if (magic) notes.push("✨ +" + magic + " magic weapon");
  if (archery) notes.push("+" + archery + " damage from Bracers of Archery");
  if (weapon.range) notes.push((weapon.props.includes("Thrown") ? "thrown " : "range ") + weapon.range + " ft");
  if (weapon.props.includes("Reach")) notes.push("reach 10 ft");

  return {
    name: weapon.name,
    weapon: weapon,
    toHit: mod + (proficient ? getProficiencyBonus(character.level) : 0) + magic,
    damage: withBonus(die),
    twoHanded: weapon.versatile ? withBonus(weapon.versatile) : null,
    type: weapon.type,
    proficient: proficient,
    ability: mod === str && !(weapon.kind === "Ranged") ? "str" : "dex",
    notes: notes
  };
}

// An Unarmed Strike: 1 + Strength modifier (a Monk uses the Martial Arts die and can use Dex).
function getUnarmedAttack(character) {
  const str = getModifier(getAbilityScore(character, "str"));
  const dex = getModifier(getAbilityScore(character, "dex"));
  const level = monkLevel(character);
  const mod = level ? Math.max(str, dex) : str;
  const damage = level ? "1d" + martialArtsDie(level) + (mod ? formatBonus(mod) : "") : String(Math.max(1 + str, 1));
  return {
    name: "Unarmed Strike", toHit: mod + getProficiencyBonus(character.level), damage: damage, twoHanded: null,
    type: "Bludgeoning", proficient: true, ability: mod === str ? "str" : "dex", notes: level ? ["Martial Arts"] : []
  };
}

// Every attack the character can make: their weapons, then an Unarmed Strike.
function getAttacks(character) {
  const list = [];
  for (const name of character.weapons || []) {
    const attack = getWeaponAttack(character, name);
    if (attack) list.push(attack);
  }
  list.push(getUnarmedAttack(character));
  return list;
}

// Average damage of dice like "1d8+3" (for picking someone's best attack).
function averageDamage(text) {
  let total = 0;
  for (const part of String(text).replace(/\s+/g, "").match(/[+-]?[^+-]+/g) || []) {
    const sign = part.startsWith("-") ? -1 : 1;
    const body = part.replace(/^[+-]/, "");
    if (body.includes("d")) {
      const [count, sides] = body.split("d").map(Number);
      total += sign * count * (sides + 1) / 2;
    } else {
      total += sign * Number(body);
    }
  }
  return total;
}

// =====================================================================
// SPELLCASTING: the rules (SRD 5.2.1 "Spells", class features, and "Multiclassing")
// =====================================================================
// A character's spells are saved on the character like this:
//   spellbook: { "Wizard": { cantrips: ["Fire Bolt"], prepared: ["Shield", "Fireball"] } }
//   slotsUsed: [0, 1, 0, ...]  (spell slots spent, for levels 1-9)      pactUsed: 0  (a Warlock's spent slots)
// A character with two spellcasting classes has a section for each. The spells data
// itself (SPELLS) is in spells.js, loaded only by the pages that show spells.

// The classes this character has that cast spells: [{ name, levels, table }].
function getSpellcastingClasses(character) {
  return getClassLevels(character).filter(function (entry) {
    return Boolean(SPELLCASTING[entry.name]);
  }).map(function (entry) {
    return { name: entry.name, levels: entry.levels, table: SPELLCASTING[entry.name] };
  });
}

function isSpellcaster(character) {
  return getSpellcastingClasses(character).length > 0;
}

function getSpellModifier(character, className) {
  return getModifier(getAbilityScore(character, SPELLCASTING[className].ability));
}

// Spell save DC = 8 + proficiency bonus + spellcasting ability modifier.
function getSpellSaveDc(character, className) {
  return 8 + getProficiencyBonus(character.level) + getSpellModifier(character, className);
}

// Spell attack bonus = proficiency bonus + spellcasting ability modifier.
function getSpellAttackBonus(character, className) {
  return getProficiencyBonus(character.level) + getSpellModifier(character, className);
}

// The slots a class could have on its own (full casters: their level; half casters: half, rounded up).
function classOwnSlots(entry) {
  const level = entry.table.kind === "half" ? Math.ceil(entry.levels / 2) : entry.levels;
  return MULTICLASS_SLOTS[Math.min(Math.max(level, 1), 20) - 1];
}

// How many cantrips the character knows, how many spells they prepare, and the highest spell
// level they may prepare, for ONE class (each class counts as if it were their only class).
function getSpellLimits(character, className) {
  const entry = getSpellcastingClasses(character).find(function (e) { return e.name === className; });
  if (!entry) return { cantrips: 0, prepared: 0, maxLevel: 0 };
  const index = Math.min(Math.max(entry.levels, 1), 20) - 1;
  let maxLevel = 0;
  if (entry.table.kind === "pact") {
    maxLevel = entry.table.pactLevel[index];
  } else {
    classOwnSlots(entry).forEach(function (count, i) {
      if (count > 0) maxLevel = i + 1;
    });
  }
  return { cantrips: entry.table.cantrips[index], prepared: entry.table.prepared[index], maxLevel: maxLevel };
}

// The spell slots that aren't a Warlock's: [level 1 total, ..., level 9 total].
// Add all levels in full-caster classes and half of each half-caster class (rounded up),
// then look that total up in the Multiclass Spellcaster table.
function getSpellSlotTotals(character) {
  let casterLevel = 0;
  for (const entry of getSpellcastingClasses(character)) {
    if (entry.table.kind === "full") casterLevel += entry.levels;
    if (entry.table.kind === "half") casterLevel += Math.ceil(entry.levels / 2);
  }
  if (casterLevel < 1) return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  return MULTICLASS_SLOTS[Math.min(casterLevel, 20) - 1].slice();
}

// A Warlock's Pact Magic slots: { count, level } (all the same level), or null.
function getPactSlots(character) {
  const entry = getSpellcastingClasses(character).find(function (e) { return e.table.kind === "pact"; });
  if (!entry) return null;
  const index = Math.min(Math.max(entry.levels, 1), 20) - 1;
  return { count: entry.table.pactSlots[index], level: entry.table.pactLevel[index] };
}

// Slots still unspent: [level 1 left, ..., level 9 left].
function getSpellSlotsLeft(character) {
  const used = character.slotsUsed || [];
  return getSpellSlotTotals(character).map(function (total, i) {
    return Math.max(total - (used[i] || 0), 0);
  });
}

function getPactSlotsLeft(character) {
  const pact = getPactSlots(character);
  return pact ? Math.max(pact.count - (character.pactUsed || 0), 0) : 0;
}

// The slots that could cast this spell (its level or higher, with some left):
// [{ kind: "slot" | "pact", level, left }]. Cantrips need no slot.
function getSlotChoices(character, spell) {
  const choices = [];
  getSpellSlotsLeft(character).forEach(function (left, i) {
    if (i + 1 >= spell.level && left > 0) choices.push({ kind: "slot", level: i + 1, left: left });
  });
  const pact = getPactSlots(character);
  const pactLeft = getPactSlotsLeft(character);
  if (pact && pact.level >= spell.level && pactLeft > 0) choices.push({ kind: "pact", level: pact.level, left: pactLeft });
  return choices;
}

// Spend one slot (kind "slot" at a level, or "pact"). Returns false if there isn't one.
function spendSpellSlot(character, kind, level) {
  if (kind === "pact") {
    if (getPactSlotsLeft(character) < 1) return false;
    character.pactUsed = (character.pactUsed || 0) + 1;
    return true;
  }
  if (getSpellSlotsLeft(character)[level - 1] < 1) return false;
  if (!Array.isArray(character.slotsUsed)) character.slotsUsed = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  character.slotsUsed[level - 1] = (character.slotsUsed[level - 1] || 0) + 1;
  return true;
}

// A Long Rest restores every slot; a Short Rest restores a Warlock's Pact Magic slots.
function takeLongRest(character) {
  character.slotsUsed = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  character.pactUsed = 0;
}
function takeShortRest(character) {
  character.pactUsed = 0;
}

// What the character has chosen for one class: { cantrips: [names], prepared: [names] }.
function getSpellbook(character, className) {
  const book = (character.spellbook && character.spellbook[className]) || {};
  return {
    cantrips: Array.isArray(book.cantrips) ? book.cantrips : [],
    prepared: Array.isArray(book.prepared) ? book.prepared : []
  };
}

function findSpell(name) {
  if (typeof SPELLS === "undefined") return null;
  return SPELLS.find(function (spell) { return spell.n === name; }) || null;
}

// Every spell a class can learn (level 0 = cantrips), sorted by level then name.
function getClassSpellList(className) {
  if (typeof SPELLS === "undefined") return [];
  return SPELLS.filter(function (spell) { return spell.classes.includes(className); });
}

// ---------- Dice that grow ----------
// "8d6" plus "1d6" three times is "11d6". Dice of the same size are combined.
function addDice(baseText, extraText, times) {
  const parse = function (text) {
    const terms = [];
    let bonus = 0;
    for (const part of String(text).replace(/\s+/g, "").match(/[+-]?[^+-]+/g) || []) {
      const sign = part.startsWith("-") ? -1 : 1;
      const body = part.replace(/^[+-]/, "");
      if (body.includes("d")) {
        const pieces = body.split("d");
        terms.push({ count: sign * Number(pieces[0]), sides: Number(pieces[1]) });
      } else {
        bonus += sign * Number(body);
      }
    }
    return { terms: terms, bonus: bonus };
  };
  const base = parse(baseText), extra = parse(extraText);
  for (const term of extra.terms) {
    const same = base.terms.find(function (t) { return t.sides === term.sides; });
    if (same) same.count += term.count * times;
    else base.terms.push({ count: term.count * times, sides: term.sides });
  }
  base.bonus += extra.bonus * times;
  let text = base.terms.map(function (t) { return t.count + "d" + t.sides; }).join("+");
  if (base.bonus) text += (base.bonus > 0 ? "+" : "") + base.bonus;
  return text;
}

// A cantrip is stronger at character levels 5, 11 and 17 (counting ALL your levels).
function cantripTier(character) {
  return 1 + (character.level >= 5 ? 1 : 0) + (character.level >= 11 ? 1 : 0) + (character.level >= 17 ? 1 : 0);
}

// The damage dice for a spell cast at a slot level ({ dice, beams }), or null if it has none.
// Cantrips grow with your level; leveled spells grow with the slot ("Using a Higher-Level Spell Slot").
function getSpellDamage(spell, character, slotLevel) {
  if (!spell.dmg) return null;
  if (spell.level === 0) {
    const tier = cantripTier(character);
    if (spell.tiers === "beams") return { dice: spell.dmg, beams: tier };
    if (spell.tiers) return { dice: addDice(spell.dmg, spell.tiers, tier - 1), beams: 1 };
    return { dice: spell.dmg, beams: 1 };
  }
  const slot = Math.max(slotLevel || spell.level, spell.level);
  let dice = spell.dmg;
  if (spell.up && slot > spell.up[1]) dice = addDice(dice, spell.up[0], slot - spell.up[1]);
  return { dice: dice, beams: 1 };
}

// The healing dice, with the spellcasting modifier added when the spell says so.
function getSpellHealing(spell, character, className, slotLevel) {
  if (!spell.heal) return null;
  const slot = Math.max(slotLevel || spell.level, spell.level);
  let dice = spell.heal;
  if (spell.up && !spell.dmg && slot > spell.up[1]) dice = addDice(dice, spell.up[0], slot - spell.up[1]);
  if (spell.healMod) {
    const mod = getSpellModifier(character, className);
    if (mod) dice += (mod > 0 ? "+" : "") + mod;
  }
  return dice;
}

// Good first spells for each class, in the order to pick them. "Fill with starter spells"
// uses these. (They're suggestions: easy to use and useful at a table.)
const STARTER_SPELLS = {
  Bard:     { cantrips: ["Vicious Mockery", "Minor Illusion", "Mage Hand", "Prestidigitation"], spells: ["Healing Word", "Faerie Fire", "Dissonant Whispers", "Charm Person", "Thunderwave", "Cure Wounds", "Heroism", "Sleep", "Hold Person", "Invisibility", "Suggestion", "Hypnotic Pattern"] },
  Cleric:   { cantrips: ["Sacred Flame", "Guidance", "Light", "Thaumaturgy"], spells: ["Cure Wounds", "Bless", "Guiding Bolt", "Shield of Faith", "Healing Word", "Command", "Spiritual Weapon", "Aid", "Hold Person", "Spirit Guardians", "Revivify", "Dispel Magic"] },
  Druid:    { cantrips: ["Produce Flame", "Guidance", "Druidcraft", "Shillelagh"], spells: ["Cure Wounds", "Entangle", "Faerie Fire", "Healing Word", "Thunderwave", "Goodberry", "Moonbeam", "Flaming Sphere", "Call Lightning", "Dispel Magic", "Plant Growth", "Conjure Animals"] },
  Paladin:  { cantrips: [], spells: ["Divine Smite", "Bless", "Cure Wounds", "Shield of Faith", "Command", "Heroism", "Aid", "Find Steed", "Revivify", "Dispel Magic", "Banishment", "Death Ward"] },
  Ranger:   { cantrips: [], spells: ["Hunter's Mark", "Cure Wounds", "Goodberry", "Fog Cloud", "Ensnaring Strike", "Longstrider", "Pass without Trace", "Spike Growth", "Conjure Animals", "Plant Growth", "Revivify", "Dispel Magic"] },
  Sorcerer: { cantrips: ["Fire Bolt", "Mage Hand", "Prestidigitation", "Ray of Frost", "Minor Illusion", "Light"], spells: ["Magic Missile", "Shield", "Sleep", "Burning Hands", "Mage Armor", "Chromatic Orb", "Misty Step", "Scorching Ray", "Fireball", "Counterspell", "Haste", "Fly"] },
  Warlock:  { cantrips: ["Eldritch Blast", "Prestidigitation", "Minor Illusion", "Mage Hand"], spells: ["Hex", "Charm Person", "Hellish Rebuke", "Misty Step", "Hold Person", "Counterspell", "Fly", "Hypnotic Pattern", "Banishment", "Dimension Door", "Dispel Magic", "Fear"] },
  Wizard:   { cantrips: ["Fire Bolt", "Mage Hand", "Prestidigitation", "Light", "Ray of Frost", "Minor Illusion"], spells: ["Magic Missile", "Shield", "Sleep", "Mage Armor", "Burning Hands", "Misty Step", "Scorching Ray", "Fireball", "Counterspell", "Detect Magic", "Find Familiar", "Thunderwave", "Invisibility", "Fly", "Haste", "Dispel Magic"] }
};

// =====================================================================
// WORKING OUT NORMAL / ADVANTAGE / DISADVANTAGE FOR A d20 ROLL
// =====================================================================
// Combines what the player picked with automatic effects:
//   - a magic item can give Advantage (Cloak of Elvenkind on Stealth)
//   - armor can give Disadvantage on Stealth
//   - armor without training gives Disadvantage on Strength or Dexterity rolls
// SRD rule: if a roll has both Advantage and Disadvantage, they cancel out.
// test: { skill: "Stealth" (optional), ability: "dex" (optional) }. Returns { mode, note }.
function resolveRollMode(character, chosen, test) {
  const ups = [], downs = [];
  if (chosen === "advantage") ups.push("your choice");
  if (chosen === "disadvantage") downs.push("your choice");
  if (test.skill && itemGivesAdvantage(character, test.skill)) ups.push(character.specialItem.name);
  const armor = wornArmor(character);
  if (armor && armor.stealth && test.skill === "Stealth") downs.push(armor.name);
  if (armor && !isArmorTrained(character, armor) && (test.ability === "str" || test.ability === "dex")) {
    downs.push("armor without training");
  }

  const automatic = ups.concat(downs).filter(function (x) { return x !== "your choice"; });
  if (ups.length && downs.length) {
    return { mode: "normal", note: automatic.length ? " (Advantage and Disadvantage cancel: " + automatic.join(", ") + ")" : "" };
  }
  if (ups.length) return { mode: "advantage", note: automatic.length ? " from " + automatic.join(", ") : "" };
  if (downs.length) return { mode: "disadvantage", note: automatic.length ? " from " + automatic.join(", ") : "" };
  return { mode: "normal", note: "" };
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

// Passive Perception: 10 + your Perception bonus. The AM uses it to see
// whether you notice hidden things without rolling.
function getPassivePerception(character) {
  return 10 + getSkillBonus(character, findByName(SKILLS, "Perception"));
}

// =====================================================================
// SAVED CHARACTERS (shared by the character page and the AM page)
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
