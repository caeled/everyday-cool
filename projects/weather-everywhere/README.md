# Weather Everywhere

A portable world-weather workshop for curious kids and adults. Ask, explore, connect.

[Open the workshop](https://caeled.github.io/weather-everywhere/) · [Download ZIP](https://github.com/caeled/weather-everywhere/archive/refs/heads/main.zip) · [Open project on GitHub](https://github.com/caeled/weather-everywhere)

## Start here

Open **index.html** in a modern browser. Copy the entire folder to a USB drive to carry the workshop. No installation, API key, map billing account, build step, or framework is required. JavaScript must be enabled.

On Windows, double-click **Launch.cmd**. It opens the workshop in your default browser. If live requests are blocked when opening local files, use **Serve.cmd** (requires Python 3 already installed), which serves only this folder on localhost:8002. Close its terminal window to stop the server.

## Explore

- **Map room:** bundled Natural Earth world geography, click any coordinate, pan/zoom, enlarged map, 16 named places, exact-coordinate input, three layers, °C/°F, and a month slider.
- **Find a place:** search Open-Meteo's place database by name and choose from the matches, each shown with its region, country, and coordinates, so same-name towns can be told apart. A found place then works like a map pin everywhere coordinates are used, and the Sun & tilt room can choose it too. Nothing is sent until you click Search.
- **Compare places:** twelve-month illustrative temperature profiles, a readable table, and computed day length. These are teaching examples, not station climate normals. No invented profile is supplied for custom coordinates.
- **Antarctica expedition:** jump straight to coast versus South Pole in southern summer. Distinguish seasons from warmth and coast from high interior.
- **Look live:** current model conditions and seven-day model forecasts from Open-Meteo. Explicit source, retrieval time, valid time in UTC, cache labels, error handling, and save to notebook. No live request is sent until you click the button. Coordinates go to the provider; no location permissions are requested. Wind speeds are also described in Beaufort words, next to the numbers.
- **Look back:** the weather on one past day, for any date from 1940 onward, from the Open-Meteo archive (ERA5 reanalysis, a model reconstruction built from observations). Source, date, and retrieval time are shown; days the archive has not reached yet get a plain message, never an invented value. Nothing is sent until you click the button.
- **Opposite weather:** current model conditions for the selected place beside its antipode (through the center of the Earth) or its mirror-latitude point. Most antipodes are open ocean, and the cards say so with coordinates; the point is never moved to a nearer city.
- **Sun & tilt:** a what-if room. Change Earth's tilt from 0 to 45 degrees and watch a place's year of day length change; move a town to a new latitude and keep its name; slide through the days of the year to sunrise, sunset, and day length, with polar day and polar night stated in words. All computed on the device; no internet needed.
- **Weather words:** a plain-language glossary of the words the workshop itself uses. Tap a word in the list, or tap an underlined word inside live and past-day results, and its meaning appears in place. No internet needed.
- **Ripple lab:** warm water, cold water, salinity, and wind; density, indirect heat transport, coastal response, moisture index, controlled playback, single steps, presets, and saved experiments.
- **Cloud maker:** temperature, humidity, mountain height, dew point, approximate cloud base, and parcel cooling.
- **Field missions:** nine curiosity-led challenges, no timers or scores.
- **Notebook:** notes and experiment evidence, local browser storage, JSON export/import, print layout. Export to carry notes to another browser or computer. Storage can be unavailable in local-file or private browsing modes.
- **Go deeper:** NOAA, BAS, NASA Worldview, global atmospheric maps, NWS radar, and source explanations.
- **Quiet skies:** removes automatic lab playback and smooth scrolling. OS reduced-motion settings enable this by default. Keyboard alternatives exist for map clicks; live and lab outcomes are shown as text.

## Offline and live

All core maps, profiles, simulations, missions, and code are local. Online-only links are clearly external. Live forecasts are best-effort: Open-Meteo's free endpoint is for non-commercial use and has limits and no uptime guarantee. Look live reuses a cached forecast for ten minutes; when a request fails, any older saved result is labeled **OFFLINE / SAVED SNAPSHOT** with its dates. It never substitutes an invented forecast.

For a trip with no internet, run **tools/Save-Forecasts.ps1** beforehand. It saves model forecasts for the built-in places into assets/snapshots.js. The workshop will use these only as dated cached snapshots. No helper downloads or runs third-party executables. The core package does not need large videos or downloads: research links open externally on demand.

## Science and limits

Read **SCIENCE.md** for equations, assumptions, source links, and dataset provenance. This is a teaching workshop, not an operational forecast or warning service. The small ocean lab cannot predict AMOC, climate-change thresholds, real rainfall, or a named city's weather. Consult official local weather services for warnings.

## Verify and package

With Node.js and Python installed:

```
node --test tests/science.test.cjs
python tests/check-package.py
```

To produce a fresh portable ZIP, run tools/Build-Package.ps1 or use Python's zipfile module on this folder, excluding .git. Development dependency: Node only for tests; no dependency for the workshop itself.

## Publish

This checkout can be hosted on any static host. Copy all files and preserve structure. GitHub Pages can use the main branch at the repository root.

**tools/Publish-GitHub.ps1** updates `caeled/weather-everywhere` using your existing Git login. It can adopt the remote history when run from a downloaded ZIP while preserving your working files. It does not change login or security settings. Review the destination in the script before running. Publishing the repository does not enable Pages hosting automatically.

## License

Original code, canvas artwork, and helpers: MIT, copyright Steven Powell 2026. Original educational content: CC BY 4.0. Natural Earth: public domain. Open-Meteo forecast data and other external resources retain their own terms. Free reuse and adaptation are welcome under the applicable licenses.


## The Earth Science Wave (added 23 November 2026)

Eight interactive earth-science exhibits built by Google Antigravity (Gemini) at Steven Powell's direction, integrated byte-for-byte into this room and audited by Muse — the shipped code driven headlessly, every claim measured, the lesson printed beside each exhibit. They have their own section at the top of `index.html` ("Earth systems" in the rail):

- `earthquake-seismology.html` / `earthquake-seismology-lesson.html` — PREM ray-tracing within ~1% of IASP91; magnitude is a volume knob and the shadow zone wrongly silences P.
- `tsunami-shoaling.html` / `tsunami-shoaling-lesson.html` — √(g·h) speeds and Green's-law shoaling hold to ~400 m depth, then amplitude saturates near 5 m.
- `atmosphere-coriolis.html` / `atmosphere-coriolis-lesson.html` — calibrated spherical Coriolis physics; the Ferrel cell blows backwards.
- `plate-tectonics.html` / `plate-tectonics-lesson.html` — exact stripe symmetry and slab geometry; the Mid-Atlantic rate is ~2.5× too fast and Midway's age is wrong.
- `glacier-isostasy.html` / `glacier-isostasy-lesson.html` — Airy balance and rebound exact; the advertised forebulge does not exist in the math.
- `volcano-magma-lab.html` / `volcano-magma-lab-lesson.html` — viscosity engine honest at both ends; VEI is a plume-height lookup with no volume in it.
- `climate-radiative-lab.html` / `climate-radiative-lab-lesson.html` — equations exact, calibration broken: the "balanced" pre-industrial preset drifts to +32.3 °C.
- `river-erosion-delta.html` / `river-erosion-delta-lesson.html` — fluvial directions all correct; sediment is created, not conserved, and uplift runs 9× its label.

Reference bank: ~/workspace/your_files/earth-science-four-references_2026-11-23.md (27 sources; 26 curl-verified 200, 1 flagged bot-blocked canonical).
