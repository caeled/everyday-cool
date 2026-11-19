"use strict";
const assert = require("node:assert");
const M = require("./measure.js");

function near(actual, expected, tol, msg) {
 assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* The prefix ladder: complete, in order, factors exact */
assert.strictEqual(M.PREFIXES.length, 10, "ten ladder entries (nine prefixes + the base unit)");
const want = [["mega", 6, 1e6], ["kilo", 3, 1e3], ["hecto", 2, 1e2], ["deka", 1, 1e1],
 ["(base unit)", 0, 1], ["deci", -1, 1e-1], ["centi", -2, 1e-2], ["milli", -3, 1e-3],
 ["micro", -6, 1e-6], ["nano", -9, 1e-9]];
want.forEach(([name, power, factor], i) => {
 const p = M.PREFIXES[i];
 assert.strictEqual(p.prefix, name, "ladder order at " + i);
 assert.strictEqual(p.power, power, name + " power");
 near(p.factor, factor, factor * 1e-12, name + " factor");
 near(Math.pow(10, p.power), p.factor, p.factor * 1e-12, name + " factor is 10^power");
 assert.ok(p.meaning.length > 5, name + " says what it means");
});
assert.strictEqual(M.prefixByName("kilo").symbol, "k");
assert.strictEqual(M.prefixByName("centi").meaning, "a hundredth of one");
assert.strictEqual(M.prefixByName("nope"), null);

/* Climbing the ladder */
near(M.rescale(1, "kilo", "(base unit)", "metre").result, 1000, 1e-9, "1 km = 1000 m");
near(M.rescale(250, "centi", "(base unit)", "metre").result, 2.5, 1e-9, "250 cm = 2.5 m");
near(M.rescale(1, "(base unit)", "milli", "metre").result, 1000, 1e-6, "1 m = 1000 mm");
near(M.rescale(3, "kilo", "centi", "metre").result, 300000, 1e-3, "3 km = 300,000 cm");
assert.ok(M.rescale(2.5, "kilo", "centi", "metre").steps.length >= 2, "the climb shows its steps");
assert.ok(!M.rescale("x", "kilo", "centi", "metre").ok, "nonsense is refused");

/* Length: exact definitions */
near(M.convert("length", 1, "in", "cm").result, 2.54, 1e-12, "1 in = 2.54 cm exactly");
near(M.convert("length", 1, "ft", "m").result, 0.3048, 1e-12, "1 ft = 0.3048 m exactly");
near(M.convert("length", 1, "mi", "km").result, 1.609344, 1e-9, "1 mi = 1.609344 km");
near(M.convert("length", 100, "km", "mi").result, 62.1371, 0.001, "100 km = 62.137 mi");
near(M.convert("length", 1, "m", "in").result, 39.3701, 0.0001, "1 m = 39.3701 in");
near(M.convert("length", 12, "in", "ft").result, 1, 1e-9, "12 in = 1 ft");

/* Mass: exact definitions */
near(M.convert("mass", 1, "lb", "g").result, 453.59237, 1e-9, "1 lb = 453.59237 g exactly");
near(M.convert("mass", 1, "lb", "kg").result, 0.45359237, 1e-12, "1 lb = 0.45359237 kg exactly");
near(M.convert("mass", 1, "oz", "g").result, 28.349523125, 1e-9, "1 oz = 28.349523125 g exactly");
near(M.convert("mass", 1, "uston", "lb").result, 2000, 1e-6, "1 US ton = 2000 lb");
near(M.convert("mass", 1, "tonne", "kg").result, 1000, 1e-9, "1 tonne = 1000 kg");
near(M.convert("mass", 1, "tonne", "lb").result, 2204.6226, 0.001, "1 tonne = 2204.62 lb");
near(M.convert("mass", 1, "kg", "lb").result, 2.20462, 0.00001, "1 kg = 2.20462 lb");

/* Volume: exact definitions, and the Imperial trap is real */
near(M.convert("volume", 1, "gal", "L").result, 3.785411784, 1e-9, "1 US gal = 3.785411784 L exactly");
near(M.convert("volume", 1, "gal", "floz").result, 128, 1e-6, "1 US gal = 128 fl oz");
near(M.convert("volume", 1, "floz", "mL").result, 29.5735295625, 1e-9, "1 fl oz = 29.5735295625 mL exactly");
near(M.convert("volume", 1, "cup", "mL").result, 236.588, 0.001, "1 cup = 236.588 mL");
near(M.convert("volume", 1, "impgal", "L").result, 4.54609, 1e-9, "1 Imperial gal = 4.54609 L");
assert.ok(M.convert("volume", 1, "impgal", "L").result > M.convert("volume", 1, "gal", "L").result,
 "the Imperial gallon really is bigger than the US gallon");
near(M.convert("volume", 1, "L", "quart").result, 1.0567, 0.0001, "1 L = 1.057 US quarts (a quart plus a splash)");

/* Temperature: anchors on both scales */
near(M.fToC(72).result, 22.2, 0.05, "72°F = 22.2°C");
near(M.fToC(32).result, 0, 1e-9, "32°F = 0°C");
near(M.fToC(212).result, 100, 1e-9, "212°F = 100°C");
near(M.cToF(37).result, 98.6, 1e-9, "37°C = 98.6°F (body temperature)");
near(M.cToF(-40).result, -40, 1e-9, "-40 is -40 on both scales");
near(M.fToC(-40).result, -40, 1e-9, "-40°F = -40°C");
assert.ok(M.fToC(72).steps.join(" ").includes("5/9"), "the formula is shown");

/* Converters refuse nonsense instead of guessing */
assert.ok(!M.convert("length", "five", "ft", "m").ok);
assert.ok(!M.convert("length", 5, "ft", "furlong").ok);
assert.ok(!M.convert("speed", 5, "ft", "m").ok);

/* The comparison shelf: both readings computed, so they agree */
const pool = M.thingReadings(M.thingById("pool"));
assert.ok(pool.metric.includes("2,500,000"), "pool in litres: " + pool.metric);
assert.ok(pool.us.includes("660,430"), "pool in gallons: " + pool.us);
const elephant = M.thingReadings(M.thingById("elephant"));
assert.ok(elephant.metric.includes("6,000"), "elephant in kg: " + elephant.metric);
assert.ok(elephant.us.includes("13,227.7"), "elephant in lb: " + elephant.us);
const car = M.thingReadings(M.thingById("car"));
assert.ok(car.metric.includes("1,859.7"), "car in kg: " + car.metric);
const field = M.thingReadings(M.thingById("field"));
assert.ok(field.metric.includes("91.44"), "football field in metres: " + field.metric);
for (const t of M.THINGS) {
 const r = M.thingReadings(t);
 assert.ok(r.metric.length > 3 && r.us.length > 3, t.id + " reads in both systems");
 assert.ok(t.note.length > 20, t.id + " carries an honest note");
}

/* Formatting keeps big and small numbers readable */
assert.strictEqual(M.fmt(2500000), "2,500,000");
assert.strictEqual(M.fmt(0.45359237), "0.453592");
assert.strictEqual(M.fmt(1000), "1,000");

console.log("everyday-measure tests: all passed (" + M.PREFIXES.length + " ladder entries, " +
 Object.keys(M.UNITS).length + " converter benches, " + M.THINGS.length + " comparisons)");
