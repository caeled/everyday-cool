# Audit notes — The 2600 Console (Javatari), 2026-11-24

Upstream: github.com/ppeccin/javatari.js, tag v5.0.4. Tarball (GitHub archive of the tag)
sha256 1baa2aad4d48ca3beb2858e4eadbc8cfbd815ddce45ef5ae22ff2a5296d2a4d3.
License confirmed from license.txt inside the download: GNU AGPL v3.
Shipped unmodified in projects/nerd-heaven-tech-support/javatari/:
  javatari.js 668,736 B sha256 9093f2dcab2b26755fc52229f62c4234d01429d64c690de2164dced04a948471
  index.html    493 B sha256 b0ed3691f1ccee442193e52eb3941a68d3b31ff7c76aabaa04821f3806058f63
  license.txt 34,521 B sha256 1ee6d6833427b7bb4f39861a79a08ad6b944719903fecd346fe941a5e6156e75

Network surface found by reading the build: one XHR (load a file from a URL the page/user
supplies), one fetch + WebSockets (NetPlay keepalive/session, only when Javatari.SERVER_ADDRESS
is configured and a session is started). Neither fires by default. Drive confirmed empirically.

Drive (drive.js, Puppeteer + local http.server on 127.0.0.1:8611): 17/17 checks passed,
zero console/page errors, 7 requests all local or data: URIs.
Fixture: test2600.bin (4,096 B, sha256 cc2aea05007997c894ed673d983812525e77efe75c7978848dd6d32bed0e7f90),
assembled by make_rom.py (mini two-pass assembler; emitted bytes spot-checked by hand).
Exported state fixture: test2600.jst (3,128 B) — begins \0\0"javataristate!" + JSON.

Measured colours (Javatari NTSC palette, canvas 320x446):
  COLUPF $0E -> (244,244,244); COLUBK $84 -> (56,64,176); $36 -> (192,104,72);
  $C6 -> (92,156,92); $66 -> (140,88,184).
Playfield geometry: PF1 band at canvas x 32-95, reflected band 224-287 (32 clocks x 2 px).

Drive gotchas worth remembering:
- PF sampling point: PF1 centre is fx=0.20 of canvas width, not 0.05 (PF0 zone).
- Save/load slot shortcuts: Ctrl+<n> saves slot n, Alt+<n> loads it (DOMConsoleControls).
- The state dialog's File entry is labelled "Save to File..." / load equivalent; hidden
  "Open ROM File..." <li>s also match /File.../ — filter by visibility and Save/Load wording.
- Downloads in current headless Chrome need Browser.setDownloadBehavior (browser-level CDP);
  Page.setDownloadBehavior on the page session is ignored.
- Javatari's dialog guards downloads behind real user gestures; use trusted mouse clicks.
- The browser's /favicon.ico 404 shows up as a console error; the house page carries an
  inline data: favicon to keep the audit clean.

Baton Box: NOT registered. Javatari states are .jst file downloads / localStorage slots —
no copyable blob exists, so no manifest was written (per brief). Lesson states this plainly.

Wiring pass TODO: room index card, shelf counts, THIRD-PARTY.md entry for Javatari (AGPL-3.0),
COLLECTION.md provenance for the two pages + javatari/ folder, sitemap/full-index entries.
