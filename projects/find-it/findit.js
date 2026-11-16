// Find It rules: the category list, the Overpass query builder, distance
// maths, and result tidying. No DOM code lives here, so Node can check
// the rules directly (see test.cjs).
'use strict';

// Each category: a plain-language label, the group it sits in, an emoji
// for its big button, and the OpenStreetMap tag selectors that find it.
// A selector is the part inside nwr[...] in an Overpass query.
const CATEGORIES = [
  { id: 'coffee', label: 'Coffee', group: 'Eat & drink', emoji: '☕', selectors: ['"amenity"="cafe"', '"shop"="coffee"'], phrase: 'cafe' },
  { id: 'salad', label: 'Salad / healthy food', group: 'Eat & drink', emoji: '🥗', selectors: ['"amenity"="restaurant"]["cuisine"~"salad|healthy|vegetarian"]', '"amenity"="fast_food"]["cuisine"~"salad|healthy"]'] },
  { id: 'diner', label: 'Diner / breakfast', group: 'Eat & drink', emoji: '🍳', selectors: ['"amenity"="restaurant"]["cuisine"~"diner|breakfast|american"]', '"amenity"="cafe"]["cuisine"~"breakfast"]'] },
  { id: 'fast-food', label: 'Fast food', group: 'Eat & drink', emoji: '🍔', selectors: ['"amenity"="fast_food"'], phrase: 'fast food' },
  { id: 'groceries', label: 'Groceries', group: 'Eat & drink', emoji: '🛒', selectors: ['"shop"="supermarket"', '"shop"="convenience"', '"shop"="grocery"'], phrase: 'supermarket' },
  { id: 'pharmacy', label: 'Pharmacy', group: 'Health', emoji: '💊', selectors: ['"amenity"="pharmacy"'], phrase: 'pharmacy' },
  { id: 'hospital', label: 'Hospital', group: 'Health', emoji: '🏥', selectors: ['"amenity"="hospital"'], phrase: 'hospital' },
  { id: 'urgent-care', label: 'Urgent care / clinic', group: 'Health', emoji: '🩺', selectors: ['"amenity"="clinic"', '"healthcare"="urgent_care"'], phrase: 'clinic' },
  { id: 'dentist', label: 'Dentist', group: 'Health', emoji: '🦷', selectors: ['"amenity"="dentist"'], phrase: 'dentist' },
  { id: 'gas', label: 'Gas station', group: 'Car & road', emoji: '⛽', selectors: ['"amenity"="fuel"'], phrase: 'gas station' },
  { id: 'ev-charging', label: 'EV charging', group: 'Car & road', emoji: '🔌', selectors: ['"amenity"="charging_station"'], phrase: 'charging station' },
  { id: 'rest-stop', label: 'Rest stop', group: 'Car & road', emoji: '🅿️', selectors: ['"highway"="rest_area"', '"highway"="services"'], phrase: 'rest area' },
  { id: 'auto-repair', label: 'Auto repair / tire', group: 'Car & road', emoji: '🔧', selectors: ['"shop"="car_repair"', '"shop"="tyres"'], phrase: 'car repair' },
  { id: 'hotel', label: 'Hotel / motel', group: 'Sleep & outdoors', emoji: '🛏️', selectors: ['"tourism"="hotel"', '"tourism"="motel"'], phrase: 'hotel' },
  { id: 'campground', label: 'Campground', group: 'Sleep & outdoors', emoji: '🏕️', selectors: ['"tourism"="camp_site"', '"tourism"="caravan_site"'], phrase: 'camp site' },
  { id: 'library', label: 'Library', group: 'Sleep & outdoors', emoji: '📚', selectors: ['"amenity"="library"'], phrase: 'library' },
  { id: 'park', label: 'Park / playground', group: 'Sleep & outdoors', emoji: '🌳', selectors: ['"leisure"="park"', '"leisure"="playground"'], phrase: 'park' },
  { id: 'fitness', label: 'Fitness center', group: 'Everyday needs', emoji: '🏋️', selectors: ['"leisure"="fitness_centre"', '"amenity"="gym"'], phrase: 'gym' },
  { id: 'laundromat', label: 'Laundromat', group: 'Everyday needs', emoji: '🧺', selectors: ['"shop"="laundry"'], phrase: 'laundry' },
  { id: 'atm-bank', label: 'ATM / bank', group: 'Everyday needs', emoji: '🏧', selectors: ['"amenity"="atm"', '"amenity"="bank"'], phrase: 'bank' },
  { id: 'post-office', label: 'Post office', group: 'Everyday needs', emoji: '📮', selectors: ['"amenity"="post_office"'], phrase: 'post office' },
  { id: 'hardware', label: 'Hardware store', group: 'Everyday needs', emoji: '🪛', selectors: ['"shop"="hardware"', '"shop"="doityourself"'], phrase: 'hardware store' },
  { id: 'restroom', label: 'Public restroom', group: 'Everyday needs', emoji: '🚻', selectors: ['"amenity"="toilets"'], phrase: 'toilets' },
];

const GROUPS = ['Eat & drink', 'Health', 'Car & road', 'Sleep & outdoors', 'Everyday needs'];

// Public Overpass endpoints, tried in order. The main instance is a
// shared service: when it is busy it can stall or refuse, so Find It
// falls through to community mirrors instead of giving up.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// Ask Overpass for a query's results, trying each endpoint in turn.
// Each attempt gets its own time limit (an AbortController), so one
// stalled server cannot hang the search forever. fetchFn can be
// injected so the rules can be tested without the network.
// Hedging: if a server has not answered within hedgeMs, the next mirror
// is asked as well (without cancelling the first) and the first good
// answer wins, so a stalled main server costs ~4 s, not 15 s per server.
// A 200 answer that carries an Overpass "remark" (its own timeout or
// out-of-memory note) and no elements counts as a failure, not as
// "nothing here".
async function queryOverpass(query, fetchFn, timeoutMs, hedgeMs) {
  const doFetch = fetchFn || ((...a) => fetch(...a));
  const limit = timeoutMs || 10000;
  const hedge = hedgeMs == null ? 4000 : hedgeMs;
  return new Promise((resolve, reject) => {
    let next = 0, running = 0, done = false, lastErr = null, hedgeTimer = null;
    const ctls = [];
    const finish = (ok, v) => { if (done) return; done = true; clearTimeout(hedgeTimer); ctls.forEach(c => c && c.abort()); ok ? resolve(v) : reject(v); };
    const launch = () => {
      clearTimeout(hedgeTimer);
      if (done) return;
      if (next >= OVERPASS_ENDPOINTS.length) { if (!running) finish(false, lastErr || new Error('overpass unreachable')); return; }
      const url = OVERPASS_ENDPOINTS[next++];
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null; ctls.push(ctl);
      const timer = ctl ? setTimeout(() => ctl.abort(), limit) : null;
      running++;
      if (hedge > 0) hedgeTimer = setTimeout(launch, hedge);
      Promise.resolve().then(() => doFetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctl ? ctl.signal : undefined }))
        .then(async res => {
          if (!res.ok) throw new Error('overpass ' + res.status);
          const data = await res.json();
          if (!data || !Array.isArray(data.elements) || (data.remark && !data.elements.length)) throw new Error('overpass remark: ' + ((data && data.remark) || 'no elements'));
          finish(true, data);
        })
        .catch(e => { lastErr = e; running--; launch(); })
        .finally(() => { if (timer) clearTimeout(timer); });
    };
    launch();
  });
}

function byId(id) { return CATEGORIES.find(c => c.id === id) || null; }

// Build an Overpass QL query that finds a category around a centre.
// radiusM is metres; timeout 25s is Overpass's usual courtesy setting.
function buildQuery(category, lat, lon, radiusM) {
  const cat = typeof category === 'string' ? byId(category) : category;
  if (!cat) return null;
  const parts = cat.selectors.map(s => 'nwr[' + s + '](around:' + radiusM + ',' + lat + ',' + lon + ');').join('');
  return '[out:json][timeout:25];(' + parts + ');out center 60;';
}

// ---- Location rules (find-me) -------------------------------------
// A fix is { lat, lon, accuracyM, source, at }. source is 'device' (the
// browser / Windows location service), 'network' (a town-level guess
// from the internet connection), or 'saved' (this visit's last fix).
// Good enough to stop refining: within 100 m, about a city block.
const GOOD_ENOUGH_M = 100;
// Keep only the better of two fixes: smaller accuracy circle wins; a
// device fix always beats a network guess.
function betterFix(prev, next) {
  if (!next || !isFinite(next.lat) || !isFinite(next.lon)) return prev || null;
  if (!prev) return next;
  const rank = f => (f.source === 'network' ? 1 : 0);
  if (rank(next) !== rank(prev)) return rank(next) < rank(prev) ? next : prev;
  const pa = isFinite(prev.accuracyM) ? prev.accuracyM : Infinity;
  const na = isFinite(next.accuracyM) ? next.accuracyM : Infinity;
  return na < pa ? next : prev;
}
function goodEnough(fix) { return !!fix && fix.source === 'device' && isFinite(fix.accuracyM) && fix.accuracyM <= GOOD_ENOUGH_M; }
// Map zoom to suit the accuracy circle: tight fix, close zoom.
function zoomForAccuracy(m) {
  if (!isFinite(m)) return 12;
  if (m <= 150) return 16; if (m <= 600) return 15; if (m <= 2500) return 14; if (m <= 8000) return 13; return 12;
}
// Plain words for an accuracy circle.
function describeAccuracy(m) {
  if (!isFinite(m)) return 'accuracy unknown';
  return 'within about ' + formatDistance(m / 1000);
}
// Read a fix saved earlier in this visit (sessionStorage text). Only
// fixes younger than maxAgeMs come back.
function readSavedFix(text, nowMs, maxAgeMs) {
  try {
    const f = JSON.parse(text || 'null');
    if (!f || !isFinite(f.lat) || !isFinite(f.lon) || !isFinite(f.at)) return null;
    if (nowMs - f.at > maxAgeMs) return null;
    return { lat: f.lat, lon: f.lon, accuracyM: f.accuracyM, source: 'saved', at: f.at, savedFrom: f.source };
  } catch { return null; }
}
// Town-level answer from a keyless "where is this internet connection"
// service (geojs.io or ipwho.is). They report town-level guesses; we treat
// them as a 10 km circle.
function parseIpGeo(data) {
  if (!data || data.success === false) return null;
  const lat = parseFloat(data.latitude), lon = parseFloat(data.longitude);
  if (!isFinite(lat) || !isFinite(lon)) return null;
  return { lat, lon, accuracyM: 10000, source: 'network', place: [data.city, data.region].filter(Boolean).join(', ') };
}
const IP_GEO_SERVICES = ['https://get.geojs.io/v1/ip/geo.json', 'https://ipwho.is/'];

// ---- Backup category search --------------------------------------
// When the Overpass servers are slow or busy, Nominatim (OpenStreetMap's
// own search) can still find the common categories with an OSM "special
// phrase" like [cafe] inside a box around the centre. One request.
function boxAround(lat, lon, radiusM) {
  const dLat = radiusM / 111320;
  const dLon = radiusM / (111320 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
  return { west: lon - dLon, south: lat - dLat, east: lon + dLon, north: lat + dLat };
}
function nominatimCategoryUrl(category, lat, lon, radiusM) {
  const cat = typeof category === 'string' ? byId(category) : category;
  if (!cat || !cat.phrase) return null;
  const b = boxAround(lat, lon, radiusM);
  const vb = [b.west, b.north, b.east, b.south].map(n => n.toFixed(5)).join(',');
  return 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&bounded=1&extratags=1&viewbox=' + vb + '&q=' + encodeURIComponent('[' + cat.phrase + ']');
}
function tidyNominatim(hits, centreLat, centreLon, categoryLabel) {
  const els = (hits || []).map(h => {
    const tags = Object.assign({}, h.extratags || {});
    tags.name = h.name || '';
    if (!tags['addr:street']) tags['addr:street'] = String(h.display_name || '').split(',').slice(1, 3).map(x => x.trim()).join(' ');
    return { lat: parseFloat(h.lat), lon: parseFloat(h.lon), tags };
  }).filter(e => isFinite(e.lat) && isFinite(e.lon));
  return tidyResults(els, centreLat, centreLon, categoryLabel);
}

// ---- Social and web links on a place -----------------------------
// Volunteers often record a place's website and social pages on
// OpenStreetMap (website, contact:facebook, contact:instagram, ...).
// These ride along in the search answer, so showing them costs no extra
// request and sends nothing anywhere. Only http(s) links are produced.
const SOCIAL_KEYS = [
  { label: 'Website', keys: ['website', 'contact:website', 'url'], base: '' },
  { label: 'Facebook', keys: ['contact:facebook', 'facebook'], base: 'https://www.facebook.com/' },
  { label: 'Instagram', keys: ['contact:instagram', 'instagram'], base: 'https://www.instagram.com/' },
  { label: 'X', keys: ['contact:twitter', 'twitter', 'contact:x'], base: 'https://x.com/' },
  { label: 'TikTok', keys: ['contact:tiktok'], base: 'https://www.tiktok.com/@' },
  { label: 'Mastodon', keys: ['contact:mastodon'], base: '' },
  { label: 'Yelp', keys: ['contact:yelp'], base: 'https://www.yelp.com/biz/' },
  { label: 'Tripadvisor', keys: ['contact:tripadvisor'], base: '' },
];
function safeHttpUrl(u) {
  try { const x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : null; } catch { return null; }
}
function placeLinks(tags) {
  const out = [];
  for (const s of SOCIAL_KEYS) {
    const raw = s.keys.map(k => tags && tags[k]).find(Boolean);
    if (!raw) continue;
    let v = String(raw).split(';')[0].trim();
    if (!/^https?:\/\//i.test(v)) {
      if (/^www\./i.test(v) || (!s.base && /\./.test(v))) v = 'https://' + v;
      else if (s.base) v = s.base + v.replace(/^@/, '');
    }
    const url = safeHttpUrl(v);
    if (url) out.push({ label: s.label, url });
  }
  const phone = tags && (tags.phone || tags['contact:phone']);
  return { links: out, phone: phone ? String(phone).split(';')[0].trim() : '', hours: (tags && tags.opening_hours) || '' };
}

// Straight-line distance in kilometres (the crow's flight, like the
// Map Room's trail maths).
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + ' m';
  const miles = km * 0.621371;
  return km.toFixed(1) + ' km (' + miles.toFixed(1) + ' mi)';
}

// Turn raw Overpass elements into tidy results: a name (or an honest
// fallback), coordinates (ways/relations carry a centre), distance from
// the search centre, sorted nearest first, duplicates removed.
function tidyResults(elements, centreLat, centreLon, categoryLabel) {
  const seen = new Set(), out = [];
  for (const el of elements || []) {
    const lat = el.lat != null ? el.lat : (el.center && el.center.lat);
    const lon = el.lon != null ? el.lon : (el.center && el.center.lon);
    if (lat == null || lon == null) continue;
    const key = lat.toFixed(5) + ',' + lon.toFixed(5);
    if (seen.has(key)) continue;
    seen.add(key);
    const tags = el.tags || {};
    out.push({
      name: tags.name || ('Unnamed ' + (categoryLabel || 'place').toLowerCase()),
      lat, lon,
      address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' '),
      distanceKm: haversineKm(centreLat, centreLon, lat, lon),
      ...placeLinks(tags),
    });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm);
}

function directionsUrl(lat, lon) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lon;
}
function osmDirectionsUrl(lat, lon) {
  return 'https://www.openstreetmap.org/directions?to=' + lat + '%2C' + lon;
}

const api = { CATEGORIES, GROUPS, OVERPASS_ENDPOINTS, queryOverpass, GOOD_ENOUGH_M, betterFix, goodEnough, zoomForAccuracy, describeAccuracy, readSavedFix, parseIpGeo, IP_GEO_SERVICES, boxAround, nominatimCategoryUrl, tidyNominatim, placeLinks, safeHttpUrl, byId, buildQuery, haversineKm, formatDistance, tidyResults, directionsUrl, osmDirectionsUrl };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.FindItRules = api;
