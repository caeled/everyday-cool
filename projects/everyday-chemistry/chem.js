"use strict";
/* Everyday Chemistry — the rules, with no DOM code, so Node can check them.
   Element data: standard atomic weights (CIAAW conventional values) and
   textbook Bohr shell counts (the shells a school periodic table shows).
   The neutron count for the picture is for the most common isotope:
   neutrons = (standard mass rounded to a whole number) − protons. */

/* symbol: [atomic number, name, standard atomic mass, Bohr shells] */
const ELEMENT_DATA = {
 H:  [1, "Hydrogen", 1.008, [1]],
 He: [2, "Helium", 4.003, [2]],
 Li: [3, "Lithium", 6.94, [2, 1]],
 Be: [4, "Beryllium", 9.012, [2, 2]],
 B:  [5, "Boron", 10.81, [2, 3]],
 C:  [6, "Carbon", 12.011, [2, 4]],
 N:  [7, "Nitrogen", 14.007, [2, 5]],
 O:  [8, "Oxygen", 15.999, [2, 6]],
 F:  [9, "Fluorine", 18.998, [2, 7]],
 Ne: [10, "Neon", 20.18, [2, 8]],
 Na: [11, "Sodium", 22.99, [2, 8, 1]],
 Mg: [12, "Magnesium", 24.305, [2, 8, 2]],
 Al: [13, "Aluminium", 26.982, [2, 8, 3]],
 Si: [14, "Silicon", 28.085, [2, 8, 4]],
 P:  [15, "Phosphorus", 30.974, [2, 8, 5]],
 S:  [16, "Sulfur", 32.06, [2, 8, 6]],
 Cl: [17, "Chlorine", 35.45, [2, 8, 7]],
 Ar: [18, "Argon", 39.948, [2, 8, 8]],
 K:  [19, "Potassium", 39.098, [2, 8, 8, 1]],
 Ca: [20, "Calcium", 40.078, [2, 8, 8, 2]],
 Fe: [26, "Iron", 55.845, [2, 8, 14, 2]],
 Cu: [29, "Copper", 63.546, [2, 8, 18, 1]],
 Zn: [30, "Zinc", 65.38, [2, 8, 18, 2]],
 Br: [35, "Bromine", 79.904, [2, 8, 18, 7]],
 Ag: [47, "Silver", 107.868, [2, 8, 18, 18, 1]],
 Sn: [50, "Tin", 118.71, [2, 8, 18, 18, 4]],
 I:  [53, "Iodine", 126.904, [2, 8, 18, 18, 7]],
 Au: [79, "Gold", 196.967, [2, 8, 18, 32, 18, 1]],
 Hg: [80, "Mercury", 200.592, [2, 8, 18, 32, 18, 2]],
 Pb: [82, "Lead", 207.2, [2, 8, 18, 32, 18, 4]]
};

/* Extra masses so the formula bench can weigh more than the picker shows. */
const EXTRA_MASSES = {
 Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Co: 58.933, Ni: 58.693,
 Se: 78.971, Sr: 87.62, Mo: 95.95, Cd: 112.414, Ba: 137.327, Pt: 195.084,
 U: 238.029
};
const EXTRA_NAMES = {
 Ti: "Titanium", V: "Vanadium", Cr: "Chromium", Mn: "Manganese",
 Co: "Cobalt", Ni: "Nickel", Se: "Selenium", Sr: "Strontium",
 Mo: "Molybdenum", Cd: "Cadmium", Ba: "Barium", Pt: "Platinum",
 U: "Uranium"
};

function elementBySymbol(sym) {
 const d = ELEMENT_DATA[sym];
 if (d) return { symbol: sym, number: d[0], name: d[1], mass: d[2], shells: d[3].slice() };
 if (EXTRA_MASSES[sym]) return { symbol: sym, number: null, name: EXTRA_NAMES[sym], mass: EXTRA_MASSES[sym], shells: null };
 return null;
}

/* The picker list, in atomic-number order. */
const PICKER = Object.keys(ELEMENT_DATA).sort((a, b) => ELEMENT_DATA[a][0] - ELEMENT_DATA[b][0]);

function massNumberOf(el) { return Math.round(el.mass); }
function neutronsOf(el) { return massNumberOf(el) - el.number; }

/* Neutron calculator: plain subtraction, shown step by step. */
function neutronCalc(atomicNumber, massNumber) {
 const z = Number(atomicNumber), a = Number(massNumber);
 if (!Number.isInteger(z) || z < 1) return { ok: false, error: "The atomic number needs to be a whole number of 1 or more — that is the count of protons." };
 if (!Number.isInteger(a) || a < 1) return { ok: false, error: "The mass number needs to be a whole number of 1 or more — protons and neutrons added together." };
 if (a < z) return { ok: false, error: "The mass number (" + a + ") cannot be smaller than the atomic number (" + z + ") — the mass number includes every proton, plus the neutrons." };
 return { ok: true, neutrons: a - z, steps: [
  "Mass number " + a + " means " + a + " heavy pieces in the nucleus (protons + neutrons).",
  "Atomic number " + z + " means " + z + " of those pieces are protons.",
  a + " − " + z + " = " + (a - z) + ", so the nucleus holds " + (a - z) + " neutrons."
 ] };
}

/* Formula bench: parse H2O, C6H12O6, Ca(OH)2, Mg(NO3)2 …
   Returns { ok, counts: {sym: n}, order: [sym…] } or { ok:false, error }. */
function parseFormula(input) {
 if (typeof input !== "string") return { ok: false, error: "Type a formula first — something like H2O or Ca(OH)2." };
 const s = input.replace(/\s+/g, "");
 if (!s) return { ok: false, error: "Type a formula first — something like H2O or Ca(OH)2." };
 let i = 0;
 function readNumber() {
  let n = "";
  while (i < s.length && s[i] >= "0" && s[i] <= "9") n += s[i++];
  return n === "" ? 1 : parseInt(n, 10);
 }
 function parseGroup(endChar) {
  const counts = {};
  const order = [];
  const add = (sym, n) => { if (!(sym in counts)) order.push(sym); counts[sym] = (counts[sym] || 0) + n; };
  while (i < s.length) {
   const ch = s[i];
   if (endChar && ch === endChar) { i++; return { counts, order }; }
   if (ch === ")") return { error: "There is a closing bracket \")\" with nothing opening it. Check the brackets come in pairs." };
   if (ch === "(") {
    i++;
    const inner = parseGroup(")");
    if (inner.error) return inner;
    const mult = readNumber();
    for (const sym of inner.order) add(sym, inner.counts[sym] * mult);
    continue;
   }
   if (ch >= "A" && ch <= "Z") {
    let sym = ch; i++;
    if (i < s.length && s[i] >= "a" && s[i] <= "z") sym += s[i++];
    if (!elementBySymbol(sym)) return { error: "I don't know the element \"" + sym + "\". Element symbols start with a capital letter, sometimes with one small letter after it — H, O, Na, Fe." };
    add(sym, readNumber());
    continue;
   }
   if (ch >= "a" && ch <= "z") return { error: "Element symbols start with a capital letter — \"" + ch + "\" needs to be part of a symbol like Na or Cl, or a capital on its own." };
   if (ch >= "0" && ch <= "9") return { error: "A number needs an element or a closing bracket in front of it — numbers say how many of what came just before." };
   return { error: "I can't read the character \"" + ch + "\". Formulas use element symbols, numbers, and round brackets." };
  }
  if (endChar) return { error: "An opening bracket \"(\" is never closed. Add the matching \")\"." };
  return { counts, order };
 }
 const r = parseGroup(null);
 if (r.error) return { ok: false, error: r.error };
 if (!r.order.length) return { ok: false, error: "That did not include any elements I can count — try H2O." };
 return { ok: true, counts: r.counts, order: r.order };
}

/* Weigh a parsed formula, showing the arithmetic per element. */
function molarMass(parsed) {
 let total = 0;
 const lines = [];
 for (const sym of parsed.order) {
  const el = elementBySymbol(sym);
  const part = parsed.counts[sym] * el.mass;
  total += part;
  lines.push({ symbol: sym, name: el.name, count: parsed.counts[sym], mass: el.mass, part: Math.round(part * 100) / 100 });
 }
 return { total: Math.round(total * 100) / 100, lines };
}

function totalAtoms(parsed) { return parsed.order.reduce((n, sym) => n + parsed.counts[sym], 0); }

/* Combinations bench: familiar things, taken apart. */
const COMPOUNDS = [
 { id: "water", name: "Water", formula: "H2O", where: "From the tap",
   ratio: "2 hydrogen atoms for every 1 oxygen atom — a 2-to-1 recipe that never changes." },
 { id: "salt", name: "Table salt", formula: "NaCl", where: "In the shaker",
   ratio: "1 sodium for every 1 chlorine — exactly even, 1 to 1." },
 { id: "baking-soda", name: "Baking soda", formula: "NaHCO3", where: "In the baking cupboard",
   ratio: "1 sodium, 1 hydrogen, 1 carbon, and 3 oxygens in every unit." },
 { id: "carbon-dioxide", name: "Carbon dioxide", formula: "CO2", where: "In every breath out, and every soda bubble",
   ratio: "1 carbon wearing 2 oxygens — 1 to 2." },
 { id: "glucose", name: "Glucose (sugar's building block)", formula: "C6H12O6", where: "In honey, fruit, and your blood",
   ratio: "6 carbons, 12 hydrogens, 6 oxygens — the counts simplify to 1 : 2 : 1." },
 { id: "vinegar", name: "Vinegar (acetic acid)", formula: "C2H4O2", where: "In the salad-dressing bottle",
   ratio: "2 carbons, 4 hydrogens, 2 oxygens — the sour part of vinegar." },
 { id: "ammonia", name: "Ammonia", formula: "NH3", where: "Made by lightning and farmers alike",
   ratio: "1 nitrogen holding 3 hydrogens — 1 to 3." },
 { id: "rust", name: "Rust (iron oxide)", formula: "Fe2O3", where: "On an old bike left in the rain",
   ratio: "2 irons and 3 oxygens — 2 to 3. Iron plus oxygen plus time." }
];
function compoundById(id) { return COMPOUNDS.find(c => c.id === id) || null; }

/* Plain tally line for a parsed formula: "6 carbon · 12 hydrogen · 6 oxygen" */
function tallyText(parsed) {
 return parsed.order.map(sym => parsed.counts[sym] + " " + elementBySymbol(sym).name.toLowerCase()).join(" · ");
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { ELEMENT_DATA, PICKER, elementBySymbol, massNumberOf, neutronsOf, neutronCalc, parseFormula, molarMass, totalAtoms, COMPOUNDS, compoundById, tallyText };
}
