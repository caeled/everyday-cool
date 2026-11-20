# Everyday Engineering

An Everyday Cool workshop about the six simple machines and the building sense that grows out of them: five playable benches (lever, pulley, ramp, frames, and the pocket log table), the wedge and the screw taken apart, the one rule no machine can break, and the field half of the room cross-linked with The Survival Guide both ways.

## What's inside

- **The six simple machines** — one card each, each with its everyday disguises: the lever (bottle opener, crowbar, forearm), the wheel & axle (doorknob, jar lid, screwdriver), the pulley (flag pole, crane, blinds), the inclined plane (ramps, switchbacks), the wedge (axe, doorstop, front teeth — two ramps back to back), and the screw (a ramp wrapped around a pole, in those words: jar lids, wood screws, car jacks).
- **The lever bench** — a crate on a 3-metre beam; slide the fulcrum and the readout shows the two arms, the mechanical advantage (effort arm ÷ load arm), the push needed, and the distance trade that pays for it. Framed as work — lift the load — not as Physics' balancing seesaw.
- **The pulley bench** — rig one to four rope segments; effort = load ÷ segments, rope pulled = segments × lift height, both stated on the same line, with the honesty note that real pulleys lose some to friction and a safety line about never standing under a hoisted load.
- **The ramp bench** — a slope slider; push = load × sin(slope), read out for a 1-metre climb with the ramp's length and rise-to-run ratio, against the accessibility anchor: the wheelchair-ramp standard of 1:12 (about 4.8°), computed on the page from the same rules.
- **The frames bench** — push a square frame, a triangle, and a braced square: the square racks by the full push, the other two hold at zero, because a triangle's angles are fixed by its side lengths. The reason bridges, trusses, and farm gates are full of triangles.
- **The two that move** — the wedge (splitting wood, with struck-tool safety) and the screw (an unwrapped-thread diagram showing the ramp inside it), each drawn in inline SVG.
- **The pocket log table** — the engineer's pocket calculator for three centuries (Napier, 1614, to the electronic calculator): a ninety-entry table of four-decimal mantissas for 1.0–9.9, the characteristic-plus-mantissa rule that stretches it to any number (500 = characteristic 2 + mantissa .6990 = 2.6990), a bench that looks numbers up *the table's way* — interpolation and its small fourth-decimal wobble included, on purpose — a worked interpolation example (log 2.53 ≈ .4030 by proportional parts), and the slide rule named as the same table turned into lengths on a stick.
- **The rules none of them break** — force is multiplied, energy never is; friction always takes a cut; multiplied force is multiplied danger (rigging safety).
- **Out in the field** — the cross-link to The Survival Guide: splitting firewood is the wedge, hoisting food is the pulley, moving rocks is the lever, hauling is the ramp. The Survival Guide's Links Out section carries the return card.
- **Links out** — twelve destinations in three grouped shelves, every one verified live on 19 November 2026: the six machines one by one on Wikipedia (Simple machine, Lever, Wheel and axle, Pulley, Block and tackle, Inclined plane, Wedge, Screw), the arithmetic behind the benches (Mechanical advantage, Logarithm, Slide rule), and one plain-English explainer (Explain That Stuff's Simple machines).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the four benches, ideal vs real machines, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Physics (the laws the machines spend), Everyday Measure (the numbers the benches speak), and The Survival Guide (the field half).

## Run it

Open `index.html` in a browser. The machines, benches, and Help work fully offline — they are arithmetic, geometry, and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (lever, pulley, ramp, the 1:12 standard, frame lean, the log table) live in `engineering.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that a 90 kg crate on a 3 m beam with the fulcrum 0.5 m away lifts with 18 kg of push (MA 5), that three pulley segments cut a 90 kg load to a 30 kg pull at 3 metres of rope per metre of lift, that a 30° ramp halves the push, that 1:12 works out to about 4.8°, that a pushed square leans by the full push while a triangle and a braced square lean zero, and that the table returns log 2 = 0.3010 and log 500 = 2.6990 exactly, with log 2.53 interpolated to .4030 — within two fourth-decimal units of the true value.

## Files

- `index.html` — the room itself
- `engineering.js` — pure rules: the lever, pulley, and ramp arithmetic, the 1:12 ramp standard, the frame-lean model, the log table and its interpolated lookup, formatting
- `app.js` — the wiring: the four benches and their SVG drawings
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches)
- `everyday-engineering-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
