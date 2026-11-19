"use strict";
const assert = require("node:assert");
const E = require("./elec.js");

/* Circuit bench: I = V ÷ R, P = V × I, switch open means dark */
let s = E.circuitState(6, 12, true);
assert.ok(s.ok && s.current === 0.5 && s.power === 3, "6 V across 12 Ω gives 0.5 A and 3 W");
assert.strictEqual(s.brightness, 1, "3 W is fully bright on the picture scale");
s = E.circuitState(3, 12, true);
assert.ok(s.current === 0.25 && s.power === 0.75 && s.brightness === 0.25, "3 V across 12 Ω gives 0.25 A, 0.75 W, quarter brightness");
s = E.circuitState(12, 6, true);
assert.ok(s.current === 2 && s.power === 24 && s.brightness === 1, "brightness never exceeds fully bright");
s = E.circuitState(6, 12, false);
assert.ok(s.ok && s.current === 0 && s.power === 0 && s.brightness === 0, "open switch: no current, no power, dark bulb");
assert.ok(!E.circuitState(0, 12, true).ok, "zero volts refused");
assert.ok(!E.circuitState(6, 0, true).ok, "zero resistance refused");
assert.ok(!E.circuitState("x", 12, true).ok, "nonsense volts refused");

/* Ohm's law bench: each of the three solved from the other two */
let r = E.ohmSolve({ i: 0.5, r: 12 });
assert.ok(r.ok && r.solved === "v" && r.v === 6, "V = I × R: 0.5 × 12 = 6");
r = E.ohmSolve({ v: 9, r: 45 });
assert.ok(r.ok && r.solved === "i" && r.i === 0.2, "I = V ÷ R: 9 ÷ 45 = 0.2");
r = E.ohmSolve({ v: 9, i: 0.2 });
assert.ok(r.ok && r.solved === "r" && r.r === 45, "R = V ÷ I: 9 ÷ 0.2 = 45");
assert.ok(r.steps[1].includes("9 ÷ 0.2 = 45"), "the working is shown");
assert.ok(!E.ohmSolve({ v: 9 }).ok, "only one value is refused");
assert.ok(!E.ohmSolve({ v: 9, i: 1, r: 9 }).ok, "all three filled is refused");
assert.ok(!E.ohmSolve({ v: 9, i: 0 }).ok, "zero current is refused");
assert.ok(!E.ohmSolve({ v: "abc", r: 10 }).ok, "nonsense input is refused");
assert.ok(!E.ohmSolve({}).ok, "empty input is refused");

/* E12: the standard values, rounding UP only */
assert.strictEqual(E.E12_BASE.length, 12, "twelve values per decade");
assert.strictEqual(E.nearestE12Up(220), 220, "220 is itself an E12 value");
assert.strictEqual(E.nearestE12Up(221), 270, "221 rounds UP to 270, never down");
assert.strictEqual(E.nearestE12Up(100), 100);
assert.strictEqual(E.nearestE12Up(101), 120);
assert.strictEqual(E.nearestE12Up(999), 1000, "crossing a decade works");
assert.strictEqual(E.nearestE12Up(47), 47);
assert.strictEqual(E.nearestE12Up(48), 56);
assert.strictEqual(E.nearestE12Up(0), null, "zero has no E12 value");
assert.strictEqual(E.formatOhms(220), "220 Ω");
assert.strictEqual(E.formatOhms(4700), "4.7 kΩ");
assert.strictEqual(E.formatOhms(1000), "1 kΩ");

/* LED bench: the textbook cases */
let led = E.ledResistor(5, 2.0, 20); /* 5 V supply, red LED, 20 mA */
assert.ok(led.ok && led.dropVolts === 3 && led.exactOhms === 150 && led.e12Ohms === 150,
 "5 V red LED at 20 mA needs exactly 150 Ω");
assert.strictEqual(led.resistorPowerMW, 60, "3 V × 0.02 A = 60 mW in the resistor");
led = E.ledResistor(9, 2.0, 20); /* 9 V battery, red LED */
assert.ok(led.exactOhms === 350 && led.e12Ohms === 390, "9 V red LED: 350 Ω exact, 390 Ω standard (rounded UP)");
led = E.ledResistor(5, 3.2, 20); /* blue LED on 5 V */
assert.ok(led.dropVolts === 1.8 && led.exactOhms === 90 && led.e12Ohms === 100,
 "5 V blue LED: 1.8 V to drop, 90 Ω exact, 100 Ω standard");
led = E.ledResistor(3.7, 2.0, 10);
assert.ok(led.ok && led.e12Ohms >= led.exactOhms, "the standard value is never below the exact need");
assert.ok(!E.ledResistor(3, 3.2, 20).ok, "supply below the LED's forward voltage is refused in plain words");
assert.ok(!E.ledResistor(5, 2.0, 0).ok, "zero current is refused");
assert.strictEqual(E.ledById("red").vf, 2.0, "red LED preset is 2.0 V");
assert.strictEqual(E.ledById("white").vf, 3.2, "white LED preset is 3.2 V");
assert.strictEqual(E.ledById("nope"), null);
assert.strictEqual(E.LED_TYPES.length, 5, "five LED colour presets");

/* ---- The breadboard: tie rules first ---- */
assert.strictEqual(E.bbNet({ row: 7, col: "a" }), E.bbNet({ row: 7, col: "e" }), "a row's left five holes are one net");
assert.notStrictEqual(E.bbNet({ row: 7, col: "e" }), E.bbNet({ row: 7, col: "f" }), "the centre gap separates e from f");
assert.strictEqual(E.bbNet({ row: 7, col: "f" }), E.bbNet({ row: 7, col: "j" }), "a row's right five holes are one net");
assert.notStrictEqual(E.bbNet({ row: 7, col: "a" }), E.bbNet({ row: 8, col: "a" }), "different rows are different nets");
assert.strictEqual(E.bbNet({ rail: "L+", row: 3 }), E.bbNet({ rail: "L+", row: 29 }), "a rail is one long net, any row");

const N = (row, col) => E.bbNet({ row, col });
const RAIL = r => E.bbNet({ rail: r });

/* LED + 220 Ω on 5 V: lights, sane current */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 5 },
  { kind: "wire", a: RAIL("L+"), b: N(10, "a") },
  { kind: "resistor", a: N(10, "b"), b: N(14, "b"), ohms: 220 },
  { kind: "led", anode: N(14, "c"), cathode: N(18, "c"), color: "red" },
  { kind: "wire", a: N(18, "a"), b: RAIL("L-") }
 ]);
 sim.step(50);
 const rep = sim.partReport(3);
 const ma = rep.current * 1000;
 assert.ok(rep.lit, "LED + 220 Ω on 5 V lights");
 assert.ok(ma > 10 && ma < 15, "current is a sane 10–15 mA (got " + ma.toFixed(1) + ")");
 assert.ok(!sim.isShorted(), "a healthy circuit is not a short");
}
/* LED backwards: dark, no current */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 5 },
  { kind: "wire", a: RAIL("L+"), b: N(10, "a") },
  { kind: "resistor", a: N(10, "b"), b: N(14, "b"), ohms: 220 },
  { kind: "led", anode: N(18, "c"), cathode: N(14, "c"), color: "red" },
  { kind: "wire", a: N(18, "a"), b: RAIL("L-") }
 ]);
 sim.step(50);
 const rep = sim.partReport(3);
 assert.ok(!rep.lit && Math.abs(rep.current) < 1e-6, "an LED placed backwards does not light");
}
/* LED bare on 9 V: overcurrent, then it pops */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 9 },
  { kind: "wire", a: RAIL("L+"), b: N(10, "a") },
  { kind: "led", anode: N(10, "c"), cathode: N(14, "c"), color: "red" },
  { kind: "wire", a: N(14, "a"), b: RAIL("L-") }
 ]);
 sim.step(5);
 let rep = sim.partReport(2);
 assert.ok(rep.over, "a bare LED on 9 V is flagged overcurrent before it dies");
 sim.step(Math.ceil(0.3 / sim.dt()));
 rep = sim.partReport(2);
 assert.ok(rep.popped, "sustained overcurrent pops the LED");
 assert.ok(!rep.lit && rep.current === 0, "a popped LED is an open circuit");
}
/* A dead short across the battery: warning state, finite numbers */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 9 },
  { kind: "wire", a: RAIL("L+"), b: RAIL("L-") }
 ]);
 sim.step(5);
 assert.ok(sim.isShorted(), "a wire straight across the battery reads as a short circuit");
 const sim2 = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 9 },
  { kind: "switch", a: RAIL("L+"), b: RAIL("L-"), closed: true }
 ]);
 sim2.step(5);
 assert.ok(sim2.isShorted(), "a closed switch across the battery is also a short");
 assert.ok(Number.isFinite(sim2.nodeVoltage(RAIL("L+"))), "readouts stay finite in a short");
}
/* RC charge: ≈63% of supply at t = RC */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 5 },
  { kind: "wire", a: RAIL("L+"), b: N(8, "a") },
  { kind: "resistor", a: N(8, "b"), b: N(12, "b"), ohms: 1000 },
  { kind: "capacitor", a: N(12, "c"), b: N(16, "c"), farads: 100e-6 },
  { kind: "wire", a: N(16, "a"), b: RAIL("L-") }
 ]);
 const tau = 1000 * 100e-6;
 sim.step(Math.round(tau / sim.dt()));
 const v = sim.partReport(3).charge;
 assert.ok(Math.abs(v - 5 * 0.632) < 5 * 0.05, "capacitor reaches ≈63% of supply at t = RC (got " + v.toFixed(2) + " V of 5 V)");
 sim.step(Math.round(4 * tau / sim.dt()));
 assert.ok(sim.partReport(3).charge > 4.8, "and is essentially full by 5τ");
}
/* LED on AC: conducts on one half-cycle only */
{
 const sim = E.createBreadboard([
  { kind: "ac", plus: RAIL("L+"), minus: RAIL("L-"), amp: 5, freq: 60 },
  { kind: "wire", a: RAIL("L+"), b: N(10, "a") },
  { kind: "resistor", a: N(10, "b"), b: N(14, "b"), ohms: 220 },
  { kind: "led", anode: N(14, "c"), cathode: N(18, "c"), color: "red" },
  { kind: "wire", a: N(18, "a"), b: RAIL("L-") }
 ], { dt: 1 / 4800 });
 const stepsPerCycle = Math.round((1 / 60) / sim.dt());
 sim.step(stepsPerCycle); /* settle one cycle */
 let conducting = 0, peak = 0;
 for (let k = 0; k < stepsPerCycle; k++) {
  sim.step(1);
  const i = sim.partReport(3).current;
  if (i > 0.001) conducting++;
  peak = Math.max(peak, i);
 }
 const frac = conducting / stepsPerCycle;
 assert.ok(peak * 1000 > 5, "the LED passes real current on its half-cycle (peak " + (peak * 1000).toFixed(1) + " mA)");
 assert.ok(frac > 0.2 && frac < 0.55, "and conducts on roughly half the cycle, never the other half (fraction " + frac.toFixed(2) + ")");
}
/* The transistor amplifier: the preset circuit, gain measured honestly.
   9 V battery; AC source 0.2 V peak at 60 Hz through a 10 µF coupling
   capacitor; divider bias 10 kΩ / 1 kΩ; emitter resistor 100 Ω;
   collector resistor 1 kΩ; output probed at the collector. */
{
 const parts = [
  { kind: "battery", plus: RAIL("R+"), minus: RAIL("R-"), volts: 9 },
  { kind: "ac", plus: N(26, "f"), minus: RAIL("R-"), amp: 0.2, freq: 60 },
  { kind: "capacitor", a: N(26, "h"), b: N(22, "h"), farads: 10e-6 },
  { kind: "wire", a: N(22, "f"), b: N(15, "f") },
  { kind: "resistor", a: RAIL("R+"), b: N(15, "j"), ohms: 10000 },
  { kind: "resistor", a: N(15, "g"), b: RAIL("R-"), ohms: 1000 },
  { kind: "transistor", c: N(14, "h"), b: N(15, "h"), e: N(16, "h") },
  { kind: "resistor", a: N(14, "j"), b: RAIL("R+"), ohms: 1000 },
  { kind: "resistor", a: N(16, "j"), b: RAIL("R-"), ohms: 100 },
  { kind: "capacitor", a: N(14, "f"), b: N(10, "f"), farads: 10e-6 }
 ];
 const sim = E.createBreadboard(parts, { dt: 1 / 2400 });
 sim.step(Math.round(0.5 / sim.dt()));   /* let the bias and coupling settle */
 const tr = sim.partReport(6);
 assert.ok(tr.mode === "active", "the transistor sits in its active region (mode: " + tr.mode + ")");
 assert.ok(tr.vce > 2 && tr.vce < 8.5, "with a sane collector-emitter voltage (got " + tr.vce.toFixed(2) + " V)");
 const stepsPerCycle = Math.round((1 / 60) / sim.dt());
 let inMin = 1e9, inMax = -1e9, outMin = 1e9, outMax = -1e9;
 for (let k = 0; k < stepsPerCycle * 2; k++) {
  sim.step(1);
  const vin = sim.nodeVoltage(N(26, "f")), vout = sim.nodeVoltage(N(10, "f"));
  inMin = Math.min(inMin, vin); inMax = Math.max(inMax, vin);
  outMin = Math.min(outMin, vout); outMax = Math.max(outMax, vout);
 }
 const gain = (outMax - outMin) / (inMax - inMin);
 console.log("  amplifier bench: input " + (inMax - inMin).toFixed(3) + " V peak-to-peak at the source, output " + (outMax - outMin).toFixed(3) + " V peak-to-peak — measured gain ×" + gain.toFixed(1));
 assert.ok(gain > 5, "the amplifier's output swing beats its input swing by a clear factor (×" + gain.toFixed(1) + ")");
 assert.ok(gain < 40, "and the gain is the honest single-stage kind, not a runaway (×" + gain.toFixed(1) + ")");
}
/* A transistor with no base drive stays off */
{
 const sim = E.createBreadboard([
  { kind: "battery", plus: RAIL("L+"), minus: RAIL("L-"), volts: 9 },
  { kind: "resistor", a: RAIL("L+"), b: N(10, "b"), ohms: 1000 },
  { kind: "transistor", c: N(10, "c"), b: N(12, "c"), e: N(14, "c") },
  { kind: "wire", a: N(14, "a"), b: RAIL("L-") }
 ]);
 sim.step(50);
 const tr = sim.partReport(2);
 assert.ok(tr.mode === "off" && tr.ic === 0, "no base current, no collector current — the switch stays open");
}

/* ---- The crystal radio bench ---- */
{
 const f = E.crystalFreq(250e-6, 100e-12);
 assert.ok(Math.abs(f - 1007e3) < 8e3, "L = 250 µH, C = 100 pF resonates at ≈1007 kHz (got " + (f / 1000).toFixed(1) + " kHz)");
 const fMin = E.crystalFreq(E.CR_L, E.CR_C_MAX), fMax = E.crystalFreq(E.CR_L, E.CR_C_MIN);
 assert.ok(fMin > 500e3 && fMin < 560e3, "the 365 pF end of the dial reaches the bottom of the AM band (" + (fMin / 1000).toFixed(0) + " kHz)");
 assert.ok(fMax > 1500e3 && fMax < 1700e3, "the 40 pF end reaches most of the top (" + (fMax / 1000).toFixed(0) + " kHz)");
 assert.strictEqual(E.crystalLevel(830e3, 830e3), 1, "dead on a station, the level is full");
 assert.ok(E.crystalLevel(900e3, 830e3) < 0.05, "70 kHz away, the neighbouring station is gone");
 assert.strictEqual(E.CR_STATIONS.length, 5, "five invented stations on the bench dial");
 assert.ok(E.crystalHearing(0.05, false).startsWith("Static"), "between stations, straight to the earpiece: static");
 assert.ok(E.crystalHearing(0.9, true).includes("small speaker"), "on a station with the amplifier: loud enough for a small speaker");
}

console.log("everyday-electronics tests: all passed (circuit bench, Ohm's law bench, E12 rounding, LED resistor bench, breadboard ties + simulation, transistor amplifier, crystal radio bench)");
