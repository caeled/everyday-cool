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

// Endpoint failover: a stalled or refusing first server must not sink
// the search — the next mirror gets its turn, and a good answer from
// any of them is the answer.
(async () => {
  a.ok(Array.isArray(f.OVERPASS_ENDPOINTS) && f.OVERPASS_ENDPOINTS.length >= 2);
  a.ok(f.OVERPASS_ENDPOINTS[0].includes('overpass-api.de'));
  const tried = [];
  const flaky = async url => { tried.push(url); if (tried.length === 1) return { ok: false, status: 504 }; if (tried.length === 2) throw new Error('stalled'); return { ok: true, json: async () => ({ elements: [1, 2] }) }; };
  const data = await f.queryOverpass('query', flaky, 1000);
  a.deepEqual(data.elements, [1, 2]);
  a.equal(tried.length, 3);
  const dead = async () => { throw new Error('down'); };
  await a.rejects(() => f.queryOverpass('query', dead, 1000));
  // A stalled main server: the next mirror is asked after the hedge delay
  // and its answer wins, well before the stalled one's time limit.
  const t0 = Date.now(); const order = [];
  const stall = (url, opts) => { order.push(url); if (order.length === 1) return new Promise((_, rej) => opts.signal.addEventListener('abort', () => rej(new Error('aborted')))); return Promise.resolve({ ok: true, json: async () => ({ elements: ['mirror'] }) }); };
  const hedged = await f.queryOverpass('query', stall, 5000, 50);
  a.deepEqual(hedged.elements, ['mirror']); a.ok(Date.now() - t0 < 1000, 'hedge took ' + (Date.now() - t0));
  // An Overpass timeout remark with no elements is a failure, not "none here".
  const remarkThenOk = (() => { let n = 0; return async () => (++n === 1 ? { ok: true, json: async () => ({ elements: [], remark: 'runtime error: Query timed out' }) } : { ok: true, json: async () => ({ elements: [3] }) }); })();
  a.deepEqual((await f.queryOverpass('query', remarkThenOk, 1000, 0)).elements, [3]);
  console.log('Find It failover passed: mirrors tried in order, first good answer wins, all-down rejects.');
})().catch(e => { console.error(e); process.exit(1); });

// Find-me layers: better fixes win, device beats a network guess, the
// accuracy decides the zoom, saved fixes expire, IP answers are parsed.
{
  const dev = (m) => ({ lat: 41.28, lon: -84.35, accuracyM: m, source: 'device' });
  const net = { lat: 41.3, lon: -84.4, accuracyM: 10000, source: 'network' };
  a.equal(f.betterFix(null, dev(900)).accuracyM, 900);
  a.equal(f.betterFix(dev(900), dev(40)).accuracyM, 40);
  a.equal(f.betterFix(dev(40), dev(900)).accuracyM, 40);
  a.equal(f.betterFix(net, dev(3000)).source, 'device');
  a.equal(f.betterFix(dev(3000), net).source, 'device');
  a.equal(f.betterFix(dev(50), { lat: NaN, lon: 1 }).accuracyM, 50);
  a.ok(f.goodEnough(dev(80)) && !f.goodEnough(dev(400)) && !f.goodEnough(net));
  a.ok(f.zoomForAccuracy(50) > f.zoomForAccuracy(5000));
  a.equal(f.zoomForAccuracy(undefined), 12);
  const now = 1000000000;
  const saved = JSON.stringify({ lat: 41.28, lon: -84.35, accuracyM: 30, source: 'device', at: now - 60000 });
  a.equal(f.readSavedFix(saved, now, 600000).source, 'saved');
  a.equal(f.readSavedFix(saved, now + 3600000, 600000), null);
  a.equal(f.readSavedFix('not json', now, 600000), null);
  a.equal(f.parseIpGeo({ latitude: '41.28', longitude: '-84.35', city: 'Defiance', region: 'Ohio' }).place, 'Defiance, Ohio');
  a.equal(f.parseIpGeo({ success: false }), null);
  a.ok(f.IP_GEO_SERVICES.every(u => u.startsWith('https://')));
  console.log('Find It find-me rules passed: fix ranking, good-enough, zoom, saved-fix expiry, IP guess parsing.');
}

// Backup search and place links.
{
  a.ok(f.nominatimCategoryUrl('coffee', 41.28, -84.35, 8000).includes(encodeURIComponent('[cafe]')));
  a.equal(f.nominatimCategoryUrl('salad', 41.28, -84.35, 8000), null);
  const b = f.boxAround(41.28, -84.35, 8000); a.ok(b.west < -84.35 && b.east > -84.35 && b.south < 41.28 && b.north > 41.28);
  const t = f.tidyNominatim([{ lat: '41.29', lon: '-84.36', name: 'Biggby Coffee', display_name: 'Biggby Coffee, 1, Main Street, Defiance', extratags: { website: 'https://biggby.example' } }], 41.28, -84.35, 'Coffee');
  a.equal(t[0].name, 'Biggby Coffee'); a.equal(t[0].links[0].label, 'Website');
  const L = f.placeLinks({ 'contact:instagram': '@cafe', website: 'cafe.example', 'contact:facebook': 'javascript:alert(1)', phone: '+1 419 555 0100;+1 419 555 0101', opening_hours: 'Mo-Fr 07:00-15:00' });
  a.ok(L.links.every(l => l.url.startsWith('https://')));
  a.equal(L.links.find(l => l.label === 'Instagram').url, 'https://www.instagram.com/cafe');
  a.equal(L.phone, '+1 419 555 0100'); a.equal(L.hours, 'Mo-Fr 07:00-15:00');
  a.equal(f.safeHttpUrl('javascript:alert(1)'), null);
  a.deepEqual(f.placeLinks({}).links, []);
  for (const c of f.CATEGORIES) if (!['salad', 'diner'].includes(c.id)) a.ok(c.phrase, c.id);
  console.log('Find It backup search and place links passed.');
}
