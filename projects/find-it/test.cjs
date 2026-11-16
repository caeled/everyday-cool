const a = require('node:assert/strict'), f = require('./findit.js');

// Steven's named categories are all present, first-class.
for (const id of ['coffee', 'salad', 'fitness', 'hospital', 'pharmacy']) a.ok(f.byId(id), id);
a.equal(f.byId('coffee').label, 'Coffee');
a.equal(f.byId('nope'), null);
// Every category has a group, an emoji, and at least one selector; groups are known.
for (const c of f.CATEGORIES) { a.ok(f.GROUPS.includes(c.group), c.id); a.ok(c.emoji && c.selectors.length, c.id); }
a.equal(new Set(f.CATEGORIES.map(c => c.id)).size, f.CATEGORIES.length);
// The query builder wraps selectors in nwr[...] around the centre.
const q = f.buildQuery('pharmacy', 41.2849, -84.3583, 8000);
a.ok(q.startsWith('[out:json]') && q.includes('nwr["amenity"="pharmacy"](around:8000,41.2849,-84.3583)'), q);
a.ok(f.buildQuery('coffee', 0, 0, 1000).includes('"shop"="coffee"'));
a.equal(f.buildQuery('nope', 0, 0, 1), null);
// Distances: Defiance to Toledo is roughly 73 km by the crow's flight.
const d = f.haversineKm(41.2849, -84.3583, 41.6528, -83.5379);
a.ok(d > 65 && d < 82, 'got ' + d);
a.equal(f.formatDistance(0.42), '420 m');
// Tidying: node and way-centre results, unnamed fallback, dedupe, nearest first.
const tidy = f.tidyResults([
  { lat: 41.30, lon: -84.36, tags: { name: 'Far Cafe' } },
  { center: { lat: 41.286, lon: -84.359 }, tags: {} },
  { lat: 41.30, lon: -84.36, tags: { name: 'Duplicate' } },
  { tags: { name: 'Nowhere' } },
], 41.2849, -84.3583, 'Coffee');
a.equal(tidy.length, 2);
a.equal(tidy[0].name, 'Unnamed coffee');
a.ok(tidy[0].distanceKm < tidy[1].distanceKm);
// Directions hand off to Google Maps, with OSM as the alternative.
a.equal(f.directionsUrl(41.3, -84.3), 'https://www.google.com/maps/dir/?api=1&destination=41.3,-84.3');
a.ok(f.osmDirectionsUrl(41.3, -84.3).startsWith('https://www.openstreetmap.org/directions'));
console.log('Find It rules passed: categories, Overpass query building, distances, result tidying, and directions links.');
