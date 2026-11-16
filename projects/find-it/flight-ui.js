// Find It flight tracker: type a flight number, see the plane on the
// same map. Rules and providers live in flights.js; this file is only the
// page wiring. It shares the page's map and fetchJson from app.js.
'use strict';
(() => {
  const FL = window.FindItFlights;
  const form = document.getElementById('flight-form');
  if (!FL || !form) return;
  const input = document.getElementById('flight-input');
  const statusEl = document.getElementById('flight-status');
  const infoEl = document.getElementById('flight-info');
  const stopBtn = document.getElementById('flight-stop');
  const tell = m => { statusEl.textContent = m; };
  let layer = null, run = 0, timer = null, tracking = null, directBlocked = false, faaCache = null;

  function planeIcon(deg) {
    // A simple plane outline pointing north, turned to the track.
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" style="transform:rotate(' + (Number.isFinite(deg) ? deg : 0) + 'deg)"><path fill="#d9480f" stroke="#fff" stroke-width="1" d="M12 2c.8 0 1.3.9 1.3 2v5.2l7.7 4.6v2l-7.7-2.4v4.7l2.2 1.7v1.6L12 20.4l-3.5 1v-1.6l2.2-1.7v-4.7L3 15.8v-2l7.7-4.6V4c0-1.1.5-2 1.3-2z"/></svg>';
    return L.divIcon({ className: 'plane-icon', html: svg, iconSize: [30, 30], iconAnchor: [15, 15] });
  }

  // Ask each live provider in turn, with a short time limit. Direct calls
  // are skipped for the rest of the visit once the browser has refused
  // them (no CORS header), so a refresh costs one request.
  // The relay is sometimes slow to reach adsb.lol, so a second request
  // is sent if the first has not answered in 3 s; the first answer wins.
  async function viaRelay(p, callsign) {
    let done = false;
    const one = delay => new Promise((res, rej) => setTimeout(() => (done ? rej(new Error('done')) : fetchJson(p.url(callsign), { credentials: 'omit' }, 8000).then(res, rej)), delay));
    try { const data = await Promise.any([one(0), one(3000)]); done = true; return data; }
    catch (e) { done = true; throw e; }
  }
  async function livePosition(callsign) {
    for (const p of FL.LIVE_PROVIDERS) {
      if (p.direct && directBlocked) continue;
      try {
        const data = p.direct ? await fetchJson(p.url(callsign), { credentials: 'omit' }, 6000) : await viaRelay(p, callsign);
        return { provider: p.name, plane: FL.tidyAircraft(data, callsign), answered: true };
      } catch (e) { if (p.direct && e instanceof TypeError) directBlocked = true; }
    }
    return { answered: false };
  }

  async function faaFor(codes) {
    if (!codes.length) return [];
    try {
      if (!faaCache || Date.now() - faaCache.at > 120000) {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 7000);
        const res = await fetch(FL.FAA_STATUS_URL, { signal: ctl.signal, credentials: 'omit' }).finally(() => clearTimeout(t));
        if (!res.ok) throw new Error('faa ' + res.status);
        faaCache = { at: Date.now(), xml: await res.text() };
      }
      return FL.faaNotes(faaCache.xml, codes);
    } catch { return null; }
  }

  function row(dl, k, v) { if (!v) return; const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); }
  function airportText(a) { return a ? (a.iata || a.icao) + ' — ' + (a.city || a.name) : ''; }

  function draw(parsed, route, live, faa) {
    if (!map) return;
    if (layer) layer.remove();
    layer = L.layerGroup().addTo(map);
    const pts = [];
    const o = route && route.origin, d = route && route.destination, p = live && live.plane;
    if (o) { L.circleMarker([o.lat, o.lon], { radius: 6, color: '#2b6cb0' }).addTo(layer).bindTooltip('From ' + airportText(o)); pts.push([o.lat, o.lon]); }
    if (p) pts.push([p.lat, p.lon]);
    if (d) { L.circleMarker([d.lat, d.lon], { radius: 6, color: '#2f855a' }).addTo(layer).bindTooltip('To ' + airportText(d)); pts.push([d.lat, d.lon]); }
    if (pts.length > 1) L.polyline(pts, { color: '#d9480f', weight: 2, dashArray: '6 6', interactive: false }).addTo(layer);
    if (p) L.marker([p.lat, p.lon], { icon: planeIcon(p.trackDeg), keyboard: false }).addTo(layer).bindTooltip(p.callsign + ' · ' + FL.describeAltitude(p));
    return pts;
  }

  function showInfo(parsed, route, live, faa, routeOk) {
    infoEl.innerHTML = ''; infoEl.hidden = false;
    const dl = document.createElement('dl'); dl.className = 'flight-facts';
    const p = live && live.plane;
    row(dl, 'Flight', parsed.label + (route && route.airline ? ' · ' + route.airline : ''));
    if (route && (route.origin || route.destination)) row(dl, routeOk === false ? 'Route on file' : 'Usual route', airportText(route.origin) + '  →  ' + airportText(route.destination) + (routeOk === false ? ' — does not match where the plane is now, so it is probably out of date and is not drawn' : ''));
    if (p) {
      row(dl, 'Altitude', FL.describeAltitude(p) + (p.onGround ? '' : ', ' + FL.describeClimb(p.vertFpm)));
      row(dl, 'Speed', p.onGround ? FL.describeSpeed(p.speedKt) + ' on the ground' : FL.describeSpeed(p.speedKt));
      if (Number.isFinite(p.trackDeg)) row(dl, 'Heading', Math.round(p.trackDeg) + '° (' + FL.compass(p.trackDeg) + ')');
      row(dl, 'Aircraft', [p.desc || p.type, p.reg].filter(Boolean).join(', '));
      row(dl, 'Position seen', FL.describeSeen(p.seenPosS) + ' via ' + live.provider);
      if (p.emergency) row(dl, 'Emergency code', p.emergency);
    }
    if (faa && faa.length) for (const n of faa) row(dl, 'FAA: ' + n.airport, n.kind.replace(/ Programs?$/, '') + ' — ' + n.reason + (n.detail ? ' (' + n.detail + ')' : ''));
    else if (faa && route && routeOk !== false && (FL.faaCode(route.origin) || FL.faaCode(route.destination))) row(dl, 'FAA airport status', 'No delays or ground stops posted for ' + [FL.faaCode(route.origin), FL.faaCode(route.destination)].filter(Boolean).join(' or ') + '.');
    infoEl.appendChild(dl);
    const links = document.createElement('p'); links.className = 'place-links';
    links.append(document.createTextNode('Schedule, gate and arrival time: '));
    for (const l of FL.flightLinks(parsed, p && p.hex)) { const a = document.createElement('a'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = l.label + ' ↗'; links.appendChild(a); }
    infoEl.appendChild(links);
  }

  function stop(msg) {
    clearTimeout(timer); timer = null; tracking = null; stopBtn.hidden = true;
    if (msg) tell(msg);
  }

  async function update(first) {
    const t = tracking; if (!t) return;
    const myRun = t.run;
    if (first) tell('Looking up ' + t.parsed.label + '…');
    let [routeRes, live] = await Promise.all([
      t.route !== undefined ? Promise.resolve(t.route) : fetchJson(FL.routeUrl(t.parsed.callsign), { credentials: 'omit' }, 7000).then(FL.tidyRoute).catch(() => null),
      livePosition(t.parsed.callsign),
    ]);
    if (!tracking || tracking.run !== myRun) return;
    t.route = routeRes;
    // A refresh that could not get through keeps the last position on
    // screen (marked as older) instead of making the plane vanish.
    let stale = false;
    if (live.answered && live.plane) t.last = { live, at: Date.now() };
    else if (!live.answered && t.last) { live = { ...t.last.live, plane: { ...t.last.live.plane, seenPosS: (t.last.live.plane.seenPosS || 0) + (Date.now() - t.last.at) / 1000 } }; stale = true; }
    // The route on file is the flight number's usual one; if the plane is
    // clearly somewhere else, it is out of date for today, so say so and
    // do not draw it.
    const routeOk = !routeRes || !live.plane || FL.routeMatches(routeRes, live.plane);
    const shownRoute = routeOk ? routeRes : null;
    const codes = shownRoute ? [FL.faaCode(shownRoute.origin), FL.faaCode(shownRoute.destination)].filter(Boolean) : [];
    const faa = await faaFor(codes);
    if (!tracking || tracking.run !== myRun) return;
    const pts = draw(t.parsed, shownRoute, live, faa) || [];
    showInfo(t.parsed, routeRes, live, faa, routeOk);
    const p = live.plane;
    if (p) {
      if (first && map) { map.fitBounds(pts.length > 1 ? pts : [[p.lat, p.lon], [p.lat, p.lon]], { padding: [40, 40], maxZoom: 8 }); document.getElementById('leaflet-map').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      if (stale) tell('Could not refresh just now — showing the last position, heard ' + FL.describeSeen(p.seenPosS) + '. Trying again in ' + FL.REFRESH_MS / 1000 + ' s.');
      else tell((p.onGround ? t.parsed.label + ' is on the ground' : t.parsed.label + ' is in the air') + ' — ' + FL.describeAltitude(p) + ', ' + FL.describeSpeed(p.speedKt) + '. Updating every ' + FL.REFRESH_MS / 1000 + ' s while this page is open.');
    } else {
      if (first && map && pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 8 });
      if (!live.answered) tell('The live-position services did not answer just now, so the plane is not on the map. ' + (routeRes ? 'Its usual route is shown. ' : '') + 'Trying again in ' + FL.REFRESH_MS / 1000 + ' s; the links below have full details.');
      else if (routeRes) tell(t.parsed.label + ' is not broadcasting a position right now — it may be on the ground, not flying at this hour, or over an ocean out of receiver range. Its usual route is shown; checking again every ' + FL.REFRESH_MS / 1000 + ' s.');
      else tell('No flight ' + t.parsed.label + ' is in the air right now, and no route is on file for it. Check the number (for example UA123 or DAL1234), or try the links below.');
    }
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (!tracking) return;
    // Only refresh while the page is visible; stop after an hour.
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - tracking.started > 3600000) { stop('Stopped updating after an hour. Press Track to start again.'); return; }
    timer = setTimeout(() => update(false), FL.REFRESH_MS);
  }
  document.addEventListener('visibilitychange', () => {
    if (!tracking) return;
    if (document.visibilityState === 'visible') update(false); else clearTimeout(timer);
  });

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const parsed = FL.parseFlightNumber(input.value);
    if (!parsed) { tell('Type a flight number like UA123, DL 1234 or AAL250 — the airline code, then the number.'); return; }
    stop();
    tracking = { parsed, run: ++run, started: Date.now(), route: undefined };
    stopBtn.hidden = false;
    update(true);
  });
  stopBtn.addEventListener('click', () => { stop('Stopped tracking. The last position stays on the map.'); });
})();
