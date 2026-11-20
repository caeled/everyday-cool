# Everyday Language

An Everyday Cool workshop about the code you already speak. Language is a code too — that is Steven Powell's founding line for the room, and it makes Everyday Language the sibling of Secret Squares: that room hides messages in little squares, this one examines the encoding, keys, compression, and error correction built into human language itself. The room was proposed by Steven in the Everyday Cool ideas side chat on 18 November 2026 ("You know language is a code too — ala secret squares"), with its contents named by him: a map of language families ("people always get tripped out when they learn English is Germanic"), some common cognates, a mini translator, and STEM article links.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Language.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-language)

## What's inside

- **The family tree** — the Indo-European family drawn as an explorable tree, from the reconstructed Proto-Indo-European root down through its main branches. Tapping a branch shows its main languages, one accurate fact, and its line back to the root. English's line is outlined in gold and states the room's headline on the page: *English is a Germanic language* — Proto-Indo-European → Germanic → West Germanic → Anglo-Frisian → English. French and Spanish are cousins on the Romance branch; the French layer in English is borrowing (a loanword layer, mostly post-1066), not ancestry. Below the tree, five "other great families" cards (Sino-Tibetan, Niger-Congo, Afroasiatic, Austronesian, Trans-New Guinea) carry speaker/language counts labelled approximate.
- **The cognates bench** — eleven everyday words (father, mother, three, night, heart, water, brother, foot, ten, new, name), each with its reconstructed Proto-Indo-European root and its genuine descendants across up to ten languages, grouped by branch, with the sound changes (Grimm's law) named. Where a familiar language replaced the word — Russian "father", Spanish "brother", Spanish/Latin "water" lookalikes — a false-friend warning says so instead of listing a fake relative. A separate false-friends row (gift/Gift, embarazada, actual) teaches the mirror lesson: resemblance can mislead, decoding with the wrong dictionary.
- **The mini translator** — honestly a phrasebook: ten traveller's phrases (hello through "how much does it cost?") in six languages (Spanish, French, German, Italian, Portuguese, Dutch), hand-checked, with the limits stated on the bench and real translators (Google Translate, DeepL) linked for real work. No pronunciation hints are printed rather than guessed ones. Beside it, a **"Take it traveling"** card cross-links Steven's separate Travel Kit app (Find It, Tonight's Sky, and Weather Everywhere bundled for the road), linking its GitHub releases page and framed plainly as a separate downloadable app, not a room in this collection.
- **Where language lives** — a schematic side-view brain diagram (original inline SVG) with four tappable stations: Broca's area (production), Wernicke's area (comprehension), the arcuate fasciculus (the cable between them), and the visual word form area (reading). Cards below carry the section's points: language is a network, not a spot; the two streams (sound→meaning, sound→speaking); sign languages run on the same network; the map is known largely from breakage (aphasia); children can re-map language after early injury. It cross-links the Everyday Body room's brain explorer.
- **Language is a code** — the room's thesis in five cards: encoding/decoding, the shared dictionary, slang and dialect as a shared key, idioms as compression that fails without the shared dictionary (with Spectrum Search's idiom work as the worked example), and context as error correction. Cross-links Secret Squares both ways (Secret Squares' "Go deeper" section points back here).
- **Links out** — a shelf in the house style: a Wikipedia group (Language family, Indo-European languages, Germanic languages, English language, Cognate, Proto-Indo-European language, Broca's area, Wernicke's area), the family's official records (Glottolog, WALS, Omniglot), and the real translators (Google Translate, DeepL). Every link checked live 18 November 2026.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the tree, the cognates bench, the phrasebook, the brain section, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.

## Run it

Open `index.html` in a browser. The tree, benches, phrasebook, and brain section all work fully offline from the room's files. Only the Links Out shelf and the Travel Kit button need the internet.

## Tests

```
node test.cjs
```

The tests check the data in `lang.js` (tree integrity — every parent resolves and English's ancestry walks PIE → Germanic → West Germanic → Anglo-Frisian → English; every cognate set complete across its languages and branches; every phrasebook phrase present in every offered language; the link shelf non-empty) and the page wiring (house title, local banner, no external scripts or styles, cross-links, Help cards).

## Files

- `index.html` — the room: page shell, sections, the brain diagram (inline SVG), Help
- `lang.js` — the data with no DOM code: the family tree, the cognate families, the phrasebook, the other families, the link shelf
- `app.js` — the wiring: tree rendering and selection, the benches, the shelf
- `style.css` — the room's styling, in the collection's house idiom
- `everyday-language-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — data-integrity and page-wiring checks
