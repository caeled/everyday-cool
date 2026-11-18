# The Radio Room

An Everyday Cool workshop about online radio: a retro wooden radio that really plays, a shelf of everywhere radio lives on the internet, and a short workshop on how the different kinds of listening work.

## What's inside

- **The radio** — an old wooden cabinet set, styled in pure CSS: wood, a glowing amber tuning dial with a sliding needle, cream push-button presets, a speaker grille, a tuning knob, and a volume knob. It plays **SomaFM** live streams in a plain HTML5 audio element inside the cabinet. Six presets (Groove Salad, Lush, Secret Agent, Illinois Street Lounge, Left Coast 70s, Boot Liquor), each laid out on a make-believe FM dial (88–108); selecting one slides the needle, updates the dial-window readout, and plays. Stop button, plain error reporting if a stream fails, and nothing is saved — no station, volume, or listening record is kept. Every stream address was verified live (HTTP 200 from SomaFM's Icecast servers) on 17 November 2026.
- **The Scanner Tuner** — a smaller wooden box under the radio: a finder for Broadcastify scanner feeds, not a player. A preset button opens Defiance County, Ohio (this room's home county); "Use my location" (browser geolocation, named by OpenStreetMap's Nominatim) and a ZIP/town box (Nominatim search) resolve the visitor's county and open that county's own Broadcastify page, where Broadcastify's player plays the feeds. All 88 Ohio county links are baked in, read from Broadcastify's own Ohio page on 17 November 2026; an Ohio county without a baked link falls back to Broadcastify's Ohio page, and anywhere else to its front door. No Broadcastify API is used and no scanner audio plays on this page — Broadcastify's developer terms offer no embeddable route, so the tuner walks the listener to their front door and says so plainly on the panel.
- **The listening shelf** — 18 checked links in six groups, all verified live on 17 November 2026: Music, made for you (Pandora, iHeartRadio, Spotify Free, YouTube Music); Real stations, live online (Audacy — with a note that it was formerly Radio.com — iHeart Live Radio, TuneIn, myTuner, Radio Garden); Talk, news & public radio (NPR, BBC Sounds, CBC Listen); Scanners & live feeds (Broadcastify, OpenMHz, with the plain note that feeds are public broadcasts and can be delayed); Real radios you can tune (WebSDR, KiwiSDR — with a brief, factual tie to Steven's dad, a ham radio operator since 1956, and to Tonight's Sky's radio astronomy); Old-time & archive (Internet Archive old-time radio, SomaFM). The big services link out — they need their own accounts and licences and cannot be embedded.
- **How radio works here** — a brief plain-language workshop: a station stream (one live broadcast for everyone) vs. a personalized service like Pandora (a private playlist built from a library) vs. a scanner feed (real public radio relayed by volunteers); why scanner feeds are sometimes delayed (travel time, and sometimes a deliberate delay — interesting, not instant, never an emergency service); and what WebSDR is (a real, shared software-defined radio you can tune).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the retro player, presets & the tuning knob, the shelf & why some services link out, scanners & delays, the scanner tuner, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Tonight's Sky (the radio sky) and A Library (the reading shelf — which links back here). The Games Room is the shape cousin: shelf + one playable thing + workshop.

## Run it

Open `index.html` in a browser. The streams and every shelf destination need the internet — radio is live. The Help and workshop text are part of the page and stay readable once loaded.

## Tests

```
node test.cjs
```

The rules (the preset list, dial maths, station lookup, the tuning knob's walk, the dial readout, and the Scanner Tuner's county map and fallback rules) live in `radio.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `radio.js` — pure rules: presets, dial maths, readouts, and the Scanner Tuner's Ohio county map and target rules
- `app.js` — the player wiring: presets, needle, knobs, audio, error reporting — plus the Scanner Tuner's location/ZIP lookups
- `style.css` — the room's styling, including the whole retro cabinet (wood, dial glow, needle, grille, knobs)
- `radio-room-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
