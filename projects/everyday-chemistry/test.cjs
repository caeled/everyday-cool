"use strict";
const assert = require("node:assert");
const C = require("./chem.js");

/* Element data: complete, tidy, and self-consistent */
assert.ok(C.PICKER.length >= 30, "picker covers at least 30 elements");
for (const sym of ["H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Fe","Cu","Zn","Ag","Au","Hg","Pb","I","Br","Sn"])
 assert.ok(C.elementBySymbol(sym), "picker includes " + sym);
for (const sym of C.PICKER) {
 const el = C.elementBySymbol(sym);
 const shellSum = el.shells.reduce((a, b) => a + b, 0);
 assert.strictEqual(shellSum, el.number, "shells add up to the atomic number: " + sym);
 assert.ok(el.mass > el.number, "mass exceeds proton count: " + sym);
 assert.ok(C.neutronsOf(el) >= 0, "neutron count is sane: " + sym);
 for (const n of el.shells) assert.ok(n >= 1 && n <= 32, "shell count in range: " + sym);
}
/* Spot-check standard values */
assert.strictEqual(C.elementBySymbol("Cl").shells.join(","), "2,8,7");
assert.strictEqual(C.elementBySymbol("Ca").shells.join(","), "2,8,8,2");
assert.strictEqual(C.elementBySymbol("O").mass, 15.999);
assert.strictEqual(C.elementBySymbol("Fe").mass, 55.845);
assert.strictEqual(C.neutronsOf(C.elementBySymbol("C")), 6, "carbon-12 has 6 neutrons");
assert.strictEqual(C.neutronsOf(C.elementBySymbol("O")), 8, "oxygen-16 has 8 neutrons");
assert.strictEqual(C.neutronsOf(C.elementBySymbol("Fe")), 30, "iron-56 has 30 neutrons");
assert.strictEqual(C.neutronsOf(C.elementBySymbol("H")), 0, "ordinary hydrogen has no neutrons");

/* Neutron calculator */
const nc = C.neutronCalc(8, 16);
assert.ok(nc.ok && nc.neutrons === 8);
assert.ok(nc.steps[2].includes("16 − 8 = 8"));
assert.ok(!C.neutronCalc(8, 4).ok, "mass below atomic number is refused");
assert.ok(!C.neutronCalc("x", 16).ok, "nonsense input is refused");
assert.ok(!C.neutronCalc(0, 16).ok, "zero protons is refused");

/* Formula bench */
function counts(f) { const r = C.parseFormula(f); assert.ok(r.ok, "parses: " + f + " (" + (r.error || "") + ")"); return r; }
assert.deepStrictEqual(counts("H2O").counts, { H: 2, O: 1 });
assert.deepStrictEqual(counts("C6H12O6").counts, { C: 6, H: 12, O: 6 });
assert.deepStrictEqual(counts("Ca(OH)2").counts, { Ca: 1, O: 2, H: 2 });
assert.deepStrictEqual(counts("Mg(NO3)2").counts, { Mg: 1, N: 2, O: 6 });
assert.deepStrictEqual(counts("NaCl").counts, { Na: 1, Cl: 1 });
assert.strictEqual(C.totalAtoms(counts("C6H12O6")), 24);
assert.ok(!C.parseFormula("Xx2").ok, "unknown element is refused in plain words");
assert.ok(!C.parseFormula("h2o").ok, "lowercase start is refused");
assert.ok(!C.parseFormula("Ca(OH2").ok, "unclosed bracket is refused");
assert.ok(!C.parseFormula("").ok, "empty input is refused");
assert.ok(!C.parseFormula("2H2O").ok, "leading number is refused");

/* Molar masses against standard values */
function mass(f) { return C.molarMass(counts(f)).total; }
assert.ok(Math.abs(mass("H2O") - 18.02) < 0.01, "water weighs 18.02, got " + mass("H2O"));
assert.ok(Math.abs(mass("CO2") - 44.01) < 0.01, "CO2 weighs 44.01, got " + mass("CO2"));
assert.ok(Math.abs(mass("C6H12O6") - 180.16) < 0.01, "glucose weighs 180.16, got " + mass("C6H12O6"));
assert.ok(Math.abs(mass("NaCl") - 58.44) < 0.01, "salt weighs 58.44, got " + mass("NaCl"));
assert.ok(Math.abs(mass("Ca(OH)2") - 74.09) < 0.01, "slaked lime weighs 74.09, got " + mass("Ca(OH)2"));

/* Combinations bench: every preset parses and its tally is real */
assert.strictEqual(C.COMPOUNDS.length, 8, "eight preset compounds");
for (const c of C.COMPOUNDS) {
 const r = counts(c.formula);
 assert.ok(C.totalAtoms(r) >= 2, "compound has more than one atom: " + c.id);
 assert.ok(c.ratio.length > 10, "compound explains its ratio: " + c.id);
}
assert.strictEqual(C.compoundById("water").formula, "H2O");
assert.strictEqual(C.compoundById("nope"), null);

console.log("everyday-chemistry tests: all passed (" + C.PICKER.length + " elements, " +
 C.COMPOUNDS.length + " compounds)");
