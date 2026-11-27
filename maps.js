// =====================================================================
// PRE-MADE MAPS AND DUNGEONS for the Battle Map (map.html)
// =====================================================================
// Each map is DRAWN with letters, one string per row (20 letters wide).
// It's a little picture: read it like a treasure map.
//
//   .  open floor or ground        #  wall (blocks movement)
//   T  big tree or boulder         :  rubble (difficult terrain)
//   ~  water (difficult terrain)   S  where the heroes start
//   any other letter = a monster, listed in that map's "monsters"
//
// "fog: true" covers the map in fog of war except near the start, so the
// players discover the dungeon as they explore.
// The monsters are from the SRD 5.2.1 (monsters.js). The maps themselves are
// original to Dragon Table.
//
// Want to make your own? Copy one, change the letters, and give it a new name.
// =====================================================================
const PREMADE_MAPS = [
  {
    key: "goblin-cave",
    name: "🕳️ Goblin Cave",
    about: "A twisting cave with a goblin camp at the back. Dungeon: starts in fog.",
    level: "Level 1–2, 3–5 heroes",
    ground: "stone",
    fog: true,
    monsters: { g: "Goblin Warrior", m: "Goblin Minion", B: "Goblin Boss" },
    rows: [
      "####################",
      "#S....#####.....####",
      "#.....##...:....g.##",
      "#..:.......#.......#",
      "##....####.##..m...#",
      "###..##..#..#......#",
      "##...#...:..###..###",
      "#....#.g.....##...##",
      "#..~~#.......:#...B#",
      "#..~~##..:.......g.#",
      "#...~###.....###...#",
      "##..m....#######..##",
      "####...######....###",
      "####################"
    ]
  },
  {
    key: "crypt",
    name: "⚰️ The Old Crypt",
    about: "Four burial rooms joined by narrow halls. The dead don't rest here. Dungeon: starts in fog.",
    level: "Level 1–2, 3–5 heroes",
    ground: "stone",
    fog: true,
    monsters: { s: "Skeleton", z: "Zombie" },
    rows: [
      "####################",
      "#.....#######.....s#",
      "#..S..#######..:...#",
      "#.............:....#",
      "#.....#######.....s#",
      "###.###########.####",
      "###.###########.####",
      "###.###########.####",
      "#.....#######......#",
      "#..z..#######..:...#",
      "#.................z#",
      "#..:..#######......#",
      "#....z#######..s...#",
      "####################"
    ]
  },
  {
    key: "forest-ambush",
    name: "🌲 Forest Ambush",
    about: "A road through thick woods, with a stream. Wolves wait in the trees.",
    level: "Level 1–2, 3–5 heroes",
    ground: "grass",
    fog: false,
    monsters: { w: "Wolf" },
    rows: [
      "TT..T....~~...T..TTT",
      "T.....T..~~.......TT",
      "..T......~~..T..w..T",
      "S.........~~.......T",
      "S.........~~........",
      "S..T......~~..w.....",
      "..........~~........",
      ".T...T.....~~....T..",
      "...........~~.......",
      "TT....T....~~..w..T.",
      "T..........~~.......",
      "TT..T...T...~~...TTT",
      "TTT.........~~..TTTT",
      "TTTT..TT....~~TTTTTT"
    ]
  },
  {
    key: "tavern-brawl",
    name: "🍺 Tavern Brawl",
    about: "A crowded inn: overturned tables (rubble) everywhere and a bar along the wall.",
    level: "Level 1–3, 3–5 heroes",
    ground: "wood",
    fog: false,
    monsters: { t: "Tough", B: "Tough Boss" },
    rows: [
      "####################",
      "#..................#",
      "#.####......:...t..#",
      "#.#....:.......:...#",
      "#.#..B.....:.......#",
      "#.####...t.....:...#",
      "#......:......t....#",
      "#...:......:.......#",
      "#........:.....:...#",
      "#..:..........:....#",
      "#.....:...:........#",
      "#...........S......#",
      "#........S...S.....#",
      "#########...########"
    ]
  },
  {
    key: "river-crossing",
    name: "🌉 River Crossing",
    about: "A wide river with one narrow bridge. Something lurks in the water.",
    level: "Level 2–3, 3–5 heroes",
    ground: "grass",
    fog: false,
    monsters: { f: "Giant Frog", c: "Crocodile" },
    rows: [
      "..T.......T.....T...",
      "......T......T......",
      "..S.....T.........T.",
      "..S...........T.....",
      "~~~~~~~~~..~~~~~~~~~",
      "~~f~~~~~~..~~~~~c~~~",
      "~~~~~~~~~..~~~~~~~~~",
      "~~~~~c~~~..~~~~f~~~~",
      "~~~~~~~~~..~~~~~~~~~",
      "......T.............",
      "..T.........T....T..",
      ".....T..............",
      "T.........T.....T...",
      "...T..............T."
    ]
  }
];

// =====================================================================
// SOLO DUNGEONS: made for ONE hero (Solo Adventures page). minLevel / maxLevel: the
// hero levels each one is made for (levels 1–2 first, then stronger ones up to level 10).
// Each fight is ONE monster, at or under the rules' "Low" XP budget for one hero of
// that level (level 1: 50 XP; level 5: 500 XP; level 9: 1,300 XP; a boss can be a bit more). The rooms are apart so you meet one fight at a time, and
// "+" is a Potion of Healing (2d4 + 2 HP), "*" a Potion of Greater Healing (4d4 + 4) and
// "%" a Potion of Superior Healing (8d4 + 8). Drinking one is a Bonus Action.
// Between fights you can take a Short Rest and spend Hit Dice to heal.
// =====================================================================
const SOLO_MAPS = [
  {
    key: "rat-cellar", name: "🐀 The Rat Cellar", ground: "stone", fog: true, minLevel: 1, maxLevel: 1,
    about: "Rats in the inn's cellar: lots of small fights, and a whole swarm behind the barrels.",
    level: "Level 1, one hero",
    monsters: { r: "Giant Rat", R: "Swarm of Rats" },
    rows: [
      "################",
      "#S..#.....r.#..#",
      "#...#.......#..#",
      "#..+..........R#",
      "#...#.......#..#",
      "##.##########.##",
      "#.....#........#",
      "#.r...#..~~.+..#",
      "#.....+..~~..r.#",
      "################"
    ]
  },
  {
    key: "quiet-tomb", name: "🦴 The Quiet Tomb", ground: "stone", fog: true, minLevel: 1, maxLevel: 2,
    about: "A small family tomb where the dead have started to wander. Zombies are tough, but easy to hit.",
    level: "Level 1–2, one hero",
    monsters: { z: "Zombie", r: "Giant Rat" },
    rows: [
      "################",
      "#S.....#.....z.#",
      "#......#.......#",
      "#...+..........#",
      "#......#.......#",
      "####.#######.###",
      "#.r....#.......#",
      "#......+....z..#",
      "#......#.......#",
      "################"
    ]
  },
  {
    key: "wolf-den", name: "🐺 The Wolf Den", ground: "grass", fog: false, minLevel: 1, maxLevel: 2,
    about: "A wooded valley where wild animals have been scaring the sheep.",
    level: "Level 1–2, one hero",
    monsters: { w: "Wolf", b: "Giant Badger", m: "Mastiff" },
    rows: [
      "TTTTTTTTTTTTTTTTTT",
      "TS.....TTT.......T",
      "T......TTT...m...T",
      "T..+...TTT.......T",
      "T................T",
      "TTTTT..TTTTTTT..TT",
      "TTTTT..TTTTTTT..TT",
      "T......TT........T",
      "T..w...TT.....b..T",
      "T.........+......T",
      "T......TT........T",
      "TTTTTTTTTTTTTTTTTT"
    ]
  },
  {
    key: "goblin-lookout", name: "👺 The Goblin Lookout", ground: "stone", fog: true, minLevel: 1, maxLevel: 2,
    about: "A few goblins guard an old watch post. Their leader has a bow.",
    level: "Level 1–2, one hero",
    monsters: { g: "Goblin Minion", G: "Goblin Warrior" },
    rows: [
      "################",
      "#S...#.....g...#",
      "#....#.........#",
      "#..+.....:.....#",
      "#....#.........#",
      "###.######.#####",
      "#....#.....G...#",
      "#.g..+.........#",
      "#....#....:....#",
      "################"
    ]
  },
  {
    key: "cultist-hideout", name: "🕯️ The Cultist Hideout", ground: "stone", fog: true, minLevel: 2, maxLevel: 2,
    about: "A hooded cultist, a giant centipede, and a priest who throws radiant fire.",
    level: "Level 2, one hero",
    monsters: { c: "Cultist", C: "Giant Centipede", p: "Priest Acolyte" },
    rows: [
      "################",
      "#S..#......c...#",
      "#...#..........#",
      "#.+.....:......#",
      "#...#..........#",
      "##.#####.#######",
      "#.....#........#",
      "#..C..+...p....#",
      "#.....#........#",
      "################"
    ]
  },
  {
    key: "spider-woods", name: "🕸️ The Spider Woods", ground: "grass", fog: true, minLevel: 3, maxLevel: 4,
    about: "A dark wood at night, where a giant wasp, a worg and a huge spider hunt.",
    level: "Level 3–4, one hero",
    monsters: { a: "Giant Wasp", W: "Worg", P: "Giant Spider" },
    rows: [
      "TTTTTTTTTTTTTTTTTTTT",
      "TS.....TTTT........T",
      "T......TTTT...a....T",
      "T..+...TTTT........T",
      "T..................T",
      "T..................T",
      "TTTTTT..TTTTTTT..TTT",
      "TTTTTT..TTTTTTT..TTT",
      "T...........TT.....T",
      "T..W........TT...P.T",
      "T......+...........T",
      "T..............TT..T",
      "TTTTTTTTTTTTTTTTTTTT"
    ]
  },
  {
    key: "bandit-fort", name: "🏚️ The Bandit Fort", ground: "stone", fog: true, minLevel: 4, maxLevel: 5,
    about: "Bandits hold an old fort: a bruiser, a scout with a longbow, and their bugbear boss.",
    level: "Level 4–5, one hero",
    monsters: { t: "Tough", s: "Scout", B: "Bugbear Warrior" },
    rows: [
      "####################",
      "#S...#.......#.....#",
      "#....#...t...#..s..#",
      "#.+.........:#.....#",
      "#....#.......#.....#",
      "###.#####..#####.###",
      "#.......#.........##",
      "#...+...#....B....##",
      "#...............:.##",
      "#.......#.........##",
      "#.......#.........##",
      "####################"
    ]
  },
  {
    key: "ghoul-crypt", name: "💀 The Ghoul Crypt", ground: "stone", fog: true, minLevel: 5, maxLevel: 6,
    about: "Hungry undead: a ghoul, a cold specter, and a ghast that smells of the grave.",
    level: "Level 5–6, one hero",
    monsters: { g: "Ghoul", p: "Specter", G: "Ghast" },
    rows: [
      "####################",
      "#S.....#......g....#",
      "#......#...........#",
      "#..*.........:.....#",
      "#......#...........#",
      "####.#######.#######",
      "#.p....#..........##",
      "#......*.....G....##",
      "#......#..........##",
      "####################"
    ]
  },
  {
    key: "owlbear-hollow", name: "🦉 The Owlbear Hollow", ground: "grass", fog: true, minLevel: 6, maxLevel: 7,
    about: "A wild valley at dusk, with a dire wolf, a giant boar, and an owlbear's nest.",
    level: "Level 6–7, one hero",
    monsters: { d: "Dire Wolf", b: "Giant Boar", O: "Owlbear" },
    rows: [
      "TTTTTTTTTTTTTTTTTTTTTT",
      "TS......TTTT.........T",
      "T.......TTTT....d....T",
      "T..*....TTTT.........T",
      "T....................T",
      "T....................T",
      "TTTTTT...TTTTTTTT...TT",
      "TTTTTT...TTTTTTTT...TT",
      "T..........TTT.......T",
      "T..b.......TTT.......T",
      "T..........*.....O...T",
      "T....................T",
      "TTTTTTTTTTTTTTTTTTTTTT"
    ]
  },
  {
    key: "hellhound-forge", name: "🔥 The Hell Hound Forge", ground: "stone", fog: true, minLevel: 7, maxLevel: 8,
    about: "An old forge: a stone gargoyle, a minotaur in the great hall, and a fire-breathing hound by the furnace.",
    level: "Level 7–8, one hero",
    monsters: { G: "Gargoyle", h: "Hell Hound", M: "Minotaur of Baphomet" },
    rows: [
      "######################",
      "#S....#.......#......#",
      "#.....#...G...#...h..#",
      "#..*..........#......#",
      "#.............#......#",
      "#######..######..#####",
      "#....................#",
      "#..M.................#",
      "#.............*......#",
      "#....................#",
      "######################"
    ]
  },
  {
    key: "troll-river", name: "🌊 The Giant's River", ground: "grass", fog: true, minLevel: 9, maxLevel: 10,
    about: "Cross the river by moonlight, past an ogre and a winter wolf, to the two-headed ettin who rules the far bank.",
    level: "Level 9–10, one hero",
    monsters: { o: "Ogre", w: "Winter Wolf", R: "Ettin" },
    rows: [
      "TTTTTTTTTTTTTTTTTTTTTT",
      "TS.......~~~~.......TT",
      "T........~~~~...o...TT",
      "T..%.....~~~~.......TT",
      "T........~~~~TTTTTTTTT",
      "T...TT..............TT",
      "T...TT..............TT",
      "T........~~~~TTTTTTTTT",
      "T..w.....~~~~....R..TT",
      "T........~~~~.......TT",
      "T....%...~~~~.......TT",
      "TTTTTTTTTTTTTTTTTTTTTT"
    ]
  }
];

// Turn a drawn map into its parts (used by the Solo Adventures page):
// { cols, rows, ground, terrain: { "x,y": "wall" ... }, start: { x, y }, monsters: [{ name, x, y }], potions: [{ x, y }] }
const MAP_LETTER_TERRAIN = { "#": "wall", "T": "tree", ":": "rubble", "~": "water" };
const POTION_LETTERS = { "+": "healing", "*": "greater", "%": "superior" };
function parsePremade(preset) {
  const result = { cols: preset.rows[0].length, rows: preset.rows.length, ground: preset.ground,
                   terrain: {}, start: null, monsters: [], potions: [] };
  preset.rows.forEach(function (row, y) {
    for (let x = 0; x < row.length; x++) {
      const letter = row[x];
      if (MAP_LETTER_TERRAIN[letter]) result.terrain[x + "," + y] = MAP_LETTER_TERRAIN[letter];
      else if (letter === "S") { if (!result.start) result.start = { x: x, y: y }; }
      else if (POTION_LETTERS[letter]) result.potions.push({ x: x, y: y, kind: POTION_LETTERS[letter] });
      else if (preset.monsters[letter]) result.monsters.push({ name: preset.monsters[letter], x: x, y: y });
    }
  });
  result.start = result.start || { x: 1, y: 1 };
  return result;
}
