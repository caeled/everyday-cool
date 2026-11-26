# Collection origin

Original Everyday Cool workshop, proposed for the collection on 14 November 2026 at Steven Powell's request ("I want to add an astronomy Cool to that git. You can use our 'tonight's sky' maybe a mouse movable night sky and other such coollnesses"). Built by Grok Bot (AI assistant) and proposed by pull request for Steven's review; it is not a copy of an upstream project, and this folder is the maintained original.

Reused work: the astronomy math is a JavaScript port of Steven's Skywatch (`programs/sky.py` in https://github.com/caeled/bordeom , commit 3891b439a16b8879e65ac4bb997486cf8722d562, "Add sky.py (Skywatch)"). Ported: Schlyter orbital elements, Moon perturbations, the Jupiter/Saturn great inequality, precession, planet magnitudes, compass and twilight words, the red night-vision idea, a selection of the deep-sky list, and self-test cases. The port adds heliocentric perturbations (also Uranus), Moon parallax, matrix-based star rendering, and rise/set scanning. sky.py itself is not copied into this folder.

Added at Steven's request during the same session: SpaceX satellite tracking (Starlink and Dragon) with the ISS, and a radio astronomy section.

Author-supplied file: `downloads/backyard-radio-telescope-plan.pdf`, supplied by Steven Powell on 14 November 2026 and shipped byte-for-byte unchanged (SHA-256 in `../../provenance/tonights-sky.json`). It is a 4-page staged plan (Stage 0 inventory; Stage 1 hydrogen-line first light with a 1420 MHz feed, SAWbird+ H1 LNA, RTL-SDR Blog V4, ezRA/VIRGO/SDR++; Stage 2 baselines and logging; Stage 3 OnStep/stepper tracking with hamlib rotctld; Stage 4 stretch goals; safety; budget about $200–$420). Plan prepared November 4, 2026, with Muse. The dish, the mount, and the idea are the family's. The workshop links a related Facebook post, "See the dish coming down": https://www.facebook.com/photo?fbid=10244026378851229&set=a.1174251832908 (external; may require a Facebook login).

Third-party data and code are listed in `THIRD-PARTY.md`. The page sends nothing and stores nothing; the only network request is the optional "Refresh orbits" button (CelesTrak).

Banner added November 15, 2026: tonights-sky-banner.jpg (AI/robots theme), part of the collection-wide banner pass.

Link added November 16, 2026: the satellite explainer points to the sister room Satellite Watch (general satellite tracking), which reuses this room's satpass.js, astro.js and satellite.js and links back here and to the radio telescope plan.

Documentation update (20 November 2026): at Steven Powell's direction, `index.html` gained a professional Documentation & source panel with the room README, GitHub source, sources and limitations, workshop download, collection documentation index, and curator profile link. Changed files: `index.html`, `COLLECTION.md`. The addition is documentation and navigation only; no lesson content or workshop behaviour was changed.

Guest exhibit added 23 November 2026: `starfield-atlas.html`, built by Google Antigravity (Gemini) at Steven Powell's direction and shipped byte-for-byte unchanged (SHA-256 in `../../provenance/tonights-sky.json`), with `starfield-atlas-lesson.html`, its back-door lesson and audit by Muse. The audit recovered every catalog star's RA/Dec from the page's own 3D coordinates exactly, found 51 of 59 distances within 4% of the published values, and drove the controls headlessly — picking returned the correct star for all 59 catalog stars. Named bends, printed in the lesson: the Crab Pulsar and Cygnus X-1 are drawn rescaled to ~2,500 ly while their data cards keep the true distances; 55 Cancri's note claims a 5-planet system while its planet list shows four; Barnard's Star shows one of its four confirmed planets.

Astronomy Wave added 23 November 2026: eight guest exhibits built by Google Antigravity (Gemini) at Steven Powell's direction, shipped byte-for-byte unchanged (SHA-256 in `../../provenance/tonights-sky.json`), each with its back-door lesson and audit by Muse: `solar-orrery.html`, `solar-orrery-lesson.html`, `stellar-evolution.html`, `stellar-evolution-lesson.html`, `exoplanet-transit.html`, `exoplanet-transit-lesson.html`, `cosmology-expansion.html`, `cosmology-expansion-lesson.html`, `eclipse-tides.html`, `eclipse-tides-lesson.html`, `gravitational-lensing.html`, `gravitational-lensing-lesson.html`, `pulsar-lighthouse.html`, `pulsar-lighthouse-lesson.html`, `protoplanetary-disk.html`, `protoplanetary-disk-lesson.html`. Every audit drove the shipped code headlessly. Headline findings, printed in the lessons: the orrery's periods are true to 0.03% but a probe launched at its own 44.3° Hohmann window never intercepts Mars; the cosmology Friedmann engine matches independent integrals while redshifts beyond the particle horizon are fabricated; the lensing equation is exact to three decimals but its displayed lens mass is ~2.2× low; the pulsar glitch banner announces ~10⁻⁶ while the measured jump is +0.8%; the disk's TRAPPIST-1 chain merges into a single body when driven. `index.html` gained the wave as a featured block under the Starfield Atlas, and `README.md` records the wave.

Cross-link (24 November 2026): `index.html` gained one sentence in "08 / Spacecraft overhead" pointing to the new Everyday Physics exhibit `../everyday-physics/rocketry-thrust.html` (Rocketry & Thrust — the rocket equation, the Δv to orbit, and why the station keeps missing the Earth). Navigation only; no sky behaviour changed. Changed files: `index.html`, `COLLECTION.md`.

## Backyard Radio Telescope Plan — Rev 2 page · 25 November 2026

The plan grew a page of its own: `backyard-radio-telescope.html` carries the complete Rev 2 text (Rev 1: 4 November 2026, prepared with Muse; Rev 2 engineering edition: 25 November 2026, prepared by Steven Powell with Google Antigravity — the offset-angle, buried-coax DC and spillover traps, exact biquad and cantenna feed blueprints, bandpass calibration, Doppler rotation science, and the honest correction that Cassiopeia A waits for Stage 4), topped by `backyard-radio-telescope-banner.webp` (Steven's commission: the dish, the laptop showing the H I peak at 1420.405 MHz, and the telescope under the Milky Way; generated with Muse's image tools — the wooden sign's dates in the artwork are the image model's invention, not the family's record, and Steven kept the image as made). `downloads/backyard-radio-telescope-plan-rev2.pdf` is the printable Rev 2 (rendered from the page); the Rev 1 `downloads/backyard-radio-telescope-plan.pdf` stays in place as the historical original and is linked from the page as such. The download card in `index.html` now points to the page and carries Rev 2 facts (Stage 1 ~$125–$195, 18° × 25° beam, Cas A deferred to Stage 4); Space Camp, Satellite Watch and the Radio Room link the page too, and the hub/catalog wording changed from "download" to "read" the plan. Changed files: `backyard-radio-telescope.html`, `backyard-radio-telescope-banner.webp`, `downloads/backyard-radio-telescope-plan-rev2.pdf`, `index.html`, `COLLECTION.md`.


## 2026-11-25 — Is the Earth Flat? (Steven's original, Muse build)

New: `is-the-earth-flat.html` (the game: five classic proofs benched, deflection deck, Final Experiment finale) and `is-the-earth-flat-lesson.html` (the audit: 25/25 checks, every figure recomputed independently, full play-through driven through the real controls). `index.html` gained the game's card at the head of the grid. Designed by Steven Powell from the public arguments; built by Muse.

Intro added 2026-11-25: Steven\u2019s own words on assumption-as-map now open `is-the-earth-flat.html` as the designer\u2019s note, verbatim at his standing rule.
## Hear the Hydrogen Line — companion exhibit · 25 November 2026

New original exhibit, built by Grok Bot at Steven Powell's request ("Can You do both That and Hear the Hydrogen Line") and proposed by pull request for review: `hydrogen-line.html` with its back-door lesson `hydrogen-line-lesson.html` and banner `hydrogen-line-banner.webp` (drawn for the page with code — an SVG scene of a dish, the Milky Way and a spectrum, rendered to WebP; no third-party or AI-generated imagery). Five benches: the hydrogen spin flip (f₀ = 1420.405751768 MHz, λ ≈ 21.106 cm, hν = 5.87 µeV, A₁₀ = 2.8843 × 10⁻¹⁵ s⁻¹); a Doppler tuner (radio convention v = c·(f₀ − f)/f₀, positive = receding, compared with the optical and relativistic definitions); a pretend dish swept along galactic longitude over a toy face-on Galaxy, with simulated spectra and seeded radiometer noise for 0.8 m, 3 m and 25 m dishes and a pencil beam, plus an uncorrected-motion slider for the LSR lesson; the tangent-point method building the rotation curve (R₀ = 8.2 kpc after Bland-Hawthorn & Gerhard 2016; V₀ = 230 km/s, rounded from Eilers et al. 2019; flat curve as a stated simplification, Kepler curve for contrast); and a backyard-dish calculator (beam ≈ 70°·λ/D, ΔT = T_sys/√(Bτ), the Sun at an assumed 50 sfu, Cassiopeia A at ≈ 1,700 Jy). One marked core (`HI-CORE`) drives the page and runs sixteen proofs live; `tests/hydrogen-line.test.cjs` runs the same core in Node and checks it agrees with `radio.js` (same R₀, V₀ and f₀). The page loads nothing from the network, keeps browser zoom, and honours reduced motion. No personal details. `index.html` gained a companion card in "09 / Radio astronomy" and one onward line in the hydrogen card; `backyard-radio-telescope.html` gained a companion-exhibit button (inside the print-hidden downloads row) and a footer link — navigation only, plan text unchanged, and `downloads/backyard-radio-telescope-plan-rev2.pdf` was not re-rendered. Changed files: `hydrogen-line.html`, `hydrogen-line-lesson.html`, `hydrogen-line-banner.webp`, `tests/hydrogen-line.test.cjs`, `index.html`, `backyard-radio-telescope.html`, `README.md`, `COLLECTION.md`.

Merge pass (2026-11-25): PR #11 merged into a main that had moved (Is the Earth Flat?). Count syncs: Full Index 431, sitemap 473, Nerd Heaven shelf 165 with `sw.js` at nerd-heaven-v55, Java heading at one hundred sixty-four. `hydrogen-line.html`: Doppler slider wiring fixed under Steven\u2019s sanction (one line; hash chain in the lesson) and the \u201CHear it for real\u201D PICTOR reference section added at his direction. `hydrogen-line-lesson.html`: merge-pass section records both.

## Addendum — 2026-11-25 (late): Cas A figure corrected

`backyard-radio-telescope.html`: the Cas A flux was corrected from the 1960s-epoch ~2,400 Jy to
~1,700 Jy today (the source fades ~0.7% a year), and the derived dish warming from ~0.3 K to ~0.2 K,
matching the Hydrogen Line lesson's own figure. `hydrogen-line-lesson.html`'s parenthetical about
the plan's figure was updated to record the correction. Steven's call, executed under his green
light on the whole Bench board.

## Addendum — 2026-11-26: Touch directions pass

`is-the-earth-flat.html` gained an "On a touch screen:" line in its Help (every bench is
buttons and sliders — the whole game plays by tap), part of the collection-wide pass Steven
asked for on 2026-11-25.

## Addendum — 2026-11-26: The fence sign tells the truth now

`backyard-radio-telescope-banner.webp` was edited in place (an image edit, everything else in
the scene untouched): the wooden sign's invented dates — "For Grandpa — 1954–2023", which the
image model made up — now read "For Grandpa Henry / WA6ZMV · since 1956 / We finally listened
to the stars". Henry Douglas Powell, WA6ZMV, was a ham from 1956 until his death in 2006; the
sign now carries his callsign and his real start year instead of invented ones. Verified by
reading the edited sign at full zoom before shipping.


Forum link (26 November 2026): `index.html` gained the collection's Join our Forum line (Steven's Google Group — anyone may ask to join, members post), the feedback door he asked to have everywhere.
