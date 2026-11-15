// The Map Room: a live OpenStreetMap (drawn by Leaflet), a find-me button,
// ZIP and town search through OpenStreetMap's Nominatim service, and the
// compass-rose trainer. The trainer's rules live in compass.js.
'use strict';

/* ---------- The live map ---------- */

// Home base: Defiance, Ohio (ZIP 43512), where this collection is made.
const HOME = { lat: 41.2849, lon: -84.3583, label: 'Defiance, Ohio' };

const statusEl = document.getElementById('map-status');
function say(message) { statusEl.textContent = message; }

let map = null;
let marker = null;

function showPlace(lat, lon, label, zoom) {
  if (!map) return;
  map.setView([lat, lon], zoom || 14);
  if (marker) marker.remove();
  marker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
}

if (typeof L !== 'undefined') {
  map = L.map('leaflet-map').setView([HOME.lat, HOME.lon], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  marker = L.marker([HOME.lat, HOME.lon]).addTo(map)
    .bindPopup(HOME.label + ' — home base of this collection.');
  say('The map is open on ' + HOME.label + '. Drag to wander, scroll to zoom, or use the buttons above it.');
} else {
  say('The map library could not load, so the live map is resting. The lessons and the compass trainer below still work.');
}

// Find me: ask the device where it is, center the map there, drop a marker.
// The answer is used only to center the map; it is never stored or sent on.
document.getElementById('find-me').addEventListener('click', () => {
  if (!map) { say('The live map did not load, so there is nothing to center. Try the ZIP box on a full connection.'); return; }
  if (!navigator.geolocation) {
    say('This device will not say where it is. No harm done: type a ZIP code or town name in the box instead.');
    return;
  }
  say('Asking your device where you are…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      showPlace(pos.coords.latitude, pos.coords.longitude,
        'You are here, as close as your device can tell.', 15);
      say('Found you. The marker is where your device says you are; outdoors it is usually close, indoors it can wander a street or two.');
    },
    () => {
      say('Your device would not share its location. That is a fair choice. Type a ZIP code or town name in the box and the map will go there instead.');
    },
    { timeout: 12000 }
  );
});

// ZIP or town search: ask OpenStreetMap's Nominatim service where the
// place is, then move the map. US places are the home turf of this room.
document.getElementById('place-form').addEventListener('submit', async ev => {
  ev.preventDefault();
  if (!map) { say('The live map did not load, so searching is resting too. The lessons and trainer below still work.'); return; }
  const q = document.getElementById('place-input').value.trim();
  if (!q) { say('Type a ZIP code or a town name first, then press Go there.'); return; }
  say('Looking up “' + q + '”…');
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='
      + encodeURIComponent(q);
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const hits = await res.json();
    if (!hits.length) {
      say('No place by that name came back. Check the spelling, or try the ZIP code; this search knows US places best.');
      return;
    }
    const hit = hits[0];
    showPlace(parseFloat(hit.lat), parseFloat(hit.lon), hit.display_name, /^\d{5}$/.test(q) ? 13 : 12);
    say('There it is: ' + hit.display_name + '.');
  } catch (err) {
    say('The search could not get through. Check the connection and try again; the map itself still works.');
  }
});

/* ---------- The compass-rose trainer ---------- */

const R = window.CompassRules;
const roseEl = document.getElementById('rose');
const promptEl = document.getElementById('trainer-prompt');
const feedbackEl = document.getElementById('trainer-feedback');
const scoreEl = document.getElementById('trainer-score');
const streakEl = document.getElementById('trainer-streak');
const allPointsEl = document.getElementById('all-points');

let target = null;
let score = 0;
let streak = 0;
const rng = Math.random;

// One button per point, set around the rose by its bearing.
R.POINTS.forEach(p => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'rose-btn' + (p.degrees % 45 === 0 ? ' main' : ' minor');
  b.textContent = p.abbr;
  b.setAttribute('aria-label', p.name);
  const rad = p.degrees * Math.PI / 180;
  b.style.left = (50 + 43 * Math.sin(rad)) + '%';
  b.style.top = (50 - 43 * Math.cos(rad)) + '%';
  b.addEventListener('click', () => answer(p));
  roseEl.appendChild(b);
});

function pool() { return allPointsEl.checked ? R.POINTS : R.MAIN; }

function nextRound() {
  target = R.pickTarget(rng, pool(), target ? target.name : null);
  promptEl.textContent = 'Which way is ' + target.name + '?';
  feedbackEl.textContent = 'Tap the point on the rose.';
}

function answer(guess) {
  if (!target) return;
  if (R.checkAnswer(target.name, guess.name)) {
    streak += 1;
    score += R.pointsFor(streak);
    feedbackEl.textContent = 'Yes — ' + target.name + ' is ' + target.degrees + '°. '
      + (streak > 1 ? 'That is ' + streak + ' in a row. ' : '') + 'Its opposite, the way back, is ' + R.opposite(target.name).name + '.';
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    nextRound();
  } else {
    streak = 0;
    streakEl.textContent = 0;
    feedbackEl.textContent = 'That is ' + guess.name + '. Keep looking: ' + target.name + ' sits at ' + target.degrees + '° on the rose.';
  }
}

allPointsEl.addEventListener('change', nextRound);
document.getElementById('trainer-new').addEventListener('click', () => {
  score = 0; streak = 0;
  scoreEl.textContent = 0; streakEl.textContent = 0;
  nextRound();
});
nextRound();

/* ---------- Build a Map ---------- */
// Everything in this section happens in the visitor's own browser.
// Files are read locally and never uploaded anywhere; pins live only
// on this page. The rules (CSV, coordinates, shapes, distances) are in
// maptools.js; this is the wiring to the map.
const T = window.MapTools;
const buildStatus = document.getElementById('build-status');
const pinListEl = document.getElementById('pin-list');
const trailStatusEl = document.getElementById('trail-status');
const myPins = [];   // { name, notes, group, close, marker }
const myShapes = []; // { data, markers, line }
let trailLine = null;

function bsay(message) { buildStatus.textContent = message; }

function pinCoords(pin) {
  const ll = pin.marker.getLatLng();
  return { lat: ll.lat, lon: ll.lng };
}

function refreshOutputs() {
  if (!myPins.length) {
    pinListEl.innerHTML = '<li>No pins yet. Add some above, or open the sample square.</li>';
    trailStatusEl.textContent = '';
  } else {
    pinListEl.innerHTML = myPins.map(p => {
      const c = pinCoords(p);
      return '<li><strong></strong> — ' + c.lat.toFixed(5) + ', ' + c.lon.toFixed(5)
        + (p.notes ? ' · ' : '') + '</li>';
    }).join('');
    myPins.forEach((p, i) => {
      pinListEl.children[i].querySelector('strong').textContent = p.name;
      if (p.notes) pinListEl.children[i].append(document.createTextNode(p.notes));
    });
    if (myPins.length > 1) {
      const km = T.pathDistanceKm(myPins.map(pinCoords), false);
      trailStatusEl.textContent = 'Your trail joins ' + myPins.length + ' pins in the order they were added: '
        + T.formatDistance(km) + ' end to end. Drag any pin and the trail follows.';
    } else {
      trailStatusEl.textContent = 'One pin so far. Add another and a trail will join them.';
    }
  }
  if (map) {
    if (trailLine) { trailLine.remove(); trailLine = null; }
    if (myPins.length > 1) {
      trailLine = L.polyline(myPins.map(p => p.marker.getLatLng()),
        { color: '#e26045', weight: 3, dashArray: '8 6' }).addTo(map);
    }
  }
}

function redrawShapes() {
  for (const s of myShapes) {
    const latlngs = s.markers.map(m => m.getLatLng());
    s.line.setLatLngs(s.data.closed ? [...latlngs, latlngs[0]] : latlngs);
  }
}

function addPin(pin) {
  if (!map) return null;
  const marker = L.marker([pin.lat, pin.lon], { draggable: true }).addTo(map);
  const entry = { name: pin.name, notes: pin.notes || '', group: pin.group || '', close: !!pin.close, marker };
  marker.bindPopup('<strong></strong>' + (entry.notes ? '<br>' : '') + '<span></span>');
  marker.on('popupopen', () => {
    const el = marker.getPopup().getElement();
    if (el) {
      el.querySelector('strong').textContent = entry.name;
      el.querySelector('span').textContent = entry.notes;
    }
  });
  marker.on('dragend', () => { refreshOutputs(); redrawShapes(); });
  myPins.push(entry);
  return entry;
}

function fitToPins() {
  if (map && myPins.length) {
    map.fitBounds(L.latLngBounds(myPins.map(p => p.marker.getLatLng())), { padding: [30, 30] });
  }
}

function plotParsed(pins, sourceLabel) {
  const before = myPins.length;
  const entries = pins.map(addPin).filter(Boolean);
  const { shapes } = T.buildShapes(pins);
  for (const shape of shapes) {
    const markers = entries.filter(e => e.group === shape.group).map(e => e.marker);
    if (markers.length < 2) continue;
    const latlngs = markers.map(m => m.getLatLng());
    const line = (shape.closed ? L.polygon(latlngs) : L.polyline(latlngs))
      .addTo(map)
      .bindPopup('<strong></strong><br><span></span>');
    line.on('popupopen', () => {
      const el = line.getPopup().getElement();
      if (el) {
        el.querySelector('strong').textContent = shape.group;
        el.querySelector('span').textContent = (shape.closed ? 'Closed shape' : 'Path') + ', '
          + T.formatDistance(T.pathDistanceKm(shape.points, shape.closed)) + ' around.';
      }
    });
    myShapes.push({ data: shape, markers, line });
  }
  fitToPins();
  refreshOutputs();
  return entries.length;
}

// CSV files: read the words, plot the pins, draw any groups as paths
// or closed shapes. The file never leaves this browser.
document.getElementById('csv-file').addEventListener('change', async ev => {
  const file = ev.target.files[0];
  if (!file) return;
  if (!map) { bsay('The live map did not load, so pins have nowhere to land. The lessons and trainer still work.'); return; }
  try {
    const { pins, skipped } = T.parseCSV(await file.text());
    if (!pins.length) {
      bsay('No pins could be read from that file. A pins CSV needs columns named name, lat, and lon (or lng); the sample below shows the shape of it.');
      return;
    }
    const n = plotParsed(pins, file.name);
    bsay('Plotted ' + n + ' pin' + (n === 1 ? '' : 's') + ' from ' + file.name + '.'
      + (skipped ? ' ' + skipped + ' row' + (skipped === 1 ? '' : 's') + ' had no usable name or coordinates and were skipped.' : ''));
  } catch (err) {
    bsay('That file could not be read as a CSV. Nothing was plotted.');
  }
  ev.target.value = '';
});

// PDF files: pdf.js (Mozilla) reads the words here in the browser, and
// the coordinate hunter from maptools.js looks for decimal-degree pairs.
let pdfJsPromise = null;
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return pdfJsPromise;
}

document.getElementById('pdf-file').addEventListener('change', async ev => {
  const file = ev.target.files[0];
  if (!file) return;
  if (!map) { bsay('The live map did not load, so pins have nowhere to land. The lessons and trainer still work.'); return; }
  bsay('Reading ' + file.name + ' here in your browser and hunting for coordinates…');
  try {
    const pdfjs = await loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(' ') + '\n';
    }
    const found = T.extractCoordinates(text);
    if (!found.length) {
      bsay('No coordinates were found in ' + file.name + '. The hunter looks for pairs written like 41.2845, -84.3558; if the document writes them another way, or only as a picture of a map, it cannot see them.');
      return;
    }
    const pins = found.map((c, i) => ({
      name: 'Point ' + (i + 1) + ' from ' + file.name, lat: c.lat, lon: c.lon,
      notes: 'Found in the text of ' + file.name + '.', group: '', close: false,
    }));
    const n = plotParsed(pins, file.name);
    bsay('Found and plotted ' + n + ' coordinate pair' + (n === 1 ? '' : 's') + ' from ' + file.name + '.');
  } catch (err) {
    bsay('That PDF could not be read. It may be protected, or made of pictures with no words in it. Nothing was plotted.');
  }
  ev.target.value = '';
});

// Click-to-add: only while the visitor has switched it on.
if (map) {
  map.on('click', ev => {
    if (!document.getElementById('click-add').checked) return;
    const name = window.prompt('Name this pin:');
    if (!name || !name.trim()) return;
    addPin({ name: name.trim(), lat: ev.latlng.lat, lon: ev.latlng.lng, notes: '', group: '', close: false });
    fitToPins();
    refreshOutputs();
    bsay('Added “' + name.trim() + '”. Drag it to move it, or keep clicking to grow the trail.');
  });
}

// Export: the pins as they now stand, as a CSV in this room's own format.
document.getElementById('export-csv').addEventListener('click', () => {
  if (!myPins.length) { bsay('No pins to download yet. Add some first.'); return; }
  const pins = myPins.map(p => ({ name: p.name, notes: p.notes, group: p.group, close: p.close, ...pinCoords(p) }));
  const blob = new Blob([T.pinsToCSV(pins)], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my-map-pins.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  bsay('Downloaded ' + pins.length + ' pin' + (pins.length === 1 ? '' : 's') + ' as my-map-pins.csv. Open it here again any time to rebuild the map.');
});

document.getElementById('print-map').addEventListener('click', () => window.print());

document.getElementById('clear-pins').addEventListener('click', () => {
  for (const p of myPins) p.marker.remove();
  for (const s of myShapes) s.line.remove();
  myPins.length = 0;
  myShapes.length = 0;
  refreshOutputs();
  bsay('Cleared. The map is a clean sheet again.');
});

refreshOutputs();
