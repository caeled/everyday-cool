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

/* The Physics Game Table: supplied pages integrated 20 November 2026 */
const fs = require("node:fs");
const path = require("node:path");
const gameFiles = [
  "lunar-lander-cave.html", "hill-climb-suspension.html", "jelly-softbody-platformer.html",
  "falling-sand-sandbox.html", "pendulum-grapple-swinger.html", "air-hockey-curl.html",
  "ragdoll-archery-duel.html", "siege-demolition.html", "bridge-builder-truss.html",
  "orbital-pinball.html", "marble-run.html", "orbital-gravity-golf.html",
  "pool-table-physics.html", "docking.html", "stage-it.html", "ballast.html",
];
for (const f of gameFiles)
  assert.ok(fs.existsSync(path.join(__dirname, f)), `the Game Table game ${f} sits beside the table page`);
assert.ok(fs.existsSync(path.join(__dirname, "physics-game-table.html")), "the Game Table page exists");
assert.ok(fs.existsSync(path.join(__dirname, "gravity-well-illustration.jpg")), "the gravity-well illustration exists");
const tableHtml = fs.readFileSync(path.join(__dirname, "physics-game-table.html"), "utf8");
const targets = [...tableHtml.matchAll(/file: '([^']+)'/g)].map((m) => m[1]);
assert.strictEqual(targets.length, 70, "the Game Table names seventy games");
for (const t of targets)
  assert.ok(fs.existsSync(path.resolve(__dirname, t)), `the Game Table target ${t} resolves to a real file`);
assert.ok(tableHtml.includes("The back door — read the lesson"), "every Game Table card carries its back-door lesson link");
const lessonOf = {};
for (const m of tableHtml.matchAll(/file: '([^']+)'(?:,\s*lesson: '([^']+)')?/g))
  lessonOf[m[1]] = m[2] || m[1].replace(".html", "-lesson.html");
for (const t of targets) {
  const lesson = lessonOf[t];
  assert.ok(fs.existsSync(path.resolve(__dirname, lesson)), `the Game Table lesson ${lesson} resolves to a real file`);
}
assert.ok(targets.includes("../everyday-light/laser-mirrors.html"), "the Game Table cross-lists Laser & Mirrors from Everyday Light");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-light/laser-mirrors.html")), "the Laser & Mirrors target resolves to the Light room's game file");
assert.ok(targets.includes("../everyday-sound/tune-the-string.html"), "the Game Table cross-lists Tune the String from Everyday Sound");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-sound/tune-the-string.html")), "the Tune the String target resolves to the Sound room's game file");
assert.ok(targets.includes("../everyday-engineering/shake-table.html"), "the Game Table cross-lists Shake Table from Everyday Engineering");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-engineering/shake-table.html")), "the Shake Table target resolves to the Engineering room's game file");
assert.ok(targets.includes("../everyday-electronics/dont-cook-the-led.html"), "the Game Table cross-lists Don't Cook the LED from Everyday Electronics");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-electronics/dont-cook-the-led.html")), "the Don't Cook the LED target resolves to the Electronics room's game file");
assert.ok(targets.includes("../everyday-computing/wire-the-adder.html"), "the Game Table cross-lists Wire the Adder from Everyday Computing");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-computing/wire-the-adder.html")), "the Wire the Adder target resolves to the Computing room's game file");
assert.ok(targets.includes("../nerd-heaven-tech-support/find-the-fault.html"), "the Game Table cross-lists Find the Fault from Nerd Heaven");
assert.ok(fs.existsSync(path.resolve(__dirname, "../nerd-heaven-tech-support/find-the-fault.html")), "the Find the Fault target resolves to Nerd Heaven's game file");
assert.ok(targets.includes("../a-library/dewey-game.html"), "the Game Table cross-lists Shelf It! from A Library");
assert.ok(fs.existsSync(path.resolve(__dirname, "../a-library/dewey-game.html")), "the Shelf It! target resolves to A Library's game file");
assert.ok(targets.includes("../map-room/go-thataway.html"), "the Game Table cross-lists Go Thataway from the Map Room");
assert.ok(fs.existsSync(path.resolve(__dirname, "../map-room/go-thataway.html")), "the Go Thataway target resolves to the Map Room's game file");
assert.ok(targets.includes("../everyday-chemistry/balance-it.html"), "the Game Table cross-lists Balance It from Everyday Chemistry");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-chemistry/balance-it.html")), "the Balance It target resolves to the Chemistry room's game file");
assert.ok(targets.includes("../secret-squares/pass-it-on.html"), "the Game Table cross-lists Pass It On from Secret Squares");
assert.ok(fs.existsSync(path.resolve(__dirname, "../secret-squares/pass-it-on.html")), "the Pass It On target resolves to the Secret Squares game file");
assert.ok(targets.includes("../packet-playground/route-it.html"), "the Game Table cross-lists Route It from the Packet Playground");
assert.ok(fs.existsSync(path.resolve(__dirname, "../packet-playground/route-it.html")), "the Route It target resolves to the Packet Playground's game file");
assert.ok(targets.includes("../decisions-everywhere/the-boring-bet-wins.html"), "the Game Table cross-lists The Boring Bet Wins from Decisions Everywhere");
assert.ok(fs.existsSync(path.resolve(__dirname, "../decisions-everywhere/the-boring-bet-wins.html")), "the Boring Bet target resolves to the Decisions Everywhere game file");
assert.ok(targets.includes("../satellite-watch/catch-the-pass.html"), "the Game Table cross-lists Catch the Pass from Satellite Watch");
assert.ok(fs.existsSync(path.resolve(__dirname, "../satellite-watch/catch-the-pass.html")), "the Catch the Pass target resolves to the Satellite Watch game file");
assert.ok(targets.includes("../everyday-measure/anchors.html"), "the Game Table cross-lists Anchors from Everyday Measure");
assert.ok(fs.existsSync(path.resolve(__dirname, "../everyday-measure/anchors.html")), "the Anchors target resolves to the Measure room's game file");
assert.ok(targets.includes("../nerd-heaven-tech-support/corrected-by-halves.html"), "the Game Table cross-lists Corrected by Halves from Nerd Heaven");
assert.ok(fs.existsSync(path.resolve(__dirname, "../nerd-heaven-tech-support/corrected-by-halves.html")), "the Corrected by Halves target resolves to Nerd Heaven's game file");
for (const f of [...gameFiles, "physics-game-table.html"]) {
  const src = fs.readFileSync(path.join(__dirname, f), "utf8");
  assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)="https?:\/\//i.test(src), `${f} loads nothing external`);
}
const roomHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(roomHtml.includes('href="physics-game-table.html"'), "the Physics room links to the Game Table");
const gamesHtml = fs.readFileSync(path.join(__dirname, "..", "games-room", "index.html"), "utf8");
assert.ok(gamesHtml.includes('href="../everyday-physics/physics-game-table.html"'), "the Games Room links back to the Game Table");
console.log("everyday-physics tests: Game Table checks passed (16 local games, 70 targets resolve, nothing external, links both ways)");

/* Docking: the room's own orbital-rendezvous game (added 20 November 2026) */
assert.ok(fs.existsSync(path.join(__dirname, "docking.html")), "the Docking game page exists");
const dockingHtml = fs.readFileSync(path.join(__dirname, "docking.html"), "utf8");
assert.ok(!/(?:src|href)="https?:\/\//i.test(dockingHtml), "docking.html loads nothing external");
assert.ok(dockingHtml.includes("<title>Docking — Orbital Rendezvous</title>"), "docking.html carries its title");
console.log("everyday-physics tests: Docking checks passed (page present, self-contained, titled)");

/* Stage It: the Flight section's two-stage rocket game (added 20 November 2026) */
assert.ok(fs.existsSync(path.join(__dirname, "stage-it.html")), "the Stage It game page exists");
const stageItHtml = fs.readFileSync(path.join(__dirname, "stage-it.html"), "utf8");
assert.ok(!/(?:src|href)="https?:\/\//i.test(stageItHtml), "stage-it.html loads nothing external");
assert.ok(stageItHtml.includes("<title>Stage It — a two-stage rocket game · Everyday Physics</title>"), "stage-it.html carries its title");
console.log("everyday-physics tests: Stage It checks passed (page present, self-contained, titled)");

/* Ballast: the room's submarine buoyancy game (added 20 November 2026) */
assert.ok(fs.existsSync(path.join(__dirname, "ballast.html")), "the Ballast game page exists");
const ballastHtml = fs.readFileSync(path.join(__dirname, "ballast.html"), "utf8");
assert.ok(!/(?:src|href)="https?:\/\//i.test(ballastHtml), "ballast.html loads nothing external");
assert.ok(ballastHtml.includes("<title>Ballast — A Submarine Buoyancy Game</title>"), "ballast.html carries its title");
console.log("everyday-physics tests: Ballast checks passed (page present, self-contained, titled)");

console.log("everyday-physics tests: all passed (reflection, equal-mass collisions, ballistics, pendulum, seesaw, flight, timestep)");
