"use strict";
/* Everyday Engineering — pure rules. No DOM: test.cjs checks this file directly.
   Every bench on the page is arithmetic over the functions below, so the page
   and the tests can never drift apart. The physics is the ideal-machine kind:
   friction is named as a loss wherever a real machine would pay it. */

/* ---- Lever: mechanical advantage is the ratio of the two arms ----
   Load sits at one end of the beam, you push at the other, the fulcrum
   divides the beam. MA = effort arm / load arm, and the effort needed is
   the load divided by the MA. Move the fulcrum toward the load and the
   effort arm grows: less force, but your end of the beam travels further. */
function lever(loadKg, beamM, fulcrumFromLoadM) {
 if (!isPos(loadKg) || !isPos(beamM) || !(fulcrumFromLoadM > 0) || !(fulcrumFromLoadM < beamM))
  return { ok: false };
 const loadArm = fulcrumFromLoadM, effortArm = beamM - fulcrumFromLoadM;
 const ma = effortArm / loadArm;
 const effortKg = loadKg / ma;
 return { ok: true, loadArm, effortArm, ma, effortKg, effortN: effortKg * 9.81,
  steps: [
   "The beam is " + fmt(beamM) + " m long and the fulcrum sits " + fmt(loadArm) + " m from the crate, so the load arm is " + fmt(loadArm) + " m and your effort arm is " + fmt(effortArm) + " m.",
   "Mechanical advantage = effort arm ÷ load arm = " + fmt(effortArm) + " ÷ " + fmt(loadArm) + " = " + fmt(ma) + ".",
   "Effort needed = load ÷ mechanical advantage = " + fmt(loadKg) + " kg ÷ " + fmt(ma) + " = " + fmt(effortKg) + " kg of push (about " + fmt(effortKg * 9.81) + " newtons).",
   "The trade: your end of the beam travels " + fmt(ma) + " times as far as the crate rises. Force is multiplied; distance pays for it."
  ] };
}

/* ---- Pulley: count the rope segments holding the moving block ----
   With n supporting segments, each carries an equal share of the load:
   effort = load / n, and you pull n metres of rope for every metre the
   load rises. Ideal numbers — a real pulley loses some to friction. */
function pulley(loadKg, segments) {
 if (!isPos(loadKg) || !Number.isInteger(segments) || segments < 1 || segments > 4)
  return { ok: false };
 const effortKg = loadKg / segments;
 return { ok: true, segments, ma: segments, effortKg, effortN: effortKg * 9.81,
  ropePerLift: segments,
  steps: [
   segments + (segments === 1 ? " rope segment holds" : " rope segments share") + " the load, so each segment carries an equal share.",
   "Effort needed = load ÷ segments = " + fmt(loadKg) + " kg ÷ " + segments + " = " + fmt(effortKg) + " kg of pull (about " + fmt(effortKg * 9.81) + " newtons).",
   "The trade: to lift the load 1 metre you pull " + segments + (segments === 1 ? " metre" : " metres") + " of rope through your hands.",
   "Honestly: these are ideal numbers. A real pulley loses a little to friction in the wheel and stiffness in the rope, so the real pull is a bit more than this."
  ] };
}

/* ---- Ramp: a slope is a trade between force and distance ----
   Along a frictionless slope of angle θ, the effort to push a load up is
   load × sin(θ). The ramp's length for a given rise is rise ÷ sin(θ).
   The accessibility standard: a wheelchair ramp runs at most 1 unit of
   rise for every 12 units of run — a slope of about 4.8 degrees. */
const RAMP_STANDARD_RATIO = 12; // 1:12 rise:run, the wheelchair-ramp standard
function ramp(loadKg, angleDeg, riseM) {
 if (!isPos(loadKg) || !(angleDeg > 0) || !(angleDeg <= 45) || !isPos(riseM)) return { ok: false };
 const s = Math.sin(angleDeg * Math.PI / 180);
 const effortKg = loadKg * s;
 const lengthM = riseM / s;
 const runM = riseM / Math.tan(angleDeg * Math.PI / 180);
 return { ok: true, angleDeg, effortKg, effortN: effortKg * 9.81, lengthM, runM,
  ratio: runM / riseM, ma: 1 / s,
  steps: [
   "On a slope of " + fmt(angleDeg) + "°, the share of the load's weight that pulls it back down the ramp is sin(" + fmt(angleDeg) + "°) = " + fmt(s) + ".",
   "Effort to push it up = " + fmt(loadKg) + " kg × " + fmt(s) + " = " + fmt(effortKg) + " kg of push (about " + fmt(effortKg * 9.81) + " newtons) — against " + fmt(loadKg) + " kg of dead lift on the flat.",
   "To climb " + fmt(riseM) + " m at this slope the ramp runs " + fmt(lengthM) + " m long: a rise-to-run of about 1:" + fmt(runM / riseM) + ".",
   "The trade, as always: the gentler the slope, the less you push — and the further you walk."
  ] };
}
function rampStandard(riseM) {
 if (!isPos(riseM)) return { ok: false };
 return { ok: true, riseM, runM: riseM * RAMP_STANDARD_RATIO,
  angleDeg: Math.atan(1 / RAMP_STANDARD_RATIO) * 180 / Math.PI };
}

/* ---- Frames: why a triangle holds and a square racks ----
   A triangle's angles are fixed by its side lengths — push it and the
   sides themselves resist. A square frame's joints can swing: pushed
   sideways by d, its top leans by that same d (a parallelogram). A
   diagonal brace splits the square into two triangles and the lean
   collapses to (near) zero. The bench models exactly this geometry. */
function frameLean(shape, pushM) {
 if (!(pushM >= 0)) return { ok: false };
 if (shape === "square") return { ok: true, leanM: pushM };
 if (shape === "triangle") return { ok: true, leanM: 0 };
 if (shape === "braced") return { ok: true, leanM: 0 };
 return { ok: false };
}

/* ---- The pocket log table: mantissas for 1.0 to 10, four decimals ----
   A common logarithm splits into two parts. The characteristic is the
   number's size — its power of ten. The mantissa comes from the digits
   alone, read from one small table. So 5, 50, 500 and 0.05 all share the
   mantissa .6990 and differ only in characteristic: one table of ninety
   entries covers every number there is. The table below is rounded to
   four decimals, exactly as printed tables were, and the lookup
   interpolates linearly between steps (the "proportional parts" every
   table user learned) — so this bench computes the way an engineer of
   1900 computed, small fourth-decimal wobble included, on purpose. */
const LOG_TABLE = [];
for (let i = 0; i <= 90; i++) LOG_TABLE.push(Math.round(Math.log10(1 + i / 10) * 10000) / 10000);
function logMantissa(m) {
 if (!(m >= 1) || !(m < 10)) return { ok: false };
 const pos = (m - 1) * 10, i = Math.min(89, Math.floor(pos)), frac = pos - i;
 const lo = LOG_TABLE[i], hi = LOG_TABLE[i + 1];
 return { ok: true, mantissa: lo + frac * (hi - lo), lo, hi, frac, at: 1 + i / 10 };
}
function log10Table(x) {
 if (!isPos(x)) return { ok: false };
 let m = x, characteristic = 0;
 while (m >= 10) { m /= 10; characteristic++; }
 while (m < 1) { m *= 10; characteristic--; }
 const t = logMantissa(m);
 const f4 = (v) => v.toFixed(4);
 const steps = [
  "Split the number into its size and its digits: " + fmt(x) + " = " + fmt(m) + " × 10" + supInt(characteristic) + ", so the characteristic is " + characteristic + " and the digits are " + fmt(m) + "."
 ];
 if (t.frac < 0.001) {
  steps.push("The table gives the mantissa for " + fmt(m) + " directly: ." + f4(t.lo).slice(2) + ".");
 } else {
  steps.push("The table brackets the digits: " + fmt(t.at) + " → ." + f4(t.lo).slice(2) + " and " + fmt(t.at + 0.1) + " → ." + f4(t.hi).slice(2) + ", a difference of ." + f4(t.hi - t.lo).slice(2) + ".");
  steps.push("Interpolate: " + fmt(m) + " sits " + fmt(t.frac * 10) + "/10 of the way across the step, so add " + fmt(t.frac * 10) + "/10 × ." + f4(t.hi - t.lo).slice(2) + " ≈ ." + f4(t.frac * (t.hi - t.lo)).slice(2) + " — the mantissa is ." + f4(t.mantissa).slice(2) + ".");
 }
 steps.push("log₁₀(" + fmt(x) + ") = characteristic + mantissa = " + characteristic + " + ." + f4(t.mantissa).slice(2) + " = " + f4(characteristic + t.mantissa) + ".");
 return { ok: true, x, characteristic, digits: m, mantissa: t.mantissa, result: characteristic + t.mantissa, steps };
}
function supInt(n) {
 const sup = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
 return String(n).split("").map((c) => sup[c]).join("");
}

/* ---- Small helpers ---- */
function isPos(x) { return typeof x === "number" && isFinite(x) && x > 0; }
function fmt(n) {
 if (typeof n !== "number" || !isFinite(n)) return "—";
 const rounded = Math.abs(n) >= 100 ? Math.round(n * 10) / 10 : Math.round(n * 1000) / 1000;
 return Number(rounded).toLocaleString("en-US", { maximumFractionDigits: 3 });
}

const api = { lever, pulley, ramp, rampStandard, frameLean, fmt, RAMP_STANDARD_RATIO, LOG_TABLE, logMantissa, log10Table };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") Object.assign(window, api);
