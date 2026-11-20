# Everyday Sound

An Everyday Cool workshop about the physics you can hear — pitch, loudness, echoes, and how instruments and ears make sound — and about the music built on top of it, which Steven frames as *math geometry with sound*: intervals as ratios, rhythm as fractions, pitch as logarithms, and the circle of fifths as a ring you can navigate. It ends at a playable two-octave piano that loads, plays, records, and writes real MIDI files.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Sound.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-sound)

## What's inside

- **The tone bench** — a WebAudio sine oscillator on a logarithmic slider (30–4000 Hz) with Play/Stop. The readout names the nearest equal-tempered note (with its error in cents) and the tone's wavelength in air. A safety line (modest volume, especially on headphones) and an honesty line (small speakers reproduce the low end as harmonics, not the fundamental) ride on the bench.
- **The decibel ladder** — nine everyday sounds at their typical published levels, and a comparison bench: pick any two and see the dB difference, the intensity multiple (×10 per +10 dB), the rule-of-thumb loudness multiple (×2 per +10 dB), and NIOSH's safe-exposure time for the louder sound (85 dB / 8 h, halving per +3 dB). The variability of real-world levels — distance above all — is stated on the page.
- **Strings & skins** — a string bench from an open A string (110 Hz): length and tension sliders with presets for the octave (½ length), fifth (⅔), fourth (¾), and the tension octave (×4), the frequency computed as base ÷ length × √tension and the standing wave drawn to match. A companion card explains drum skins' inharmonic overtones — why drums sound unpitched, and why bells sound like bells.
- **Echoes & thunder** — an echo-ranging bench (return time → wall distance, temperature-adjusted speed of sound) and a thunder bench that sets the seconds÷3 rule of thumb beside the computed distance and names the rule's small, safe error.
- **Sound travels** — time a distance through air (343 m/s), water (1,480 m/s), and steel (5,960 m/s), with the railway-listening worked example: through the rail, the train arrives seconds early.
- **The voice you hear** — two cards on bone conduction: why your recorded voice sounds like a stranger (you hear yourself by air *and* bone; recordings keep only the air), and bone-conduction headphones as the same channel used on purpose. Links to Everyday Body.
- **Intervals — music is ratios** — six intervals (unison, major third, perfect fourth, tritone, perfect fifth, octave) played as tone pairs from a selectable root, each with its pure ratio, pure frequency, equal-tempered frequency, and the piano's error in cents. A toggle plays pure ratios or piano tuning. The temperament honesty line gives the canonical figures: pure fifth 1.500 vs tempered 1.498.
- **The little piano** — two octaves (C4–C6) drawn as real keys, played by pointer, touch, computer keys (A W S E D F T G Y H U J K, Z/X shift octave), or a Web MIDI keyboard where the browser offers one (Chrome/Edge, permission-gated, progressive enhancement only). Five synthesized voices — Piano, Organ, Plucked string, Bell, Synth — built live from harmonic partial recipes and envelopes; no samples. Every press shows the note name, frequency, and C-major scale degree; the major scale's W W H W W W H pattern is spelled out in chips under the keys, with a play-the-scale button.
- **Take a song with you** — a Standard MIDI File reader and writer in plain JavaScript, no library. Load a `.mid` (formats 0 and 1, running status, tempo maps honoured, tracks merged) and it plays through the chosen voice with the keys lighting as notes sound; the file is parsed locally and never uploaded. A built-in demo plays Beethoven's Ode to Joy (public domain) through the same path. A recorder captures everything played on the piano — pointer, computer keys, or MIDI keyboard — with timing, plays it back, and downloads it as a real format-0 `.mid` (480 ticks/quarter, tempo meta event) that opens anywhere MIDI plays.
- **Rhythm is fractions** — fill a 4/4 measure with whole, half, quarter, and eighth notes; the bench sums the fractions (kept in eighths, so the verdict is exact) and says whether the measure is complete, short, or bursting. Cross-linked to Everyday Math's fractions bench.
- **The circle of fifths** — an SVG ring of the twelve pitch classes, each a perfect fifth (3:2) from its neighbour; click a note to hear it and its fifth, with the readout naming the near-miss — twelve pure fifths overshoot seven octaves by a comma — that equal temperament exists to absorb.
- **Links out** — thirteen destinations, every one verified live on 20 November 2026, in four groups: OSHA's noise pages; OpenStax's sound chapter and the Acoustical Society of America's Explore Sound; Wikipedia read-deeper (Speed of sound, Decibel, Equal temperament, Circle of fifths, Bone conduction); and a free-MIDI-libraries group (Mutopia, IMSLP, BitMidi, FreeMidi, MIDIWorld, and the MIDI Association's specification pages).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (every bench, honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Physics (the waves in general), Everyday Math (the ratios, fractions, and logarithms this room spends — cross-linked both ways), Everyday Body (the ears), The Radio Room (sound at a distance), Everyday Measure (the units), and Everyday Earth (the thunder).

## Run it

Open `index.html` in a browser. Everything — benches, piano, MIDI player and recorder — runs from the files in this folder, offline. Only the Links Out shelf needs the internet. Web MIDI input needs Chrome or Edge and your permission; every other feature works in any modern browser.

## Tests

```
node test.cjs
```

The rules (pitch and note naming, decibel arithmetic and the NIOSH halving rule, echo and thunder distances, string scaling, interval ratios vs temperament in cents, measure sums, the circle's fifth steps, the piano's key map and voice recipes, and the MIDI writer/reader — including a full round trip, a hand-built format-1 file, and a mid-file tempo change) live in `sound.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `sound.js` — pure rules: pitch, decibels, echoes, strings, intervals, rhythm, the circle, voice recipes, the MIDI reader/writer
- `app.js` — the wiring: WebAudio benches, the piano and its voices, Web MIDI, playback, recording
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches, piano, measure bar, and circle)
- `everyday-sound-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
