// =====================================================================
// EQUIPMENT SHOP: your 3D-printed products, and where orders go.
// This is the ONLY file you need to change to run the shop.
// =====================================================================

// ---------- Where orders go (a Google Form) ----------
// Orders are sent to YOUR Google Form. Google saves every order as a new row in
// your Google Sheet and can email you each time. Nothing secret lives here:
// a form link is meant to be public, so it's safe on the website.
//
// Until "url" is filled in, the shop shows items but the Order button is off.
//   url:        the form's link, ending in /viewform
//   orderField: the form's "Order details" question, like "entry.123456789"
//   totalField: the form's "Order total" question, like "entry.987654321"
const ORDER_FORM = {
  url: "",
  orderField: "",
  totalField: ""
};

// The money symbol shown in front of prices.
const CURRENCY = "$";

// ---------- The four sections of the shop ----------
const SHOP_CATEGORIES = [
  { key: "terrain",  name: "Obstacles & terrain", icon: "🧱" },
  { key: "minis",    name: "Player miniatures",   icon: "🧙" },
  { key: "tokens",   name: "Tokens",              icon: "🪙" },
  { key: "dice",     name: "Dice",                icon: "🎲" }
];

// ---------- The products ----------
// Each product:
//   id:       a short unique name with no spaces (used for the basket)
//   category: one of the keys above
//   name, description
//   price:    a number, like 12.5 for 12.50
//   icon:     an emoji shown when there's no photo yet
//   photo:    (optional) a picture file in the "images" folder, like "images/ruined-wall.jpg"
//   example:  true marks a made-up example. Delete it (or set false) for your real products.
//
// ALL of these are EXAMPLES: replace them with your real prints, photos and prices.
// Only sell prints of models you designed yourself or whose license allows selling prints.
const PRODUCTS = [
  { id: "ruined-wall", category: "terrain", name: "Ruined Stone Wall Set", icon: "🧱", price: 12, example: true,
    description: "Six crumbling wall sections that fit a 1-inch grid. Great cover for archers." },
  { id: "treasure-chests", category: "terrain", name: "Treasure Chests (×3)", icon: "💰", price: 6, example: true,
    description: "Three chests, one open and spilling coins. Paint them or play them as printed." },
  { id: "campfire", category: "terrain", name: "Campfire & Logs", icon: "🔥", price: 5, example: true,
    description: "A campfire with log seats for when the heroes rest under the stars." },
  { id: "spike-trap", category: "terrain", name: "Spike Pit Trap", icon: "⚠️", price: 7, example: true,
    description: "A 2-by-2 square pit with a removable lid, so you can reveal the trap at the table." },

  { id: "custom-hero", category: "minis", name: "Your Hero, Printed", icon: "🧙", price: 15, example: true,
    description: "A 32 mm miniature of your character. Tell us their class, species and look in the order notes." },
  { id: "adventurer-party", category: "minis", name: "Adventuring Party (×4)", icon: "⚔️", price: 40, example: true,
    description: "A fighter, a rogue, a cleric and a wizard, ready for the first session." },
  { id: "goblin-band", category: "minis", name: "Goblin Raiders (×6)", icon: "👺", price: 24, example: true,
    description: "Six sneaky goblins in different poses. Perfect for a first fight." },

  { id: "condition-tokens", category: "tokens", name: "Condition Rings (×20)", icon: "⭕", price: 8, example: true,
    description: "Rings that slip over a miniature's base: Poisoned, Prone, Frightened and more." },
  { id: "initiative-tokens", category: "tokens", name: "Initiative Counters (×10)", icon: "🔢", price: 6, example: true,
    description: "Numbered stand-ups to show the turn order at a glance." },
  { id: "spell-markers", category: "tokens", name: "Spell Area Markers", icon: "✨", price: 10, example: true,
    description: "A cone, a sphere and a line template for spell areas, in three sizes." },

  { id: "dice-set", category: "dice", name: "Polyhedral Dice Set (×7)", icon: "🎲", price: 14, example: true,
    description: "d4, d6, d8, d10, d%, d12 and d20 with crisp printed numbers." },
  { id: "dice-tower", category: "dice", name: "Castle Dice Tower", icon: "🏰", price: 22, example: true,
    description: "Drop your dice in the top and watch them tumble out the castle gate." },
  { id: "dice-tray", category: "dice", name: "Hex Dice Tray", icon: "⬡", price: 9, example: true,
    description: "A six-sided tray that keeps rolls off the map." }
];
