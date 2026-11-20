# The Radio Room

An Everyday Cool workshop about online radio: a retro wooden radio that really plays, a shelf of everywhere radio lives on the internet, and a short workshop on how the different kinds of listening work.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for The Radio Room.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/radio-room)

## What's inside

- **The radio** — an old wooden cabinet set, styled in pure CSS: wood, a glowing amber tuning dial with a sliding needle, cream push-button presets, a speaker grille, a tuning knob, and a volume knob. It plays **SomaFM** live streams in a plain HTML5 audio element inside the cabinet. Six presets (Groove Salad, Lush, Secret Agent, Illinois Street Lounge, Left Coast 70s, Boot Liquor), each laid out on a make-believe FM dial (88–108); selecting one slides the needle, updates the dial-window readout, and plays. Stop button, plain error reporting if a stream fails, and nothing is saved — no station, volume, or listening record is kept. Every stream address was verified live (HTTP 200 from SomaFM's Icecast servers) on 17 November 2026.
- **The Scanner Tuner** — a smaller wooden box under the radio: a finder for Broadcastify scanner feeds, not a player. "Use my location" (browser geolocation, named by OpenStreetMap's Nominatim) and a ZIP/town box (Nominatim search) resolve the visitor's county and open that county's own Broadcastify page, where Broadcastify's player plays the feeds; a Browse Broadcastify button opens the front door directly. All 88 Ohio county links are baked in, read from Broadcastify's own Ohio page on 17 November 2026, and are used only when the lookup says the place is in Ohio — a county name that also exists in another state never opens an Ohio page. An Ohio county without a baked link falls back to Broadcastify's Ohio page, and anywhere else to its front door. No Broadcastify API is used and no scanner audio plays on this page — Broadcastify's developer terms offer no embeddable route, so the tuner walks the listener to their front door and says so plainly on the panel. The panel and Help also carry a short US caveat: listening to unencrypted public-safety radio is generally legal; cellular and encrypted traffic are off-limits; some states restrict scanners in vehicles.
- **The listening shelf** — eight groups, verified live on 17–18 November 2026: Music, made for you (Pandora, iHeartRadio, Spotify Free, YouTube Music); Real stations, live online (Audacy — with a note that it was formerly Radio.com — iHeart Live Radio, TuneIn, myTuner, Radio Garden); Talk, news & public radio (NPR, BBC Sounds, CBC Listen); Scanners & live feeds (Broadcastify, OpenMHz, with the delay note and the US listening caveat); Real radios you can tune (WebSDR, KiwiSDR, with a tie to Tonight's Sky's radio astronomy); Ham radio & CB; Clubs; Old-time & archive (Internet Archive old-time radio, SomaFM). The big services link out — they need their own accounts and licences and cannot be embedded.
- **Ham radio & CB — the two-way side** (added 18 November 2026) — a shelf group for the radios you talk back on: a plain-language explainer (ham = exam, call sign, worldwide reach, repeaters and satellites; CB = no individual license, 40 channels, a few miles, the truckers' band; both two-way, unlike everything else in the room, with a bridge to Everyday Electronics' receive-only crystal radio), six verified links (ARRL's What is Ham Radio, QRZ.com, RepeaterBook, RadioReference, and the FCC's own Amateur Radio Service and Citizens Band pages), and a "Cool stations to try" list of eight: the University of Twente WebSDR as the live starting receiver, UVB-76 "The Buzzer" at 4625 kHz, WWV/WWVH at 5/10/15 MHz, CHU Canada at 3330/7850/14670 kHz, WBCQ at 7.490 MHz plus its own stream, the ISS amateur downlink at 145.800 MHz (linked to Satellite Watch for pass times, with the VHF-receiver and ten-minute-pass notes — not to an HF-only receiver directory), the BBC World Service's shortwave presence (no frequency printed — seasonal, read off the Twente dial labels), and a far-side-of-the-planet KiwiSDR pick via the public map. A companion group, **Clubs — the people side**, follows it: the ARRL's Find a Club search, which works for any ZIP or town.
- **Build one — the crystal radio bench** (card added 19 November 2026) — a card after the Ham & CB group sending builders straight to the crystal radio bench in Everyday Electronics (`#crystal-bench`): the working tuner, the schematic that agrees with the build plan, and the one-transistor amplifier — the receive-only ancestor of the two-way world, alive on a bench.
- **How radio works here** — a brief plain-language workshop: a station stream (one live broadcast for everyone) vs. a personalized service like Pandora (a private playlist built from a library) vs. a scanner feed (real public radio relayed by volunteers); why scanner feeds are sometimes delayed (travel time, and sometimes a deliberate delay — interesting, not instant, never an emergency service); a short US listening caveat; and what WebSDR is (a real, shared software-defined radio you can tune).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the retro player, presets & the tuning knob, the shelf & why some services link out, scanners & delays, the scanner tuner, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Tonight's Sky (the radio sky), Satellite Watch (passes, including the space station), Everyday Electronics (the crystal-radio workbench, which links back here), Everyday Physics, and A Library (the reading shelf — which links back here). The Games Room is the shape cousin: shelf + one playable thing + workshop.

## Run it

Open `index.html` in a browser. The streams and every shelf destination need the internet — radio is live. The Help and workshop text are part of the page and stay readable once loaded.

## Tests

```
node test.cjs
```

The rules (the preset list, dial maths, station lookup, the tuning knob's walk, the dial readout, and the Scanner Tuner's county map and state-checked fallback rules) live in `radio.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that a baked Ohio county link is used only when the state is Ohio, and that a shared county name in another state opens Broadcastify's front door instead.

## Files

- `index.html` — the room itself
- `radio.js` — pure rules: presets, dial maths, readouts, and the Scanner Tuner's Ohio county map and target rules
- `app.js` — the player wiring: presets, needle, knobs, audio, error reporting — plus the Scanner Tuner's location/ZIP lookups
- `style.css` — the room's styling, including the whole retro cabinet (wood, dial glow, needle, grille, knobs)
- `radio-room-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
