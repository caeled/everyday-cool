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

// Public laundry covers laundromats and stand-alone washers, and the
// backup search covers it too; self-service is marked.
{
  const lc = f.byId('laundromat');
  a.equal(lc.label, 'Public laundry');
  const q = f.buildQuery(lc, 41.65, -83.54, 8000);
  for (const t of ['"shop"="laundry"', '"amenity"="washing_machine"', '"amenity"="laundry"']) a.ok(q.includes(t), t);
  a.ok(f.nominatimCategoryUrl('laundromat', 41.65, -83.54, 8000).includes(encodeURIComponent('[laundry]')));
  const t = f.tidyResults([{ lat: 41.66, lon: -83.55, tags: { name: 'Suds', shop: 'laundry', self_service: 'yes' } }, { lat: 41.67, lon: -83.56, tags: { amenity: 'washing_machine' } }], 41.65, -83.54, 'Public laundry');
  a.equal(t[0].note, 'self-service'); a.equal(t[1].note, 'washing machines');
  console.log('Find It public laundry passed.');
}

// Flight tracker rules.
{
  const fl = require('./flights.js');
  const p = s => fl.parseFlightNumber(s);
  a.equal(p('UA123').callsign, 'UAL123');
  a.equal(p('ua 123').callsign, 'UAL123');
  a.equal(p('UA0123').callsign, 'UAL123');
  a.equal(p('DL-1234').callsign, 'DAL1234');
  a.equal(p('UAL123').iata, 'UA123');
  a.equal(p('B6 815').callsign, 'JBU815');
  a.equal(p('9E3290').callsign, 'EDV3290');
  a.equal(p('N10023').callsign, 'N10023');            // tail numbers keep their zeros
  a.equal(p('hello'), null); a.equal(p('123'), null); a.equal(p(''), null); a.equal(p('<script>'), null);
  for (const [iata, icao] of Object.entries(fl.AIRLINES)) { a.ok(/^[A-Z0-9]{2}$/.test(iata), iata); a.ok(/^[A-Z]{3}$/.test(icao), icao); }
  a.ok(fl.LIVE_PROVIDERS.every(x => x.url('UAL1').startsWith('https://')));
  a.ok(fl.LIVE_PROVIDERS[0].url('UAL1').startsWith(fl.RELAY));
  // Provider answers: callsign padding, freshest position, ground.
  const plane = fl.tidyAircraft({ ac: [
    { flight: 'UAL1836 ', hex: 'a5dcde', lat: 42.7, lon: -90.7, alt_baro: 30300, gs: 453.7, track: 86.8, baro_rate: -1344, seen_pos: 3, r: 'N477UA', t: 'A320' },
    { flight: 'UAL1836 ', hex: 'a5dcde', lat: 42.6, lon: -90.9, alt_baro: 30500, gs: 450, track: 86, seen_pos: 0.5 },
    { flight: 'SWA1', lat: 1, lon: 1 },
  ] }, 'UAL1836');
  a.equal(plane.lat, 42.6); a.equal(plane.altFt, 30500); a.equal(plane.onGround, false);
  a.equal(fl.tidyAircraft({ aircraft: [{ flight: 'DAL5', lat: 1, lon: 2, alt_baro: 'ground', gs: 12 }] }, 'DAL5').onGround, true);
  a.equal(fl.tidyAircraft({ ac: [] }, 'UAL1'), null);
  a.equal(fl.tidyAircraft({ ac: [{ flight: 'UAL1', lat: null, lon: null }] }, 'UAL1'), null);
  // Route answers.
  const route = fl.tidyRoute({ response: { flightroute: { callsign_icao: 'UAL1836', callsign_iata: 'UA1836', airline: { name: 'United Airlines' }, origin: { iata_code: 'SEA', icao_code: 'KSEA', municipality: 'Seattle', country_iso_name: 'US', latitude: 47.449, longitude: -122.309 }, destination: { iata_code: 'ORD', icao_code: 'KORD', municipality: 'Chicago', country_iso_name: 'US', latitude: 41.97, longitude: -87.9 } } } });
  a.equal(route.origin.iata, 'SEA'); a.equal(fl.faaCode(route.destination), 'ORD');
  a.equal(fl.tidyRoute({ response: 'unknown callsign' }), null);
  // A plane over Iowa matches SEA->ORD, not San Jose->Boise.
  a.ok(fl.routeMatches(route, { lat: 42.7, lon: -90.7 }));
  a.ok(!fl.routeMatches({ origin: { lat: 37.36, lon: -121.93 }, destination: { lat: 43.56, lon: -116.22 } }, { lat: 40.26, lon: -91.4 }));
  a.ok(fl.routeMatches(null, { lat: 0, lon: 0 }));
  a.equal(fl.faaCode({ iata: 'LHR', country: 'GB' }), '');
  // FAA NAS status XML.
  const xml = '<AIRPORT_STATUS_INFORMATION><Delay_type><Name>Ground Stop Programs</Name><Ground_Stop_List><Program><ARPT>LGA</ARPT><Reason>airspace volume</Reason><End_Time>2:45 pm EST</End_Time></Program></Ground_Stop_List></Delay_type><Delay_type><Name>Ground Delay Programs</Name><Ground_Delay_List><Ground_Delay><ARPT>SFO</ARPT><Reason>low ceilings</Reason><Avg>1 hour</Avg><Max>2 hours</Max></Ground_Delay></Ground_Delay_List></Delay_type><Delay_type><Name>Airport Closures</Name><Airport_Closure_List><Airport><ARPT>LAX</ARPT><Reason>!LAX 05/277 LAX AD AP CLSD TO NON SKED TRANSIENT GA ACFT</Reason><Reopen>May 28</Reopen></Airport></Airport_Closure_List></Delay_type></AIRPORT_STATUS_INFORMATION>';
  const notes = fl.faaNotes(xml, ['LGA', 'SFO', 'LAX', 'ORD']);
  a.equal(notes.length, 2);
  a.equal(notes[0].airport, 'LGA'); a.ok(notes[0].detail.includes('2:45 pm'));
  a.ok(notes[1].detail.includes('1 hour'));
  a.deepEqual(fl.faaNotes('', ['ORD']), []);
  // Words.
  a.equal(fl.compass(86.8), 'E'); a.equal(fl.compass(359), 'N');
  a.equal(fl.describeAltitude({ altFt: 30300 }), '30,300 ft');
  a.equal(fl.describeAltitude({ onGround: true }), 'on the ground');
  a.equal(fl.describeSpeed(450), '450 kt (518 mph)');
  a.equal(fl.describeClimb(-1344), 'descending 1,340 ft/min'); a.equal(fl.describeClimb(100), 'level');
  const links = fl.flightLinks(p('UA1836'), 'a5dcde');
  a.ok(links[0].url.endsWith('/UAL1836') && links[1].url.endsWith('/ua1836') && links[2].url.includes('a5dcde'));
  console.log('Find It flight tracker rules passed: flight numbers, airline table, providers, plane and route tidying, FAA notes, words, links.');
}
