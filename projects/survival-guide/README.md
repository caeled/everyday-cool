# The Survival Guide — full documentation

One self-contained room of the Everyday Cool collection: the other rooms' knowledge, used all at once, outdoors. Fire from little, water you can trust, soap from ash and fat, batteries from the pantry, direction clues graded honestly, a remedies shelf with the evidence printed on it, and a first-aid anchor section written against the American Red Cross and Scouts BSA. Open `index.html`; the kit checklist in the First Aid section runs from `app.js`; everything except the Links Out shelf works offline.

## The design rule

Every card in the room carries **two lines**: a **safety line** (how the thing can hurt you, and what keeps it from doing so) and an **honesty line** (what the tip can and cannot do, and how strong the evidence or the clue is). The direction section grades its clues out loud — North Star A, shadow stick B, moss D. The remedies shelf writes each card in three parts: traditional use / what the evidence says / limits and when to get real help. The water section states its rule in the biggest type on the page: filtering clears grit and improves taste; it does **not** make water safe — boiling does (rolling boil, 1 minute; 3 minutes above 6,500 feet).

## Sections

- **Fire from little** — tinder and kindling; the teepee, lean-to, and log cabin lays; the ferro rod; flint & steel with char cloth; the bow drill with its difficulty stated plainly; and putting a fire dead out (drown, stir, drown, feel, per Smokey Bear).
- **Water** — a layered filter (cloth → charcoal → sand → gravel) with a diagram, the boiling rule, and the backup methods ranked honestly.
- **Soap & oil** — rendering fat; wood-ash lye (a grown-up job: caustic, gloves, no shortcuts); saponification in plain words; the four-week cure. Cross-links to Everyday Chemistry.
- **Batteries from what's around** — one copper/zinc cell (~0.9 V), the series lesson, a red LED lit by three or four lemons or potatoes. Cross-links to Everyday Electronics' fruit battery card.
- **Direction** — the North Star via the Big Dipper's pointer stars, the shadow stick, and moss graded as the weakest clue. Cross-links to Tonight's Sky.
- **The remedies shelf** — banana slug slime (mild, studied numbing; look-and-learn only — wild slugs can carry parasites), willow bark (salicin, aspirin's ancestor, with aspirin's full cautions), broadleaf plantain (modest evidence, low risk, identification is the rule), oak bark (astringent tannins — and not the headache bark; that's willow). The shelf's rule: last resort, not first.
- **First Aid (the anchor)** — severe bleeding (pressure first; tourniquet per current Red Cross guidance), burns (cool running water; no ice, no butter), sprains (RICE), choking (5 back blows, 5 abdominal thrusts), heat exhaustion vs heat stroke (stroke = call 911, cool fast), hypothermia (gentle warming), CPR presented as "learn this in a class" with a link to Red Cross training, and a build-your-own first-aid kit with a tick-off checklist. Every card states when to call 911 or get help.
- **Links out** — six authoritative links, each checked live on 19 November 2026 (see `THIRD-PARTY.md`).

## Cross-links

Outgoing only: Everyday Chemistry (soap), Everyday Electronics (batteries), Tonight's Sky (direction), Everyday Body (first aid). The reciprocal cards in those rooms are a recorded later add in `COLLECTION.md` — this room links out; it does not reach back and edit its neighbours.

## Files

- `index.html` — the whole room: all sections, the filter diagram, the kit checklist.
- `app.js` — the kit checklist counter; runs entirely in the page, stores nothing.
- `style.css` — the room's styles, on the collection's shared base.
- `survival-guide-banner.jpg` — the room's banner: a robot in Scout gear by a campfire under the Big Dipper (AI-generated artwork, disclosed in `COLLECTION.md`).
- `README.md` — this file.
- `COLLECTION.md` — provenance, references, and preservation notes for the collection.
- `THIRD-PARTY.md` — sources, the links shelf, and the room's limitations.
- `LICENSE` / `LICENSE-CONTENT.md` — the collection's code and content licences.
