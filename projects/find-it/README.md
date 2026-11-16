# Find It

An Everyday Cool workshop for travellers: set a place, tap one big category button, and get the nearest matches on a live map, each with directions.

## What's inside

- **Where are you?** — a working OpenStreetMap map (drawn by Leaflet) that opens on Defiance, Ohio. A **Find me** button centres it on the visitor's own location with the device's permission, and a ZIP code / town box geocodes through OpenStreetMap's Nominatim service — the same pattern as the Map Room. The footer states plainly what each step does with location data.
- **What do you need?** — 23 big tappable category buttons in five groups (Eat & drink, Health, Car & road, Sleep & outdoors, Everyday needs): Coffee, Salad / healthy food, Diner / breakfast, Fast food, Groceries, Pharmacy, Hospital, Urgent care / clinic, Dentist, Gas station, EV charging, Rest stop, Auto repair / tire, Hotel / motel, Campground, Library, Park / playground, Fitness center, Laundromat, ATM / bank, Post office, Hardware store, Public restroom. Category search runs against the Overpass API around the map centre (about 5 miles / 8 km), drops pins, and lists results nearest first with straight-line distance, address when OpenStreetMap has one, and **Directions** buttons handing off to Google Maps directions (OpenStreetMap routing as the alternative).
- **Help** — a documentation section in the page: the three steps, Find me privacy, what to do when nothing is found, how distances work, fixing a wrong or missing place on OpenStreetMap, and an honest "needs the internet" note.
- **Help menu** — the header's **Help ▾** menu opens that documentation directly (how Find Me works, ZIP / town entry, picking a category, reading pins and the list, the Directions hand-off, privacy — location is never stored — and the internet-needed notes), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister room:** the Map Room. Find It links to it, and the Map Room links back here.

## Run it

Open `index.html` in a browser. The map, place search, category search, and directions all need the internet (map tiles, Leaflet, Nominatim, and Overpass load from their public services). The Help section is part of the page and stays readable once loaded.

## Tests

```
node test.cjs
```

The rules (category list, Overpass query building, distances, result tidying, directions links) live in `findit.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `findit.js` — pure rules: categories, queries, distances, results
- `app.js` — the map, find-me, place search, and category search wiring
- `style.css` — the room's styling (shared base with the Map Room, plus the big category buttons)
- `find-it-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
