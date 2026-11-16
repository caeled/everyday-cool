# Sources & limitations

## Bundled material

- **satellite.js 5.0.0** (`vendor/satellite.min.js`) — SGP4/SDP4 orbit propagation, MIT License, © 2013 Shashwat Kandadai and UCSC, https://github.com/shashwatak/satellite-js; see `vendor/satellite-js-LICENSE.md`. Copied unchanged from Tonight's Sky.
- **`satpass.js`, `astro.js`** — original Everyday Cool code (MIT) from Tonight's Sky, copied unchanged: pass finding and the Sun's position (astro.js is a port of Steven Powell's Skywatch).
- **`tle-snapshot.js`** — orbital elements from CelesTrak (https://celestrak.org/), GP data, fetched on the date written in the file. CelesTrak's data is derived from US Space Force tracking and is offered free for public use; credit: CelesTrak.
- All lesson/Help text and other code are original work for this room (code MIT, lessons CC BY 4.0).

## Loaded / called at view time (not bundled)

- **CelesTrak GP data** — `https://celestrak.org/NORAD/elements/gp.php` for a family (GROUP), a NORAD number (CATNR) or a name (NAME). At most once per family every two hours per browser, as CelesTrak asks.
- **Leaflet 1.9.4** — map library from the unpkg CDN with pinned integrity hashes. BSD 2-Clause, © Vladimir Agafonkin and contributors.
- **OpenStreetMap tiles** — map pictures from the OpenStreetMap Foundation's tile servers. Map data © OpenStreetMap contributors, ODbL.
- **Nominatim** — OpenStreetMap's search service, for a typed ZIP code or town: one search per button press.
- **geojs.io / ipwho.is** — free, keyless town-level guesses from the internet connection, asked only when Find me cannot get an answer from the device.

## Limitations

Positions are as good as the orbit data: a TLE a few days old usually places a satellite within a few kilometres along its path; after a week or two the error grows, and satellites that fire engines (the ISS, Starlink, newly launched ones) move off their published orbit until new data appears. Pass times are worked out for the place you give, with a 0° horizon and no refraction, and "visible to the eye" uses a simple Earth-shadow model and a Sun at least 6° below your horizon — real brightness also depends on the satellite's size and angle. Very high satellites (GPS, BeiDou's high orbits) move slowly and rarely "pass" in the usual sense. Big families are sampled for drawing until Show all is pressed. CelesTrak sometimes lists no recent launches; the bundled snapshot then uses the newest catalogue numbers instead and says so. Descriptions were written on 16 November 2026; each linked service's own pages are the authority.
