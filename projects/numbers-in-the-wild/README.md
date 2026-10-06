# Roman Numerals & Numbers in the Wild

A free math workshop by Steven Powell, Everyday Cool, built with AI assistance. Starts with Steven’s existing Roman numeral converter, then connects notation, place value, number theory, and everyday problems.

Open `index.html` or double-click `Launch.cmd`. Everything needed for the five activities is local: no framework, account, installation, analytics, or internet connection. Discover links need internet. Collection navigation, Secret Squares, and relative ZIP links need the complete Everyday Cool collection; the workshop itself also works as a standalone folder.

## Explore

1. Roman Numeral Bench: convert and read, show each part; common modern forms for 1–3999.
2. Number outfits: compare decimal, Roman, and binary, with place-value expansions.
3. Clock arithmetic: remainders, 12-hour wrapping, and an illustrated clock.
4. Equal packs: common factors and GCD, with a picture and bounded quantities.
5. Recipe scaling: unit rates, scale factors, units, and checking whether an answer makes sense.

Short prediction challenges have expandable explanations. A classroom-to-everyday table connects ratios, area, percentages, equations, and remainders to practical decisions. The original converter is preserved as `original-converter.html.txt` for reference; the workshop uses bounded input so huge numbers cannot create a runaway conversion loop.

## Teachers and families

Begin with a familiar number. Ask learners to predict, try, explain, then give a different example from home. There is no timer, leaderboard, or automatic grading. Younger learners can start with symbol recognition and equal packs; place value and remainders open the next door. Modular notation and GCD vocabulary are optional extensions, not prerequisites. Number theory concerns integer patterns; recipe scaling is an application of ratios, not a claim that all everyday math is number theory.

## Check and share

Run `node test-math.cjs` if Node.js is installed; it is only needed for development checks. Includes all 3999 supported Roman round trips, invalid and oversized inputs, clock wrapping, packs, and proportional scaling. Code is MIT; original writing is CC BY 4.0. External resources keep their own rights. See `THIRD-PARTY.md` and `COLLECTION.md`.
