# Everyday Electronics

An Everyday Cool workshop about the electricity already running your house's smallest things: a live circuit bench, Ohm's law and LED resistor benches that show their working, a virtual solderless breadboard you can build real circuits on, a plain-language walk-through of how a crystal radio works with an interactive tuner and a one-transistor amplifier, and four bench builds — a crystal radio, a fruit battery, a paper circuit, and an LED throwie.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Electronics.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-electronics)

## What's inside

- **The circuit bench** — an SVG battery, switch, and bulb. Sliders set the battery voltage (1.5–12 V) and the bulb's resistance; the bulb's brightness follows the computed power, flow dots follow the current, the arithmetic is printed in words, and opening the switch breaks the loop and puts the bulb out. The page states its simplifications plainly: brightness is a picture scale (≈3 W reads as fully bright) and the bulb's resistance is held at the set value.
- **The Ohm's law bench** — fill in any two of voltage, current, resistance; the bench solves the third with the working shown and the full set written out for a backwards check. It refuses one box, three boxes, zeros, and non-numbers, each in plain language.
- **The LED resistor bench** — supply voltage, LED forward voltage (presets for red, yellow, green, blue, white at typical datasheet values, or type your own), and wanted current (default 20 mA). It shows the leftover-voltage subtraction, the exact resistance, the nearest standard E12 value rounded UP for safety, and the power the resistor must shed as heat.
- **Don't Cook the LED** — the room's game (`dont-cook-the-led.html`): seven circuits where you pick an E12 resistor — and, on the wattage level, a power rating — to light an LED at its target current without cooking it or burning the resistor. The wire-only trap on the first level cooks instantly; the first level's winning resistor cooks on the nine-volt level; and one level's in-band value still burns at ¼ W. Its back door (`dont-cook-the-led-lesson.html`) carries Ohm's law, the worked levels, and the coding choices, and opens inside the game from a 📖 Lesson pop-up. Before it shipped, a headless proof verified a winning pick on every level against the game's own pure-function core.
- **The breadboard** — a virtual solderless breadboard with real tie rules (rows tied in fives on each side of the centre groove, continuous power rails down both sides). Parts: batteries (3/5/9 V), an AC source (1–12 V peak, 1–120 Hz), resistors (100 Ω–10 kΩ), capacitors (10/100/1000 µF), LEDs (red/yellow/green, polarity enforced), a toggle switch, a pushbutton, jumper wires, and an NPN transistor (2N2222, deliberately simple model: Vbe ≈ 0.7 V, β ≈ 100). A time-stepped simulation (1/4800 s steps, nodal analysis) runs it live: LEDs light and pop past ≈30 mA, shorts warn instead of exploding, capacitors charge on the true exponential, and an oscilloscope probe clipped to any hole draws that point's voltage. Three presets load working circuits: the LED starter, an RC charge/discharge demo, and the one-transistor amplifier. The page prints its simplifications where everyone can see them.
- **How a simple radio works** — the centrepiece: a labeled signal-flow diagram (antenna → coil + variable capacitor → crystal/1N34A detector → high-impedance earpiece, with ground) and a five-step numbered walk-through: the antenna catches all stations at once; the coil and capacitor resonate with one; the detector keeps half the wave so the voice shape survives; the earpiece turns it back into sound; and there is no battery — the transmitter supplies all the energy, which is why the earpiece must be a sensitive high-impedance type and the sound is faint.
- **The crystal radio bench** — a labeled schematic of the classic set, an interactive tuner (variable capacitor 40–365 pF against a stated 250 µH coil, resonance computed live from f = 1/(2π√(LC))), an AM band strip with five clearly fictional stations whose loudness follows a resonance curve over a static floor, a loudness meter, and a plain-words "what you'd hear" line — plus **the one-transistor amplifier**: a labeled schematic and walk-through of the classic add-on stage (detector → coupling capacitor → biased base → collector resistor → earpiece), a with-amplifier toggle on the tuner, and the same amplifier buildable on the breadboard from the parts pile, where the room's tests measure its gain at ×7.3 under the stated conditions.
- **Build plans** — four cards, each with what you need, numbered steps, what it shows, and an honest safety line: the **crystal radio** (the flagship — coil wound on a cardboard tube, 1N34A diode as the practical crystal, high-impedance earpiece, long-wire antenna, ground; with the 3-penny/foxhole razor-blade-and-pencil detector told as history, and plain safety lines: never near power lines, never during thunderstorms, a grown-up for outdoor wire); the **fruit battery** (an orange front and centre — copper + galvanized nail electrodes, an honest ≈0.9 V per cell, one fruit will NOT light a normal LED, 3–4 in series reach a red LED's ≈2 V, chemical energy → electrical energy); the **paper circuit** (copper tape, CR2032, LED — loops and polarity, with the coin-cell internal-resistance exception stated honestly); and the **LED throwie** (polarity and trickle currents, with the coin-cell/magnet swallowing warnings).
- **Links out** — six destinations, every one verified live on 18 November 2026: PhET's Circuit Construction Kit, the Falstad circuit simulator, All About Circuits, Adafruit Learn, SparkFun Learn, and Khan Academy's electrical engineering introduction. (Science Buddies and Electronics Tutorials were considered and dropped: one answered with a bot-check, the other did not answer at all — see THIRD-PARTY.md.)
- **How electricity works here** — a brief plain-language workshop: the loop rule, push and resistance, series and parallel, polarity, and power becoming heat.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the circuit bench, the Ohm's law bench, the LED resistor bench, the breadboard, the crystal radio, the crystal bench, the transistor amplifier, the build plans, safety plainly, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** The Radio Room (hear the stations the crystal radio would catch — the cross-link runs both ways), Everyday Chemistry (the atoms behind the fruit battery), Tonight's Sky (radio astronomy), and The Games Room (the shape cousin: shelf + things that work on the page + workshop).


## The Electronics Wave (23 November 2026)

Eight benches built by Muse at Steven Powell's direction, to the standard the Antigravity physics exhibits set: a real simulation core under every bench, one fenced pure core driving both the display and a `runProofs()` harness, and a lesson beside each bench printing the measured numbers — bends included.

- `transient-lab.html` / `transient-lab-lesson.html` — **Transient Lab**: RC charge/discharge (exact per-step exponential update) and series RLC ringing (RK4). τ off the trace = RC; ring frequency matches ωd = √(ω₀²−α²).
- `filter-bench.html` / `filter-bench-lesson.html` — **Filter Bench**: RC low/high-pass Bode plots from the exact transfer function (−3.0103 dB, ∓45.0000° at fc), plus a simulated time-domain inset (0.7071 ratio, −44.75° at fc). The lesson names the −17.03 dB corner secant: −20 dB/decade is the asymptote.
- `fourier-builder.html` / `fourier-builder-lesson.html` — **Fourier Builder**: harmonic stacking for square/triangle/sawtooth. Gibbs overshoot measured 8.9507% of the jump at N=49, not shrinking with N; the triangle max-error threshold is reached at N=41, not N=25 as first specced — corrected in print.
- `diode-junction.html` / `diode-junction-lesson.html` — **Diode Junction**: Shockley I–V and depletion width with ni = 1.0×10¹⁰ cm⁻³ stated; 59.53 mV/decade measured, W ∝ √(Vbi−V) exact, Is openly a chosen representative value.
- `op-amp-bench.html` / `op-amp-bench-lesson.html` — **Op-Amp Bench**: inverting/non-inverting gains and a true integrator with hard rail saturation; integrator sine amplitude within 0.0001% of 1/(2πfRC).
- `transmission-line.html` / `transmission-line-lesson.html` — **Transmission Line**: a 200-section lossless LC lattice, Z0 = 50 Ω. Γ measured from the wave: +1.000000 open, −1.000000 short, 0.000000 matched, ±0.333333 at 100/25 Ω. The lattice's Nyquist ripple and the 10-step source rise that tames it are disclosed.
- `modulation-deck.html` / `modulation-deck-lesson.html` — **Modulation Deck**: AM/FM synthesis and demodulation at fs = 48 kHz. Envelope recovery correlation 0.9946 in the good RC regime, 0.8376 in diagonal clipping (shown on purpose); FM deviation exact from phase increments.
- `sampling-lab.html` / `sampling-lab-lesson.html` — **Sampling Lab**: aliasing measured from the samples by DFT; 9 Hz at fs = 10 Hz yields a sequence identical to −1 Hz within 1.5×10⁻¹³; sinc reconstruction recovers the alias (RMS 0.004), not the original (RMS 0.999).

## The Electronics Wave II (23 November 2026)

Nine benches built by Google Antigravity (Gemini) at Steven Powell's direction, integrated byte-for-byte and audited by Muse by driving the shipped code headlessly. Each lesson prints the measured numbers, the bends, and anything false — flagged at the top of the lesson. Three are sibling treatments of Wave I subjects and their lessons carry the side-by-side comparison.

- `transistor-lab.html` / `transistor-lab-lesson.html` — **Transistor Lab**: MOSFET square law exact to every printed digit; the BJT is a constant-β multiplier (no V_BE input), its "Ebers–Moll" knee a flagged misnomer.
- `rlc-resonance.html` / `rlc-resonance-lesson.html` — **RLC Resonance**: f₀ at 0.000% error on seven L/C pairs, Q and Δf exact from its own curve; the shaded −3 dB band is painted f₀ ± Δf/2 instead of geometric — flagged.
- `rf-transmission-line.html` / `rf-transmission-line-lesson.html` — **RF Transmission Line**: FDTD line, Γ telemetry exact to six places on nine loads, in full agreement with the Wave I bench on identical cases; the Z_in readout repeats the load instead of rotating it — flagged.
- `pn-junction.html` / `pn-junction-lesson.html` — **PN Junction**: depletion ratio exactly 2.0000, slopes at ideality × 59.53 mV/dec; V_bi is a heuristic (0.936 V) under a printed textbook formula (0.7143 V), and the Blue LED preset can never emit — both flagged.
- `circuit-sandbox.html` / `circuit-sandbox-lesson.html` — **Circuit Sandbox**: a genuine MNA/Newton–Raphson solver, matching an independent solver on every test circuit (KCL residuals ~10⁻¹⁰ A); a dead short reports 8,911 A, "Converged," with no warning — flagged.
- `logic-gates-lab.html` / `logic-gates-lab-lesson.html` — **Logic Gates Lab**: 1,246 exhaustive rows, zero logic mismatches, a real delay engine with a reproduced hazard glitch; a "DEC" caption wrong on 136/256 subtract rows and a latch labelled a flip-flop — flagged.
- `power-pwm.html` / `power-pwm-lesson.html` — **Power & PWM**: five converter topologies as a sub-stepped ODE solver with a five-mechanism loss model; displayed efficiency is computed against a floored Pin, flattering itself by up to four points — flagged.
- `opamp-studio.html` / `opamp-studio-lesson.html` — **Op-Amp Studio**: eight topologies, gains to 0.006%, sibling agreement with the Wave I bench ≤0.01%; a hidden 1.5 V/µs cap behind the "Ideal (Fast)" slew label — flagged.
- `timer-555-lab.html` / `timer-555-lab-lesson.html` — **555 Timer Lab**: the engine uses exact ln 2 / ln 3 (monostable constant 1.098612, not 1.1), thresholds exactly ⅓/⅔ V_CC; the "50%" badge appears at a measured 12.82% duty — flagged.

## Run it

Open `index.html` in a browser. The benches, walk-through, and build cards work fully offline — they are arithmetic and text. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (circuit state, the Ohm's law solver, E12 rounding, the LED resistor sums, the breadboard engine, the transistor model, the tuner math) live in `elec.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that 6 V across 12 Ω gives 0.5 A and 3 W, that each Ohm's law unknown is solved correctly from the other two, that E12 rounding never rounds down, and that the textbook LED cases come out right (5 V + red LED at 20 mA → 150 Ω; 9 V + red → 350 Ω exact, 390 Ω standard). The breadboard tests work in net space — the same connectivity the page's tie rules produce — and assert: an LED with 220 Ω on 5 V draws ≈14 mA and lights; a backwards LED stays dark; a bare LED on 9 V exceeds its limit and pops; a dead short flags the warning state with finite readouts; an RC pair reaches ≈63% of supply at t = RC; an LED on 60 Hz AC conducts on roughly half the cycle; the amplifier preset (9 V supply, 10 kΩ/1 kΩ base divider, 1 kΩ collector and 100 Ω emitter resistors, 0.2 V-peak 60 Hz input) delivers a measured ×7.3 voltage gain; and the tuner puts 250 µH with 100 pF at ≈1007 kHz.

## Files

- `index.html` — the room itself
- `elec.js` — pure rules: the circuit bench state, the Ohm's law solver, the E12 series and rounding, LED presets and the resistor sums, the breadboard tie rules and time-stepped simulation engine (nodal analysis, capacitor state, LED and transistor models), and the crystal tuner math
- `app.js` — the wiring: the circuit drawing and sliders, the benches, the breadboard board/parts/oscilloscope, and the crystal tuner
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches and diagrams)
- `everyday-electronics-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
- The eight wave benches and their lessons (see "The Electronics Wave" above) — each a single self-contained page with its core and proof harness inside
