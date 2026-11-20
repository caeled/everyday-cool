# Collection origin

Original Everyday Cool workshop, proposed for the collection on 14 November 2026 at Steven Powell's request ("I want to add an astronomy Cool to that git. You can use our 'tonight's sky' maybe a mouse movable night sky and other such coollnesses"). Built by Grok Bot (AI assistant) and proposed by pull request for Steven's review; it is not a copy of an upstream project, and this folder is the maintained original.

Reused work: the astronomy math is a JavaScript port of Steven's Skywatch (`programs/sky.py` in https://github.com/caeled/bordeom , commit 3891b439a16b8879e65ac4bb997486cf8722d562, "Add sky.py (Skywatch)"). Ported: Schlyter orbital elements, Moon perturbations, the Jupiter/Saturn great inequality, precession, planet magnitudes, compass and twilight words, the red night-vision idea, a selection of the deep-sky list, and self-test cases. The port adds heliocentric perturbations (also Uranus), Moon parallax, matrix-based star rendering, and rise/set scanning. sky.py itself is not copied into this folder.

Added at Steven's request during the same session: SpaceX satellite tracking (Starlink and Dragon) with the ISS, and a radio astronomy section.

Author-supplied file: `downloads/backyard-radio-telescope-plan.pdf`, supplied by Steven Powell on 14 November 2026 and shipped byte-for-byte unchanged (SHA-256 in `../../provenance/tonights-sky.json`). It is a 4-page staged plan (Stage 0 inventory; Stage 1 hydrogen-line first light with a 1420 MHz feed, SAWbird+ H1 LNA, RTL-SDR Blog V4, ezRA/VIRGO/SDR++; Stage 2 baselines and logging; Stage 3 OnStep/stepper tracking with hamlib rotctld; Stage 4 stretch goals; safety; budget about $200–$420). Plan prepared November 4, 2026, with Muse. The dish, the mount, and the idea are the family's. The workshop links a related Facebook post, "See the dish coming down": https://www.facebook.com/photo?fbid=10244026378851229&set=a.1174251832908 (external; may require a Facebook login).

Third-party data and code are listed in `THIRD-PARTY.md`. The page sends nothing and stores nothing; the only network request is the optional "Refresh orbits" button (CelesTrak).

Banner added November 15, 2026: tonights-sky-banner.jpg (AI/robots theme), part of the collection-wide banner pass.

Link added November 16, 2026: the satellite explainer points to the sister room Satellite Watch (general satellite tracking), which reuses this room's satpass.js, astro.js and satellite.js and links back here and to the radio telescope plan.

Documentation update (20 November 2026): at Steven Powell's direction, `index.html` gained a professional Documentation & source panel with the room README, GitHub source, sources and limitations, workshop download, collection documentation index, and curator profile link. Changed files: `index.html`, `COLLECTION.md`. The addition is documentation and navigation only; no lesson content or workshop behaviour was changed.
