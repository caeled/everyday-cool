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

function setCentre(lat, lon, label, zoom) {
  centre = { lat, lon, label };
  if (!map) return;
  map.setView([lat, lon], zoom || 14);
  if (centreMarker) centreMarker.remove();
  centreMarker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
}

document.getElementById('find-me').addEventListener('click', () => {
  if (!navigator.geolocation) { say('This device will not say where it is. Type a ZIP code or town name instead.'); return; }
  say('Asking your device where you are…');
  navigator.geolocation.getCurrentPosition(
    pos => { setCentre(pos.coords.latitude, pos.coords.longitude, 'You are here, as close as your device can tell.', 15); say('Found you. Now tap a category and Find It will look around you.'); },
    () => say('Your device would not share its location. That is a fair choice — the ZIP box does the same job.'),
    { timeout: 12000 });
});

document.getElementById('place-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const q = document.getElementById('place-input').value.trim();
  if (!q) { say('Type a ZIP code or a town name first, then press Go there.'); return; }
  say('Looking up “' + q + '”…');
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
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

async function findCategory(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(x => x.classList.toggle('active', x === btn));
  say('Looking for ' + cat.label.toLowerCase() + ' near ' + (centre.label || 'the map centre') + '…');
  resultsEl.hidden = false; listEl.innerHTML = '';
  try {
    const query = F.buildQuery(cat, centre.lat, centre.lon, 8000);
    const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!res.ok) throw new Error('overpass ' + res.status);
    const data = await res.json();
    const results = F.tidyResults(data.elements, centre.lat, centre.lon, cat.label).slice(0, 20);
    if (resultLayer) resultLayer.clearLayers();
    if (!results.length) { say('No ' + cat.label.toLowerCase() + ' found within about 5 miles of here on OpenStreetMap. Try a bigger town, or a different category.'); return; }
    say('Found ' + results.length + ' — nearest first. Tap Directions on any of them to get routing there.');
    const bounds = [];
    for (const r of results) {
      if (map) { const m = L.marker([r.lat, r.lon]).addTo(resultLayer); m.bindPopup(''); m.on('popupopen', () => { const el = m.getPopup().getElement(); if (el) el.textContent = r.name + ' — ' + F.formatDistance(r.distanceKm) + ' away'; }); bounds.push([r.lat, r.lon]); }
      const li = document.createElement('li');
      const strong = document.createElement('strong'); strong.textContent = r.name; li.appendChild(strong);
      li.appendChild(document.createTextNode(' — ' + F.formatDistance(r.distanceKm) + ' away' + (r.address ? ' · ' + r.address : '')));
      li.appendChild(document.createElement('br'));
      const a = document.createElement('a'); a.href = F.directionsUrl(r.lat, r.lon); a.target = '_blank'; a.rel = 'noopener'; a.className = 'directions'; a.textContent = 'Directions ↗'; li.appendChild(a);
      const a2 = document.createElement('a'); a2.href = F.osmDirectionsUrl(r.lat, r.lon); a2.target = '_blank'; a2.rel = 'noopener'; a2.textContent = 'Directions via OpenStreetMap ↗'; li.appendChild(a2);
      listEl.appendChild(li);
    }
    if (map && bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  } catch { say('The place search could not get through. Check the connection and try again; OpenStreetMap sometimes asks busy visitors to wait a minute.'); }
}
