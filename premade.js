// =====================================================================
// PRE-MADE HEROES AND BATTLES (the Create page, the Battle Simulator, the GM Screen)
// Needs rules.js (and spells.js for heroes with spells, monsters.js for battles).
// The heroes and battles are original to Dragon Table; the rules, monsters,
// weapons and spells come from the SRD 5.2.1.
// =====================================================================

// One ready-to-play hero for every class. buildPremadeHero() turns one into a real
// character at the level you pick: ability scores placed for the class (Standard Array
// + background bonus), trained skills, armor, weapons and starter spells, all by the rules.
const PREMADE_HEROES = [
  { key: "brakka", name: "Brakka Stonefist", className: "Barbarian", species: "Goliath", background: "Soldier",
    armor: "none", shield: false, weapons: ["Greataxe", "Handaxe"], item: "Gauntlets of Ogre Power", look: "Huge iron gloves dented from a hundred arm-wrestling matches.",
    about: "A mountain warrior who shouts at thunderstorms." },
  { key: "lyra", name: "Lyra Songwhistle", className: "Bard", species: "Halfling", background: "Criminal",
    armor: "Leather Armor", shield: false, weapons: ["Rapier", "Dagger"], item: "Hat of Disguise", look: "A floppy green hat with a feather that changes color with her mood.",
    about: "A traveling singer who knows everybody's secrets." },
  { key: "tam", name: "Brother Tam", className: "Cleric", species: "Dwarf", background: "Acolyte",
    armor: "Scale Mail", shield: true, weapons: ["Mace"], item: "Periapt of Health", look: "A small silver charm shaped like a loaf of bread.",
    about: "A cheerful healer who hums hymns in battle." },
  { key: "willow", name: "Willow Fernsong", className: "Druid", species: "Elf", background: "Sage",
    armor: "Leather Armor", shield: true, weapons: ["Quarterstaff", "Sickle"], item: "Staff of the Python", look: "A twisted vine staff with a snake's head carved at the top.",
    about: "Talks to trees, and the trees talk back." },
  { key: "rowan", name: "Sir Rowan", className: "Fighter", species: "Human", background: "Soldier",
    armor: "Chain Mail", shield: true, weapons: ["Longsword", "Javelin"], item: "Shield, +1", look: "A blue shield with a silver tree, polished every single morning.",
    about: "A loyal knight with a terrible sense of direction." },
  { key: "kai", name: "Kai Swiftwind", className: "Monk", species: "Human", background: "Acolyte",
    armor: "none", shield: false, weapons: ["Spear", "Dagger"], item: "Boots of Striding and Springing", look: "Light grey boots with tiny wings stitched on the heels.",
    about: "Runs everywhere, even when there's no hurry." },
  { key: "elsa", name: "Dame Elsa Brightscale", className: "Paladin", species: "Dragonborn", background: "Acolyte",
    armor: "Chain Mail", shield: true, weapons: ["Longsword", "Javelin"], item: "Cloak of Protection", look: "A white cloak with a golden scale pattern along the hem.",
    about: "Swore an oath to protect the weak, and takes it very seriously." },
  { key: "fen", name: "Fen Hollowbrook", className: "Ranger", species: "Elf", background: "Soldier",
    armor: "Studded Leather Armor", shield: false, weapons: ["Longbow", "Shortsword"], item: "Bracers of Archery", look: "Leather bracers with leaves pressed into them.",
    about: "A quiet tracker who never misses a footprint." },
  { key: "nim", name: "Nim Quickfingers", className: "Rogue", species: "Halfling", background: "Criminal",
    armor: "Leather Armor", shield: false, weapons: ["Rapier", "Shortbow", "Dagger"], item: "Cloak of Elvenkind", look: "A patched grey cloak that seems to blur at the edges.",
    about: "Small, quick, and always \"just borrowing\" things." },
  { key: "ember", name: "Ember", className: "Sorcerer", species: "Tiefling", background: "Sage",
    armor: "none", shield: false, weapons: ["Dagger"], item: "Pearl of Power", look: "A pearl that glows like a coal when she's angry.",
    about: "Born with fire in her blood, and a temper to match." },
  { key: "vex", name: "Vex Ashgrove", className: "Warlock", species: "Tiefling", background: "Criminal",
    armor: "Leather Armor", shield: false, weapons: ["Dagger"], item: "Eyes of Charming", look: "Purple glass lenses that make his eyes look like a cat's.",
    about: "Made a deal with something strange, and doesn't talk about it." },
  { key: "mira", name: "Mira Inkwell", className: "Wizard", species: "Elf", background: "Sage",
    armor: "none", shield: false, weapons: ["Dagger", "Quarterstaff"], item: "Headband of Intellect", look: "A copper headband engraved with tiny runes and one ink stain.",
    about: "Carries more books than clothes." }
];

// Make a real character from a pre-made hero. id: the new character's id.
function buildPremadeHero(def, level, id) {
  const charClass = findByName(CLASSES, def.className);
  const background = findByName(BACKGROUNDS, def.background);
  const order = getAbilityOrder(charClass, null);
  const placed = placeScores(STANDARD_ARRAY, order);
  const abilities = {};
  for (const key in placed) abilities[key] = STANDARD_ARRAY[placed[key]];
  const bonus = pickBackgroundBonus(background.abilities, order);
  abilities[bonus.plusTwo] = Math.min(abilities[bonus.plusTwo] + 2, 20);
  abilities[bonus.plusOne] = Math.min(abilities[bonus.plusOne] + 1, 20);

  // Skills: the background's, then the first ones from the class list that fit the class
  const skills = background.skills.slice();
  for (const skill of charClass.skillOptions) {
    if (skills.length >= background.skills.length + charClass.skillCount) break;
    if (!skills.includes(skill)) skills.push(skill);
  }

  const c = {
    id: id, name: def.name, playerName: "", className: def.className, species: def.species, background: def.background,
    level: level, abilities: abilities, proficientSkills: skills, inventory: def.about,
    armor: def.armor, shield: def.shield, weapons: def.weapons.slice()
  };
  // Spells: the class's starter spells, as many as the rules allow at this level
  for (const entry of getSpellcastingClasses(c)) {
    const limits = getSpellLimits(c, entry.name);
    const starters = STARTER_SPELLS[entry.name] || { cantrips: [], spells: [] };
    const book = { cantrips: [], prepared: [] };
    for (const name of starters.cantrips) {
      const spell = typeof findSpell === "function" ? findSpell(name) : null;
      if (spell && spell.classes.includes(entry.name) && book.cantrips.length < limits.cantrips) book.cantrips.push(name);
    }
    for (const name of starters.spells) {
      const spell = typeof findSpell === "function" ? findSpell(name) : null;
      if (spell && spell.classes.includes(entry.name) && spell.level <= limits.maxLevel && book.prepared.length < limits.prepared) book.prepared.push(name);
    }
    if (!c.spellbook) c.spellbook = {};
    c.spellbook[entry.name] = book;
  }
  // Their special item, from the rules (its bonuses count on the sheet)
  if (def.item) {
    const item = makeSrdItem(def.item, def.look || "");
    if (item) c.specialItem = item;
  }
  c.ac = getAc(c);
  c.hp = getMaxHp(c);
  return c;
}

// Copy a pre-made hero into the saved characters. Returns the new character.
function addPremadeHero(def, level) {
  const list = loadCharacters();
  let highest = 0;
  for (const c of list) if (c.id > highest) highest = c.id;
  const hero = buildPremadeHero(def, level, highest + 1);
  // A different name if you already have one with that name ("Sir Rowan 2")
  let name = hero.name, n = 1;
  while (list.some(function (c) { return c.name === name; })) { n++; name = hero.name + " " + n; }
  hero.name = name;
  list.push(hero);
  saveCharacters(list);
  return hero;
}

// ---------------------------------------------------------------------
// PRE-MADE BATTLES, sized with the rules' XP budget for a party of 4 at that level
// (level: the party's level; the Battle Simulator shows the exact difficulty).
// ---------------------------------------------------------------------
const PREMADE_BATTLES = [
  { key: "goblin-ambush", name: "👺 Goblin Ambush", level: 1, about: "Four goblins jump out of the bushes on a forest road.",
    monsters: [{ n: "Goblin Warrior", count: 4 }] },
  { key: "wolf-pack", name: "🐺 Wolf Pack", level: 1, about: "Hungry wolves circle the campfire at night.",
    monsters: [{ n: "Wolf", count: 4 }] },
  { key: "skeleton-crypt", name: "💀 The Rattling Crypt", level: 2, about: "Skeletons climb out of their stone coffins.",
    monsters: [{ n: "Skeleton", count: 6 }, { n: "Zombie", count: 2 }] },
  { key: "bandit-toll", name: "💰 Bandit Toll Bridge", level: 2, about: "Bandits block a bridge and demand gold.",
    monsters: [{ n: "Tough", count: 3 }, { n: "Scout", count: 1 }] },
  { key: "ogre-bridge", name: "🧌 The Ogre's Bridge", level: 3, about: "An ogre and its goblin helpers guard a river crossing.",
    monsters: [{ n: "Ogre", count: 1 }, { n: "Goblin Warrior", count: 2 }] },
  { key: "owlbear-den", name: "🦉 Owlbear Den", level: 4, about: "The heroes stumble into an owlbear's nest, with wolves nearby.",
    monsters: [{ n: "Owlbear", count: 1 }, { n: "Wolf", count: 2 }] },
  { key: "hobgoblin-patrol", name: "⚔️ Hobgoblin Patrol", level: 5, about: "A disciplined patrol led by a hobgoblin captain.",
    monsters: [{ n: "Hobgoblin Captain", count: 1 }, { n: "Hobgoblin Warrior", count: 4 }, { n: "Bugbear Warrior", count: 2 }] },
  { key: "troll-attack", name: "🌲 Troll Attack", level: 7, about: "A troll and two ogres raid a village at dawn.",
    monsters: [{ n: "Troll", count: 1 }, { n: "Ogre", count: 2 }] }
];

// Battles the GM saved in the Battle Simulator (localStorage "savedBattles").
function loadSavedBattles() {
  try {
    const list = JSON.parse(localStorage.getItem("savedBattles") || "[]");
    return Array.isArray(list) ? list.filter(function (b) { return b && b.name && Array.isArray(b.monsters); }) : [];
  } catch (error) {
    return [];
  }
}

function storeSavedBattles(list) {
  try {
    localStorage.setItem("savedBattles", JSON.stringify(list));
    return true;
  } catch (error) {
    return false;
  }
}

// Total XP of a battle's monsters (MONSTERS from monsters.js).
function battleXp(battle) {
  return battle.monsters.reduce(function (sum, entry) {
    const m = MONSTERS.find(function (x) { return x.n === entry.n; });
    return sum + (m ? m.xp * entry.count : 0);
  }, 0);
}
