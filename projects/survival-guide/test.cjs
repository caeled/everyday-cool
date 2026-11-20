"use strict";
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const K = require("./knots.js");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const knotsSrc = fs.readFileSync(path.join(__dirname, "knots.js"), "utf8");
const appSrc = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

/* Both scripts parse, and knots.js pulls in nothing external */
new vm.Script(knotsSrc); // throws on a syntax error
new vm.Script(appSrc);
assert.ok(!/https?:\/\//.test(knotsSrc), "knots.js references no external asset");
assert.ok(html.includes('src="knots.js"'), "the page loads knots.js");
assert.ok(html.indexOf('src="knots.js"') < html.indexOf('src="app.js"'),
  "knots.js loads before app.js, so the data is there when the component runs");
assert.ok(appSrc.includes("data-knot-steps"), "app.js wires the step-through mounts");
assert.ok(appSrc.includes("Watch it tie"), "app.js builds the Watch-it-tie replay");

/* The knots section, card by card: text steps are the spec */
const secStart = html.indexOf('<section id="knots">');
assert.ok(secStart >= 0, "the knots section exists");
const sec = html.slice(secStart, html.indexOf("</section>", secStart));

/* Expected text-step counts, read off the cards as written. The rope
   card teaches no tying sequence, so it gets no viewer and no data. */
const EXPECTED = {
  rope: 0, square: 3, bowline: 5, "figure-eight": 4, "taut-line": 4,
  clove: 3, "half-hitches": 3, sheet: 5, truckers: 5, lashing: 4
};

for (const key of Object.keys(EXPECTED)) {
  const cardStart = sec.indexOf('<div class="card" id="knot-' + key + '">');
  assert.ok(cardStart >= 0, "card knot-" + key + " exists");
  const nextCard = sec.indexOf('<div class="card"', cardStart + 10);
  const card = sec.slice(cardStart, nextCard < 0 ? sec.length : nextCard);
  const ol = card.match(/<ol>([\s\S]*?)<\/ol>/);
  const steps = ol ? (ol[1].match(/<li>/g) || []).length : 0;
  assert.strictEqual(steps, EXPECTED[key],
    "knot-" + key + " carries " + EXPECTED[key] + " numbered text steps");
  const mounts = (card.match(new RegExp('data-knot-steps="' + key + '"', "g")) || []).length;
  if (EXPECTED[key] === 0) {
    assert.strictEqual(mounts, 0, "the rope card has no step-through viewer");
    assert.strictEqual(K.knotStepthrough(key), null, "no stage data exists for the rope card");
  } else {
    assert.strictEqual(mounts, 1, "knot-" + key + " has exactly one viewer mount");
    const data = K.knotStepthrough(key);
    assert.ok(data, "stage data exists for " + key);
    assert.strictEqual(data.stages.length, steps,
      key + ": the viewer's stage count equals the card's text-step count (" + steps + ")");
  }
}
assert.deepStrictEqual(Object.keys(K.KNOT_STEPTHROUGHS).sort(),
  Object.keys(EXPECTED).filter((k) => EXPECTED[k] > 0).sort(),
  "stage data exists for exactly the nine tying cards, no more, no fewer");

/* Stage data integrity: real scenes, valid elements, in order */
const KINDS = ["r", "b", "p", "o", "e", "a", "d", "t"];
const ROLES = ["stand", "work", "frap", "post", "pole"];
for (const [key, data] of Object.entries(K.KNOT_STEPTHROUGHS)) {
  data.stages.forEach((stage, i) => {
    const where = key + " stage " + (i + 1);
    assert.ok(Array.isArray(stage) && stage.length >= 2, where + " is a real scene, not a stub");
    assert.ok(stage.some((el) => el.c === "work" || el.c === "frap"),
      where + " shows the working rope");
    for (const el of stage) {
      const kinds = KINDS.filter((k) => k in el);
      assert.strictEqual(kinds.length, 1, where + ": each element is exactly one kind");
      if (el.c !== undefined) assert.ok(ROLES.includes(el.c), where + ": known colour role " + el.c);
      if (el.p !== undefined) {
        assert.ok(/^M-?[\d.]/.test(el.p), where + ": path opens with an absolute moveto");
        assert.ok(!/[a-z]/.test(el.p.replace(/^M/, "")), where + ": path uses absolute commands only");
      }
      /* Every number in the element is a coordinate, a size, or a
         stroke width — all of them must sit inside (or barely
         outside) the shared 320x200 viewBox. */
      const nums = JSON.stringify(el).match(/-?\d+\.?\d*/g).map(Number);
      for (const n of nums) {
        assert.ok(n >= -12 && n <= 332, where + ": coordinate " + n + " stays in the viewBox");
      }
    }
    if (i > 0) {
      assert.notStrictEqual(JSON.stringify(stage), JSON.stringify(data.stages[i - 1]),
        where + " advances from the stage before it — no repeated stages");
    }
  });
}

console.log("survival-guide test.cjs: all assertions passed — " +
  Object.keys(K.KNOT_STEPTHROUGHS).length + " step-through viewers, " +
  Object.values(K.KNOT_STEPTHROUGHS).reduce((n, d) => n + d.stages.length, 0) +
  " stages, each keyed 1:1 to its card's numbered steps.");
