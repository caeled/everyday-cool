/* Satellite Watch rules: the satellite families, data addresses and caching
 * policy, live positions (SGP4 via the bundled satellite.js), ground tracks,
 * orbit facts, and words. No page code lives here, so Node can check the
 * rules directly (see test.cjs). Original Everyday Cool code, MIT. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./vendor/satellite.min.js'));
  else root.SatWatch = factory(root.satellite);
})(this, function (satellite) {
  'use strict';
  var R2D = 180 / Math.PI, EARTH_R = 6378.137;

  // id, button label, emoji, CelesTrak GP group, a short blurb, and whether
  // the family is big enough to need sampling when drawn.
  var FAMILIES = [
    { id: 'stations', label: 'Space stations', emoji: '🏠', group: 'stations', blurb: 'Homes in orbit where astronauts live and work: the International Space Station (ISS) and China\u2019s Tiangong. The ISS goes all the way around Earth in about 90 minutes.' },
    { id: 'starlink', label: 'Starlink', emoji: '🌐', group: 'starlink', big: true, blurb: 'SpaceX\u2019s internet satellites \u2014 more than ten thousand of them, about 550 km up. New ones fly in a line like a string of pearls before they spread out.' },
    { id: 'oneweb', label: 'OneWeb', emoji: '📡', group: 'oneweb', big: true, blurb: 'Another space internet network, higher than Starlink (about 1,200 km), on rings that pass over the North and South Poles.' },
    { id: 'weather', label: 'Weather', emoji: '⛅', group: 'weather', blurb: 'The satellites that photograph clouds, hurricanes and snow, and measure temperature \u2014 the pictures behind the TV forecast.' },
    { id: 'gps', label: 'GPS', emoji: '🧭', group: 'gps-ops', blurb: 'America\u2019s navigation satellites, about 20,200 km up. Your phone listens to at least four of them at once to work out where it is.' },
    { id: 'glonass', label: 'GLONASS', emoji: '🧭', group: 'glo-ops', blurb: 'Russia\u2019s navigation satellites. Most phones use them together with GPS for a quicker, steadier fix.' },
    { id: 'galileo', label: 'Galileo', emoji: '🧭', group: 'galileo', blurb: 'Europe\u2019s navigation satellites, a little higher than GPS, named after the astronomer who first pointed a telescope at Jupiter\u2019s moons.' },
    { id: 'beidou', label: 'BeiDou', emoji: '🧭', group: 'beidou', blurb: 'China\u2019s navigation system. Some of its satellites sit so high they seem to hover over Asia, tracing a figure-eight.' },
    { id: 'iridium', label: 'Iridium NEXT', emoji: '📞', group: 'iridium-NEXT', blurb: 'Satellite phones that work anywhere on Earth, even at the poles: 66 working satellites in six rings, about 780 km up.' },
    { id: 'amateur', label: 'Amateur radio', emoji: '📻', group: 'amateur', blurb: 'Ham-radio satellites that licensed radio amateurs can talk through \u2014 many were built by students and volunteers.' },
    { id: 'science', label: 'Science', emoji: '🔭', group: 'science', blurb: 'Space telescopes and science missions, like the Hubble Space Telescope, looking at the Sun, stars and faraway galaxies.' },
    { id: 'earth', label: 'Earth observation', emoji: '🌍', group: 'resource', blurb: 'Cameras on satellites (Landsat, Sentinel and more) that watch forests, farms, ice, cities and floods change over the years.' },
    { id: 'visual', label: 'Brightest (visible to the eye)', emoji: '✨', group: 'visual', blurb: 'The ones bright enough to spot with your own eyes soon after sunset or before sunrise \u2014 many are big old rocket stages.' },
    { id: 'recent', label: 'Last 30 days\u2019 launches', emoji: '🚀', group: 'last-30-days', blurb: 'Everything launched in the last month. Newly launched satellites are still finding their final orbits, so their paths change fast.' },
  ];
  function family(id) { for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i].id === id) return FAMILIES[i]; return null; }

  var CELESTRAK = 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&';
  function groupUrl(group) { return CELESTRAK + 'GROUP=' + encodeURIComponent(group); }
  // Friendly names people type, and the catalogue number they mean.
  var ALIASES = { ISS: '25544', 'SPACE STATION': '25544', TIANGONG: '48274', 'CHINESE SPACE STATION': '48274', CSS: '48274', HUBBLE: '20580', 'HUBBLE SPACE TELESCOPE': '20580', HST: '20580' };
  function alias(text) { return ALIASES[String(text || '').trim().toUpperCase()] || null; }
  // Search by NORAD catalogue number (digits) or by name (CelesTrak matches
  // part of the name). Returns null for nothing useful.
  function searchUrl(text) {
    var q = alias(text) || String(text || '').trim();
    if (/^\d{1,9}$/.test(q)) return CELESTRAK + 'CATNR=' + q;
    if (q.length >= 3 && /^[A-Za-z0-9 ()\-+./]+$/.test(q)) return CELESTRAK + 'NAME=' + encodeURIComponent(q);
    return null;
  }

  // CelesTrak refreshes GP data about every two hours and asks people not to
  // download a group more often than that. Decide what to do with a cached
  // copy: use it as is, or fetch (keeping the copy as a fallback).
  var REFETCH_MS = 2 * 3600 * 1000;
  function cachePlan(entry, nowMs) {
    if (!entry || !entry.text || !isFinite(entry.at)) return 'fetch';
    return nowMs - entry.at < REFETCH_MS ? 'use-cache' : 'fetch-keep-cache';
  }

  /** CelesTrak TLE text -> [[name, line1, line2]]. "No GP data found" -> []. */
  function parseTLE(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) { return l.replace(/\s+$/, ''); }).filter(function (l) { return l.trim(); });
    var out = [];
    for (var i = 0; i + 2 < lines.length; ) {
      if (lines[i + 1].indexOf('1 ') === 0 && lines[i + 2].indexOf('2 ') === 0 && lines[i].indexOf('1 ') !== 0) { out.push([lines[i].trim(), lines[i + 1], lines[i + 2]]); i += 3; }
      else i++;
    }
    return out;
  }

  function makeSat(row, familyId) {
    try {
      var rec = satellite.twoline2satrec(row[1], row[2]);
      if (!rec || rec.error || !isFinite(rec.no) || !isFinite(rec.jdsatepoch)) return null;
      var epochMs = (rec.jdsatepoch + (rec.jdsatepochF || 0) - 2440587.5) * 86400000;
      return { name: row[0], norad: row[1].substr(2, 5).trim(), family: familyId || '', satrec: rec, epochMs: epochMs, tle: row };
    } catch (e) { return null; }
  }

  /** Where is it now? { lat, lon (-180..180), heightKm, speedKmS } or null. */
  function subpoint(sat, date) {
    var pv = satellite.propagate(sat.satrec, date);
    if (!pv || !pv.position || typeof pv.position === 'boolean' || !isFinite(pv.position.x)) return null;
    var g = satellite.eciToGeodetic(pv.position, satellite.gstime(date));
    var v = pv.velocity, speed = v ? Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) : NaN;
    var lon = g.longitude * R2D; lon = ((lon + 540) % 360) - 180;
    return { lat: g.latitude * R2D, lon: lon, heightKm: g.height, speedKmS: speed };
  }

  /** Orbit facts from the elements: period (min), inclination, perigee/apogee heights (km). */
  function orbitFacts(sat) {
    var r = sat.satrec, periodMin = 2 * Math.PI / r.no;
    return { periodMin: periodMin, inclinationDeg: r.inclo * R2D, perigeeKm: r.altp * EARTH_R, apogeeKm: r.alta * EARTH_R, eccentricity: r.ecco };
  }

  /** Path under the satellite from minutesBack to minutesAhead, split where it
   * crosses the date line so the map does not draw a line across the world. */
  function groundTrack(sat, date, minutesBack, minutesAhead, stepSec) {
    var segs = [], cur = [], prev = null, t0 = date.getTime();
    stepSec = stepSec || 30;
    for (var t = t0 - minutesBack * 60000; t <= t0 + minutesAhead * 60000; t += stepSec * 1000) {
      var p = subpoint(sat, new Date(t));
      if (!p) continue;
      if (prev && Math.abs(p.lon - prev.lon) > 180) { if (cur.length > 1) segs.push(cur); cur = []; }
      cur.push([p.lat, p.lon]); prev = p;
    }
    if (cur.length > 1) segs.push(cur);
    return segs;
  }

  /** Every n-th item so at most `max` remain, spread evenly over the list. */
  function sampleEvenly(list, max) {
    if (!max || list.length <= max) return list.slice();
    var out = [], step = list.length / max;
    for (var k = 0; k < max; k++) out.push(list[Math.floor(k * step)]);
    return out;
  }

  function ageDays(sat, nowMs) { return (nowMs - sat.epochMs) / 86400000; }
  function describeAge(days) {
    if (!isFinite(days)) return 'unknown';
    if (days < 0) return 'from the future (check the computer\u2019s clock)';
    if (days < 1 / 24) return 'less than an hour old';
    if (days < 1) return Math.round(days * 24) + ' hours old';
    var d = Math.round(days * 10) / 10;
    return d + (d === 1 ? ' day old' : ' days old') + (days > 14 ? ' \u2014 too old to trust; positions may be far off' : days > 5 ? ' \u2014 still fine for a rough position' : '');
  }
  function compass(deg) { var n = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; return n[Math.round((((deg % 360) + 360) % 360) / 45) % 8]; }
  function km(n) { return Math.round(n).toLocaleString('en-US') + ' km (' + Math.round(n * 0.621371).toLocaleString('en-US') + ' mi)'; }
  function speedWords(kmS) { return isFinite(kmS) ? kmS.toFixed(1) + ' km/s (' + Math.round(kmS * 3600 * 0.621371).toLocaleString('en-US') + ' mph)' : 'unknown'; }
  function periodWords(min) {
    if (!isFinite(min)) return 'unknown';
    if (min < 120) return Math.round(min) + ' minutes per trip around Earth';
    var h = min / 60; return h.toFixed(1) + ' hours per trip around Earth' + (Math.abs(min - 1436) < 15 ? ' (it keeps pace with Earth\u2019s spin)' : '');
  }

  // Sister-room links: the page links these; the test checks they exist.
  var LINKS = { tonightsSky: '../tonights-sky/index.html', telescopePlan: '../tonights-sky/downloads/backyard-radio-telescope-plan.pdf' };

  return { FAMILIES: FAMILIES, family: family, groupUrl: groupUrl, searchUrl: searchUrl, alias: alias, REFETCH_MS: REFETCH_MS, cachePlan: cachePlan,
    parseTLE: parseTLE, makeSat: makeSat, subpoint: subpoint, orbitFacts: orbitFacts, groundTrack: groundTrack, sampleEvenly: sampleEvenly,
    ageDays: ageDays, describeAge: describeAge, compass: compass, km: km, speedWords: speedWords, periodWords: periodWords, LINKS: LINKS };
});
