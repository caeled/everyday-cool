# External sources

This repository links to recordings and does not distribute their video/audio files.

Google DeepMind: https://deepmind.google/the-podcast/ ; public RSS https://feeds.simplecast.com/JT6pbPkg . Download availability does not itself grant public redistribution rights.

MIT OpenCourseWare: Patrick H. Winston, 6.034 Artificial Intelligence, Lecture 12A (recorded 2015); Russ Tedrake, 6.832 Underactuated Robotics, Spring 2009, Lectures 1 and 11. Publisher terms: CC BY-NC-SA 3.0.

ESO Europe to the Stars: https://www.eso.org/public/videos/europe_stars_full/ . CC BY-ND 4.0. Keep the complete film and credits unchanged when using the publisher download.

Original educational material is CC BY 4.0; application code is MIT. These licenses do not relicense third-party recordings or works in the linked notebook. Keep their publisher terms and credits.

The SNES Console (`the-snes-console.html`) embeds two upstream works, unmodified, in `emulatorjs-snes/` — 49 files, 6,568,395 bytes; the folder's own note is `emulatorjs-snes/VENDORED.md`. Full provenance and audit receipts are in `the-snes-console-lesson.html`.

EmulatorJS 4.2.3 (the frontend): official npm package `@emulatorjs/emulatorjs@4.2.3`; its `data/` tree is vendored byte-identical (`data/loader.js`: 7,594 bytes, sha256 69e0903bf1e2f62ced78895e7e511fa26e11316f7eb734925c35e919ba1287b2). The production pair the npm package does not ship — `data/emulator.min.js` (426,343 bytes, sha256 6aec3fd7bb2721255801b0a6af02e47e78b05e28a1822b1f213aacbd348abaee) and `data/emulator.min.css` (25,630 bytes, sha256 16406c60b2dc3b04ae9b115e308613e6f567a0cc7068e21d9d0c1e5030fb395e) — was taken unmodified from the project's official CDN at the matching version path, https://cdn.emulatorjs.org/4.2.3/data/. License: GPL-3.0, carried verbatim at `emulatorjs-snes/LICENSE-emulatorjs-gpl-3.0.txt` (sha256 a617fab6d251b3302b1cb2c1c94f52d1c584f6fcb2fc218ec1a475bc08053a61).

Snes9x (the core): official npm package `@emulatorjs/core-snes9x@4.2.3`; build report `data/cores/reports/snes9x.json` (core "snes9x", built 2025-06-14; sha256 dc7ac963eb7935a7ac78956235ac0b8912ec785c57026336825aa2ed8031b3ad). Payloads in `data/cores/`: `snes9x-wasm.data` (1,093,765 bytes, sha256 eaa0bcfce67673809886e50387a80a616b719502175db64c090d04c9d75958ee), `snes9x-legacy-wasm.data` (1,092,437 bytes, sha256 7d427a575cefad98ff400493fa1d7e892da63fe7bab68979babd9cea0bfaaf3b), `snes9x-thread-wasm.data` (1,156,908 bytes, sha256 a42f3e39f4608ef65edaf7f803f1245bab9103c19417dbc3e4d00c5b09861bb4), `snes9x-thread-legacy-wasm.data` (1,154,882 bytes, sha256 ff42e32210825eeb4fe270b2bb88723f98b48f7abaa3f263d4d2b82496c256d7). License: Snes9x is freeware for personal, non-commercial use under its own terms; its license text is carried verbatim at `emulatorjs-snes/LICENSE-snes9x.txt` (sha256 70efeee282d82a6e9d26aeed5466d08c632369858371dc6a4644c8dcedc2be78), verified byte-identical to the license embedded inside each core payload and to the LICENSE in the upstream Snes9x repository. "SNES" and "Super Nintendo" are trademarks of Nintendo, used descriptively; Nintendo had nothing to do with the console page.
