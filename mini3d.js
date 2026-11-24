// =====================================================================
// MINI MAKER: builds a 3D-printable miniature of a hero, out of simple
// shapes (cylinders, cones, spheres, boxes), and saves it as an STL file,
// the file type every 3D printer's software opens.
//
// How 3D models work here:
//   - A 3D model is a big list of TRIANGLES. Each triangle is 3 points,
//     and each point is [x, y, z] in millimeters.
//   - z is UP (the printer builds from z = 0 upward). The front of the
//     figure faces -y.
//   - Each shape is a closed "skin" of triangles. Shapes are allowed to
//     overlap: printer software (the "slicer") merges them when it prints.
//   - The order of a triangle's 3 points matters: going counter-clockwise
//     when seen from OUTSIDE tells the printer which side is the outside.
//
// PRINTABLE BY DESIGN: a printer can't print in mid-air, so every part
// either grows up from the base or leans on something below it (swords are
// planted on the ground, shields rest on the base, hands rest on hips).
// =====================================================================

// ---------------------------------------------------------------------
// Small vector helpers
// ---------------------------------------------------------------------
function vAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vScale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function vDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function vLength(a) { return Math.sqrt(vDot(a, a)); }
function vNormalize(a) {
  const length = vLength(a) || 1;
  return vScale(a, 1 / length);
}

// ---------------------------------------------------------------------
// Basic shapes, built around the origin
// ---------------------------------------------------------------------

// A cylinder (r0 = r1) or a cone-like "frustum" (r0 ≠ r1) from z = 0 up to z = h.
// squash < 1 flattens it front-to-back (its y direction).
function makeFrustum(r0, r1, h, seg, squash) {
  seg = seg || 24;
  squash = squash || 1;
  const tris = [];
  const ring = function (r, z, i) {
    // "% seg" makes the last point exactly the first, so the shape closes with no hairline gap.
    const a = ((i % seg) / seg) * Math.PI * 2;
    return [r * Math.cos(a), r * Math.sin(a) * squash, z];
  };
  for (let i = 0; i < seg; i++) {
    const p0 = ring(r0, 0, i), p1 = ring(r0, 0, i + 1);
    const q0 = ring(r1, h, i), q1 = ring(r1, h, i + 1);
    // The side is a strip of 4-cornered pieces, each cut into 2 triangles.
    // A pointed end (radius 0) squeezes one of the two triangles to nothing, so it's skipped.
    if (r0 > 0) tris.push([p0, p1, q1]);
    if (r1 > 0) tris.push([p0, q1, q0]);
    if (r0 > 0) tris.push([[0, 0, 0], p1, p0]);   // bottom cap (faces down)
    if (r1 > 0) tris.push([[0, 0, h], q0, q1]);   // top cap (faces up)
  }
  return tris;
}

// An egg/ball shape with radii rx, ry, rz, centered on the origin.
function makeEllipsoid(rx, ry, rz, seg, rings) {
  seg = seg || 20;
  rings = rings || 12;
  const point = function (i, j) {
    // The poles are single exact points, and "% seg" closes each ring exactly (watertight).
    if (i === 0) return [0, 0, -rz];
    if (i === rings) return [0, 0, rz];
    const lat = -Math.PI / 2 + (i / rings) * Math.PI;   // from the bottom pole to the top pole
    const lon = ((j % seg) / seg) * Math.PI * 2;
    return [rx * Math.cos(lat) * Math.cos(lon), ry * Math.cos(lat) * Math.sin(lon), rz * Math.sin(lat)];
  };
  const tris = [];
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < seg; j++) {
      const a = point(i, j), b = point(i, j + 1), c = point(i + 1, j + 1), d = point(i + 1, j);
      if (i > 0) tris.push([a, b, c]);            // skip the squashed triangles at the poles
      if (i < rings - 1) tris.push([a, c, d]);
    }
  }
  return tris;
}

// A box sx wide (x), sy deep (y), sz tall (z), centered on the origin.
function makeBox(sx, sy, sz) {
  const x = sx / 2, y = sy / 2, z = sz / 2;
  const P = function (a, b, c) { return [a * x, b * y, c * z]; };
  const quads = [
    [P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)],      // top
    [P(-1, -1, -1), P(-1, 1, -1), P(1, 1, -1), P(1, -1, -1)],  // bottom
    [P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1)],      // right (+x)
    [P(-1, -1, -1), P(-1, -1, 1), P(-1, 1, 1), P(-1, 1, -1)],  // left (-x)
    [P(1, 1, -1), P(-1, 1, -1), P(-1, 1, 1), P(1, 1, 1)],      // back (+y)
    [P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1), P(-1, -1, -1)]   // front (-y)
  ];
  const tris = [];
  for (const q of quads) {
    tris.push([q[0], q[1], q[2]], [q[0], q[2], q[3]]);
  }
  return tris;
}

// ---------------------------------------------------------------------
// Moving shapes into place
// ---------------------------------------------------------------------

// Move every point: new point = origin + x·u + y·v + z·w.
// (u, v, w must be at right angles and "right-handed", so outsides stay outside.)
function placeInBasis(tris, origin, u, v, w) {
  return tris.map(function (t) {
    return t.map(function (p) {
      return vAdd(origin, vAdd(vScale(u, p[0]), vAdd(vScale(v, p[1]), vScale(w, p[2]))));
    });
  });
}

// Just slide a shape somewhere.
function moveTo(tris, at) {
  return placeInBasis(tris, at, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
}

// A rod from point p to point q: radius r0 at p, r1 at q.
// "side" picks which way a squashed (flat) rod is flat: flat faces point along "side".
function makeRod(p, q, r0, r1, options) {
  options = options || {};
  const along = vSub(q, p);
  const w = vNormalize(along);
  let side = options.side || [0, -1, 0];
  if (Math.abs(vDot(vNormalize(side), w)) > 0.95) side = [1, 0, 0];   // side can't point along the rod
  // u: at right angles to the rod; v: the flat direction (close to "side").
  const v0 = vNormalize(vSub(side, vScale(w, vDot(side, w))));
  const u = vCross(v0, w);
  const v = vCross(w, u);
  const shape = makeFrustum(r0, r1, vLength(along), options.seg || 16, options.squash || 1);
  return placeInBasis(shape, p, u, v, w);
}

// ---------------------------------------------------------------------
// THE HERO FIGURE
// ---------------------------------------------------------------------
// Body sizes for each species (in millimeters, at normal 32 mm scale).
const MINI_SPECIES = {
  "Human":      { legs: 10,  torso: 7,   width: 1,    head: 3.3 },
  "Elf":        { legs: 10.5, torso: 7,  width: 0.95, head: 3.2, ears: "long" },
  "Dwarf":      { legs: 6.5, torso: 6.5, width: 1.2,  head: 3.3, beard: true },
  "Halfling":   { legs: 6,   torso: 5.5, width: 0.95, head: 3.0 },
  "Gnome":      { legs: 5.5, torso: 5.5, width: 0.92, head: 3.0, ears: "short" },
  "Orc":        { legs: 10.5, torso: 7.5, width: 1.12, head: 3.4, tusks: true },
  "Tiefling":   { legs: 10,  torso: 7,   width: 1,    head: 3.3, horns: "curly", tail: "thin" },
  "Dragonborn": { legs: 10.5, torso: 7.5, width: 1.1, head: 3.3, snout: true, horns: "back", tail: "thick" },
  "Goliath":    { legs: 11.5, torso: 8,  width: 1.18, head: 3.4 }
};

// What each class wears and carries.
//   robe:  a long robe instead of legs     cape:  a cloak down to the ground (also props up hoods)
//   hood:  a hood over the head            right / left: what each hand does
const MINI_CLASSES = {
  "Barbarian": { right: "greataxe", left: "hip" },
  "Bard":      { right: "lute", left: "lute" },
  "Cleric":    { right: "mace", left: "shield" },
  "Druid":     { robe: true, right: "druidStaff", left: "hip" },
  "Fighter":   { right: "sword", left: "shield" },
  "Monk":      { right: "quarterstaff", left: "hip", sash: true },
  "Paladin":   { right: "sword", left: "shield", cape: true },
  "Ranger":    { right: "hip", left: "bow", cape: true, hood: true, quiver: true },
  "Rogue":     { right: "dagger", left: "dagger", cape: true, hood: true },
  "Sorcerer":  { robe: true, right: "orb", left: "orb" },
  "Warlock":   { robe: true, right: "book", left: "book", cape: true, hood: true },
  "Wizard":    { robe: true, right: "wizardStaff", left: "hip", hat: true }
};

const MINI_BASE_RADIUS = 12.5;   // a 25 mm round base, the usual size for Medium and Small heroes
const MINI_BASE_HEIGHT = 3;

// Builds the whole figure. Returns { tris, notes }.
//   species, className: names from rules.js     big: true = 1.5 times bigger
function buildHeroMini(speciesName, className, big) {
  const sp = MINI_SPECIES[speciesName] || MINI_SPECIES.Human;
  const cl = MINI_CLASSES[className] || MINI_CLASSES.Fighter;
  const parts = [];
  const add = function (tris) { parts.push(tris); };

  // ----- Where everything goes -----
  const W = sp.width;
  const feet = MINI_BASE_HEIGHT;
  const hip = feet + sp.legs;
  const shoulder = hip + sp.torso;
  const neckTop = shoulder + 1.2;
  const headR = sp.head;
  const headZ = neckTop + headR * 0.75;
  const waistR = 3.1 * W, shoulderR = 4.0 * W;
  const torsoDepth = 0.72;                       // the body is flatter front-to-back than side-to-side

  // ----- The base: a round disc with a gently sloped edge -----
  add(makeFrustum(MINI_BASE_RADIUS, MINI_BASE_RADIUS - 1, MINI_BASE_HEIGHT, 48));

  // ----- Legs, or a long robe -----
  if (cl.robe) {
    add(moveTo(makeFrustum(5.6 * W, waistR, hip - feet + 1, 32, 0.85), [0, 0, feet - 0.01]));
  } else {
    for (const side of [-1, 1]) {
      const x = side * 1.75 * W;
      add(makeRod([x, 0, feet - 0.01], [x, 0, hip + 0.5], 1.65 * W, 1.75 * W, { seg: 16 }));
      add(moveTo(makeBox(2.6 * W, 4.2, 1.6), [x, -0.8, feet + 0.79]));   // a boot
    }
  }

  // ----- Body, belt or sash, neck, and head -----
  add(moveTo(makeFrustum(waistR, shoulderR, sp.torso, 28, torsoDepth), [0, 0, hip]));
  add(moveTo(makeEllipsoid(shoulderR * 0.98, shoulderR * torsoDepth, 1.5, 24, 8), [0, 0, shoulder]));   // rounded shoulders
  add(moveTo(makeFrustum(waistR + 0.35, waistR + 0.35, 1.2, 28, torsoDepth + 0.04), [0, 0, hip + 0.6]));   // belt
  if (cl.sash) add(makeRod([-waistR, -1.4, hip + 1], [shoulderR * 0.7, -2.1, shoulder - 0.5], 0.75, 0.75, { seg: 10 }));
  add(makeRod([0, 0, shoulder], [0, 0, neckTop + 0.5], 1.35, 1.35, { seg: 14 }));
  // A cone under the head (a jaw) so its underside isn't a flat overhang.
  add(makeRod([0, -0.2, neckTop - 0.3], [0, -0.3, headZ - headR * 0.3], 1.2, headR * 0.82, { seg: 18 }));
  add(moveTo(makeEllipsoid(headR, headR * 0.95, headR, 22, 14), [0, 0, headZ]));

  // ----- Species features -----
  if (sp.ears) {
    const length = sp.ears === "long" ? 2.6 : 1.5;
    for (const side of [-1, 1]) {
      add(makeRod([side * headR * 0.7, 0.2, headZ], [side * (headR + length), 0.5, headZ + length * 0.8], 0.9, 0.15, { seg: 10 }));
    }
  }
  if (sp.beard) {
    add(makeRod([0, -2.3 * W, shoulder - 3.6], [0, -headR * 0.75, headZ - headR * 0.35], 1.0, 2.3, { seg: 18 }));
  }
  if (sp.tusks) {
    for (const side of [-1, 1]) {
      add(makeRod([side * 1.2, -headR * 0.8, headZ - headR * 0.45], [side * 1.6, -headR * 1.02, headZ + 0.2], 0.5, 0.12, { seg: 8 }));
    }
  }
  if (sp.snout) {
    add(moveTo(makeEllipsoid(1.9, 2.3, 1.5, 16, 10), [0, -headR * 0.85, headZ - 0.6]));
    add(makeRod([0, -headR * 0.4, headZ - headR * 0.6], [0, -headR * 1.1, headZ - 1.0], 1.4, 1.2, { seg: 12 }));   // props up the snout
  }
  if (sp.horns === "curly") {
    for (const side of [-1, 1]) {
      const a = [side * 1.5, -0.4, headZ + headR * 0.75];
      const b = [side * 2.7, 0.6, headZ + headR + 1.4];
      const c = [side * 3.1, 2.0, headZ + headR + 1.9];
      add(makeRod(a, b, 0.75, 0.5, { seg: 10 }));
      add(makeRod(b, c, 0.5, 0.15, { seg: 10 }));
    }
  }
  if (sp.horns === "back") {
    for (const side of [-1, 1]) {
      add(makeRod([side * 1.4, 0.8, headZ + headR * 0.6], [side * 1.9, 3.6, headZ + headR + 1.6], 0.8, 0.2, { seg: 10 }));
    }
  }
  if (sp.tail) {
    const thick = sp.tail === "thick" ? 1.25 : 0.65;
    // From the lower back, curving down to rest on the base behind the feet.
    const pts = [[0, 1.8, hip + 0.5], [0, 4.0, hip - 3], [0, 6.0, feet + 2.5], [0, 7.8, feet + 0.3]];
    for (let i = 0; i < pts.length - 1; i++) {
      const r0 = thick * (1 - i * 0.22), r1 = thick * (1 - (i + 1) * 0.22);
      add(makeRod(pts[i], pts[i + 1], r0, r1, { seg: 12 }));
      add(moveTo(makeEllipsoid(r1, r1, r1, 10, 6), pts[i + 1]));   // smooth the joints
    }
  }

  // ----- Cape (down to the ground) and hood -----
  if (cl.cape || cl.hood) {
    add(moveTo(makeFrustum(5.4 * W, shoulderR * 0.95, shoulder - feet + 0.4, 28, 0.32), [0, 2.5, feet - 0.01]));
  }
  if (cl.hood) {
    add(moveTo(makeEllipsoid(headR + 0.7, headR + 0.6, headR + 0.6, 22, 14), [0, 0.7, headZ + 0.25]));
  }

  // ----- Arms and what the hands hold -----
  // Each hand is at one of these places, depending on what it's doing:
  const handFor = function (side, job) {
    const sx = side * (shoulderR + 1.3);
    if (job === "hip") return [side * (waistR + 0.7), -0.3, hip + 0.4];
    if (job === "lute" || job === "orb" || job === "book") return [side * 1.6, -(waistR * torsoDepth + 1.0), hip + 2.6];
    if (job === "bow") return [side * 7.1, -0.2, hip + 0.4];
    if (job === "wizardStaff" || job === "druidStaff" || job === "quarterstaff") return [side * (shoulderR + 2.0), -0.6, hip + 2.2];
    return [sx, -0.4, hip];   // weapons and shields: hand at the side, at hip height
  };

  const notes = [];
  for (const side of [1, -1]) {   // 1 = the figure's right hand (on the +x side)
    const job = side === 1 ? cl.right : cl.left;
    const hand = handFor(side, job);
    const shoulderPoint = [side * (shoulderR - 0.3), 0, shoulder - 0.3];
    add(makeRod(shoulderPoint, hand, 1.3, 1.15, { seg: 12 }));
    add(moveTo(makeEllipsoid(1.45, 1.45, 1.45, 12, 8), hand));

    const hx = hand[0], hy = hand[1], hz = hand[2];
    if (job === "sword") {
      // Planted point-down on the base, hand resting on the hilt.
      add(moveTo(makeBox(1.5, 0.95, hz - 1.4 - feet), [hx, hy - 0.2, feet + (hz - 1.4 - feet) / 2]));
      add(moveTo(makeBox(4.2, 1.1, 0.9), [hx, hy - 0.2, hz - 1.3]));       // crossguard
      add(makeRod([hx, hy - 0.2, hz - 1.0], [hx, hy - 0.2, hz + 1.6], 0.55, 0.55, { seg: 10 }));   // grip
      add(moveTo(makeEllipsoid(0.85, 0.85, 0.85, 10, 6), [hx, hy - 0.2, hz + 1.9]));   // pommel
    } else if (job === "shield") {
      // A round shield resting on its edge on the base, held at the top.
      const r = Math.min(4.6, (hz - feet) * 0.62);
      const center = [hx + side * 0.9, hy - 0.6, feet + r - 0.2];
      add(makeRod(vAdd(center, [-side * 0.6, 0, 0]), vAdd(center, [side * 0.6, 0, 0]), r, r - 0.3, { seg: 32 }));
      add(moveTo(makeEllipsoid(0.9, 0.9, 0.9, 10, 6), vAdd(center, [side * 0.7, 0, 0])));   // the boss in the middle
      add(makeRod(hand, vAdd(center, [0, 0, r - 0.8]), 0.9, 0.9, { seg: 8 }));              // the strap to the hand
    } else if (job === "greataxe") {
      const x = hx + side * 0.2;
      add(makeRod([x, hy, feet - 0.01], [x, hy, hz + 11], 0.75, 0.75, { seg: 12 }));   // haft, planted on the base
      // The blade grows outward and upward from the haft, so it prints without support.
      add(makeRod([x, hy, hz + 5.5], [x + side * 3.0, hy, hz + 10], 0.6, 2.6, { seg: 16, squash: 0.28, side: [0, 1, 0] }));
    } else if (job === "mace") {
      // Resting head-down on the base.
      add(moveTo(makeEllipsoid(1.7, 1.7, 1.7, 14, 8), [hx, hy, feet + 1.5]));
      add(makeRod([hx, hy, feet + 2.5], [hx, hy, hz + 1.4], 0.6, 0.6, { seg: 10 }));
    } else if (job === "dagger") {
      // Hands on hips, daggers pointing up and out.
      add(makeRod([hx, hy - 0.2, hz + 0.6], [hx + side * 1.6, hy - 0.4, hz + 5.2], 0.75, 0.08, { seg: 12, squash: 0.35, side: [0, 1, 0] }));
    } else if (job === "bow") {
      // A bow standing on the base, held in the middle.
      const steps = 8, bottom = feet - 0.01, top = hz + 9.5;
      let previous = null;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = [side * (6.3 + 0.9 * Math.sin(Math.PI * t)), -0.2, bottom + t * (top - bottom)];
        if (previous) add(makeRod(previous, point, 0.62, 0.62, { seg: 10 }));
        previous = point;
      }
    } else if (job === "wizardStaff" || job === "druidStaff" || job === "quarterstaff") {
      const top = job === "quarterstaff" ? headZ + 1 : headZ + headR + 3;
      add(makeRod([hx, hy, feet - 0.01], [hx, hy, top], 0.7, 0.7, { seg: 12 }));
      if (job === "wizardStaff") add(moveTo(makeEllipsoid(1.6, 1.6, 1.6, 14, 10), [hx, hy, top + 0.9]));
      if (job === "druidStaff") {
        add(moveTo(makeEllipsoid(1.2, 1.2, 1.2, 12, 8), [hx - 0.7, hy, top + 0.4]));
        add(moveTo(makeEllipsoid(1.1, 1.1, 1.1, 12, 8), [hx + 0.7, hy - 0.3, top + 0.7]));
        add(moveTo(makeEllipsoid(1.0, 1.0, 1.0, 12, 8), [hx, hy + 0.5, top + 1.3]));
      }
    } else if (job === "lute" && side === 1) {
      add(moveTo(makeEllipsoid(2.6, 1.2, 3.0, 18, 10), [0.2, -(waistR * torsoDepth + 0.6), hip + 1.4]));   // the lute's body
      add(makeRod([0.8, -(waistR * torsoDepth + 0.7), hip + 3.6], [shoulderR + 0.6, -(waistR * torsoDepth + 0.4), shoulder + 1.2], 0.6, 0.55, { seg: 10 }));   // its neck
    } else if (job === "orb" && side === 1) {
      add(moveTo(makeEllipsoid(2.1, 2.1, 2.1, 18, 12), [0, -(waistR * torsoDepth + 1.4), hip + 4.4]));
    } else if (job === "book" && side === 1) {
      add(moveTo(makeBox(4.0, 1.4, 4.6), [0, -(waistR * torsoDepth + 1.3), hip + 3.6]));
    }
  }

  // ----- Hats and quivers -----
  if (cl.hat) {
    // A sloping brim (not a flat one, so it prints without support) and a tall pointed top.
    add(moveTo(makeFrustum(headR + 2.2, headR - 0.1, 1.8, 28), [0, 0, headZ + headR * 0.45]));
    add(moveTo(makeFrustum(headR * 0.95, 0, 8.5, 22), [0, 0.4, headZ + headR * 0.45 + 1.6]));
  }
  if (cl.quiver) {
    add(makeRod([2.2 * W, 3.2, hip - 1], [3.0 * W, 2.6, shoulder + 2.6], 1.2, 1.3, { seg: 12 }));
  }

  if (!MINI_SPECIES[speciesName]) notes.push("Unknown species: built as a Human.");
  if (!MINI_CLASSES[className]) notes.push("Unknown class: built as a Fighter.");

  // ----- Join every part into one list, and scale for the "big" option -----
  const scale = big ? 1.5 : 1;
  const tris = [];
  for (const part of parts) {
    for (const t of part) {
      tris.push(scale === 1 ? t : t.map(function (p) { return vScale(p, scale); }));
    }
  }
  return { tris: tris, notes: notes };
}

// ---------------------------------------------------------------------
// Measuring the model
// ---------------------------------------------------------------------
function measureMini(tris) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const t of tris) {
    for (const p of t) {
      for (let k = 0; k < 3; k++) {
        if (p[k] < min[k]) min[k] = p[k];
        if (p[k] > max[k]) max[k] = p[k];
      }
    }
  }
  return { min: min, max: max, size: vSub(max, min) };
}

// ---------------------------------------------------------------------
// SAVING AS STL (binary): the standard 3D-printing file format.
//   80 bytes of header text, then the number of triangles, then for each
//   triangle: its normal (which way it faces) and its 3 corners, as numbers.
// ---------------------------------------------------------------------
function makeStl(tris, title) {
  const buffer = new ArrayBuffer(84 + tris.length * 50);
  const view = new DataView(buffer);
  const header = String(title || "Dragon Table mini").slice(0, 79);
  for (let i = 0; i < header.length; i++) view.setUint8(i, header.charCodeAt(i) & 0x7f);
  view.setUint32(80, tris.length, true);

  let offset = 84;
  for (const t of tris) {
    const n = vNormalize(vCross(vSub(t[1], t[0]), vSub(t[2], t[0])));
    for (const value of [n, t[0], t[1], t[2]]) {
      view.setFloat32(offset, value[0], true);
      view.setFloat32(offset + 4, value[1], true);
      view.setFloat32(offset + 8, value[2], true);
      offset += 12;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "model/stl" });
}

// ---------------------------------------------------------------------
// A SIMPLE 3D PREVIEW on a <canvas> (no extra library needed).
// Turns the model, flattens it onto the screen, and paints the triangles
// from back to front, darker where they face away from the light.
// ---------------------------------------------------------------------
function drawMini(canvas, tris, angle) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!tris.length) return;

  const box = measureMini(tris);
  const center = [(box.min[0] + box.max[0]) / 2, (box.min[1] + box.max[1]) / 2, (box.min[2] + box.max[2]) / 2];
  const extent = Math.max(box.size[0], box.size[1], box.size[2]) || 1;
  const zoom = (Math.min(w, h) * 0.85) / extent;

  const tilt = 0.32;   // look down on the model a little
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  const project = function (p) {
    const x = p[0] - center[0], y = p[1] - center[1], z = p[2] - center[2];
    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;                // depth before tilting (+ = farther away)
    return [rx, z * cosT + ry * sinT, ry * cosT - z * sinT];   // [screen x, screen up, depth]
  };

  // The light comes from the upper left, in front: [right, up, toward the viewer].
  const light = vNormalize([-0.4, 0.6, 0.8]);
  const faces = [];
  for (const t of tris) {
    const a = project(t[0]), b = project(t[1]), c = project(t[2]);
    // Which way does it face? Screen coordinates are [right, up, away], which is
    // mirror-image compared to the model's, so the cross product is taken the other
    // way round to keep "outside" pointing outside.
    const n = vNormalize(vCross(vSub(c, a), vSub(b, a)));
    if (n[2] > 0.0001) continue;                    // facing away: hidden behind the model
    const brightness = 0.35 + 0.65 * Math.max(0, vDot([n[0], n[1], -n[2]], light));
    faces.push({ a: a, b: b, c: c, depth: (a[2] + b[2] + c[2]) / 3, brightness: brightness });
  }
  faces.sort(function (f, g) { return g.depth - f.depth; });   // far ones first

  for (const f of faces) {
    const shade = Math.round(70 + 160 * f.brightness);
    ctx.fillStyle = "rgb(" + shade + "," + Math.round(shade * 0.93) + "," + Math.round(shade * 0.82) + ")";
    ctx.beginPath();
    ctx.moveTo(w / 2 + f.a[0] * zoom, h / 2 - f.a[1] * zoom);
    ctx.lineTo(w / 2 + f.b[0] * zoom, h / 2 - f.b[1] * zoom);
    ctx.lineTo(w / 2 + f.c[0] * zoom, h / 2 - f.c[1] * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ctx.fillStyle;   // hides hairline gaps between triangles
    ctx.stroke();
  }
}
