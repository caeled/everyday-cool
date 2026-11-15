/* Tonight's Sky: satellite positions and pass predictions.
 * Orbits come from two-line element sets (TLEs) propagated with SGP4, using the bundled
 * satellite.js library (MIT, vendor/satellite.min.js). Original Everyday Cool code, MIT.
 * Accuracy: a TLE a few days old usually puts the ISS within a few seconds and a fraction
 * of a degree of the truth; after a week or two errors grow to minutes, and the ISS and
 * Starlink satellites change orbit on purpose (reboosts, raising, avoidance), so refresh. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./vendor/satellite.min.js'), require('./astro.js'));
  else root.SatPass = factory(root.satellite, root.AstroMath);
})(this, function (satellite, A) {
  'use strict';
  var R2D = 180 / Math.PI, D2R = Math.PI / 180, EARTH_R = 6378.137;

  /** Parse "name, line1, line2" text (CelesTrak TLE format) into records. */
  function parseTLEText(text, group) {
    var lines = String(text).split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean), out = [];
    for (var i = 0; i + 2 < lines.length + 0; ) {
      if (lines[i].charAt(0) !== '1' || lines[i].charAt(1) !== ' ') {
        if (lines[i + 1] && lines[i + 1].indexOf('1 ') === 0 && lines[i + 2] && lines[i + 2].indexOf('2 ') === 0) {
          out.push([lines[i], lines[i + 1], lines[i + 2], group]); i += 3; continue;
        }
      }
      i++;
    }
    return out;
  }

  /** [name, line1, line2, group] -> satellite object, or null if the TLE is malformed. */
  function makeSat(row) {
    try {
      var rec = satellite.twoline2satrec(row[1], row[2]);
      if (!rec || rec.error) return null;
      return { name: row[0], group: row[3] || '', satrec: rec, norad: row[1].substr(2, 5).trim(),
        epoch: A.dateFromJD(rec.jdsatepoch + (rec.jdsatepochF || 0)) };
    } catch (e) { return null; }
  }

  /** Where is it? { alt, az, rangeKm, heightKm, eci } for a Date and an observer, or null. */
  function look(sat, date, lat, lon, heightKm) {
    var pv = satellite.propagate(sat.satrec, date);
    if (!pv || !pv.position || typeof pv.position === 'boolean' || !isFinite(pv.position.x)) return null;
    var gmst = satellite.gstime(date);
    var obs = { latitude: lat * D2R, longitude: lon * D2R, height: heightKm || 0 };
    var ecf = satellite.eciToEcf(pv.position, gmst), la = satellite.ecfToLookAngles(obs, ecf);
    var p = pv.position, r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    return { alt: la.elevation * R2D, az: A.rev(la.azimuth * R2D), rangeKm: la.rangeSat, heightKm: r - EARTH_R, eci: p };
  }

  /** Is a point (km, Earth-centred equatorial) in sunlight? Cylindrical Earth-shadow model. */
  function sunlit(eci, date) {
    var s = A.sun(A.julianDay(date)), ra = s.ra * 15 * D2R, dec = s.dec * D2R;
    var u = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
    var dot = eci.x * u[0] + eci.y * u[1] + eci.z * u[2];
    if (dot > 0) return true;
    var px = eci.x - dot * u[0], py = eci.y - dot * u[1], pz = eci.z - dot * u[2];
    return Math.sqrt(px * px + py * py + pz * pz) > EARTH_R;
  }

  function sunAltAt(date, lat, lon) {
    var jd = A.julianDay(date), s = A.sun(jd);
    return A.altAz(s.ra, s.dec, lat, lon, jd).alt;
  }

  /**
   * Upcoming passes: [{ rise, peak, set (Dates), maxAlt, riseAz, peakAz, setAz, visible, litAtPeak }].
   * Rise and set are when it crosses the horizon (0 deg, no refraction). Only passes that climb at
   * least minAlt are kept. `visible` = sunlit for some part of the pass while the observer's Sun is
   * at least 6 deg below the horizon: the classic "you can see it with your eyes" condition.
   */
  function findPasses(sat, lat, lon, start, hours, minAlt, stepSec) {
    minAlt = minAlt === undefined ? 10 : minAlt; stepSec = stepSec || 30;
    var t0 = start.getTime(), tEnd = t0 + hours * 3600000, passes = [];
    function altAt(t) { var l = look(sat, new Date(t), lat, lon); return l ? l.alt : -90; }
    function bisect(a, b, rising) { // horizon crossing between a and b, to 0.5 s
      for (var k = 0; k < 20 && b - a > 500; k++) { var m = (a + b) / 2; if ((altAt(m) > 0) === rising) b = m; else a = m; }
      return (a + b) / 2;
    }
    var prevT = t0, prevAlt = altAt(t0), rise = prevAlt > 0 ? t0 : null;
    for (var t = t0 + stepSec * 1000; t <= tEnd + stepSec * 1000; t += stepSec * 1000) {
      var alt = altAt(t);
      if (prevAlt <= 0 && alt > 0) rise = bisect(prevT, t, true);
      if (prevAlt > 0 && alt <= 0 && rise !== null) {
        var set = bisect(prevT, t, false), pass = describe(sat, rise, set, lat, lon, altAt);
        if (pass.maxAlt >= minAlt) passes.push(pass);
        rise = null;
      }
      prevT = t; prevAlt = alt;
    }
    return passes;
  }

  function describe(sat, rise, set, lat, lon, altAt) {
    var a = rise, b = set; // golden-section search for the highest point
    var g = (Math.sqrt(5) - 1) / 2, c = b - g * (b - a), d = a + g * (b - a), fc = altAt(c), fd = altAt(d);
    while (b - a > 500) {
      if (fc > fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = altAt(c); }
      else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = altAt(d); }
    }
    var peak = (a + b) / 2, lp = look(sat, new Date(peak), lat, lon);
    var lr = look(sat, new Date(rise), lat, lon), ls = look(sat, new Date(set), lat, lon);
    var visible = false, litAtPeak = sunlit(lp.eci, new Date(peak)), visStart = null, visEnd = null;
    for (var t = rise; t <= set; t += 20000) {
      var l = look(sat, new Date(t), lat, lon);
      if (l && l.alt > 0 && sunlit(l.eci, new Date(t)) && sunAltAt(new Date(t), lat, lon) < -6) {
        visible = true; if (visStart === null) visStart = t; visEnd = t;
      }
    }
    return { name: sat.name, rise: new Date(rise), peak: new Date(peak), set: new Date(set), maxAlt: lp.alt,
      riseAz: lr.az, peakAz: lp.az, setAz: ls.az, visible: visible, litAtPeak: litAtPeak,
      visibleFrom: visStart === null ? null : new Date(visStart), visibleTo: visEnd === null ? null : new Date(visEnd),
      sunAltAtPeak: sunAltAt(new Date(peak), lat, lon) };
  }

  /** Age of a TLE in days at a given moment. */
  function ageDays(sat, date) { return (date.getTime() - sat.epoch.getTime()) / 86400000; }

  return { parseTLEText: parseTLEText, makeSat: makeSat, look: look, sunlit: sunlit, findPasses: findPasses, ageDays: ageDays };
});
