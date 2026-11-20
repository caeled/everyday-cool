# Everyday Light

An Everyday Cool workshop about light and the colour that rides on it: what light does, and the theory of colour built on top. Two twin mixing benches run the same sliders by opposite rules — lamps adding toward white, pigments subtracting toward a leaky near-black. A twelve-hue wheel strikes colour chords by angle. A thin-lens bench draws the three principal rays and lands the image upside down. A scattering bench reads the blue sky and the red sunset off the single 1/λ⁴ rule. A shadow bench walks a stick's shadow through the day, and a spectrum slider runs the visible band and labels what lives past its ends.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Light.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-light)

## What's inside

- **Two ways to mix** — the centrepiece, twin benches side by side. *Mixing light (additive):* three lamps (red, green, blue) as sliders and as overlapping circles blended on screen; the channels sum, all three at full is white, and red over green makes the additive surprise, yellow. *Mixing paint (subtractive):* the printer's cyan, magenta, and yellow, each a reflectance profile that multiplies the light the others let through — cyan swallows red, magenta swallows green, yellow swallows blue. Real pigments' leak is built into the profiles, so all three at full lands at about rgb(10, 8, 8), a warm near-black — and the bench names that leak as the reason CMYK carries a black cartridge. The honesty line states the standing caveat: screen "paint" is still light, so the bench is the standard subtractive model, not pigment itself.
- **Colour chords** — an SVG wheel of twelve hues at 30° steps. Four chord types, all geometry: complementary (180°, straight across), analogous (three neighbours), triadic (120° steps, an equilateral triangle), split-complementary (the complement's two flanks). Clicking a hue re-roots the chord; the palette below lists the hues and their angles. A companion card makes the pairing explicit — this wheel is the twin of Everyday Sound's circle of fifths: twelve points on a circle, distances as the recipe — and hands the underlying angles and ratios to Everyday Math.
- **The lens bench** — a thin-lens ray diagram: focal length (5–20 cm) and object distance (12–45 cm) sliders, the three principal rays drawn (parallel-then-through-focal, through-focal-then-parallel, straight through the centre), and the image computed from 1/f = 1/do + 1/di with magnification m = −di/do — the minus sign being the inversion. Object inside the focal length switches the bench to the magnifying glass: no real image, dashed backward extensions, an upright virtual image. Object at the focal point reports the image at infinity. The honesty line covers the thin-lens idealisation and real lenses' aberrations and stacked elements.
- **Why the sky is blue** — Rayleigh scattering with the ratio computed, not asserted: (650/450)⁴ ≈ 4.35. A sun-height slider drives the air mass (≈1/sin(altitude)); the sun's disc colour comes from a three-wavelength extinction model (near white overhead, deep red after thirty air masses), and the sky's colour is the scattered remainder — blue overhead, paler at the horizon. The model is labelled a teaching model: clean air, three sample wavelengths; dust and smoke's extra colour is named as what it leaves out.
- **Shadows through the day** — solar altitude and azimuth from the standard spherical formulas, for a latitude (0–65°N), one of four season markers at their exact declinations (solstices ±23.44°, equinoxes 0), and a solar hour. A compass-rose drawing shows the sun's position and the shadow of a stick of chosen height: length = height ÷ tan(altitude), direction exactly opposite the sun. At equinox noon it reduces to height × tan(latitude), the sundial identity — the bench links Everyday Time's sundial and the Survival Guide's shadow stick, which are the same geometry with the stakes changed.
- **Seeing the spectrum** — a slider across 380–750 nm with the colour approximation, the frequency from f = c/λ at the exact c (about 400 THz at the red edge, 789 THz at the violet), and cards for what lives past the ends: infrared (remotes, heat, thermal cameras, pit vipers) and ultraviolet (sunburn, sunscreen, bees' extra colour, fluorescence). The honesty line is double and stated: a screen mixes three lamps to *suggest* spectral colours it cannot emit, and IR/UV are labelled rather than painted because they have no colour for us.
- **Links out** — ten destinations, every one verified live on 20 November 2026, in two groups: the physics of light (OpenStax's optics volume, The Physics Classroom's Light and Color, HyperPhysics on the blue sky) and Wikipedia read-deeper (Rayleigh scattering, Thin lens, Additive color, Subtractive color, Color theory, Color wheel, Electromagnetic spectrum).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (every bench, honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Sound (the other circle of twelve — its circle of fifths and this wheel are twins, and the two rooms link both ways), Everyday Time (its sundial is this room's shadow geometry drawn as a dial; its sundial bench now links back to the shadow bench), Everyday Earth (the weather that rides on the scattered sky), Everyday Math (the angles, ratios, and the lens equation), Everyday Body (the eye — the body's own three-channel additive bench), and Everyday Physics (light in its general, waving form).

## Run it

Open `index.html` in a browser. Everything — benches, wheel, rays, shadows — runs from the files in this folder, offline. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (additive mixing to white and yellow; the subtractive model's endpoints — bare paper white, full CMY a leaking near-black, single pigments' channel behaviour; chord geometry — complements exactly 180° apart for every root, triadic steps of 120°; the thin-lens equation at f = 10, do = 30 → di = 15 and m = −0.5, the magnifier's virtual image, the focal point's image at infinity; the Rayleigh ratio (650/450)⁴ ≈ 4.35; air mass and the sun/sky colour ordering; the equinox-noon shadow at Defiance's latitude equalling height × tan(41.3°); spectrum frequencies at 380, 500, and 750 nm) live in `light.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `light.js` — pure rules: additive and subtractive mixing, the wheel and its chords, the thin lens, Rayleigh scattering, solar position and shadows, the spectrum
- `app.js` — the wiring: the lamp stage, the wheel, the ray diagram, the sky swatches, the compass shadow plot, the spectrum slider
- `style.css` — the room's styling (shared Everyday Cool room styling plus the mixing stage, wheel, lens, sky, shadow, and spectrum)
- `everyday-light-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
