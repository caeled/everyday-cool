"use strict";
/* Everyday Time — the pure rules: sundials and the equation of time,
   the leap-year machine, time zones from one UTC moment, the scale
   ladder and a lifetime of heartbeats, the pendulum, and calendar
   arithmetic. No DOM — app.js wires this to the page, and test.cjs
   checks it in Node. */

/* ---------------- The sundial ---------------- */

/* A horizontal sundial's hour lines. The angle of the line for an
   hour, measured from the noon line, is
       tan(angle) = sin(latitude) × tan(hour angle),
   with the hour angle 15° for every hour from noon. At the equator
   (latitude 0) sin is 0 and every line collapses onto the east–west
   line — a horizontal dial cannot work there, and the bench says so. */
function sundialHourAngle(latDeg, hour) {
  const lat = latDeg * Math.PI / 180;
  const H = (hour - 12) * 15 * Math.PI / 180;
  if (Math.abs(Math.cos(H)) < 1e-9) return hour < 12 ? -90 : 90;
  return Math.atan(Math.sin(lat) * Math.tan(H)) * 180 / Math.PI;
}

/* The equation of time: how far apparent solar time (what a sundial
   reads) runs ahead of mean time (what a steady clock keeps), in
   minutes, for a day of the year. The standard approximation —
   good to well under a minute — combines the two causes: Earth's
   elliptical orbit and its tilted axis. Positive = the sundial is
   AHEAD of the clock ("sun fast"). */
function equationOfTime(dayOfYear) {
  const B = 360 / 365 * (dayOfYear - 81) * Math.PI / 180;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/* How far a sundial in one place disagrees with the wall clock,
   before daylight saving enters into it:
     sundial − clock = equation of time + 4 minutes per degree of
     longitude between you and your time zone's standard meridian
   (east of the meridian, the sun comes earlier: positive). */
function sundialVsClock(dayOfYear, longitudeDeg, zoneMeridianDeg) {
  const eot = equationOfTime(dayOfYear);
  const longitudeShift = 4 * (longitudeDeg - zoneMeridianDeg);
  return { eot, longitudeShift, total: eot + longitudeShift };
}

const SUNDIAL_PRESETS = [
  { name: "Defiance, Ohio", lat: 41.3, lon: -84.36, meridian: -75, zone: "Eastern standard meridian, 75°W" },
  { name: "New York City", lat: 40.7, lon: -74.0, meridian: -75, zone: "Eastern standard meridian, 75°W" },
  { name: "Key West, Florida", lat: 24.6, lon: -81.8, meridian: -75, zone: "Eastern standard meridian, 75°W" },
  { name: "London", lat: 51.5, lon: -0.13, meridian: 0, zone: "Greenwich meridian, 0°" },
  { name: "Anchorage, Alaska", lat: 61.2, lon: -149.9, meridian: -135, zone: "Alaska standard meridian, 135°W" },
  { name: "Quito, Ecuador — on the equator", lat: 0.0, lon: -78.5, meridian: -75, zone: "Ecuador standard meridian, 75°W" },
];

/* ---------------- The leap-year machine ---------------- */

/* The Gregorian rule, as three gates: divisible by 4 → leap,
   EXCEPT divisible by 100 → not leap, EXCEPT divisible by 400 →
   leap after all. */
function leapInfo(year) {
  const byFour = year % 4 === 0;
  const byHundred = year % 100 === 0;
  const byFourHundred = year % 400 === 0;
  return { byFour, byHundred, byFourHundred, leap: (byFour && !byHundred) || byFourHundred };
}

/* The average year the rule produces:
   365 + 1/4 − 1/100 + 1/400 = 365.2425 days.
   The real (tropical) year is about 365.2422 — the rule overshoots
   by roughly 0.0003 days a year, about a day in 3,200 years. */
const GREGORIAN_YEAR = 365 + 1 / 4 - 1 / 100 + 1 / 400;
const TROPICAL_YEAR = 365.2422;

/* ---------------- Time zones ---------------- */

/* A fixed set of cities at their STANDARD offsets from UTC. Daylight
   saving moves several of them by an hour for part of the year —
   the page names which, and roughly when. The bench computes from a
   single entered UTC moment; it never looks at the visitor's clock. */
const CITIES = [
  { name: "Defiance & New York", zone: "US Eastern", offset: -5, dst: "Daylight time (UTC−4) from the second Sunday of March to the first Sunday of November." },
  { name: "Chicago", zone: "US Central", offset: -6, dst: "Daylight time (UTC−5), same US dates as Eastern." },
  { name: "Los Angeles", zone: "US Pacific", offset: -8, dst: "Daylight time (UTC−7), same US dates as Eastern." },
  { name: "London", zone: "Greenwich Mean Time", offset: 0, dst: "British Summer Time (UTC+1) from the last Sunday of March to the last Sunday of October." },
  { name: "Berlin", zone: "Central European Time", offset: 1, dst: "Summer time (UTC+2), same European dates as London." },
  { name: "Tokyo", zone: "Japan Standard Time", offset: 9, dst: "Japan does not change its clocks — this offset holds all year." },
  { name: "Sydney", zone: "Australian Eastern Standard", offset: 10, dst: "Daylight time (UTC+11) from the first Sunday of October to the first Sunday of April — the southern summer." },
];

/* One UTC moment in, every city's wall clock out.
   utcDays is a whole-day count (daysFromCivil), hourUtc 0–23.
   Each result: the local day shift (−1, 0, +1), local hour, and the
   weekday index (0 = Sunday) of the local date. */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function zoneReadout(utcDays, hourUtc) {
  return CITIES.map((c) => {
    const total = hourUtc + c.offset;
    const dayShift = Math.floor(total / 24);
    const hour = total - dayShift * 24;
    return {
      name: c.name, zone: c.zone, offset: c.offset, dst: c.dst,
      dayShift, hour, weekday: WEEKDAYS[weekdayIndex(utcDays + dayShift)],
    };
  });
}

/* ---------------- The calendar count ---------------- */

/* Days since 1970-01-01 in the proleptic Gregorian calendar —
   Howard Hinnant's days-from-civil algorithm, all integer
   arithmetic, no clocks involved. */
function daysFromCivil(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = (m + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/* 1970-01-01 was a Thursday. Weekday index 0 = Sunday. */
function weekdayIndex(days) {
  return (((days % 7) + 7) % 7 + 4) % 7;
}
function weekdayName(y, m, d) { return WEEKDAYS[weekdayIndex(daysFromCivil(y, m, d))]; }

function daysBetween(y1, m1, d1, y2, m2, d2) {
  return daysFromCivil(y2, m2, d2) - daysFromCivil(y1, m1, d1);
}

/* Day of the year for a date (1 = January 1). */
function dayOfYear(y, m, d) {
  return daysFromCivil(y, m, d) - daysFromCivil(y, 1, 1) + 1;
}

/* ---------------- The scale ladder ---------------- */

/* Durations, small to ungraspable, each with a feel-it anchor.
   seconds uses the mean Gregorian year (365.2425 days) for the year
   and century rungs, and 4.54 billion of those years for the Earth. */
const YEAR_SECONDS = 365.2425 * 86400;
const LADDER = [
  { name: "A second", seconds: 1, anchor: "One heartbeat, roughly. The smallest rung your own body can feel." },
  { name: "A minute", seconds: 60, anchor: "Sixty heartbeats. A kettle thinking about boiling." },
  { name: "An hour", seconds: 3600, anchor: "One class, one meeting, one long lunch — the working world's brick." },
  { name: "A day", seconds: 86400, anchor: "One full turn of the Earth under the Sun. Every clock and calendar starts here." },
  { name: "A week", seconds: 604800, anchor: "Seven turns. The only rung on this ladder that comes from people, not planets — no sky motion makes a week." },
  { name: "A year", seconds: YEAR_SECONDS, anchor: "One full trip around the Sun: 365.2425 of our days, which is why the leap machine exists." },
  { name: "A century", seconds: YEAR_SECONDS * 100, anchor: "Longer than almost any human life. The longest verified life on record is 122 years — one century and a fifth." },
  { name: "The age of the Earth", seconds: YEAR_SECONDS * 4.54e9, anchor: "4.54 billion years of days — every heartbeat that has ever happened happened on the top sliver of this rung." },
];

/* Heartbeats in a lifetime: rate × minutes × hours × days × years. */
function lifetimeHeartbeats(ageYears, restingBpm) {
  return restingBpm * 60 * 24 * 365.2425 * ageYears;
}
/* Seconds lived by a given age. */
function lifetimeSeconds(ageYears) { return ageYears * YEAR_SECONDS; }

/* ---------------- The pendulum ---------------- */

/* The period of a simple pendulum, small swings:
   T = 2π√(L/g), with g = 9.81 m/s². A one-metre pendulum swings
   with a period of almost exactly two seconds — the "seconds
   pendulum" (0.994 m) ticks once a second, which is why grandfather
   clocks are the height they are. */
const GRAVITY = 9.81;
function pendulumPeriod(lengthM) { return 2 * Math.PI * Math.sqrt(lengthM / GRAVITY); }
function secondsPendulumLength() { return GRAVITY / Math.pow(Math.PI, 2); } // T = 2 s exactly

/* ---------------- Small helpers ---------------- */

function fmt(x, digits) {
  if (!isFinite(x)) return "—";
  const d = digits == null ? 2 : digits;
  return Number(x.toFixed(d)).toLocaleString("en-US", { maximumFractionDigits: d });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sundialHourAngle, equationOfTime, sundialVsClock, SUNDIAL_PRESETS,
    leapInfo, GREGORIAN_YEAR, TROPICAL_YEAR,
    CITIES, zoneReadout, WEEKDAYS,
    daysFromCivil, weekdayIndex, weekdayName, daysBetween, dayOfYear,
    LADDER, YEAR_SECONDS, lifetimeHeartbeats, lifetimeSeconds,
    GRAVITY, pendulumPeriod, secondsPendulumLength, fmt,
  };
}
