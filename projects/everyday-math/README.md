# Everyday Math

An Everyday Cool workshop about the numbers themselves: the classic tricks, each shown with its reason; the fractions and percents people actually freeze on; the formulas people actually meet, each with a worked example; huge and tiny numbers in scientific notation, with Avogadro's number as the bridge to Everyday Chemistry; the full log table with proportional parts; a printable sheet carrying the 16×16 times grid and the log table; and a scientific calculator that admits its last digit lies.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Math.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-math)

## What's inside

- **The nines bench** — Steven's lead exhibit: write 0 to 9 down one column and 9 to 0 up the other and the whole nines table appears (09, 18, 27 … 90), every answer's digits summing to 9, because 9 = 10 − 1. A slider builds the table row by row; companion cards give the finger version of the same trick and the number-theory bite behind it (in base eight, 7 wears the crown).
- **More of the trick bag** — the ×11 bench (split, add, carry; because 11 = 10 + 1) and the ending-in-5 square bench (head × next head, tack on 25; because (10h + 5)² = 100h(h + 1) + 25, at any size — 115² = 13,225).
- **The checkers** — a divisibility bench that votes on a number with the rules for 2, 3, 4, 5, 6, 9, 10, and 11, each with its reason (the digit-sum rules work because every power of ten is a multiple of 9 plus 1), and casting out nines, the bookkeeper's check, with its honest limit on display: claim an answer off by exactly 9 (1795 for 47 × 38) and it passes anyway.
- **Fractions & percents** — an add-fractions bench (least common denominator, shown as the shared cup), a recipe scaler (halve, double, triple, out as mixed numbers), a restaurant bench (tips and discounts from the one line p% of X = X × p ÷ 100), and an estimating card: round first, and let the exact answer live inside the fence.
- **The formula shelf** — area & perimeter (garden bed; a 12-inch pizza's 113 in²), volume (a 54-litre aquarium and what it weighs), distance = rate × time through all three of its doors, simple interest ($500 at 4% for 3 years = $60), an interactive Pythagoras bench (the ladder's 4.77 m reach; the 55-inch TV's diagonal), and an average bench.
- **Huge and tiny** — scientific-notation benches in both directions (the exponent is the decimal point's hop count), preset chips for Avogadro's count, the speed of light, an atom's width, and the Earth's mass, and the Avogadro card: a mole is a counting unit, 6.022 × 10²³, and the bridge into Everyday Chemistry.
- **The log table** — the full table this time: a bench that looks numbers up by characteristic + mantissa from the hundredths table (1.00–9.99) with proportional-parts interpolation shown step by step, the pocket tenths grid shared with Everyday Engineering, a worked example (log 4.372 ≈ .6407), and the return link to Engineering's pocket bench — closing, both ways, the cross-link Engineering's COLLECTION.md recorded as pending.
- **The scientific calculator** — a plain JavaScript chain calculator: log, ln, √, x², xʸ, 10ˣ, 1/x, sin/cos/tan in degrees or radians, π and e, and an EE key for scientific notation. Its honesty card is filled in by the visitor's own machine: 0.1 + 0.2 stored as 0.30000000000000004 while the display tidies it to 0.3.
- **The printable tables** — one button prints a clean spreadsheet-style sheet: the times table to 16×16 and the full log table (900 mantissas) with the characteristic rule and a worked interpolation example, generated from the same data the benches read.
- **Links out** — thirteen destinations in three grouped shelves, every one verified live on 19 November 2026: the ideas one by one on Wikipedia (Multiplication, Multiplication table, Mental calculation, Casting out nines, Divisibility rule, Fraction, Percentage), the bigger machinery (Algebra, Pythagorean theorem, Logarithm, Scientific notation, Avogadro constant), and one plain-English explainer (Math is Fun).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the tricks, the checkers, fractions & percents, the formula shelf, huge and tiny, the log table, the calculator, the printable tables, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Chemistry (where the mole is spent), Everyday Engineering (the pocket log table, cross-linked both ways), and Everyday Measure (the units these numbers wear).

## Run it

Open `index.html` in a browser. The tricks, benches, calculator, tables, and Help work fully offline — they are arithmetic and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (the nines table, ×11, squares ending in 5, casting out nines, divisibility, fractions, percents, Pythagoras, averages, scientific notation, both log tables, the 16×16 grid, and the calculator's arithmetic) live in `math.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that the two columns produce exactly 09, 18, 27 … 90 with every digit sum 9, that ×11 matches real multiplication for every number 0–99, that a claim off by exactly 9 passes casting out nines while a claim off by 10 fails it, that log 500 comes out 2.6990 and log 4.372 interpolates within two fourth-decimal units of the true log, that the printable grid's corners are 1, 16, 16, and 256, and that the calculator's functions return log 1000 = 3, 2^10 = 1024, √144 = 12, and sin 30° = 0.5.

## Files

- `index.html` — the room itself
- `math.js` — pure rules: the tricks, the checkers, fractions and percents, the formula benches, scientific notation, the tenths and hundredths log tables with interpolated lookups, the 16×16 grid, the calculator's arithmetic, formatting
- `app.js` — the wiring: the benches, the calculator's keypad, the printable sheet's generation
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches, the calculator, and the printable sheet)
- `everyday-math-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests


## Deep Zoom (added 22 November 2026)

A Mandelbrot and Julia explorer with a real perturbation engine past 10¹²×. Open `deep-zoom.html`; the audit lesson is `deep-zoom-lesson.html`.
