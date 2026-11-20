"use strict";
const assert = require("node:assert");
const T = require("./time.js");

function near(actual, expected, tol, msg) {
  assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* The leap-year machine: the canonical four cases and one ordinary year */
assert.strictEqual(T.leapInfo(2000).leap, true, "2000 is a leap year (divisible by 400)");
assert.strictEqual(T.leapInfo(1900).leap, false, "1900 is NOT a leap year (divisible by 100, not 400)");
assert.strictEqual(T.leapInfo(2024).leap, true, "2024 is a leap year (divisible by 4)");
assert.strictEqual(T.leapInfo(2100).leap, false, "2100 will NOT be a leap year");
assert.strictEqual(T.leapInfo(2023).leap, false, "2023 is not a leap year");
const g1900 = T.leapInfo(1900);
assert.ok(g1900.byFour && g1900.byHundred && !g1900.byFourHundred, "1900 passes gate 1, is stopped at gate 2, fails gate 3");
near(T.GREGORIAN_YEAR, 365.2425, 1e-12, "the Gregorian rule averages 365.2425 days");
assert.ok(T.GREGORIAN_YEAR > T.TROPICAL_YEAR, "the rule overshoots the tropical year — slowly");
near((T.GREGORIAN_YEAR - T.TROPICAL_YEAR) * 3200, 1, 0.15, "the overshoot is about a day in 3,200 years");

/* The pendulum: T = 2π√(L/g) */
near(T.pendulumPeriod(1), 2.006, 0.002, "a 1 m pendulum: period ≈ 2.006 s");
near(T.pendulumPeriod(0.25), 1.003, 0.002, "a 0.25 m pendulum: period ≈ 1.003 s (quarter the length, half the period)");
near(T.pendulumPeriod(4), 2 * T.pendulumPeriod(1), 1e-9, "four times the length, twice the period");
near(T.secondsPendulumLength(), 0.994, 0.001, "the seconds pendulum is 0.994 m long");
near(T.pendulumPeriod(T.secondsPendulumLength()), 2, 1e-9, "the seconds pendulum's period is exactly 2 s");

/* The calendar count: known spans and known weekdays */
assert.strictEqual(T.daysFromCivil(1970, 1, 1), 0, "the day count starts at 1970-01-01");
assert.strictEqual(T.daysBetween(2026, 1, 1, 2026, 12, 31), 364, "2026-01-01 → 2026-12-31 is 364 days");
assert.strictEqual(T.daysBetween(2026, 12, 31, 2026, 1, 1), -364, "and −364 the other way");
assert.strictEqual(T.daysBetween(2024, 1, 1, 2025, 1, 1), 366, "leap year 2024 has 366 days");
assert.strictEqual(T.daysBetween(2025, 1, 1, 2026, 1, 1), 365, "2025 has 365");
assert.strictEqual(T.weekdayName(1970, 1, 1), "Thursday", "1970-01-01 was a Thursday");
assert.strictEqual(T.weekdayName(2026, 11, 20), "Friday", "2026-11-20 is a Friday");
assert.strictEqual(T.weekdayName(2000, 1, 1), "Saturday", "2000-01-01 was a Saturday");
assert.strictEqual(T.weekdayName(1969, 7, 20), "Sunday", "the Moon landing was a Sunday");
assert.strictEqual(T.dayOfYear(2026, 11, 20), 324, "Nov 20 is day 324 of a common year");
assert.strictEqual(T.dayOfYear(2024, 12, 31), 366, "Dec 31 of a leap year is day 366");

/* Time zones: one UTC moment, seven wall clocks */
const noon = T.zoneReadout(T.daysFromCivil(2026, 11, 20), 12); // Friday 12:00 UTC
const byName = (rows, n) => rows.find((r) => r.name.startsWith(n));
assert.strictEqual(byName(noon, "Defiance").hour, 7, "noon UTC is 7 AM in Defiance (UTC−5)");
assert.strictEqual(byName(noon, "Chicago").hour, 6, "6 AM in Chicago");
assert.strictEqual(byName(noon, "Los Angeles").hour, 4, "4 AM in Los Angeles");
assert.strictEqual(byName(noon, "London").hour, 12, "noon in London");
assert.strictEqual(byName(noon, "Berlin").hour, 13, "1 PM in Berlin");
assert.strictEqual(byName(noon, "Tokyo").hour, 21, "9 PM in Tokyo");
assert.strictEqual(byName(noon, "Sydney").hour, 22, "10 PM in Sydney (standard)");
assert.ok(noon.every((r) => r.dayShift === 0 && r.weekday === "Friday"), "at noon UTC everyone is still on Friday");
const early = T.zoneReadout(T.daysFromCivil(2026, 11, 20), 2); // Friday 02:00 UTC
assert.strictEqual(byName(early, "Defiance").hour, 21, "02:00 UTC is 9 PM in Defiance…");
assert.strictEqual(byName(early, "Defiance").weekday, "Thursday", "…on Thursday — still yesterday there");
assert.strictEqual(byName(early, "Defiance").dayShift, -1);
assert.strictEqual(byName(early, "Tokyo").hour, 11, "and 11 AM Friday in Tokyo");
const late = T.zoneReadout(T.daysFromCivil(2026, 11, 20), 23); // Friday 23:00 UTC
assert.strictEqual(byName(late, "Tokyo").hour, 8, "23:00 UTC Friday is 8 AM in Tokyo…");
assert.strictEqual(byName(late, "Tokyo").weekday, "Saturday", "…on Saturday — already tomorrow there");
assert.strictEqual(byName(late, "Tokyo").dayShift, 1);
assert.strictEqual(T.CITIES.length, 7, "seven cities on the bench");

/* The sundial: hour-line angles by the tan formula */
near(T.sundialHourAngle(41.3, 15), 33.4, 0.15, "Defiance, 3 PM: the hour line sits ≈33.4° from noon");
near(T.sundialHourAngle(41.3, 12), 0, 1e-9, "at noon the line is the noon line");
near(T.sundialHourAngle(41.3, 9), -33.4, 0.15, "9 AM mirrors 3 PM");
near(T.sundialHourAngle(41.3, 18), 90, 0.01, "6 PM lies along the east–west line");
near(T.sundialHourAngle(0, 15), 0, 1e-9, "on the equator every hour line collapses to the noon line — the dial fails there");
assert.ok(T.sundialHourAngle(61.2, 15) > T.sundialHourAngle(24.6, 15), "higher latitude spreads the hour lines wider");

/* The equation of time: the four famous zero/extreme days */
near(T.equationOfTime(324), 13.7, 0.7, "Nov 20: the sundial runs ≈14 minutes fast");
near(T.equationOfTime(42), -14.2, 0.7, "Feb 11: the sundial runs ≈14 minutes slow — the year's extreme");
near(T.equationOfTime(105), 0, 0.6, "Apr 15: sundial and clock agree");
near(T.equationOfTime(165), 0, 0.6, "Jun 14: they agree again");
assert.ok(T.equationOfTime(305) > 15, "early November holds the year's other extreme, past +15 minutes");

/* Sundial vs clock in Defiance: longitude does most of it */
const def = T.sundialVsClock(324, -84.36, -75);
near(def.longitudeShift, -37.44, 0.01, "Defiance sits 9.36° west of its zone meridian: −37.4 minutes");
near(def.total, -23.7, 1.0, "on Nov 20 a Defiance sundial reads ≈24 minutes behind the clock");
const lon = T.sundialVsClock(105, -0.13, 0);
near(lon.total, -0.5, 0.7, "in London in mid-April, sundial and clock nearly agree");

/* The ladder and the heartbeat count */
assert.strictEqual(T.LADDER.length, 8, "eight rungs");
for (let i = 1; i < T.LADDER.length; i++) {
  assert.ok(T.LADDER[i].seconds > T.LADDER[i - 1].seconds, "each rung is longer than the last");
}
near(T.LADDER[4].seconds, 7 * 86400, 1e-9, "a week is exactly seven days");
near(T.lifetimeHeartbeats(40, 70), 1.4727e9, 2e6, "40 years at 70 bpm ≈ 1.47 billion beats");
near(T.lifetimeHeartbeats(80, 60), 2.5244e9, 2e6, "80 years at 60 bpm ≈ 2.52 billion beats");
near(T.lifetimeSeconds(95) / 1e9, 3.0, 0.02, "95 years is about 3 billion seconds");
assert.ok(T.lifetimeHeartbeats(1, 60) < T.lifetimeHeartbeats(1, 70), "a faster heart clocks more beats");

console.log("Everyday Time: all rule tests passed.");
