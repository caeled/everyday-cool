// Satellite checks. Run: node tests/satellites.test.cjs   (development only)
// Reference passes: computed independently with Skyfield 1.55 / python-sgp4 2.27 (Brandon Rhodes)
// from the same bundled ISS orbit (CelesTrak, epoch 2026-11-14), observer Columbus, Ohio
// (39.96 N, 83.00 W, sea level), horizon 0 degrees.
const assert = require('node:assert/strict');
const path = require('node:path');
const S = require(path.join(__dirname, '..', 'satpass.js'));
const SNAP = require(path.join(__dirname, '..', 'satellites-tle.js'));
const satellite = require(path.join(__dirname, '..', 'vendor', 'satellite.min.js'));
let count = 0;
function check(ok, what) { assert.ok(ok, what); count++; }

// SGP4 itself: Vallado et al. (2006) "Revisiting Spacetrack Report #3" test case 00005 at t = 0.
const v = satellite.twoline2satrec('1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753',
  '2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667');
const pv = satellite.sgp4(v, 0);
check(Math.abs(pv.position.x - 7022.46529266) < 1e-3 && Math.abs(pv.position.y + 1400.08296755) < 1e-3 && Math.abs(pv.position.z - 0.03995155) < 1e-3, 'SGP4 matches the Vallado verification vector for satellite 00005');

// Snapshot sanity
const sats = SNAP.tle.map(S.makeSat);
check(sats.every(Boolean), 'every bundled TLE parses');
check(sats.filter((s) => s.group === 'iss').length === 1, 'the ISS is in the snapshot');
check(sats.filter((s) => s.group === 'starlink-recent').length >= 10, 'a recent Starlink launch group is in the snapshot');
check(sats.every((s) => Math.abs(S.ageDays(s, new Date(Date.UTC(2026, 10, 14, 12)))) < 7), 'snapshot epochs are within a week of 14 Nov 2026');
const parsed = S.parseTLEText('ISS (ZARYA)\n' + SNAP.tle[0][1] + '\n' + SNAP.tle[0][2] + '\n\njunk line\n', 'x');
check(parsed.length === 1 && parsed[0][0] === 'ISS (ZARYA)', 'CelesTrak text format parses, junk ignored');

// Passes against Skyfield: [rise, peak, set (UTC), max elevation]
const ref = [
  ['2026-11-15T00:31:46Z', '2026-11-15T00:36:41Z', '2026-11-15T00:41:38Z', 17.716],
  ['2026-11-15T02:10:01Z', '2026-11-15T02:14:32Z', '2026-11-15T02:19:04Z', 11.323],
  ['2026-11-15T03:47:17Z', '2026-11-15T03:52:20Z', '2026-11-15T03:57:23Z', 20.092],
  ['2026-11-15T05:23:58Z', '2026-11-15T05:29:25Z', '2026-11-15T05:34:52Z', 73.364],
  ['2026-11-15T22:06:23Z', '2026-11-15T22:11:43Z', '2026-11-15T22:17:06Z', 52.977],
  ['2026-11-15T23:43:35Z', '2026-11-15T23:48:41Z', '2026-11-15T23:53:49Z', 23.056],
  ['2026-11-16T01:21:54Z', '2026-11-16T01:26:25Z', '2026-11-16T01:30:58Z', 11.505],
  ['2026-11-16T02:59:27Z', '2026-11-16T03:04:19Z', '2026-11-16T03:09:10Z', 15.900],
  ['2026-11-16T04:36:10Z', '2026-11-16T04:41:37Z', '2026-11-16T04:47:03Z', 64.136],
  ['2026-11-16T06:13:23Z', '2026-11-16T06:18:01Z', '2026-11-16T06:22:40Z', 13.652],
  ['2026-11-16T21:18:50Z', '2026-11-16T21:24:00Z', '2026-11-16T21:29:11Z', 29.281],
  ['2026-11-16T22:55:28Z', '2026-11-16T23:00:44Z', '2026-11-16T23:06:01Z', 32.352]
];
const iss = sats.find((s) => s.group === 'iss');
const passes = S.findPasses(iss, 39.96, -83.0, new Date(Date.UTC(2026, 10, 15)), 48, 10);
check(passes.length === ref.length, `found ${passes.length} passes above 10 deg, Skyfield finds ${ref.length}`);
ref.forEach(([r, p, s, alt], i) => {
  const got = passes[i];
  const dt = Math.max(Math.abs(got.rise - Date.parse(r)), Math.abs(got.set - Date.parse(s))) / 1000;
  const dp = Math.abs(got.peak - Date.parse(p)) / 1000;
  check(dt < 5 && dp < 10 && Math.abs(got.maxAlt - alt) < 0.1, `pass ${i + 1}: rise/set within ${dt.toFixed(1)} s, peak within ${dp.toFixed(1)} s, max ${got.maxAlt.toFixed(2)} vs ${alt}`);
});
// Visibility: the 23:43 UT pass (6:43 PM EST, 18 deg sun depression) is a classic evening sighting;
// the 05:23 UT pass (00:23 EST, middle of the night) is in the Earth's shadow.
check(passes[5].visible && passes[5].litAtPeak, 'evening pass after dusk is sunlit and visible');
check(!passes[3].visible && !passes[3].litAtPeak, 'midnight pass is in the Earth\u2019s shadow');
check(!passes[4].visible, 'a pass at sunset (sky still bright) is not counted as visible');
// Shadow geometry
const noon = new Date(Date.UTC(2026, 2, 20, 12)), A = require(path.join(__dirname, '..', 'astro.js'));
const s = A.sun(A.julianDay(noon)), ra = s.ra * 15 * Math.PI / 180;
const behind = { x: -6800 * Math.cos(ra), y: -6800 * Math.sin(ra), z: 0 };
const side = { x: -6800 * Math.cos(ra) + 7000 * Math.sin(ra), y: -6800 * Math.sin(ra) - 7000 * Math.cos(ra), z: 0 };
check(!S.sunlit(behind, noon) && S.sunlit({ x: -behind.x, y: -behind.y, z: 0 }, noon) && S.sunlit(side, noon), 'directly behind the Earth is dark; Sun side and far to the side are lit');
console.log(`Satellite checks passed: ${count} checks (SGP4 verification vector, ${ref.length} ISS passes against Skyfield, visibility and shadow).`);
