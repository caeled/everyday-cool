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
