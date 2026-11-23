# Everyday Body · Human Body Lab

An Everyday Cool workshop about the body you carry around: a working atlas of twelve organs you can pick from a front-view figure, a brain explorer that gives the brain a room of its own — six tappable surface structures and twelve region topics, surface and deep — a "connect the dots" mode that follows everyday actions across cooperating systems, a six-question thinking check, and a screen-free activity to finish.

The workshop was designed and built by **ChatGPT** at Steven Powell's direction (see COLLECTION.md) and integrated into the collection by Muse with the house wiring described below. It ships as a single self-contained HTML file: every diagram is inline SVG drawn for this room, and there are no external images, stylesheets, scripts, or fonts.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Body.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-body)

## What's inside

- **The body atlas** — a simplified front-view figure (not to scale; some organs are drawn through others so they can be selected). Filter chips fade the organs outside one system — Nervous, Circulatory, Respiratory, Digestive, Urinary, Sensory, Musculoskeletal — and tapping an organ on the figure, or its button below, opens its story in the Discover panel: a summary, what it does, one thing to notice, and an "Explore further" shelf of OpenStax, Wikipedia, and NINDS reading.
- **The brain explorer** — the brain gets the workshop inside the workshop. Its detail view is a side-view diagram with six coloured, independently selectable surface structures (frontal, parietal, temporal, and occipital lobes, cerebellum, brainstem), and twelve region buttons below it add the deeper structures the side view cannot show: hippocampus, amygdala, thalamus, hypothalamus, basal ganglia, and corpus callosum among them. The room states its honest rule on the page: complex functions emerge from networks across regions, rather than belonging to one region alone.
- **Connect the dots** — choose an everyday action (running to catch a bus, eating an apple, hearing your name, cooling off on a hot day) and a chain shows which organs cooperate, in order, with what each contributes. An effort slider beside it models rising demand — labelled on the page as illustrative, not a measurement.
- **Check your thinking** — six questions drawn from the atlas, each marked on the spot with the reason why.
- **Try this without a screen** — an educator's corner: find your pulse, walk for a minute, check again, and compare observations rather than scores, with a discussion prompt about networks picking up each other's load.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the atlas, the brain explorer, connect the dots, the quiz, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Physics, Everyday Chemistry, and Everyday Electronics — the rest of the Science block. The connections mode is this room's version of their shared lesson: systems are cooperations, not parts lists.

## Run it

Open `index.html` in a browser. Everything — body imager, Body Detective, atlas, brain explorer, scenarios, quiz, Help — works fully offline from the single file. Only the "Explore further" links need the internet.

## Tests

```
node test.cjs
```

The tests confirm the page stays self-contained (no external images, stylesheets, or scripts), that its inline script parses and runs (executed against a minimal DOM stub, checking the atlas, scenario chain, and quiz all render), that all twelve organs and all twelve brain regions are present, and that the Help wiring is in place.

## Files

- `index.html` — the room itself: page, styling, inline SVG atlas and brain diagram, and the workshop's script, all in one file
- `everyday-body-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — self-containment, content, and script checks

## Human Body Lab (21 November 2026)

The organ atlas and all twelve brain topics are preserved. The new activity navigation leads to:

- **Body imager:** 25 selectable regions, adapted from the collection's `prototypes/body-symptom-mapper/body-symptom-mapper.html` geometry. Front/back switches preserve the selected anatomical side. Four topics cover regions, muscles, bones/joints, and nerves. The colors identify the selected topic; the ellipses are regional hit areas, not drawings of individual muscles, bones, or nerve territories. Text describes examples in or serving each region, including deep structures. A labeled region selector provides the same experience without pointing at the diagram. Tab to a shape and use Enter or Space to select it.
- **Body Detective:** five fictional cases about breathing, elbow movement, texture, walking, and balance. Predict in a session-only notebook, reveal a clue, compare an explanation, and investigate a follow-up question. Each case links to the relevant imager region and organ. Notes and reveal states persist across case switching but clear on reload; nothing is uploaded or stored in browser storage.

Learning goal: connect a location to structures and explain how support, force, and signals cooperate. No symptom journal or diagnostic output is included. The original prototype is unchanged. The educational imager uses front/back SVG views rather than the prototype's free-rotation canvas, giving every region a keyboard-accessible control.

Open the downloaded folder's `index.html` directly, even with networking disabled. All core code and diagrams are inline; the decorative banner is a local JPEG. External reading requires internet. Downloading the workshop is required for reliable offline use; this is not a service-worker-cached website.

### Browser regression checks

`node test.cjs` runs dependency-free checks. With Playwright installed in your test environment, `node browser-test.cjs` exercises all regions, views and topics, each detective case and cross-link, notes, keyboard selection, all quiz answers, 12 organs and brain topics, and mobile overflow with HTTP(S) blocked. Set `BODY_TEST_SCREENSHOT` to save a desktop screenshot; Playwright is a test-only dependency and is not loaded by the workshop.

## The Biology Wave · 23 November 2026

Five interactive biology exhibits built by Google Antigravity (Gemini) at Steven Powell's direction — wave 1 of Antigravity's five-wave challenge — integrated byte-for-byte and audited by Muse by driving the shipped code headlessly. Each exhibit stands exactly as delivered; each lesson beside it prints what the audit measured, bends and falsehoods included.

- **BioPower** (`atp-photosynthesis.html`): photosynthesis and respiration as one proton turbine. Modern P/O stoichiometry that sums clean (10 H⁺/NADH → 2.5 ATP) — priced two ways on the same page (3.3 vs 4.0 H⁺/ATP), a DNP uncoupler that never collapses ATP, and the carbon half of the topic absent. Lesson: `atp-photosynthesis-lesson.html`.
- **Helix — DNA & CRISPR Lab** (`dna-crispr-lab.html`): a perfect codon table (64/64 driven, zero mismatches) and a canonical PAM−3 Cas9 cut — but the HDR preset's guide is shifted one base and can never fire, and its "indel" is three substitutions. Lesson: `dna-crispr-lab-lesson.html`.
- **Cardio — heart hemodynamics** (`heart-hemodynamics.html`): a good pressure model (settled 111/81, MAP 91) over a broken volume pump — the mitral valve never opens, so resting output decays to SV ≈ 9 mL, EF 12% (its clamp floor), CO ≈ 0.65 L/min. Broken as shipped; the lesson documents the failure and its one-inequality root cause. Lesson: `heart-hemodynamics-lesson.html`.
- **Darwin — evolution terrarium** (`evolution-terrarium.html`): a genuine asexual evolution sim — drift variance matched haploid theory within 3%, selection flips with the food supply — with no Hardy–Weinberg machinery inside, and a "cubic" metabolic cost that measures size^1.55. Lesson: `evolution-terrarium-lesson.html`.
- **Physarum — slime mold networks** (`physarum-ecosystem.html`): a real Jones (2010) agent model — maze solved at 0.99× the optimum, re-route at 1.03× — whose Tokyo web measures 1.91× the minimum length and never fully connects, and whose "ecosystem" contains no populations at all. Lesson: `physarum-ecosystem-lesson.html`.

The wave is featured at the top of the room's `index.html`, on Dad's Arcade (112 games / 112 lessons), on the Nerd Heaven shelf (97 lessons), and as Java Young Robot Builders back doors 92–96.

### Cardio — the sanctioned valve fix · 23 November 2026

The Biology Wave audit found `heart-hemodynamics.html` broken as shipped: its mitral valve never opened (the end-diastolic LV pressure floor, 11 mmHg at 100% preload, sat permanently above left-atrial pressure, so the +0.8 mmHg opening gradient was unreachable — measured open fraction 0.000), and the resting heart decayed to SV ≈ 9 mL, EF 12% (clamp floor), CO ≈ 0.65 L/min. On 23 November 2026 Steven Powell sanctioned a one-line fix — the third sanctioned guest-file edit in the collection, after Zenith Chess and Orbital Pinball. The EDP term in `heart-hemodynamics.html` changed from `6 + 5 * preload` to `5 * preload - 1` (EDP at 100% preload: 11 → 4 mmHg); nothing else in the file changed (sha256 `a3eff107…` → `b09163f2…`).

Re-driven the same way after the fix: the valve opens 64% of the cycle, the ventricle fills to its EDV target (133 of ≈134 mL), and settled Normal Sinus measures SV 19.2 mL, EF 14.4% (real arithmetic again, off the clamp floor), CO 1.38 L/min at an unchanged 111/81. The fix also unmasked a second defect the audit could not see while the ventricle never filled: ejection is capped (measured ESV 114 mL vs a target ESV of 44 mL), so the exhibit still does not meet its printed claims (70 mL / ≈62% / 5.04 L/min). That second repair is beyond the sanctioned line and awaits Steven's word; the Valvulopathy preset's valve also remains shut, for the same reason one term over. The full story is in `heart-hemodynamics-lesson.html`, "The valve that never opened."

### Cardio — the sanctioned ejection fix · 23 November 2026

The valve fix above unmasked a second defect: ejection was capped. The volume code ejects only while the aortic valve is open (measured window ≈10% of the cycle, phase ≈0.31–0.39), but its ejection target swept EDV→ESV over phase ≈0.27–0.49, and the volume's chase rate (18/s) was too slow for the window — measured ESV 114 mL against a target of 44 mL. On 23 November 2026 Steven Powell sanctioned the second repair ("Sanction the ejection fix too") — the fourth sanctioned guest-file edit in the collection. Two lines changed in the ejection branch of `heart-hemodynamics.html`: the sweep span `Math.max(0.12, sysDur - 0.05)` → `0.12` (the measured open window, and the code's own floor), and the chase rate `dt * 18` → `dt * 45` (≈22 ms time constant, ~3 time constants inside the window). Nothing else changed (sha256 `b09163f2…` → `a75bb305…`).

Re-driven the same way after the fix: settled Normal Sinus measures SV 70.0 mL and CO 5.04 L/min — exactly the numbers on the tin — with EF 53.0% (the tin's ≈62% is 70/114, computed against the model's initial EDV; its settled EDV is 132 mL, and no ejection-side change can reconcile all three). ESV settles at 62 mL against the 44 mL target. Exercise CO is 11.41 L/min (2.26× the fixed resting output); Athlete SV 90.8 mL (its ~105 mL claim still short); AFib SV ≈39 mL; VFib collapse unchanged (SV 3, EF 4%, CO 0.12) and the defibrillator now restores a working baseline (SV 69.7); Valvulopathy forward SV 32.1 mL, its mitral valve still shut. Preload and contractility sweeps now behave (ESV nearly flat across preload; EF tracks contractility 29→62%). The full story is in `heart-hemodynamics-lesson.html`, "The ejection that never happened."

### Biology Wave additions — Axon & Immunity · 23 November 2026

Two further labs from Antigravity's Biology Wave arrived later the same day and were integrated byte-for-byte and audited the same way. (The wave's eighth lab, mitosis-genetics, is still outstanding.)

- **Axon — Hodgkin–Huxley neuron** (`neuron-hodgkin-huxley.html`): the genuine 1952 model at its core — rest at −65.00 mV, an all-or-none threshold, a ≈2 ms refractory window, gating variables moving at their proper relative speeds, E_Na +50 / E_K −77 in the modern absolute convention. But the myelinated preset is numerically broken at the page's own frame rate (a frozen checkerboard; its "~30× faster" is a display formula, not a measurement), the "Tonic Bursting Train" fires exactly once, and nothing spikes at the 37 °C end of the temperature slider. Lesson: `neuron-hodgkin-huxley-lesson.html`.
- **Immunity — epidemic outbreak lab** (`immune-epidemiology.html`): an agent-based SEIR+V city whose bookkeeping is exact — S+E+I+R+V = 320 with error zero on every step the audit counted — and whose latent and infectious dwell timers measure honest (3.36 s vs 3.3 claimed; 11.02 s vs 11). But the city's emergent R₀ measures ≈11 at every setting of its 1.5–5.0 dial, so its herd-immunity preset (80% vaccinated "starves transmission") and its quarantine preset ("flatten below 20% capacity") are falsified by the exhibit's own streets. Lesson: `immune-epidemiology-lesson.html`.

The Biology Wave now stands at seven exhibits, featured at the top of `index.html`; Dad's Arcade 114 games / 114 lessons; the Nerd Heaven shelf at 99 lessons; Java Young Robot Builders back doors 92–98.

### Biology Wave complete — Mitosis & Genetics, and the Lenia Zoo · 23 November 2026

The eighth and final Biology Wave lab arrived later the same day: `mitosis-genetics.html`, integrated byte-for-byte (sha256 8c6f637b…), with its Muse audit lesson `mitosis-genetics-lesson.html`. It is the most quantitatively honest lab of the wave: chromosome/chromatid bookkeeping is exact (G₂ reads 6 chromosomes / 12 chromatids — the classic trap avoided), bulk Punnett sampling lands on 3:1, 1:2:1, and 9:3:3:1 within noise, and its Hardy–Weinberg engine holds equilibrium exactly, with selection, mutation, and drift all matching theory. Its only false claims are two labels: a mode button reading "Meiosis (2n→4n)" and a "Trisomy (n+1)" gamete label. Riding along as the wave's artificial-life companion: `lenia-automata-zoo.html` (sha256 a403e628…) with `lenia-automata-zoo-lesson.html` — verified as the real Lenia (rule, kernel, and growth exact to float precision; Orbium glides at 0.64 cells/step), with the Geminium Twin extinct by step ≈31, a "Hydro Swimmer" that never swims, and Orbium alive only at σ = 0.017 rather than the page's "canonical" 0.015. The Biology Wave stands complete: eight labs plus the zoo.
