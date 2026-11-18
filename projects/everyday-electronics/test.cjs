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

console.log("everyday-electronics tests: all passed (circuit bench, Ohm's law bench, E12 rounding, LED resistor bench)");
