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
