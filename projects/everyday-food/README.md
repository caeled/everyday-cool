# Everyday Food

An Everyday Cool workshop about food — the plants it comes from, the senses that judge it, and the fire that cooks it. It opens with an audit: the famous tongue map, checked against the tongue and found wrong in the instructive way. It stands on the main hub next to The Survival Guide, and the two rooms are linked both ways — this room's camp kitchen cooks over the Guide's fires and hangs from its knots; the Guide's fire and links sections point back here.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Food.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-food)

## What's inside

- **The tongue map, audited** — the room's headline. The school diagram (sweet tip, bitter back, tastes in territories) is told as a biography: Hänig's 1901 threshold measurements found small regional differences; Boring's 1942 graph made them look like kingdoms; eighty years of copying did the rest. The bench is the audit: pick any of the five tastes and a tongue diagram shades by sensitivity — every taste, every region, nothing dark. A hardware card covers taste buds and papillae (several thousand buds, replaced roughly fortnightly), and the honesty line owns that the bench's numbers are relative teaching values, not laboratory thresholds.
- **Flavour is taste + smell** — retronasal smell, taught by the pinch test (hold your nose, lose the food's identity; release mid-chew and it arrives), the head cold as the same experiment run by a virus, and the rest of the flavour panel (texture, temperature, trigeminal tingle). The section audits the "80% of flavour is smell" slogan the same way it audited the map: a pointer wearing an unmeasured number. Links to Everyday Body.
- **Bitter + sweet** — the evolutionary treaty: bitter as the alkaloid poison alarm (leaning strongest at the back of the tongue, the last checkpoint), sweet as the safe-energy signal, and salt, acid, and fat as mediators. The balance bench reads five dishes — dark chocolate, sugared grapefruit, coffee with milk, salted caramel, sweet tea with lemon — on five 0–10 axes, each with its *why* and its *lever* (the adjustment a cook actually makes). A supertaster card covers PTC/PROP paper tests, the TAS2R38 gene, and the rough quarter/half/quarter split — and why children taste bitter harder. Links to Everyday Chemistry.
- **Food plants** — identification taught as a discipline. The section opens with the standing rule in the big callout, non-negotiable: **never eat a wild plant on a webpage's say-so, this one included** — a positive ID takes several marks, all agreeing, a field guide, and local knowledge. Six plants (dandelion, broadleaf plantain, red & white clover, blackberry, wood sorrel, cattail), each with numbered marks that must all agree, a season, a named look-alike with the distinguishing mark (false dandelions, lily-of-the-valley, wood sorrel vs clover, raspberry's thimble core, clover vs sorrel, blue flag iris), a safety line, and an honesty line. Links to Everyday Earth and The Survival Guide.
- **The camp kitchen** — the Dutch-oven coal bench: five oven sizes × four temperatures off the published chart (Fears/Chuckwagon: diameter + 3 on top, − 3 underneath at 325 °F, one more coal per side per 25 °F), with the 12-inch chart printed on the page and the chart disagreement (Lodge splits it differently) on its face. Method cards for foil packets, stick cooking, and one-pot cooking, each with safety and honesty lines, and a cookbook card for Horace Kephart's *Camp Cookery* (1910). Fire, knots, and water link next door to The Survival Guide.
- **Why cooking works** — Maillard browning (onset ≈285 °F / 140 °C, and why boiling's 212 °F ceiling means boiled food never browns), caramelisation (sugar alone past ≈320 °F / 160 °C, bitterness growing with depth — a bridge back to the balance bench), and why onions sweeten slowly (sulfur defences dismantled, sugars concentrated, thirty to forty-five honest minutes). Links to Everyday Chemistry.
- **Links out** — nine destinations, every one verified live on 20 November 2026: Kephart's *Camp Cookery* at the Internet Archive, the coal chart's published home at Chuckwagon Supply, Eat The Weeds for identification discipline, and Wikipedia read-deeper on the tongue map, taste, retronasal smell, supertasters, the Maillard reaction, and caramelization.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (every bench, the plant rule, honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** The Survival Guide (the neighbour — linked both ways, fire ↔ kitchen, knots ↔ tripod, remedies ↔ plant discipline), Everyday Body (the tasting equipment), Everyday Chemistry (the compounds), Everyday Earth (the ground and the seasons).

## Run it

Open `index.html` in a browser. Everything runs from the files in this folder, offline. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The data and rules (the tongue sensitivity table — five tastes sensed in every region, bitter peaking at the back, sweet at the tip; the dish profiles — five axes each, bitter and sweet both on the table in every dish; the Dutch-oven chart — the published counts for all sizes, the diameter ± 3 rule at 325 °F, one coal per side per 25 °F, off-chart requests refused; and the plant data — six plants, each with at least four marks, a sane season, a named look-alike, and a caution) live in `food.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `food.js` — pure rules and data: the tongue table, the dish profiles, the coal chart, the plant identification data
- `app.js` — the wiring: the tongue bench, the balance bench, the coal bench
- `style.css` — the room's styling (shared Everyday Cool room styling plus the tongue, profile bars, and the neighbour's two-lines card styles)
- `everyday-food-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
