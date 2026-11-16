// Find It rules: the category list, the Overpass query builder, distance
// maths, and result tidying. No DOM code lives here, so Node can check
// the rules directly (see test.cjs).
'use strict';

// Each category: a plain-language label, the group it sits in, an emoji
// for its big button, and the OpenStreetMap tag selectors that find it.
// A selector is the part inside nwr[...] in an Overpass query.
const CATEGORIES = [
  { id: 'coffee', label: 'Coffee', group: 'Eat & drink', emoji: '☕', selectors: ['"amenity"="cafe"', '"shop"="coffee"'] },
  { id: 'salad', label: 'Salad / healthy food', group: 'Eat & drink', emoji: '🥗', selectors: ['"amenity"="restaurant"]["cuisine"~"salad|healthy|vegetarian"]', '"amenity"="fast_food"]["cuisine"~"salad|healthy"]'] },
  { id: 'diner', label: 'Diner / breakfast', group: 'Eat & drink', emoji: '🍳', selectors: ['"amenity"="restaurant"]["cuisine"~"diner|breakfast|american"]', '"amenity"="cafe"]["cuisine"~"breakfast"]'] },
  { id: 'fast-food', label: 'Fast food', group: 'Eat & drink', emoji: '🍔', selectors: ['"amenity"="fast_food"'] },
  { id: 'groceries', label: 'Groceries', group: 'Eat & drink', emoji: '🛒', selectors: ['"shop"="supermarket"', '"shop"="convenience"', '"shop"="grocery"'] },
  { id: 'pharmacy', label: 'Pharmacy', group: 'Health', emoji: '💊', selectors: ['"amenity"="pharmacy"'] },
  { id: 'hospital', label: 'Hospital', group: 'Health', emoji: '🏥', selectors: ['"amenity"="hospital"'] },
  { id: 'urgent-care', label: 'Urgent care / clinic', group: 'Health', emoji: '🩺', selectors: ['"amenity"="clinic"', '"healthcare"="urgent_care"'] },
  { id: 'dentist', label: 'Dentist', group: 'Health', emoji: '🦷', selectors: ['"amenity"="dentist"'] },
  { id: 'gas', label: 'Gas station', group: 'Car & road', emoji: '⛽', selectors: ['"amenity"="fuel"'] },
  { id: 'ev-charging', label: 'EV charging', group: 'Car & road', emoji: '🔌', selectors: ['"amenity"="charging_station"'] },
  { id: 'rest-stop', label: 'Rest stop', group: 'Car & road', emoji: '🅿️', selectors: ['"highway"="rest_area"', '"highway"="services"'] },
  { id: 'auto-repair', label: 'Auto repair / tire', group: 'Car & road', emoji: '🔧', selectors: ['"shop"="car_repair"', '"shop"="tyres"'] },
  { id: 'hotel', label: 'Hotel / motel', group: 'Sleep & outdoors', emoji: '🛏️', selectors: ['"tourism"="hotel"', '"tourism"="motel"'] },
  { id: 'campground', label: 'Campground', group: 'Sleep & outdoors', emoji: '🏕️', selectors: ['"tourism"="camp_site"', '"tourism"="caravan_site"'] },
  { id: 'library', label: 'Library', group: 'Sleep & outdoors', emoji: '📚', selectors: ['"amenity"="library"'] },
  { id: 'park', label: 'Park / playground', group: 'Sleep & outdoors', emoji: '🌳', selectors: ['"leisure"="park"', '"leisure"="playground"'] },
  { id: 'fitness', label: 'Fitness center', group: 'Everyday needs', emoji: '🏋️', selectors: ['"leisure"="fitness_centre"', '"amenity"="gym"'] },
  { id: 'laundromat', label: 'Laundromat', group: 'Everyday needs', emoji: '🧺', selectors: ['"shop"="laundry"'] },
  { id: 'atm-bank', label: 'ATM / bank', group: 'Everyday needs', emoji: '🏧', selectors: ['"amenity"="atm"', '"amenity"="bank"'] },
  { id: 'post-office', label: 'Post office', group: 'Everyday needs', emoji: '📮', selectors: ['"amenity"="post_office"'] },
  { id: 'hardware', label: 'Hardware store', group: 'Everyday needs', emoji: '🪛', selectors: ['"shop"="hardware"', '"shop"="doityourself"'] },
  { id: 'restroom', label: 'Public restroom', group: 'Everyday needs', emoji: '🚻', selectors: ['"amenity"="toilets"'] },
];

const GROUPS = ['Eat & drink', 'Health', 'Car & road', 'Sleep & outdoors', 'Everyday needs'];

function byId(id) { return CATEGORIES.find(c => c.id === id) || null; }

// Build an Overpass QL query that finds a category around a centre.
// radiusM is metres; timeout 25s is Overpass's usual courtesy setting.
function buildQuery(category, lat, lon, radiusM) {
  const cat = typeof category === 'string' ? byId(category) : category;
  if (!cat) return null;
  const parts = cat.selectors.map(s => 'nwr[' + s + '](around:' + radiusM + ',' + lat + ',' + lon + ');').join('');
  return '[out:json][timeout:25];(' + parts + ');out center 60;';
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

const api = { CATEGORIES, GROUPS, byId, buildQuery, haversineKm, formatDistance, tidyResults, directionsUrl, osmDirectionsUrl };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.FindItRules = api;
