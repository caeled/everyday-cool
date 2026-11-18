# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data files are bundled in this folder.

## Data sources (facts, not files)

- **Ohm's law and power** — V = I × R and P = V × I, the standard relations taught in every introductory electronics text (e.g. the All About Circuits textbook linked from the room). The benches' arithmetic is computed, not copied, and `test.cjs` re-checks known cases on every run.
- **LED forward voltages** — the typical values printed in ordinary indicator-LED datasheets and hobby references: red ≈ 2.0 V, yellow ≈ 2.1 V, green ≈ 2.2 V, blue ≈ 3.2 V, white ≈ 3.2 V. Individual LEDs vary (a red LED may be anywhere near 1.8–2.2 V); the page and Help say the LED's own packet is the authority.
- **The E12 resistor series** — the standard twelve values per decade (1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2) in which ordinary resistors are manufactured and sold.
- **Fruit cell voltage** — a copper/zinc cell in citrus juice measures roughly 0.9 V in practice (classroom measurements commonly land between 0.8 and 1.0 V depending on the fruit and electrodes). The card gives the honest range's middle and the real lesson: one cell cannot reach a red LED's ≈2 V lighting threshold.
- **The crystal radio** — the classic single-coil crystal set as described in decades of hobby literature: about 100 turns on a wide cardboard form, a germanium diode (1N34A) as the reliable form of the original galena crystal detector, a ~365 pF variable capacitor or a sliding coil contact for tuning, a high-impedance (crystal/ceramic) earpiece, a long-wire antenna, and an earth ground. The foxhole-radio note (razor blade + pencil lead detector) is documented wartime history, presented as history, not as the recommended build.

## Linked, not loaded (each opens in a new tab, under its own terms)

PhET Circuit Construction Kit (phet.colorado.edu) · Falstad Circuit Simulator (falstad.com) · All About Circuits (allaboutcircuits.com) · Adafruit Learn (learn.adafruit.com) · SparkFun Learn (learn.sparkfun.com) · Khan Academy electrical engineering (khanacademy.org). Every link was checked live on 18 November 2026 and returned HTTP 200. Two candidates were checked the same day and deliberately dropped: Science Buddies' electronics project index answered a direct request with an HTTP 403 bot-check, and electronics-tutorials.ws did not answer at all — a dead or gated door is not shipped on the shelf.

## Nothing is called at view time

This page makes no network calls at all: the benches run entirely in the browser from the rules in `elec.js`, and the shelf links are only followed when a visitor presses one.

## Limitations

The circuit bench holds the bulb's resistance fixed at the set value; a real filament bulb's resistance rises as it heats, so a real circuit's numbers drift a little from the bench's. Brightness is a picture scale (≈3 W = fully bright), not a photometric claim. Flow dots use the textbook conventional-current direction. The crystal radio diagram is a labeled signal-flow picture, not a wiring schematic; the build card's words are the wiring instructions. Build plans are introductions for bench voltages only (coin cells, small batteries, fruit, and no battery at all) — nothing here is a guide to working on mains-powered equipment, and the room says so. Descriptions were written on 18 November 2026; each linked site's own pages are the authority.
