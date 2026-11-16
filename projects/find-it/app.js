// Find It: a live OpenStreetMap (drawn by Leaflet), a find-me button and
// ZIP/town search through Nominatim (same as the Map Room), and category
// search through the Overpass API. The rules live in findit.js.
'use strict';

const HOME = { lat: 41.2849, lon: -84.3583, label: 'Defiance, Ohio' };
const F = window.FindItRules;
let centre = { ...HOME };
let map = null, centreMarker = null, resultLayer = null;

const statusEl = document.getElementById('find-status');
const resultsEl = document.getElementById('results');
const listEl = document.getElementById('result-list');
function say(m) { statusEl.textContent = m; }

if (typeof L !== 'undefined') {
  map = L.map('leaflet-map').setView([HOME.lat, HOME.lon], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  resultLayer = L.layerGroup().addTo(map);
  centreMarker = L.marker([HOME.lat, HOME.lon]).addTo(map).bindPopup(HOME.label + ' — searching from here.');
  say('The map is open on ' + HOME.label + '. Tap a category below and Find It will look around this spot.');
} else {
  say('The map library could not load, so Find It is resting. The Help section below still works.');
}

let accuracyCircle = null;
function setCentre(lat, lon, label, zoom, accuracyM) {
  centre = { lat, lon, label };
  if (!map) return;
  map.setView([lat, lon], zoom || 14);
  if (centreMarker) centreMarker.remove();
  if (accuracyCircle) { accuracyCircle.remove(); accuracyCircle = null; }
  // The blue ring is the honest size of "here": the device (or network
  // guess) is sure you are somewhere inside it.
  if (isFinite(accuracyM) && accuracyM > 0) accuracyCircle = L.circle([lat, lon], { radius: accuracyM, color: '#2b6cb0', weight: 1, fillOpacity: 0.08, interactive: false }).addTo(map);
  centreMarker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
}

// fetch with a deadline, for the small JSON look-ups below.
async function fetchJson(url, opts, ms) {
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), ms);
  try { const res = await fetch(url, { ...(opts || {}), signal: ctl.signal }); if (!res.ok) throw new Error('HTTP ' + res.status); return await res.json(); }
  finally { clearTimeout(timer); }
}

// ---- Find me ------------------------------------------------------
// Pinpointing works in layers, fastest first, and the map moves the
// moment ANY answer arrives, then sharpens:
//  1. This visit's last good fix (sessionStorage, up to 10 min old) — instant.
//  2. A quick, low-accuracy device fix (Wi-Fi / network, or a fix the
//     device already has from the last 5 minutes) — usually 1–2 s on a PC.
//  3. At the same time, watchPosition with high accuracy keeps sharpening
//     the spot until it is within ~100 m or 20 s have passed.
//  4. If the device has said nothing after 6 s, or cannot locate at all,
//     a town-level guess from the internet connection (keyless HTTPS
//     service, 5 s limit) — clearly labelled as rough.
//  5. If the visitor says no to location, we respect that: no automatic
//     guess; the ZIP box (and an opt-in "rough guess" button) remain.
const SAVED_KEY = 'findit.lastFix';
const REFINE_CAP_MS = 20000, NETWORK_AFTER_MS = 6000;
const findMeBtn = document.getElementById('find-me');
const roughBtn = document.getElementById('rough-me');
let best = null, watchId = null, locateRun = 0;

function placeLabel(fix) {
  if (fix.source === 'network') return 'Roughly here' + (fix.place ? ' (' + fix.place + ')' : '') + ', going by your internet connection — it can be a town or two off.';
  if (fix.source === 'saved') return 'Your spot from a few minutes ago (' + F.describeAccuracy(fix.accuracyM) + ').';
  return 'You are here, as close as your device can tell (' + F.describeAccuracy(fix.accuracyM) + ').';
}
function useFix(fix, run) {
  if (run !== locateRun) return;
  const next = F.betterFix(best, fix);
  if (next === best) return;
  const first = !best; best = next;
  setCentre(best.lat, best.lon, placeLabel(best), F.zoomForAccuracy(best.accuracyM), best.accuracyM);
  if (best.source !== 'network') { try { sessionStorage.setItem(SAVED_KEY, JSON.stringify({ lat: best.lat, lon: best.lon, accuracyM: best.accuracyM, source: best.source === 'saved' ? best.savedFrom : best.source, at: best.at || Date.now() })); } catch { /* private mode: fine */ } }
  if (best.source === 'network') say('Rough guess: ' + (best.place || 'your area') + '. Still listening for your device; if the guess is wrong, type your ZIP code. You can tap a category now.');
  else if (F.goodEnough(best)) { say('Found you, ' + F.describeAccuracy(best.accuracyM) + '. Now tap a category and Find It will look around you.'); stopWatch(); }
  else say((first ? 'Found you, ' : 'Sharpening: now ') + F.describeAccuracy(best.accuracyM) + '. You can tap a category now; the spot keeps sharpening for a few seconds.');
}
function stopWatch() { if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; } findMeBtn.disabled = false; }
async function networkGuess(run) {
  for (const url of F.IP_GEO_SERVICES) {
    if (run !== locateRun) return false;
    try { const g = F.parseIpGeo(await fetchJson(url, null, 5000)); if (g) { useFix({ ...g, at: Date.now() }, run); return true; } } catch { /* next service */ }
  }
  return false;
}
function lastResort() {
  say('Could not work out where you are. Type your ZIP code or town in the box below and press Go there — it does the same job.');
  const box = document.getElementById('place-input'); if (box) box.focus();
}

findMeBtn.addEventListener('click', () => {
  const run = ++locateRun; best = null; stopWatch();
  if (roughBtn) roughBtn.hidden = true;
  const saved = F.readSavedFix((() => { try { return sessionStorage.getItem(SAVED_KEY); } catch { return null; } })(), Date.now(), 600000);
  if (saved) useFix(saved, run);
  if (!navigator.geolocation) { networkGuess(run).then(ok => { if (!ok && !best) lastResort(); }); return; }
  findMeBtn.disabled = true;
  if (!saved) say('Asking your device where you are… (if your browser or Windows asks permission, answer the prompt)');
  const fromPos = pos => ({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracyM: pos.coords.accuracy, source: 'device', at: pos.timestamp || Date.now() });
  let denied = false, deviceFailed = false;
  const onErr = err => {
    if (run !== locateRun) return;
    if (err && err.code === 1) {
      if (denied) return; denied = true; stopWatch();
      if (best && best.source === 'saved') return;
      say('Your device would not share its location. That is a fair choice — type a ZIP code or town below instead, or use the rough guess button.');
      if (roughBtn) roughBtn.hidden = false;
      return;
    }
    if (!deviceFailed && !best) { deviceFailed = true; networkGuess(run).then(ok => { if (!ok && !best) lastResort(); }); }
  };
  // 2. quick fix
  navigator.geolocation.getCurrentPosition(p => useFix(fromPos(p), run), onErr, { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 });
  // 3. refine
  try { watchId = navigator.geolocation.watchPosition(p => useFix(fromPos(p), run), err => { if (err && err.code === 1) onErr(err); }, { enableHighAccuracy: true, maximumAge: 0, timeout: REFINE_CAP_MS }); } catch { watchId = null; }
  setTimeout(() => { if (run === locateRun) { stopWatch(); if (best && !F.goodEnough(best) && best.source === 'device') say('Found you, ' + F.describeAccuracy(best.accuracyM) + ' — that is as sharp as this device gets. Tap a category.'); } }, REFINE_CAP_MS);
  // 4. network guess if the device stays silent
  setTimeout(() => { if (run === locateRun && !best && !denied && !deviceFailed) { deviceFailed = true; networkGuess(run).then(ok => { if (!ok && !best) lastResort(); }); } }, NETWORK_AFTER_MS);
});
if (roughBtn) roughBtn.addEventListener('click', () => {
  const run = ++locateRun; best = null; stopWatch(); roughBtn.hidden = true;
  say('Asking for a rough, town-level guess from your internet connection…');
  networkGuess(run).then(ok => { if (!ok) lastResort(); });
});

document.getElementById('place-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const q = document.getElementById('place-input').value.trim();
  if (!q) { say('Type a ZIP code or a town name first, then press Go there.'); return; }
  ++locateRun; stopWatch();   // a typed place wins over any find-me still sharpening
  say('Looking up “' + q + '”…');
  try {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 10000);
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' }, signal: ctl.signal }).finally(() => clearTimeout(timer));
    const hits = await res.json();
    if (!hits.length) { say('No place by that name came back. Check the spelling, or try the ZIP code.'); return; }
    setCentre(parseFloat(hits[0].lat), parseFloat(hits[0].lon), hits[0].display_name, /^\d{5}$/.test(q) ? 13 : 12);
    say('There it is: ' + hits[0].display_name + '. Now tap a category.');
  } catch { say('The search could not get through. Check the connection and try again.'); }
});

// Big category buttons, built from the rules file so the page and the
// tests always agree on the list.
const grid = document.getElementById('category-grid');
for (const group of F.GROUPS) {
  const h = document.createElement('h3'); h.textContent = group; h.className = 'group-title'; grid.appendChild(h);
  const row = document.createElement('div'); row.className = 'cat-row';
  for (const cat of F.CATEGORIES.filter(c => c.group === group)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cat-btn'; b.dataset.id = cat.id;
    b.innerHTML = '<span class="cat-emoji" aria-hidden="true"></span> <span class="cat-label"></span>';
    b.querySelector('.cat-emoji').textContent = cat.emoji;
    b.querySelector('.cat-label').textContent = cat.label;
    b.addEventListener('click', () => findCategory(cat, b));
    row.appendChild(b);
  }
  grid.appendChild(row);
}

let searchRun = 0;
async function findCategory(cat, btn) {
  const run = ++searchRun;
  document.querySelectorAll('.cat-btn').forEach(x => x.classList.toggle('active', x === btn));
  say('Looking for ' + cat.label.toLowerCase() + ' near ' + (centre.label || 'the map centre') + '…');
  resultsEl.hidden = false; listEl.innerHTML = '';
  // If the map service is being slow, say so — a search that talks
  // while it works feels shorter than a silent one.
  const slowTimer = setTimeout(() => run === searchRun && say('Still looking for ' + cat.label.toLowerCase() + ' — the map service is slow today. Hang on…'), 7000);
  try {
    const query = F.buildQuery(cat, centre.lat, centre.lon, 8000);
    // The full search (Overpass, with mirrors) races a backup: if Overpass
    // has not answered within 5 s — or has already failed — one Nominatim
    // look-up for the same category runs too, and the first good list wins.
    const lat = centre.lat, lon = centre.lon;
    const overpassP = F.queryOverpass(query).then(d => ({ data: d, backup: false }));
    const url = F.nominatimCategoryUrl(cat, lat, lon, 8000);
    const backupP = !url ? Promise.reject(new Error('no backup for this category')) :
      new Promise(go => { const t = setTimeout(go, 5000); overpassP.catch(() => { clearTimeout(t); go(); }); })
        .then(() => { if (run !== searchRun) throw new Error('superseded'); return fetchJson(url, { headers: { Accept: 'application/json' } }, 8000); })
        .then(hits => { const r = F.tidyNominatim(hits, lat, lon, cat.label); if (!r.length) throw new Error('backup empty'); return { data: { backupResults: r }, backup: true }; });
    let won;
    try { won = await Promise.any([overpassP, backupP]); }
    catch { won = await overpassP; }   // both failed (or backup empty): report Overpass's own answer/error
    const data = won.data, backup = won.backup;
    if (run !== searchRun) return;   // a newer tap owns the screen now
    const results = (backup ? data.backupResults : F.tidyResults(data.elements, lat, lon, cat.label)).slice(0, 20);
    if (resultLayer) resultLayer.clearLayers();
    if (!results.length) { say('No ' + cat.label.toLowerCase() + ' found within about 5 miles of here on OpenStreetMap. Try a bigger town, or a different category.'); return; }
    say('Found ' + results.length + ' — nearest first.' + (backup ? ' (From the backup search, so a few places may be missing; tap the category again in a minute for the full list.)' : '') + ' Tap Directions on any of them to get routing there.');
    const bounds = [];
    for (const r of results) {
      if (map) { const m = L.marker([r.lat, r.lon]).addTo(resultLayer); m.bindPopup(''); m.on('popupopen', () => { const el = m.getPopup().getElement(); if (el) el.textContent = r.name + ' — ' + F.formatDistance(r.distanceKm) + ' away'; }); bounds.push([r.lat, r.lon]); }
      const li = document.createElement('li');
      const strong = document.createElement('strong'); strong.textContent = r.name; li.appendChild(strong);
      li.appendChild(document.createTextNode(' — ' + F.formatDistance(r.distanceKm) + ' away' + (r.address ? ' · ' + r.address : '')));
      li.appendChild(document.createElement('br'));
      const a = document.createElement('a'); a.href = F.directionsUrl(r.lat, r.lon); a.target = '_blank'; a.rel = 'noopener'; a.className = 'directions'; a.textContent = 'Directions ↗'; li.appendChild(a);
      const a2 = document.createElement('a'); a2.href = F.osmDirectionsUrl(r.lat, r.lon); a2.target = '_blank'; a2.rel = 'noopener'; a2.textContent = 'Directions via OpenStreetMap ↗'; li.appendChild(a2);
      // The place's own website and social pages, when OpenStreetMap
      // volunteers recorded them — no extra look-up, nothing sent.
      if (r.links.length || r.phone || r.hours) {
        const more = document.createElement('div'); more.className = 'place-links';
        for (const l of r.links) { const x = document.createElement('a'); x.href = l.url; x.target = '_blank'; x.rel = 'noopener'; x.textContent = l.label + ' ↗'; more.appendChild(x); }
        if (r.phone) { const t = document.createElement('a'); t.href = 'tel:' + r.phone.replace(/[^0-9+]/g, ''); t.textContent = '📞 ' + r.phone; more.appendChild(t); }
        if (r.hours) { const h = document.createElement('span'); h.className = 'hours'; h.textContent = '🕒 ' + r.hours; more.appendChild(h); }
        li.appendChild(more);
      }
      listEl.appendChild(li);
    }
    if (map && bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  } catch { if (run === searchRun) say('The place search could not get through. Check the connection and try again; OpenStreetMap sometimes asks busy visitors to wait a minute.'); }
  finally { clearTimeout(slowTimer); }
}
