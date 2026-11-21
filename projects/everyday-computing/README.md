# Everyday Computing

An Everyday Cool workshop about how a computer is built out of almost nothing: counting in twos on eight switches, the six logic gates with truth tables that fill in as you play, two gates wired into a half adder, a three-gate toy net that recognises one pattern in eight and reports its near misses, a free-form logic builder for wiring circuits of your own, the bit-to-terabyte ladder with the honest 1000-versus-1024 split, and algorithms as recipes — bubble sort you can watch think, and the tea test for exact instructions.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Computing.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-computing)

## What's inside

- **The binary bench** — eight switches with places worth 128 down to 1; flip them to build a number, or type 0–255 and watch the switches set themselves. Companion cards count to 31 on one hand (your fingers are bits) and explain why the places double — the same rule as ordinary counting, with two symbols instead of ten.
- **The gates bench** — all six gates (AND, OR, XOR, NAND, NOR, NOT), each with its switches, its lamp, and a truth table that highlights the row you are standing on, so the table is a record of play rather than a chart to memorise. Below it hangs the gates-pattern infographic from Steven's November 2026 aphorism posts, reproduced exactly as published — with a card naming its label errors (an XOR shown lighting on 1 and 1; a NOT that does not flip) and stating the room's division of labour: the picture is art, published as made; the benches are instruments, correct and tested.
- **The half adder bench** — one XOR (the sum bit) and one AND (the carry) sharing two inputs; all four cases, with the answer read in binary and checked in ordinary numbers. The fine print carries the honest marvel: chained full adders are all a computer is doing, billions of times a second.
- **Wire the Adder** — the room's game (`wire-the-adder.html`): wire gates into circuits that actually add, across six levels — pick the gate that knows XOR, build XOR from AND/OR/NOT, a half adder, a full adder, majority vote, and a two-bit adder finale — graded live against the full truth table (44 rows across the levels). Its back door (`wire-the-adder-lesson.html`) explains gates, adders as counting machines, and the readable-netlist coding choice, and opens inside the game from a 📖 Lesson pop-up. Before it shipped, a headless proof ran every level's reference wiring through the game's own evaluator: all pass, and no level starts solved.
- **The toy net bench** — a NOT, an AND, and an AND wired to recognise the pattern 1-0-1: a live wiring diagram, a table of all eight patterns, and a match count so near misses register as information. It is Steven's troubleshooting aphorism built from gates — the pattern lives in the wiring, not in any single gate — and it links up to the Nerd Heaven panel where the aphorism hangs.
- **The logic builder** — a free-form board: four switches, up to twelve gates placed from a parts bin, up to four lamps, wired by two taps (tap an output to pick its wire up, tap an input slot to plug it in). Unwired inputs read 0; a gate wired into a loop with itself honestly reports "?" rather than guessing. The preset builds XOR from OR, AND, NOT, and AND — through the same wiring functions your own taps use.
- **The sizes bench** — any amount read on every rung of both ladders: decimal (kilobyte = 1000 bytes, the disk-box rule) and binary (kibibyte = 1024 bytes, memory's rule), with the drift between them shown, not smoothed over — a terabyte is about 0.91 tebibytes. Unit honesty links sideways to Everyday Measure.
- **The sorting bench and the recipe cards** — bubble sort on five cards, one narrated pass at a time or the full run with its bill of passes, swaps, and comparisons; the tea test ("make tea" is not an algorithm, because a machine cannot guess); and the code thread out to Secret Squares and Everyday Language.
- **Links out** — seven destinations, every one verified live on 19 November 2026: the ideas one by one on Wikipedia (Binary number, Logic gate, Boolean algebra, Adder (electronics), Byte, Algorithm) and Explain That Stuff's whole-machine tour.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (counting in twos, the gates and their tables, gates that add, the toy net, the logic builder, bits and sizes, a program is a recipe, the links shelf, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Electronics (the circuits that carry the gates), Everyday Math (the numbers the bits count), Nerd Heaven (the aphorism and its picture), Secret Squares and Everyday Language (the code thread), and Everyday Measure (unit honesty).

## Run it

Open `index.html` in a browser. Every bench works fully offline — they are data and arithmetic. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (binary conversion, the six gates and their truth tables, the half adder, the toy net, the size ladders, bubble sort, and the logic builder's circuit model) live in `computing.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that 42 round-trips through 00101010, that every gate's table is complete and correct, that 1 + 1 at the adder gives sum 0 and carry 1, that the toy net lights for exactly one of the eight patterns, that a kibibyte is 8192 bits while a kilobyte is 8000, and that the builder evaluates an XOR assembled from AND/OR/NOT correctly on all four input cases — and reports a self-wired NOT gate as unsettled rather than guessing.

## Files

- `index.html` — the room itself
- `computing.js` — pure rules: binary conversion, the gates and truth tables, the half adder, the toy net, the size ladders, bubble sort, and the logic builder's circuit model (place, wire, evaluate)
- `app.js` — the wiring: the binary bench, the gates bench, the adder, the toy net's live diagram, the logic builder board, the sizes bench, the sorting bench
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches)
- `everyday-computing-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `gates-pattern.jpg` — the AI-generated gates infographic from Steven's November 2026 posts, copied from the Nerd Heaven room (see COLLECTION.md)
- `test.cjs` — rule tests
