"use strict";
/* Everyday Computing — pure rules. No DOM: test.cjs checks this file
   directly. Every bench on the page reads the data and functions below,
   so the page and the tests can never drift apart. The room's one rule:
   the logic on this page is correct and tested — every truth table,
   every adder case, every circuit the builder evaluates. (The one
   picture on the page whose labels are wrong is labelled as wrong;
   see the gates section.) */

/* ---- Counting in twos: bits and place values ----
   A bit is one two-way choice: 0 or 1, off or on. Eight bits side by
   side are a byte, and their places are worth powers of two — 128, 64,
   32, 16, 8, 4, 2, 1 — so a byte holds every number from 0 to 255.
   The same rule counts on fingers: one hand is five bits, 0 to 31. */
function isBit(v) { return v === 0 || v === 1; }
function bitsToNumber(bits) {
 if (!Array.isArray(bits) || bits.length < 1 || bits.length > 16 || !bits.every(isBit)) return { ok: false };
 let n = 0;
 for (const b of bits) n = n * 2 + b;
 return { ok: true, bits: bits.slice(), value: n, steps: [
  "Read the places from the left: " + bits.map((b, i) => Math.pow(2, bits.length - 1 - i)).join(", ") + ".",
  "Add up the places where the bit is 1: " + (bits.map((b, i) => b ? Math.pow(2, bits.length - 1 - i) : null).filter((v) => v !== null).join(" + ") || "none — the number is 0") + ".",
  bits.join("") + " in binary is " + n + " in ordinary counting."] };
}
function numberToBits(n, width) {
 const w = width || 8;
 if (!Number.isInteger(n) || n < 0 || n >= Math.pow(2, w)) return { ok: false };
 const bits = [];
 for (let p = w - 1; p >= 0; p--) { const place = Math.pow(2, p); if (n >= place) { bits.push(1); n -= place; } else bits.push(0); }
 return { ok: true, bits, steps: [
  "Take the biggest place that fits, mark it 1, and subtract; keep going down the places.",
  "The result, in " + w + " bits: " + bits.join("") + "."] };
}

/* ---- The gates: six little rules ----
   A gate reads one or two bits and answers one bit, by a rule with no
   exceptions and no judgement. AND, OR, and NOT are the basics; XOR is
   the difference-detector; NAND and NOR are AND and OR with a NOT
   bolted on — and either one alone can build all the others, which is
   why real chips are full of them. */
const GATES = {
 AND: { name: "AND", inputs: 2, plain: "Both, or nothing", fn: (a, b) => a & b,
  rule: "The output is 1 only when both inputs are 1. One 0 anywhere closes it." },
 OR: { name: "OR", inputs: 2, plain: "Either will do", fn: (a, b) => a | b,
  rule: "The output is 1 when at least one input is 1. Only two 0s close it." },
 XOR: { name: "XOR", inputs: 2, plain: "The difference detector", fn: (a, b) => a ^ b,
  rule: "The output is 1 when the inputs are different — one or the other, but not both. It answers the question: did something change?" },
 NAND: { name: "NAND", inputs: 2, plain: "AND, flipped", fn: (a, b) => 1 - (a & b),
  rule: "AND with its answer flipped: the output is 0 only when both inputs are 1. Real chips are built from this one gate by the billion." },
 NOR: { name: "NOR", inputs: 2, plain: "OR, flipped", fn: (a, b) => 1 - (a | b),
  rule: "OR with its answer flipped: the output is 1 only when both inputs are 0. Like NAND, this one gate alone can build every other." },
 NOT: { name: "NOT", inputs: 1, plain: "The flipper", fn: (a) => 1 - a,
  rule: "One input, flipped: 1 becomes 0 and 0 becomes 1. The smallest gate there is, and the one that makes all the flipped gates possible." }
};
const GATE_ORDER = ["AND", "OR", "XOR", "NAND", "NOR", "NOT"];
function gateEval(type, ins) {
 const g = GATES[type];
 if (!g || !Array.isArray(ins) || ins.length !== g.inputs || !ins.every(isBit)) return { ok: false };
 return { ok: true, type, ins: ins.slice(), out: g.fn(ins[0], ins[1]) };
}
function truthTable(type) {
 const g = GATES[type];
 if (!g) return { ok: false };
 const combos = g.inputs === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
 return { ok: true, type, name: g.name, plain: g.plain, rule: g.rule,
  rows: combos.map((ins) => ({ ins, out: g.fn(ins[0], ins[1]) })) };
}

/* ---- Gates that add: the half adder ----
   Two gates working side by side add two bits. The XOR answers the sum
   bit — 1 when the inputs differ — and the AND answers the carry: the
   only way to overflow one bit is 1 + 1, which is 2, written 10. Chain
   full adders (a half adder plus a carry-in) and the same trick adds
   numbers of any size. This is not a model of how computers add; it is
   how computers add. */
function halfAdder(a, b) {
 if (!isBit(a) || !isBit(b)) return { ok: false };
 const sum = gateEval("XOR", [a, b]).out;
 const carry = gateEval("AND", [a, b]).out;
 return { ok: true, a, b, sum, carry, steps: [
  "The sum bit comes from an XOR gate: " + a + " XOR " + b + " = " + sum + " (XOR lights when the inputs differ).",
  "The carry comes from an AND gate: " + a + " AND " + b + " = " + carry + " (AND lights only when both are 1).",
  "Read the two outputs together as a binary number, carry first: " + carry + "" + sum + " — that is " + (carry * 2 + sum) + ", and " + a + " + " + b + " = " + (a + b) + ". The gates got it right."] };
}

/* ---- The toy net: three gates that notice one pattern ----
   The net is wired to recognise exactly one of the eight 3-bit
   patterns: 1, 0, 1. Its wiring is gates all the way down — a NOT on
   the middle bit, an AND across the two ends, and an AND joining
   those answers. No single gate in it knows the pattern; the pattern
   lives in the wiring. The bench also counts how many bits match the
   target, because a near miss is information too: 100 and 001 are one
   flip away from the pattern, and noticing that is the beginning of
   troubleshooting. */
const NET_TARGET = [1, 0, 1];
function netDetail(a, b, c) {
 if (![a, b, c].every(isBit)) return { ok: false };
 const notB = gateEval("NOT", [b]).out;
 const bothEnds = gateEval("AND", [a, c]).out;
 const out = gateEval("AND", [bothEnds, notB]).out;
 const matches = [a, b, c].filter((v, i) => v === NET_TARGET[i]).length;
 return { ok: true, ins: [a, b, c], notB, bothEnds, out, matches, target: NET_TARGET.slice(), steps: [
  "The NOT gate flips the middle bit: NOT " + b + " = " + notB + ". The net is looking for a quiet middle, so this wire lights when the middle is 0.",
  "The first AND reads the two ends: " + a + " AND " + c + " = " + bothEnds + ". It lights only when both ends are 1.",
  "The last AND joins them: " + bothEnds + " AND " + notB + " = " + out + "." + (out ? " Both halves agree — the pattern 1 0 1 is here, and the lamp lights." : " The pattern is not complete, so the lamp stays dark."),
  "Bit by bit, this input matches the target in " + matches + " of 3 places." + (out ? "" : matches === 2 ? " One flip away — a near miss, and near misses are clues." : "")] };
}

/* ---- Bits and sizes: the ladder with two honest rungs ----
   Sizes climb bit, byte, and then the thousands. Here the room tells
   the truth that storage boxes hope you won't ask about: there are
   two ladders. The decimal ladder climbs by 1000 (kilobyte = 1000
   bytes — the SI rule, and the one disk makers use). The binary ladder
   climbs by 1024 (kibibyte = 1024 bytes — the one memory uses, because
   memory is built in powers of two). They start close and drift apart:
   by the terabyte they disagree by almost a tenth. Everyday Measure
   owns unit honesty in this collection; this is its computing branch. */
const SIZE_UNITS = [
 { id: "bit", name: "bit", bits: 1, note: "One two-way choice." },
 { id: "byte", name: "byte", bits: 8, note: "Eight bits — one character of text, give or take." },
 { id: "kilobyte", name: "kilobyte (KB)", bits: 8000, note: "1,000 bytes — the decimal ladder. A page of plain text." },
 { id: "kibibyte", name: "kibibyte (KiB)", bits: 8192, note: "1,024 bytes — the binary ladder, 2 to the 10th." },
 { id: "megabyte", name: "megabyte (MB)", bits: 8000000, note: "1,000,000 bytes. A photo from a phone, roughly." },
 { id: "mebibyte", name: "mebibyte (MiB)", bits: 8388608, note: "1,048,576 bytes — 1024 kibibytes." },
 { id: "gigabyte", name: "gigabyte (GB)", bits: 8000000000, note: "A billion bytes. A few minutes of good video." },
 { id: "gibibyte", name: "gibibyte (GiB)", bits: 8589934592, note: "1,073,741,824 bytes — 1024 mebibytes." },
 { id: "terabyte", name: "terabyte (TB)", bits: 8000000000000, note: "A trillion bytes — a whole shelf of hard drives, once." },
 { id: "tebibyte", name: "tebibyte (TiB)", bits: 8796093022208, note: "1,099,511,627,776 bytes. The ladders now disagree by nearly a tenth." }
];
function sizeUnit(id) { return SIZE_UNITS.find((u) => u.id === id) || null; }
function bitsFor(count, unitId) {
 const u = sizeUnit(unitId);
 if (!u || typeof count !== "number" || !isFinite(count) || count < 0) return { ok: false };
 return { ok: true, bits: count * u.bits };
}
function sizeTable(bits) {
 if (typeof bits !== "number" || !isFinite(bits) || bits < 0) return { ok: false };
 return { ok: true, bits, rows: SIZE_UNITS.map((u) => ({ id: u.id, name: u.name, note: u.note, value: bits / u.bits })) };
}

/* ---- A program is a recipe: sorting, one honest pass at a time ----
   Bubble sort is the sorting algorithm you can watch think: walk the
   row, compare each pair, swap any pair that is out of order, and walk
   again. Big cards drift to the end like bubbles rising. It is not
   the fastest sort — it is the one whose every step you can check,
   which is why it teaches here. */
function bubblePass(arr) {
 if (!Array.isArray(arr) || !arr.every((v) => typeof v === "number" && isFinite(v))) return { ok: false };
 const a = arr.slice();
 let swaps = 0, comparisons = 0;
 const steps = [];
 for (let i = 0; i + 1 < a.length; i++) {
  comparisons++;
  if (a[i] > a[i + 1]) {
   const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; swaps++;
   steps.push("Compare " + a[i + 1] + " and " + a[i] + ": out of order, so they swap. The row is now " + a.join(", ") + ".");
  }
 }
 if (!steps.length) steps.push("No pair was out of order — the row is sorted, and the algorithm can stop.");
 return { ok: true, result: a, swaps, comparisons, steps };
}
function bubbleSort(arr) {
 if (!Array.isArray(arr) || !arr.every((v) => typeof v === "number" && isFinite(v))) return { ok: false };
 let a = arr.slice(), passes = 0, swaps = 0, comparisons = 0;
 for (let guard = 0; guard <= arr.length; guard++) {
  const p = bubblePass(a);
  passes++; swaps += p.swaps; comparisons += p.comparisons; a = p.result;
  if (p.swaps === 0) break;
 }
 return { ok: true, result: a, passes, swaps, comparisons };
}

/* ---- The logic builder: wire gates into circuits of your own ----
   The board holds four switches (A, B, C, D), up to twelve gates, and
   up to four lamps. A wire runs from a source — a switch, or a gate's
   output — into a gate's input slot or a lamp. An unwired input reads
   0, the way a real loose wire reads nothing. Evaluation walks the
   wiring from the lamps backwards; if the wiring loops back on itself
   (a gate feeding itself, directly or through friends), that output
   can never settle, and the evaluator honestly reports null — no
   steady answer — instead of guessing. */
const BUILDER_SWITCHES = ["A", "B", "C", "D"];
const MAX_GATES = 12, MAX_LAMPS = 4;
function newCircuit() { return { gates: [], lamps: [], nextGate: 1, nextLamp: 1 }; }
function findGate(c, id) { return c.gates.find((g) => g.id === id) || null; }
function findLamp(c, id) { return c.lamps.find((l) => l.id === id) || null; }
function addGate(c, type) {
 if (!GATES[type] || c.gates.length >= MAX_GATES) return null;
 const id = "g" + c.nextGate++;
 c.gates.push({ id, type, ins: GATES[type].inputs === 1 ? [null] : [null, null] });
 return id;
}
function addLamp(c) {
 if (c.lamps.length >= MAX_LAMPS) return null;
 const id = "L" + c.nextLamp++;
 c.lamps.push({ id, src: null });
 return id;
}
function sourceOk(c, src) {
 if (!src || typeof src !== "object") return false;
 if (src.switch) return BUILDER_SWITCHES.includes(src.switch);
 if (src.gate) return !!findGate(c, src.gate);
 return false;
}
function sameSource(a, b) {
 if (!a || !b) return false;
 return (a.switch && a.switch === b.switch) || (a.gate && a.gate === b.gate);
}
function connect(c, target, src) {
 if (!sourceOk(c, src)) return { ok: false };
 if (target.gate) {
  const g = findGate(c, target.gate);
  if (!g || !Number.isInteger(target.slot) || target.slot < 0 || target.slot >= g.ins.length) return { ok: false };
  g.ins[target.slot] = src.switch ? { switch: src.switch } : { gate: src.gate };
  return { ok: true };
 }
 if (target.lamp) {
  const l = findLamp(c, target.lamp);
  if (!l) return { ok: false };
  l.src = src.switch ? { switch: src.switch } : { gate: src.gate };
  return { ok: true };
 }
 return { ok: false };
}
function disconnect(c, target) {
 if (target.gate) {
  const g = findGate(c, target.gate);
  if (!g || !Number.isInteger(target.slot) || target.slot < 0 || target.slot >= g.ins.length) return { ok: false };
  g.ins[target.slot] = null;
  return { ok: true };
 }
 if (target.lamp) {
  const l = findLamp(c, target.lamp);
  if (!l) return { ok: false };
  l.src = null;
  return { ok: true };
 }
 return { ok: false };
}
function removeGate(c, id) {
 const g = findGate(c, id);
 if (!g) return { ok: false };
 c.gates = c.gates.filter((x) => x.id !== id);
 for (const other of c.gates) other.ins = other.ins.map((s) => (s && s.gate === id ? null : s));
 for (const l of c.lamps) if (l.src && l.src.gate === id) l.src = null;
 return { ok: true };
}
function evaluateCircuit(c, switches) {
 const sw = {};
 for (const s of BUILDER_SWITCHES) sw[s] = switches && switches[s] ? 1 : 0;
 const memo = {};
 function resolve(src, visiting) {
  if (!src) return 0;
  if (src.switch) return sw[src.switch];
  return evalGate(src.gate, visiting);
 }
 function evalGate(id, visiting) {
  if (id in memo) return memo[id];
  if (visiting.has(id)) return null;
  const g = findGate(c, id);
  if (!g) return null;
  visiting.add(id);
  const vals = [];
  let settled = true;
  for (const src of g.ins) {
   const v = resolve(src, visiting);
   if (v === null) settled = false;
   vals.push(v === null ? 0 : v);
  }
  visiting.delete(id);
  const out = settled ? GATES[g.type].fn(vals[0], vals[1]) : null;
  memo[id] = out;
  return out;
 }
 const gates = {}, lamps = {};
 for (const g of c.gates) gates[g.id] = evalGate(g.id, new Set());
 for (const l of c.lamps) lamps[l.id] = l.src ? resolve(l.src, new Set()) : null;
 return { gates, lamps };
}
/* The XOR trick, built from the basic gates through the same public
   functions the visitor's own clicks use: XOR = (A OR B) AND NOT
   (A AND B). Four gates: an OR, an AND, a NOT on the AND, and a final
   AND joining them — the difference detector, assembled by hand. */
function xorCircuit() {
 const c = newCircuit();
 const or = addGate(c, "OR"), and = addGate(c, "AND"), not = addGate(c, "NOT"), join = addGate(c, "AND");
 connect(c, { gate: or, slot: 0 }, { switch: "A" });
 connect(c, { gate: or, slot: 1 }, { switch: "B" });
 connect(c, { gate: and, slot: 0 }, { switch: "A" });
 connect(c, { gate: and, slot: 1 }, { switch: "B" });
 connect(c, { gate: not, slot: 0 }, { gate: and });
 connect(c, { gate: join, slot: 0 }, { gate: or });
 connect(c, { gate: join, slot: 1 }, { gate: not });
 const lamp = addLamp(c);
 connect(c, { lamp }, { gate: join });
 return c;
}

const api = { BIT_PLACES: [128, 64, 32, 16, 8, 4, 2, 1], bitsToNumber, numberToBits,
 GATES, GATE_ORDER, gateEval, truthTable, halfAdder,
 NET_TARGET, netDetail, SIZE_UNITS, sizeUnit, bitsFor, sizeTable,
 bubblePass, bubbleSort,
 BUILDER_SWITCHES, MAX_GATES, MAX_LAMPS, newCircuit, findGate, findLamp, addGate, addLamp,
 connect, disconnect, removeGate, evaluateCircuit, xorCircuit };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") Object.assign(window, api);
