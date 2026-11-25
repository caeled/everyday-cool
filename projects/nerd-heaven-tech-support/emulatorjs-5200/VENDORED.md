# emulatorjs-5200/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The 5200 Console* page
(`../the-5200-console.html`) runs completely offline — no CDN, no runtime
downloads. The receipts — versions, sources, and sha256 for every payload —
are in `../the-5200-console-lesson.html`.

## What's here

- `data/` — the **EmulatorJS 4.2.3** frontend data folder, from the official
  npm package `@emulatorjs/emulatorjs@4.2.3`, plus two files the npm package
  does not ship — `data/emulator.min.js` and `data/emulator.min.css` — taken
  unmodified from the project's own CDN at the matching version path
  (`https://cdn.emulatorjs.org/4.2.3/data/…`). EmulatorJS is GPL-3.0;
  its license is `LICENSE-emulatorjs-gpl-3.0.txt` beside this file.
- `data/cores/` — the **a5200** core payloads from the official npm
  package `@emulatorjs/core-a5200@4.2.3` (core built 2025-06-14):
  `a5200-wasm.data`, `a5200-legacy-wasm.data`,
  `a5200-thread-wasm.data`, `a5200-thread-legacy-wasm.data`, and
  `reports/a5200.json`. a5200 is the libretro Atari 5200 core built on the
  Atari800 codebase; it is GPL-2.0, and its license — fetched verbatim
  from the core's own repository, because the npm package ships no license
  file — is `LICENSE-a5200-gpl-2.0.txt` beside this file.

## What is deliberately NOT here

The Atari 5200's **BIOS** (`5200.rom`) is Atari firmware. It is not in
this folder, is not bundled with the console, and is never downloaded by
the page: the visitor supplies their own copy through the page's BIOS
slot, it is read locally, and it stays on their machine — the same
bring-your-own rule as the cartridges.

## The configuration fact that matters

The console page points EmulatorJS at this local folder
(`EJS_pathtodata = "emulatorjs-5200/data/"`). It never uses the EmulatorJS
CDN at runtime. If a core file were missing, upstream code would *try* the
CDN as a failsafe — with this folder complete, that path is never taken
(the lesson's audit logged every request to prove it).

This core ships a **non-threaded build** and does not appear in the
frontend's requires-threads list — so the page does **not** set
`EJS_threads`, and the console runs on an ordinary page with no
cross-origin isolation requirement. The lesson carries the measurements.
