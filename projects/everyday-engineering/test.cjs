"use strict";
const assert = require("node:assert");
const E = require("./engineering.js");

function near(actual, expected, tol, msg) {
 assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* Lever: MA is the arm ratio, effort is the load over the MA */
let r = E.lever(90, 3, 0.5); // fulcrum half a metre from the crate on a 3 m beam
assert.ok(r.ok);
near(r.loadArm, 0.5, 1e-12, "load arm");
near(r.effortArm, 2.5, 1e-12, "effort arm");
near(r.ma, 5, 1e-12, "MA = 2.5 / 0.5 = 5");
near(r.effortKg, 18, 1e-9, "90 kg crate lifts with 18 kg of push at MA 5");
near(E.lever(90, 3, 1.5).ma, 1, 1e-12, "fulcrum dead centre: MA 1, no help");
near(E.lever(90, 3, 1.5).effortKg, 90, 1e-9, "fulcrum dead centre: full weight");
near(E.lever(60, 2, 0.25).effortKg, 60 / 7, 1e-9, "60 kg, arms 1.75/0.25: MA 7");
assert.ok(r.steps.join(" ").includes("travels"), "the lever states its distance trade");
assert.ok(!E.lever(90, 3, 0).ok, "fulcrum under the crate is refused");
assert.ok(!E.lever(90, 3, 3).ok, "fulcrum at the far end is refused");
assert.ok(!E.lever(-5, 3, 1).ok, "a negative load is refused");

/* Pulley: effort = load / segments, rope = segments x lift */
near(E.pulley(90, 1).effortKg, 90, 1e-12, "1 segment: full weight");
near(E.pulley(90, 2).effortKg, 45, 1e-12, "2 segments: half");
near(E.pulley(90, 3).effortKg, 30, 1e-12, "3 segments: a third");
near(E.pulley(90, 4).effortKg, 22.5, 1e-12, "4 segments: a quarter");
assert.strictEqual(E.pulley(90, 3).ropePerLift, 3, "3 segments: pull 3 m of rope per metre of lift");
assert.ok(E.pulley(90, 3).steps.join(" ").includes("friction"), "the pulley bench names friction");
assert.ok(!E.pulley(90, 0).ok && !E.pulley(90, 5).ok && !E.pulley(90, 2.5).ok, "segment counts outside 1-4 are refused");

/* Ramp: effort = load x sin(angle); the 1:12 standard is about 4.8 degrees */
near(E.ramp(90, 30, 1).effortKg, 45, 1e-9, "90 kg on a 30-degree ramp: sin 30 = 0.5, so 45 kg of push");
assert.ok(!E.ramp(90, 90, 1).ok, "a vertical wall is not a ramp");
near(E.ramp(50, 10, 2).lengthM, 2 / Math.sin(10 * Math.PI / 180), 1e-9, "ramp length is rise / sin(angle)");
const std = E.rampStandard(1);
assert.ok(std.ok);
near(std.runM, 12, 1e-12, "the standard: 1 m of rise runs 12 m");
near(std.angleDeg, 4.7636, 0.001, "1:12 is about 4.8 degrees");
near(E.ramp(90, std.angleDeg, 1).ratio, 12, 0.01, "a ramp at the standard's angle reads back as 1:12");

/* Frames: squares rack, triangles and braced squares hold */
near(E.frameLean("square", 0.3).leanM, 0.3, 1e-12, "the square leans by the full push");
near(E.frameLean("triangle", 0.3).leanM, 0, 1e-12, "the triangle does not lean");
near(E.frameLean("braced", 0.3).leanM, 0, 1e-12, "the braced square does not lean");
assert.ok(!E.frameLean("hexagon", 0.3).ok, "unknown frames are refused");

/* Formatting */
assert.strictEqual(E.fmt(2500), "2,500");
assert.strictEqual(E.fmt(4.7636), "4.764");

console.log("everyday-engineering tests: all passed (lever, pulley 1-4 segments, ramp + 1:12 standard, frames)");
