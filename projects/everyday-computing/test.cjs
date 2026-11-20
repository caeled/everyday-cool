"use strict";
const assert = require("node:assert");
const C = require("./computing.js");

function near(actual, expected, tol, msg) {
 assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* Binary: the converter round-trips, both ways */
for (const n of [0, 1, 42, 255]) {
 const b = C.numberToBits(n);
 assert.ok(b.ok, n + " converts to bits");
 assert.strictEqual(b.bits.length, 8, "a byte is eight bits");
 const back = C.bitsToNumber(b.bits);
 assert.ok(back.ok && back.value === n, "round-trip: " + n + " -> " + b.bits.join("") + " -> " + back.value);
}
assert.deepStrictEqual(C.numberToBits(42).bits, [0, 0, 1, 0, 1, 0, 1, 0], "42 is 00101010");
assert.deepStrictEqual(C.numberToBits(255).bits, [1, 1, 1, 1, 1, 1, 1, 1], "255 is all eight switches on");
assert.deepStrictEqual(C.numberToBits(0).bits, [0, 0, 0, 0, 0, 0, 0, 0], "0 is all eight off");
assert.strictEqual(C.bitsToNumber([1, 0, 1]).value, 5, "three bits: 101 is 5 — the finger-counting rule");
assert.strictEqual(C.bitsToNumber([1, 1, 1, 1, 1]).value, 31, "five fingers count to 31");
assert.ok(!C.numberToBits(256).ok && !C.numberToBits(-1).ok && !C.numberToBits(1.5).ok, "outside a byte is refused");
assert.ok(!C.bitsToNumber([0, 2, 1]).ok && !C.bitsToNumber([]).ok, "a non-bit is refused");

/* The gates: every truth table, complete and correct */
const EXPECTED = {
 AND: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
 OR: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
 XOR: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
 NAND: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
 NOR: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]],
 NOT: [[0, 1], [1, 0]]
};
for (const type of C.GATE_ORDER) {
 const t = C.truthTable(type);
 assert.ok(t.ok, type + " has a truth table");
 assert.strictEqual(t.rows.length, EXPECTED[type].length, type + " table is complete");
 t.rows.forEach((row, i) => {
  const exp = EXPECTED[type][i];
  assert.deepStrictEqual(row.ins, exp.slice(0, -1), type + " row " + i + " inputs");
  assert.strictEqual(row.out, exp[exp.length - 1], type + " " + row.ins.join("") + " -> " + exp[exp.length - 1]);
  assert.strictEqual(C.gateEval(type, row.ins).out, row.out, type + " evaluates its own table");
 });
}
assert.ok(!C.gateEval("XNOR", [0, 0]).ok, "an unlisted gate is refused — this room teaches six");
assert.ok(!C.gateEval("AND", [1]).ok && !C.gateEval("NOT", [1, 0]).ok, "the wrong number of inputs is refused");

/* The half adder: all four cases, sum from XOR, carry from AND */
const ADDER = { "00": [0, 0], "01": [1, 0], "10": [1, 0], "11": [0, 1] };
for (const key of Object.keys(ADDER)) {
 const a = Number(key[0]), b = Number(key[1]);
 const r = C.halfAdder(a, b);
 assert.ok(r.ok);
 assert.strictEqual(r.sum, ADDER[key][0], a + " + " + b + ": sum bit");
 assert.strictEqual(r.carry, ADDER[key][1], a + " + " + b + ": carry bit");
 assert.strictEqual(r.carry * 2 + r.sum, a + b, a + " + " + b + " adds up in ordinary numbers too");
}
assert.ok(!C.halfAdder(2, 0).ok, "a non-bit is refused at the adder");

/* The toy net: recognises 101 and only 101, out of all eight patterns */
let lit = 0;
for (let n = 0; n < 8; n++) {
 const bits = [(n >> 2) & 1, (n >> 1) & 1, n & 1];
 const r = C.netDetail(bits[0], bits[1], bits[2]);
 assert.ok(r.ok);
 if (r.out === 1) { lit++; assert.deepStrictEqual(bits, [1, 0, 1], "only 101 lights the lamp"); }
 assert.strictEqual(r.matches, bits.filter((v, i) => v === C.NET_TARGET[i]).length, "the match count is honest for " + bits.join(""));
}
assert.strictEqual(lit, 1, "exactly one of the eight patterns is recognised");
assert.strictEqual(C.netDetail(1, 0, 1).out, 1, "101 is recognised");
assert.strictEqual(C.netDetail(1, 0, 0).matches, 2, "100 is a near miss — two of three");
assert.strictEqual(C.netDetail(0, 1, 0).matches, 0, "010 matches nothing but the quiet middle's opposite");
assert.strictEqual(C.netDetail(1, 0, 1).notB, 1, "the NOT gate flips the quiet middle to 1");
assert.strictEqual(C.netDetail(1, 1, 1).bothEnds, 1, "both ends lit is not enough on its own");
assert.strictEqual(C.netDetail(1, 1, 1).out, 0, "111 fails on the middle bit alone");

/* Bits and sizes: the two ladders, kept honest */
assert.strictEqual(C.bitsFor(1, "byte").bits, 8, "a byte is 8 bits");
assert.strictEqual(C.bitsFor(1, "kilobyte").bits, 8000, "a kilobyte is 1000 bytes — the decimal ladder");
assert.strictEqual(C.bitsFor(1, "kibibyte").bits, 8192, "a kibibyte is 1024 bytes — the binary ladder");
assert.strictEqual(C.bitsFor(1, "megabyte").bits, 8000000);
assert.strictEqual(C.bitsFor(1, "mebibyte").bits, 8388608);
const t8192 = C.sizeTable(8192);
assert.ok(t8192.ok);
near(t8192.rows.find((r) => r.id === "kibibyte").value, 1, 1e-12, "8192 bits is exactly 1 KiB");
near(t8192.rows.find((r) => r.id === "kilobyte").value, 1.024, 1e-12, "and 1.024 KB — the ladders already disagree");
const tera = C.sizeTable(C.bitsFor(1, "terabyte").bits);
near(tera.rows.find((r) => r.id === "tebibyte").value, 0.9095, 0.001, "a terabyte is only about 0.91 tebibytes");
assert.ok(!C.bitsFor(-1, "byte").ok && !C.bitsFor(1, "parsec").ok, "nonsense sizes are refused");

/* Sorting: one pass at a time, then the whole job */
const start = [5, 2, 4, 1, 3];
const p1 = C.bubblePass(start);
assert.ok(p1.ok);
assert.deepStrictEqual(p1.result, [2, 4, 1, 3, 5], "one pass bubbles the 5 to the end");
assert.deepStrictEqual(start, [5, 2, 4, 1, 3], "the pass does not touch the visitor's row");
const sorted = C.bubbleSort(start);
assert.deepStrictEqual(sorted.result, [1, 2, 3, 4, 5], "the full sort sorts");
assert.deepStrictEqual(C.bubbleSort([1, 2, 3]).result, [1, 2, 3], "a sorted row stays sorted");
assert.deepStrictEqual(C.bubbleSort([3, 3, 1]).result, [1, 3, 3], "equal cards are handled");
assert.ok(!C.bubblePass([1, "x"]).ok, "a non-number card is refused");

/* The logic builder: a two-gate circuit, evaluated on every input case */
{
 const c = C.newCircuit();
 const gAnd = C.addGate(c, "AND"), gNot = C.addGate(c, "NOT"), lamp = C.addLamp(c);
 C.connect(c, { gate: gAnd, slot: 0 }, { switch: "A" });
 C.connect(c, { gate: gAnd, slot: 1 }, { switch: "B" });
 C.connect(c, { gate: gNot, slot: 0 }, { gate: gAnd });
 C.connect(c, { lamp }, { gate: gNot });
 const NAND = { "00": 1, "01": 1, "10": 1, "11": 0 };
 for (const key of Object.keys(NAND)) {
  const r = C.evaluateCircuit(c, { A: Number(key[0]), B: Number(key[1]) });
  assert.strictEqual(r.lamps[lamp], NAND[key], "AND into NOT is NAND at " + key);
 }
}
/* The logic builder: XOR built from AND/OR/NOT, on every input case */
{
 const c = C.xorCircuit();
 const lamp = c.lamps[0].id;
 const XOR = { "00": 0, "01": 1, "10": 1, "11": 0 };
 for (const key of Object.keys(XOR)) {
  const r = C.evaluateCircuit(c, { A: Number(key[0]), B: Number(key[1]) });
  assert.strictEqual(r.lamps[lamp], XOR[key], "the built XOR answers " + key + " -> " + XOR[key]);
 }
 assert.strictEqual(c.gates.length, 4, "the XOR trick takes four gates: OR, AND, NOT, AND");
}
/* The builder's honest edges: loose wires, loops, and removal */
{
 const c = C.newCircuit();
 const g = C.addGate(c, "AND"), lamp = C.addLamp(c);
 C.connect(c, { gate: g, slot: 0 }, { switch: "A" });
 C.connect(c, { lamp }, { gate: g });
 const r = C.evaluateCircuit(c, { A: 1 });
 assert.strictEqual(r.lamps[lamp], 0, "an unwired input reads 0, so a half-wired AND stays dark");
 const c2 = C.newCircuit();
 const n = C.addGate(c2, "NOT"), lamp2 = C.addLamp(c2);
 C.connect(c2, { gate: n, slot: 0 }, { gate: n });
 C.connect(c2, { lamp: lamp2 }, { gate: n });
 const r2 = C.evaluateCircuit(c2, { A: 1 });
 assert.strictEqual(r2.lamps[lamp2], null, "a gate wired to itself can never settle — reported, not guessed");
 const c3 = C.newCircuit();
 const a1 = C.addGate(c3, "OR"), a2 = C.addGate(c3, "AND"), lamp3 = C.addLamp(c3);
 C.connect(c3, { gate: a2, slot: 0 }, { gate: a1 });
 C.connect(c3, { lamp: lamp3 }, { gate: a2 });
 C.removeGate(c3, a1);
 assert.strictEqual(C.findGate(c3, a2).ins[0], null, "removing a gate unwires everything it fed");
 assert.ok(!C.connect(c3, { gate: a2, slot: 0 }, { switch: "Z" }).ok, "a switch that does not exist is refused");
 assert.ok(!C.addGate(c3, "XNOR"), "a gate the room does not teach cannot be placed");
}

console.log("everyday-computing tests: all passed (binary round-trips 0/1/42/255, all six truth tables, half adder ×4, toy net across all 8 patterns, the two size ladders, bubble sort, builder: NAND chain, XOR from AND/OR/NOT ×4, loose wires, feedback loop, gate removal)");
