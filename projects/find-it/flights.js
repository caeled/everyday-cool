// Find It flight tracker rules: reading a flight number, airline code
// table, provider URLs, and tidying the answers. No DOM code lives here,
// so Node can check the rules directly (see test.cjs).
//
// Where the data comes from (all free, no account, no key):
//  - adsbdb.com: turns a flight number into its airline and usual route
//    (origin and destination airports). Answers browsers directly.
//  - adsb.lol: live positions from volunteer ADS-B receivers (ODbL data).
//    It does not answer browser pages directly (no CORS header), so the
//    page asks it through the cors.dev public relay; direct calls are
//    kept as a fallback for places that allow them.
//  - FAA NAS Status (nasstatus.faa.gov): US airport delays and ground
//    stops, also through the relay. The FAA has no public flight-number
//    search; this is the airport-level part it does publish.
// Only the flight number (and nothing about the visitor) is sent.
'use strict';

// Common airlines: two-character IATA code -> three-letter ICAO code.
// Flights broadcast the ICAO form (UA123 flies as "UAL123").
const AIRLINES = {
  AA: 'AAL', UA: 'UAL', DL: 'DAL', WN: 'SWA', B6: 'JBU', AS: 'ASA', NK: 'NKS', F9: 'FFT', G4: 'AAY', HA: 'HAL',
  SY: 'SCX', MX: 'MXY', QX: 'QXE', OO: 'SKW', YX: 'RPA', '9E': 'EDV', MQ: 'ENY', OH: 'JIA', YV: 'ASH', PT: 'PDT',
  ZW: 'AWI', C5: 'UCA', G7: 'GJS', XP: 'CXP', AC: 'ACA', WS: 'WJA', PD: 'POE', AM: 'AMX', Y4: 'VOI', VB: 'VIV',
  BA: 'BAW', VS: 'VIR', LH: 'DLH', AF: 'AFR', KL: 'KLM', EI: 'EIN', IB: 'IBE', LX: 'SWR', OS: 'AUA', SK: 'SAS',
  AY: 'FIN', TK: 'THY', EK: 'UAE', QR: 'QTR', EY: 'ETD', NH: 'ANA', JL: 'JAL', KE: 'KAL', CX: 'CPA', QF: 'QFA',
  NZ: 'ANZ', SQ: 'SIA', CM: 'CMP', AV: 'AVA', LA: 'LAN', '5X': 'UPS', FX: 'FDX',
};

// Read what a person typed: "UA123", "ua 123", "UAL123", "DL-1234",
// "UA0123", or a plain callsign such as a tail number "N405MW".
// Returns { callsign, iata, label } or null when it cannot be a flight.
function parseFlightNumber(text) {
  const s = String(text || '').toUpperCase().replace(/[\s\-_.]/g, '');
  if (!s || s.length > 8 || !/^[A-Z0-9]+$/.test(s)) return null;
  let m = s.match(/^([A-Z]{3})0*(\d{1,4}[A-Z]?)$/);
  if (m) {
    const iata = Object.keys(AIRLINES).find(k => AIRLINES[k] === m[1]);
    return { callsign: m[1] + m[2], iata: iata ? iata + m[2] : '', label: (iata ? iata + m[2] + ' / ' : '') + m[1] + m[2] };
  }
  m = s.match(/^([A-Z0-9]{2})0*(\d{1,4}[A-Z]?)$/);
  if (m && /[A-Z]/.test(m[1])) {
    const icao = AIRLINES[m[1]];
    // Unknown two-character prefix: keep exactly what was typed (it may be
    // a tail number like N10023, whose zeros matter).
    if (!icao) return { callsign: s, iata: s, label: s, unknownAirline: true };
    return { callsign: icao + m[2], iata: m[1] + m[2], label: m[1] + m[2] + ' / ' + icao + m[2], unknownAirline: false };
  }
  // Anything else that looks like a callsign (letters then digits/letters).
  if (/^[A-Z][A-Z0-9]{2,7}$/.test(s) && /\d/.test(s)) return { callsign: s, iata: '', label: s };
  return null;
}

const RELAY = 'https://proxy.cors.dev/';
// Live-position providers, tried in order; each answers the readsb
// "v2" format ({ ac: [...] } or { aircraft: [...] }).
const LIVE_PROVIDERS = [
  { name: 'adsb.lol', url: cs => RELAY + 'https://api.adsb.lol/v2/callsign/' + encodeURIComponent(cs) },
  { name: 'adsb.lol (direct)', direct: true, url: cs => 'https://api.adsb.lol/v2/callsign/' + encodeURIComponent(cs) },
  { name: 'adsb.fi (direct)', direct: true, url: cs => 'https://opendata.adsb.fi/api/v2/callsign/' + encodeURIComponent(cs) },
];
function routeUrl(callsign) { return 'https://api.adsbdb.com/v0/callsign/' + encodeURIComponent(callsign); }
const FAA_STATUS_URL = RELAY + 'https://nasstatus.faa.gov/api/airport-status-information';

// Pick the matching aircraft from a provider answer: same callsign, has
// a position, freshest position first.
function tidyAircraft(data, callsign) {
  const list = (data && (data.ac || data.aircraft)) || [];
  const want = String(callsign || '').toUpperCase();
  const hits = list.filter(a => String(a.flight || '').trim().toUpperCase() === want && Number.isFinite(a.lat) && Number.isFinite(a.lon))
    .sort((x, y) => (x.seen_pos || 0) - (y.seen_pos || 0));
  const a = hits[0];
  if (!a) return null;
  const onGround = a.alt_baro === 'ground';
  return {
    callsign: String(a.flight).trim(), hex: a.hex || '', reg: a.r || '', type: a.t || '', desc: a.desc || '',
    lat: a.lat, lon: a.lon, onGround,
    altFt: onGround ? 0 : (Number.isFinite(a.alt_baro) ? a.alt_baro : (Number.isFinite(a.alt_geom) ? a.alt_geom : null)),
    speedKt: Number.isFinite(a.gs) ? a.gs : null,
    trackDeg: Number.isFinite(a.track) ? a.track : (Number.isFinite(a.true_heading) ? a.true_heading : null),
    vertFpm: Number.isFinite(a.baro_rate) ? a.baro_rate : (Number.isFinite(a.geom_rate) ? a.geom_rate : null),
    squawk: a.squawk || '', emergency: a.emergency && a.emergency !== 'none' ? a.emergency : '',
    seenPosS: Number.isFinite(a.seen_pos) ? a.seen_pos : (Number.isFinite(a.seen) ? a.seen : null),
  };
}

// adsbdb answer -> { airline, callsign, iata, origin, destination } or null.
function tidyRoute(data) {
  const r = data && data.response && data.response.flightroute;
  if (!r) return null;
  const ap = x => x && Number.isFinite(x.latitude) && Number.isFinite(x.longitude) ? { iata: x.iata_code || '', icao: x.icao_code || '', name: x.name || '', city: x.municipality || '', country: x.country_iso_name || '', lat: x.latitude, lon: x.longitude } : null;
  return { airline: (r.airline && r.airline.name) || '', callsign: r.callsign_icao || r.callsign || '', iata: r.callsign_iata || '', origin: ap(r.origin), destination: ap(r.destination) };
}

// Does a route plausibly belong to where the plane is now? The plane
// should sit roughly between the two airports: going via the plane may
// add at most a third of the trip plus 300 km. (Route data is the flight
// number's usual route and can be out of date.)
function kmBetween(a, b) {
  const R = 6371, r = d => d * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function routeMatches(route, plane) {
  if (!route || !plane || !route.origin || !route.destination) return true;
  const direct = kmBetween(route.origin, route.destination);
  const via = kmBetween(route.origin, plane) + kmBetween(plane, route.destination);
  return via <= direct * 1.33 + 300;
}

// FAA NAS Status XML -> notes for the given US airport codes (3-letter,
// e.g. "ORD"). General-aviation-only closure notices are left out.
function faaNotes(xml, codes) {
  const want = new Set((codes || []).filter(Boolean).map(c => String(c).toUpperCase()));
  const out = [];
  const text = String(xml || '');
  const blocks = text.split('<Delay_type>').slice(1);
  const pick = (s, tag) => { const m = s.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>')); return m ? m[1].trim() : ''; };
  for (const b of blocks) {
    const kind = pick(b, 'Name');
    const items = b.split(/<(?:Program|Ground_Delay|Delay|Airport)>/).slice(1);
    for (const it of items) {
      const arpt = pick(it, 'ARPT');
      if (!want.has(arpt)) continue;
      const reason = pick(it, 'Reason');
      if (/CLSD TO NON SKED TRANSIENT GA/i.test(reason)) continue;
      let detail = '';
      if (/Ground Stop/i.test(kind)) detail = 'until ' + pick(it, 'End_Time');
      else if (/Ground Delay/i.test(kind)) detail = 'average ' + pick(it, 'Avg') + ', up to ' + pick(it, 'Max');
      else if (/Arrival\/Departure/i.test(kind)) { const t = (it.match(/Type="([^"]+)"/) || [])[1] || 'Delay'; detail = t.toLowerCase() + 's ' + pick(it, 'Min') + '–' + pick(it, 'Max') + (pick(it, 'Trend') ? ', ' + pick(it, 'Trend').toLowerCase() : ''); }
      else if (/Closure/i.test(kind)) detail = 'reopens ' + pick(it, 'Reopen');
      out.push({ airport: arpt, kind, reason, detail: detail.replace(/\s+/g, ' ').trim() });
    }
  }
  return out;
}
// FAA codes are the 3-letter ones; for US airports that is the IATA code.
function faaCode(airport) { return airport && airport.country === 'US' && airport.iata ? airport.iata : ''; }

function compass(deg) {
  if (!Number.isFinite(deg)) return '';
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return names[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}
function describeAltitude(p) {
  if (p.onGround) return 'on the ground';
  if (!Number.isFinite(p.altFt)) return 'altitude unknown';
  return Math.round(p.altFt).toLocaleString('en-US') + ' ft';
}
function describeSpeed(kt) { return Number.isFinite(kt) ? Math.round(kt) + ' kt (' + Math.round(kt * 1.15078) + ' mph)' : 'speed unknown'; }
function describeClimb(fpm) {
  if (!Number.isFinite(fpm) || Math.abs(fpm) < 300) return 'level';
  return (fpm > 0 ? 'climbing ' : 'descending ') + Math.abs(Math.round(fpm / 10) * 10).toLocaleString('en-US') + ' ft/min';
}
function describeSeen(s) {
  if (!Number.isFinite(s)) return 'just now';
  if (s < 5) return 'just now';
  if (s < 90) return Math.round(s) + ' seconds ago';
  return Math.round(s / 60) + ' minutes ago';
}

// Full-detail pages elsewhere, for schedules, gates and arrival times.
function flightLinks(parsed, hex) {
  const cs = parsed.callsign, iata = (parsed.iata || '').toLowerCase();
  const out = [
    { label: 'FlightAware', url: 'https://www.flightaware.com/live/flight/' + encodeURIComponent(cs) },
    { label: 'Flightradar24', url: 'https://www.flightradar24.com/data/flights/' + encodeURIComponent(iata || cs.toLowerCase()) },
  ];
  if (hex) out.push({ label: 'adsb.lol live map', url: 'https://adsb.lol/?icao=' + encodeURIComponent(hex) });
  return out;
}

const REFRESH_MS = 20000;

const flightApi = { AIRLINES, parseFlightNumber, LIVE_PROVIDERS, RELAY, routeUrl, FAA_STATUS_URL, tidyAircraft, tidyRoute, routeMatches, kmBetween, faaNotes, faaCode, compass, describeAltitude, describeSpeed, describeClimb, describeSeen, flightLinks, REFRESH_MS };
if (typeof module !== 'undefined' && module.exports) module.exports = flightApi;
if (typeof window !== 'undefined') window.FindItFlights = flightApi;
