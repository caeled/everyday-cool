# Vendored — the SNES Console's Nostalgist engine room

Vendored 2026-11-26 for the SNES engine swap (EmulatorJS → Nostalgist),
at Steven Powell's direction. Every file below is embedded **unmodified**;
this page loads them from this folder only — never from a CDN — and works
fully offline once loaded.

| File | What it is | Source | SHA-256 |
|---|---|---|---|
| `nostalgist.umd.js` | Nostalgist.js **v0.23.0** (UMD build) — the launcher/input layer | npm package `nostalgist@0.23.0`, `dist/nostalgist.umd.js` | `37ad8729399fa8164cf818932dc856c9cbcb243613866518d48020fe5025d9e1` |
| `snes9x_libretro.js` | libretro **snes9x** core, Emscripten loader (RetroArch web build **v1.22.2**) | `retroarch-emscripten-build@v1.22.2`, `retroarch/snes9x_libretro.zip` — the exact artifact Nostalgist's own default resolver fetches | `0d6b2e8f3ccaee93354d4d41cb591a08c7201fb5e35146d3e75a0c5a786ba0c2` |
| `snes9x_libretro.wasm` | the core itself, WebAssembly | same zip | `0a5f17704f96239ef05647d362b0dd478605368efce141382b8e22945062f1fd` |
| `LICENSE-nostalgist-mit.txt` | Nostalgist's license (MIT, © 2023 arianrhodsandlot) | the npm package's `license` file, verbatim | `347bc6dbad70de322984d1acafe7208836c848c6d01387ae77d97dcd556f698d` |
| `LICENSE-snes9x.txt` | Snes9x's own license text (freeware for personal use; notice preserved) | the upstream Snes9x project, carried over verbatim from the `emulatorjs-snes/` folder, where it was verified byte-identical to upstream in November 2026 | `70efeee282d82a6e9d26aeed5466d08c632369858371dc6a4644c8dcedc2be78` |

Total engine room: 5,017,564 bytes across the three program files.

Why this engine passed the collection's gate (core hunt, 2026-11-24):
clean license (MIT wrapper; Snes9x's own terms unchanged), an authoritative
build (the core is the one Nostalgist itself resolves), a pad map measured
perfect at the cartridge with a pad-decoder fixture, and full offline
operation once vendored. The swap was re-measured at the cartridge after
the rebuild — see the console's lesson for the receipts.
