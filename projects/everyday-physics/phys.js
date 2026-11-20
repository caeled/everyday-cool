"use strict";
/* Everyday Physics — the rules, with no DOM code, so Node can check them.
   Two playable benches and two small ones, all honest about their scale:
   - The pool table works in pixels and frames. Speeds are pixels per frame;
     the table's friction is a steady slow-down (a fixed share of speed lost
     each frame), cushion bounces mirror the velocity, and ball-to-ball hits
     are elastic between equal masses: the two balls exchange the parts of
     their velocity that point along the line between their centres, and
     keep the sideways parts. Momentum (for equal masses, the sum of the
     velocities) is conserved exactly by that exchange.
   - The ballistics launcher works in metres and seconds with g = 9.8 m/s^2,
     on a range drawn 60 metres wide. No air resistance — stated on the page.
   - The pendulum uses T = 2π√(L/g) with real metres and g = 9.8.
   - The seesaw balances when weight × distance matches on both sides.
   - Flight's wing loading is grams ÷ square decimetres of wing, from
     the room's own estimated wing areas and about-value paper weights. */

function round2(n) { return Math.round(n * 100) / 100; }

/* ---------- Shared geometry ---------- */

/* Reflect a velocity off a wall. axis "x" = a vertical wall (left/right
   cushion): the x part flips, the y part is untouched — so the angle the
   path makes with the wall is the same coming out as going in. */
function reflectVelocity(vx, vy, axis) {
 if (axis === "x") return { vx: -vx, vy: vy };
 if (axis === "y") return { vx: vx, vy: -vy };
 return { vx: vx, vy: vy };
}

/* The angle a moving ball's path makes with a cushion's surface, in
   degrees: 90 means head-on into the cushion, a small angle means skimming
   along it. surface "vertical" measures against a left/right cushion,
   "horizontal" against a top/bottom cushion. In and out of a bounce, this
   angle is the same — that equality is the reflection rule. */
function angleToSurface(vx, vy, surface) {
 const speed = Math.hypot(vx, vy);
 if (speed === 0) return 0;
 const normal = surface === "vertical" ? Math.abs(vx) : Math.abs(vy);
 return round2(Math.asin(Math.min(1, normal / speed)) * 180 / Math.PI);
}

/* ---------- The pool table ---------- */

/* One simulation step for one ball inside a rectangle (the cushion inner
   edges), with steady friction. Returns the new state plus what happened:
   which cushion was hit, if any. Pockets are handled by the caller. */
function poolStep(ball, table, friction) {
 let { x, y, vx, vy } = ball;
 const r = ball.r;
 let bounce = null;
 x += vx; y += vy;
 if (x < table.left + r) { x = table.left + r; const f = reflectVelocity(vx, vy, "x"); vx = f.vx; vy = f.vy; bounce = "left"; }
 if (x > table.right - r) { x = table.right - r; const f = reflectVelocity(vx, vy, "x"); vx = f.vx; vy = f.vy; bounce = "right"; }
 if (y < table.top + r) { y = table.top + r; const f = reflectVelocity(vx, vy, "y"); vx = f.vx; vy = f.vy; bounce = "top"; }
 if (y > table.bottom - r) { y = table.bottom - r; const f = reflectVelocity(vx, vy, "y"); vx = f.vx; vy = f.vy; bounce = "bottom"; }
 const keep = 1 - friction;
 vx *= keep; vy *= keep;
 if (Math.hypot(vx, vy) < 0.05) { vx = 0; vy = 0; }
 return { x, y, vx, vy, r, bounce };
}

/* Elastic collision between two equal-mass balls. Along the line of
   centres the balls swap their velocity parts; the sideways parts stay.
   Returns the two new velocities, or null when they are not approaching
   (already separating, or not touching). Positions are the caller's job. */
function collideEqualMass(a, b) {
 const dx = b.x - a.x, dy = b.y - a.y;
 const dist = Math.hypot(dx, dy);
 if (dist === 0) return null;
 const nx = dx / dist, ny = dy / dist;
 const aAlong = a.vx * nx + a.vy * ny;
 const bAlong = b.vx * nx + b.vy * ny;
 if (aAlong - bAlong <= 0) return null; /* not approaching along the line */
 return {
  a: { vx: a.vx + (bAlong - aAlong) * nx, vy: a.vy + (bAlong - aAlong) * ny },
  b: { vx: b.vx + (aAlong - bAlong) * nx, vy: b.vy + (aAlong - bAlong) * ny }
 };
}

/* Total momentum of a set of equal-mass balls, in velocity units (mass 1). */
function totalMomentum(balls) {
 let px = 0, py = 0;
 for (const b of balls) { px += b.vx; py += b.vy; }
 return { px, py };
}

/* ---------- The ballistics launcher ---------- */

const GRAVITY = 9.8; /* m/s^2, the real one */

/* Where a projectile launched at speed v (m/s) and angleDeg lands:
   range R = v^2 · sin(2θ) / g, apex h = (v·sinθ)^2 / (2g),
   flight time t = 2·v·sinθ / g. Assumes launch and landing at the same
   height, and no air resistance. */
function projectileRange(speed, angleDeg) {
 const th = angleDeg * Math.PI / 180;
 return round2(speed * speed * Math.sin(2 * th) / GRAVITY);
}
function projectileFlight(speed, angleDeg) {
 const v = Number(speed), a = Number(angleDeg);
 if (!Number.isFinite(v) || v <= 0) return { ok: false, error: "The launch speed needs to be a number bigger than zero." };
 if (!Number.isFinite(a) || a < 0 || a > 90) return { ok: false, error: "The angle needs to be between 0 and 90 degrees." };
 const th = a * Math.PI / 180;
 const vy = v * Math.sin(th);
 return { ok: true, speed: v, angle: a,
  range: round2(v * v * Math.sin(2 * th) / GRAVITY),
  apex: round2(vy * vy / (2 * GRAVITY)),
  flightTime: round2(2 * vy / GRAVITY) };
}
/* Position at time t (seconds): x grows evenly, y is pulled down by g. */
function projectileAt(speed, angleDeg, t) {
 const th = angleDeg * Math.PI / 180;
 return { x: round2(speed * Math.cos(th) * t),
          y: round2(speed * Math.sin(th) * t - 0.5 * GRAVITY * t * t) };
}

/* ---------- The pendulum ---------- */

/* T0 = 2π√(L/g). Length in metres. Weight does not appear. For a swing
   of amplitude angleDeg, the period is lengthened by the standard
   large-angle factor: T / T0 = (2/π) K(k) with k = sin(θ/2), computed
   from the series for the complete elliptic integral of the first kind.
   Omit the angle (or pass 0) and you get the small-swing formula alone.
   The page uses this so a wide swing honestly runs a little long. */
function pendulumPeriodFactor(angleDeg) {
 const a = Number(angleDeg);
 if (!Number.isFinite(a) || a < 0 || a >= 180) return null;
 if (a === 0) return 1;
 const k = Math.sin((a * Math.PI / 180) / 2);
 /* K(k) / (π/2) = Σ [((2n-1)!!/(2n)!!)]² k^{2n} */
 let sum = 1, coeff = 1, kpow = 1;
 for (let n = 1; n <= 12; n++) {
  coeff *= (2 * n - 1) / (2 * n);
  kpow *= k * k;
  sum += coeff * coeff * kpow;
 }
 return sum;
}
function pendulumPeriod(lengthM, angleDeg) {
 const L = Number(lengthM);
 if (!Number.isFinite(L) || L <= 0) return { ok: false, error: "The string length needs to be a number bigger than zero." };
 const ang = (angleDeg === undefined || angleDeg === null || angleDeg === "") ? 0 : Number(angleDeg);
 const factor = pendulumPeriodFactor(ang);
 if (factor === null) return { ok: false, error: "The swing width needs to be an angle between 0 and 180 degrees, short of a full flip." };
 const smallPeriod = 2 * Math.PI * Math.sqrt(L / GRAVITY);
 return { ok: true, length: L, angle: ang, smallPeriod: round2(smallPeriod),
  period: round2(smallPeriod * factor), factor: round2(factor) };
}

/* Animation timing: convert a frame's elapsed milliseconds into a
   clamped dt, then into a whole number of fixed simulation steps.
   A large dt (a tab coming back to the foreground) is capped so the
   simulation does not leap. */
function clampedElapsed(prevNow, now, maxMs) {
 if (prevNow == null || prevNow === undefined) return 0;
 const dt = now - prevNow;
 if (!Number.isFinite(dt) || dt < 0) return 0;
 return Math.min(dt, maxMs);
}
function consumeSteps(accMs, stepMs, maxSteps) {
 let steps = 0, acc = accMs;
 if (!Number.isFinite(acc) || !Number.isFinite(stepMs) || stepMs <= 0 || maxSteps <= 0) return { steps: 0, acc: 0 };
 while (acc >= stepMs && steps < maxSteps) { acc -= stepMs; steps++; }
 if (steps === maxSteps) acc = 0; /* drop leftover after a clamped burst */
 return { steps, acc };
}

/* ---------- The seesaw ---------- */

/* Balance: heavy × its distance = light × its distance. Distances are in
   steps from the middle (the fulcrum). Returns the state in words' worth
   of numbers: both torques and which way it tips. */
function seesaw(heavyKg, heavyDist, lightKg, lightDist) {
 const hk = Number(heavyKg), hd = Number(heavyDist), lk = Number(lightKg), ld = Number(lightDist);
 for (const [n, label] of [[hk, "heavy weight"], [hd, "heavy distance"], [lk, "light weight"], [ld, "light distance"]]) {
  if (!Number.isFinite(n) || n < 0) return { ok: false, error: "The " + label + " needs to be zero or more." };
 }
 const heavyTorque = round2(hk * hd), lightTorque = round2(lk * ld);
 const balanced = heavyTorque === lightTorque;
 return { ok: true, heavyKg: hk, heavyDist: hd, lightKg: lk, lightDist: ld,
  heavyTorque, lightTorque, balanced,
  tips: balanced ? "level" : (heavyTorque > lightTorque ? "heavy" : "light") };
}
/* The distance the light weight must sit at to balance — the bench's trick:
   a small weight far out balances a big weight close in. */
function seesawBalanceDistance(heavyKg, heavyDist, lightKg) {
 const hk = Number(heavyKg), hd = Number(heavyDist), lk = Number(lightKg);
 if (!Number.isFinite(hk) || !Number.isFinite(hd) || !Number.isFinite(lk) || lk <= 0) return null;
 return round2(hk * hd / lk);
}

/* ---------- Flight: paper planes ---------- */

/* Wing loading: the plane's weight spread over its wing area, in grams
   per square decimetre (1 dm² = 100 cm²). It does not predict distance;
   it predicts character — lightly loaded planes fly slowly and float,
   heavily loaded ones must keep their speed up or fall out of the air.
   The bands are this room's rules of thumb for paper planes: under
   2.5 g/dm² slow and floaty, 2.5–4 the steady middle, over 4 fast and
   demanding. Wing areas are the room's own planform estimates for the
   three folds as built from one Letter/A4 sheet, and paper weights are
   the standard basis-weight sums — both stated as about-values on the
   page and in THIRD-PARTY.md. */
const FLIGHT_PLANES = {
 dart: { name: "The Dart", areaDm2: 1.05 },
 glider: { name: "The Glider", areaDm2: 2.7 },
 stunt: { name: "The Stunt plane", areaDm2: 1.1 }
};
const FLIGHT_PAPERS = {
 letter: { name: "US Letter copy paper", grams: 4.5 },
 a4: { name: "A4 copy paper", grams: 5 },
 cardstock: { name: "Cardstock", grams: 10 }
};
function wingLoading(planeKey, paperKey) {
 const plane = FLIGHT_PLANES[planeKey], paper = FLIGHT_PAPERS[paperKey];
 if (!plane) return { ok: false, error: "That plane is not one of this room's three folds." };
 if (!paper) return { ok: false, error: "That paper is not on this bench's shelf." };
 const loading = round2(paper.grams / plane.areaDm2);
 const band = loading < 2.5 ? "floaty" : (loading <= 4 ? "steady" : "fast");
 const character = band === "floaty" ? "slow and floaty" : (band === "steady" ? "the steady middle" : "fast and demanding");
 return { ok: true, plane: plane.name, paper: paper.name, grams: paper.grams,
  areaDm2: plane.areaDm2, loading, band, character };
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { reflectVelocity, angleToSurface, poolStep, collideEqualMass, totalMomentum,
  GRAVITY, projectileRange, projectileFlight, projectileAt,
  pendulumPeriodFactor, pendulumPeriod, seesaw, seesawBalanceDistance,
  FLIGHT_PLANES, FLIGHT_PAPERS, wingLoading,
  clampedElapsed, consumeSteps };
}
