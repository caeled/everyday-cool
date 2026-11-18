# Everyday Electronics

An Everyday Cool workshop about the electricity already running your house's smallest things: a live circuit bench, Ohm's law and LED resistor benches that show their working, a plain-language walk-through of how a crystal radio works, and four bench builds — a crystal radio, a fruit battery, a paper circuit, and an LED throwie.

## What's inside

- **The circuit bench** — an SVG battery, switch, and bulb. Sliders set the battery voltage (1.5–12 V) and the bulb's resistance; the bulb's brightness follows the computed power, flow dots follow the current, the arithmetic is printed in words, and opening the switch breaks the loop and puts the bulb out. The page states its simplifications plainly: brightness is a picture scale (≈3 W reads as fully bright) and the bulb's resistance is held at the set value.
- **The Ohm's law bench** — fill in any two of voltage, current, resistance; the bench solves the third with the working shown and the full set written out for a backwards check. It refuses one box, three boxes, zeros, and non-numbers, each in plain language.
- **The LED resistor bench** — supply voltage, LED forward voltage (presets for red, yellow, green, blue, white at typical datasheet values, or type your own), and wanted current (default 20 mA). It shows the leftover-voltage subtraction, the exact resistance, the nearest standard E12 value rounded UP for safety, and the power the resistor must shed as heat.
- **How a simple radio works** — the centrepiece: a labeled signal-flow diagram (antenna → coil + variable capacitor → crystal/1N34A detector → high-impedance earpiece, with ground) and a five-step numbered walk-through: the antenna catches all stations at once; the coil and capacitor resonate with one; the detector keeps half the wave so the voice shape survives; the earpiece turns it back into sound; and there is no battery — the transmitter supplies all the energy, which is why the earpiece must be a sensitive high-impedance type and the sound is faint.
- **Build plans** — four cards, each with what you need, numbered steps, what it shows, and an honest safety line: the **crystal radio** (the flagship — coil wound on a cardboard tube, 1N34A diode as the practical crystal, high-impedance earpiece, long-wire antenna, ground; with the 3-penny/foxhole razor-blade-and-pencil detector told as history, and plain safety lines: never near power lines, never during thunderstorms, a grown-up for outdoor wire); the **fruit battery** (an orange front and centre — copper + galvanized nail electrodes, an honest ≈0.9 V per cell, one fruit will NOT light a normal LED, 3–4 in series reach a red LED's ≈2 V, chemical energy → electrical energy); the **paper circuit** (copper tape, CR2032, LED — loops and polarity, with the coin-cell internal-resistance exception stated honestly); and the **LED throwie** (polarity and trickle currents, with the coin-cell/magnet swallowing warnings).
- **Links out** — six destinations, every one verified live on 18 November 2026: PhET's Circuit Construction Kit, the Falstad circuit simulator, All About Circuits, Adafruit Learn, SparkFun Learn, and Khan Academy's electrical engineering introduction. (Science Buddies and Electronics Tutorials were considered and dropped: one answered with a bot-check, the other did not answer at all — see THIRD-PARTY.md.)
- **How electricity works here** — a brief plain-language workshop: the loop rule, push and resistance, series and parallel, polarity, and power becoming heat.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the circuit bench, the Ohm's law bench, the LED resistor bench, the crystal radio, the build plans, safety plainly, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** The Radio Room (hear the stations the crystal radio would catch — the cross-link runs both ways), Everyday Chemistry (the atoms behind the fruit battery), Tonight's Sky (radio astronomy), and The Games Room (the shape cousin: shelf + things that work on the page + workshop).

## Run it

Open `index.html` in a browser. The benches, walk-through, and build cards work fully offline — they are arithmetic and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (circuit state, the Ohm's law solver, E12 rounding, the LED resistor sums) live in `elec.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that 6 V across 12 Ω gives 0.5 A and 3 W, that each Ohm's law unknown is solved correctly from the other two, that E12 rounding never rounds down, and that the textbook LED cases come out right (5 V + red LED at 20 mA → 150 Ω; 9 V + red → 350 Ω exact, 390 Ω standard).

## Files

- `index.html` — the room itself
- `elec.js` — pure rules: the circuit bench state, the Ohm's law solver, the E12 series and rounding, LED presets and the resistor sums
- `app.js` — the wiring: the circuit drawing and sliders, both benches
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches and diagrams)
- `everyday-electronics-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
