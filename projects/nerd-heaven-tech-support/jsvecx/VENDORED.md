# jsvecx/ — vendored upstream files, byte-unmodified

Everything in this folder is upstream software, copied **byte-for-byte** and
never edited. It exists so *The Vectrex Console* page
(`../the-vectrex-console.html`) runs completely offline — no CDN, no runtime
downloads, and (uniquely in the Emulator Box) from a lone local file.

## What's here

The deploy JavaScript of **JSVecX** — a JavaScript port by **raz0red** of
**VecX**, the Vectrex emulator written by **Valavan Manohararajah** —
from the project's own repository (`github.com/raz0red/jsvecx`, master @
`86c0552`), `src/deploy/js/` folder:

| File | Bytes | sha256 |
|---|---|---|
| `vecx.js` | 35,127 | `a1930fe5e64adf498dfd384e140b6a7d93407b7cb0501a0a59e9323a8b70e322` |
| `e6809.js` | 83,132 | `be28f052f9b830152b1a78ffc8f885e0ea02f99e6bd4772fd7874a2b3a594b1a` |
| `e8910.js` | 15,342 | `5dc303f51cffd277093b41787689e19ba9524a4fdd1a5e38c16d2cfe59ccbfb1` |
| `osint.js` | 9,195 | `87e1e74469d5604689d1c70182c486a43ab9d6d51145e52374ad4934000556c1` |
| `utils.js` | 883 | `450d5232e30089116ad023038ad6dcca1be1cc2b623b662605a3ea7e3be65d70` |
| `vector_t.js` | 621 | `361feec53b52e517e13ec8105b773d37840eb8ba61ace4ba4b0c691524272f17` |
| `globals.js` | 807 | `da196386c90d56b61cea2ac77d01c051e5a97d9da6c603d82cf7ccf662c66696` |
| `fastromdata.js` | 32,787 | `ee1ab24378c5c3c1e5ec36af221541b0adab907f1acf14316e345b5e2f75a5b1` |
| `jquery-min.js` | 88,145 | `0925e8ad7bd971391a8b1e98be8e87a6971919eb5b60c196485941c3c1df089a` |

`LICENSE.md` beside this file is the project's own license text, carried
verbatim: JSVecX is **GPL version 3**. (The Emulation Wiki's "GPLv2" label
is wrong against the repository; the repo's text governs.) jQuery rides
along because the engine calls it — exactly two `$("#status")` status
writes — and it is vendored as upstream ships it rather than stubbed, so
the engine set stays byte-honest.

## The exec ROM, in the open

`fastromdata.js` is data: it decodes to the Vectrex's own 8 KB exec ROM,
which carries the built-in game **Mine Storm**. That firmware is why the
console boots a game with an empty slot. It ships here exactly as
upstream ships it, under the posture Steven ruled on for this console —
the same shape as the Apple IIe's firmware riding inside Apple2TS,
stated openly — with one fact in its favour the IIe never had: Jay Smith
/ Smith Engineering, the Vectrex's rights holder, has a documented
mid-1990s policy permitting **non-commercial** reproduction and
distribution of Vectrex software, and Everyday Cool is a personal,
non-commercial shelf. The lesson tells the whole story.

## What is deliberately NOT here

Upstream's demo material: the `js/roms/` demo cartridge library, the
alternate `romdata.js`, box art, overlay artwork, and the demo page
itself. We ship the machine, never the games. (The page's overlay tints
are its own furniture, drawn by the page — not upstream's artwork.)
Cartridges come from the visitor's own library, read locally by the
page's slot, and are never uploaded or stored.

## The configuration fact that matters

The console page loads these nine scripts in the engine's own order and
nothing else at runtime: no fetch, no workers, no WebAssembly — which is
why this console, alone in the Emulator Box, also runs from a lone
`file://` copy. The lesson carries the audit that proved it.
