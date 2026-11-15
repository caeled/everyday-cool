// Build-a-Map rules for The Map Room: reading pin CSV files, finding
// coordinates in text (from PDFs), grouping pins into paths and closed
// shapes, measuring distances, and writing pins back out as CSV.
// No DOM code lives here, so Node can check the rules directly (test.cjs).
'use strict';

// Split CSV text into rows of fields. Handles quoted fields, commas inside
// quotes, doubled quotes, and Windows or Unix line endings.
function splitCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const src = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  row.push(field);
  rows.push(row);
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

const HEADERS = {
  name: ['name', 'title', 'place'],
  lat: ['lat', 'latitude'],
  lon: ['lon', 'lng', 'long', 'longitude'],
  notes: ['notes', 'note', 'description'],
  group: ['group', 'path', 'shape'],
  close: ['close', 'closed', 'polygon'],
};

// Read a pins CSV: columns name, lat, lon (or lng), and optional notes,
// group, and close. Points that share a group name belong to one path or
// shape, connected in file order; close=yes joins the last back to first.
// Returns { pins, skipped } — pins keep file order; skipped counts the
// rows that had no usable name or coordinates.
function parseCSV(text) {
  const rows = splitCSV(text);
  if (!rows.length) return { pins: [], skipped: 0 };
  const head = rows[0].map(h => h.trim().toLowerCase());
  const col = {};
  for (const key of Object.keys(HEADERS)) {
    col[key] = head.findIndex(h => HEADERS[key].includes(h));
  }
  const hasHeader = col.lat >= 0 && col.lon >= 0;
  const body = hasHeader ? rows.slice(1) : rows;
  // Without a header, read positionally: name, lat, lon, notes.
  const at = (row, key, fallback) => {
    const i = hasHeader ? col[key] : fallback;
    return i >= 0 && i < row.length ? row[i].trim() : '';
  };
  const pins = [];
  let skipped = 0;
  for (const row of body) {
    const name = at(row, 'name', 0);
    const lat = parseFloat(at(row, 'lat', 1));
    const lon = parseFloat(at(row, 'lon', 2));
    if (!name || !isLat(lat) || !isLon(lon)) { skipped++; continue; }
    pins.push({
      name,
      lat,
      lon,
      notes: at(row, 'notes', 3),
      group: at(row, 'group', -1),
      close: /^y(es)?$/i.test(at(row, 'close', -1)),
    });
  }
  return { pins, skipped };
}

function isLat(v) { return Number.isFinite(v) && v >= -90 && v <= 90; }
function isLon(v) { return Number.isFinite(v) && v >= -180 && v <= 180; }

// Find decimal-degree coordinate pairs in plain text, the way they appear
// in documents and PDFs: "41.2845, -84.3558". Returns [{lat, lon}] in the
// order found, duplicates removed.
function extractCoordinates(text) {
  const found = [];
  const seen = new Set();
  const re = /(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/g;
  let m;
  while ((m = re.exec(String(text))) !== null) {
    const lat = parseFloat(m[1]), lon = parseFloat(m[2]);
    if (!isLat(lat) || !isLon(lon)) continue;
    const key = lat + ',' + lon;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ lat, lon });
  }
  return found;
}

// Group a parsed pin list into loose pins and connected shapes.
// A shape is { group, points, closed } with points in file order;
// closed shapes are polygons, open ones are paths.
function buildShapes(pins) {
  const loose = [];
  const shapes = [];
  const byGroup = new Map();
  for (const pin of pins) {
    if (!pin.group) { loose.push(pin); continue; }
    if (!byGroup.has(pin.group)) {
      const shape = { group: pin.group, points: [], closed: false };
      byGroup.set(pin.group, shape);
      shapes.push(shape);
    }
    const shape = byGroup.get(pin.group);
    shape.points.push(pin);
    if (pin.close) shape.closed = true;
  }
  return { loose, shapes };
}

// Great-circle distance in kilometres between two points.
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Total length of a path through points, in kilometres. A closed shape
// adds the leg from the last point back to the first.
function pathDistanceKm(points, closed) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
  }
  if (closed && points.length > 2) {
    total += haversineKm(points[points.length - 1].lat, points[points.length - 1].lon, points[0].lat, points[0].lon);
  }
  return total;
}

// A distance said the way a person would: metres when short,
// kilometres and miles when long.
function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + ' m';
  const miles = km * 0.621371;
  return km.toFixed(1) + ' km (' + miles.toFixed(1) + ' mi)';
}

function csvField(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Write pins back out as a CSV in the same format parseCSV reads,
// groups and close flags included, so an exported file re-imports whole.
function pinsToCSV(pins) {
  const lines = ['name,lat,lon,notes,group,close'];
  for (const p of pins) {
    lines.push([p.name, p.lat, p.lon, p.notes || '', p.group || '', p.close ? 'yes' : '']
      .map(csvField).join(','));
  }
  return lines.join('\n') + '\n';
}

const api = { splitCSV, parseCSV, extractCoordinates, buildShapes, haversineKm, pathDistanceKm, formatDistance, pinsToCSV, isLat, isLon };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.MapTools = api;
