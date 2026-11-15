# The Map Room

An Everyday Cool workshop about maps and finding your way: a live map, lessons on reading maps and trail skills, and a compass trainer.

## What's inside

- **The live map** — a working OpenStreetMap map (drawn by the Leaflet library) that opens on Defiance, Ohio. A **Find me** button centers it on the visitor's own location with the device's permission, and a ZIP code / town box geocodes through OpenStreetMap's Nominatim service. The footer states plainly what each button does with location data.
- **Useful Maps** — the teaching shelf: reading a map (legend, scale bar, north arrow, contour lines) and trail skills (orienting the map, taking a bearing, pace counting, the return bearing), written for kids and families, Scouts included.
- **Build a Map** — inside Useful Maps: open a CSV of pins and plot them (rows sharing a `group` connect in file order as a path; `close: yes` closes the shape into a polygon), open a PDF and plot every decimal-degree coordinate pair its text contains, or click the map to drop draggable pins joined by a measured trail. Pins export back to CSV, and a Print button prints the map with its pin list. Files are read locally in the browser and never uploaded. A sample CSV, `sample-square.csv`, draws a closed square over Defiance, Ohio from its four compass-named corners.
- **The compass-rose trainer** — the page names a direction and the visitor taps its point on the rose; eight main points by default, all sixteen on request. Right answers name the opposite point, the way back.

## Run it

Open `index.html` in a browser. The live map, Find me, and place search need the internet (map tiles, the Leaflet library, and Nominatim are loaded from their public services). The lessons and the compass trainer work offline.

## Tests

```
node test.cjs
```

The trainer's rules (the sixteen points, bearing arithmetic, opposites, turns, scoring, target picking) live in `compass.js`, and the Build-a-Map rules (CSV parsing, coordinate extraction, grouping and closing, distances, CSV export) live in `maptools.js`, both with no DOM code, so Node can check them directly. The tests include the shipped `sample-square.csv`: it must parse into one closed shape with its four corners connected in order.

## Files

- `index.html` — the room itself
- `compass.js` — pure trainer rules
- `maptools.js` — pure Build-a-Map rules
- `app.js` — the map, find-me, place search, trainer, and Build-a-Map wiring
- `style.css` — the room's styling
- `map-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `sample-square.csv` — the downloadable sample: a closed square over Defiance
- `test.cjs` — rule tests
