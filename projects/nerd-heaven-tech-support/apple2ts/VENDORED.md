# apple2ts/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The Apple IIe Console* page
(`../the-apple-iie-console.html`) runs completely offline. The receipts —
versions, sources, and sha256 for the principal files — are in
`../the-apple-iie-console-lesson.html`.

## What's here

- The **Apple2TS 3.8.0** emulator build, taken from the project's own
  GitHub Pages deployment tree (branch `gh-pages`) at commit
  **`718738e098f91691c3facbc3996e51284d6f3078`** — the exact artifact the
  commissioning gate tested and drove to The Oregon Trail's main menu.
  Apple2TS is by **Chris Torrence and the Apple2TS contributors**, and it
  emulates the Apple II, II+, and IIe (unenhanced and enhanced) in
  TypeScript. The house console runs it as the enhanced IIe, its default.
- `LICENSE` — the project's **MIT License**, carried beside the build as
  its terms require. The Pages tree does not ship a copy, so this one was
  taken from the project's source repository at the matching release tag
  (`v3.8.0`); it is byte-identical to the LICENSE on the project's main
  branch. sha256 `3c77c5df…e5836`.
- `js/` — upstream's Google Drive / OneDrive helper scripts. They are part
  of the shipped build and wake only if a visitor uses the machine's own
  cloud-drive buttons; the console's local disk slot never touches them.

## What was pruned, and why

Upstream's Pages tree carries a bundled disk library — a `disks/` folder
of 60 files: disk images of games and programs, their cover pictures, and
their notes. **That folder was left behind, entire.** This collection
ships machines, never software: the same call the NES pass made when it
left JSNES's bundled ROMs behind. Everything else in the tree — 72 files —
is here, unmodified. The emulator tolerates the library's absence (it
looks up a sidecar note for a loaded disk, gets no answer, and carries
on); its Disk Collections panel simply has no bundled shelf to show,
which is the honest state of a machine that ships empty.

## The one configuration fact that matters

The console page frames this folder's own `index.html`, unmodified, and
hands it disks through the machine's own loader. Nothing is fetched from
upstream's site or any CDN at runtime: served from this folder, the
machine's requests are all same-origin (the lesson's audit logged them).
