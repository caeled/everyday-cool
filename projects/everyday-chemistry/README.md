# Everyday Chemistry

An Everyday Cool workshop about the chemistry already happening in your kitchen: a visual atom bench, a numbers bench that counts and weighs chemical formulas, and a shelf of eight kitchen experiments that each show a real idea about atoms and molecules.

## What's inside

- **The atom bench** — a picker of 30 elements (the first twenty, plus iron, copper, zinc, silver, gold, mercury, lead, iodine, bromine, and tin). Pressing one draws its Bohr-model atom as SVG: shells with the correct textbook electron counts, a nucleus labelled with protons and neutrons for the most common isotope (neutrons = the rounded standard mass minus the protons, stated plainly on the page), and the three counts written out beside the picture. The page says out loud that the drawing is a map, not a photograph.
- **The numbers bench** — two calculators. The *neutron calculator* takes an atomic number and a mass number and shows the subtraction in three numbered steps, refusing impossible pairs in plain language. The *formula bench* parses formulas typed with plain digits (H2O, C6H12O6) including bracketed groups (Ca(OH)2, Mg(NO3)2), counts the atoms, and weighs one mole row by row so the arithmetic can be checked; unparseable input gets a plain-language explanation, not an error code. The *combinations bench* sits under it: eight preset substances (water, table salt, baking soda, carbon dioxide, glucose, vinegar, ammonia, rust), each with its atom tally and its ratio in plain words; pressing one loads it into the formula bench.
- **The kitchen shelf** — eight experiment cards, each with what you need (ordinary kitchen items), numbered steps, "what it shows" (the atom/molecule idea), and an honest safety line: red-cabbage pH indicator, milk-and-soap colour burst, oobleck, lemon-juice invisible ink, the vinegar egg, ice-cream in a bag (ice-and-salt freezing point), sugar crystal growing, and the density rainbow. Nothing uses bleach, ammonia, or anything beyond ordinary kitchen safety; heat and hot water are marked as a grown-up's job wherever they appear.
- **Links out** — five destinations, every one verified live on 18 November 2026: PhET's Build an Atom simulator, the Royal Society of Chemistry's periodic table, Ptable, Khan Academy's chemistry course, and the American Chemical Society's Celebrating Chemistry activities.
- **How atoms work here** — a brief plain-language workshop: the atom's three pieces, isotopes, formulas as fixed recipes, the mole, and reactions as rearrangement (atoms are conserved).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the atom bench, the numbers bench, reading a formula, the kitchen experiments, safety plainly, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Numbers in the Wild (the counting cousin), Weather Everywhere (more small experiments), Tonight's Sky (where the atoms were made), and The Games Room (the shape cousin: shelf + things that work on the page + workshop).

## Run it

Open `index.html` in a browser. The benches and experiment cards work fully offline — they are arithmetic and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (element data, shell sums, neutron maths, the formula parser, molar masses, the compound presets) live in `chem.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that every element's shells add up to its atomic number and that known molar masses come out right (water 18.02, glucose 180.16, Ca(OH)2 74.09).

## Files

- `index.html` — the room itself
- `chem.js` — pure rules: element data, neutron maths, the formula parser, molar masses, compound presets
- `app.js` — the wiring: the element picker, the SVG atom drawing, the calculators, the combinations bench
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches)
- `everyday-chemistry-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
