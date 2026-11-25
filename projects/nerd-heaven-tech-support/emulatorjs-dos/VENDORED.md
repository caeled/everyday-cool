# emulatorjs-dos/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The DOS Console* page
(`../the-dos-console.html`) runs completely offline — once the page itself
has been served by a server that is allowed to run it (see the threads note
below). The receipts — versions, sources, and sha256 for every file — are
in `../the-dos-console-lesson.html`.

## What's here

- `data/` — the **EmulatorJS 4.2.3** frontend data folder, from the official
  npm package `@emulatorjs/emulatorjs@4.2.3`, plus two files the npm package
  does not ship — `data/emulator.min.js` and `data/emulator.min.css` — taken
  unmodified from the project's own CDN at the matching version path
  (`https://cdn.emulatorjs.org/4.2.3/data/…`). EmulatorJS is GPL-3.0;
  its license is `LICENSE-emulatorjs-gpl-3.0.txt` beside this file.
- `data/cores/` — the **DOSBox Pure** core payloads from the official npm
  package `@emulatorjs/core-dosbox_pure@4.2.3` (core built 2025-06-14):
  `dosbox_pure-thread-wasm.data`, `dosbox_pure-thread-legacy-wasm.data`,
  and `reports/dosbox_pure.json`. DOSBox Pure — a fork of DOSBox built for
  libretro — is GPL version 2 or later; the GPL-2.0 text embedded inside
  both core payloads is `LICENSE-dosbox-pure-gpl-2.0.txt` beside this file.

## The two configuration facts that matter

The console page points EmulatorJS at this local folder
(`EJS_pathtodata = "emulatorjs-dos/data/"`). It never uses the EmulatorJS
CDN at runtime. If a core file were missing, upstream code would *try* the
CDN as a failsafe — with this folder complete, that path is never taken
(the lesson's audit logged every request to prove it).

DOSBox Pure ships **only threaded builds** — there is no non-threaded
payload in the package. The core therefore needs `SharedArrayBuffer`,
which a browser only exposes on a **cross-origin isolated** page (the
server must send `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`). The console page sets
`EJS_threads = true` and checks for isolation before it boots, and says
so in plain words when the serving host can't provide it. The lesson
carries the full story, with the audit's measurements.
