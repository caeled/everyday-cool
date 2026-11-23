# Tonight's Sky

The sky is a giant clock. Drag it around, run time forward, and find out which lights you can go outside and see tonight.

An Everyday Cool astronomy workshop by Steven Powell, built with AI assistance (Grok Bot) and reviewed through a pull request. For curious kids (about 9 and up with a grown-up, older on their own), families, and classrooms.

## Try this

Open `index.html` in a browser, or double-click `Launch.cmd` on Windows.

1. **The sky dome.** Drag with a mouse or finger to look around; scroll or pinch to zoom; click a star, planet, the Moon, or a satellite for an info card (distance, how long its light took, rise and set times). Pick a place (Columbus, Ohio by default; ten others from the Arctic to Sydney) or type a latitude and longitude. "Use my location" asks your browser only if you press it. Choose a night and slide the time, or press **Now**. A time-lapse shows the sky turning, or jumps one night at a time to show the Moon and planets wandering. Layers: constellation lines and names, star names, binocular treasures, alt/az grid, celestial equator, ecliptic, 2-hour star trails, satellites, radio eyes, solid ground, daylight, and a red night-vision mode.
2. **What's up tonight:** sunset, darkness and sunrise, the Moon's phase, and the bright planets, stars and treasures above the horizon.
3. **Why do the stars move?** Star trails around Polaris, and what changes on the equator.
4. **The planets' road:** the ecliptic, and night-after-night motion.
5. **Moon phases:** a top-down Sun–Earth–Moon diagram with a slider.
6. **Old light:** how long light takes to reach you from the Moon, the planets, stars and the Andromeda Galaxy.
7. **Your latitude:** the height of Polaris equals your latitude; visit the equator, the Arctic and Australia.
8. **Satellites:** the International Space Station, SpaceX Starlink (the newest launch group, a sample, or the whole fleet after a refresh) and SpaceX Dragon when one is flying free. Upcoming passes list rise, highest point and set times, directions, maximum elevation, and whether you can see it (sunlit while you are in the dark).
9. **Radio astronomy:** a simulated "radio eyes" sky, an electromagnetic-spectrum slider, a 21 cm hydrogen-line Doppler and galaxy-rotation demo, why radio dishes are huge (resolution) and a two-dish interferometer, synthesized pulsar "clicks", the stories of Jansky, Reber, Bell Burnell and the Wow! signal (recorded by Ohio State's Big Ear), and links for starting out.
   - **Download: Build your own backyard radio telescope** (`downloads/backyard-radio-telescope-plan.pdf`, 4 pages). A family plan for turning a salvaged DIRECTV dish (about 0.8 m) into a receive-only 21 cm hydrogen-line telescope, in stages: inventory; first light with a 1420 MHz feed, SAWbird+ H1 LNA, RTL-SDR Blog V4 and free software (ezRA, VIRGO, SDR++) drift-scanning the Sun, the Milky Way and Cassiopeia A; baselines and logging; motor tracking (OnStep, hamlib rotctld); stretch goals. Safety notes and a ballpark budget of about $200–$420. Receive-only, so no licence is needed. A dish this size detects the hydrogen line and the Milky Way's structure and measures the Sun; it will not image galaxies. Plan prepared November 4, 2026, with Muse. The dish, the mount, and the idea are the family's. See the dish coming down (Facebook post, external, may require a login): https://www.facebook.com/photo?fbid=10244026378851229&set=a.1174251832908

## Understand it

The learner should come away able to say what moves (the Earth spins, the Earth orbits, the Moon orbits, planets orbit in one plane) and what each motion does to the sky they see. **This is a model.** Stars come from the Yale Bright Star Catalogue (903 stars to magnitude 4.5), shifted for precession. The Sun, Moon and planets come from simplified orbits (Schlyter's elements, Meeus's methods), ported from Steven's Skywatch program; tests compare them with NASA JPL Horizons (planets and Sun within a few hundredths of a degree near 2026, the Moon within about 0.1–0.3°). The Moon includes parallax. Refraction, ΔT, nutation and star motions are left out. Bodies are drawn larger than life. Twilight colours are a sketch. Satellite orbits use SGP4 and fade in accuracy after about 1–2 weeks. Radio pictures, spectra, fringes and sounds are labelled simulations.

## Start and carry it

Plain HTML, CSS and JavaScript: no framework, account, installation, analytics, cookies or storage. Everything works offline from this folder, including the bundled satellite orbits (as of 14 November 2026). Internet is needed only for: the optional **Refresh orbits** button (asks celestrak.org for current orbit lists; CelesTrak sees your internet address like any website, and nothing else is sent), "Use my location" on some browsers (handled by your browser; nothing leaves the page), and external links. The pulsar demo makes sound only when you press a button. Works with mouse, touch and keyboard (arrow keys, + and −, [ and ]). Collection navigation and the relative ZIP link need the complete Everyday Cool package; the workshop also works as a standalone folder.

## Sources and credits

See `THIRD-PARTY.md` for full credits and licences: Yale Bright Star Catalogue (via NASA HEASARC), d3-celestial constellation data (Olaf Frohn, BSD 3-Clause), satellite.js (MIT), CelesTrak orbit data, Schlyter, Meeus, JPL Horizons, and Steven's Skywatch. `COLLECTION.md` records origin and reuse. AI assistance: designed and written by Grok Bot at Steven's request; facts and calculations were checked by the automated tests below and should be reviewed by Steven before inclusion.

## Verify

Development checks (Node.js 18+ and Python 3; not needed to use the workshop):

```
node tests/astro.test.cjs       # Sun, Moon, planets vs JPL Horizons; phases; 2024 eclipse; seasons; rise/set
node tests/satellites.test.cjs  # SGP4 verification vector; 12 ISS passes vs Skyfield; visibility
node tests/radio.test.cjs       # spectrum, resolution, fringes, Doppler, rotation curve, galactic coordinates
python tests/check-package.py   # links, ids, files, only the documented network request, PDF unchanged
```

`tools/build-sky-data.py` rebuilds `sky-data.js` from the downloaded catalogue files (not bundled). Text alternatives: the status line and a text summary under the dome describe what is up; the "What's up tonight" and pass lists are plain buttons.

## Starfield Atlas (added 23 November 2026)

`starfield-atlas.html` is a guest exhibit built by Google Antigravity (Gemini) at Steven Powell's direction, shipped byte-for-byte: a flyable 3D star field whose 59-star catalog uses real J2000 positions and distances, wrapped in 3,200 procedural stars. `starfield-atlas-lesson.html` is its back-door lesson and audit by Muse — the catalog checked star by star against the published catalogues, the controls driven headlessly (picking returned the correct star for all 59), and the bends named: the Crab Pulsar and Cygnus X-1 are drawn rescaled to a ~2,500 ly shell, and 55 Cancri's planet list shows four of its five known planets.

## The Astronomy Wave (added 23 November 2026)

Eight guest exhibits built by Google Antigravity (Gemini) at Steven Powell's direction, shipped byte-for-byte (SHA-256 in `../../provenance/tonights-sky.json`), each with a back-door lesson and audit by Muse beside it: `solar-orrery.html` + `solar-orrery-lesson.html` (periods true to 0.03%; the page's own 44.3° Hohmann window never intercepts Mars), `stellar-evolution.html` + `stellar-evolution-lesson.html` (fusion shells in exact order; three label-level false claims), `exoplanet-transit.html` + `exoplanet-transit-lesson.html` (depth and RV exact; the Eclipsing Binary summary's three numbers all wrong), `cosmology-expansion.html` + `cosmology-expansion-lesson.html` (Friedmann engine exact against independent integrals; redshifts fabricated beyond the particle horizon), `eclipse-tides.html` + `eclipse-tides-lesson.html` (total/annular engine correct; the notes quote perigee/apogee extremes the engine never reaches), `gravitational-lensing.html` + `gravitational-lensing-lesson.html` (lens equation exact to three decimals; displayed mass ~2.2× low, centred SIE magnification bogus), `pulsar-lighthouse.html` + `pulsar-lighthouse-lesson.html` (spin-down and Crab numbers right; glitch banner contradicts the measured jump, three presets wear real names over wrong numbers), `protoplanetary-disk.html` + `protoplanetary-disk-lesson.html` (snow line and resonances exact; gap carving cosmetic; the TRAPPIST-1 preset fails when driven).

## License

Original code: MIT (`LICENSE`). Original educational writing: CC BY 4.0 (`LICENSE-CONTENT.md`). Third-party data and code keep their own terms (`THIRD-PARTY.md`); `vendor/satellite.min.js` is MIT with its own notice. The backyard radio telescope plan PDF is Steven Powell's family document, included with his permission and not relicensed by these notices.
