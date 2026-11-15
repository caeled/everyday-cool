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

// ---- Build-a-Map rules (maptools.js) ----
const fs = require('node:fs'), path = require('node:path'), t = require('./maptools.js');
// CSV parsing: headers, the lng spelling, quoted commas, and a bad row.
const csv = [
  'name,lat,lng,notes',
  'Home,41.2849,-84.3583,"Defiance, Ohio"',
  'Broken,not-a-number,-84.0,skipped',
  'School,41.29,-84.36,',
].join('\n');
const parsed = t.parseCSV(csv);
a.equal(parsed.pins.length, 2);
a.equal(parsed.skipped, 1);
a.equal(parsed.pins[0].notes, 'Defiance, Ohio');
a.equal(parsed.pins[1].lon, -84.36);
// Coordinate hunting in text, the way a PDF's words come out.
const docText = 'Meet at the trailhead 41.2845, -84.3558 and finish at 41.2945,-84.3458. Page 12, 2026 edition. The pair 95.0000, -84.0000 is not on Earth as a latitude.';
a.deepEqual(t.extractCoordinates(docText), [{ lat: 41.2845, lon: -84.3558 }, { lat: 41.2945, lon: -84.3458 }]);
a.deepEqual(t.extractCoordinates('No coordinates in this document at all.'), []);
// Distances: Defiance to Toledo is roughly 73 km by the crow's flight.
const d = t.haversineKm(41.2849, -84.3583, 41.6528, -83.5379);
a.ok(d > 65 && d < 82, 'Defiance-Toledo crow flight, got ' + d);
a.equal(t.formatDistance(0.42), '420 m');
a.ok(t.formatDistance(2.5).startsWith('2.5 km ('));
// The shipped sample: a square over Defiance, closed, corners in order.
const square = t.parseCSV(fs.readFileSync(path.join(__dirname, 'sample-square.csv'), 'utf8'));
a.equal(square.skipped, 0);
const built = t.buildShapes(square.pins);
a.equal(built.loose.length, 0);
a.equal(built.shapes.length, 1);
a.equal(built.shapes[0].group, 'Defiance square');
a.equal(built.shapes[0].closed, true);
a.deepEqual(built.shapes[0].points.map(p => p.name), ['NE corner', 'SE corner', 'SW corner', 'NW corner']);
// The closed perimeter counts all four sides plus the closing leg: two
// north-south sides and two shorter east-west ones (a degree of longitude
// is shorter than a degree of latitude), so it lands near 3.5 times the
// north-south side, clearly more than the open path's three legs.
const side = t.haversineKm(41.2945, -84.3458, 41.2745, -84.3458);
const perimeter = t.pathDistanceKm(built.shapes[0].points, true);
a.ok(perimeter > side * 3.4 && perimeter < side * 3.6, 'square perimeter, got ' + perimeter);
a.ok(t.pathDistanceKm(built.shapes[0].points, false) < perimeter);
// Ungrouped pins stay loose; an open group stays an open path.
const mixed = t.buildShapes(t.parseCSV('name,lat,lon,group,close\nA,41.0,-84.0,Walk,\nB,41.01,-84.0,Walk,\nC,41.02,-84.0,,').pins);
a.equal(mixed.loose.length, 1);
a.equal(mixed.shapes[0].closed, false);
a.equal(mixed.shapes[0].points.length, 2);
// Export round-trips: what pinsToCSV writes, parseCSV reads back whole.
const roundTrip = t.parseCSV(t.pinsToCSV(square.pins));
a.deepEqual(roundTrip.pins, square.pins);
console.log('Build-a-Map rules passed: CSV parsing, coordinate extraction, grouping and closing, distances, the Defiance square, and CSV export.');
