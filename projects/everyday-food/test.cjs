"use strict";
const assert = require("node:assert");
const F = require("./food.js");

/* The tongue, audited: five tastes, four regions, no walls */
assert.strictEqual(F.TASTES.length, 5, "five tastes");
assert.strictEqual(F.TONGUE_REGIONS.length, 4, "four regions");
for (const taste of F.TASTES) {
  for (const region of F.TONGUE_REGIONS) {
    const v = taste.sensitivity[region.id];
    assert.ok(typeof v === "number" && v >= 0.6 && v <= 1,
      taste.id + " is sensed at the " + region.id + " (got " + v + ") — the audit's point: everywhere, never near zero");
  }
}
const peak = (t) => F.TONGUE_REGIONS.reduce((a, r) => (t.sensitivity[r.id] > t.sensitivity[a] ? r.id : a), F.TONGUE_REGIONS[0].id);
assert.strictEqual(peak(F.tasteById("bitter")), "back", "bitter leans to the back — the last checkpoint before swallowing");
assert.strictEqual(peak(F.tasteById("sweet")), "tip", "sweet leans to the tip");
assert.ok(peak(F.tasteById("sour")) === "back-edges" || peak(F.tasteById("sour")) === "front-edges", "sour leans to the edges");
assert.strictEqual(F.tasteById("umami").name, "Umami", "umami is on the panel");

/* Bitter + sweet: every dish is a negotiation */
assert.strictEqual(F.DISHES.length, 5, "five dishes on the bench");
for (const dish of F.DISHES) {
  assert.deepStrictEqual(Object.keys(dish.profile).sort(), [...F.FLAVOUR_AXES].sort(),
    dish.id + " carries exactly the five axes");
  for (const axis of F.FLAVOUR_AXES) {
    const v = dish.profile[axis];
    assert.ok(Number.isInteger(v) && v >= 0 && v <= 10, dish.id + "'s " + axis + " is a 0–10 value (got " + v + ")");
  }
  assert.ok(dish.profile.bitter >= 2 && dish.profile.sweet >= 2,
    dish.id + " has bitter AND sweet on the table — the negotiation the bench exists to show");
  assert.ok(dish.why.length > 40 && dish.lever.length > 20, dish.id + " explains itself and names its lever");
}
assert.ok(F.dishById("dark-chocolate").profile.bitter > F.dishById("dark-chocolate").profile.sweet,
  "in dark chocolate the bitter leads and the sweet mediates");
assert.ok(F.dishById("salted-caramel").profile.sweet > F.dishById("salted-caramel").profile.bitter,
  "in salted caramel the sweet leads and the salt mediates the bitter");

/* The coal bench, against the published chart (Fears / Chuckwagon Supply) */
assert.deepStrictEqual(F.dutchOvenCoals(12, 325), { top: 15, bottom: 9, total: 24 }, "12-inch at 325 °F: 15 top / 9 bottom");
assert.deepStrictEqual(F.dutchOvenCoals(12, 350), { top: 16, bottom: 10, total: 26 }, "12-inch at 350 °F: 16 top / 10 bottom");
assert.deepStrictEqual(F.dutchOvenCoals(12, 300), { top: 14, bottom: 8, total: 22 }, "12-inch at 300 °F: 14 top / 8 bottom");
assert.deepStrictEqual(F.dutchOvenCoals(12, 375), { top: 17, bottom: 11, total: 28 }, "12-inch at 375 °F: 17 top / 11 bottom");
assert.deepStrictEqual(F.dutchOvenCoals(10, 325), { top: 13, bottom: 7, total: 20 }, "10-inch at 325 °F: diameter + 3 / − 3");
assert.deepStrictEqual(F.dutchOvenCoals(14, 350), { top: 18, bottom: 12, total: 30 }, "14-inch at 350 °F");
assert.deepStrictEqual(F.dutchOvenCoals(8, 300), { top: 10, bottom: 4, total: 14 }, "8-inch at 300 °F");
for (const size of F.DUTCH_OVEN_SIZES) {
  const at325 = F.dutchOvenCoals(size, 325);
  assert.strictEqual(at325.top, size + 3, size + "-inch at 325 °F: top is diameter + 3");
  assert.strictEqual(at325.bottom, size - 3, size + "-inch at 325 °F: bottom is diameter − 3");
  for (let i = 1; i < F.DUTCH_OVEN_TEMPS.length; i++) {
    const prev = F.dutchOvenCoals(size, F.DUTCH_OVEN_TEMPS[i - 1]);
    const cur = F.dutchOvenCoals(size, F.DUTCH_OVEN_TEMPS[i]);
    assert.strictEqual(cur.top - prev.top, 1, "+25 °F adds one coal on top (" + size + "-inch)");
    assert.strictEqual(cur.bottom - prev.bottom, 1, "+25 °F adds one coal underneath (" + size + "-inch)");
  }
}
assert.strictEqual(F.dutchOvenCoals(12, 500), null, "off-chart temperature is refused, not invented");
assert.strictEqual(F.dutchOvenCoals(9, 325), null, "off-chart size is refused, not invented");

/* Food plants: the discipline, checked as data */
assert.strictEqual(F.PLANTS.length, 6, "six plants taught");
const ids = new Set();
for (const plant of F.PLANTS) {
  assert.ok(!ids.has(plant.id), plant.id + " appears once"); ids.add(plant.id);
  assert.ok(plant.marks.length >= 4, plant.id + " demands at least four agreeing marks (got " + plant.marks.length + ")");
  assert.ok(plant.season.start >= 1 && plant.season.end <= 12 && plant.season.start <= plant.season.end,
    plant.id + "'s season is a sane month range");
  assert.ok(plant.part && plant.bestMonths, plant.id + " names its part and its best months");
  assert.ok(plant.lookalike.name && plant.lookalike.note.length > 40, plant.id + " names its look-alike and the distinguishing mark");
  assert.ok(plant.caution.length > 30, plant.id + " carries a real caution");
}
assert.strictEqual(F.monthName(3), "March", "month names line up");
assert.strictEqual(F.monthName(13), null, "there is no thirteenth month");
assert.strictEqual(F.plantById("cattail").id, "cattail", "plants are findable by id");
assert.strictEqual(F.plantById("hemlock"), null, "what is not taught is not findable — the section's whole point");

console.log("Everyday Food: all rule tests passed");
