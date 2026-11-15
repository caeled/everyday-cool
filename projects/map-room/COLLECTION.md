# Collection origin

Original Everyday Cool workshop, added 15 November 2026 at Steven Powell's request. He chose the Map Room to round out the collection hub ("I need one more everyday cool to fill out/balance number of cards as they display") and asked for "a location button that focuses a displayed map on your current location (or enter zip)". The teaching section's title, "Useful Maps", is his. Built by Muse (AI assistant) in the main chat and added directly to the collection at his direction; this folder is the maintained original, and there is no upstream copy.

The live map is OpenStreetMap data drawn by the Leaflet library, both loaded from their public services at view time (nothing is vendored). Find-me uses the browser's geolocation; ZIP and town searches use OpenStreetMap's Nominatim service. The page footer discloses all of this in plain language.

The compass-rose trainer's rules live in `compass.js` (no DOM), checked by `test.cjs`.

Build a Map was added the same day, also at Steven's direction: CSV pin files plotted as markers (with `group` and `close` columns connecting points into paths and closed shapes — his refinement), PDF coordinate hunting via pdf.js, click-to-add draggable pins with a measured trail, CSV export, and printing. Its rules live in `maptools.js`, also checked by `test.cjs`, including a test that reads the shipped `sample-square.csv` itself: four compass-named corners around Defiance (centre 41.2845, -84.3558, ±0.01°) that must come back as one closed shape, corners connected in order. pdf.js 3.11.174 and its worker were verified live on unpkg (HTTP 200) on 15 November 2026.

Banner: `map-banner.jpg`, AI-generated watercolor to Steven's own concept — robots pulling maps off a shelf, some referencing a digital map on a glowing screen, others reading paper maps — generated 15 November 2026 as part of adding this room, in the style of the collection's other banners.

The Keep Going links were each verified live on 15 November 2026 (HTTP 200 to a browser user agent): openstreetmap.org, apps.nationalmap.gov/viewer, the USGS National Map program page, and compassdude.com. The Leaflet 1.9.4 files on unpkg were likewise verified (HTTP 200, and their published SRI hashes recomputed and matched locally before being pinned in `index.html`). USGS topoView (ngmdb.usgs.gov/topoview) answered 403 to a scripted check, so the National Map viewer is linked instead. Nominatim was exercised directly: ZIP 43512 resolves to Defiance, Ohio, which is the map's default view.

Local changes to imported files: none (no files were imported; all files originate here).
