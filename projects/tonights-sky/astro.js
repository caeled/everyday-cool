/* Tonight's Sky: astronomy math. Plain JavaScript, no dependencies, runs offline.
 *
 * Approximate on purpose: good to a few arcminutes for the Sun and planets and
 * roughly 0.1-0.3 degree for the Moon over 1900-2100. That is plenty for finding
 * things with your eyes or binoculars, and not good enough for eclipses to the
 * second, occultations, or pointing a big telescope blind.
 *
 * Ported to JavaScript from Steven Powell's Skywatch (sky.py, Bordeom, 2026),
 * which uses Paul Schlyter's "How to compute planetary positions" elements and
 * lunar perturbation terms, and Jean Meeus, "Astronomical Algorithms" (2nd ed.)
 * for Julian days, sidereal time and precession. MIT License (see LICENSE).
 */
(function (root) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var J2000 = 2451545.0;
  var AU_KM = 149597870.7, EARTH_RADIUS_KM = 6378.14, LIGHT_KM_S = 299792.458;

  function rev(x) { return ((x % 360) + 360) % 360; }
  function sind(x) { return Math.sin(x * D2R); }
  function cosd(x) { return Math.cos(x * D2R); }
  function tand(x) { return Math.tan(x * D2R); }
  function atan2d(y, x) { return Math.atan2(y, x) * R2D; }
  function asind(x) { return Math.asin(Math.max(-1, Math.min(1, x))) * R2D; }
  function acosd(x) { return Math.acos(Math.max(-1, Math.min(1, x))) * R2D; }

  /* -- Time ------------------------------------------------------------------------------- */
  /** JavaScript Date (an instant) -> Julian day. 2000-01-01 12:00 UTC is 2451545.0. */
  function julianDay(date) { return date.getTime() / 86400000 + 2440587.5; }
  function dateFromJD(jd) { return new Date((jd - 2440587.5) * 86400000); }
  /** Greenwich mean sidereal time, degrees (Meeus 12.4). */
  function gmst(jd) {
    var t = (jd - J2000) / 36525;
    return rev(280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * t * t - t * t * t / 38710000);
  }
  /** Local sidereal time, degrees; longitude is east-positive. */
  function lst(jd, lon) { return rev(gmst(jd) + lon); }

  /* -- Orbits: Schlyter's elements, d = days since 2000 Jan 0.0 UT (JD 2451543.5) ---------------- */
  // [N0, Ndot, i0, idot, w0, wdot, a0, adot, e0, edot, M0, Mdot]
  var ELEMENTS = {
    Earth:   [0, 0, 0, 0, 282.9404, 4.70935e-5, 1.0, 0, 0.016709, -1.151e-9, 356.0470, 0.9856002585],
    Moon:    [125.1228, -0.0529538083, 5.1454, 0, 318.0634, 0.1643573223, 60.2666, 0, 0.0549, 0, 115.3654, 13.0649929509],
    Mercury: [48.3313, 3.24587e-5, 7.0047, 5.0e-8, 29.1241, 1.01444e-5, 0.387098, 0, 0.205635, 5.59e-10, 168.6562, 4.0923344368],
    Venus:   [76.6799, 2.4659e-5, 3.3946, 2.75e-8, 54.891, 1.38374e-5, 0.72333, 0, 0.006773, -1.302e-9, 48.0052, 1.6021302244],
    Mars:    [49.5574, 2.11081e-5, 1.8497, -1.78e-8, 286.5016, 2.92961e-5, 1.523688, 0, 0.093405, 2.516e-9, 18.6021, 0.5240207766],
    Jupiter: [100.4542, 2.76854e-5, 1.303, -1.557e-7, 273.8777, 1.64505e-5, 5.20256, 0, 0.048498, 4.469e-9, 19.895, 0.0830853001],
    Saturn:  [113.6634, 2.3898e-5, 2.4886, -1.081e-7, 339.3939, 2.97661e-5, 9.55475, 0, 0.055546, -9.499e-9, 316.967, 0.0334442282],
    Uranus:  [74.0005, 1.3978e-5, 0.7733, 1.9e-8, 96.6612, 3.0565e-5, 19.18171, -1.55e-8, 0.047318, 7.45e-9, 142.5905, 0.011725806],
    Neptune: [131.7806, 3.0173e-5, 1.77, -2.55e-7, 272.8461, -6.027e-6, 30.05826, 3.313e-8, 0.008606, 2.15e-9, 260.2471, 0.005995147]
  };
  var PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

  function dayNumber(jd) { return jd - 2451543.5; }

  /** Solve Kepler's equation M = E - e sin E (degrees in, degrees out). */
  function kepler(mDeg, e) {
    var m = mDeg * D2R, en = m + e * Math.sin(m);
    for (var k = 0; k < 10; k++) en -= (en - e * Math.sin(en) - m) / (1 - e * Math.cos(en));
    return en * R2D;
  }

  /** Heliocentric ecliptic position (of date) from the elements. */
  function helio(name, d) {
    var el = ELEMENTS[name];
    var N = rev(el[0] + el[1] * d), i = el[2] + el[3] * d, w = rev(el[4] + el[5] * d);
    var a = el[6] + el[7] * d, e = el[8] + el[9] * d, M = rev(el[10] + el[11] * d);
    var E = kepler(M, e) * D2R;
    var x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
    var r = Math.hypot(x, y), v = Math.atan2(y, x) * R2D;
    var xh = r * (cosd(N) * cosd(v + w) - sind(N) * sind(v + w) * cosd(i));
    var yh = r * (sind(N) * cosd(v + w) + cosd(N) * sind(v + w) * cosd(i));
    var zh = r * sind(v + w) * sind(i);
    return { x: xh, y: yh, z: zh, r: r, lon: rev(atan2d(yh, xh)), lat: atan2d(zh, Math.hypot(xh, yh)), M: M, N: N, w: w };
  }

  function obliquity(d) { return 23.4393 - 3.563e-7 * d; }

  /** Ecliptic (lon, lat) of date -> { ra (hours), dec (degrees) }. */
  function eclToEq(lon, lat, d) {
    var e = obliquity(d);
    return {
      ra: rev(atan2d(sind(lon) * cosd(e) - tand(lat) * sind(e), cosd(lon))) / 15,
      dec: asind(sind(lat) * cosd(e) + cosd(lat) * sind(e) * sind(lon))
    };
  }

  /** The Sun, seen from the centre of the Earth. */
  function sun(jd) {
    var d = dayNumber(jd), e = helio('Earth', d), q = eclToEq(e.lon, e.lat, d);
    return { ra: q.ra, dec: q.dec, lon: e.lon, lat: 0, r: e.r, M: e.M, w: e.w, distanceKm: e.r * AU_KM };
  }

  /** The Moon, seen from the centre of the Earth, with the main perturbation terms. */
  function moon(jd) {
    var d = dayNumber(jd), s = sun(jd), mo = helio('Moon', d);
    var Ms = s.M, Mm = mo.M;
    var Lm = rev(mo.N + mo.w + Mm), Ls = rev(s.w + Ms);
    var D = rev(Lm - Ls), F = rev(Lm - mo.N);
    var lon = mo.lon - 1.274 * sind(Mm - 2 * D) + 0.658 * sind(2 * D) - 0.186 * sind(Ms)
      - 0.059 * sind(2 * Mm - 2 * D) - 0.057 * sind(Mm - 2 * D + Ms) + 0.053 * sind(Mm + 2 * D)
      + 0.046 * sind(2 * D - Ms) + 0.041 * sind(Mm - Ms) - 0.035 * sind(D) - 0.031 * sind(Mm + Ms)
      - 0.015 * sind(2 * F - 2 * D) + 0.011 * sind(Mm - 4 * D);
    var lat = mo.lat - 0.173 * sind(F - 2 * D) - 0.055 * sind(Mm - F - 2 * D) - 0.046 * sind(Mm + F - 2 * D)
      + 0.033 * sind(F + 2 * D) + 0.017 * sind(2 * Mm + F);
    var r = mo.r - 0.58 * cosd(Mm - 2 * D) - 0.46 * cosd(2 * D); // Earth radii
    var q = eclToEq(lon, lat, d);
    return { ra: q.ra, dec: q.dec, lon: rev(lon), lat: lat, r: r, distanceKm: r * EARTH_RADIUS_KM };
  }

  /** Schlyter's corrections for the big planets tugging on each other (heliocentric, degrees). */
  function perturb(name, d, lon, lat) {
    if (name !== 'Jupiter' && name !== 'Saturn' && name !== 'Uranus') return { lon: lon, lat: lat };
    var Mj = helio('Jupiter', d).M, Ms = helio('Saturn', d).M, Mu = helio('Uranus', d).M;
    if (name === 'Jupiter') {
      lon += -0.332 * sind(2 * Mj - 5 * Ms - 67.6) - 0.056 * sind(2 * Mj - 2 * Ms + 21) + 0.042 * sind(3 * Mj - 5 * Ms + 21)
        - 0.036 * sind(Mj - 2 * Ms) + 0.022 * cosd(Mj - Ms) + 0.023 * sind(2 * Mj - 3 * Ms + 52) - 0.016 * sind(Mj - 5 * Ms - 69);
    } else if (name === 'Saturn') {
      lon += 0.812 * sind(2 * Mj - 5 * Ms - 67.6) - 0.229 * cosd(2 * Mj - 4 * Ms - 2) + 0.119 * sind(Mj - 2 * Ms - 3)
        + 0.046 * sind(2 * Mj - 6 * Ms - 69) + 0.014 * sind(Mj - 3 * Ms + 32);
      lat += -0.020 * cosd(2 * Mj - 4 * Ms - 2) + 0.018 * sind(2 * Mj - 6 * Ms - 49);
    } else {
      lon += 0.040 * sind(Ms - 2 * Mu + 6) + 0.035 * sind(Ms - 3 * Mu + 33) - 0.015 * sind(Mj - Mu + 20);
    }
    return { lon: lon, lat: lat };
  }

  /** A planet seen from the centre of the Earth: RA/Dec, distances, phase angle, magnitude. */
  function planet(name, jd) {
    var d = dayNumber(jd), p = helio(name, d), eh = helio('Earth', d);
    var c = perturb(name, d, p.lon, p.lat);
    var px = p.r * cosd(c.lat) * cosd(c.lon), py = p.r * cosd(c.lat) * sind(c.lon), pz = p.r * sind(c.lat);
    // Schlyter's "Earth" row gives the Sun as seen from Earth; the Earth itself is the negative.
    var xg = px + eh.x, yg = py + eh.y, zg = pz + eh.z;
    var delta = Math.sqrt(xg * xg + yg * yg + zg * zg);
    var lon = rev(atan2d(yg, xg)), lat = atan2d(zg, Math.hypot(xg, yg));
    var q = eclToEq(lon, lat, d);
    var fv = acosd((p.r * p.r + delta * delta - eh.r * eh.r) / (2 * p.r * delta)); // phase angle
    var l5 = 5 * Math.log10(p.r * delta);
    var mag = {
      Mercury: -0.36 + l5 + 0.027 * fv + 2.2e-13 * Math.pow(fv, 6),
      Venus: -4.40 + l5 + 0.0009 * fv + 0.000239 * fv * fv - 6.5e-7 * fv * fv * fv,
      Mars: -1.51 + l5 + 0.016 * fv,
      Jupiter: -9.40 + l5 + 0.005 * fv,
      Saturn: -9.0 + l5 + 0.044 * fv, // rings ignored, can be ~0.5 mag off
      Uranus: -7.15 + l5 + 0.001 * fv,
      Neptune: -7.00 + l5
    }[name];
    return { ra: q.ra, dec: q.dec, lon: rev(lon), lat: lat, r: p.r, delta: delta, phaseAngle: fv, mag: mag,
      distanceKm: delta * AU_KM, illuminated: (1 + cosd(fv)) / 2 };
  }

  /* -- Coordinates -------------------------------------------------------------------------------- */
  /** RA (hours) / Dec -> { alt, az } in degrees; az from North through East. */
  function altAz(raH, dec, lat, lon, jd) {
    var ha = rev(lst(jd, lon) - raH * 15);
    var alt = asind(sind(dec) * sind(lat) + cosd(dec) * cosd(lat) * cosd(ha));
    var az = rev(atan2d(-cosd(dec) * sind(ha), sind(dec) * cosd(lat) - cosd(dec) * sind(lat) * cosd(ha)));
    return { alt: alt, az: az };
  }

  /** Precess J2000-style RA (h)/Dec between epochs (Meeus 21.2-21.4). */
  function precess(raH, dec, jdFrom, jdTo) {
    var t = (jdTo - jdFrom) / 36525;
    var zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) / 3600;
    var z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) / 3600;
    var th = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) / 3600;
    var a = raH * 15 + zeta;
    var A = cosd(dec) * sind(a), B = cosd(th) * cosd(dec) * cosd(a) - sind(th) * sind(dec);
    var C = sind(th) * cosd(dec) * cosd(a) + cosd(th) * sind(dec);
    return { ra: rev(atan2d(A, B) + z) / 15, dec: asind(C) };
  }

  /** Angular distance between two RA (h)/Dec points, degrees. */
  function separation(ra1, d1, ra2, d2) {
    return acosd(sind(d1) * sind(d2) + cosd(d1) * cosd(d2) * cosd((ra1 - ra2) * 15));
  }

  /* 3x3 matrices so the app can turn ~1000 stars with one multiply each. */
  function matMul(a, b) {
    var o = [];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return o;
  }
  function rotZ(deg) { var c = cosd(deg), s = sind(deg); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
  function applyMat(m, v) {
    return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
  }
  function unitVector(raDeg, dec) { return [cosd(dec) * cosd(raDeg), cosd(dec) * sind(raDeg), sind(dec)]; }
  /** Precession matrix, J2000 equatorial -> equatorial of date. */
  function precessionMatrix(jd) {
    var t = (jd - J2000) / 36525;
    var zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) / 3600;
    var z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) / 3600;
    var th = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) / 3600;
    var q = [cosd(th), 0, -sind(th), 0, 1, 0, sind(th), 0, cosd(th)];
    return matMul(rotZ(z), matMul(q, rotZ(zeta)));
  }
  /** Equatorial of date -> local horizon vector [east, north, up]. */
  function horizonMatrix(jd, lat, lon) {
    var L = lst(jd, lon), sl = sind(lat), cl = cosd(lat);
    var toHA = rotZ(-L); // x = cos(dec)cos(H), y = -cos(dec)sin(H), z = sin(dec)
    var h = [0, 1, 0, -sl, 0, cl, cl, 0, sl];
    return matMul(h, toHA);
  }
  /** [east, north, up] -> { alt, az }. */
  function vecToAltAz(v) { return { alt: asind(v[2]), az: rev(atan2d(v[0], v[1])) }; }
  function altAzToVec(alt, az) { return [cosd(alt) * sind(az), cosd(alt) * cosd(az), sind(alt)]; }

  /** Moon parallax: shift a geocentric Moon altitude to what an observer on the surface sees. */
  function topocentricMoonAlt(geoAlt, rEarthRadii) {
    return geoAlt - asind(cosd(geoAlt) / rEarthRadii);
  }

  /* -- The Moon's face -------------------------------------------------------------------------- */
  var PHASE_NAMES = ['New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  /** { illuminated 0..1, elongation, age (days, approximate), name, waxing }. */
  function moonPhase(jd) {
    var s = sun(jd), m = moon(jd);
    var elong = acosd(cosd(m.lat) * cosd(m.lon - s.lon));
    var phaseAngle = 180 - elong; // good to a fraction of a degree because the Sun is so far away
    var diff = rev(m.lon - s.lon); // 0 new, 90 first quarter, 180 full, 270 last quarter
    return {
      illuminated: (1 + cosd(phaseAngle)) / 2, elongation: elong, lonDiff: diff,
      age: diff / 360 * 29.530589, waxing: diff < 180,
      name: PHASE_NAMES[Math.round(diff / 45) % 8]
    };
  }

  /* -- Words for numbers ------------------------------------------------------------------------------ */
  var COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function compass(az) { return COMPASS[Math.floor(rev(az + 11.25) / 22.5) % 16]; }
  function twilight(sunAlt) {
    if (sunAlt > -0.833) return 'daylight';
    if (sunAlt > -6) return 'civil twilight';
    if (sunAlt > -12) return 'nautical twilight';
    if (sunAlt > -18) return 'astronomical twilight';
    return 'full dark';
  }
  /** Light-travel time in seconds for a distance in km. */
  function lightSeconds(km) { return km / LIGHT_KM_S; }

  /* -- Rising and setting: scan a day and interpolate the crossings ----------------------------- */
  /**
   * radecAt(jd) -> {ra, dec}. Returns crossings of `horizon` altitude between jd0 and jd0+span:
   * { rises: [jd], sets: [jd], alwaysUp, neverUp, highest: {jd, alt} }.
   */
  function crossings(radecAt, lat, lon, jd0, span, horizon, stepMin) {
    span = span || 1; horizon = horizon === undefined ? -0.5667 : horizon; stepMin = stepMin || 10;
    var n = Math.ceil(span * 1440 / stepMin), out = { rises: [], sets: [], alwaysUp: true, neverUp: true, highest: null };
    var prev = null;
    for (var k = 0; k <= n; k++) {
      var jd = jd0 + k * stepMin / 1440, p = radecAt(jd), alt = altAz(p.ra, p.dec, lat, lon, jd).alt;
      if (p.altFix) alt = p.altFix(alt);
      if (alt > horizon) out.neverUp = false; else out.alwaysUp = false;
      if (!out.highest || alt > out.highest.alt) out.highest = { jd: jd, alt: alt };
      if (prev && (prev.alt > horizon) !== (alt > horizon)) {
        var f = (horizon - prev.alt) / (alt - prev.alt), t = prev.jd + f * (jd - prev.jd);
        (alt > prev.alt ? out.rises : out.sets).push(t);
      }
      prev = { jd: jd, alt: alt };
    }
    return out;
  }

  /** Sunset, darkness and sunrise for the night that starts on the evening after jd0 (local noon). */
  function nightTimes(lat, lon, jdNoon) {
    var at = function (jd) { return sun(jd); };
    var sr = crossings(at, lat, lon, jdNoon, 1, -0.833, 5), astro = crossings(at, lat, lon, jdNoon, 1, -18, 5);
    return { sunset: sr.sets[0] || null, sunrise: sr.rises[0] || null, darkStart: astro.sets[0] || null,
      darkEnd: astro.rises[0] || null, sunAlwaysUp: sr.alwaysUp, sunNeverUp: sr.neverUp, neverDark: astro.alwaysUp };
  }

  var api = {
    D2R: D2R, R2D: R2D, J2000: J2000, AU_KM: AU_KM, EARTH_RADIUS_KM: EARTH_RADIUS_KM, LIGHT_KM_S: LIGHT_KM_S,
    PLANETS: PLANETS, ELEMENTS: ELEMENTS, rev: rev, julianDay: julianDay, dateFromJD: dateFromJD, gmst: gmst, lst: lst,
    kepler: kepler, helio: helio, obliquity: obliquity, eclToEq: eclToEq, sun: sun, moon: moon, planet: planet,
    altAz: altAz, precess: precess, separation: separation, matMul: matMul, applyMat: applyMat, unitVector: unitVector,
    precessionMatrix: precessionMatrix, horizonMatrix: horizonMatrix, vecToAltAz: vecToAltAz, altAzToVec: altAzToVec,
    topocentricMoonAlt: topocentricMoonAlt, moonPhase: moonPhase, compass: compass, twilight: twilight,
    lightSeconds: lightSeconds, crossings: crossings, nightTimes: nightTimes, dayNumber: dayNumber
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AstroMath = api;
})(this);
