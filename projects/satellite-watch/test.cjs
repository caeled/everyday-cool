const a = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const W = require('./satwatch.js'), P = require('./satpass.js'), SNAP = require('./tle-snapshot.js');

// Families: the ones Steven asked for, each with a blurb and a CelesTrak group.
const want = ['stations', 'starlink', 'oneweb', 'weather', 'gps', 'glonass', 'galileo', 'beidou', 'iridium', 'amateur', 'science', 'earth', 'visual', 'recent'];
a.deepEqual(W.FAMILIES.map(f => f.id), want);
for (const f of W.FAMILIES) { a.ok(f.blurb.length > 40 && f.emoji && f.group, f.id); a.ok(SNAP.families[f.id] && SNAP.families[f.id].tle.length, 'snapshot ' + f.id); }
a.ok(W.family('starlink').big && !W.family('gps').big);
a.equal(W.family('nope'), null);

// Addresses: groups, NORAD numbers, names, friendly aliases.
a.equal(W.groupUrl('gps-ops'), 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP=gps-ops');
a.ok(W.searchUrl('25544').endsWith('CATNR=25544'));
a.ok(W.searchUrl('Hubble').endsWith('CATNR=20580'));
a.ok(W.searchUrl('tiangong').endsWith('CATNR=48274'));
a.ok(W.searchUrl('NOAA 19').endsWith('NAME=NOAA%2019'));
a.equal(W.searchUrl('ab'), null); a.equal(W.searchUrl('<script>'), null);

// Caching: at most one download per family every two hours.
const now = 1e12;
a.equal(W.cachePlan(null, now), 'fetch');
a.equal(W.cachePlan({ at: now - 3600e3, text: 'x' }, now), 'use-cache');
a.equal(W.cachePlan({ at: now - 3 * 3600e3, text: 'x' }, now), 'fetch-keep-cache');

// TLE parsing, including CelesTrak's "No GP data found" answer.
const iss = ['ISS (ZARYA)', '1 25544U 98067A   26320.50000000  .00009396  00000+0  17615-3 0  9993', '2 25544  51.6324 277.2306 0007380 120.0000 240.0000 15.49500000 10000'];
a.deepEqual(W.parseTLE(iss.join('\n') + '\n'), [iss]);
a.deepEqual(W.parseTLE('No GP data found'), []);
a.equal(W.parseTLE('A\r\n' + iss[1] + '\r\n' + iss[2] + '\r\nB\n' + iss[1] + '\n' + iss[2]).length, 2);

// Positions and orbit facts from the bundled snapshot ISS.
const row = SNAP.families.stations.tle.find(r => r[1].startsWith('1 25544'));
const sat = W.makeSat(row, 'stations');
a.equal(sat.norad, '25544');
const at = new Date(sat.epochMs + 3600e3);
const p = W.subpoint(sat, at);
a.ok(p.heightKm > 350 && p.heightKm < 460, 'height ' + p.heightKm);
a.ok(p.speedKmS > 7.4 && p.speedKmS < 7.9, 'speed ' + p.speedKmS);
a.ok(Math.abs(p.lat) <= 52 && p.lon >= -180 && p.lon <= 180);
const o = W.orbitFacts(sat);
a.ok(o.periodMin > 90 && o.periodMin < 95 && Math.abs(o.inclinationDeg - 51.6) < 0.2);
a.equal(W.makeSat(['bad', '1 nonsense', '2 nonsense']), null);

// Ground track: about 140 minutes, split at the date line.
const segs = W.groundTrack(sat, at, 45, 95, 30);
a.ok(segs.length >= 1 && segs.length <= 4);
for (const s of segs) for (let i = 1; i < s.length; i++) a.ok(Math.abs(s[i][1] - s[i - 1][1]) < 180);
a.ok(segs.reduce((n, s) => n + s.length, 0) > 250);

// Passes reuse Tonight's Sky's satpass.js: an ISS pass over a mid-latitude spot within 2 days.
const passes = P.findPasses({ name: sat.name, satrec: sat.satrec }, 40, -100, at, 48, 10, 30);
a.ok(passes.length >= 2, 'passes ' + passes.length);
for (const q of passes) a.ok(q.maxAlt >= 10 && q.set > q.rise && (q.set - q.rise) < 15 * 60e3);

// Sampling for giant families.
const big = Array.from({ length: 10608 }, (_, i) => i);
const s3 = W.sampleEvenly(big, 3000);
a.equal(s3.length, 3000); a.equal(s3[0], 0); a.ok(s3[2999] > 10500);
a.deepEqual(W.sampleEvenly([1, 2], 3000), [1, 2]);

// Words.
a.equal(W.describeAge(0.01), 'less than an hour old');
a.ok(W.describeAge(20).includes('too old'));
a.ok(W.periodWords(1436).includes('keeps pace'));
a.equal(W.compass(91), 'E');

// Sister-room links point at files that exist in the collection.
const here = __dirname;
for (const [k, rel] of Object.entries(W.LINKS)) a.ok(fs.existsSync(path.join(here, rel)), k + ' -> ' + rel);
const html = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
a.ok(html.includes('href="' + W.LINKS.tonightsSky + '"'));
a.ok(html.includes('href="' + W.LINKS.telescopePlan + '" download'));

// Network: only CelesTrak, Nominatim, the IP-guess services, map tiles.
const urls = new Set((fs.readFileSync(path.join(here, 'app.js'), 'utf8') + fs.readFileSync(path.join(here, 'satwatch.js'), 'utf8')).match(/https?:\/\/[a-z0-9.\-]+/gi));
for (const u of urls) a.ok(['https://celestrak.org', 'https://nominatim.openstreetmap.org', 'https://get.geojs.io', 'https://ipwho.is', 'https://tile.openstreetmap.org', 'https://www.openstreetmap.org'].includes(u), u);
// No location is ever written to storage.
a.ok(!/localStorage\.setItem\([^)]*home/i.test(fs.readFileSync(path.join(here, 'app.js'), 'utf8')));

console.log('Satellite Watch rules passed: families, addresses, caching, TLE parsing, positions, ground track, passes, sampling, words, sister links, network list.');
