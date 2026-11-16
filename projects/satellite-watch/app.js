// Satellite Watch: live satellite positions on a Leaflet world map, a
// family picker, details and ground track for the one you pick, and the
// next passes over your spot. Rules live in satwatch.js; pass prediction in
// satpass.js (shared with Tonight's Sky). Your location stays in this tab.
'use strict';
const W = window.SatWatch, P = window.SatPass, SNAP = window.SAT_WATCH_SNAPSHOT;
const $ = id => document.getElementById(id);
const statusEl = $('sat-status'), detailEl = $('sat-detail'), passEl = $('sat-passes'), whereEl = $('where-status');
const say = m => { statusEl.textContent = m; };
const BIG_CAP = 3000;                       // dots drawn at once for giant families unless "show all"

// ---- fetch with a deadline ------------------------------------------
async function fetchText(url, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal, credentials: 'omit' }); const text = await r.text(); return { status: r.status, text }; }
  finally { clearTimeout(t); }
}
async function fetchJson(url, ms) { const r = await fetchText(url, ms); if (r.status !== 200) throw new Error('HTTP ' + r.status); return JSON.parse(r.text); }

// ---- the map ----------------------------------------------------------
let map = null, dots = null, trackLayer = null, selMarker = null, homeMarker = null;
// One canvas for all the dots, so ten thousand satellites draw quickly.
const DotLayer = typeof L !== 'undefined' ? L.Layer.extend({
  onAdd(m) {
    this._m = m; this.pts = this.pts || [];
    this._c = L.DomUtil.create('canvas', 'sat-canvas leaflet-zoom-hide');
    m.getPanes().overlayPane.appendChild(this._c);
    m.on('moveend zoomend resize viewreset move', this._reset, this); this._reset();
  },
  onRemove(m) { L.DomUtil.remove(this._c); m.off('moveend zoomend resize viewreset move', this._reset, this); },
  setPoints(pts, colour) { this.pts = pts; this.colour = colour || '#ffd166'; this._draw(); },
  _reset() {
    const m = this._m, size = m.getSize(), dpr = window.devicePixelRatio || 1;
    L.DomUtil.setPosition(this._c, m.containerPointToLayerPoint([0, 0]));
    this._c.width = size.x * dpr; this._c.height = size.y * dpr; this._c.style.width = size.x + 'px'; this._c.style.height = size.y + 'px';
    this._dpr = dpr; this._draw();
  },
  _draw() {
    if (!this._c) return;
    const m = this._m, ctx = this._c.getContext('2d'), dpr = this._dpr, size = m.getSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size.x, size.y);
    const r = this.pts.length > 2000 ? 1.6 : 3; ctx.fillStyle = this.colour; this._screen = [];
    for (let i = 0; i < this.pts.length; i++) {
      const p = this.pts[i];
      for (const off of [-360, 0, 360]) {
        const c = m.latLngToContainerPoint([p.lat, p.lon + off]);
        if (c.x < -5 || c.y < -5 || c.x > size.x + 5 || c.y > size.y + 5) continue;
        ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 6.2832); ctx.fill(); this._screen.push([c.x, c.y, i]);
      }
    }
  },
  nearest(cp, maxPx) {
    let best = null, bd = maxPx * maxPx;
    for (const [x, y, i] of this._screen || []) { const d = (x - cp.x) ** 2 + (y - cp.y) ** 2; if (d < bd) { bd = d; best = i; } }
    return best;
  },
}) : null;

if (typeof L !== 'undefined') {
  map = L.map('sat-map', { worldCopyJump: true, minZoom: 1 }).setView([20, 0], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  dots = new DotLayer().addTo(map);
  trackLayer = L.layerGroup().addTo(map);
} else {
  say('The map library could not load (no internet?). The family list and search still explain each satellite.');
}

// ---- satellites: load, cache, fall back -------------------------------
const loaded = {};          // family id -> { sats, source, at }
let current = null, shown = [], positions = [], selected = null, showAll = false, tick = null, running = 0;

function cacheGet(group) { try { return JSON.parse(localStorage.getItem('satwatch.' + group) || 'null'); } catch { return null; } }
function cacheSet(group, text) { try { localStorage.setItem('satwatch.' + group, JSON.stringify({ at: Date.now(), text })); } catch { /* too big for storage (Starlink can be): fine, it stays in memory */ } }

function toSats(rows, fid) { return rows.map(r => W.makeSat(r, fid)).filter(Boolean); }

// Fresh CelesTrak data if our copy is over two hours old; otherwise the
// copy. If CelesTrak cannot be reached: any saved copy, then the snapshot
// bundled with the room (works offline).
async function loadFamily(f) {
  if (loaded[f.id] && Date.now() - loaded[f.id].at < W.REFETCH_MS) return loaded[f.id];
  const cached = cacheGet(f.group), plan = W.cachePlan(cached, Date.now());
  if (plan === 'use-cache') { const rows = W.parseTLE(cached.text); if (rows.length) return (loaded[f.id] = { sats: toSats(rows, f.id), source: 'saved copy from CelesTrak', at: cached.at }); }
  try {
    const t0 = performance.now();
    const r = await fetchText(W.groupUrl(f.group), f.big ? 20000 : 10000);
    const rows = r.status === 200 ? W.parseTLE(r.text) : [];
    if (rows.length) { cacheSet(f.group, r.text); return (loaded[f.id] = { sats: toSats(rows, f.id), source: 'CelesTrak, just now (' + Math.round(performance.now() - t0) + ' ms)', at: Date.now() }); }
    if (r.status === 404 || /No GP data/i.test(r.text)) throw Object.assign(new Error('empty'), { empty: true });
    if (r.status === 403 || r.status === 429) throw Object.assign(new Error('limited'), { limited: true });
    throw new Error('HTTP ' + r.status);
  } catch (e) {
    if (cached && cached.text) { const rows = W.parseTLE(cached.text); if (rows.length) return (loaded[f.id] = { sats: toSats(rows, f.id), source: (e.limited ? 'saved copy (CelesTrak asked for a pause)' : 'saved copy (CelesTrak could not be reached)'), at: cached.at }); }
    const s = SNAP && SNAP.families[f.id];
    if (s && s.tle.length) return (loaded[f.id] = { sats: toSats(s.tle, f.id), source: (e.empty ? 'CelesTrak lists none right now, so this is ' : e.limited ? 'CelesTrak asked for a pause (it limits repeat downloads, about one per family every two hours), so this is ' : 'offline: ') + 'the snapshot bundled with this room (' + SNAP.fetched + (s.kept < s.total ? ', a sample of ' + s.kept + ' of ' + s.total.toLocaleString('en-US') : '') + (s.note ? '; ' + s.note : '') + ')', at: Date.parse(SNAP.fetched), snapshot: true });
    throw e;
  }
}

// Positions for many satellites, a slice at a time so the page stays smooth.
function propagateAll(list, date) {
  return new Promise(resolve => {
    const out = new Array(list.length); let i = 0;
    const step = () => {
      const end = Math.min(list.length, i + 1500);
      for (; i < end; i++) out[i] = W.subpoint(list[i], date);
      if (i < list.length) setTimeout(step, 0); else resolve(out);
    };
    step();
  });
}

async function refresh() {
  if (!current) return;
  const myRun = running, now = new Date();
  positions = await propagateAll(shown, now);
  if (myRun !== running) return;
  const pts = []; const idx = [];
  positions.forEach((p, i) => { if (p) { pts.push(p); idx.push(i); } });
  if (dots) { dots.setPoints(pts, '#ffd166'); }
  // map click indices refer to `shown`; keep them aligned with drawn points
  shownDrawn = idx;
  if (selected) updateSelected(now);
}
let shownDrawn = [];
if (map) map.on('click', e => { const k = dots.nearest(e.containerPoint, 10); if (k != null) { const s = shown[shownDrawn[k]]; if (s) select(s); } });

function schedule() {
  clearTimeout(tick);
  if (!current || document.visibilityState !== 'visible') return;
  tick = setTimeout(async () => { await refresh(); schedule(); }, shown.length > 1500 ? 8000 : 2000);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { refresh(); schedule(); } else clearTimeout(tick); });

async function showFamily(f, btn) {
  document.querySelectorAll('.fam-btn').forEach(b => b.classList.toggle('active', b === btn));
  running++; const myRun = running; current = f; selected = null; clearSelection();
  say('Loading ' + f.label.toLowerCase() + '…');
  try {
    const got = await loadFamily(f);
    if (myRun !== running) return;
    const all = got.sats;
    shown = f.big && !showAll ? W.sampleEvenly(all, BIG_CAP) : all;
    $('show-all').hidden = !(f.big && all.length > BIG_CAP);
    $('show-all').textContent = showAll ? 'Show a lighter sample' : 'Show all ' + all.length.toLocaleString('en-US') + ' (slower)';
    const countEl = document.querySelector('.fam-btn[data-id="' + f.id + '"] .fam-count'); if (countEl) countEl.textContent = all.length.toLocaleString('en-US');
    await refresh(); if (myRun !== running) return;
    say(f.emoji + ' ' + all.length.toLocaleString('en-US') + ' ' + f.label + (shown.length < all.length ? ' (showing ' + shown.length.toLocaleString('en-US') + ' evenly spread; the button below shows all)' : '') + '. Data: ' + got.source + '. Tap a dot for details' + (f.id === 'stations' ? ' — the ISS is selected for you.' : '.'));
    if (f.id === 'stations') { const iss = all.find(s => s.norad === '25544'); if (iss) select(iss); }
    schedule();
  } catch (e) {
    if (myRun !== running) return;
    say(e.empty ? 'CelesTrak lists no ' + f.label.toLowerCase() + ' right now. Try another family.' : 'Could not load ' + f.label.toLowerCase() + ' — the orbit service did not answer and there is no saved copy. Check the connection and try again.');
  }
}

// ---- one satellite ------------------------------------------------------
function clearSelection() { if (trackLayer) trackLayer.clearLayers(); if (selMarker) { selMarker.remove(); selMarker = null; } detailEl.hidden = true; passEl.hidden = true; }
function select(sat) {
  selected = sat; clearSelection();
  const now = new Date();
  if (map) {
    for (const seg of W.groundTrack(sat, now, 45, 95, 30)) L.polyline(seg, { color: '#7fdddb', weight: 2, opacity: 0.85, interactive: false }).addTo(trackLayer);
    const p = W.subpoint(sat, now);
    if (p) { selMarker = L.circleMarker([p.lat, p.lon], { radius: 8, color: '#ff6b6b', weight: 3, fillOpacity: 0.3 }).addTo(map); map.panTo([p.lat, p.lon]); }
  }
  updateSelected(now); showPasses();
}
function row(dl, k, v) { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); }
function updateSelected(now) {
  const sat = selected; if (!sat) return;
  const p = W.subpoint(sat, now), o = W.orbitFacts(sat), f = W.family(sat.family);
  if (selMarker && p) selMarker.setLatLng([p.lat, p.lon]);
  detailEl.innerHTML = ''; detailEl.hidden = false;
  const h = document.createElement('h3'); h.textContent = sat.name; detailEl.appendChild(h);
  const dl = document.createElement('dl'); dl.className = 'facts';
  row(dl, 'NORAD id', sat.norad);
  if (f) row(dl, 'Family', f.emoji + ' ' + f.label);
  if (p) {
    row(dl, 'Over', Math.abs(p.lat).toFixed(1) + '° ' + (p.lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(p.lon).toFixed(1) + '° ' + (p.lon >= 0 ? 'E' : 'W'));
    row(dl, 'Altitude', W.km(p.heightKm));
    row(dl, 'Speed', W.speedWords(p.speedKmS));
  } else row(dl, 'Position', 'cannot be worked out from this orbit data (it may have re-entered)');
  row(dl, 'Period', W.periodWords(o.periodMin));
  row(dl, 'Inclination', o.inclinationDeg.toFixed(1) + '° (how tilted its ring is; 90° passes over the poles)');
  row(dl, 'Orbit data', W.describeAge(W.ageDays(sat, now.getTime())));
  detailEl.appendChild(dl);
  const more = document.createElement('p'); more.className = 'fine';
  more.innerHTML = 'The blue line is where it has been for 45 minutes and where it goes in the next 95. ';
  const a = document.createElement('a'); a.href = 'https://celestrak.org/satcat/table-satcat.php?CATNR=' + encodeURIComponent(sat.norad); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Catalogue entry at CelesTrak ↗';
  more.appendChild(a); detailEl.appendChild(more);
}

// ---- where are you? (stays in this tab) ---------------------------------
let home = null;
function setHome(lat, lon, label) {
  home = { lat, lon, label };
  whereEl.textContent = 'Passes are worked out for ' + label + '. This spot stays in this browser tab; it is never saved or sent anywhere.';
  if (map) { if (homeMarker) homeMarker.remove(); homeMarker = L.circleMarker([lat, lon], { radius: 6, color: '#2b6cb0', fillOpacity: 0.8 }).addTo(map).bindTooltip('You'); }
  showPasses();
}
async function roughGuess() {
  for (const url of ['https://get.geojs.io/v1/ip/geo.json', 'https://ipwho.is/']) {
    try { const d = await fetchJson(url, 5000); const lat = parseFloat(d.latitude), lon = parseFloat(d.longitude); if (isFinite(lat) && isFinite(lon)) return { lat, lon, place: [d.city, d.region].filter(Boolean).join(', ') }; } catch { /* next */ }
  }
  return null;
}
$('find-me').addEventListener('click', () => {
  // Town-level is plenty for satellite passes, so a quick, low-accuracy
  // fix (or one from the last 10 minutes) is all we ask for.
  const fallback = async why => {
    whereEl.textContent = why + ' Trying a rough, town-level guess from your internet connection…';
    const g = await roughGuess();
    if (g) setHome(g.lat, g.lon, 'roughly ' + (g.place || 'your area') + ' (from your internet connection)');
    else whereEl.textContent = 'Could not work out where you are. Type a ZIP code or town instead.';
  };
  if (!navigator.geolocation) { fallback('This device will not say where it is.'); return; }
  whereEl.textContent = 'Asking your device where you are… (answer the permission prompt if one appears)';
  let done = false;
  const guard = setTimeout(() => { if (!done) { done = true; fallback('Your device is taking a while.'); } }, 9000);
  navigator.geolocation.getCurrentPosition(pos => {
    if (done) return; done = true; clearTimeout(guard);
    setHome(pos.coords.latitude, pos.coords.longitude, 'your spot (within about ' + Math.max(1, Math.round(pos.coords.accuracy / 1000)) + ' km)');
  }, err => {
    if (done) return; done = true; clearTimeout(guard);
    if (err && err.code === 1) whereEl.textContent = 'Your device would not share its location — fair enough. Type a ZIP code or town instead.';
    else fallback('Your device could not work out where it is.');
  }, { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 });
});
$('place-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const q = $('place-input').value.trim(); if (!q) return;
  whereEl.textContent = 'Looking up “' + q + '”…';
  try {
    // A plain five-digit number is taken as a US ZIP code.
    const hits = await fetchJson('https://nominatim.openstreetmap.org/search?format=json&limit=1' + (/^\d{5}$/.test(q) ? '&countrycodes=us' : '') + '&q=' + encodeURIComponent(q), 10000);
    if (!hits.length) { whereEl.textContent = 'No place by that name came back. Check the spelling, or try a ZIP code.'; return; }
    setHome(parseFloat(hits[0].lat), parseFloat(hits[0].lon), hits[0].display_name);
  } catch { whereEl.textContent = 'The place search could not get through (or took over 10 seconds). Try again.'; }
});

// ---- passes ---------------------------------------------------------------
function fmtTime(d) { return d.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }); }
function showPasses() {
  if (!selected) return;
  passEl.hidden = false; passEl.innerHTML = '';
  const h = document.createElement('h3'); h.textContent = 'Next passes over you'; passEl.appendChild(h);
  if (!home) { const p = document.createElement('p'); p.textContent = 'Press Find me or type a ZIP code / town above to see when ' + selected.name + ' next goes over.'; passEl.appendChild(p); return; }
  const sat = { name: selected.name, satrec: selected.satrec };
  let passes = [];
  try { passes = P.findPasses(sat, home.lat, home.lon, new Date(), 48, 10, 30).slice(0, 6); } catch { passes = []; }
  if (!passes.length) { const p = document.createElement('p'); p.textContent = selected.name + ' does not climb more than 10° above your horizon in the next 48 hours' + (W.orbitFacts(selected).periodMin > 1300 ? ' — it sits so high it barely moves in your sky; it is either always up or never up from here.' : '.'); passEl.appendChild(p); return; }
  const ol = document.createElement('ol'); ol.className = 'passes';
  for (const p of passes) {
    const li = document.createElement('li');
    const strong = document.createElement('strong'); strong.textContent = fmtTime(p.rise); li.appendChild(strong);
    li.appendChild(document.createTextNode(' — rises in the ' + W.compass(p.riseAz) + ', highest ' + Math.round(p.maxAlt) + '° up in the ' + W.compass(p.peakAz) + ' at ' + p.peak.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ', sets in the ' + W.compass(p.setAz) + ' at ' + p.set.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '. '));
    const v = document.createElement('span'); v.className = p.visible ? 'vis yes' : 'vis no';
    v.textContent = p.visible ? '👀 Visible to the eye (sunlit, your sky dark)' : 'Not visible to the eye (daylight or in Earth\u2019s shadow) — radio only';
    li.appendChild(v); ol.appendChild(li);
  }
  passEl.appendChild(ol);
  const n = document.createElement('p'); n.className = 'fine'; n.textContent = 'Times are in this computer\u2019s time zone. 90° is straight overhead; 10° is just above the trees. Bright passes need a high pass and a dark sky.'; passEl.appendChild(n);
}

// ---- search -----------------------------------------------------------------
$('search-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const q = $('search-input').value.trim(); if (!q) return;
  const qu = q.toUpperCase(), al = W.alias(q);
  for (const id in loaded) {
    const hit = loaded[id].sats.find(s => s.norad === (al || q) || (!al && s.name.toUpperCase().includes(qu)));
    if (hit) { say('Found ' + hit.name + ' in ' + W.family(id).label + '.'); select(hit); return; }
  }
  const url = W.searchUrl(q);
  if (!url) { say('Type at least three letters of a name (like HUBBLE) or a NORAD number (like 25544).'); return; }
  say('Asking CelesTrak for “' + q + '”…');
  try {
    const r = await fetchText(url, 10000);
    const rows = r.status === 200 ? W.parseTLE(r.text) : [];
    if (!rows.length) { say('No satellite matched “' + q + '”. Try part of the name, or the NORAD number.'); return; }
    const sat = W.makeSat(rows[0], ''); if (!sat) throw new Error('bad tle');
    say('Found ' + sat.name + (rows.length > 1 ? ' (and ' + (rows.length - 1) + ' more with that name; showing the first)' : '') + '.');
    select(sat);
  } catch { say('The search could not reach CelesTrak. Families already loaded can still be searched.'); }
});

// ---- family list ------------------------------------------------------------
const list = $('family-list');
for (const f of W.FAMILIES) {
  const li = document.createElement('li');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'fam-btn'; b.dataset.id = f.id;
  const s = SNAP && SNAP.families[f.id];
  b.innerHTML = '<span class="fam-emoji" aria-hidden="true"></span> <span class="fam-label"></span> <span class="fam-count"></span>';
  b.querySelector('.fam-emoji').textContent = f.emoji; b.querySelector('.fam-label').textContent = f.label;
  b.querySelector('.fam-count').textContent = s ? s.total.toLocaleString('en-US') : '';
  b.addEventListener('click', () => showFamily(f, b));
  const p = document.createElement('p'); p.className = 'fam-blurb'; p.textContent = f.blurb;
  li.append(b, p); list.appendChild(li);
}
$('show-all').addEventListener('click', () => { showAll = !showAll; if (current) showFamily(current, document.querySelector('.fam-btn[data-id="' + current.id + '"]')); });
showFamily(W.family('stations'), document.querySelector('.fam-btn[data-id="stations"]'));
