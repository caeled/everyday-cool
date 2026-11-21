# Satellite Watch

An Everyday Cool workshop room: every kind of satellite, live on a world map. Pick a family, watch the dots move, tap one for its story, and see when it next flies over you.

## What is in it

- **Satellite families** — a list with a short, kid-friendly blurb for each: Space stations (ISS, Tiangong), Starlink, OneWeb, Weather, GPS, GLONASS, Galileo, BeiDou, Iridium NEXT, Amateur radio, Science (Hubble and friends), Earth observation, Brightest (visible to the eye), and the Last 30 days' launches. Each button shows how many satellites are in the family.
- **Live world map** — OpenStreetMap drawn by Leaflet, with every satellite in the family drawn as a dot on one canvas, updated every 2 seconds (every 8 for very big families). Starlink's 10,000+ satellites start as an even sample of 3,000; **Show all** draws every one. Updates pause while the tab is hidden.
- **Details** — tap a dot (or search) for its name, NORAD catalogue number, family, where it is over, altitude, speed, period, inclination, and how old its orbit data is, plus its ground track for the last 45 and next 95 minutes.
- **Search** — by part of a name or a NORAD number, in the families already loaded, then at CelesTrak. Friendly names work too: ISS, Tiangong, Hubble.
- **Passes over you** — Find me (a quick, town-level device fix; a rough internet-connection guess if the device cannot answer) or a ZIP code / town, then the next passes of the selected satellite in 48 hours: rise, highest point and set times with compass directions, and whether it is visible to the eye (sunlit while your sky is dark).
- **Catch the Pass** — the room's game (`catch-the-pass.html`): call a pass before it flies — its peak elevation and time-to-peak — then watch the umpire rule on the call sheet: inside the round's fair line, CALLED IT FAIR; wide of it, foul by the exact degrees. Its back door (`catch-the-pass-lesson.html`) teaches passes, peak elevation, and angular error, and opens inside the game from a 📖 Lesson pop-up. The game links out to Called It Fair, the scoreboard shelf — the same umpire ethic over baseball and the rest — and that shelf links back. Before it shipped, a headless proof scored a perfect caller at zero error on all six rounds and fouled a 12° miss by exactly 12°.
- **Sister room** — links to [Tonight's Sky](../tonights-sky/index.html) and its backyard radio telescope plan PDF (both in the full collection and the desktop app).
- **Help** — how the orbit data and SGP4 maths work, how to see a satellite with your eyes, why big families are sampled, and privacy.

## Data and how fresh it is

Orbits are two-line element sets (TLEs) from CelesTrak's GP data (`gp.php?GROUP=…&FORMAT=tle`), which allows browser pages to read it (CORS `*`). The page keeps a copy of each family in the browser and asks CelesTrak again only when its copy is older than two hours — CelesTrak updates that often and asks people not to download a group more often (it answers 403 to repeat downloads). If CelesTrak cannot be reached, or asks for a pause, the page uses its saved copy and then `tle-snapshot.js`, a snapshot bundled with the room, so the room works offline. The status line always says which data it is using and how old the selected satellite's orbit is.

`tools/build-snapshot.py` refreshes the snapshot by hand (every satellite for small families, an even sample of 400 Starlink and 160 OneWeb). When CelesTrak's last-30-days list is empty, the snapshot keeps the 120 newest catalogue numbers among active satellites instead, and says so.

## Privacy

Find me and the ZIP box are used only to work out passes, in the open tab. The location is not saved or sent anywhere. A typed place is looked up on OpenStreetMap's Nominatim; only if the device cannot give a location does a free service (geojs.io, then ipwho.is) give a town-level guess. Orbit requests carry nothing about the visitor.

## Run it

Open `index.html` in a browser (or `Launch.cmd` on Windows). The map tiles, Leaflet, fresh orbits, place search and Find me's rough guess need the internet; the families, the bundled orbits and pass predictions work without it once the page and Leaflet are loaded.

## Tests

```
node test.cjs
```

## Files

- `index.html` — the room
- `satwatch.js` — pure rules: families, data addresses and caching policy, TLE parsing, positions, ground tracks, orbit facts, words, sister-room links
- `app.js` — the map, canvas dots, family list, details, search, Find me / ZIP, passes
- `satpass.js`, `astro.js` — pass prediction and Sun position, copied unchanged from Tonight's Sky
- `vendor/satellite.min.js` — satellite.js (SGP4), copied unchanged from Tonight's Sky, MIT
- `tle-snapshot.js` — the bundled CelesTrak snapshot
- `tools/build-snapshot.py` — rebuilds the snapshot (maintainers only)
- `style.css` — Find It's base styling plus the room's additions
- `test.cjs` — rule tests
