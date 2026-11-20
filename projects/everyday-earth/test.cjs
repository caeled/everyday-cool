"use strict";
const assert = require("node:assert");
const E = require("./earth.js");

function near(actual, expected, tol, msg) {
 assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* The water cycle: four stages, in order, closing the loop */
assert.deepStrictEqual(E.WATER_CYCLE.map((s) => s.id), ["evaporation", "condensation", "precipitation", "collection"], "the cycle runs evaporation, condensation, precipitation, collection");
assert.strictEqual(E.nextStage("evaporation").id, "condensation");
assert.strictEqual(E.nextStage("condensation").id, "precipitation");
assert.strictEqual(E.nextStage("precipitation").id, "collection");
assert.strictEqual(E.nextStage("collection").id, "evaporation", "the loop closes: collection feeds evaporation again");
assert.strictEqual(E.cycleStage("evaporation").name, "Evaporation");
assert.strictEqual(E.cycleStage("nope"), null, "an unknown stage is refused");
assert.ok(E.cycleStage("evaporation").steps.join(" ").includes("90%"), "the USGS moisture share is stated in the evaporation steps");

/* Rocks: nine rocks, three families, three apiece */
assert.strictEqual(E.ROCKS.length, 9, "nine rocks on the sorter");
for (const f of ["Igneous", "Sedimentary", "Metamorphic"]) {
 assert.strictEqual(E.rocksByFamily(f).length, 3, f + " carries three rocks");
 assert.ok(E.ROCK_FAMILIES[f].length > 20, f + " has its birth story");
}
assert.strictEqual(E.rockInfo("Granite").family, "Igneous", "granite is igneous");
assert.strictEqual(E.rockInfo("Basalt").family, "Igneous");
assert.strictEqual(E.rockInfo("Pumice").family, "Igneous");
assert.strictEqual(E.rockInfo("Sandstone").family, "Sedimentary", "sandstone is sedimentary");
assert.strictEqual(E.rockInfo("Limestone").family, "Sedimentary");
assert.strictEqual(E.rockInfo("Shale").family, "Sedimentary");
assert.strictEqual(E.rockInfo("Marble").family, "Metamorphic", "marble is metamorphic — cooked limestone");
assert.strictEqual(E.rockInfo("Slate").family, "Metamorphic");
assert.strictEqual(E.rockInfo("Gneiss").family, "Metamorphic");
assert.strictEqual(E.rockInfo("Unobtainium"), null, "an unknown rock is refused");
assert.ok(E.rockCycle().steps.join(" ").includes("melts back into magma"), "the rock cycle closes through melting");

/* Soil: five horizons, O at the top to R at the bottom */
assert.deepStrictEqual(E.SOIL_HORIZONS.map((h) => h.letter), ["O", "A", "B", "C", "R"], "horizons run O, A, B, C, R");
assert.strictEqual(E.soilHorizon("A").name, "Topsoil", "the A horizon is the topsoil");
assert.strictEqual(E.soilHorizon("R").name, "Bedrock");
assert.strictEqual(E.soilHorizon("Z"), null, "an unknown horizon is refused");

/* The deep Earth: layers at their true depths */
assert.strictEqual(E.EARTH_RADIUS_KM, 6371, "the Earth's radius, in km");
assert.strictEqual(E.depthLayer(0).layer, "Crust", "the surface is crust");
assert.strictEqual(E.depthLayer(3.9).layer, "Crust", "the deepest mine is still in the crust");
assert.strictEqual(E.depthLayer(12.3).layer, "Crust", "the deepest borehole is still in the crust");
assert.strictEqual(E.depthLayer(500).layer, "Mantle");
assert.strictEqual(E.depthLayer(2899).layer, "Mantle");
assert.strictEqual(E.depthLayer(2900).layer, "Outer core", "the outer core starts at 2,900 km");
assert.strictEqual(E.depthLayer(4000).layer, "Outer core");
assert.strictEqual(E.depthLayer(5150).layer, "Inner core", "the inner core starts at 5,150 km");
assert.strictEqual(E.depthLayer(6371).layer, "Inner core", "the centre is inner core");
assert.strictEqual(E.depthLayer(6371).toCenter, 0, "at the centre there is nothing left to go");
near(E.depthLayer(3185.5).pct, 50, 0.11, "halfway down is 50% of the way");
assert.ok(!E.depthLayer(-1).ok && !E.depthLayer(6372).ok && !E.depthLayer(NaN).ok, "outside the planet is refused");

/* Fronts: both kinds, with their weather */
const cold = E.frontInfo("cold");
assert.ok(cold.ok && cold.name === "Cold front");
assert.ok(cold.steps.join(" ").includes("cooler, drier"), "a cold front leaves cooler, drier air behind");
const warm = E.frontInfo("warm");
assert.ok(warm.ok && warm.name === "Warm front");
assert.ok(warm.steps.join(" ").includes("warmer, more humid"), "a warm front leaves warmer air behind");
assert.ok(!E.frontInfo("sideways").ok, "an unknown front is refused");

/* Clouds: the four families a ground-watcher actually uses */
assert.deepStrictEqual(E.CLOUDS.map((c) => c.name), ["Cirrus", "Cumulus", "Stratus", "Cumulonimbus"], "four cloud families");
assert.ok(E.cloudInfo("Cumulonimbus").foretells.includes("go indoors"), "the storm cloud carries the lightning rule");
assert.ok(E.cloudInfo("Cirrus").foretells.includes("Fair weather"), "cirrus means fair, for now");
assert.strictEqual(E.cloudInfo("Nimbostratus"), null, "an unlisted cloud is refused");

/* The barometer: trends by the three-hour rule of thumb */
assert.strictEqual(E.pressureTrend(3).trend, "Rising quickly");
assert.strictEqual(E.pressureTrend(2).trend, "Rising quickly", "the quick-rise boundary");
assert.strictEqual(E.pressureTrend(1).trend, "Rising");
assert.strictEqual(E.pressureTrend(0).trend, "Steady");
assert.strictEqual(E.pressureTrend(-0.5).trend, "Steady");
assert.strictEqual(E.pressureTrend(-1).trend, "Falling");
assert.strictEqual(E.pressureTrend(-2).trend, "Falling quickly", "the quick-fall boundary");
assert.strictEqual(E.pressureTrend(-4).trend, "Falling quickly");
assert.ok(!E.pressureTrend(NaN).ok, "a non-reading is refused");
assert.ok(E.pressureTrend(-3).steps.join(" ").includes("not a forecast service"), "the barometer's honest limit is printed in its own result");

/* Pressure units: the conversion the barometer bench shows */
near(E.hpaToInhg(1013.25), 29.92, 0.01, "standard sea-level pressure is 29.92 inHg");
near(E.inhgToHpa(29.92), 1013.25, 0.5, "and back again");
near(E.inhgToHpa(E.hpaToInhg(980)), 980, 1e-9, "the conversion round-trips");

console.log("everyday-earth tests: all passed (water cycle loop, rock families and sorter, rock cycle, soil horizons, depth layers at true depths, fronts, clouds, barometer trends, pressure conversion)");
