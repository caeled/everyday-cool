# Flynn's Arcade — An Oldtimers Room for the Young

Twenty cabinets under one neon sign, built in a single night (21 November 2026)
for Flynn and David Powell, and dedicated to them. Every cabinet opens a drawer
with its story, the lesson it teaches by doing, how to play, and a house note —
and a **Play** button that takes you to the game itself.

## The twenty stops

- **Energy in Motion** — Breakout, Tempest, Frogger, Pinball, Gravity Golf
- **The Grid & Reflex Row** — Asteroids, Tron Light Cycles, Space Invaders, Defender
- **Systems, Soup & Flight Lab** — Bit & Byte (Robot Daemon Scroller), the Paper
  Airplane Builder & Flight Simulator, the Primordial Soup Simulator, AI Karts,
  and From the Future, a reading cabinet about prediction and feedback loops
- **The Card Table** — Solitaire with its Counting Table of honest odds, and the
  Tarot of the AIs (all 78 cards, with a lesson on patterns, symbols,
  information theory, and chunking)
- **By the door** — the Arcade Bulletin Board: 28 real link pins, growing one
  pin at a time
- **The BBS Door Games Wing** — Crossroads of the AIs (the 1992 Major BBS door
  game *Crossroads of the Elements*, reskinned: four AI patrons, combat-only XP,
  dual weapon/power levels with a combined cap of 30) and Infinity Complex
  (the 1988 Steve Neal door; Master Control; the fractal lesson — the same
  level reflected at a different scale)
- **The No-Quest Wandering Hub** — no quest, no score: portals to workshops and
  back, a world that grows one loadable module at a time

House verdicts on record: Defender "perfect," Tempest "exactly what it should
be," Solitaire "perfect." First-shot leaderboard: *Flynn: 1 try.*

## Install it (PWA)

Open `index.html` from any HTTPS host (the Everyday Cool site serves it) and
use the browser's **Install** / **Add to Home Screen** option. The room carries
a web app manifest (`manifest.webmanifest`), icons (`icons/`), and a service
worker (`sw.js`) that precaches the whole room, so after the first visit the
arcade also works offline. Game pages load Google Fonts when online and fall
back to system fonts when not.

## Files

- `index.html` — the hub room (20 cabinets, drawers, wings, leaderboard, lore)
- `games/` — the nineteen playable pages, one per cabinet with a standalone game
- `assets/arcade-banner.webp` — the arcade banner photograph (AI-generated)
- `manifest.webmanifest`, `sw.js`, `icons/` — the PWA machinery
- `COLLECTION.md`, `THIRD-PARTY.md` — where it came from and what it uses
