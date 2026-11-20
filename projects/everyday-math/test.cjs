"use strict";
const assert = require("node:assert");
const M = require("./math.js");

function near(actual, expected, tol, msg) {
 assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* The nines table: two columns, digit sums always 9 */
const nines = M.ninesTable();
assert.strictEqual(nines.rows.length, 10, "ten rows: 9x1 through 9x10");
nines.rows.forEach((r, i) => {
 assert.strictEqual(r.tens, i, "tens column counts 0 up to 9");
 assert.strictEqual(r.ones, 9 - i, "ones column counts 9 down to 0");
 assert.strictEqual(r.product, 9 * (i + 1), "row " + (i + 1) + " is 9 x " + (i + 1));
 assert.strictEqual(r.digitSum, 9, "every row's digits sum to 9");
});
assert.strictEqual(nines.rows.map((r) => String(r.product).padStart(2, "0")).join(","), "09,18,27,36,45,54,63,72,81,90", "the table Steven specified");
assert.ok(nines.steps.join(" ").includes("10 − 1"), "the nines carry their why");

/* Times eleven: split, add, carry */
assert.strictEqual(M.timesEleven(47).result, 517, "47 x 11 = 517");
assert.strictEqual(M.timesEleven(52).result, 572, "52 x 11 = 572");
assert.strictEqual(M.timesEleven(85).result, 935, "85 x 11 = 935, with the carry");
assert.deepStrictEqual(M.timesEleven(85).digits, [9, 3, 5], "the carry lands in the first digit");
assert.strictEqual(M.timesEleven(7).result, 77, "7 x 11 = 77");
for (let n = 0; n <= 99; n++) assert.strictEqual(M.timesEleven(n).result, n * 11, "timesEleven(" + n + ") matches multiplication");
assert.ok(!M.timesEleven(123).ok && !M.timesEleven(-4).ok && !M.timesEleven(4.5).ok, "outside two whole digits is refused");

/* Squares ending in 5 */
assert.strictEqual(M.squareFive(35).result, 1225, "35^2 = 1225");
assert.strictEqual(M.squareFive(65).result, 4225, "65^2 = 4225");
assert.strictEqual(M.squareFive(115).result, 13225, "115^2 = 13225");
for (const n of [5, 15, 25, 45, 75, 85, 95, 105, 995]) assert.strictEqual(M.squareFive(n).result, n * n, "squareFive(" + n + ")");
assert.ok(!M.squareFive(34).ok && !M.squareFive(50).ok, "numbers not ending in 5 are refused");

/* Digit sums, roots, casting out nines */
assert.strictEqual(M.digitSum(1786), 22, "digit sum of 1786");
assert.strictEqual(M.digitalRoot(1786), 4, "digital root of 1786");
assert.strictEqual(M.digitalRoot(9), 9, "9's root is 9, not 0");
assert.strictEqual(M.digitalRoot(0), 0, "0's root is 0");
const good = M.castingOutNines(47, 38, 1786);
assert.ok(good.match && good.correct, "47 x 38 = 1786 passes and is right");
const wrong = M.castingOutNines(47, 38, 1796);
assert.ok(!wrong.match && !wrong.correct, "1796 fails the check and is wrong");
const sneaky = M.castingOutNines(47, 38, 1795);
assert.ok(sneaky.match && !sneaky.correct, "1795 is off by 9: passes the check, still wrong — the honest limit");
assert.ok(sneaky.steps.join(" ").includes("slips straight through"), "the limit is stated, not hidden");

/* Divisibility */
const div = M.divisibility(252);
assert.ok(div.ok);
const byD = Object.fromEntries(div.results.map((r) => [r.d, r.yes]));
assert.deepStrictEqual(byD, { 2: true, 3: true, 4: true, 5: false, 6: true, 9: true, 10: false, 11: false }, "252 divides by 2,3,4,6,9 only");
for (const n of [7, 12, 100, 121, 990, 123456]) {
 for (const r of M.divisibility(n).results) assert.strictEqual(r.yes, n % r.d === 0, "divisibility(" + n + ") by " + r.d);
}
assert.strictEqual(M.divisibility(121).results.find((r) => r.d === 11).yes, true, "121 passes the 11 rule: alternating sum 0");
assert.ok(!M.divisibility(0).ok && !M.divisibility(2.5).ok, "zero and non-integers are refused");

/* Fractions */
assert.deepStrictEqual(M.fracReduce(6, 8), { ok: true, num: 3, den: 4 }, "6/8 reduces to 3/4");
const fsum = M.fracAdd(3, 4, 1, 6);
assert.strictEqual(fsum.num, 11, "3/4 + 1/6 = 11/12");
assert.strictEqual(fsum.den, 12);
assert.ok(fsum.steps.join(" ").includes("least common denominator of 4 and 6 is 12"), "the shared cup is shown");
const fwhole = M.fracAdd(1, 2, 1, 2);
assert.strictEqual(fwhole.num, 1, "1/2 + 1/2 = 1");
const fscale = M.fracScale(3, 4, 2, 1);
assert.strictEqual(fscale.num, 3, "3/4 cup doubled is 3/2");
assert.strictEqual(fscale.den, 2);
assert.ok(fscale.steps.join(" ").includes("mixed number: 1 1/2"), "the scale bench speaks in measuring cups");
const fhalf = M.fracScale(3, 4, 1, 2);
assert.strictEqual(fhalf.num, 3, "3/4 halved is 3/8");
assert.strictEqual(fhalf.den, 8);
assert.ok(!M.fracAdd(1, 0, 1, 2).ok, "a zero denominator is refused");

/* Percents */
near(M.percentOf(20, 50).result, 10, 1e-12, "20% of 50");
const tip = M.tipAndTotal(40, 20);
near(tip.tip, 8, 1e-12, "20% tip on $40");
near(tip.total, 48, 1e-12, "total $48");
const disc = M.discountPrice(80, 25);
near(disc.save, 20, 1e-12, "25% off $80 saves $20");
near(disc.pay, 60, 1e-12, "you pay $60");
const interest = M.simpleInterest(500, 4, 3);
near(interest.interest, 60, 1e-9, "$500 at 4% simple for 3 years earns $60");
near(interest.total, 560, 1e-9, "ends at $560");

/* Pythagoras, both directions; averages */
near(M.pythagoras(3, 4).result, 5, 1e-12, "3-4-5 triangle");
near(M.pythagoras(6, 8).result, 10, 1e-12, "6-8-10");
near(M.pythagorasLeg(13, 5).result, 12, 1e-12, "hypotenuse 13, leg 5: other leg 12");
assert.ok(!M.pythagorasLeg(5, 13).ok, "a leg longer than the hypotenuse is refused");
const avg = M.average([84, 91, 77]);
near(avg.sum, 252, 1e-12, "scores sum to 252");
near(avg.result, 84, 1e-12, "average is 84");

/* Scientific notation and Avogadro */
const av = M.toScientific(M.AVOGADRO);
assert.strictEqual(av.exponent, 23, "Avogadro's exponent is 23");
near(av.mantissa, 6.022, 1e-12, "Avogadro's mantissa is 6.022");
const tiny = M.toScientific(0.0000000001);
assert.strictEqual(tiny.exponent, -10, "an atom's width: exponent -10");
near(tiny.mantissa, 1, 1e-12, "mantissa 1");
near(M.fromScientific(6.022, 23).value, M.AVOGADRO, M.AVOGADRO * 1e-12, "6.022 x 10^23 round-trips (to floating-point closeness, not exactness — the room's honesty point)");
near(M.fromScientific(3, 8).value, 300000000, 1e-6, "3 x 10^8");
assert.ok(!M.toScientific(0).ok, "zero has no scientific form here");

/* The log tables: tenths (pocket) and hundredths (print) */
assert.strictEqual(M.LOG_TABLE.length, 91, "91 tenths entries: 1.0 through 10.0");
assert.strictEqual(M.LOG_TABLE_FINE.length, 901, "901 hundredths entries: 1.00 through 10.00");
near(M.LOG_TABLE[10], 0.3010, 1e-12, "tenths mantissa for 2.0");
near(M.LOG_TABLE_FINE[100], 0.3010, 1e-12, "hundredths mantissa for 2.00");
near(M.LOG_TABLE_FINE[400], 0.6990, 1e-12, "hundredths mantissa for 5.00");
const lg500 = M.logSheet(500);
assert.strictEqual(lg500.characteristic, 2, "500 has characteristic 2");
near(lg500.result, 2.6990, 1e-9, "log10(500) = 2.6990 by the full table");
near(M.logSheet(1000).result, 3, 1e-9, "log10(1000) = 3 exactly — the sheet reaches 1000");
near(M.logSheet(2).result, 0.3010, 1e-9, "log10(2) = 0.3010");
const lg4372 = M.logSheet(4.372);
near(lg4372.result, Math.log10(4.372), 0.0002, "log 4.372 by proportional parts lands within two fourth-decimal units");
assert.ok(lg4372.steps.join(" ").includes("Proportional parts"), "the interpolation is shown as proportional parts");
for (const x of [3, 7, 12.5, 42, 99.9, 250, 999]) near(M.logSheet(x).result, Math.log10(x), 0.0002, "logSheet(" + x + ") vs the true log");
assert.ok(!M.logSheet(0).ok && !M.logSheet(-5).ok, "zero and negatives are refused");

/* The printable sheet's data: the 16x16 grid and the log table */
const grid = M.timesTable(16);
assert.ok(grid.ok);
assert.strictEqual(grid.grid[0][0], 1, "top-left corner: 1x1 = 1");
assert.strictEqual(grid.grid[0][15], 16, "top-right corner: 1x16 = 16");
assert.strictEqual(grid.grid[15][0], 16, "bottom-left corner: 16x1 = 16");
assert.strictEqual(grid.grid[15][15], 256, "bottom-right corner: 16x16 = 256");
for (let r = 1; r <= 16; r++) for (let c = 1; c <= 16; c++) assert.strictEqual(grid.grid[r - 1][c - 1], r * c, "grid " + r + "x" + c);
for (let i = 0; i <= 900; i++) {
 const want = Math.round(Math.log10(1 + i / 100) * 10000) / 10000;
 near(M.LOG_TABLE_FINE[i], want, 1e-12, "sheet mantissa for " + (1 + i / 100).toFixed(2));
}

/* The calculator's arithmetic */
near(M.calcFunc("log10", 1000, "deg").result, 3, 1e-12, "calculator: log10(1000) = 3");
near(M.calcApply("pow", 2, 10).result, 1024, 1e-12, "calculator: 2^10 = 1024");
near(M.calcFunc("sqrt", 144, "deg").result, 12, 1e-12, "calculator: root of 144 = 12");
near(M.calcFunc("sin", 30, "deg").result, 0.5, 1e-12, "calculator: sin 30 degrees = 0.5");
near(M.calcFunc("cos", 0, "deg").result, 1, 1e-12, "calculator: cos 0 = 1");
near(M.calcFunc("tan", 45, "deg").result, 1, 1e-9, "calculator: tan 45 degrees = 1");
near(M.calcFunc("ln", Math.E, "deg").result, 1, 1e-12, "calculator: ln e = 1");
near(M.calcFunc("exp10", 3, "deg").result, 1000, 1e-9, "calculator: 10^3");
assert.ok(!M.calcApply("/", 5, 0).ok, "division by zero is refused");
assert.ok(!M.calcFunc("log10", -2, "deg").ok && !M.calcFunc("sqrt", -1, "deg").ok, "out-of-domain functions are refused");
assert.ok(!M.calcFunc("tan", 90, "deg").ok, "tan 90 degrees is refused, not faked");
assert.strictEqual(M.calcFormat(2 / 3), "0.666666666667", "the display carries twelve significant digits");
assert.strictEqual(M.calcFormat(0.1 + 0.2), "0.3", "the display rounds the lie away — the Help card names it");
assert.strictEqual(String(0.1 + 0.2), "0.30000000000000004", "the lie itself, for the honesty card");
assert.strictEqual(M.calcFormat(M.AVOGADRO), "6.022e+23", "huge numbers display in scientific form");

/* Formatting */
assert.strictEqual(M.fmt(2500), "2,500");
assert.strictEqual(M.fmtMoney(48), "$48.00");
assert.strictEqual(M.supInt(-3), "⁻³");

console.log("everyday-math tests: all passed (nines, x11, squares in 5, casting out nines, divisibility, fractions, percents, pythagoras, averages, scientific notation, log tables + proportional parts, 16x16 grid, calculator)");
