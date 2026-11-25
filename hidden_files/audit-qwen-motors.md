# Audit — Everyday_Motors_Workshop.html (Qwen studio build; Steven's "Kimi" pilot 1 of 3, Robot Room)

Audit date: 2026-11-24. Method: the shipped file was loaded headlessly (jsdom,
`runScripts:"dangerously"`, virtual-console errors captured) and driven through its
own interfaces — sliders, presets, swap-leads, cutaway buttons, quiz buttons, wiring
terminals. Because the page's script never executes (Finding 1), the motor model was
additionally measured by extracting `simState()` **verbatim** from the shipped source
and evaluating it against stub sliders, then cross-checking its outputs in SI units
against independent DC-motor theory derived from the page's own implied constants.
The uploaded file was not edited; nothing was committed.

---

## FATAL — the page's JavaScript does not parse; nothing on the page runs

- **Bench 4's `evaluate()` function is decapitated.** Its signature line and entire
  first half — the part that calls the union-find helper `groups()` and computes
  `shorted`, `complete`, `switchInLoop`, `aHasP/aHasN/bHasP/bHasN`, plus the first
  two hint branches — are missing from the file. What survives is a bare fragment
  beginning `if(shorted){ … }else if(complete && switchInLoop && …){ … }` containing
  a dangling `}else if(complete && !switchInLoop){` after two orphaned `hint(...)`
  statements.
- **Consequence (measured, jsdom):** `SyntaxError: Unexpected token 'else'` at parse
  time. A syntax error kills the *whole* script block, not just Bench 4. Verified by
  driving the loaded page: gauges frozen at `0 RPM / 0 g·cm / 0 mA` at every slider
  position; presets and Swap Leads inert; cutaway Power button never sets
  `aria-pressed`, coil never rotates; **zero** motor-picker cards rendered (they are
  JS-injected, so Bench 3 is an empty grid); quiz never builds; wire-board terminals
  render (static SVG) but clicking does nothing. The page is a static poster of
  itself.
- `groups()` (the union-find over terminals) survives intact as dead code — it was
  clearly written to feed the missing function, so the repair is well-scoped:
  reconstruct `evaluate()`'s head from the surviving fragment's variable names and
  the `groups()` return shape.

## PASS

- **Self-containment is exemplary.** Zero external resources: no CDN, no webfonts,
  no external images — all art is inline SVG, fonts are the system stack. The only
  `http` strings in the file are SVG namespace URIs. The footer's claim "Runs fully
  offline in any modern browser… no internet required" is true of its resources.
- **Torque–speed *shape* is the correct linear DC model.** From `simState()`'s own
  outputs: ω = ω₀(1−L), τ = τ_stall·L, the two chart lines cross at L = 50%, and
  mechanical power P = τ·ω peaks at L = 50% exactly as theory requires
  (6 V: 9.36 W @ L=25% → 12.48 W @ L=50% → 11.98 W @ L=60%).
- **The back-EMF explanation is correct physics.** The "Curious? Why does current
  spike when the motor stalls?" panel states the real mechanism (spinning motor
  generates back-EMF that limits current; stall removes it; current rises to the
  winding limit; heat follows).
- **Quiz answer key is 4/4 correct** (ramp → geared DC; camera pan/hold → servo;
  0.1 mm steps → stepper; desk fan → plain DC), and the nudge feedback points at the
  right card text in each case. Card claims check out (servo "usually ~180°",
  stepper "needs a driver board", geared DC "high torque at low speed").
- **Tour scripts match the model.** Each tour step's text describes what
  `simState()` actually computes at that step's settings (verified row by row in
  the sweep below).
- **Bench 1 cutaway logic is sound as written** (code-read only — it cannot run,
  per Finding 1): current arrows flip once per half-turn at the commutator sector
  change, Flip Current reverses rotation direction.

## FALSE

- **The three sim dials are mutually inconsistent — displayed operating points
  violate energy conservation.** The page's constants are `RPM_PER_V=900`,
  `TORQUE_PER_V=150` (g·cm), `CUR_PER_V=150` (mA). In SI these imply
  Ke = 0.01061 V·s/rad (from the speed dial), R = 6.67 Ω (from the stall-current
  dial), and Kt = 0.0981 N·m/A (from torque ÷ stall current). A real motor has
  Kt = Ke in SI; here **Kt/Ke = 9.24**. Measured consequences from the page's own
  `simState()` outputs:
  - 6 V, L=50%: τ = 450 g·cm at 2700 RPM → P_mech = **12.48 W** out, while
    I = 486 mA → P_in = **2.92 W** in. **η = 428%.**
  - Same 428% at 12 V/50% (49.9 W out vs 11.7 W in) and 1 V/50%; η peaks at
    **559%** at L=25%.
  - The stall torque consistent with the page's own Ke and R would be
    **16.2 g·cm/V**, not 150.
  This falsifies the page's own framing sentence: *"Everything you see here is how
  a real brushed DC motor behaves."* The *shape* behaves like a real motor; the
  *numbers* cannot coexist in one. Fix direction: choose any two dials and derive
  the third (or adopt one real hobby motor's datasheet values throughout).
- **Bench 4 as shipped cannot work at all** (see FATAL) — the bench whose
  takeaway is "a motor needs a complete loop to spin" never evaluates a loop.

## BENDS (presentation layer)

- **Stall snaps in at 98% load.** `stalled = V>0 && L>=0.98`: at load 98–99% the
  gauges show 0 RPM / full stall torque / full stall current, while the page's own
  linear model says 108–216 RPM at 6 V. Meanwhile the chart marker keeps riding
  the un-stalled speed line (cy = 20+118L), so at L=98% the marker and the speed
  gauge disagree on the same screen.
- **Chart curves are hard-coded** straight lines, independent of voltage: at
  V = 0 the chart still draws full-height speed/torque curves with the marker
  parked at the top-left while every gauge reads zero. As a normalized schematic
  it's defensible; it is not labelled as one.
- **No-load current vs displayed torque.** At L=0 the model draws
  I = 8% of stall (72 mA at 6 V) while displaying 0 g·cm delivered torque —
  physically that's the friction current, and it's realistic, but the page never
  says so; a sharp kid will ask where the 72 mA goes.
- **Dead code / dead class:** `.wheel-blur` is toggled in JS with no CSS rule;
  `groups()` is defined and never called (it belonged to the missing `evaluate()`
  head).
- **Forward links to undelivered siblings:** Bench 3 links `everyday-control.html`
  and the closing bench links `everyday-sensors.html` — pilots 2 and 3, not yet
  delivered. Both are 404s until the bundle lands together (or the links are held).

## Sweep table (page's own `simState()`, verbatim eval; SI cross-check)

| V | Load | RPM | Torque (g·cm) | Current (mA) | P_mech | P_in | η |
|---|------|-----|------|------|------|------|---|
| 6 | 0%   | 5400 | 0   | 72   | 0 W     | 0.43 W | — |
| 6 | 25%  | 4050 | 225 | 279  | 9.36 W  | 1.67 W | **559%** |
| 6 | 40%  | 3240 | 360 | 403  | 11.98 W | 2.42 W | **495%** |
| 6 | 50%  | 2700 | 450 | 486  | 12.48 W | 2.92 W | **428%** |
| 6 | 60%  | 2160 | 540 | 569  | 11.98 W | 3.41 W | **351%** |
| 6 | 97%  | 162  | 873 | 875  | 1.45 W  | 5.25 W | 28% |
| 6 | 98%  | 0 (snap) | 900 | 900 | 0 W | 5.40 W | — |
| 6 | 100% | 0    | 900 | 900  | 0 W     | 5.40 W | — |
| 12 | 50% | 5400 | 900 | 972  | 49.91 W | 11.66 W | **428%** |
| 12 | 100%| 0    | 1800 | 1800 | 0 W    | 21.60 W | — |

## Integration readiness

**NOT READY — two repairs needed, both small and well-scoped.** (1) Restore
`evaluate()`'s missing head in Bench 4 so the script parses — the surviving
fragment and `groups()` specify exactly what it computed; until then the entire
page is inert, which also blocks any meaningful visual check. (2) Reconcile the
three sim constants so Kt = Ke (pick a real motor's datasheet or derive the third
dial) — the page's "how a real motor behaves" claim is false until η ≤ 100%
everywhere. After those: the stall-snap threshold and chart labelling are bends
to note in a lesson, and the two sibling links must land with the bundle or be
held. Structure, pedagogy, quiz, and offline hygiene are otherwise the strongest
first-pilot showing of any guest builder so far — the failure is a truncated
function and an un-derived constant, not the teaching.


---

## Repair addendum (2026-11-24, Steven's sanction)

Both repairs below were made under Steven's explicit sanction, following the
collection's Cardio / Orbital Pinball precedent: the guest file was edited, and
the edits are documented here with old → new values. The uploaded original was
**not** modified. The repaired copy is
`~/workspace/your_files/Everyday_Motors_Workshop-repaired_2026-11-24.html`.

- SHA256, original upload: `6fc4b32758fe254ee52b3d5853114512b763993115885e3bc6fe7f8f62fb81b7`
- SHA256, repaired copy: `ddb664e33196e0be41fb918268c2f61cc15fc4ce5b941b49d19c0b6764299199`
- The full diff is four change sites only: the constants line, one bench-intro
  sentence, the restored `evaluate()` head, and the two restored branch
  conditions around the orphaned hints. Nothing else in the file moved.

### Repair 1 — Bench 4 `evaluate()` restored

The signature and missing first half were reconstructed from the surviving
`groups()` helper and the dangling fragment, in the page's own style:

- Loop topology (`aHasP/aHasN/bHasP/bHasN`, `complete`) is judged on
  `groups(["swL","swR"])` — wires with the switch's terminals bridged. This is
  forced by the surviving fragment, not a free choice: the orphaned hint *"Your
  wiring is perfect — but the switch is open…"* can only fire if a board wired
  correctly through a still-open switch already reads as `complete`.
- `switchInLoop = complete && !loopNoSwitch`, where `loopNoSwitch` re-tests the
  loop on plain `groups()` (wires only). If the loop survives removal of the
  switch bridge, the switch is being bypassed — which is exactly what the
  surviving *"sneaking around the switch"* hint describes.
- `shorted` is judged on the live circuit: `groups(["swL","swR"])` when the
  switch is closed, plain `groups()` when it is open — battery + and − in one
  group without the motor as an edge. A battery wired to itself through an open
  switch is not flagged until the switch closes and the short becomes real.
- The two orphaned hint statements in the `else` block were re-homed under
  their missing conditions: `if(complete && switchInLoop && !switchClosed){ … }`
  before the "switch is open" hint, and
  `}else if(complete && switchInLoop && switchClosed && !boardPowerOn){ … }`
  before the "now hit Power on" hint. The hint texts themselves are byte-for-byte
  the shipped ones.

### Repair 2 — motor constants reconciled (Kt = Ke)

**Motor chosen: Mabuchi RF-370CA-15370** — a real, named small brushed DC
hobby motor whose operating range (3–12 V) matches the page's 0–12 V slider and
whose datasheet anchors the sim. Datasheet values at 12 V nominal (Mabuchi
RF-370CA datasheet, Kysan Electronics Data Book / Jameco distribution,
https://datasheet.octopart.com/RF-370CA-10620-R-Jameco-Reliapro-datasheet-7084510.pdf):

| Datasheet (12 V) | Value |
|---|---|
| No-load speed | 5600 RPM |
| No-load current | 0.026 A |
| At max efficiency | 4840 RPM, 0.17 A, 25.3 g·cm, 1.25 W |
| Stall torque (measured) | 187 g·cm (18.3 mN·m) |
| Stall current | 1.06 A |

Derivation, as prescribed: Ke from V and no-load speed —
Ke = 12 V / (5600 RPM = 586.43 rad/s) = **0.020463 V·s/rad**. R from V and stall
current — R = 12 / 1.06 = **11.32 Ω**. Kt set equal to Ke, so the model's stall
torque at 12 V is Kt × I_stall = 0.02169 N·m = **221 g·cm**. That derived figure
sits above the datasheet's *measured* 187 g·cm stall torque, and the gap is the
honest one: the datasheet number is measured on a real motor with brush drop and
friction, while the page models the ideal motor whose speed and current anchors
are the datasheet's own. The ideal model is now internally consistent
(Kt/Ke = 1.0000 from the shipped dial values), which is what the page's framing
sentence claims.

| Constant | Old | New | Basis |
|---|---|---|---|
| `RPM_PER_V` | 900 | 466.7 | 5600 RPM ÷ 12 V |
| `CUR_PER_V` (mA) | 150 | 88.33 | 1060 mA ÷ 12 V |
| `TORQUE_PER_V` (g·cm) | 150 | 18.43 | Kt = Ke ⇒ 221 g·cm ÷ 12 V |

(Old dials implied Kt/Ke = 9.24 and η up to 559%; see the FALSE finding above.)

**Text edits made** (before → after):

1. Constants comment — `// generic hobby motor, 12 V ceiling` →
   `// Mabuchi RF-370CA-15370, datasheet at 12 V: 5600 RPM no-load, 1.06 A stall; torque dial derived with Kt = Ke so the three dials describe one real motor`.
2. Bench 2 intro — `A virtual hobby motor on a breadboard.` →
   `A virtual Mabuchi RF-370CA-15370 — a real 3–12 V hobby motor — on a breadboard.`
   This names the motor behind the framing sentence *"Everything you see here is
   how a real brushed DC motor behaves"*, which is now true of the repaired page
   (ideal linear model, real datasheet anchors, η ≤ 100% everywhere) and was
   therefore kept verbatim rather than softened.

**Re-verification of everything else the constants touch:** the tour steps,
presets, badges, and closing cards quote no numbers derived from the old
constants — they are qualitative ("near top speed, barely any current" at
6 V / 0% still holds: 42 mA displayed) or independent class claims (servo
~180°, stepper 0.1 mm steps, Bench 4's own 6 V battery). No further text edits
were needed. The quiz was re-driven against the repaired page and its key still
scores 4/4 (see below).

### Verification of the repaired page (jsdom, driven through its own UI)

- **Zero script errors** on load (the shipped file died with
  `SyntaxError: Unexpected token 'else'`).
- **Bench 3 picker cards render:** 4 cards (shipped: 0).
- **Full gauge sweep** (V 0–12 in 0.5 steps × load 0–100% in 1% steps, read
  from the page's own gauges): datasheet anchors land exactly — 12 V no-load
  **5600 RPM**, 12 V stall **1060 mA**, 12 V stall torque **221 g·cm**.
  Worst displayed-gauge η = **68.6%** (at 1.0 V / 14% load; integer-rounded
  gauges inflate η slightly at tiny values).
- **Model-exact check** (the page's own `simState()` formulas, constants parsed
  from the repaired file, unrounded, load in 0.25% steps): worst η =
  **60.77%** at L ≈ 22% — under 100% at every operating point — and mechanical
  power peaks at **exactly L = 50%** at every voltage, as theory requires.
  (A DOM-only reading put the 6 V displayed peak at L = 52%; that is the
  integer rounding of the torque gauge at small values, not the model — the
  12 V displayed peak lands on 50 exactly.)
- **Presets** (all four) set the sliders and gauges; **Swap Leads** flips the
  terminal colours and shows the reversed badge; Bench 1 Power toggles.
- **Quiz** builds (4 questions) and the key verifies 4/4 through real clicks.
- **Bench 4 branches**, driven by clicking the board's own terminals: perfect
  wiring + switch open → "switch is open" hint; switch closed, power off →
  "Power on" hint; powered → "Motor spinning" + spin class; reversed loop →
  "Motor spinning (reversed)"; loop bypassing the switch → "sneaking around
  the switch" hint; battery wired to itself → "Short circuit!"; cleared board
  → idle.

**Left untouched, per the repair's scope:** the ≥98%-load stall snap vs the
linear model, the chart marker/gauge disagreement, the hard-coded chart height
at V = 0, the dead `.wheel-blur` class, and the forward links to
`everyday-control.html` / `everyday-sensors.html` — all remain as shipped, for
the lesson page to note when the bundle integrates.
