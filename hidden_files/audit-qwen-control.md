# Audit — Everyday_Control_Workshop.html (Qwen studio build; Steven's "Kimi" pilot 2 of 3, Robot Room)

Audit date: 2026-11-24. Method: the shipped file was read in full, then loaded
headlessly (jsdom, `runScripts:"dangerously"`, virtual-console errors captured)
and driven through its own interfaces — Run buttons, tuning presets, PWM and
gain sliders. The uploaded file was not edited; nothing was committed.
SHA256 of the upload: `2049b0823b8825e6896218794d1984536d4a024e4356d93e26edbcd8fb25c5dc`
(32,879 bytes, 457 lines).

---

## FATAL — the file is truncated: the entire script, Bench 6, and everything after Bench 5 are missing

- **There is no JavaScript in this file at all.** Zero `<script>` elements, zero
  inline handlers. The file ends immediately after Bench 5's takeaway
  (`</section>`) — no Bench 6, no closing "next steps" cards, no sibling links,
  no footer, no `</body>`/`</html>`. This is the Motors truncation failure shape
  at larger scale: Motors lost one function's head; Control lost everything
  from Bench 6 onward, including the whole simulation.
- **The stylesheet proves the missing material existed in the design.** The CSS
  fully styles Bench 6's sensor-chain strip (`.chain-strip`, `.chain-node`,
  `.chain-card`), the closing `.next-steps` cards, the `.sibling-links`, and
  `footer.page-foot` — none of which appear in the body.
- **Measured consequence (jsdom drive):** no errors (there is no code to
  error), and nothing responds. Bench sections present: bench1–bench5 only.
  JS-injected regions are empty: **0 machine cards** in Bench 1's sorting game
  (nothing to sort), **0 switches** in Bench 3's H-bridge diagram (rails and
  motor render; the four clickable switches were to be injected), **0 PWM
  pulses** in Bench 2's waveform (baseline only). All three canvases
  (`wobbleCanvas`, `pidCanvas`, `pidChart`) are never drawn. Clicking ▶ Run on
  Benches 4 and 5 changes nothing (`aria-pressed` stays `false`); the "Sweet
  spot" preset click changes nothing; dragging the duty slider leaves the
  readout at 50% and the gain slider leaves P at 1.0. The page is a static —
  and visibly hollow — poster of itself: three of its five benches have empty
  stages where the script was supposed to build the exhibit.
- **Downstream consequence for this audit:** there is no plant and no
  controller to extract or drive. Sections below record what the page *intends*
  (from its copy) and mark every behavioural measurement **cannot be measured —
  no simulation ships**. Any settling-time, overshoot, or stability number
  printed about this page today would be invented.

## THE PLANT — as specified in copy only; no dynamics ship

- Intended plant (from Bench 4/5 copy and canvas aria-labels): a
  line-following robot on a gently curving line; error = signed lateral
  distance from the line; controller output = steering. Bench 4's version is
  bang-bang (full-left / full-right); Bench 5's is PID steering.
- **No equations, constants, or timestep exist in the file.** There is no
  gravity, inertia, heading integration, or track geometry in code — nothing
  to check against physics. The gains on the sliders (P 0–3, I 0–1, D 0–3)
  are therefore unanchored numbers: with no plant and no dt, "Kp = 1.6" has
  no units and no meaning that a reader (or an auditor) can verify.

## THE CONTROLLER — as specified in copy only; no PID ships

- Intended design (from copy): error = setpoint − measurement on lateral
  offset; a windup indicator exists in the UI (`#windupChip`), implying the
  integral term is at least displayed when it piles up. Whether the integral
  is clamped, whether anti-windup exists, whether derivative is on error or
  on measurement, whether it is filtered, what dt is used (fixed vs rAF), and
  whether output saturates — **none of this is determinable; the code that
  would answer it was never delivered.**
- The four preset buttons ship as data attributes and labels only:
  P only (1, 0, 0) "wobbles"; PI (1.4, 0.5, 0) "overshoots"; "Sweet spot ✨"
  (1.6, 0.12, 1.4); "Over-damped — sluggish" (2.4, 0.2, 2.6). These labels
  are behavioural claims about a simulation that does not exist in the file;
  see BENDS.
- No Ziegler–Nichols (or any tuning-rule) table appears anywhere in the
  page — the page teaches tuning by feel, which is a legitimate choice, but
  there are no tuning-rule values to verify.

## PASS (pedagogy and hygiene — judged on the copy, which is all that ships)

- **Self-containment is exemplary, again.** Zero external resources: no CDN,
  no webfonts, no external images; system font stack throughout. The only
  link out is the relative sibling link to Motors. The offline rule is met.
- **Core definitions are right.** Open loop ("run blind and hope") vs closed
  loop ("checks and corrects"); the read → compare → correct → repeat loop;
  duty cycle as the fraction of time ON; "the motor only feels the average"
  as the first-order PWM truth; H-bridge giving forward / reverse / brake /
  coast from one chip; stall current spikes and inductive kickback named
  correctly as the driver's reasons to exist.
- **The P / I / D role descriptions are the correct standard ones:**
  P "steers in proportion to the error"; I "remembers stubborn leftover
  error and leans harder"; D "watches how fast the error is shrinking and
  eases off before overshooting." The slider sub-notes are equally standard
  and correct (P too high → wobble; I too high → overshoot and windup;
  D too high → jittery). The takeaway mnemonic "P for now, I for the past,
  D for the future" is the classic one, fairly used.
- **Bang-bang wobble (Bench 4's premise) is true pedagogy:** an on/off
  corrector that ignores error size does limit-cycle around the line on a
  real line-follower; "the correction is always full-left or full-right, no
  matter how tiny the error" is an accurate description of why.
- **The windup definition is right:** the chip's title text — *"The I term
  kept piling up while the robot was pinned, then dumped all at once — that
  lurch is integral windup"* — is a correct plain-language statement of the
  phenomenon (whether the sim models it is unverifiable; see above).
- **Framing claim is fair:** PID (and its family) really is the trick in
  drone levelling and cruise control; temperature-controlled kettles are the
  softest of the three examples (many are bang-bang thermostats) but PID
  kettles exist and the class claim stands.

## FALSE

- No false *physics* could be measured, because nothing computes. The one
  claim that is false as shipped is the page's standing implication that it
  is a working workshop: the header instructs the reader to *"hit 'Run' on
  the PID Tuner and watch the robot hunt for the line"* — there is no Run
  behaviour, no robot, and no line; Bench 5's intro says *"Tune it badly on
  purpose"* of a tuner whose sliders are inert. Every imperative on the page
  points at machinery that was not delivered.

## BENDS (asserted but unverifiable, inconsistent, or plant-dependent)

- **Preset labels assert measured behaviour of a missing sim.** "P only —
  wobbles," "PI — overshoots," "Sweet spot ✨," and "Over-damped — sluggish"
  are presented as facts about this bench's responses. None can be checked,
  and one is counterintuitive on its face: the "Over-damped — sluggish"
  preset carries the **highest P of the set (2.4)**; heavy D (2.6) can slow
  a response, but labelling the most aggressive P "sluggish" without the
  plant to prove it is a claim the page cannot currently cash.
- **P-only: the page argues with itself.** Bench 5's "Curious?" panel says
  P alone "settles *near* the line but never *on* it" (a stable leftover
  offset); the preset button says P only "wobbles" (oscillates). Different
  plants do different things, but this page presents both about the same
  robot, undistinguished.
- **The steady-state-error story is plant-dependent, told as universal.**
  "With a small error P produces only a small correction — too small to
  finish the job" is the type-0 plant story. A line-follower's steering
  integrates (heading integrates into lateral position), so P-only on this
  very plant typically converges or oscillates rather than parking at a
  fixed offset. The I term's real job here would be fighting constant
  disturbances (a dragging wheel, a misaligned sensor) — a better and
  truer story for this robot, and not the one told.
- **Loop-rate numbers disagree with each other.** Header: the loop runs
  "twenty times a second." Bench 1: "dozens of times per second." Twenty
  is not dozens. Neither is tied to any code (there is none), so both are
  decoration — but they decorate inconsistently.
- **PWM frequency is stated three incompatible ways on one bench.**
  Intro: "thousands of times a second." The frequency note beside the
  waveform: "Blinking 100 times a second." The slow-mode note: "real PWM
  is hundreds of blinks a second." Hundreds is the defensible figure for
  the small-motor context the page teaches; the other two contradict it
  and each other.
- **Sibling link name matches nothing delivered.** Both Motors links point
  to `Everyday-Motors-workshop.html`; the Motors workshop was delivered as
  `Everyday_Motors_Workshop.html`. On a case-sensitive host (GitHub Pages)
  that link 404s. (Motors' own forward links used yet another form,
  `everyday-control.html` — the bundle has no agreed filename convention
  yet; integration will have to impose one.)

## Claims table (measured vs expected)

| Claim (source) | Expected | Measured | Verdict |
|---|---|---|---|
| Page runs: Run/presets/sliders respond (header, all benches) | Interactive workshop | 0 scripts; all controls inert; JS-injected regions empty | **FALSE (dead on arrival)** |
| Bench 6 + closing + footer exist (implied by CSS) | Sections present | Absent — file ends after Bench 5 | **FALSE (truncated)** |
| Plant dynamics (Bench 4/5) | Stated physics, integrated | No code ships — nothing to extract | **Cannot be measured** |
| PID: default gains settle the robot (Bench 5 premise) | \|error\| stays small, sustained | No controller ships | **Cannot be measured** |
| P-only behaviour | Theory: plant-dependent | Label says "wobbles"; own panel says stable offset | **BEND (self-contradictory, unverifiable)** |
| I-only / D-added sweeps | Offset / oscillation / damping per theory | No controller ships | **Cannot be measured** |
| Preset "Sweet spot ✨" (1.6, 0.12, 1.4) is a good tune | Measured smooth settling | No plant — gains unitless | **BEND (asserted, unverifiable)** |
| Preset "Over-damped — sluggish" (2.4, 0.2, 2.6) | Slow, smooth response | Highest P of the set labelled sluggish; no plant | **BEND** |
| Steady-state error panel (P can't finish the job) | True for type-0 plants | Integrating plant on this very robot — story doesn't transfer | **BEND** |
| Windup description (chip title) | Matches the phenomenon | Text is correct; sim unverifiable | **PASS (definition)** |
| Loop "twenty times a second" (header) vs "dozens" (Bench 1) | One consistent figure | 20 ≠ dozens; neither backed by code | **BEND** |
| PWM "thousands" / "100" / "hundreds" per second (Bench 2) | One consistent figure | Three incompatible figures, one bench | **BEND** |
| P/I/D role descriptions + slider notes (Bench 5) | Standard control pedagogy | Matches the standard accounts | **PASS** |
| Open/closed loop, duty cycle, H-bridge truth table (Benches 1–3) | Standard pedagogy | Matches | **PASS** |
| Ziegler–Nichols values | — | Not cited anywhere | **Absent (nothing to verify)** |
| External resources | None (offline rule) | None found | **PASS** |
| Motors sibling link | Resolves to delivered file | `Everyday-Motors-workshop.html` ≠ delivered `Everyday_Motors_Workshop.html` | **BEND (404 on case-sensitive hosts)** |

## Differential note — vs Antigravity's pid-inverted-pendulum (Everyday Physics)

Antigravity's bench ships exact nonlinear Lagrangian cart–pole dynamics
(RK4; the shipped equations are the real `(M + m·sin²θ)` form), a cascaded
PID with an anti-windup toggle, actuator saturation, and an Åström–Furuta
energy swing-up whose known defect is behavioural — it never catches —
inside dynamics that are genuinely integrated. Qwen's Control ships no
dynamics and no controller at all: its plant is a paragraph, its PID is
four preset buttons. So on cores it is not close — Antigravity's plant is
realer by existence and its controller is honester because it can be
inspected and measured. Qwen's prose is the cleaner beginner teaching of
the two, but today every behavioural claim on its page is unfalsifiable,
because nothing computes.

## Integration readiness

**NOT READY — and unlike Motors, this is not a patch-sized repair.**
Motors needed one function's head restored; Control needs a re-delivery:
Bench 6, the closing sections, the footer, and the *entire* script (the
plant, the PID, and the logic for all five benches) are absent. Ask Qwen
for the complete file, then re-audit the simulation itself — plant
equations, integral handling, derivative form, dt, saturation, and
measured settling for each preset — before any other verdict on the
controller is possible. The copy can be pre-judged now and is mostly
sound: if the re-delivery keeps this text, the fixes to request with it
are the loop-rate and PWM-frequency inconsistencies, the P-only
wobble-vs-offset tension, the "Over-damped" preset label, and a single
agreed filename convention for the bundle's sibling links. Pedagogy and
offline hygiene are, again, not the problem — the delivery is.
