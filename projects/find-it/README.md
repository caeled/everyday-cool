# Find It

An Everyday Cool workshop for travellers: set a place, tap one big category button, and get the nearest matches on a live map, each with directions.

## What's inside

- **Where are you?** — a working OpenStreetMap map (drawn by Leaflet) that opens on Defiance, Ohio. A **Find me** button centres it on the visitor's own location with the device's permission, and a ZIP code / town box geocodes through OpenStreetMap's Nominatim service — the same pattern as the Map Room. The footer states plainly what each step does with location data.
- **What do you need?** — 23 big tappable category buttons in five groups (Eat & drink, Health, Car & road, Sleep & outdoors, Everyday needs): Coffee, Salad / healthy food, Diner / breakfast, Fast food, Groceries, Pharmacy, Hospital, Urgent care / clinic, Dentist, Gas station, EV charging, Rest stop, Auto repair / tire, Hotel / motel, Campground, Library, Park / playground, Fitness center, Laundromat, ATM / bank, Post office, Hardware store, Public restroom. Category search runs against the Overpass API around the map centre (about 5 miles / 8 km), drops pins, and lists results nearest first with straight-line distance, address when OpenStreetMap has one, and **Directions** buttons handing off to Google Maps directions (OpenStreetMap routing as the alternative).
- **Find me, fast and honest** — the map moves on the device's first answer (a quick Wi-Fi/network fix, or a recent one), then keeps sharpening with a precise fix for up to 20 seconds or until it is within about 100 m; a blue ring shows the accuracy. The last good spot is kept in the open tab for 10 minutes so a second Find me is instant. If the device stays silent for 6 seconds or cannot locate, a keyless town-level guess from the internet connection (geojs.io, then ipwho.is) is used and labelled as rough. If the visitor says no, nothing else runs on its own; the ZIP box and an opt-in **Use a rough guess** button remain.
- **Search that keeps working** — each Overpass server gets a 10-second limit; one that has not answered in 4 seconds gets the next mirror asked alongside it, and if none has answered within 5 seconds (or all are busy) one Nominatim backup search runs for the common categories. The first good list wins.
- **Website and social links** — when OpenStreetMap volunteers recorded a place's website, Facebook, Instagram, X, TikTok, Mastodon, Yelp or Tripadvisor page, phone or opening hours, they appear under the result. They come in the same answer, so no extra look-up is made and nothing is sent.
- **Help** — a documentation section in the page: the three steps, Find me privacy, what to do when nothing is found, how distances work, fixing a wrong or missing place on OpenStreetMap, and an honest "needs the internet" note.
- **Help menu** — the header's **Help ▾** menu opens that documentation directly (how Find Me works, ZIP / town entry, picking a category, reading pins and the list, the Directions hand-off, privacy — location is remembered only in the open tab for up to 10 minutes and never saved or sent elsewhere — and the internet-needed notes), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister room:** the Map Room. Find It links to it, and the Map Room links back here.

## Run it

Open `index.html` in a browser. The map, place search, category search, and directions all need the internet (map tiles, Leaflet, Nominatim, and Overpass load from their public services). The Help section is part of the page and stays readable once loaded.

## Tests

```
node test.cjs
```

The rules (category list, Overpass query building and mirror failover, find-me fix ranking, backup search, place links, distances, result tidying, directions links) live in `findit.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `findit.js` — pure rules: categories, queries, distances, results
- `app.js` — the map, find-me, place search, and category search wiring
- `style.css` — the room's styling (shared base with the Map Room, plus the big category buttons)
- `find-it-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
