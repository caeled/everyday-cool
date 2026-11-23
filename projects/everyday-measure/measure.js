"use strict";
/* Everyday Measure — the rules, with no DOM code, so Node can check them.
   Every conversion factor here comes from the exact legal definitions:
   since the Mendenhall Order (1893) and the international yard and pound
   agreement (1959), US customary units are DEFINED from metric ones —
   1 inch = 2.54 cm exactly, 1 pound = 0.45359237 kg exactly,
   1 US gallon = 231 cubic inches = 3.785411784 litres exactly.
   Sources: NIST SP 811 (Guide for the Use of the SI) and NIST's SI Units
   pages; see THIRD-PARTY.md. */

/* ---- The prefix ladder -------------------------------------------------
   Each prefix multiplies the base unit by a power of ten. "meaning" says
   the same thing in plain words: kilo = a thousand of them. */
const PREFIXES = [
 { prefix: "mega",  symbol: "M",  power: 6,  factor: 1000000000 / 1000, meaning: "a million of them" },
 { prefix: "kilo",  symbol: "k",  power: 3,  factor: 1000,              meaning: "a thousand of them" },
 { prefix: "hecto", symbol: "h",  power: 2,  factor: 100,               meaning: "a hundred of them" },
 { prefix: "deka",  symbol: "da", power: 1,  factor: 10,                meaning: "ten of them" },
 { prefix: "(base unit)", symbol: "", power: 0, factor: 1,              meaning: "just the unit itself, no prefix" },
 { prefix: "deci",  symbol: "d",  power: -1, factor: 0.1,               meaning: "a tenth of one" },
 { prefix: "centi", symbol: "c",  power: -2, factor: 0.01,              meaning: "a hundredth of one" },
 { prefix: "milli", symbol: "m",  power: -3, factor: 0.001,             meaning: "a thousandth of one" },
 { prefix: "micro", symbol: "µ",  power: -6, factor: 0.000001,          meaning: "a millionth of one" },
 { prefix: "nano",  symbol: "n",  power: -9, factor: 0.000000001,       meaning: "a billionth of one" }
];
function prefixByName(name) {
 for (const p of PREFIXES) if (p.prefix === name) return p;
 return null;
}
/* Climb the ladder: express `value` (given in the from-prefix unit) in the
   to-prefix unit, showing the climb through the base unit. */
function rescale(value, fromName, toName, baseName) {
 const from = prefixByName(fromName), to = prefixByName(toName);
 if (!from || !to || typeof value !== "number" || !isFinite(value)) return { ok: false };
 const fromUnit = (from.symbol ? from.prefix : "") + baseName;
 const toUnit = (to.symbol ? to.prefix : "") + baseName;
 const inBase = value * from.factor;
 const result = inBase / to.factor;
 const steps = [];
 steps.push("1 " + fromUnit + " = " + fmt(from.factor) + " " + baseName + "s, so " +
  fmt(value) + " " + fromUnit + "s = " + fmt(value) + " × " + fmt(from.factor) + " = " + fmt(inBase) + " " + baseName + "s.");
 if (to.factor !== 1)
  steps.push("1 " + toUnit + " = " + fmt(to.factor) + " " + baseName + "s, so " + fmt(inBase) + " " + baseName +
   "s = " + fmt(inBase) + " ÷ " + fmt(to.factor) + " = " + fmt(result) + " " + toUnit + "s.");
 else
  steps.push("The base unit needs no second step: " + fmt(inBase) + " " + baseName + "s is the answer.");
 return { ok: true, result, steps };
}

/* ---- Number formatting: trim, group thousands, keep small numbers honest */
function fmt(n) {
 if (typeof n !== "number" || !isFinite(n)) return "—";
 if (n === 0) return "0";
 const a = Math.abs(n);
 if (a !== 0 && (a >= 1e15 || a < 0.000001)) return n.toExponential(3).replace("e+", "×10^").replace("e", "×10^");
 const rounded = Math.round(n * 1e6) / 1e6;
 return rounded.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/* ---- The converter benches ---------------------------------------------
   Each kind has a base unit; every unit carries its exact size in base
   units and the definition line the page shows as the working. */
const UNITS = {
 length: {
  label: "Length", base: "metres",
  units: [
   { id: "mm", name: "millimetres (mm)", factor: 0.001, def: "1 m = 1,000 mm" },
   { id: "cm", name: "centimetres (cm)", factor: 0.01, def: "1 m = 100 cm" },
   { id: "m",  name: "metres (m)",       factor: 1,     def: "the base unit" },
   { id: "km", name: "kilometres (km)",  factor: 1000,  def: "1 km = 1,000 m" },
   { id: "in", name: "inches (in)",      factor: 0.0254, def: "1 in = 2.54 cm exactly, by definition" },
   { id: "ft", name: "feet (ft)",        factor: 0.3048, def: "1 ft = 12 in = 0.3048 m exactly" },
   { id: "yd", name: "yards (yd)",       factor: 0.9144, def: "1 yd = 3 ft = 0.9144 m exactly" },
   { id: "mi", name: "miles (mi)",       factor: 1609.344, def: "1 mi = 5,280 ft = 1,609.344 m exactly" }
  ],
  from: "ft", to: "m", sample: 5
 },
 mass: {
  label: "Weight (mass)", base: "grams",
  units: [
   { id: "g",     name: "grams (g)",        factor: 1,           def: "the base unit" },
   { id: "kg",    name: "kilograms (kg)",   factor: 1000,        def: "1 kg = 1,000 g" },
   { id: "tonne", name: "metric tonnes (t)", factor: 1000000,    def: "1 tonne = 1,000 kg" },
   { id: "oz",    name: "ounces (oz)",      factor: 28.349523125, def: "1 oz = 1/16 lb = 28.349523125 g exactly" },
   { id: "lb",    name: "pounds (lb)",      factor: 453.59237,   def: "1 lb = 0.45359237 kg exactly, by definition" },
   { id: "uston", name: "US tons",          factor: 907184.74,   def: "1 US ton = 2,000 lb = 907.18474 kg" }
  ],
  from: "lb", to: "kg", sample: 150
 },
 volume: {
  label: "Volume", base: "millilitres",
  units: [
   { id: "mL",     name: "millilitres (mL)",   factor: 1,            def: "the base unit" },
   { id: "L",      name: "litres (L)",         factor: 1000,         def: "1 L = 1,000 mL" },
   { id: "floz",   name: "US fluid ounces",    factor: 29.5735295625, def: "1 fl oz = 1/128 US gallon = 29.5735295625 mL exactly" },
   { id: "cup",    name: "US cups",            factor: 236.5882365,  def: "1 cup = 8 fl oz = 236.588 mL" },
   { id: "pint",   name: "US pints",           factor: 473.176473,   def: "1 pint = 2 cups = 473.176 mL" },
   { id: "quart",  name: "US quarts",          factor: 946.352946,   def: "1 quart = 2 pints = 946.353 mL" },
   { id: "gal",    name: "US gallons",         factor: 3785.411784,  def: "1 US gallon = 231 in³ = 3.785411784 L exactly" },
   { id: "impgal", name: "Imperial gallons (UK)", factor: 4546.09,   def: "1 Imperial gallon = 4.54609 L — NOT the US gallon" }
  ],
  from: "gal", to: "L", sample: 1
 }
};
function unitById(kind, id) {
 const k = UNITS[kind]; if (!k) return null;
 for (const u of k.units) if (u.id === id) return u;
 return null;
}
/* Convert with the working shown: go through the base unit, in the open. */
function convert(kind, value, fromId, toId) {
 const k = UNITS[kind], from = unitById(kind, fromId), to = unitById(kind, toId);
 if (!k || !from || !to || typeof value !== "number" || !isFinite(value)) return { ok: false };
 const inBase = value * from.factor;
 const result = inBase / to.factor;
 const steps = [];
 steps.push("Start from the definition — " + from.def + ". So " + fmt(value) + " × " + fmt(from.factor) +
  " = " + fmt(inBase) + " " + k.base + ".");
 if (to.factor !== 1)
  steps.push("Now into " + to.name + " — " + to.def + ". So " + fmt(inBase) + " ÷ " + fmt(to.factor) +
   " = " + fmt(result) + ".");
 else
  steps.push("The answer is already in the base unit: " + fmt(inBase) + " " + k.base + ".");
 return { ok: true, result, steps, inBase };
}

/* ---- Temperature: the odd one out ---------------------------------------
   Not a ×10 system at all — two fixed points and a stretch. The formulas
   are shown step by step, the way the page prints them. */
function fToC(f) {
 const c = (f - 32) * 5 / 9;
 return { ok: typeof f === "number" && isFinite(f), result: c, steps: [
  "°C = (°F − 32) × 5/9.",
  "(" + fmt(f) + " − 32) = " + fmt(f - 32) + ".",
  fmt(f - 32) + " × 5/9 = " + fmt(c) + " °C."
 ] };
}
function cToF(c) {
 const f = c * 9 / 5 + 32;
 return { ok: typeof c === "number" && isFinite(c), result: f, steps: [
  "°F = °C × 9/5 + 32.",
  fmt(c) + " × 9/5 = " + fmt(c * 9 / 5) + ".",
  fmt(c * 9 / 5) + " + 32 = " + fmt(f) + " °F."
 ] };
}

/* ---- The comparison shelf ------------------------------------------------
   One canonical measurement per thing; the other system's number is
   computed with the same converters the benches use, so the two readings
   can never drift apart. approx: the real-world thing varies. */
const THINGS = [
 { id: "elephant", name: "An African elephant", kind: "mass", value: 6000, unit: "kg", approx: true,
   note: "A big bull African elephant. Real elephants vary — roughly 5,000 to 6,500 kg — so read this as a good round elephant, not a specific one." },
 { id: "car", name: "An average US car", kind: "mass", value: 4100, unit: "lb", approx: true,
   note: "The average new US vehicle weighs about 4,100 lb. SUVs and trucks pull the average up; a small hatchback is nearer 2,600 lb." },
 { id: "giraffe", name: "A giraffe, head to toe", kind: "length", value: 5.5, unit: "m", approx: true,
   note: "A tall male giraffe stands about 5.5 m. Most adults are a little shorter — 4.5 to 5.5 m is the usual range." },
 { id: "field", name: "A US football field, goal line to goal line", kind: "length", value: 100, unit: "yd", approx: false,
   note: "Exactly 100 yards between the goal lines — the one measurement on this shelf that is exact by rule, not by rounding." },
 { id: "bathtub", name: "A full bathtub", kind: "volume", value: 300, unit: "L", approx: true,
   note: "A standard tub filled to the overflow takes roughly 300 litres. Your tub, your fill line, and a person in it all move the number." },
 { id: "pool", name: "An Olympic swimming pool", kind: "volume", value: 2500000, unit: "L", approx: false,
   note: "The Olympic minimum: 2,500,000 litres of water, set by the World Aquatics rules (the body was called FINA until 2023) (50 m × 25 m × at least 2 m deep). Real pools hold a little more." }
];
function thingById(id) {
 for (const t of THINGS) if (t.id === id) return t;
 return null;
}
/* The two readings of one thing, one per system. */
function thingReadings(t) {
 if (t.kind === "mass") {
  const kg = t.unit === "kg" ? t.value : convert("mass", t.value, t.unit, "kg").result;
  const lb = t.unit === "lb" ? t.value : convert("mass", t.value, t.unit, "lb").result;
  return { metric: fmt(kg) + " kilograms (" + fmt(kg / 1000) + " tonnes)", us: fmt(lb) + " pounds (" + fmt(lb / 2000) + " US tons)" };
 }
 if (t.kind === "length") {
  const m = t.unit === "m" ? t.value : convert("length", t.value, t.unit, "m").result;
  const ft = t.unit === "ft" ? t.value : convert("length", t.value, t.unit, "ft").result;
  return { metric: fmt(m) + " metres", us: fmt(ft) + " feet" };
 }
 const L = t.unit === "L" ? t.value : convert("volume", t.value, t.unit, "L").result;
 const gal = t.unit === "gal" ? t.value : convert("volume", t.value, t.unit, "gal").result;
 return { metric: fmt(L) + " litres", us: fmt(gal) + " US gallons" };
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { PREFIXES, prefixByName, rescale, fmt, UNITS, unitById, convert, fToC, cToF, THINGS, thingById, thingReadings };
}
