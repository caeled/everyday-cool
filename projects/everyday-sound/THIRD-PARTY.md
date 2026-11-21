# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, samples, or data files are bundled in this folder — the piano's five voices are synthesized from parameter recipes in `sound.js`, and the one melody, Beethoven's Ode to Joy (1824), is public domain and embedded as note data.

## Data sources (facts, not files)

- **Decibel ladder values** — the typical levels published for familiar sounds by US safety authorities: OSHA's noise pages (osha.gov/noise) and NIOSH's noise guidance (85 dBA recommended exposure limit, 3 dB exchange rate — the safe time halving per +3 dB used by the ladder bench). The values are typical, not exact: real readings vary with the machine and, strongly, with distance. (CDC/NIOSH pages answer automated link-checkers with HTTP 403; the OSHA page, carrying the same federal guidance, is the shelf's verified link, and the NIOSH criteria are cited here as the source of the 85 dB / 3 dB rule.)
- **Speed of sound** — 343 m/s in air at 20 °C, temperature coefficient ≈ +0.6 m/s per °C; ≈1,480 m/s in water; ≈5,960 m/s in steel (longitudinal, in a rod or rail). Standard acoustics reference values, cross-checked against the Wikipedia article on the shelf.
- **Tuning mathematics** — equal temperament from A4 = 440 Hz (ISO 16). Pure (just) interval ratios 2:1, 3:2, 4:3, 5:4 are the standard small-integer ratios; the tritone's 45:32 is one traditional just spelling (the tempered tritone is exactly √2). Cents differences computed as 1200·log₂ of the ratio of ratios: the tempered fifth (2^(7/12) ≈ 1.498307) sits ≈2 cents flat of the pure 3:2; the tempered major third ≈14 cents sharp of 5:4. `test.cjs` re-checks these figures.
- **Drum-skin overtones** — the first inharmonic partials of a circular membrane (≈1.59, 2.14, 2.30 × the fundamental) are standard acoustics results for an ideal membrane; real drums differ in detail.
- **The MIDI format** — the reader and writer in `sound.js` implement the Standard MIDI File specification (MThd/MTrk chunks, variable-length quantities, running status, meta events including tempo 0x51) as published by the MIDI Manufacturers Association, now the MIDI Association (midi.org/specs, verified live 20 November 2026). The writer emits format 0 at 480 ticks per quarter note with full status bytes. The reader handles formats 0 and 1, merges tracks for playback, and honours tempo changes; it deliberately ignores most controller, program-change, and system-exclusive content, and the page says so.
- **WebAudio and Web MIDI** — implemented against the W3C Web Audio API and Web MIDI API as shipped in current browsers. Web MIDI is available in Chromium browsers (Chrome/Edge) and requires the visitor's permission; the bench treats it strictly as progressive enhancement. No audio is recorded by the page: the "recorder" writes down note numbers and times, never sound.

## Linked, not loaded (each opens in a new tab, under its own terms)

OSHA Noise (osha.gov) · OpenStax University Physics — Sound Waves (openstax.org) · Explore Sound, Acoustical Society of America (exploresound.org) · Wikipedia: Speed of sound, Decibel, Equal temperament, Circle of fifths, Bone conduction (wikipedia.org) · The Mutopia Project (mutopiaproject.org) · IMSLP (imslp.org) · BitMidi (bitmidi.com) · FreeMidi (freemidi.org) · MIDIWorld (midiworld.com) · The MIDI Association specifications (midi.org). Every link was checked live on 20 November 2026 and returned HTTP 200 to a browser-style request. One candidate archive, KernScores, did not answer and was left off the shelf.

## Nothing is called at view time

This page makes no network calls at all: the benches, piano, MIDI player, and recorder run entirely in the browser from code in this folder, and a MIDI file the visitor opens is read from their own disk by the browser — it is never uploaded. The shelf links are only followed when a visitor presses one.

## The game — Tune the String

`tune-the-string.html` is an original Everyday Cool game built by Muse on 20 November 2026: match a target note with length and tension sliders under the real string formula f = (1/2L)·√(T/μ), and win by the tuner's real method — play both notes together and tune until the beating between them dies. Its simplifications, named plainly: the string is **ideal** — no stiffness, so none of the inharmonicity that stretches a real string's overtones sharp; the string's mass per unit length (μ) is **fixed within a round** rather than a third control; the targets are **equal-tempered** notes — the piano's compromise from the intervals bench, not pure ratios; and the two voices are **synthesized stand-ins**, sine-based tones chosen so the beating is easy to hear, not recordings of real strings.

Its arithmetic is proven, not just asserted: the formula, cents, and beating tests all pass, and every round's target is reachable inside the shipped slider ranges — the solver's witnesses land within 1.2 cents of each target. What no test can check is the sound itself: audio cannot be verified headless, so the game's receipt is Steven's ears — the same receipt the piano bench ships on.

## Limitations

The tone bench's oscillator is a pure sine; real instruments are fundamentals plus overtones, which is exactly the gap the voice recipes and the strings/skins card talk about. Playback of loaded MIDI files schedules notes through a single chosen voice and honours tempo changes, but it is a player piano, not a studio: controllers, program changes, and per-channel instruments are ignored, and very dense files may light keys approximately. Recordings keep note numbers, timing, and (where the input reports it) velocity — no pedal, no aftertouch. Displayed frequencies are rounded for reading; the underlying arithmetic in `sound.js` is unrounded and test-covered. Descriptions were written on 20 November 2026; each linked site's own pages are the authority.
