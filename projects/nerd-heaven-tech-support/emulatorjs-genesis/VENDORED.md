# emulatorjs-genesis/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The Genesis Console* page
(`../the-genesis-console.html`) runs completely offline — no CDN, no runtime
downloads. The receipts — versions, sources, and sha256 for every payload —
are in `../the-genesis-console-lesson.html`.

## What's here

- `data/` — the **EmulatorJS 4.2.3** frontend data folder, from the official
  npm package `@emulatorjs/emulatorjs@4.2.3`, plus two files the npm package
  does not ship — `data/emulator.min.js` and `data/emulator.min.css` —
  byte-identical to the copies carried in this room's other EmulatorJS
  racks (sha256 `6aec3fd7…` / `16406c60…`, the project's own CDN files at
  the matching version path). EmulatorJS is GPL-3.0; its license is
  `LICENSE-emulatorjs-gpl-3.0.txt` beside this file.
- `data/cores/` — the **Genesis Plus GX** core payloads from the official
  npm package `@emulatorjs/core-genesis_plus_gx@4.2.3` (core built
  2025-06-14): `genesis_plus_gx-wasm.data` (1,203,661 B, sha256
  `190297a6…`), `genesis_plus_gx-legacy-wasm.data` (1,204,803 B,
  `2a1edeb6…`), `genesis_plus_gx-thread-wasm.data` (1,262,667 B,
  `2455919c…`), `genesis_plus_gx-thread-legacy-wasm.data` (1,263,738 B,
  `988141b1…`), and `reports/genesis_plus_gx.json`.

## The core's license — read it, it's not the GPL

Genesis Plus GX (Charles MacDonald, Eke-Eke, and contributors) is
released under **its own license**, carried verbatim as
`LICENSE-genesis-plus-gx.txt` beside this file — fetched from the core's
own repository, because the npm package names a license file it does not
ship. Its shape, in plain words: redistribution is permitted **only
non-commercially** — the code "may not be sold, nor may it be used in a
commercial product or activity" — with the copyright notices reproduced.
Everyday Cool is a personal, non-commercial shelf, which is the use the
license contemplates; the lesson states the posture in full. (The same
core also emulates the Master System and the Game Gear; those are
future pages, not this one.)

## What is deliberately NOT here

The **Sega CD BIOS** (`bios_CD_U.bin` / `bios_CD_E.bin` /
`bios_CD_J.bin`) is Sega firmware. It is not in this folder, is not
bundled with the console, and is never downloaded by the page: the
visitor supplies their own copy through the page's BIOS slot for the
Sega CD door, it is read locally, and it stays on their machine — the
same bring-your-own rule as the cartridges and the discs. Genesis
cartridges need no BIOS at all.

## The configuration fact that matters

The console page points EmulatorJS at this local folder
(`EJS_pathtodata = "emulatorjs-genesis/data/"`). It never uses the
EmulatorJS CDN at runtime. If a core file were missing, upstream code
would *try* the CDN as a failsafe — with this folder complete, that path
is never taken (the lesson's audit logged every request to prove it).

This core is **not** in the frontend's requires-threads list (that list
is exactly `ppsspp` and `dosbox_pure`) — so the page does **not** set
`EJS_threads`, and the console runs on an ordinary page with no
cross-origin isolation requirement. The lesson carries the measurements.
