// Compass-rose rules for The Map Room's trainer. No DOM code lives here,
// so Node can check the rules directly (see test.cjs).
'use strict';

// The sixteen points of the compass rose, clockwise from north.
// Degrees are the bearing you would walk to head that way.
const POINTS = [
  { name: 'North', abbr: 'N', degrees: 0 },
  { name: 'North-northeast', abbr: 'NNE', degrees: 22.5 },
  { name: 'Northeast', abbr: 'NE', degrees: 45 },
  { name: 'East-northeast', abbr: 'ENE', degrees: 67.5 },
  { name: 'East', abbr: 'E', degrees: 90 },
  { name: 'East-southeast', abbr: 'ESE', degrees: 112.5 },
  { name: 'Southeast', abbr: 'SE', degrees: 135 },
  { name: 'South-southeast', abbr: 'SSE', degrees: 157.5 },
  { name: 'South', abbr: 'S', degrees: 180 },
  { name: 'South-southwest', abbr: 'SSW', degrees: 202.5 },
  { name: 'Southwest', abbr: 'SW', degrees: 225 },
  { name: 'West-southwest', abbr: 'WSW', degrees: 247.5 },
  { name: 'West', abbr: 'W', degrees: 270 },
  { name: 'West-northwest', abbr: 'WNW', degrees: 292.5 },
  { name: 'Northwest', abbr: 'NW', degrees: 315 },
  { name: 'North-northwest', abbr: 'NNW', degrees: 337.5 },
];

// The eight points every Scout learns first: cardinals and intercardinals.
const MAIN = POINTS.filter(p => p.degrees % 45 === 0);

function byName(name) {
  return POINTS.find(p => p.name === name) || null;
}

function byAbbr(abbr) {
  return POINTS.find(p => p.abbr === abbr) || null;
}

// Wrap any bearing into 0..360.
function normalize(degrees) {
  return ((degrees % 360) + 360) % 360;
}

// The nearest compass point for a bearing, e.g. pointAt(359) is North.
function pointAt(degrees) {
  const d = normalize(degrees);
  const idx = Math.round(d / 22.5) % 16;
  return POINTS[idx];
}

// The point on the far side of the rose: the way back home.
function opposite(name) {
  const p = byName(name);
  if (!p) return null;
  return pointAt(p.degrees + 180);
}

// How far you turn clockwise from one point to face another, 0..360.
function turnDegrees(fromName, toName) {
  const a = byName(fromName), b = byName(toName);
  if (!a || !b) return null;
  return normalize(b.degrees - a.degrees);
}

function checkAnswer(targetName, guessName) {
  return targetName === guessName;
}

// Points for a correct answer: a small streak bonus that caps at +20,
// so a careful run of five or more earns 30 a question.
function pointsFor(streak) {
  if (!streak || streak < 1) return 0;
  return 10 + 5 * Math.min(streak - 1, 4);
}

// Seeded random, so tests (and curious readers) can replay a run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick the next target from a pool, never repeating the previous one.
function pickTarget(rng, pool, previousName) {
  const choices = pool.filter(p => p.name !== previousName);
  return choices[Math.floor(rng() * choices.length)];
}

const api = { POINTS, MAIN, byName, byAbbr, normalize, pointAt, opposite, turnDegrees, checkAnswer, pointsFor, mulberry32, pickTarget };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.CompassRules = api;
