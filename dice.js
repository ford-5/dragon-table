// =====================================================================
// SHARED DICE HELPERS — used by index.html, character.html and dm.html.
// Each page loads this file with:  <script src="dice.js"></script>
// Fix or improve something here and every page gets the change.
// =====================================================================

// Roll ONE die and return the result (1 to sides).
//   Math.random() gives a decimal from 0 up to (but not including) 1.
//   Multiply by sides, chop off the decimal, then add 1.
function rollOneDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// The classic way to roll an ability score: roll 4d6 and drop the lowest die.
// Returns an object so the page can show the dice too, e.g. { total: 14, dice: [6, 5, 3, 1] }.
function rollAbilityScore() {
  const dice = [rollOneDie(6), rollOneDie(6), rollOneDie(6), rollOneDie(6)];
  const sorted = dice.slice().sort(function (a, b) {   // slice() makes a copy so we don't reorder "dice"
    return b - a;                                       // highest first
  });
  const total = sorted[0] + sorted[1] + sorted[2];      // keep the top three
  return { total: total, dice: dice };
}

// Roll a d20 twice for advantage (keep higher) or disadvantage (keep lower).
// mode is "advantage" or "disadvantage".
function rollD20WithMode(mode) {
  const first = rollOneDie(20);
  const second = rollOneDie(20);
  let kept;
  if (mode === "advantage") {
    kept = Math.max(first, second);
  } else {
    kept = Math.min(first, second);
  }
  return { kept: kept, rolls: [first, second] };
}

// Always show a sign: 3 -> "+3", 0 -> "+0", -2 -> "-2".
// Used on the character sheet, where "+0" is normal.
function formatBonus(number) {
  if (number >= 0) return "+" + number;
  return "" + number;
}

// Like formatBonus, but shows nothing for 0: 3 -> "+3", 0 -> "", -2 -> "-2".
// Used by the dice roller, where "1d20+0" would look odd.
function formatModifier(modifier) {
  if (modifier === 0) return "";
  return formatBonus(modifier);
}
