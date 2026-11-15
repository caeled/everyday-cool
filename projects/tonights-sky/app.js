/* Tonight's Sky: the interactive page. Original Everyday Cool code, MIT License.
 * Nothing here sends data anywhere, except the optional "Refresh orbits" button. */
(function () {
  'use strict';
  var A = window.AstroMath, DATA = window.SKY_DATA, OBJ = window.SKY_OBJECTS, R = window.RadioMath;
  var SP = window.SatPass, SNAP = window.SAT_SNAPSHOT;
  var $ = function (id) { return document.getElementById(id); };
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var deviceTZ = 'UTC';
  try { deviceTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { /* keep UTC */ }

  /* ---------- State ---------- */
  var state = {
    place: OBJ.PLACES[0], lat: OBJ.PLACES[0].lat, lon: OBJ.PLACES[0].lon, tz: OBJ.PLACES[0].tz,
    t: Date.now(), nightBase: 0,
    az0: 180, alt0: 30, fov: 110, playing: false, selected: null,
    layers: {}, magLimit: 4.5
  };

  /* ---------- Time zones (Intl, works offline) ---------- */
  var fmtCache = {};
  function fmt(tz, opts) {
    var key = tz + JSON.stringify(opts);
    if (!fmtCache[key]) { try { fmtCache[key] = new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: tz }, opts)); } catch (e) { fmtCache[key] = new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: 'UTC' }, opts)); } }
    return fmtCache[key];
  }
  function wallParts(ms, tz) {
    var o = {};
    fmt(tz, { hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
  }
  function offsetMs(ms, tz) { var p = wallParts(ms, tz); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; }
  function wallToMs(y, mo, d, h, mi, tz) {
    var guess = Date.UTC(y, mo - 1, d, h, mi), t = guess - offsetMs(guess, tz);
    return guess - offsetMs(t, tz);
  }
  function timeText(ms, withDay) {
    var o = { hour: 'numeric', minute: '2-digit' };
    if (withDay) { o.weekday = 'short'; o.month = 'short'; o.day = 'numeric'; }
    return fmt(state.tz, o).format(new Date(ms));
  }
  function zoneName(ms) {
    var n = ''; fmt(state.tz, { timeZoneName: 'short' }).formatToParts(new Date(ms)).forEach(function (p) { if (p.type === 'timeZoneName') n = p.value; });
    return n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /** Pick the "night" (noon to noon) that contains the current instant. */
  function syncNight() {
    var p = wallParts(state.t, state.tz), base = wallToMs(p.y, p.mo, p.d, 12, 0, state.tz);
    if (state.t < base) { var q = wallParts(base - 86400000, state.tz); base = wallToMs(q.y, q.mo, q.d, 12, 0, state.tz); }
    state.nightBase = base;
    var b = wallParts(base, state.tz);
    $('night').value = b.y + '-' + pad(b.mo) + '-' + pad(b.d);
    $('clock').value = Math.round((state.t - base) / 60000);
  }
  function setTime(ms) { state.t = ms; syncNight(); invalidate(true); }

  /* ---------- Precomputed catalogue vectors ---------- */
  var stars = DATA.stars.map(function (s) {
    var named = OBJ.NAMED[s[4]];
    return { kind: 'star', ra: s[0], dec: s[1], mag: s[2], bv: s[3], hr: s[4], bayer: s[5], con: s[6],
      v: A.unitVector(s[0], s[1]), name: named ? named[0] : null, info: named || null };
  });
  var figures = DATA.figures.map(function (f) {
    var sum = [0, 0, 0], n = 0;
    var polys = f[1].map(function (poly) { return poly.map(function (pt) { var v = A.unitVector(pt[0], pt[1]); sum[0] += v[0]; sum[1] += v[1]; sum[2] += v[2]; n++; return v; }); });
    var len = Math.hypot(sum[0], sum[1], sum[2]) || 1;
    return { id: f[0], polys: polys, center: [sum[0] / len, sum[1] / len, sum[2] / len], info: DATA.constellations[f[0]] };
  });
  var deep = OBJ.DEEP_SKY.map(function (d) { return { kind: 'deep', id: d[0], name: d[1], ra: d[2] * 15, dec: d[3], mag: d[4], ly: d[5], note: d[6], v: A.unitVector(d[2] * 15, d[3]) }; });
  var radioSrc = R.SOURCES.map(function (s) { return Object.assign({ kind: 'radio', v: A.unitVector(s.ra * 15, s.dec) }, s); });
  var galPlane = [];
  for (var gl = 0; gl < 360; gl += 2) { var gq = R.galacticToEq(gl, 0); galPlane.push({ l: gl, v: A.unitVector(gq.ra * 15, gq.dec) }); }

  /* ---------- Satellites ---------- */
  var sats = { list: [], fetchedLabel: SNAP ? SNAP.fetched : null, source: 'snapshot' };
  function loadSats(rows) { sats.list = rows.map(SP.makeSat).filter(Boolean); }
  if (SP && SNAP) loadSats(SNAP.tle);

  /* ---------- Frame computation ---------- */
  var frame = null;
  function computeFrame() {
    var jd = A.julianDay(new Date(state.t));
    var P = A.precessionMatrix(jd), H = A.horizonMatrix(jd, state.lat, state.lon), M = A.matMul(H, P);
    var s = A.sun(jd), m = A.moon(jd);
    var sunH = A.altAz(s.ra, s.dec, state.lat, state.lon, jd);
    var moonGeo = A.altAz(m.ra, m.dec, state.lat, state.lon, jd);
    var moonH = { alt: A.topocentricMoonAlt(moonGeo.alt, m.r), az: moonGeo.az };
    var bodies = [
      { kind: 'sun', name: 'Sun', alt: sunH.alt, az: sunH.az, mag: -26.7, distanceKm: s.distanceKm, ra: s.ra, dec: s.dec },
      { kind: 'moon', name: 'Moon', alt: moonH.alt, az: moonH.az, mag: -10, distanceKm: m.distanceKm, ra: m.ra, dec: m.dec, phase: A.moonPhase(jd) }
    ];
    A.PLANETS.forEach(function (n) {
      var p = A.planet(n, jd), h = A.altAz(p.ra, p.dec, state.lat, state.lon, jd);
      bodies.push({ kind: 'planet', name: n, alt: h.alt, az: h.az, mag: p.mag, distanceKm: p.distanceKm, ra: p.ra, dec: p.dec, illuminated: p.illuminated });
    });
    var satNow = [];
    if (state.layers.sats && sats.list.length) {
      var d = new Date(state.t), group = $('satGroup').value, many = sats.list.length > 400;
      sats.list.forEach(function (st) {
        if (many && st.group === 'starlink-all' && group !== 'starlink-all' && !state.layers.allSats) return;
        var l = SP.look(st, d, state.lat, state.lon);
        if (l && l.alt > -2) satNow.push({ kind: 'sat', name: st.name, sat: st, alt: l.alt, az: l.az, heightKm: l.heightKm, rangeKm: l.rangeKm, lit: SP.sunlit(l.eci, d), mag: 3 });
      });
    }
    frame = { jd: jd, M: M, H: H, sun: bodies[0], moon: bodies[1], bodies: bodies, sats: satNow, obliq: A.obliquity(A.dayNumber(jd)) };
  }

  /* ---------- Projection (stereographic, centred on the view direction) ---------- */
  var canvas = $('sky'), ctx = canvas.getContext('2d'), W = 0, Hh = 0, dpr = 1;
  var cam = {};
  function setupCamera() {
    var f = A.altAzToVec(state.alt0, state.az0), r = [Math.cos(state.az0 * D2R), -Math.sin(state.az0 * D2R), 0];
    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    cam = { f: f, r: r, u: u, s: (Math.min(W, Hh * 1.4) / 2) / (2 * Math.tan(state.fov * D2R / 4)), cx: W / 2, cy: Hh / 2 };
  }
  function project(v) { // horizon vector -> screen {x, y} or null
    var X = v[0] * cam.r[0] + v[1] * cam.r[1] + v[2] * cam.r[2];
    var Y = v[0] * cam.u[0] + v[1] * cam.u[1] + v[2] * cam.u[2];
    var Z = v[0] * cam.f[0] + v[1] * cam.f[1] + v[2] * cam.f[2];
    if (Z < -0.6) return null;
    var k = 2 / (1 + Z);
    return { x: cam.cx + cam.s * k * X, y: cam.cy - cam.s * k * Y };
  }
  function unproject(px, py) { // screen -> horizon vector
    var X = (px - cam.cx) / cam.s, Y = (cam.cy - py) / cam.s, rho2 = X * X + Y * Y;
    var Z = (4 - rho2) / (4 + rho2), a = (1 + Z) / 2;
    X *= a; Y *= a;
    return [X * cam.r[0] + Y * cam.u[0] + Z * cam.f[0], X * cam.r[1] + Y * cam.u[1] + Z * cam.f[1], X * cam.r[2] + Y * cam.u[2] + Z * cam.f[2]];
  }
  function onScreen(p, m) { m = m || 20; return p && p.x > -m && p.y > -m && p.x < W + m && p.y < Hh + m; }

  /* ---------- Colours ---------- */
  function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function skyColor(sunAlt) {
    if (!state.layers.day) return [5, 10, 24];
    if (sunAlt > 5) return [62, 124, 201];
    if (sunAlt > -1) return mix([46, 72, 130], [62, 124, 201], (sunAlt + 1) / 6);
    if (sunAlt > -6) return mix([24, 36, 78], [46, 72, 130], (sunAlt + 6) / 5);
    if (sunAlt > -12) return mix([11, 18, 44], [24, 36, 78], (sunAlt + 12) / 6);
    if (sunAlt > -18) return mix([5, 10, 24], [11, 18, 44], (sunAlt + 18) / 6);
    return [5, 10, 24];
  }
  function skyLimit(sunAlt) {
    if (!state.layers.day) return 99;
    if (sunAlt > 0) return -3.5;
    if (sunAlt > -6) return -3.5 + (-sunAlt) / 6 * 5;
    if (sunAlt > -12) return 1.5 + (-sunAlt - 6) / 6 * 2.5;
    if (sunAlt > -18) return 4 + (-sunAlt - 12) / 6 * 2.5;
    return 99;
  }
  function starColor(bv) {
    if (bv < 0) return '#b9ccff'; if (bv < 0.3) return '#dfe7ff'; if (bv < 0.6) return '#fff8ec';
    if (bv < 1.0) return '#ffe2b0'; if (bv < 1.4) return '#ffc98a'; return '#ffab70';
  }

  /* ---------- Drawing ---------- */
  var bg = document.createElement('canvas'), bgx = bg.getContext('2d');
  var ground = document.createElement('canvas'), gx = ground.getContext('2d');
  var picks = [];
  function drawBackground() {
    var step = 4, w = Math.ceil(W / step), h = Math.ceil(Hh / step);
    bg.width = ground.width = w; bg.height = ground.height = h;
    var sky = bgx.createImageData(w, h), gr = gx.createImageData(w, h);
    var base = skyColor(frame.sun.alt), glow = state.layers.day && frame.sun.alt > -12;
    var sunV = A.altAzToVec(frame.sun.alt, frame.sun.az), solid = state.layers.ground;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var v = unproject(i * step + step / 2, j * step + step / 2), k = (j * w + i) * 4, c = base;
      var alt = Math.asin(Math.max(-1, Math.min(1, v[2]))) * R2D;
      if (glow) { // brighter near the horizon on the Sun's side at twilight
        var dot = v[0] * sunV[0] + v[1] * sunV[1] + v[2] * sunV[2];
        var t = Math.pow(1 - Math.min(1, Math.max(0, alt) / 60), 3) * (0.35 + 0.65 * Math.max(0, dot)) * Math.min(1, (frame.sun.alt + 12) / 12);
        c = mix(base, frame.sun.alt > 0 ? [170, 205, 240] : [200, 120, 80], t * 0.7);
      }
      sky.data[k] = c[0]; sky.data[k + 1] = c[1]; sky.data[k + 2] = c[2]; sky.data[k + 3] = 255;
      if (alt < 0) {
        var gc = frame.sun.alt > 0 && state.layers.day ? [42, 58, 38] : [14, 20, 16];
        gr.data[k] = gc[0]; gr.data[k + 1] = gc[1]; gr.data[k + 2] = gc[2]; gr.data[k + 3] = solid ? 245 : 90;
      }
    }
    bgx.putImageData(sky, 0, 0); gx.putImageData(gr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bg, 0, 0, W, Hh);
  }
  function visibleAlt(alt) { return !state.layers.ground || alt > -0.5; }
  function polyline(vecs, style, width, dash) {
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []);
    ctx.beginPath(); var pen = false;
    for (var i = 0; i < vecs.length; i++) {
      var v = vecs[i], p = (state.layers.ground && v[2] < -0.01) ? null : project(v);
      if (!onScreen(p, 400)) { pen = false; continue; }
      if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      pen = true;
    }
    ctx.stroke(); ctx.setLineDash([]);
  }
  function label(text, p, color, size, dx, dy) {
    ctx.font = (size || 12) + 'px system-ui, sans-serif'; ctx.fillStyle = color;
    ctx.fillText(text, p.x + (dx === undefined ? 6 : dx), p.y + (dy === undefined ? -6 : dy));
  }
  function eqOfDateToHorizon(raDeg, dec) { return A.applyMat(frame.H, A.unitVector(raDeg, dec)); }

  function draw() {
    if (!W) return;
    setupCamera(); picks = [];
    drawBackground();
    var radio = state.layers.radio, dim = radio ? 0.25 : 1;
    var limit = Math.min(state.magLimit, skyLimit(frame.sun.alt));
    // Radio glow of the Milky Way
    if (radio) drawRadioSky();
    // Grids
    if (state.layers.grid) {
      for (var a = 0; a < 360; a += 30) { var col = []; for (var h = 0; h <= 90; h += 3) col.push(A.altAzToVec(h, a)); polyline(col, 'rgba(120,170,255,.25)', 1); }
      [30, 60].forEach(function (h) { var row = []; for (var a2 = 0; a2 <= 360; a2 += 3) row.push(A.altAzToVec(h, a2)); polyline(row, 'rgba(120,170,255,.25)', 1); });
    }
    if (state.layers.eq) { var eq = []; for (var r = 0; r <= 360; r += 2) eq.push(eqOfDateToHorizon(r, 0)); polyline(eq, 'rgba(120,220,255,.55)', 1.5, [6, 5]); }
    if (state.layers.ecl) {
      var ec = [], e = frame.obliq;
      for (var lo = 0; lo <= 360; lo += 2) { var q = A.eclToEq(lo, 0, A.dayNumber(frame.jd)); ec.push(eqOfDateToHorizon(q.ra * 15, q.dec)); }
      polyline(ec, 'rgba(255,210,122,.7)', 1.5, [2, 4]);
      void e;
    }
    // Constellations
    if (state.layers.lines && !radio) figures.forEach(function (f) { f.polys.forEach(function (poly) { polyline(poly.map(function (v) { return A.applyMat(frame.M, v); }), state.layers.day && frame.sun.alt > -6 ? 'rgba(140,175,235,.22)' : 'rgba(140,175,235,.45)', 1); }); });
    if (state.layers.cons && !radio) figures.forEach(function (f) {
      var v = A.applyMat(frame.M, f.center); if (!visibleAlt(Math.asin(v[2]) * R2D)) return;
      var p = project(v); if (!onScreen(p)) return;
      if (state.fov > 140 && f.info.rank > 2) return;
      ctx.textAlign = 'center'; label(f.info.name.toUpperCase(), p, 'rgba(160,190,240,.75)', 11, 0, 0); ctx.textAlign = 'left';
    });
    // Trails
    if (state.layers.trails) drawTrails(limit);
    // Stars
    var zoomBoost = Math.max(0, (110 - state.fov) / 40);
    stars.forEach(function (st) {
      if (st.mag > limit) return;
      var v = A.applyMat(frame.M, st.v), alt = Math.asin(v[2]) * R2D;
      if (!visibleAlt(alt)) return;
      var p = project(v); if (!onScreen(p, 5)) return;
      var rad = Math.max(0.7, (4.6 - st.mag) * 0.8 + zoomBoost * 0.6);
      ctx.globalAlpha = dim; ctx.fillStyle = starColor(st.bv);
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      st.alt = alt; st.az = A.rev(Math.atan2(v[0], v[1]) * R2D);
      picks.push({ x: p.x, y: p.y, r: rad + 4, o: st });
      if (state.layers.names && st.name && !radio && (st.mag < 1.6 || state.fov < 90)) label(st.name, p, 'rgba(230,235,245,.85)', 12);
    });
    // Deep sky
    if (state.layers.deep && !radio) deep.forEach(function (d) {
      if (d.mag > limit + 1.5) return;
      var v = A.applyMat(frame.M, d.v), alt = Math.asin(v[2]) * R2D;
      if (!visibleAlt(alt)) return; var p = project(v); if (!onScreen(p)) return;
      ctx.strokeStyle = 'rgba(180,230,200,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 4, 0.5, 0, 7); ctx.stroke();
      d.alt = alt; d.az = A.rev(Math.atan2(v[0], v[1]) * R2D);
      picks.push({ x: p.x, y: p.y, r: 9, o: d });
      if (state.fov < 100) label(d.name, p, 'rgba(180,230,200,.85)', 11);
    });
    // Radio sources
    if (radio) radioSrc.forEach(function (s) {
      var v = A.applyMat(frame.M, s.v), alt = Math.asin(v[2]) * R2D;
      if (!visibleAlt(alt)) return; var p = project(v); if (!onScreen(p)) return;
      var rr = 6 + Math.log10(s.jy + 1) * 4, g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
      g.addColorStop(0, 'rgba(255,255,200,1)'); g.addColorStop(0.4, 'rgba(255,120,60,.8)'); g.addColorStop(1, 'rgba(255,60,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 7); ctx.fill();
      s.alt = alt; s.az = A.rev(Math.atan2(v[0], v[1]) * R2D);
      picks.push({ x: p.x, y: p.y, r: rr, o: s }); label(s.name, p, '#ffd2b0', 12, rr * 0.7, -rr * 0.7);
    });
    // Sun, Moon, planets
    frame.bodies.forEach(function (b) {
      if (!visibleAlt(b.alt)) return;
      var p = project(A.altAzToVec(b.alt, b.az)); if (!onScreen(p)) return;
      var rad;
      if (b.kind === 'sun') {
        rad = radio ? 16 : 11;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2.2);
        g.addColorStop(0, radio ? '#fff6c0' : '#fffbe6'); g.addColorStop(0.45, radio ? 'rgba(255,140,60,.9)' : 'rgba(255,215,106,.9)'); g.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rad * 2.2, 0, 7); ctx.fill();
      } else if (b.kind === 'moon') {
        rad = 9 + Math.max(0, (60 - state.fov) / 10);
        var sp = project(A.altAzToVec(frame.sun.alt, frame.sun.az));
        var ang = sp ? Math.atan2(sp.y - p.y, sp.x - p.x) : 0;
        drawMoon(ctx, p.x, p.y, rad, b.phase.illuminated, ang, dim);
      } else {
        if (b.mag > limit + 0.5 && !(state.layers.day && b.mag < -3.5)) return;
        if (radio && b.name !== 'Jupiter') { ctx.globalAlpha = 0.3; }
        rad = Math.max(2.5, Math.min(6, 4.5 - b.mag * 0.8));
        ctx.fillStyle = OBJ.BODIES[b.name].color; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      }
      picks.push({ x: p.x, y: p.y, r: rad + 6, o: b, pri: 1 });
      if (state.layers.names || b.kind !== 'planet') label(b.name, p, b.kind === 'planet' ? '#ffe9b8' : '#fff', 13, rad + 3, -rad);
    });
    // Satellites
    if (state.layers.sats) frame.sats.forEach(function (s) {
      if (!visibleAlt(s.alt)) return; var p = project(A.altAzToVec(s.alt, s.az)); if (!onScreen(p)) return;
      var isISS = /ISS/.test(s.name), dark = frame.sun.alt < -6;
      ctx.fillStyle = s.lit ? (isISS ? '#ffffff' : '#cfe3ff') : 'rgba(150,160,180,.45)';
      ctx.beginPath(); ctx.rect(p.x - 2.5, p.y - 2.5, 5, 5); ctx.fill();
      if (isISS) { ctx.strokeStyle = '#fff'; ctx.strokeRect(p.x - 5, p.y - 5, 10, 10); }
      picks.push({ x: p.x, y: p.y, r: 9, o: s, pri: 1 });
      if (isISS || frame.sats.length < 40) label(isISS ? 'ISS' : s.name.replace('STARLINK-', 'SL-'), p, s.lit && dark ? '#e8f0ff' : 'rgba(200,210,230,.7)', 11);
    });
    // Selection ring
    if (state.selected) {
      var so = locate(state.selected);
      if (so && visibleAlt(so.alt)) { var sp2 = project(A.altAzToVec(so.alt, so.az)); if (onScreen(sp2)) { ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sp2.x, sp2.y, 14, 0, 7); ctx.stroke(); } }
    }
    // Ground and horizon
    ctx.drawImage(ground, 0, 0, W, Hh);
    var hz = []; for (var az = 0; az <= 360; az += 2) hz.push(A.altAzToVec(0, az));
    var keepGround = state.layers.ground; state.layers.ground = false; polyline(hz, 'rgba(200,220,190,.8)', 1.5); state.layers.ground = keepGround;
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach(function (c, i) {
      var p = project(A.altAzToVec(-3.5, i * 45)); if (!onScreen(p)) return;
      ctx.textAlign = 'center'; label(c, p, i % 2 ? 'rgba(220,230,210,.7)' : '#f2f5e8', i % 2 ? 13 : 17, 0, 6); ctx.textAlign = 'left';
    });
    var zp = project([0, 0, 1]); if (onScreen(zp)) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(zp.x - 5, zp.y); ctx.lineTo(zp.x + 5, zp.y); ctx.moveTo(zp.x, zp.y - 5); ctx.lineTo(zp.x, zp.y + 5); ctx.stroke(); label('zenith', zp, 'rgba(255,255,255,.45)', 10); }
    if (radio) { ctx.fillStyle = 'rgba(255,190,150,.95)'; ctx.font = '13px system-ui, sans-serif'; ctx.fillText('RADIO EYES · simulated picture of the radio sky', 12, Hh - 12); }
  }

  function drawRadioSky() {
    var pts = galPlane.map(function (g) { return { l: g.l, v: A.applyMat(frame.M, g.v) }; });
    ctx.save(); ctx.lineCap = 'round';
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      if (state.layers.ground && (a.v[2] < 0 && b.v[2] < 0)) continue;
      var pa = project(a.v), pb = project(b.v); if (!onScreen(pa, 300) || !onScreen(pb, 300)) continue;
      var dl = Math.min(a.l, 360 - a.l), bright = 0.25 + 0.75 * Math.exp(-dl / 50); // brightest toward the centre
      [[34, 0.12], [18, 0.22], [7, 0.45]].forEach(function (w) {
        ctx.strokeStyle = 'rgba(255,' + Math.round(90 + 90 * bright) + ',80,' + (w[1] * bright).toFixed(3) + ')';
        ctx.lineWidth = w[0] * (cam.s / 300); ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      });
    }
    ctx.restore();
  }

  function drawTrails(limit) {
    var steps = 24, span = 2 * 3600000, mats = [];
    for (var k = 0; k <= steps; k++) {
      var jd = A.julianDay(new Date(state.t - span * k / steps));
      mats.push(A.matMul(A.horizonMatrix(jd, state.lat, state.lon), A.precessionMatrix(jd)));
    }
    ctx.lineWidth = 1.2;
    stars.forEach(function (st) {
      if (st.mag > Math.min(3, limit)) return;
      ctx.strokeStyle = 'rgba(200,215,255,.45)'; ctx.beginPath(); var pen = false;
      for (var k = 0; k <= steps; k++) {
        var v = A.applyMat(mats[k], st.v);
        if (state.layers.ground && v[2] < 0) { pen = false; continue; }
        var p = project(v); if (!onScreen(p, 200)) { pen = false; continue; }
        if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); pen = true;
      }
      ctx.stroke();
    });
  }

  /** Moon disc with phase; the bright limb faces angle `ang` (radians, screen). */
  function drawMoon(c, x, y, r, k, ang, alpha) {
    c.save(); c.globalAlpha = alpha === undefined ? 1 : Math.max(alpha, 0.5);
    c.translate(x, y); c.rotate(ang);
    c.fillStyle = '#2a2d36'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = '#f1efe4'; c.beginPath(); c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); c.fill();
    var rx = r * Math.abs(1 - 2 * k);
    c.fillStyle = k < 0.5 ? '#2a2d36' : '#f1efe4';
    c.beginPath(); c.ellipse(0, 0, Math.max(rx, 0.01), r, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
    c.restore();
  }

  /* ---------- Finding things ---------- */
  function keyOf(o) { return o.kind + ':' + (o.hr || o.id || o.name); }
  function locate(key) {
    if (!frame) return null;
    var all = frame.bodies.concat(frame.sats);
    for (var i = 0; i < all.length; i++) if (keyOf(all[i]) === key) return all[i];
    var pools = [stars, deep, radioSrc];
    for (var j = 0; j < pools.length; j++) for (var k = 0; k < pools[j].length; k++) {
      var o = pools[j][k];
      if (keyOf(o) === key) { var v = A.applyMat(frame.M, o.v); o.alt = Math.asin(v[2]) * R2D; o.az = A.rev(Math.atan2(v[0], v[1]) * R2D); return o; }
    }
    return null;
  }
  function pickAt(x, y) {
    var best = null, bd = 1e9;
    picks.forEach(function (p) { var d = Math.hypot(p.x - x, p.y - y) - (p.pri ? 4 : 0); if (d < p.r + 4 && d < bd) { bd = d; best = p.o; } });
    return best;
  }
  function describeDir(alt, az) { return Math.round(alt) + '° up, toward the ' + A.compass(az); }
  function lightText(sec) {
    if (sec < 120) return sec.toFixed(1) + ' seconds';
    if (sec < 7200) return (sec / 60).toFixed(1) + ' minutes';
    return (sec / 3600).toFixed(1) + ' hours';
  }
  function lyText(ly) {
    if (ly >= 1e6) return (ly / 1e6).toFixed(1) + ' million light-years';
    return (ly < 20 ? ly.toFixed(1) : Math.round(ly).toLocaleString('en-US')) + ' light-years';
  }
  function leftWhen(ly) {
    var year = new Date(state.t).getUTCFullYear();
    if (ly >= 1e6) return 'about ' + (ly / 1e6).toFixed(1) + ' million years ago, before there were any humans';
    var y = Math.round(year - ly);
    return 'around the year ' + (y > 0 ? y : Math.abs(y) + ' BCE');
  }
  function riseSetText(o) {
    if (o.kind === 'sat') return '';
    var radecAt;
    if (o.kind === 'sun') radecAt = function (j) { return A.sun(j); };
    else if (o.kind === 'moon') radecAt = function (j) { var m = A.moon(j); return { ra: m.ra, dec: m.dec, altFix: function (a) { return A.topocentricMoonAlt(a, m.r); } }; };
    else if (o.kind === 'planet') radecAt = function (j) { return A.planet(o.name, j); };
    else { var q = A.precess(o.ra / 15, o.dec, A.J2000, frame.jd); radecAt = function () { return q; }; }
    var c = A.crossings(radecAt, state.lat, state.lon, frame.jd, 1, o.kind === 'sun' ? -0.833 : o.kind === 'moon' ? 0.125 : -0.5667, 6);
    if (c.alwaysUp) return 'Up all day and night from here (never sets).';
    if (c.neverUp) return 'Never rises above the horizon from here, today.';
    var ev = [];
    if (c.rises[0]) ev.push([c.rises[0], 'rises ']);
    if (c.sets[0]) ev.push([c.sets[0], 'sets ']);
    ev.sort(function (a, b) { return a[0] - b[0]; });
    var parts = ev.map(function (e) { return e[1] + timeText(A.dateFromJD(e[0]).getTime(), true); });
    return 'Next 24 hours: ' + parts.join(', ') + '.';
  }
  function showCard(o) {
    var card = $('card'), html = '', dl = [];
    state.selected = o ? keyOf(o) : null;
    if (!o) { card.hidden = true; invalidate(); return; }
    var title = o.name || (o.bayer ? o.bayer + ' ' + (DATA.constellations[o.con] ? DATA.constellations[o.con].gen : o.con) : 'HR ' + o.hr);
    var type = '', fact = '';
    if (o.kind === 'star') {
      var cn = DATA.constellations[o.con];
      type = 'Star' + (cn ? ' in ' + cn.name + ' (' + cn.en + ')' : '');
      if (o.name && o.bayer) dl.push(['Also called', o.bayer + ' ' + cn.gen]);
      dl.push(['Brightness', 'magnitude ' + o.mag.toFixed(1)]);
      if (o.info) { dl.push(['Distance', (o.info[3] ? 'roughly ' : 'about ') + lyText(o.info[1])]); dl.push(['Its light left', leftWhen(o.info[1])]); fact = o.info[2]; }
      dl.push(['Catalogue', 'HR ' + o.hr + ' (Yale Bright Star Catalogue)']);
    } else if (o.kind === 'planet' || o.kind === 'sun' || o.kind === 'moon') {
      type = o.kind === 'planet' ? 'Planet' : o.kind === 'sun' ? 'Our star' : 'Our Moon';
      fact = OBJ.BODIES[o.name].note;
      if (o.kind === 'moon') dl.push(['Phase', o.phase.name + ', ' + Math.round(o.phase.illuminated * 100) + '% lit']);
      if (o.kind === 'planet') dl.push(['Brightness', 'magnitude ' + o.mag.toFixed(1) + (o.name === 'Saturn' ? ' (rings ignored)' : '')]);
      dl.push(['Distance', Math.round(o.distanceKm).toLocaleString('en-US') + ' km']);
      dl.push(['Light takes', lightText(A.lightSeconds(o.distanceKm))]);
    } else if (o.kind === 'deep') {
      type = 'Binocular treasure (' + o.id + ')'; fact = o.note;
      dl.push(['Brightness', 'magnitude ' + o.mag.toFixed(1) + ', spread out']); dl.push(['Distance', 'about ' + lyText(o.ly)]); dl.push(['Its light left', leftWhen(o.ly)]);
    } else if (o.kind === 'radio') {
      type = 'Radio source'; fact = o.note; dl.push(['Radio brightness', 'about ' + o.jy.toLocaleString('en-US') + ' jansky near 1.4 GHz' + (o.jy < 5 ? ' (a point inside a very bright region)' : '')]);
    } else if (o.kind === 'sat') {
      type = /ISS/.test(o.name) ? 'Space station' : /STARLINK/.test(o.name) ? 'SpaceX Starlink satellite' : /DRAGON/i.test(o.name) ? 'SpaceX Dragon spacecraft' : 'Satellite';
      dl.push(['Height', Math.round(o.heightKm).toLocaleString('en-US') + ' km above the Earth']);
      dl.push(['Distance from you', Math.round(o.rangeKm).toLocaleString('en-US') + ' km']);
      dl.push(['Sunlit?', o.lit ? 'Yes, sunlight is on it' : 'No, it is in the Earth\u2019s shadow']);
      var age = SP.ageDays(o.sat, new Date(state.t));
      dl.push(['Orbit data', (age >= 0 ? age.toFixed(1) + ' days old' : 'from ' + (-age).toFixed(1) + ' days in the future') + (Math.abs(age) > 14 ? ' (too old to trust)' : '')]);
      fact = /ISS/.test(o.name) ? 'People live on board. It circles the Earth about every 92 minutes, so the crew sees 16 sunrises a day.' : 'Starlink satellites relay internet signals. Newly launched ones travel in a line, like a string of pearls.';
    }
    if (o.alt !== undefined) dl.unshift(['Where', describeDir(o.alt, o.az) + (o.alt < 0 ? ' (below the horizon)' : '')]);
    if (o.kind !== 'sat') { var rs = riseSetText(o); if (rs) dl.push(['Rise/set', rs]); }
    html = '<button type="button" class="close" aria-label="Close">×</button><h3>' + esc(title) + '</h3><p class="type">' + esc(type) + '</p><dl>' +
      dl.map(function (d) { return '<dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd>'; }).join('') + '</dl>' + (fact ? '<p>' + esc(fact) + '</p>' : '') +
      (o.kind === 'sun' ? '<p><strong>Never look at the Sun</strong>, and never through binoculars or a telescope.</p>' : '') +
      '<button type="button" class="center">Centre it</button>';
    card.innerHTML = html; card.hidden = false;
    card.querySelector('.close').onclick = function () { showCard(null); canvas.focus(); };
    card.querySelector('.center').onclick = function () { var l = locate(state.selected); if (l) { state.az0 = l.az; state.alt0 = Math.max(-5, Math.min(90, l.alt)); invalidate(); } };
    invalidate();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Render loop ---------- */
  var dirty = true, dataDirty = true, lastPanel = 0;
  function invalidate(data) { dirty = true; if (data) dataDirty = true; }
  function resize() {
    var rect = canvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; Hh = rect.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); invalidate();
  }
  var lastTick = 0, dayAccum = 0;
  function loop(ts) {
    if (state.playing) {
      var dt = lastTick ? Math.min(0.25, (ts - lastTick) / 1000) : 0, sp = $('speed').value;
      if (sp === 'day') { dayAccum += dt; if (dayAccum > (reduceMotion ? 1.2 : 0.5)) { dayAccum = 0; state.t += 86400000; syncNight(); invalidate(true); } }
      else { state.t += dt * Number(sp) * 60000; syncNight(); invalidate(true); }
    }
    lastTick = ts;
    if (dirty) {
      if (dataDirty) { computeFrame(); dataDirty = false; }
      draw(); dirty = false;
      if (!state.playing || ts - lastPanel > 1000) { updatePanels(); lastPanel = ts; }
      if (state.selected && !$('card').hidden && !state.playing) refreshCardLive();
    }
    requestAnimationFrame(loop);
  }
  var cardTimer = null;
  function refreshCardLive() { clearTimeout(cardTimer); cardTimer = setTimeout(function () { var l = locate(state.selected); if (l) showCardQuiet(l); }, 150); }
  function showCardQuiet(o) { var sel = state.selected; showCard(o); state.selected = sel; dirty = false; }

  /* ---------- Panels: status, tonight, light, latitude ---------- */
  var nightCache = { key: '', v: null };
  function updatePanels() {
    var f = frame; if (!f) return;
    $('clockOut').textContent = timeText(state.t, true) + ' ' + zoneName(state.t);
    var tw = A.twilight(f.sun.alt);
    $('status').textContent = state.place.name + ' · ' + timeText(state.t, true) + ' ' + zoneName(state.t) + ' · Sun ' + Math.round(f.sun.alt) + '° (' + tw + ') · Moon: ' + f.moon.phase.name.toLowerCase() + ', ' + Math.round(f.moon.phase.illuminated * 100) + '% lit · Looking ' + (state.alt0 > 80 ? 'straight up' : 'toward the ' + A.compass(state.az0));
    var up = f.bodies.filter(function (b) { return b.alt > 0 && b.kind !== 'sun'; }).map(function (b) { return b.name + ' (' + describeDir(b.alt, b.az) + ')'; });
    $('skySummary').textContent = 'Text summary: ' + (up.length ? 'above the horizon now: ' + up.join('; ') + '.' : 'no planets or Moon above the horizon right now.') + (f.sun.alt > 0 ? ' It is daytime here.' : '');
    // Night times
    var key = state.nightBase + ':' + state.lat + ':' + state.lon;
    if (nightCache.key !== key) { nightCache = { key: key, v: A.nightTimes(state.lat, state.lon, A.julianDay(new Date(state.nightBase))) }; }
    var n = nightCache.v, rows = [];
    function tt(j) { return j ? timeText(A.dateFromJD(j).getTime(), false) : '—'; }
    if (n.sunNeverUp) rows.push(['Sun', 'does not rise (polar night)']);
    else if (n.sunAlwaysUp) rows.push(['Sun', 'does not set (midnight Sun)']);
    else { rows.push(['Sunset', tt(n.sunset)]); rows.push(['Sunrise', tt(n.sunrise)]); }
    if (n.neverDark) rows.push(['Full darkness', 'not tonight (twilight all night)']);
    else if (!n.sunNeverUp || n.darkStart) { rows.push(['Truly dark from', tt(n.darkStart)]); rows.push(['until', tt(n.darkEnd)]); }
    rows.push(['Times in', zoneName(state.t) + (state.place.id === 'custom' ? ' (your device)' : '')]);
    $('nightTimes').innerHTML = rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    var mc = $('moonIcon').getContext('2d'); mc.clearRect(0, 0, 96, 96);
    drawMoon(mc, 48, 48, 40, f.moon.phase.illuminated, f.moon.phase.waxing === (state.lat >= 0) ? 0 : Math.PI, 1);
    $('moonText').textContent = f.moon.phase.name + ', ' + Math.round(f.moon.phase.illuminated * 100) + '% lit, about ' + f.moon.phase.age.toFixed(1) + ' days after new Moon. ' + (f.moon.alt > 0 ? 'Up now, ' + describeDir(f.moon.alt, f.moon.az) + '.' : 'Below the horizon right now.') + ' (Drawing: lit side as seen from the ' + (state.lat >= 0 ? 'north' : 'south') + 'ern hemisphere.)';
    // Up list
    var items = [];
    f.bodies.forEach(function (b) { if (b.kind === 'moon' && b.alt > 0) items.push(b); if (b.kind === 'planet' && b.alt > 5 && b.mag < 6.5) items.push(b); });
    var lim = skyLimit(f.sun.alt);
    stars.forEach(function (s) { if (s.name && s.mag < 1.5) { var v = A.applyMat(f.M, s.v), a = Math.asin(v[2]) * R2D; if (a > 10 && s.mag < lim) { s.alt = a; s.az = A.rev(Math.atan2(v[0], v[1]) * R2D); items.push(s); } } });
    if (f.sun.alt < -12) deep.forEach(function (d) { var v = A.applyMat(f.M, d.v), a = Math.asin(v[2]) * R2D; if (a > 25 && d.mag < 4.6) { d.alt = a; d.az = A.rev(Math.atan2(v[0], v[1]) * R2D); items.push(d); } });
    f.sats.forEach(function (s) { if (/ISS/.test(s.name) && s.alt > 10) items.unshift(s); });
    var ul = $('upList'); ul.innerHTML = '';
    if (!items.length) ul.innerHTML = '<li>Nothing bright is up right now' + (f.sun.alt > -6 ? ': the sky is too bright. Try a later time.' : '.') + '</li>';
    items.slice(0, 14).forEach(function (o) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      var what = o.kind === 'planet' ? 'planet' : o.kind === 'moon' ? 'Moon' : o.kind === 'deep' ? 'binocular treasure' : o.kind === 'sat' ? 'space station, moving!' : 'bright star';
      b.innerHTML = '<span>' + esc(o.name) + ' <span class="dir">' + what + '</span></span><span class="dir">' + esc(describeDir(o.alt, o.az)) + '</span>';
      b.onclick = function () { state.az0 = o.az; state.alt0 = Math.min(85, Math.max(5, o.alt)); state.fov = Math.min(state.fov, 90); showCard(o); $('dome').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); };
      li.appendChild(b); ul.appendChild(li);
    });
    updateLight(); updatePolaris();
  }
  function updateLight() {
    var f = frame, rows = [];
    f.bodies.forEach(function (b) {
      var s = A.lightSeconds(b.distanceKm);
      rows.push([b.name, Math.round(b.distanceKm).toLocaleString('en-US') + ' km', lightText(s), b.kind === 'moon' ? 'just over a second ago' : lightText(s) + ' ago']);
    });
    [2491, 7001, 424, 2061, 7924].forEach(function (hr) { var n = OBJ.NAMED[hr]; rows.push([n[0], lyText(n[1]), Math.round(n[1]).toLocaleString('en-US') + ' years', leftWhen(n[1])]); });
    rows.push(['Andromeda Galaxy', lyText(2500000), '2.5 million years', leftWhen(2500000)]);
    $('lightTable').querySelector('tbody').innerHTML = rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td></tr>'; }).join('');
  }
  function updatePolaris() {
    var p = stars.filter(function (s) { return s.hr === 424; })[0], v = A.applyMat(frame.M, p.v), a = Math.asin(v[2]) * R2D;
    $('polarisNow').textContent = 'Right now, at latitude ' + state.lat.toFixed(1) + '°, Polaris is ' + (a > 0 ? a.toFixed(1) + '° above the horizon.' : 'below the horizon (' + a.toFixed(1) + '°).');
  }

  /* ---------- Satellites panel ---------- */
  var passTimer = null;
  function updateTLENote() {
    var ages = sats.list.filter(function (s) { return s.group === 'iss'; }).map(function (s) { return s.epoch; });
    var label = sats.source === 'snapshot' ? 'Orbits as of ' + new Date(SNAP.fetched + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) + ' (bundled snapshot from CelesTrak)' : 'Orbits refreshed from CelesTrak on ' + sats.fetchedLabel;
    var age = ages.length ? (state.t - ages[0].getTime()) / 86400000 : 0;
    $('tleNote').textContent = label + '. Accuracy fades after about 1–2 weeks: predictions drift by minutes and satellites change orbit on purpose.' + (age > 14 ? ' For the time you picked these orbits are ' + Math.round(age) + ' days old, so treat passes as rough guesses and refresh if you are online.' : '') + (age < -3 ? ' The time you picked is before these orbits were measured; predictions get worse the further back you go.' : '');
  }
  function schedulePasses() { clearTimeout(passTimer); passTimer = setTimeout(computePasses, 250); }
  function computePasses() {
    var group = $('satGroup').value, onlyVis = $('visibleOnly').checked, list = sats.list.filter(function (s) { return s.group === group; });
    var ul = $('passList'); ul.innerHTML = '';
    if (!list.length) {
      $('passIntro').textContent = group === 'dragon' ? 'No SpaceX Dragon was flying on its own in the bundled orbit list (one may be docked to the space station, travelling with it). After a Dragon launch, press "Refresh orbits" while online.' : 'No orbits loaded for this group.';
      return;
    }
    if (group === 'starlink-recent') $('passIntro').textContent = 'Launch ' + SNAP.recentLaunch + ': ' + list.length + ' satellites. Days after launch they fly close together, so passes come one after another.';
    else if (group === 'starlink-sample') $('passIntro').textContent = list.length + ' of the ' + (SNAP.starlinkTotal || 'thousands of') + ' Starlink satellites. Older Starlinks orbit higher and are faint (often magnitude 5 to 7), so many passes are hard to see.';
    else if (group === 'starlink-all') $('passIntro').textContent = 'The whole fleet (' + list.length + ' satellites) is drawn on the dome; passes are listed for the first 60 only, to keep this page quick.';
    else $('passIntro').textContent = '';
    var start = new Date(state.t), passes = [];
    list.slice(0, 60).forEach(function (s) { passes = passes.concat(SP.findPasses(s, state.lat, state.lon, start, 48, 10, 30).map(function (p) { p.sat = s; return p; })); });
    passes.sort(function (a, b) { return a.rise - b.rise; });
    if (onlyVis) passes = passes.filter(function (p) { return p.visible; });
    if (!passes.length) { ul.innerHTML = '<li>No ' + (onlyVis ? 'visible ' : '') + 'passes above 10° in the next two days.' + (onlyVis ? ' Try unticking "only passes you can see".' : '') + '</li>'; return; }
    passes.slice(0, 20).forEach(function (p) {
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      var vf = p.visible && timeText(p.visibleFrom.getTime()), vt = p.visible && timeText(p.visibleTo.getTime());
      var vis = p.visible ? '<span class="vis">' + (vf === vt ? 'visible briefly at ' + vf : 'visible ' + vf + '–' + vt) + '</span>' : (p.sunAltAtPeak > -6 ? 'sky too bright' : 'in Earth\u2019s shadow');
      b.innerHTML = '<span>' + esc(p.name) + ' · ' + timeText(p.rise.getTime(), true) + '</span><span class="dir">rises ' + A.compass(p.riseAz) + ', highest ' + Math.round(p.maxAlt) + '° ' + A.compass(p.peakAz) + ' at ' + timeText(p.peak.getTime()) + ', sets ' + A.compass(p.setAz) + ' ' + timeText(p.set.getTime()) + ' · ' + vis + ' · Show</span>';
      b.setAttribute('aria-label', p.name + ' pass: rises ' + timeText(p.rise.getTime(), true) + ' in the ' + A.compass(p.riseAz) + ', highest ' + Math.round(p.maxAlt) + ' degrees in the ' + A.compass(p.peakAz) + ', sets ' + timeText(p.set.getTime()) + '. ' + (p.visible ? 'Visible.' : 'Not visible to the eye.') + ' Press to show on the sky dome.');
      b.onclick = function () {
        state.layers.sats = $('lySats').checked = true; setTime(p.peak.getTime());
        state.az0 = p.peakAz; state.alt0 = Math.min(80, p.maxAlt); state.fov = 120;
        state.selected = 'sat:' + p.name; $('dome').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        setTimeout(function () { var l = locate('sat:' + p.name); if (l) showCard(l); }, 60);
      };
      li.appendChild(b); ul.appendChild(li);
    });
    updateTLENote();
  }
  function refreshTLE() {
    var btn = $('refreshTLE'), whole = $('wholeFleet').checked, st = $('tleStatus');
    btn.disabled = true; st.textContent = 'Asking CelesTrak for current orbits…';
    var base = 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP=';
    var get = function (g) { return fetch(base + g, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }); };
    Promise.all([get('stations'), get('starlink')]).then(function (res) {
      var rows = [], stations = SP.parseTLEText(res[0], 'station'), starl = SP.parseTLEText(res[1], 'starlink-all');
      stations.forEach(function (r) { if (r[0] === 'ISS (ZARYA)') { r[3] = 'iss'; rows.push(r); } else if (/DRAGON/i.test(r[0])) { r[3] = 'dragon'; rows.push(r); } });
      if (!starl.length || !rows.length) throw new Error('unexpected reply');
      // Newest launch = highest international designator year + launch number
      var newest = starl.reduce(function (m, r) { var d = r[1].substr(9, 5); return d > m ? d : m; }, '');
      starl.forEach(function (r, i) {
        var g = r[1].substr(9, 5) === newest ? 'starlink-recent' : (i % 220 === 0 ? 'starlink-sample' : 'starlink-all');
        if (g !== 'starlink-all' || whole) rows.push([r[0], r[1], r[2], g]);
      });
      loadSats(rows); sats.source = 'live'; sats.fetchedLabel = new Date().toLocaleString('en-US');
      SNAP.recentLaunch = '20' + newest.substr(0, 2) + '-' + newest.substr(2); SNAP.starlinkTotal = starl.length;
      var opt = $('satGroup').querySelector('option[value="starlink-all"]');
      if (whole && !opt) { opt = document.createElement('option'); opt.value = 'starlink-all'; opt.textContent = 'The whole Starlink fleet'; $('satGroup').appendChild(opt); }
      st.textContent = 'Updated: ' + rows.length + ' satellites loaded (' + starl.length + ' Starlinks listed, newest launch ' + SNAP.recentLaunch + '; ' + rows.filter(function (r) { return r[3] === 'dragon'; }).length + ' Dragon).';
      updateTLENote(); invalidate(true); schedulePasses();
    }).catch(function (e) { st.textContent = 'Could not refresh (' + e.message + '). You may be offline; the bundled orbits are still in use.'; })
      .then(function () { btn.disabled = false; });
  }

  /* ---------- Moon lab ---------- */
  function drawMoonLab(age) {
    var c = $('moonDiagram'), g = c.getContext('2d'), w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,215,106,.18)'; for (var y = 20; y < h; y += 28) { g.fillRect(0, y, 60, 2); }
    g.fillStyle = '#ffd76a'; g.font = '13px system-ui'; g.fillText('Sunlight →', 8, 14);
    var ex = w * 0.45, ey = h / 2, orbit = 105;
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.setLineDash([4, 5]); g.beginPath(); g.arc(ex, ey, orbit, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#3d7cc9'; g.beginPath(); g.arc(ex, ey, 18, 0, 7); g.fill(); g.fillStyle = '#0d1630'; g.beginPath(); g.arc(ex, ey, 18, -Math.PI / 2, Math.PI / 2); g.fill();
    g.fillStyle = '#e3e8f2'; g.fillText('Earth', ex - 16, ey + 34);
    var th = Math.PI + age / 29.530589 * 2 * Math.PI, mx = ex + orbit * Math.cos(th), my = ey - orbit * Math.sin(th);
    g.fillStyle = '#2a2d36'; g.beginPath(); g.arc(mx, my, 11, 0, 7); g.fill();
    g.fillStyle = '#f1efe4'; g.beginPath(); g.arc(mx, my, 11, Math.PI / 2, 3 * Math.PI / 2); g.fill();
    g.fillStyle = '#e3e8f2'; g.fillText('Moon', mx - 15, my - 16);
    g.font = '12px system-ui'; g.fillStyle = '#9fb0cf'; g.fillText('View from far above the North Pole (not to scale)', 8, h - 8);
    var k = (1 - Math.cos(age / 29.530589 * 2 * Math.PI)) / 2, ix = w - 60, iy = 62;
    g.strokeStyle = '#4a5b82'; g.strokeRect(ix - 52, iy - 52, 104, 120); g.fillStyle = '#9fb0cf'; g.fillText('From Earth', ix - 30, iy + 62);
    drawMoon(g, ix, iy, 40, k, age < 14.765 ? 0 : Math.PI, 1);
    var name = ['New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'][Math.round(age / 29.530589 * 8) % 8];
    $('moonDiagramText').textContent = name + ': ' + Math.round(k * 100) + '% of the face we see is lit. Day ' + age.toFixed(1) + ' of 29.5. (Inset drawn as seen from the northern hemisphere.)';
    $('moonAgeOut').textContent = 'Day ' + age.toFixed(1);
  }

  /* ---------- Radio demos ---------- */
  function siText(x, unit) {
    var p = [[1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
    for (var i = 0; i < p.length; i++) if (x >= p[i][0] * 0.9999) { var t = (x / p[i][0]).toPrecision(3); if (t.indexOf('.') >= 0 && t.indexOf('e') < 0) t = t.replace(/\.?0+$/, ''); return t + ' ' + p[i][1] + unit; }
    return x.toExponential(2) + ' ' + unit;
  }
  function updateSpectrum() {
    var lam = Math.pow(10, Number($('lambda').value)), b = R.band(lam);
    $('lambdaOut').innerHTML = '<strong>' + esc(siText(lam, 'm')) + '</strong> · ' + esc(siText(R.frequencyHz(lam), 'Hz')) + ' · photon energy ' + esc(siText(R.photonEnergyEV(lam), 'eV')) + '<br><strong>' + esc(b.name) + ':</strong> ' + esc(b.example) + '. Reaches the ground? ' + esc(b.ground) + '.' + (Math.abs(lam - 0.211) < 0.02 ? ' <strong>This is the 21 cm hydrogen line!</strong>' : '');
  }
  function updateHI() {
    var l = Number($('glon').value), model = document.querySelector('input[name=rot]:checked').value, spec = R.hydrogenSpectrum(l, model);
    $('glonOut').textContent = 'l = ' + l + '°';
    var c = $('hiChart'), g = c.getContext('2d'), w = c.width, h = c.height, x0 = 40, y0 = h - 34;
    g.clearRect(0, 0, w, h); g.strokeStyle = '#4a5b82'; g.beginPath(); g.moveTo(x0, 10); g.lineTo(x0, y0); g.lineTo(w - 10, y0); g.stroke();
    g.fillStyle = '#9fb0cf'; g.font = '11px system-ui';
    [-150, -100, -50, 0, 50, 100, 150].forEach(function (v) { var x = x0 + (v + 150) / 300 * (w - x0 - 10); g.fillText(v, x - 10, y0 + 14); g.fillText(R.dopplerMHz(v).toFixed(2), x - 16, y0 + 27); });
    g.fillText('km/s', w - 36, y0 - 4); g.fillText('MHz', 4, y0 + 27); g.fillText('signal', 2, 18);
    g.strokeStyle = '#ffd27a'; g.lineWidth = 2; g.beginPath();
    spec.forEach(function (b, i) { var x = x0 + (b.v + 150) / 300 * (w - x0 - 10), y = y0 - b.power * (y0 - 16); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); g.lineWidth = 1;
    var tv = model === 'flat' ? R.tangentVelocity(l) : null;
    $('hiText').textContent = 'Simulated hydrogen signal looking along galactic longitude ' + l + '°. Peaks to the right (positive) come from gas moving away from us, heard slightly below 1420.406 MHz. ' + (tv ? 'The fastest gas, at the "tangent point", moves about ' + Math.round(tv) + ' km/s; astronomers use exactly that edge to measure how fast the galaxy spins.' : 'With all the mass in the middle, gas far out would move slowly; real galaxies do not look like this.');
  }
  function updateRes() {
    var lam = Number($('resLambda').value), D = Math.pow(10, Number($('dish').value)), res = R.resolutionArcsec(lam, D);
    $('dishOut').textContent = D < 1 ? (D * 100).toFixed(1) + ' cm' : D < 1000 ? D.toPrecision(3) + ' m' : (D / 1000).toPrecision(3) + ' km';
    var cmp = res > 1800 ? 'blurrier than the width of the full Moon (1,800″): ' + (res / 3600).toFixed(1) + '°' : res > 60 ? 'blurrier than your eye (about 60″), but sharper than the Moon\u2019s width' : res > 1 ? 'sharper than your eye' : 'sharp enough to see details far smaller than a planet';
    var eye = R.diameterFor(lam, 60);
    $('resText').textContent = 'Smallest detail: about ' + (res >= 100 ? Math.round(res).toLocaleString('en-US') : res.toPrecision(2)) + ' arcseconds, ' + cmp + '. To be as sharp as a human eye at this wavelength you need a dish about ' + (eye < 1 ? (eye * 1000).toFixed(0) + ' mm' : eye < 1000 ? Math.round(eye) + ' m' : (eye / 1000).toFixed(1) + ' km') + ' wide.' + (Math.abs(lam - 0.21) < 0.01 && D > 0.6 && D < 1 ? ' (A 0.8 m dish like the family plan\u2019s: its beam is about 15° wide; the stricter Rayleigh limit shown here is about 18°.)' : '');
  }
  function updateFringe() {
    var B = Number($('baseline').value), lam = 0.21, c = $('fringeChart'), g = c.getContext('2d'), w = c.width, h = c.height;
    $('baselineOut').textContent = B + ' m (fringes ' + R.fringeSpacingDeg(B, lam).toFixed(2) + '° apart)';
    g.clearRect(0, 0, w, h); g.strokeStyle = '#7fd1ff'; g.lineWidth = 2; g.beginPath();
    for (var i = 0; i <= w - 20; i++) { var th = -10 + 20 * i / (w - 20), y = h - 26 - R.fringe(th, B, lam) * (h - 40); if (i) g.lineTo(i + 10, y); else g.moveTo(i + 10, y); }
    g.stroke(); g.lineWidth = 1; g.fillStyle = '#9fb0cf'; g.font = '11px system-ui';
    [-10, -5, 0, 5, 10].forEach(function (t) { g.fillText(t + '°', 10 + (t + 10) / 20 * (w - 20) - 8, h - 8); });
  }
  var audio = null, pulseTimer = null;
  function playPulsar(p) {
    stopPulsar();
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { $('pulsarText').textContent = 'Your browser cannot make sound here.'; return; }
    audio = new AC(); var gain = audio.createGain(); gain.gain.value = 0.25; gain.connect(audio.destination);
    var buf = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.004), audio.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length / 5));
    var next = audio.currentTime + 0.05, period = p.period;
    function schedule() {
      while (next < audio.currentTime + 0.3) { var s = audio.createBufferSource(); s.buffer = buf; s.connect(gain); s.start(next); next += period; }
    }
    schedule(); pulseTimer = setInterval(schedule, 100);
    $('pulsarText').textContent = 'Playing (simulated): ' + p.name + ', one click every ' + (period * 1000).toFixed(period < 0.01 ? 2 : 1) + ' ms = ' + (1 / period).toFixed(1) + ' per second. ' + p.note;
  }
  function stopPulsar() { clearInterval(pulseTimer); if (audio) { audio.close(); audio = null; } }

  /* ---------- Input ---------- */
  var pointers = new Map(), dragStart = null, pinchStart = null, moved = false;
  canvas.addEventListener('pointerdown', function (e) {
    canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    moved = false; canvas.classList.add('dragging');
    if (pointers.size === 1) dragStart = { x: e.offsetX, y: e.offsetY, az: state.az0, alt: state.alt0 };
    if (pointers.size === 2) { var p = Array.from(pointers.values()); pinchStart = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), fov: state.fov }; }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) { hover(e.offsetX, e.offsetY); return; }
    pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (pointers.size === 2 && pinchStart) { var p = Array.from(pointers.values()), d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); setFov(pinchStart.fov * pinchStart.d / Math.max(d, 10)); moved = true; return; }
    if (dragStart) {
      var dx = e.offsetX - dragStart.x, dy = e.offsetY - dragStart.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      var degPx = state.fov / Math.min(W, Hh * 1.4);
      state.az0 = A.rev(dragStart.az - dx * degPx); state.alt0 = Math.max(-20, Math.min(90, dragStart.alt + dy * degPx)); invalidate();
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId); canvas.classList.remove('dragging');
    if (!moved && pointers.size === 0) showCard(pickAt(e.offsetX, e.offsetY));
    if (pointers.size < 2) pinchStart = null; if (pointers.size === 0) dragStart = null;
  }
  canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', function (e) { pointers.delete(e.pointerId); dragStart = null; pinchStart = null; });
  canvas.addEventListener('pointerleave', function () { $('tip').hidden = true; });
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); setFov(state.fov * Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  function setFov(f) { state.fov = Math.max(10, Math.min(200, f)); invalidate(); }
  function hover(x, y) {
    var o = pickAt(x, y), tip = $('tip');
    if (!o) { tip.hidden = true; canvas.title = ''; return; }
    tip.textContent = o.name || (o.bayer ? o.bayer + ' ' + o.con : 'HR ' + o.hr); tip.style.left = (x + 12) + 'px'; tip.style.top = (y + 10) + 'px'; tip.hidden = false;
  }
  canvas.addEventListener('keydown', function (e) {
    var step = state.fov / 15, k = e.key, used = true;
    if (k === 'ArrowLeft') state.az0 = A.rev(state.az0 - step);
    else if (k === 'ArrowRight') state.az0 = A.rev(state.az0 + step);
    else if (k === 'ArrowUp') state.alt0 = Math.min(90, state.alt0 + step);
    else if (k === 'ArrowDown') state.alt0 = Math.max(-20, state.alt0 - step);
    else if (k === '+' || k === '=') setFov(state.fov / 1.2);
    else if (k === '-' || k === '_') setFov(state.fov * 1.2);
    else if (k === '[') setTime(state.t - 600000);
    else if (k === ']') setTime(state.t + 600000);
    else if (k === 'Escape') showCard(null);
    else used = false;
    if (used) { e.preventDefault(); invalidate(); }
  });

  /* ---------- Controls ---------- */
  function setPlace(p, face) {
    state.place = p; state.lat = p.lat; state.lon = p.lon; state.tz = p.tz;
    $('lat').value = p.lat; $('lon').value = p.lon;
    if (p.id !== 'custom') $('place').value = p.id;
    $('placeNote').textContent = p.id === 'custom' ? 'Typed-in place: times are shown in your device\u2019s time zone (' + deviceTZ + '). Nothing is sent anywhere.' : 'North latitudes and east longitudes are positive. Times are shown in ' + p.tz.replace(/_/g, ' ') + ' time. Your location is never sent anywhere.';
    syncNight(); nightCache.key = ''; invalidate(true); updateTLENote(); schedulePasses();
    if (face) faceDir(face);
  }
  function faceDir(d) {
    if (d === 'up') { state.alt0 = 90; state.fov = 150; }
    else if (d === 'all') { state.alt0 = 90; state.fov = 185; }
    else if (d === 'pole') { state.az0 = state.lat >= 0 ? 0 : 180; state.alt0 = Math.max(15, Math.min(60, Math.abs(state.lat))); state.fov = 110; }
    else { state.az0 = Number(d); state.alt0 = 30; if (state.fov > 140) state.fov = 110; }
    invalidate();
  }
  function setLayer(id, on) { var el = $(id); el.checked = on; el.dispatchEvent(new Event('change')); }

  function init() {
    var sel = $('place');
    OBJ.PLACES.forEach(function (p) { var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; sel.appendChild(o); });
    var co = document.createElement('option'); co.value = 'custom'; co.textContent = 'Typed-in coordinates'; sel.appendChild(co);
    sel.onchange = function () { if (sel.value === 'custom') { $('lat').focus(); return; } setPlace(OBJ.PLACES.filter(function (p) { return p.id === sel.value; })[0]); };
    $('applyLL').onclick = function () {
      var la = Number($('lat').value), lo = Number($('lon').value);
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180 || $('lat').value === '' || $('lon').value === '') { $('placeNote').textContent = 'Please type a latitude from -90 to 90 and a longitude from -180 to 180.'; return; }
      $('place').value = 'custom'; setPlace({ id: 'custom', name: la.toFixed(2) + '°, ' + lo.toFixed(2) + '°', lat: la, lon: lo, tz: deviceTZ });
    };
    $('geo').onclick = function () {
      if (!navigator.geolocation) { $('placeNote').textContent = 'This browser cannot share a location. Type your latitude and longitude instead.'; return; }
      $('placeNote').textContent = 'Asking your browser… (it may ask your permission first)';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var la = Math.round(pos.coords.latitude * 100) / 100, lo = Math.round(pos.coords.longitude * 100) / 100;
        $('lat').value = la; $('lon').value = lo; $('place').value = 'custom';
        setPlace({ id: 'custom', name: 'Your location', lat: la, lon: lo, tz: deviceTZ });
      }, function () { $('placeNote').textContent = 'No location was shared (pages opened from a file often cannot ask). Type your latitude and longitude instead.'; }, { maximumAge: 600000, timeout: 15000 });
    };
    $('night').onchange = function () {
      var v = $('night').value.split('-').map(Number); if (v.length !== 3 || !v[0]) return;
      var base = wallToMs(v[0], v[1], v[2], 12, 0, state.tz); state.t = base + Number($('clock').value) * 60000; syncNight(); invalidate(true); schedulePasses();
    };
    $('clock').oninput = function () { state.t = state.nightBase + Number($('clock').value) * 60000; invalidate(true); };
    $('clock').onchange = schedulePasses;
    $('now').onclick = function () { setTime(Date.now()); schedulePasses(); };
    document.querySelectorAll('[data-step]').forEach(function (b) { b.onclick = function () { setTime(state.t + Number(b.dataset.step) * 60000); schedulePasses(); }; });
    $('play').onclick = function () { state.playing = !state.playing; $('play').setAttribute('aria-pressed', state.playing); $('play').textContent = state.playing ? '❚❚ Pause' : '▶ Time-lapse'; if (!state.playing) schedulePasses(); };
    $('speed').onchange = function () { $('speedNote').textContent = $('speed').value === 'day' ? 'Each step jumps one day at the same clock time: watch the Moon and planets move against the stars.' : ''; };
    document.querySelectorAll('[data-face]').forEach(function (b) { b.onclick = function () { faceDir(b.dataset.face); }; });
    $('zoomIn').onclick = function () { setFov(state.fov / 1.3); }; $('zoomOut').onclick = function () { setFov(state.fov * 1.3); };
    var layerIds = { lyLines: 'lines', lyCons: 'cons', lyNames: 'names', lyDeep: 'deep', lyGrid: 'grid', lyEq: 'eq', lyEcl: 'ecl', lyTrails: 'trails', lyGround: 'ground', lyDay: 'day', lyRed: 'red', lySats: 'sats', lyRadio: 'radio' };
    Object.keys(layerIds).forEach(function (id) {
      var el = $(id); state.layers[layerIds[id]] = el.checked;
      el.onchange = function () { state.layers[layerIds[id]] = el.checked; if (id === 'lyRed') document.body.classList.toggle('redmode', el.checked); invalidate(true); };
    });
    $('maglim').oninput = function () { state.magLimit = Number($('maglim').value); $('magOut').textContent = 'magnitude ' + state.magLimit.toFixed(1); invalidate(); };
    $('magOut').textContent = 'magnitude 4.5';
    // Explainer shortcuts
    $('tryTrails').onclick = function () { setLayer('lyTrails', true); faceDir('pole'); $('dome').scrollIntoView(); };
    $('tryEast').onclick = function () { faceDir(90); $('dome').scrollIntoView(); };
    $('tryQuito').onclick = function () { setPlace(OBJ.PLACES.filter(function (p) { return p.id === 'quito'; })[0], 'pole'); setLayer('lyTrails', true); $('dome').scrollIntoView(); };
    $('tryEcl').onclick = function () { setLayer('lyEcl', true); faceDir('all'); $('dome').scrollIntoView(); };
    $('tryDays').onclick = function () { setLayer('lyEcl', true); $('speed').value = 'day'; $('speed').onchange(); if (!state.playing) $('play').onclick(); $('dome').scrollIntoView(); };
    $('tryRadio').onclick = function () { setLayer('lyRadio', !state.layers.radio); $('tryRadio').setAttribute('aria-pressed', state.layers.radio); if (state.layers.radio) { faceDir('all'); $('dome').scrollIntoView(); } };
    var lb = $('latButtons');
    ['quito', 'tromso', 'sydney', 'northpole', 'columbus'].forEach(function (id) {
      var p = OBJ.PLACES.filter(function (q) { return q.id === id; })[0], b = document.createElement('button');
      b.type = 'button'; b.textContent = p.name.replace(/ \(.*\)/, '') + ' (' + Math.abs(p.lat).toFixed(0) + '°' + (p.lat >= 0 ? 'N' : 'S') + ')';
      b.onclick = function () { setPlace(p, 'pole'); $('dome').scrollIntoView(); }; lb.appendChild(b);
    });
    // Moon lab
    $('moonAge').oninput = function () { drawMoonLab(Number($('moonAge').value)); };
    $('moonTonight').onclick = function () { var a = frame.moon.phase.age; $('moonAge').value = a.toFixed(1); drawMoonLab(a); };
    // Satellites
    $('satGroup').onchange = function () { invalidate(true); schedulePasses(); };
    $('visibleOnly').onchange = schedulePasses;
    $('refreshTLE').onclick = refreshTLE;
    // Radio
    $('lambda').oninput = updateSpectrum; $('glon').oninput = updateHI;
    document.querySelectorAll('input[name=rot]').forEach(function (r) { r.onchange = updateHI; });
    $('resLambda').onchange = updateRes; $('dish').oninput = updateRes; $('baseline').oninput = updateFringe;
    var pb = $('pulsarButtons');
    R.PULSARS.forEach(function (p) { var b = document.createElement('button'); b.type = 'button'; b.textContent = '▶ ' + p.name; b.onclick = function () { playPulsar(p); }; pb.appendChild(b); });
    $('pulsarStop').onclick = function () { stopPulsar(); $('pulsarText').textContent = 'Stopped.'; };

    window.addEventListener('resize', resize);
    var start = Date.now(), q = new URLSearchParams(location.search);
    if (q.get('t') && isFinite(Date.parse(q.get('t')))) start = Date.parse(q.get('t')); // e.g. ?t=2026-11-15T03:00:00Z
    state.t = start; setPlace(OBJ.PLACES[0]);
    if (q.get('layers')) q.get('layers').split(',').forEach(function (l) { var id = 'ly' + l.charAt(0).toUpperCase() + l.slice(1); if ($(id)) setLayer(id, true); });
    if (q.get('face')) faceDir(q.get('face'));
    $('moonAge').value = 7; resize(); computeFrame(); drawMoonLab(frame.moon.phase.age); $('moonAge').value = frame.moon.phase.age.toFixed(1);
    updateSpectrum(); updateHI(); updateRes(); updateFringe(); updateTLENote(); schedulePasses();
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
