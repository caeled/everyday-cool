"use strict";
/* Everyday Electronics — the rules, with no DOM code, so Node can check them.
   Everything here is Ohm's law and the LED resistor rule, worked the way the
   page shows it: V = I × R, I = V ÷ R, R = V ÷ I, P = V × I.
   The LED bench uses the standard typical forward voltages printed in LED
   datasheets and hobby references (red ≈ 2.0 V, blue/white ≈ 3.2 V). */

function round2(n) { return Math.round(n * 100) / 100; }

/* The circuit bench: a battery, a switch, and a bulb.
   Brightness is scaled so about 3 watts reads as fully bright — the size of
   a small torch bulb — and the page says that is a picture scale, not a
   measurement. */
const FULL_BRIGHT_WATTS = 3;
function circuitState(volts, ohms, closed) {
 const v = Number(volts), r = Number(ohms);
 if (!Number.isFinite(v) || v <= 0) return { ok: false, error: "The battery voltage needs to be a number bigger than zero." };
 if (!Number.isFinite(r) || r <= 0) return { ok: false, error: "The resistance needs to be a number bigger than zero — a real bulb always resists the flow at least a little." };
 if (!closed) return { ok: true, closed: false, volts: v, ohms: r, current: 0, power: 0, brightness: 0,
  steps: ["The switch is open, so the loop is broken. No complete loop, no flow: the current is 0 amps and the bulb stays dark."] };
 const current = v / r, power = v * current;
 return { ok: true, closed: true, volts: v, ohms: r, current: round2(current), power: round2(power),
  brightness: Math.min(1, power / FULL_BRIGHT_WATTS),
  steps: [
   "Current = volts ÷ resistance = " + v + " ÷ " + r + " = " + round2(current) + " amps.",
   "Power = volts × current = " + v + " × " + round2(current) + " = " + round2(power) + " watts — that power is what the bulb turns into light and heat."
  ] };
}

/* The Ohm's law bench: give any two of V, I, R; get the third, worked. */
function ohmSolve(given) {
 const names = { v: "voltage (volts)", i: "current (amps)", r: "resistance (ohms)" };
 const vals = {};
 for (const k of ["v", "i", "r"]) {
  const raw = given ? given[k] : null;
  if (raw === null || raw === undefined || raw === "") continue;
  const n = Number(raw);
  if (!Number.isFinite(n)) return { ok: false, error: "The " + names[k] + " needs to be a number." };
  if (n <= 0) return { ok: false, error: "The " + names[k] + " needs to be bigger than zero for this bench — zero or less would mean no battery, no flow, or a perfect wire, and the sums stop making sense." };
  vals[k] = n;
 }
 const keys = Object.keys(vals);
 if (keys.length !== 2) return { ok: false, error: "Fill in exactly two of the three boxes — the bench works out the one you leave empty." };
 let solved, steps;
 if (!("v" in vals)) { vals.v = round2(vals.i * vals.r); solved = "v";
  steps = ["Voltage = current × resistance.", vals.i + " × " + vals.r + " = " + vals.v + ", so the voltage is " + vals.v + " volts."]; }
 else if (!("i" in vals)) { vals.i = round2(vals.v / vals.r); solved = "i";
  steps = ["Current = voltage ÷ resistance.", vals.v + " ÷ " + vals.r + " = " + vals.i + ", so the current is " + vals.i + " amps."]; }
 else { vals.r = round2(vals.v / vals.i); solved = "r";
  steps = ["Resistance = voltage ÷ current.", vals.v + " ÷ " + vals.i + " = " + vals.r + ", so the resistance is " + vals.r + " ohms."]; }
 return { ok: true, v: vals.v, i: vals.i, r: vals.r, solved, steps };
}

/* Standard resistor values: the E12 series — twelve values per decade,
   the ones actually sold in shops. */
const E12_BASE = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
function nearestE12Up(value) {
 const v = Number(value);
 if (!Number.isFinite(v) || v <= 0) return null;
 for (let decade = 0; decade <= 6; decade++) {
  const scale = Math.pow(10, decade);
  for (const base of E12_BASE) {
   const candidate = round2(base * scale);
   if (candidate >= v - 1e-9) return candidate;
  }
 }
 return null; /* bigger than the largest E12 value in range */
}
function formatOhms(ohms) {
 if (ohms >= 1000) { const k = round2(ohms / 1000); return k + " kΩ"; }
 return round2(ohms) + " Ω";
}

/* The LED resistor bench. An LED must never meet a battery without a
   resistor to limit the current; the resistor drops the leftover voltage.
   Typical forward voltages (datasheet-typical for ordinary indicator LEDs). */
const LED_TYPES = [
 { id: "red", name: "Red", vf: 2.0 },
 { id: "yellow", name: "Yellow", vf: 2.1 },
 { id: "green", name: "Green", vf: 2.2 },
 { id: "blue", name: "Blue", vf: 3.2 },
 { id: "white", name: "White", vf: 3.2 }
];
function ledById(id) { return LED_TYPES.find(l => l.id === id) || null; }

function ledResistor(supplyVolts, forwardVolts, currentMA) {
 const vs = Number(supplyVolts), vf = Number(forwardVolts), ma = Number(currentMA);
 if (!Number.isFinite(vs) || vs <= 0) return { ok: false, error: "The supply voltage needs to be a number bigger than zero — that is the battery or power pack feeding the LED." };
 if (!Number.isFinite(vf) || vf <= 0) return { ok: false, error: "The LED's forward voltage needs to be a number bigger than zero — pick a colour above, or type the value from the LED's packet." };
 if (!Number.isFinite(ma) || ma <= 0) return { ok: false, error: "The current needs to be a number bigger than zero — 20 mA is the usual safe brightness for an ordinary LED." };
 if (vs <= vf) return { ok: false, error: "The supply (" + vs + " V) is not bigger than the LED's forward voltage (" + vf + " V), so there is no leftover voltage for a resistor to drop — the LED would not light. Use a bigger supply, or an LED colour with a lower forward voltage." };
 const amps = ma / 1000;
 const drop = round2(vs - vf);
 const exact = drop / amps;
 const e12 = nearestE12Up(exact);
 const resistorPowerMW = Math.round(drop * amps * 1000);
 return { ok: true, supplyVolts: vs, forwardVolts: vf, currentMA: ma, dropVolts: drop,
  exactOhms: round2(exact), e12Ohms: e12, e12Text: e12 === null ? null : formatOhms(e12),
  resistorPowerMW,
  steps: [
   "The LED keeps " + vf + " V for itself. The resistor must drop the rest: " + vs + " − " + vf + " = " + drop + " V.",
   "Resistor = volts to drop ÷ current in amps = " + drop + " ÷ " + amps + " = " + round2(exact) + " Ω.",
   "Resistors come in standard values, so round UP to the next standard (E12) value: " + (e12 === null ? "bigger than this bench covers" : formatOhms(e12)) + ". Rounding up means a touch less current than planned — the LED is slightly gentler, never overloaded.",
   "The resistor turns the dropped power into a little heat: " + drop + " V × " + amps + " A = " + resistorPowerMW + " milliwatts — an ordinary quarter-watt (250 mW) resistor handles that easily."
  ] };
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { circuitState, ohmSolve, E12_BASE, nearestE12Up, formatOhms, LED_TYPES, ledById, ledResistor, FULL_BRIGHT_WATTS };
}
