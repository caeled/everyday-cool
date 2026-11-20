# Sources & limitations — Everyday Computing

Everything interactive in this room is computed in the visitor's browser from rules baked into `computing.js`. The page sends nothing anywhere. This file records where the room's facts come from and where its methods stop.

## Binary and the gates

- **Binary place values:** the standard base-2 positional system, as in Wikipedia's *Binary number*: each place worth twice the one before, eight bits (a byte) spanning 0–255. The finger-counting card is the same arithmetic on five bits (0–31) and ten (0–1023).
- **The six gates and their truth tables:** the standard definitions, as in Wikipedia's *Logic gate* — AND, OR, XOR, NAND, NOR on two inputs, NOT on one. The tables in `computing.js` are asserted exhaustively by `test.cjs` against the textbook tables, row by row. The room teaches six gates and no others: XNOR and the rest exist and are named in the sources, but six is where the room's benches stop, and the rule file refuses an unlisted gate rather than improvising one.
- **Boole and Shannon:** the algebra is George Boole's (1847/1854), and its marriage to switching circuits is Claude Shannon's (1937), as in Wikipedia's *Boolean algebra*. The page's claim that NAND or NOR alone can build every other gate is the standard functional-completeness result, stated there and in *Logic gate*.

## Gates that add

- **The half adder:** XOR for the sum bit, AND for the carry — the simplest standard design, as in Wikipedia's *Adder (electronics)*, which also carries the full adder (two half adders and an OR) and the ripple-carry chains the page's fine print describes. The four cases are asserted by the tests, including the one that matters: 1 + 1 gives sum 0, carry 1.
- **Scale claims, kept honest:** the page says a modern phone chip holds billions of gates and switches them billions of times a second. That is the right order of magnitude for current processors (tens of billions of transistors, clock rates in the gigahertz), stated as an order of magnitude rather than a specific product's specification.

## The toy net and the infographic

- **The net** is an original teaching construction for this room: three gates (NOT, AND, AND) wired to recognise the 3-bit pattern 1-0-1, evaluated by the same gate functions the benches use — no shortcut decides its lamp. The tests walk all eight patterns and assert that exactly one lights it, and that the match counts are honest. It is a model of recognition, not a learning machine: it does not train, adapt, or guess, and the Help says so.
- **The infographic** (`gates-pattern.jpg`) is AI-generated art made for Steven Powell's November 2026 posts and copied byte-for-byte from the Nerd Heaven room, where its provenance is recorded. Its own explainer text contains gate-logic errors — an XOR shown lighting on inputs 1 and 1, and a NOT shown leaving its input unchanged. Steven was told before publishing and chose to publish as-is. The room reproduces it with the errors named on the page, and the room's instruments are deliberately held to the opposite standard: correct, and tested. The image is not used as a source for anything the benches teach.

## The logic builder

- **The circuit model** is an original, deliberately small combinational evaluator: sources are the four switches or any gate's output; an unwired input reads 0; evaluation is a memoised walk from each gate and lamp. Feedback (a gate wired, directly or through others, into itself) has no steady state in a combinational model, so the evaluator reports null — shown on the page as "?" — instead of iterating or guessing. That is a scope line, not a bug: real feedback circuits (latches, oscillators) are sequential devices and belong to a room about memory, which this one is not. The model is tested on a two-gate NAND chain, on an XOR assembled from AND/OR/NOT across all four input cases, on loose wires, on a self-wired NOT, and on gate removal.
- **Limits:** twelve gates and four lamps, stated on the page. Both are teaching limits, far above anything the room's exercises need — a full adder fits in five gates.

## Bits and sizes

- **The two ladders:** decimal multiples of the byte climb by 1000 (kilobyte = 1000 bytes, the SI/IEC decimal definition, and the one storage manufacturers use); binary multiples climb by 1024 and carry the IEC names kibibyte, mebibyte, gibibyte, tebibyte (1024 bytes, 1024² bytes, and so on). Both systems and their drift — a terabyte is about 0.9095 tebibytes — are as tabulated in Wikipedia's *Byte*. The bench computes from exact bit counts (a kibibyte is 8192 bits: 1024 × 8), and the tests pin those numbers. Everyday examples on the rungs (a page of text, a phone photo) are labelled "roughly" where they are rough.

## Algorithms

- **Bubble sort** is the standard teaching sort, as described in any algorithms text (Wikipedia's *Algorithm* covers the field and its history — al-Khwarizmi, Lovelace — that the shelf entry recounts). The bench's passes, swaps, and comparisons are counted by the rule functions and asserted by the tests; the scrambles are fixed sets so an exercise can be repeated exactly. Bubble sort is taught here because every step is checkable, and the page says plainly that it is not the fastest sort.
- **The tea test** is the room's own framing of the standard definition — an algorithm is a finite sequence of exact instructions — applied to a kettle.

## The links shelf

Seven destinations in two groups, each checked live on 19 November 2026: six Wikipedia articles — *Binary number*, *Logic gate*, *Boolean algebra*, *Adder (electronics)*, *Byte*, *Algorithm* — and Explain That Stuff's *How computers work*. They are pointers to living pages, not preserved content; their text belongs to their editors and publishers and will change on their schedules.

## Scope lines, stated rather than silent

- Six gates, exhaustively tabled — not the full sixteen two-input functions.
- The toy net recognises **one fixed pattern** and learns nothing; it demonstrates where recognition lives (the wiring), which is the aphorism's claim, at toy scale.
- The builder is **combinational only**: no memory, no clock, no feedback with a steady state — loops are reported, not resolved.
- Sizes are computed in **bits first**, so neither ladder's rounding can smuggle itself in.
- The infographic's errors are **named, not fixed**: the image is a published artefact with its own record in two rooms now, and correcting it silently would falsify both.
