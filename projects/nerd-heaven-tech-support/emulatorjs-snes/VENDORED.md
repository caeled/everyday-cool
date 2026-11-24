# emulatorjs-snes/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The SNES Console* page
(`../the-snes-console.html`) runs completely offline. The receipts —
versions, sources, and sha256 for every file — are in
`../the-snes-console-lesson.html`.

## What's here

- `data/` — the **EmulatorJS 4.2.3** frontend data folder, from the official
  npm package `@emulatorjs/emulatorjs@4.2.3`, plus two files the npm package
  does not ship — `data/emulator.min.js` and `data/emulator.min.css` — taken
  unmodified from the project's own CDN at the matching version path
  (`https://cdn.emulatorjs.org/4.2.3/data/…`). EmulatorJS is GPL-3.0;
  its license is `LICENSE-emulatorjs-gpl-3.0.txt` beside this file.
- `data/cores/` — the **Snes9x** core payloads from the official npm package
  `@emulatorjs/core-snes9x@4.2.3` (core built 2025-06-14):
  `snes9x-wasm.data`, `snes9x-legacy-wasm.data`, `snes9x-thread-wasm.data`,
  `snes9x-thread-legacy-wasm.data`, and `reports/snes9x.json`.
  Snes9x is freeware for personal, non-commercial use; its license is
  `LICENSE-snes9x.txt` beside this file (byte-identical to the `license.txt`
  embedded inside each core payload and to the LICENSE in the upstream
  Snes9x repository).

## The one configuration fact that matters

The console page points EmulatorJS at this local folder
(`EJS_pathtodata = "emulatorjs-snes/data/"`). It never uses the EmulatorJS
CDN at runtime. If a core file were missing, upstream code would *try* the
CDN as a failsafe — with this folder complete, that path is never taken
(the lesson's audit logged every request to prove it).
