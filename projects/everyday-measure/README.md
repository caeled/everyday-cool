# Everyday Measure

An Everyday Cool workshop about the two measuring systems an American lives between: US customary units and the metric system. An interactive prefix ladder, four converter benches that show their working, a shelf of "feel it" anchors, a comparison tool that reads familiar things in both systems at once, three trap cards, two famous breakage stories, a short honest history, and a verified links shelf.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Measure.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-measure)

## What's inside

- **The prefix ladder** — the room's centrepiece: ten steps (mega, kilo, hecto, deka, the base unit, deci, centi, milli, micro, nano), each with its symbol, its power of ten, and what the prefix means in plain words ("kilo = a thousand of them"). Press a step, type a quantity, pick metres, litres, or grams, and climb to any other step — the bench shows the climb through the base unit in numbered steps. The ladder honestly skips from milli to micro: the powers between have no everyday prefix names.
- **The converter benches** — length (mm, cm, m, km ↔ in, ft, yd, mi), weight (g, kg, tonnes ↔ oz, lb, US tons), volume (mL, L ↔ US fl oz, cups, pints, quarts, gallons, and the Imperial gallon, labelled as the trap it is), and temperature (°F ↔ °C). Every conversion starts from the unit's legal definition and prints its arithmetic; nothing is hidden. Temperature carries the honest note that it is not a ×10 system, plus an anchor table (−40 = −40, 0/32 freezing, 37/98.6 body, 100/212 boiling).
- **Feel it** — seven anchor cards that hang metric sizes on things an American already knows, each labelled exact or approximate: a nickel is exactly 5 g (US Mint specification), a paperclip ≈ 1 g, a litre is a quart plus a splash (1.057 qt), a kilogram is 2.20462 lb, a metre is a yard plus ~3.4 inches, 100 km/h is 62.1 mph, and the 2-litre soda bottle as the household litre.
- **The comparison shelf** — pick a thing (an African elephant, an average US car, a giraffe, a football field, a full bathtub, an Olympic pool) and see it in both systems side by side under a level balance beam. The second reading is computed by the same converters the benches use, so the two readings cannot drift apart; approximate things are marked approximate, with the reason in the note.
- **Anchors** — the room's game (`anchors.html`): estimate sixteen real quantities — a mouse, a mug, an elephant, the Moon — against the Feel It anchors and the comparison shelf, scored by the factor missed by (points = round(100 × (1 − log₁₀(factor)/2))), with every truth read back in anchors by computation from the same table the shelf and the proof use. Its back door (`anchors-lesson.html`) teaches Fermi estimation, ratio scoring, and chaining; it opens inside the game from a 📖 Lesson pop-up. Before it shipped, a headless proof verified the scoring at the band edges (and caught a floating-point banding bug the core now carries a commented tolerance for) and landed a scripted anchor-chain estimator inside ×2 on every challenge.
- **Trap cards** — tonne (1,000 kg) vs US ton (2,000 lb) vs long ton (2,240 lb); the US gallon (3.785 L) vs the Imperial gallon (4.546 L); and the fluid ounce (volume) vs the ounce (weight).
- **When it broke** — the Mars Climate Orbiter (1999: pound-force seconds vs newton seconds, factor ≈ 4.45, $327.6M mission lost) and the Gimli Glider (Air Canada Flight 143, 1983: fuel figured in pounds instead of kilograms, roughly half the fuel needed, a glide to Gimli and no fatalities).
- **The short honest history** — France's 1790s system, the Treaty of the Meter (1875, US a founding signatory), the Mendenhall Order (1893: US units defined from the metric standards), the 1959 exact inch and pound, and the voluntary Metric Conversion Act (1975).
- **Links out** — seven destinations, every one verified live on 19 November 2026: NIST's SI Units pages, NIST SP 811, Wikipedia on the Metric system, US customary units, the Mars Climate Orbiter, and the Gimli Glider, and Khan Academy's metric length review (Khan shows automated visitors a challenge page; it opens normally in a browser, and the page says so).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the ladder, the benches, the comparison shelf, the traps, exact vs approximate, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Physics, Everyday Chemistry, and Everyday Electronics — the rest of the Science block — and Numbers in the Wild, the counting cousin. Electronics spends the prefix ladder (milliamps, kilohms, microfarads); this room is where the ladder itself is taught.

## Run it

Open `index.html` in a browser. The ladder, benches, and comparison shelf work fully offline — they are arithmetic and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (the ladder, the exact conversion factors, the temperature formulas, the comparison shelf) live in `measure.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that 1 in = 2.54 cm and 1 lb = 0.45359237 kg come out exact, that 100 km = 62.137 mi, that the Imperial gallon really is bigger than the US gallon, and that the Olympic pool reads 2,500,000 L and 660,430 US gallons on the two pans.

## Files

- `index.html` — the room itself
- `measure.js` — pure rules: the prefix ladder, the unit tables with their exact definitions, conversions with working, temperature, the comparison shelf
- `app.js` — the wiring: the ladder bench, the four converter benches, the comparison balance
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches)
- `everyday-measure-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
