# The Map Room

An Everyday Cool workshop about maps and finding your way: a live map, lessons on reading maps and trail skills, and a compass trainer.

## What's inside

- **The live map** — a working OpenStreetMap map (drawn by the Leaflet library) that opens on Defiance, Ohio. A **Find me** button centers it on the visitor's own location with the device's permission, and a ZIP code / town box geocodes through OpenStreetMap's Nominatim service. The footer states plainly what each button does with location data.
- **Useful Maps** — the teaching shelf: reading a map (legend, scale bar, north arrow, contour lines) and trail skills (orienting the map, taking a bearing, pace counting, the return bearing), written for kids and families, Scouts included.
- **The compass-rose trainer** — the page names a direction and the visitor taps its point on the rose; eight main points by default, all sixteen on request. Right answers name the opposite point, the way back.

## Run it

Open `index.html` in a browser. The live map, Find me, and place search need the internet (map tiles, the Leaflet library, and Nominatim are loaded from their public services). The lessons and the compass trainer work offline.

## Tests

```
node test.cjs
```

The trainer's rules (the sixteen points, bearing arithmetic, opposites, turns, scoring, target picking) live in `compass.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `compass.js` — pure trainer rules
- `app.js` — the map, find-me, place search, and trainer wiring
- `style.css` — the room's styling
- `map-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
