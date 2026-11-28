# Collection origin

Flynn's Arcade was created by Muse (Meta) on 21 November 2026 at Steven
Powell's direction, built as a set of Muse web artifacts ("Spaces") in one
evening session and assembled into this collection the same night at his
order. The hub room and each game were built to Steven's specifications and
carry his verdicts (Defender "perfect," Tempest "exactly what it should be,"
Solitaire "perfect"). Gravity Golf's page is the collection's own
`orbital-gravity-golf.html` from Everyday Physics, included so its cabinet is
playable here too.

Local changes to imported files: the hub `index.html` gained a Play button in
each cabinet drawer wired to the local game pages, PWA head tags, and a
service-worker registration; every game page gained a small "← Flynn's Arcade"
back chip. All other content is as built. The PWA files (`manifest.webmanifest`,
`sw.js`, `icons/icon-192.png`, `icons/icon-512.png`,
`icons/icon-maskable-512.png`) and this paperwork were created for the
collection assembly.

## Files

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `README.md`
- `COLLECTION.md`
- `THIRD-PARTY.md`
- `LICENSE`
- `LICENSE-CONTENT.md`
- `assets/arcade-banner.webp`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/icon-maskable-512.png`
- `games/assets/arcade-banner.webp`
- `games/assets/complex.webp`
- `games/assets/cosmic.webp`
- `games/assets/crossroads-station.webp`
- `games/assets/deepsea.webp`
- `games/assets/haunted.webp`
- `games/assets/hub-valley.webp`
- `games/assets/western.webp`
- `games/ai-karts.html`
- `games/asteroids.html`
- `games/breakout.html`
- `games/bulletin-board.html`
- `games/crossroads.html`
- `games/defender.html`
- `games/frogger.html`
- `games/gin-rummy.html`
- `games/gravity-golf.html`
- `games/infinity-complex.html`
- `games/invaders.html`
- `games/paper-airplane.html`
- `games/pinball.html`
- `games/primordial-soup.html`
- `games/robot-daemon-scroller.html`
- `games/solitaire.html`
- `games/tarot.html`
- `games/tempest.html`
- `games/tron.html`
- `games/wandering-hub.html`

## Addendum — 2026-11-26: the Energy in Motion survivor pick

Steven picked **Breakout** (2026-11-26, 00:07) to survive the Nov 21 duplication: two
triple-cabinet "Energy in Motion" pages (`games/breakout.html`, `games/tempest.html`,
each bundling Breakout + Tempest + Frogger). The pick landed at the shelf: the hub's
cabinet map now sends the Tempest cabinet to `games/breakout.html` — one roof for the
wing. `games/tempest.html` is **preserved in place** (still shipped and cached): it
uniquely holds the Geometry Lab and the feature-rich Tempest Steven ordered
(parabola web, geometry overlay). The file-level endgame — transplant that Tempest
into the survivor, then retire `games/tempest.html` to a redirect — is boarded on the
Bench as a separate, confirmed step, because it rewrites a page the family plays.
`index.html` changed (one line of the PAGES map).


Forum link (26 November 2026): `index.html` gained the collection's Join our Forum line (Steven's Google Group — anyone may ask to join, members post), the feedback door he asked to have everywhere.


Collection sweep (26 November 2026): `sw.js` cache bumped flynns-arcade-v1 -> flynns-arcade-v2. The v1 cache predated the Breakout pick landing, so returning visitors could be served the pre-pick room — the stale-room class.

## Screen sizes in every cabinet (2026-11-27 evening)

At Steven's direction (size options "across the board" for everything playable), every Flynn's Arcade cabinet
page gained a display-only control block: `games/ai-karts.html`, `games/asteroids.html`, `games/breakout.html`, `games/bulletin-board.html`, `games/crossroads.html`, `games/defender.html`, `games/frogger.html`, `games/gin-rummy.html`, `games/gravity-golf.html`, `games/infinity-complex.html`, `games/invaders.html`, `games/paper-airplane.html`, `games/pinball.html`, `games/primordial-soup.html`, `games/robot-daemon-scroller.html`, `games/solitaire.html`, `games/tarot.html`, `games/tempest.html`, `games/tron.html`, `games/wandering-hub.html`.
Canvas cabinets get SIZE (the stage canvas grows to a 1,480 px working width, choice remembered per cabinet),
FULL SCREEN per stage, and POP OUT (the cabinet in its own window, the room's prose left behind). The two
full-viewport cabinets (Asteroids, Wandering Hub) honestly omit SIZE — they already fill the screen — and the
DOM cabinets (Bulletin Board, Crossroads, Gin Rummy, Solitaire, Tarot) get FULL SCREEN and POP OUT. The block
sizes only canvases at least a quarter the area of the page's largest, so AI Karts' kart-preview minis are never
blown up; its hidden race canvas is pre-sized and opens big. Audited before shipping: a 20-page sweep found the
bar on every page and zero page exceptions; SIZE growth measured on every canvas cabinet (x1.34 to x6.17);
Defender played live at BIG on real keys; Breakout's paddle tracked the mouse at BIG with pixel readback exact
(centroid 210 at 25% across the field, 630 at 75%, on the 840-wide internal field — the same as at normal size).
Full-screen buttons call the standard API; Steven's click is their receipt. Service worker cache bumped in
`sw.js`.
