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
   - The seesaw balances when weight × distance matches on both sides. */

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

/* T = 2π√(L/g). Length in metres. Weight and swing width do not appear —
   that absence is the lesson, and the page says so. */
function pendulumPeriod(lengthM) {
 const L = Number(lengthM);
 if (!Number.isFinite(L) || L <= 0) return { ok: false, error: "The string length needs to be a number bigger than zero." };
 return { ok: true, length: L, period: round2(2 * Math.PI * Math.sqrt(L / GRAVITY)) };
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

if (typeof module !== "undefined" && module.exports) {
 module.exports = { reflectVelocity, angleToSurface, poolStep, collideEqualMass, totalMomentum,
  GRAVITY, projectileRange, projectileFlight, projectileAt, pendulumPeriod, seesaw, seesawBalanceDistance };
}
