const a = require('node:assert/strict'), c = require('./compass.js');

// The rose has sixteen points, evenly spaced, starting at north.
a.equal(c.POINTS.length, 16);
a.equal(c.POINTS[0].name, 'North');
a.equal(c.POINTS[0].degrees, 0);
for (let i = 1; i < 16; i++) a.equal(c.POINTS[i].degrees - c.POINTS[i - 1].degrees, 22.5);
// The eight main points are every other point on the rose.
a.deepEqual(c.MAIN.map(p => p.abbr), ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
// Bearings wrap: 360 is north again, and so is -45's neighbour northwest.
a.equal(c.normalize(360), 0);
a.equal(c.normalize(-90), 270);
a.equal(c.pointAt(0).name, 'North');
a.equal(c.pointAt(359).name, 'North');
a.equal(c.pointAt(90).name, 'East');
a.equal(c.pointAt(-45).name, 'Northwest');
a.equal(c.pointAt(202.5).abbr, 'SSW');
// Opposite is the way back home, and it works both directions.
a.equal(c.opposite('North').name, 'South');
a.equal(c.opposite('Northeast').name, 'Southwest');
a.equal(c.opposite(c.opposite('West').name).name, 'West');
// Clockwise turns: north to east is a quarter turn right.
a.equal(c.turnDegrees('North', 'East'), 90);
a.equal(c.turnDegrees('East', 'North'), 270);
a.equal(c.turnDegrees('South', 'South'), 0);
// Answers and scoring.
a.equal(c.checkAnswer('East', 'East'), true);
a.equal(c.checkAnswer('East', 'West'), false);
a.deepEqual([1, 2, 3, 5, 9].map(s => c.pointsFor(s)), [10, 15, 20, 30, 30]);
a.equal(c.pointsFor(0), 0);
// Targets never repeat back to back, and a seeded run is replayable.
const run = rng => {
  const names = [];
  let prev = null;
  for (let i = 0; i < 50; i++) { const t = c.pickTarget(rng, c.MAIN, prev); names.push(t.name); prev = t.name; }
  return names;
};
const names = run(c.mulberry32(42));
for (let i = 1; i < names.length; i++) a.notEqual(names[i], names[i - 1]);
a.deepEqual(run(c.mulberry32(7)), run(c.mulberry32(7)));
a.ok(names.every(n => c.MAIN.some(p => p.name === n)));
console.log('Compass rules passed: the sixteen points, bearings and wrapping, opposites, turns, answers, scoring, and target picking.');
