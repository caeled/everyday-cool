# Sources & limitations

## Bundled material

The workshop's text, inline SVG diagrams (body atlas and brain), and code were authored by ChatGPT (OpenAI) for Steven Powell's Everyday Cool collection (code MIT, lessons CC BY 4.0, per the room's LICENSE files). The banner image is AI-generated art made for this room during its integration. **No third-party images, code, fonts, or data files are bundled in this folder** — the page was verified to contain zero external image, stylesheet, or script references, and `test.cjs` re-checks that on every run.

## Sources the content follows (facts and further reading, not files)

- **OpenStax, *Anatomy and Physiology 2e*** (openstax.org) — the free, openly licensed textbook (CC BY 4.0) whose chapters anchor each organ's "Explore further" shelf: the nervous system (ch. 13), the heart (ch. 19), the respiratory system (ch. 22), digestion and its accessory organs (ch. 23), the urinary system (ch. 25), vision (ch. 14), the skeletal system (ch. 6), and muscle tissue (ch. 10).
- **Wikipedia** (en.wikipedia.org) — the general-exploration article linked for every organ (Human brain, Heart, Lung, Liver, Stomach, Pancreas, Kidney, Intestine, Urinary bladder, Human eye, Human skeleton, Muscular system).
- **NINDS — National Institute of Neurological Disorders and Stroke** (ninds.nih.gov) — "Brain Basics," linked from the brain's shelf; public educational material from the U.S. National Institutes of Health. The proposal also named NCBI's *StatPearls* anatomy material as a deeper source; v1's shelves link OpenStax, Wikipedia, and NINDS, and NCBI remains a candidate for a later, deeper shelf.

## Linked, not loaded (each opens in a new tab, under its own terms)

OpenStax *Anatomy and Physiology 2e* chapters · Wikipedia organ articles · NINDS Brain Basics. The links are the page's only external references; they are followed only when a visitor presses one.

## Nothing is called at view time

The page makes no network calls at all: it is a single HTML file whose atlas, brain explorer, scenarios, and quiz run entirely in the browser, and the shelves are ordinary links.

## Limitations

The body atlas is an intentional simplification: a schematic front view, not to scale, with some organs drawn through others so they can be selected. The brain's side-view diagram shows six surface structures in position; the six deeper regions are explored through labelled buttons, and the page says plainly that their physical positions are not depicted. Organ and region descriptions are educational simplifications, and the room states its central caveat on the page: functions often depend on networks across multiple structures. The effort slider in the connections section is an illustrative model, not a physiological measurement. This workshop teaches anatomy; it does not diagnose health conditions or provide medical advice. Descriptions were written on 18 November 2026; each linked source's own pages are the authority.


## Human Body Lab additions · 21 November 2026

Region layout is adapted from this repository's original `prototypes/body-symptom-mapper/body-symptom-mapper.html`; no third-party anatomy images or libraries were added. Codex (OpenAI), at Steven Powell's direction, authored the new regional descriptions, inquiry cases, SVG interface, and tests. The original symptom mapper remains separate and unchanged.

Anatomical examples were checked against these OpenStax *Anatomy and Physiology 2e* sections (linked for further reading, not copied or loaded at runtime):

- [11.5 — Muscles of the pectoral girdle and upper limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)
- [11.6 — Pelvic girdle and lower-limb muscles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)
- [13.4 — Peripheral nervous system](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-4-the-peripheral-nervous-system)

The 25 ellipses locate broad body regions; layer colors do not depict tissue boundaries. Examples include structures in or serving a region and are not a complete inventory. Back view reverses the observer's orientation while retaining anatomical left/right. Deep structures can be discussed in either view. The five cases are fictional prompts, not experiments requiring exertion, sensory testing, or symptom interpretation. Session notes clear on reload.
