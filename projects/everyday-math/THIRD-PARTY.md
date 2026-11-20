# Sources & limitations — Everyday Math

Everything interactive in this room is computed in the visitor's browser from rules baked into `math.js`. The page sends nothing anywhere. This file records where the room's facts come from and where its methods stop.

## The tricks and why they work

- **The nines table:** writing 0–9 down and 9–0 up yields 09, 18, …, 90 because 9 = 10 − 1: each multiple adds a ten and removes one. The digit-sum property (every multiple of 9 has digits summing to 9, for two-digit multiples) is the same fact restated; the base-eight companion claim on the page (multiples of 7 written in base 8 — 7, 16, 25, 34, 43 — have digit sums of 7) is the general rule, base − 1, and was verified by direct conversion. See Wikipedia's *Multiplication table* and *Casting out nines*.
- **×11:** split-and-add works because 11 = 10 + 1 — n × 11 is n shifted one place plus n. The bench covers whole numbers 0–99; the method generalizes to longer numbers with pairwise addition and carries, which the room does not bench.
- **Squares ending in 5:** (10h + 5)² = 100h(h + 1) + 25, exact for every whole number ending in 5; the bench checks it against direct squaring in tests up to 995².
- **Divisibility rules:** the standard rules for 2, 3, 4, 5, 6, 9, 10, 11, as in Wikipedia's *Divisibility rule*. The digit-sum rules for 3 and 9 hold because 10 ≡ 1 (mod 9), so every power of ten is a multiple of 9 plus 1.
- **Casting out nines:** a number and its digital root differ by a multiple of 9, so the root of a product equals the root of the product of the roots. The limit is stated on the page and in the tests: a claim wrong by a multiple of 9 passes the check. A mismatch is proof of error; a match is not proof of correctness.

## The everyday arithmetic

- **Fractions** add over the least common denominator and reduce by the greatest common divisor; scaling multiplies numerator and denominator directly. Standard arithmetic, as in Wikipedia's *Fraction*.
- **Percents** all reduce to p% of X = X × p ÷ 100. Tip and discount figures are rounded for display to the cent by the money formatter; the underlying arithmetic is exact decimal multiplication before display rounding.
- **Simple interest** I = P × r × t, as in the formula shelf's worked example ($500 × 4% × 3 years = $60). The room names compound interest as the stronger machine but does not bench it.
- **Pythagoras:** a² + b² = c², run in both directions. The page's anchors were computed, not quoted: a 5 m ladder with its foot 1.5 m out reaches √22.75 ≈ 4.77 m; a 55-inch 16:9 diagonal works out to ≈ 47.9 × 27.0 inches.
- **Averages** are the arithmetic mean: total ÷ count. The room notes the average describes the pile, not any member of it; medians and modes are out of scope.

## Huge and tiny numbers

- **Avogadro's number** is taken as 6.022 × 10²³ — the value of the Avogadro constant as fixed by the 2019 SI redefinition (exactly 6.02214076 × 10²³ mol⁻¹; the room uses the four-digit form its benches display). A mole of water is ≈ 18 g (the molar mass of H₂O), described on the page as about a tablespoon (18 mL ≈ 1.2 tablespoons — "about" is doing honest work there). The speed of light preset is 299,792,458 m/s (exact, by definition of the metre). An atom's width of ≈ 1 × 10⁻¹⁰ m and a red blood cell's ≈ 8 × 10⁻⁶ m are order-of-magnitude figures, stated with "about" on the page. Earth's mass preset is 5.97 × 10²⁴ kg.
- **Scientific notation** conversions count decimal-point hops; the digit part is rounded to four decimal places for display on the notation bench, a display choice the tests account for.

## The log tables

The mantissas are the common (base-10) logarithms rounded to four decimal places — the tenths table (1.0–10.0 in steps of 0.1, 91 entries) shared in form with Everyday Engineering's pocket table, and the full hundredths table (1.00–10.00 in steps of 0.01, 901 entries) that the printable sheet carries. The lookup method is the historical one: characteristic from the number's power of ten, mantissa from the table, **linear interpolation (proportional parts)** between entries. Linear interpolation of a curved function is an approximation: across a 0.01 step it lands within about two units in the fourth decimal of the true log (the page's worked example, log 4.372, gives .6407 by the table against a true .64068). The bench deliberately computes by the table's method rather than calling a calculator function, so the wobble is visible instead of hidden; `test.cjs` bounds it at two fourth-decimal units across a spread of values, and verifies every one of the 901 printed mantissas against the true logarithm rounded to four places.

## The calculator and floating point

The calculator's functions are the JavaScript `Math` library's, displayed rounded to twelve significant digits. Binary floating point cannot represent most decimal fractions exactly — 0.1 + 0.2 evaluates to 0.30000000000000004 — and the room's honesty card prints that value as computed live by the visitor's own machine rather than asserting it. Division by zero and out-of-domain function calls (log of a non-positive number, square root of a negative, tan of exactly 90° in degree mode) are refused with an Error display rather than faked.

## The links shelf

Thirteen destinations in three groups, each opened and verified live (HTTP 200) on 19 November 2026: twelve Wikipedia articles — *Multiplication*, *Multiplication table*, *Mental calculation*, *Casting out nines*, *Divisibility rule*, *Fraction*, *Percentage*, *Algebra*, *Pythagorean theorem*, *Logarithm*, *Scientific notation*, *Avogadro constant* — and Math is Fun's *Numbers* index. They are pointers to living pages, not preserved content; their text belongs to their editors and publishers and will change on their schedules.

## Scope lines, stated rather than silent

- The ×11 bench is **two digits**; the trick's general form is named but not benched.
- The checkers **prove wrongness, never rightness** — casting out nines by design, divisibility by direct division (which the bench performs exactly for the verdict and explains by the rule).
- The log benches are **the tables' method, not the calculator's**: fourth-decimal wobble is the historical accuracy, shown on purpose.
- The calculator is a **chain calculator** (operations apply left to right as tapped, no parentheses, no precedence) — the kind a hand actually holds, and the Help says so.
