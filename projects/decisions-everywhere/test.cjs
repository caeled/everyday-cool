const assert = require('node:assert/strict');
const D = require('./app.js');

/* Room 1: every statement's key is one of the five categories, and the
   checker accepts the key and rejects the other four. */
assert.deepEqual(D.CATEGORIES, ['Observation', 'Fact', 'Prediction', 'Opinion', 'Guess']);
assert.equal(D.STATEMENTS.length, 12);
D.STATEMENTS.forEach((s, i) => {
  assert.ok(D.CATEGORIES.includes(s.answer), 'category for statement ' + i);
  assert.ok(D.checkStatement(i, s.answer));
  for (const c of D.CATEGORIES) if (c !== s.answer) assert.ok(!D.checkStatement(i, c));
});

/* Room 2: clues eliminate four distinct causes, leaving the answer. */
assert.equal(D.CLUES.length, 4);
assert.equal(new Set(D.CLUES.map(c => c.eliminates)).size, 4);
assert.ok(!D.CLUES.some(c => c.eliminates === D.FLASHLIGHT_ANSWER));
assert.deepEqual(D.remainingCauses(0), D.CAUSES);
assert.deepEqual(D.remainingCauses(4), [D.FLASHLIGHT_ANSWER]);

/* Room 3: every pair of every product resolves, in either order, and the
   "given up" trait is always the remaining one. */
for (const p of D.PRODUCTS) {
  assert.equal(p.traits.length, 3);
  for (const a of p.traits) for (const b of p.traits) {
    if (a === b) continue;
    const o = D.tradeoffOutcome(p, a, b);
    assert.ok(o, p.name + ' ' + a + '+' + b);
    assert.equal(o.gave, p.traits.find(t => t !== a && t !== b));
  }
}
assert.equal(D.pairKey('Fast', 'Cheap'), 'Cheap|Fast');

/* Room 4: deterministic RNG checks on shape and ranges. */
const zero = () => 0;            /* always heads / ones / A of Spades */
const near = () => 0.999999;     /* always tails / sixes / K of Clubs */
assert.deepEqual(D.flipCoins(3, zero), [true, true, true]);
assert.deepEqual(D.flipCoins(3, near), [false, false, false]);
assert.equal(D.countHeads([true, false, true]), 2);
assert.equal(D.longestRun([true, true, false, true, true, true, false]), 3);
assert.equal(D.longestRun([]), 0);
assert.deepEqual(D.rollDicePairs(2, zero), [[1, 1], [1, 1]]);
assert.deepEqual(D.rollDicePairs(1, near), [[6, 6]]);
assert.deepEqual(D.tallyTotals([[1, 1], [3, 4], [6, 6]]), { 2: 1, 7: 1, 12: 1 });
assert.deepEqual(D.drawCards(1, zero), [{ label: 'A of Spades', red: false }]);
assert.deepEqual(D.drawCards(1, near), [{ label: 'K of Clubs', red: false }]);
assert.equal(D.drawCards(1, () => 0.3)[0].red, true); /* Hearts */

/* Room 7: label bands and verdicts. */
assert.equal(D.confidenceLabel(0), 'Very uncertain');
assert.equal(D.confidenceLabel(24), 'Very uncertain');
assert.equal(D.confidenceLabel(25), 'Some evidence');
assert.equal(D.confidenceLabel(50), 'Strong evidence');
assert.equal(D.confidenceLabel(75), 'Extremely likely');
assert.equal(D.confidenceLabel(100), 'Extremely likely');
const sunrise = D.CLAIMS[0];
assert.equal(D.confidenceVerdict(sunrise, 95), 'inside');
assert.equal(D.confidenceVerdict(sunrise, 10), 'low');
assert.equal(D.confidenceVerdict(D.CLAIMS[2], 100), 'high');

/* Room 6: three scenarios, two options each, three time stops each. */
assert.equal(D.SCENARIOS.length, 3);
for (const s of D.SCENARIOS) {
  assert.equal(s.options.length, 2);
  for (const o of s.options) assert.equal(o.stops.length, 3);
}

/* Room 8: all three budget choices carry a full cycle walk. */
assert.deepEqual(Object.keys(D.LAB).sort(), ['computers', 'internet', 'playground']);
for (const k of Object.keys(D.LAB)) for (const f of ['label', 'see', 'question', 'test']) assert.ok(D.LAB[k][f]);

console.log('Decisions Everywhere logic tests passed.');
