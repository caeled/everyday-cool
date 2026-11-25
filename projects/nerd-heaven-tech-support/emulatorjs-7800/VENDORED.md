# emulatorjs-7800/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The 7800 Console* page
(`../the-7800-console.html`) runs completely offline — no CDN, no runtime
downloads. The receipts — versions, sources, and sha256 for every payload —
are in `../the-7800-console-lesson.html`.

## What's here

- `data/` — the **EmulatorJS 4.2.3** frontend data folder, from the official
  npm package `@emulatorjs/emulatorjs@4.2.3`, plus two files the npm package
  does not ship — `data/emulator.min.js` and `data/emulator.min.css` — taken
  unmodified from the project's own CDN at the matching version path
  (`https://cdn.emulatorjs.org/4.2.3/data/…`). EmulatorJS is GPL-3.0;
  its license is `LICENSE-emulatorjs-gpl-3.0.txt` beside this file.
- `data/cores/` — the **ProSystem** core payloads from the official npm
  package `@emulatorjs/core-prosystem@4.2.3` (core built 2025-06-14):
  `prosystem-wasm.data`, `prosystem-legacy-wasm.data`,
  `prosystem-thread-wasm.data`, `prosystem-thread-legacy-wasm.data`, and
  `reports/prosystem.json`. ProSystem is the Atari 7800 emulator by
  Brian Berlin and Greg Stanton, carried into libretro; it is GPL-2.0, and
  its license — fetched verbatim from the core's own repository, because
  the npm package ships no license file — is
  `LICENSE-prosystem-gpl-2.0.txt` beside this file.

## The configuration fact that matters

The console page points EmulatorJS at this local folder
(`EJS_pathtodata = "emulatorjs-7800/data/"`). It never uses the EmulatorJS
CDN at runtime. If a core file were missing, upstream code would *try* the
CDN as a failsafe — with this folder complete, that path is never taken
(the lesson's audit logged every request to prove it).

This core ships a **non-threaded build** and does not appear in the
frontend's requires-threads list — so the page does **not** set
`EJS_threads`, and the console runs on an ordinary page with no
cross-origin isolation requirement. The lesson carries the measurements.
