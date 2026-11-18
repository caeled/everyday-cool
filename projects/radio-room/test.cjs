"use strict";
const assert = require("node:assert");
const R = require("./radio.js");

/* Presets: a real, tidy set */
assert.ok(R.PRESETS.length >= 5, "at least five playable presets");
const ids = R.PRESETS.map(p => p.id);
assert.strictEqual(new Set(ids).size, ids.length, "preset ids are unique");
for (const p of R.PRESETS) {
 assert.ok(p.name && p.blurb, "preset has a name and a blurb: " + p.id);
 assert.ok(/^https:\/\/ice1\.somafm\.com\/[a-z0-9]+-128-mp3$/.test(p.stream),
  "stream is a verified SomaFM address: " + p.id);
 assert.ok(p.freq >= R.DIAL_MIN && p.freq <= R.DIAL_MAX, "freq sits on the dial: " + p.id);
}
/* Frequencies rise left to right, so the needle only ever travels sensibly */
const freqs = R.PRESETS.map(p => p.freq);
assert.deepStrictEqual(freqs, [...freqs].sort((a, b) => a - b), "frequencies are in dial order");

/* Needle maths */
assert.strictEqual(R.needlePercent(R.DIAL_MIN), 0);
assert.strictEqual(R.needlePercent(R.DIAL_MAX), 100);
assert.ok(Math.abs(R.needlePercent(98) - 50) < 1e-9, "mid-band is mid-dial");
assert.strictEqual(R.needlePercent(80), 0, "below the band clamps to the left end");
assert.strictEqual(R.needlePercent(120), 100, "above the band clamps to the right end");
assert.strictEqual(R.needlePercent("loud"), 0, "nonsense input parks the needle");

/* Lookup and the tuning knob's walk */
assert.strictEqual(R.stationById("lush").name, "Lush");
assert.strictEqual(R.stationById("nope"), null);
assert.strictEqual(R.nextStation("lush").id, "secret-agent");
assert.strictEqual(R.nextStation(R.PRESETS[R.PRESETS.length - 1].id).id, R.PRESETS[0].id,
 "tuning past the last station wraps to the first");
assert.strictEqual(R.nextStation("nope").id, R.PRESETS[0].id);

/* The dial window's wording */
assert.strictEqual(R.dialReadout(R.stationById("lush")), "92.3 · Lush");
assert.ok(R.dialReadout(null).includes("pick a station"));

/* The Scanner Tuner: a finder with baked Ohio county links, no API */
assert.strictEqual(Object.keys(R.OHIO_COUNTY_IDS).length, 88, "all 88 Ohio counties are baked in");
for (const [name, id] of Object.entries(R.OHIO_COUNTY_IDS))
 assert.ok(Number.isInteger(id) && id > 0, "county id is a plain number: " + name);
assert.strictEqual(R.HOME_COUNTY, "Defiance");
assert.strictEqual(R.ohioCountyUrl("Defiance"), "https://www.broadcastify.com/listen/ctid/2059");
assert.strictEqual(R.ohioCountyUrl("Defiance County"), "https://www.broadcastify.com/listen/ctid/2059",
 "Nominatim's 'X County' wording resolves too");
assert.strictEqual(R.ohioCountyUrl("Cook"), null, "a county outside the baked map has no link");
assert.strictEqual(R.tidyCountyName("Van Wert County"), "Van Wert");
assert.strictEqual(R.tidyCountyName(42), "");
assert.deepStrictEqual(R.scannerTarget("Lucas", "Ohio"),
 { url: "https://www.broadcastify.com/listen/ctid/2087", level: "county" });
assert.deepStrictEqual(R.scannerTarget("", "Ohio"),
 { url: R.BROADCASTIFY_OHIO, level: "state" }, "Ohio without a known county falls back to the state page");
assert.deepStrictEqual(R.scannerTarget("Cook", "Illinois"),
 { url: R.BROADCASTIFY_BROWSE, level: "browse" }, "anywhere else falls back to Broadcastify's front door");
assert.deepStrictEqual(R.scannerTarget("", ""),
 { url: R.BROADCASTIFY_BROWSE, level: "browse" });

console.log("radio-room tests: all passed (" + R.PRESETS.length + " presets, " +
 Object.keys(R.OHIO_COUNTY_IDS).length + " scanner counties)");
