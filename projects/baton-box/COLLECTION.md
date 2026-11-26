# Collection origin

The Baton Box, added 24 November 2026 at Steven Powell's direction. The Relay — Meta AI's pass-and-play Courier Bot game, built from Steven's prompt for a social game that works when two players can never be on at the same time, and ported by Muse to a self-contained page in Nerd Heaven the same day — was designed for one device passed hand to hand. Watching it work, Steven said it "almost needs a small relay server app that would have to be installed," so a family, a group of friends, or a class could play together across devices. He amended the commission twice in the same conversation: the setup and join notes had to be included, in plain language; and the relay had to be reusable — "such a relay might be useful for other games we have made." Muse built it that day as a standalone project in Steven's workspace, and he then directed it onto the collection as its own project (entry 38) with referral cards in Nerd Heaven, on The Relay's own page, in Dad's Arcade, and as a Java back door — "create it as its own project, but put cards in the other places that we might want to refer to it."

**The server** — `baton_box.py`, with `start-baton-box.bat` (the Windows double-click starter). One Python file, standard library only (`http.server`), every page inline: home/host console, session room, help. The design is a refusal: the box stores sessions as `{gameId, code, title, players[], turnIndex, state, updatedAt, history}` and never parses `state` — an opaque blob each game produces itself — so any game that can pack its state into a blob, list its players in turn order, and import/export blobs can ride it by dropping a manifest in `games/<game>/`, with no change to the server. Sessions persist in a runtime `sessions.json` (written atomically; deliberately not part of this project or its ZIP). Hand-backs carry the `updatedAt` the player loaded; a mismatch is refused (HTTP 409) with a plain-language explanation and two human choices — last write wins only when a person says so. Join codes are six letters from an alphabet without look-alikes.

**Passenger number one** — `games/the-relay/the-relay.html` with `games/the-relay/manifest.json`. The served copy of The Relay client: byte-identical to the ported client as delivered (sha256 db090d66934ab146ac96be0dcb545a90938e2e7a64cfb811ffa29c0634dcf996), copied so the box can serve the game on a local network. The authoritative client lives in Nerd Heaven (`projects/nerd-heaven-tech-support/the-relay.html`); that living page has since gained collection furniture — the room's sibling links, and a card pointing at this project — which the served copy deliberately lacks. The game code is identical; only the furniture differs. Two small collection-side stubs ride beside the served copy — `games/the-relay/index.html` and `games/the-relay/the-relay-lesson.html` — redirect pages for the two links the ported client's own topbar carries (its room index and its lesson): inside the collection those targets live in Nerd Heaven, so the stubs send a click there instead of at a missing file. They are collection packaging, added when this project was placed; the standalone box in Steven's workspace does not have them, and the game file itself is untouched.

**The contract and the test** — `CONTRACT.md` (the deal for future game authors: what a state blob is, what the box guarantees, the manifest format, the JSON API) and `selftest.py` (an end-to-end HTTP self-test that copies the box to a throwaway folder and drives the whole loop — create, join, take a turn, hand back, stale-write refusal, restart persistence — and registers a dummy game, `test-echo`, by manifest alone to prove reusability). Self-test at build: 20/20 checks passed, including the session surviving a full server restart and the served Relay page matching its recorded sha256. One bug was caught and fixed during the build (a `%`-formatting collision between the page template and the CSS) and is recorded in the lesson.

**The pages** — `index.html` (the landing page: what the box is, how a session flows, the host setup and player join notes in plain language, the honest limits, the contract in brief, and the full notes again inside its Help ▾) and `baton-box-lesson.html` (the back-door lesson: origin, design, the 20/20 receipts, the stale-write guard, and the one named compromise — no deep link into the unmodified client, so a turn is copy → open → paste, two extra taps, documented rather than hidden). `README.md` adapts the standalone project's readme for its collection home. `LICENSE` and `LICENSE-CONTENT.md` are the collection-standard license files, byte-identical to the other projects'.

The console's lesson, `games/the-dos-console/the-dos-console-lesson.html`, was copied in beside it from Nerd Heaven (the page links to it; the gate asks every link to land). Wiring edits in the copies, made for this home and recorded here: the console page's and lesson's cross-links to their Nerd Heaven siblings (`the-2600-console.html`, `the-6502-bench.html`, `the-nes-console.html`, `the-snes-console.html`, and the lesson's `the-relay.html`) were rewired from bare filenames to the live collection URLs — in the box folder those bare names land nowhere, and the gate asks every link to land; the standalone box folder keeps its bare names, as proven. Plus one house file written for this project, `games/the-dos-console/index.html` — a stub that points the folder at the console page (the standalone box folder carries no index; the collection gate asks every folder link to land). Files: `index.html`, `baton-box-lesson.html`, `baton_box.py`, `start-baton-box.bat`, `CONTRACT.md`, `selftest.py`, `games/the-relay/the-relay.html`, `games/the-relay/manifest.json`, `games/the-relay/index.html`, `games/the-relay/the-relay-lesson.html`, `README.md`, `COLLECTION.md`, `LICENSE`, `LICENSE-CONTENT.md`.

**Update — 24 November 2026, the box learns to serve machine rooms.** At Steven's direction ("Serve DOS from the Baton Box — apply the box patch and card it as box-served"), the staged static-folder patch was applied to `baton_box.py`, and cross-origin isolation headers were added beside it. Static-folder serving: a game that is a folder of files (an emulator rack) is now served whole under `/games/<folder>/…`, traversal-refused — the road the SNES Console's rack was staged for, applied here first because DOS needed it. Isolation headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Resource-Policy: same-origin`) go out on the game routes only; the box's own pages and the session API are untouched. The reason is the DOS Console: its DOSBox Pure core is thread-only and hard-requires isolation, GitHub Pages cannot send the headers, and the box — a secure context at localhost / on the home network — can, making it that console's playable home. The collection's copy of the server is again byte-identical to the standalone box (sha256 ebd1a0c471e059c8e181bc7042eeea35b156e7f087c4d3a13f3c0c32d3db1c3a). Receipts: self-test 20/20 against the patched server (DOS Console discovered by manifest alone); the box served the DOS Console and a headless drive booted the audit fixture drive to `C:\>`, ran `DIR`, and ran the fixture (red (170,0,0) → green (0,170,0) → back at the prompt), with `crossOriginIsolated: true` reported by the browser; the SNES page and rack serve from the folder route; a Relay session on the patched box advanced its turn on hand-back. Changed files in this update: `baton_box.py`, `baton-box-lesson.html`, `COLLECTION.md`.


**25 November 2026 — the port moved (8917) and the panels learned to check identity.** Steven's field report: on his machine, port 8765 already belongs to AI-Delivery, so the box could never bind it, and the app panels' anything-answering status check reported a false "running." Changed: `baton_box.py` (default port 8917; new `/api/ping` identity endpoint; help example updated), `README.md` and `CONTRACT.md` (port), `index.html` (port), `baton-box-lesson.html` (port + the dated note recording this fix). Self-test still 20/20; the standalone box in ~/workspace/baton-box carries the identical server.

## Addendum — 2026-11-26: Passenger number two — the DOS Console boards

`games/the-dos-console/` joined the project (copied from the standalone Baton Box's games folder,
where it was proven): the DOS Console's page and its EmulatorJS rack now ride in this project's
download, so a box started from the collection ZIP serves the console — with the cross-origin
isolation headers its core needs — exactly as the standalone does. `index.html` records the
boarding in its download list and byline. Files: `games/the-dos-console/emulatorjs-dos/LICENSE-dosbox-pure-gpl-2.0.txt`, `games/the-dos-console/emulatorjs-dos/LICENSE-emulatorjs-gpl-3.0.txt`, `games/the-dos-console/emulatorjs-dos/VENDORED.md`, `games/the-dos-console/emulatorjs-dos/data/compression/README.md`, `games/the-dos-console/emulatorjs-dos/data/compression/extract7z.js`, `games/the-dos-console/emulatorjs-dos/data/compression/extractzip.js`, `games/the-dos-console/emulatorjs-dos/data/compression/libunrar.js`, `games/the-dos-console/emulatorjs-dos/data/compression/libunrar.wasm`, `games/the-dos-console/emulatorjs-dos/data/cores/README.md`, `games/the-dos-console/emulatorjs-dos/data/cores/dosbox_pure-thread-legacy-wasm.data`, `games/the-dos-console/emulatorjs-dos/data/cores/dosbox_pure-thread-wasm.data`, `games/the-dos-console/emulatorjs-dos/data/cores/package.json`, `games/the-dos-console/emulatorjs-dos/data/cores/reports/dosbox_pure.json`, `games/the-dos-console/emulatorjs-dos/data/emulator.css`, `games/the-dos-console/emulatorjs-dos/data/emulator.min.css`, `games/the-dos-console/emulatorjs-dos/data/emulator.min.js`, `games/the-dos-console/emulatorjs-dos/data/loader.js`, `games/the-dos-console/emulatorjs-dos/data/localization/README.md`, `games/the-dos-console/emulatorjs-dos/data/localization/af-FR.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ar-AR.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ben-BEN.json`, `games/the-dos-console/emulatorjs-dos/data/localization/de-GER.json`, `games/the-dos-console/emulatorjs-dos/data/localization/el-GR.json`, `games/the-dos-console/emulatorjs-dos/data/localization/en-US.json`, `games/the-dos-console/emulatorjs-dos/data/localization/es-ES.json`, `games/the-dos-console/emulatorjs-dos/data/localization/fa-AF.json`, `games/the-dos-console/emulatorjs-dos/data/localization/hi-HI.json`, `games/the-dos-console/emulatorjs-dos/data/localization/it-IT.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ja-JA.json`, `games/the-dos-console/emulatorjs-dos/data/localization/jv-JV.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ko-KO.json`, `games/the-dos-console/emulatorjs-dos/data/localization/pt-BR.json`, `games/the-dos-console/emulatorjs-dos/data/localization/retroarch.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ro-RO.json`, `games/the-dos-console/emulatorjs-dos/data/localization/ru-RU.json`, `games/the-dos-console/emulatorjs-dos/data/localization/tr-TR.json`, `games/the-dos-console/emulatorjs-dos/data/localization/vi-VN.json`, `games/the-dos-console/emulatorjs-dos/data/localization/zh-CN.json`, `games/the-dos-console/emulatorjs-dos/data/src/GameManager.js`, `games/the-dos-console/emulatorjs-dos/data/src/compression.js`, `games/the-dos-console/emulatorjs-dos/data/src/emulator.js`, `games/the-dos-console/emulatorjs-dos/data/src/gamepad.js`, `games/the-dos-console/emulatorjs-dos/data/src/nipplejs.js`, `games/the-dos-console/emulatorjs-dos/data/src/shaders.js`, `games/the-dos-console/emulatorjs-dos/data/src/socket.io.min.js`, `games/the-dos-console/emulatorjs-dos/data/src/storage.js`, `games/the-dos-console/emulatorjs-dos/data/version.json`, `games/the-dos-console/manifest.json`, `games/the-dos-console/the-dos-console.html`.

## Addendum — 2026-11-26: The disk shelf

`baton_box.py` gained the disk shelf: `GET /api/disks/<id>` serves a small allowlist of
public disk images (today just `oregon-trail`), fetched server-side from the Internet
Archive, size-verified, and cached under `disks/`. It exists because the Archive's file
servers send no CORS permission — no web page can fetch the disk — while the box, a
program on the visitor's own machine, can. The Apple IIe console's Oregon Trail door is
its first customer. The server file stays byte-identical with the standalone Baton Box.

Addendum (2026-11-26): the DOS passenger copy at
`games/the-dos-console/the-dos-console.html` received the same mount fix
as the Nerd Heaven original — sliced file reads (`readFileChunked`) and
the mount-the-folder door (`buildBootZipFromFiles`, `mountFolder`) —
after the one-shot `file.arrayBuffer()` read failed on a real archive in
the Emulator Box app's WebView2. The standalone Baton Box's copy of the
page carries the identical engine fix.

Addendum (2026-11-26, the banner that killed the box): on Steven's
Windows machine the box died the instant the apps started it — exit
code 1, no error shown. Cause, reproduced under a forced cp1252
encoding: `baton_box.py` prints a banner containing emoji, and with its
output piped away (how the apps spawn it) Python writes in the Windows
code page, which cannot encode them — UnicodeEncodeError on the first
print, before the server ever served. `baton_box.py` now reconfigures
stdout/stderr to UTF-8 with errors replaced at startup. The standalone
Baton Box carries the identical file (byte-identical, as always). This
was also the unresolved Dad's Arcade panel failure of 2026-11-25: same
spawn, same death — the panel's "flash" was the box dying.

**26 November 2026 — the DOS passenger's engine swap.** The passenger copy
of the DOS Console (`games/the-dos-console/the-dos-console.html`) received
the same engine swap as the Nerd Heaven original: DOSBox Pure/EmulatorJS
out, DOSBox via the js-dos player (v8.5.4) in — its rack rides inside the
game folder at `games/the-dos-console/jsdos-dos/` (player, `emulators/`
backend, license), the doors build .jsdos bundles in the browser, and the
page no longer needs this box's isolation headers to run: it now plays
anywhere, and the box is its relay home rather than its life support. The
standalone Baton Box carries the identical page and rack.

**26 November 2026 (later) — DOS passenger: the folder door streams.** The
same size-wall fix as Nerd Heaven's console, applied to
`games/the-dos-console/the-dos-console.html` in step: folder key boots a
conf-only bundle and streams the picked folder into the running machine
file by file, then types RESCAN itself; zip key refuses single zips over
2 GB in plain words. See the DOS Console's lesson for the full record.

**26 November 2026 (later still) — DOS passenger: the lazy drive.** The
same folder-key upgrade as Nerd Heaven's console, applied to
`games/the-dos-console/the-dos-console.html` in step: skeleton-first
loading with an on-demand panel for the big folders. See the DOS
Console's lesson for the full record.

**26 November 2026 (morning, last piece) — DOS passenger: pre-warning.**
The same folder-button warning panel as Nerd Heaven's console, applied to
`games/the-dos-console/the-dos-console.html` in step (Steven's text,
verbatim). See the DOS Console's lesson for the record.

**26 November 2026 (morning, the reading room) — DOS passenger: rescue
door.** The same door-four build as Nerd Heaven's console, applied to
`games/the-dos-console/the-dos-console.html` in step: list the mounted
drive, tick files, download them as a zip. See the DOS Console's lesson
("Field use: the reading room") for the audit receipts.

**26 November 2026 (morning, the workbench) — DOS passenger: cross-link.**
`games/the-dos-console/the-dos-console.html` gained the workbench
cross-link line (absolute live URL, as the passenger's family links
run). The DOS Workbench itself lives in Nerd Heaven; see its lesson.

- Counted-load guard (2026-11-26, later): the DOS Console passenger page (`games/the-dos-console/the-dos-console.html`) received the same lazy-drive memory guard as the Nerd Heaven originals — running in-machine total in the panel, a plain-words stop before any load whose projected total passes 1.5 GB with a "…anyway" second click to proceed, and click-the-screen canvas focus. Steven's full-drive field report and the audit receipts are recorded in the Nerd Heaven project's COLLECTION.md and the console lesson's "The counted load" section.


Forum link (26 November 2026): `index.html` gained the collection's Join our Forum line (Steven's Google Group — anyone may ask to join, members post), the feedback door he asked to have everywhere.
