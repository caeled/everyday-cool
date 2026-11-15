// Tonight's Sky math checks. Run: node tests/astro.test.cjs   (Node.js 18+, development only)
// Reference positions: NASA/JPL Horizons (DE441 and satellite ephemerides), geocentric apparent
// RA/Dec of date, fetched 14 November 2026 for 2026-11-15 00:00 UT, plus a topocentric Sun and
// Moon for Dallas, Texas during the 8 April 2024 total solar eclipse. Many checks are ported
// from the self-test in Skywatch (sky.py).
const assert = require('node:assert/strict');
const path = require('node:path');
const A = require(path.join(__dirname, '..', 'astro.js'));
const DATA = require(path.join(__dirname, '..', 'sky-data.js'));
const OBJ = require(path.join(__dirname, '..', 'objects.js'));
let count = 0;
function check(ok, what) { assert.ok(ok, what); count++; }
const utc = (y, mo, d, h = 0, mi = 0) => A.julianDay(new Date(Date.UTC(y, mo - 1, d, h, mi)));
const sep = (p, raDeg, dec) => A.separation(p.ra, p.dec, raDeg / 15, dec);

// Time
check(Math.abs(utc(2000, 1, 1, 12) - 2451545.0) < 1e-9, 'JD of 2000-01-01 12:00 UTC is 2451545.0');
check(Math.abs(A.julianDay(A.dateFromJD(2460000.25)) - 2460000.25) < 1e-6, 'Julian day round trip');
check(Math.abs(A.gmst(2451545.0) - 280.46061837) < 1e-6, 'GMST at J2000 is 280.4606 degrees');
// Meeus example 12.a: 1987 April 10, 0h UT -> GMST 13h10m46.3668s
check(Math.abs(A.gmst(2446895.5) - (13 + 10 / 60 + 46.3668 / 3600) * 15) < 1e-4, 'Meeus 12.a sidereal time');

// Sun, Moon and planets against JPL Horizons, 2026-11-15 00:00 UT (apparent, of date)
const jd = utc(2026, 11, 15);
const horizons = {
  Sun: [230.22625, -18.42787, 0.05], Moon: [297.83096, -23.52707, 0.3],
  Mercury: [213.65969, -11.16962, 0.1], Venus: [200.62806, -10.22866, 0.1], Mars: [148.25639, 14.87831, 0.1],
  Jupiter: [148.29542, 13.62130, 0.1], Saturn: [8.87513, 0.94945, 0.1], Uranus: [62.17298, 20.82403, 0.1],
  Neptune: [2.23899, -0.56414, 0.1]
};
for (const [name, [ra, dec, tol]] of Object.entries(horizons)) {
  const p = name === 'Sun' ? A.sun(jd) : name === 'Moon' ? A.moon(jd) : A.planet(name, jd);
  const off = sep(p, ra, dec);
  check(off < tol, `${name} within ${tol} deg of JPL Horizons (off by ${off.toFixed(3)})`);
}
const dist = { Mercury: 0.84541687, Venus: 0.33055486, Mars: 1.31585437, Jupiter: 5.28312015, Saturn: 8.6861926, Uranus: 18.4626428, Neptune: 29.2421851 };
for (const [name, au] of Object.entries(dist)) check(Math.abs(A.planet(name, jd).delta - au) / au < 0.01, `${name} distance within 1%`);
const illum = { Mercury: 34.43818, Venus: 13.38999, Mars: 89.45301, Jupiter: 99.13054 };
for (const [name, pct] of Object.entries(illum)) check(Math.abs(A.planet(name, jd).illuminated * 100 - pct) < 2, `${name} lit fraction within 2 points`);
const mags = { Mercury: 0.067, Venus: -4.805, Mars: 0.713, Jupiter: -2.084, Uranus: 5.601, Neptune: 7.707 };
for (const [name, m] of Object.entries(mags)) check(Math.abs(A.planet(name, jd).mag - m) < 0.35, `${name} magnitude within 0.35`);
const mp = A.moonPhase(jd);
check(Math.abs(mp.illuminated * 100 - 27.23053) < 2 && mp.waxing && mp.name === 'Waxing crescent', `Moon 27% lit, waxing crescent (got ${(mp.illuminated * 100).toFixed(1)}%)`);
check(Math.abs(A.moon(jd).distanceKm - 0.00270582095749 * A.AU_KM) < 3000, 'Moon distance within 3000 km');

// Seasons (ported from Skywatch)
check(Math.abs(A.sun(utc(2026, 6, 21, 12)).dec - 23.44) < 0.15, 'June solstice: Sun near +23.44');
check(Math.abs(A.sun(utc(2026, 12, 21, 12)).dec + 23.44) < 0.15, 'December solstice: Sun near -23.44');
check(Math.abs(A.sun(utc(2026, 3, 20, 12)).dec) < 0.4, 'March equinox: Sun near the equator');
const r1 = A.sun(utc(2026, 10, 11, 12)).lon, r2 = A.sun(utc(2026, 11, 10, 12)).lon;
check(Math.abs(A.rev(r2 - r1) - 29.6) < 1, 'Sun moves about 1 degree a day along the ecliptic');

// Moon phases on known dates
check(A.moonPhase(utc(2000, 1, 6, 18, 14)).illuminated < 0.01, 'New Moon 2000-01-06 is dark');
check(A.moonPhase(utc(2024, 4, 23, 23, 49)).illuminated > 0.99, 'Full Moon 2024-04-23 is fully lit');
check(A.moonPhase(utc(2024, 4, 23, 23, 49)).name === 'Full Moon', 'and is named Full Moon');
check(A.moonPhase(utc(2024, 4, 15, 19, 13)).name === 'First quarter', 'First quarter 2024-04-15');

// Eclipse: the Moon covers the Sun from Dallas, 2024-04-08 18:40 UT (needs the Moon parallax)
const ej = utc(2024, 4, 8, 18, 40), lat = 32.78, lon = -96.80;
const s = A.sun(ej), m = A.moon(ej);
const sa = A.altAz(s.ra, s.dec, lat, lon, ej), maGeo = A.altAz(m.ra, m.dec, lat, lon, ej);
const maTopo = { alt: A.topocentricMoonAlt(maGeo.alt, m.r), az: maGeo.az };
check(Math.abs(sa.alt - 64.683345) < 0.15 && Math.abs(sa.az - 186.485672) < 0.3, 'Sun alt/az at Dallas matches Horizons');
const v1 = A.altAzToVec(sa.alt, sa.az), v2 = A.altAzToVec(maTopo.alt, maTopo.az);
const gap = Math.acos(v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) * A.R2D;
check(gap < 0.35, `Eclipse: Moon sits on the Sun from Dallas (gap ${gap.toFixed(2)} deg; the Sun is 0.53 wide)`);
const v3 = A.altAzToVec(maGeo.alt, maGeo.az), geoGap = Math.acos(v1[0] * v3[0] + v1[1] * v3[1] + v1[2] * v3[2]) * A.R2D;
check(geoGap > 0.3 && gap < geoGap / 2, `without the parallax shift the Moon would miss by ${geoGap.toFixed(2)} deg`);

// Coordinates (ported from Skywatch)
const jd0 = utc(2026, 11, 10, 12);
for (const h of [0, 6, 12, 18]) {
  const p = A.altAz(2.53, 89.26, 40, -86, jd0 + h / 24).alt;
  check(Math.abs(p - 40) < 0.8, `Polaris sits at the latitude (alt ${p.toFixed(1)} at lat 40)`);
}
check(Math.abs(A.altAz(A.lst(jd0, -86) / 15, 40, 40, -86, jd0).alt - 90) < 0.01, 'dec = lat on the meridian is the zenith');
const south = A.altAz(A.lst(jd0, -86) / 15, 0, 40, -86, jd0);
check(Math.abs(south.alt - 50) < 0.01 && Math.abs(south.az - 180) < 0.01, 'equator on the meridian: due south at 90 - lat');
const east = A.altAz(A.rev(A.lst(jd0, -86) + 90) / 15, 0, 40, -86, jd0);
check(Math.abs(east.alt) < 0.01 && Math.abs(east.az - 90) < 0.01, 'equator 6h before the meridian rises due east');
const vg = A.precess(18.6156, 38.7836, A.J2000, utc(2026, 11, 10));
const dv = A.rev((vg.ra - 18.6156) * 15);
check(dv > 0.15 && dv < 0.35, `Vega precesses +${dv.toFixed(2)} deg in RA, J2000 to 2026`);
const back = A.precess(vg.ra, vg.dec, utc(2026, 11, 10), A.J2000);
check(Math.abs(back.ra - 18.6156) * 15 < 1e-3 && Math.abs(back.dec - 38.7836) < 1e-3, 'precession round-trips');

// The app's matrix pipeline agrees with the direct formulas
const P = A.precessionMatrix(jd0), H = A.horizonMatrix(jd0, 40, -86), M = A.matMul(H, P);
let worst = 0;
for (const st of DATA.stars.slice(0, 200)) {
  const a = A.vecToAltAz(A.applyMat(M, A.unitVector(st[0], st[1])));
  const q = A.precess(st[0] / 15, st[1], A.J2000, jd0), b = A.altAz(q.ra, q.dec, 40, -86, jd0);
  worst = Math.max(worst, Math.acos(Math.min(1, A.altAzToVec(a.alt, a.az).reduce((t, x, i) => t + x * A.altAzToVec(b.alt, b.az)[i], 0))) * A.R2D);
}
check(worst < 1e-4, `matrix pipeline matches direct formulas (worst ${worst.toExponential(1)} deg)`);

// Planet behaviour over two years (ported from Skywatch)
let maxV = 0, maxM = 0, finite = true;
for (let w = 0; w < 730; w += 5) {
  const j = utc(2025, 1, 1) + w, sn = A.sun(j);
  const vv = A.planet('Venus', j), mm = A.planet('Mercury', j);
  maxV = Math.max(maxV, A.separation(sn.ra, sn.dec, vv.ra, vv.dec));
  maxM = Math.max(maxM, A.separation(sn.ra, sn.dec, mm.ra, mm.dec));
  for (const n of A.PLANETS) { const p = A.planet(n, j); finite = finite && [p.ra, p.dec, p.mag].every(Number.isFinite); }
}
check(maxV < 48.5 && maxV > 44, `Venus never strays past 48.5 deg from the Sun (max ${maxV.toFixed(1)})`);
check(maxM < 29 && maxM > 17, `Mercury never strays past 29 deg from the Sun (max ${maxM.toFixed(1)})`);
check(finite, 'every planet gives finite numbers for two years');

// Rising, setting and darkness, Columbus, Ohio, 14-15 Nov 2026 (EST = UTC-5)
const nt = A.nightTimes(39.96, -83.0, utc(2026, 11, 14, 17));
const hh = (j) => { const d = A.dateFromJD(j); return d.getUTCHours() + d.getUTCMinutes() / 60; };
check(Math.abs(hh(nt.sunset) - (22 + 13 / 60)) < 0.1, `Columbus sunset near 5:13 PM EST (got ${hh(nt.sunset).toFixed(2)} UT)`);
check(Math.abs(hh(nt.sunrise) - (12 + 21 / 60)) < 0.1, `Columbus sunrise near 7:21 AM EST (got ${hh(nt.sunrise).toFixed(2)} UT)`);
check(nt.sunset < nt.darkStart && nt.darkStart < nt.darkEnd && nt.darkEnd < nt.sunrise, 'sunset < dark < dawn < sunrise');
const tromso = A.nightTimes(69.65, 18.96, utc(2026, 12, 21, 11));
check(tromso.sunNeverUp, 'Tromso in December: polar night, the Sun never rises');
const polarDay = A.nightTimes(69.65, 18.96, utc(2026, 6, 21, 11));
check(polarDay.sunAlwaysUp, 'Tromso in June: midnight Sun');
const tuc = A.crossings(() => ({ ra: 0.40, dec: -72.08 }), 40, -86, jd0, 1, 0);
check(tuc.neverUp, '47 Tucanae never rises at 40 N');

// Words
check([[0, 'N'], [45, 'NE'], [90, 'E'], [135, 'SE'], [180, 'S'], [225, 'SW'], [270, 'W'], [315, 'NW'], [359, 'N']].every(([a, c]) => A.compass(a) === c), 'compass points');
check(A.twilight(10) === 'daylight' && A.twilight(-3) === 'civil twilight' && A.twilight(-20) === 'full dark', 'twilight names');
check(Math.abs(A.lightSeconds(A.AU_KM) - 499.0) < 0.1, 'sunlight takes about 499 seconds (8.3 minutes) to cross 1 AU');

// The bundled catalogue
check(DATA.stars.length > 850 && DATA.stars.length < 1000, `${DATA.stars.length} stars to magnitude ${DATA.magLimit}`);
check(DATA.stars.every((s) => s[0] >= 0 && s[0] < 360 && Math.abs(s[1]) <= 90 && s[2] <= DATA.magLimit), 'every star has a sane position and magnitude');
check(new Set(DATA.stars.map((s) => s[4])).size === DATA.stars.length, 'HR numbers are unique');
check(!DATA.stars.some((s) => s[4] === 5958), 'T CrB (listed at outburst brightness) is excluded');
check(Object.keys(DATA.constellations).length === 88, 'all 88 constellations are named');
check(DATA.figures.every(([id]) => DATA.constellations[id]), 'every stick figure has a name');
const byHR = new Map(DATA.stars.map((s) => [s[4], s]));
check(Object.keys(OBJ.NAMED).every((hr) => byHR.has(Number(hr))), 'every named star is in the catalogue');
// Skywatch's 25 bright stars agree with the Yale catalogue
const skywatch = { 2491: [6.75, -16.72], 7001: [18.62, 38.78], 424: [2.53, 89.26], 5340: [14.26, 19.18], 2061: [5.92, 7.41], 3982: [10.14, 11.97], 936: [3.14, 40.96] };
for (const [hr, [ra, dec]] of Object.entries(skywatch)) {
  const st = byHR.get(Number(hr));
  check(A.separation(st[0] / 15, st[1], ra, dec) < 0.15, `HR ${hr} matches Skywatch`);
}
check(OBJ.PLACES[0].id === 'columbus' && OBJ.PLACES.every((p) => Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 && p.tz), 'places are sane, Columbus first');

console.log(`Astronomy checks passed: ${count} checks (JPL Horizons positions for Sun, Moon and 7 planets, phases, eclipse, seasons, rise/set, catalogue).`);
