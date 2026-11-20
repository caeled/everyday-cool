"use strict";
const assert = require("node:assert");
const P = require("./phys.js");
const near = (a, b, tol = 0.011) => Math.abs(a - b) <= tol;

/* Reflection: angle in = angle out, on both axes */
let r = P.reflectVelocity(3, 4, "x");
assert.deepStrictEqual(r, { vx: -3, vy: 4 }, "a left/right cushion flips the x part only");
assert.strictEqual(P.angleToSurface(3, 4, "vertical"), P.angleToSurface(-3, 4, "vertical"),
 "the angle to a vertical cushion is the same in and out");
r = P.reflectVelocity(3, 4, "y");
assert.deepStrictEqual(r, { vx: 3, vy: -4 }, "a top/bottom cushion flips the y part only");
assert.strictEqual(P.angleToSurface(3, 4, "horizontal"), P.angleToSurface(3, -4, "horizontal"),
 "the angle to a horizontal cushion is the same in and out");
assert.strictEqual(P.angleToSurface(1, 0, "vertical"), 90, "head-on into a vertical cushion makes 90 degrees with its surface");
assert.strictEqual(P.angleToSurface(0, 5, "vertical"), 0, "skimming along a vertical cushion makes 0 degrees with its surface");

/* poolStep: a bounce off the right cushion mirrors the velocity */
const table = { left: 0, top: 0, right: 200, bottom: 100 };
let b = P.poolStep({ x: 196, y: 50, vx: 10, vy: 3, r: 10 }, table, 0);
assert.strictEqual(b.bounce, "right", "the right cushion is named");
assert.ok(b.vx === -10 && b.vy === 3, "the bounce mirrors x and keeps y");
assert.ok(b.x <= 190, "the ball is back inside the cushion");
let f = P.poolStep({ x: 50, y: 50, vx: 10, vy: 0, r: 10 }, table, 0.02);
assert.ok(near(f.vx, 9.8, 1e-9), "friction takes its steady share each frame");

/* Equal-mass elastic collisions */
let hit = P.collideEqualMass({ x: 0, y: 0, vx: 6, vy: 0 }, { x: 20, y: 0, vx: 0, vy: 0 });
assert.ok(near(hit.a.vx, 0) && near(hit.a.vy, 0), "head-on: the moving ball stops dead");
assert.ok(near(hit.b.vx, 6) && near(hit.b.vy, 0), "head-on: the still ball takes the whole velocity");
/* Glancing blow: centres offset, momentum conserved, parts exchanged along the line only */
const A = { x: 0, y: 0, vx: 5, vy: 1 }, B = { x: 16, y: 12, vx: -1, vy: 2 };
const before = P.totalMomentum([A, B]);
hit = P.collideEqualMass(A, B);
assert.ok(hit, "an approaching pair collides");
const after = P.totalMomentum([{ vx: hit.a.vx, vy: hit.a.vy }, { vx: hit.b.vx, vy: hit.b.vy }]);
assert.ok(near(after.px, before.px, 1e-9) && near(after.py, before.py, 1e-9), "momentum is conserved in a glancing hit");
const ke = (v) => v.vx * v.vx + v.vy * v.vy;
assert.ok(near(ke(hit.a) + ke(hit.b), ke(A) + ke(B), 1e-9), "kinetic energy is conserved (elastic, equal masses)");
assert.strictEqual(P.collideEqualMass({ x: 0, y: 0, vx: -6, vy: 0 }, { x: 20, y: 0, vx: 0, vy: 0 }), null,
 "a separating pair is not a collision");

/* Ballistics: R = v^2 sin(2θ)/g, and 45° beats 30° and 60° at the same speed */
assert.ok(near(P.projectileRange(20, 45), (400 / 9.8), 0.011), "20 m/s at 45°: R = v²/g ≈ 40.82 m");
assert.strictEqual(P.projectileRange(20, 30), P.projectileRange(20, 60), "30° and 60° land at the same range");
assert.ok(P.projectileRange(20, 45) > P.projectileRange(20, 30), "45° goes farthest at the same speed");
assert.ok(P.projectileRange(20, 45) > P.projectileRange(20, 60), "45° beats 60° too");
let fl = P.projectileFlight(20, 45);
assert.ok(fl.ok && near(fl.apex, 10.2, 0.011) && near(fl.flightTime, 2.89, 0.011), "apex and flight time for 20 m/s at 45°");
let mid = P.projectileAt(20, 45, fl.flightTime / 2);
assert.ok(near(mid.y, fl.apex, 0.05), "halfway through the flight the ball is at the top");
assert.ok(near(P.projectileAt(20, 45, fl.flightTime).y, 0, 0.05), "at the flight time the ball is back at ground height");
assert.ok(!P.projectileFlight(0, 45).ok && !P.projectileFlight(20, 120).ok, "bad speed and bad angle are refused");

/* Pendulum: T = 2π√(L/g) for a small swing; wider swings run long */
let p = P.pendulumPeriod(1);
assert.ok(p.ok && near(p.period, 2.01, 0.011), "a 1 m pendulum swings with a period of about 2.01 s");
assert.ok(near(P.pendulumPeriod(0.25).period, 1.0, 0.011), "a quarter of the length, half the period (about 1.00 s)");
assert.ok(P.pendulumPeriod(4).period > P.pendulumPeriod(1).period, "a longer string swings slower");
assert.ok(!P.pendulumPeriod(0).ok, "zero length is refused");
assert.ok(near(P.pendulumPeriodFactor(0), 1, 1e-12), "zero amplitude is the small-swing factor of 1");
assert.ok(near(P.pendulumPeriodFactor(60), 1.07318, 0.0002), "a 60° swing's period factor is about 1.0732");
assert.ok(P.pendulumPeriod(1, 60).period > P.pendulumPeriod(1, 12).period,
 "a 60° swing runs longer than a 12° swing on the same string");
assert.ok(P.pendulumPeriod(1, 12).period >= P.pendulumPeriod(1).period,
 "a 12° swing is at least as long as the small-swing formula");
assert.ok(near(P.pendulumPeriod(1, 60).period, 2.15, 0.02), "1 m at 60° is about 2.15 s");
assert.ok(!P.pendulumPeriod(1, 180).ok && !P.pendulumPeriod(1, -5).ok, "flip-or-past and negative angles are refused");

/* Animation timestep: large dt is clamped; leftover after a burst is dropped */
assert.strictEqual(P.clampedElapsed(null, 5000, 100), 0, "the first frame has no elapsed time");
assert.strictEqual(P.clampedElapsed(0, 40, 100), 40, "a short frame passes through");
assert.strictEqual(P.clampedElapsed(0, 5000, 100), 100, "a tab-resume gap is clamped");
assert.strictEqual(P.clampedElapsed(200, 100, 100), 0, "a backwards clock is ignored");
const stepMs = 1000 / 60;
let stepped = P.consumeSteps(6 * stepMs + 10, stepMs, 6);
assert.strictEqual(stepped.steps, 6, "a burst longer than six steps runs at most six 1/60 s steps");
assert.strictEqual(stepped.acc, 0, "leftover time after a burst is dropped so the sim does not catch up in a leap");
stepped = P.consumeSteps(20, stepMs, 6);
assert.strictEqual(stepped.steps, 1, "20 ms is one 1/60 s step");
assert.ok(near(stepped.acc, 20 - stepMs, 1e-9), "the leftover stays in the accumulator");

/* Seesaw: torque = weight × distance */
let s = P.seesaw(40, 1, 20, 2);
assert.ok(s.ok && s.balanced && s.tips === "level", "40 kg at 1 step balances 20 kg at 2 steps");
s = P.seesaw(40, 2, 20, 2);
assert.ok(!s.balanced && s.tips === "heavy", "the heavy side wins when its torque is bigger");
assert.strictEqual(P.seesawBalanceDistance(40, 1, 20), 2, "the light weight balances at twice the distance");
assert.strictEqual(P.seesawBalanceDistance(60, 1, 20), 3, "three times the weight needs three times the distance");
assert.ok(!P.seesaw(-1, 1, 20, 2).ok, "negative weights are refused");

/* Flight: wing loading = the sheet's grams ÷ the fold's wing area in dm² */
let w = P.wingLoading("glider", "letter");
assert.ok(w.ok && near(w.loading, 1.67, 0.011), "the Glider on US Letter: 4.5 g over 2.7 dm² loads at 1.67 g/dm²");
assert.strictEqual(w.band, "floaty", "1.67 g/dm² is in the slow-and-floaty band");
assert.ok(near(P.wingLoading("dart", "letter").loading, 4.29, 0.011), "the Dart on US Letter: 4.5 g over 1.05 dm² loads at 4.29 g/dm²");
assert.strictEqual(P.wingLoading("dart", "letter").band, "fast", "4.29 g/dm² is in the fast-and-demanding band");
assert.ok(near(P.wingLoading("glider", "cardstock").loading, 3.7, 0.011), "the Glider on cardstock: 10 g over 2.7 dm² loads at 3.70 g/dm²");
assert.strictEqual(P.wingLoading("glider", "cardstock").band, "steady", "3.70 g/dm² is in the steady-middle band");
assert.ok(P.wingLoading("dart", "cardstock").loading > P.wingLoading("dart", "letter").loading,
 "heavier paper loads the same wings more");
assert.ok(P.wingLoading("glider", "a4").loading > P.wingLoading("glider", "letter").loading,
 "an A4 sheet is a touch heavier than US Letter, so the loading rises");
assert.ok(!P.wingLoading("rocket", "letter").ok && !P.wingLoading("dart", "tissue").ok,
 "an unknown plane and an unknown paper are refused");

console.log("everyday-physics tests: all passed (reflection, equal-mass collisions, ballistics, pendulum, seesaw, flight, timestep)");
