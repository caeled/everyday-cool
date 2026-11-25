# Audit — Heat Engines P–V & Gears/Linkages Lab (Antigravity builds)

Audited 2026-11-24. Files as shipped in `~/workspace/user/files/`:
`heat-engines-pv.html` (144,899 bytes) and `gears-linkages-lab.html` (155,289 bytes).
Intended home: Everyday Physics. **Audit only — no files edited, nothing integrated.**

## Method

- The physics/kinematics cores were extracted **verbatim** from the shipped files and run
  headlessly in Node (heat: `buildCycleModel` + crank kinematics over a 21-case parameter
  grid; gears: `circleIntersect` / `classifyGrashof` / `solveFourBarPoint` / `solveJansenLeg`,
  the Geneva wheel-angle block, and the escapement pendulum-integration + beat block).
- Independent recomputation: the heat grid was re-derived from textbook air-standard
  formulas in Python — agreement to all printed digits in every case.
- Both pages were then **driven live** in jsdom (real DOM, events, rAF loop; only the
  2D canvas rasterizer and `Path2D` stubbed, because this VM's Chromium is policy-gated
  for direct CDP): every cycle/mechanism button, slider, preset, segmented control,
  checkbox, and keyboard shortcut was exercised and the telemetry read back.
  Zero JS exceptions on either page; no dead controls found.
- Limitation: canvas pointer-drag interactions (hand-cranking, pivot dragging,
  heat-page diagram scrubbing) need layout geometry jsdom doesn't provide, so they
  could not be exercised directly. Their code paths were read, and the solvers they
  feed were driven directly through the extracted cores. The phase-scrub slider on
  the heat page drives the same state path as diagram scrubbing and was driven.

---

# 1. Heat Engines — `heat-engines-pv.html`

Four cycles (Otto, Diesel, Stirling, Carnot) on a 0.500 L swept cylinder,
R = 8.314462618 J/(mol·K), P₁ = 1.01325 bar.

## PASS

- **Otto efficiency law.** η = 1 − r^(1−γ) exactly; across the grid the formula, the
  energy ledger (η = W_net/Q_in), and the equation panel agree to all digits
  (default r=10, γ=1.40: η = 60.19%, live readout 60.2%).
- **Carnot bound.** η_Carnot = 1 − T_C/T_H evaluated at the cycle's true extreme
  temperatures (Otto/Diesel: 1 − T₁/T₃). No setting in the 21-case grid lets a
  cycle exceed its displayed bound; the "η vs Carnot" ratio is honest.
- **Diesel efficiency law.** η = 1 − r^(1−γ)·(r_c^γ − 1)/[γ(r_c − 1)] with
  r_c = T_H/T₂ (default r=18: r_c = 2.41, η = 61.31%, live 61.3%). The isobaric
  heat-addition vertex is genuinely isobaric: live vertex table shows state 2 and
  state 3 both at 58.0 bar.
- **Stirling = Carnot, as claimed.** With ideal regeneration η = 1 − T_C/T_H
  exactly (live: η 68.4% = Carnot 68.4%, ratio 100%). Q_reg = C_v(T_H − T_C) =
  669 J at defaults, shown as "Recycled". Charge pressure 1.5 bar at (V_max, T_C);
  all vertex pressures match the ideal-gas law (state 1: 12.5 bar, state 2: 4.8 bar).
- **Carnot cycle bookkeeping.** Q_in = T_H·ΔS, Q_out = T_C·ΔS (live at defaults:
  ΔS = 0.154 J/K → Q_in 117 J, Q_out 46 J, W 71 J — exact). T–S loop is the
  claimed rectangle.
- **Drawn loop = computed work.** Shoelace area of the shipped `loopPts` polygon
  vs the model's W_net: P–V area within **0.71% worst case** over the grid
  (pure sampling error on the curved adiabats; typically ≤0.5%), T–S area within
  **0.04%**. Integrating ∮P dV along the *animated* trajectory (`fullPts`) agrees
  within 0.53% worst case. The page's central claim — "the enclosed area equals
  W = ∮P dV" — is true of its own drawing.
- **Vertex states are real states.** Every vertex of every cycle satisfies
  PV = nRT to ≤ 4.3×10⁻¹⁶ relative error. Live spot checks: Otto compression at
  35% phase reads 1.86 bar / 357 K vs 1.86 bar / 357 K computed from the crank
  position; power stroke at 63% reads 1086 K vs 1091 K (readout rounding).
- **Power and MEP.** Power = W_net × (RPM/60)/revs-per-cycle (Otto default:
  408 J × 10 /s = 4.08 kW live); MEP = W_net/V_swept (8.17 bar live). Both exact.
- **Controls.** All 4 cycle buttons, 5 sliders, 3 γ presets (Helium click → η
  78.6% = 1 − 10^(−0.67) at r=10, live), keyboard 1–4 / D / Space, phase scrub,
  stroke stepping, drawer tabs, P–V / T–S / Dual modes, and all 6 overlay toggles
  respond; the animation's stroke badges and live P/V/T readouts track the model.

## BENDS

1. **The "Peak Combustion T_H" slider is silently overridden in two corners**
   (live-verified). Otto computes T₃ = max(T₂ + 350, T_H): at r=14 with the
   slider at 1200 K the slider label reads "1200 K" while Peak Temp reads
   **1212 K**; with γ=1.67 and T_H=1200 the actual peak is **1753 K**. Diesel
   clamps the cutoff ratio to r_c ≥ 1.25: with γ=1.67 (T₂ = 2080 K) and
   T_H = 2300 K, r_c would be 1.11, so the page runs T₃ = **2601 K** against a
   slider reading 2300 K. The model stays internally consistent (the Carnot
   bound is computed from the true peak), but the control does not do what it
   says in those corners.
2. **Exhaust-sweep temperature readout is invented.** During the exhaust sweep
   the live T readout shows a "warm residual" decay — measured **432 K at 90%
   phase, 407 K at 99%** — where the modelled state after blowdown is
   T₁ = 300 K (and the intake stroke correctly reads 300 K). Display only; the
   loop, ledger, and vertices are unaffected.
3. **Stale first-paint placeholders.** The static HTML carries Peak Pressure
   62.4 bar, Work 412 J, Q_in 684 J, Q_out 272 J, MEP 8.24 bar; the true
   boot values are 74.3 bar, 408 J, 679 J, 270 J, 8.17 bar. Replaced by the
   model on the first frame — visible only if scripts fail.
4. **Carnot slider corner reaches 2040 bar.** With isothermal ratio 4.2,
   T_C = 240 K, T_H = 1400 K (all within slider ranges), the fixed 0.5 L swept
   volume forces a total volume ratio of ~345:1 and P_max = **2040 bar**.
   Self-consistent math in a physically absurd regime; nothing warns.
5. **Diesel blurb vs slider.** The blurb says diesels compress "16:1–22:1";
   the sim's own compression slider runs 14:1–22:1.

## FALSE

- None in the thermodynamics. Every quantitative claim the page makes about
  its cycles checked out; the two slider-override corners are classed BENDS
  because the page's own Peak Temp readout reports the true value.

**Heat verdict: PASS-grade.** The solver is exact air-standard thermodynamics,
the drawing is the computation, and the controls all work. Fix list is cosmetic:
honour or annotate the T_H floor/cutoff clamp, drop the exhaust T fudge,
refresh the static placeholders.

---

# 2. Gears & Linkages — `gears-linkages-lab.html`

Five labs: compound spur train, planetary gearbox, four-bar + Jansen leg,
Geneva drive, anchor escapement. Involute geometry is genuine
(R_p = mZ/2, R_b = R_p·cos α, addendum +1.0 m, dedendum −1.25 m).

## PASS

- **Spur train ratios, direction, torque.** Ratio = (Z₂/Z₁)(Z₄/Z₃); two external
  meshes → output turns the same way as input; torque multiplier = GR × η²
  (η per mesh), power-consistent with the displayed efficiency. Driven live:
  defaults 5.33:1 → +6.8 RPM out at +36 in; sliders set to 10/36/10/40 →
  14.40:1, +2.5 RPM, 13.83× torque; "speed" preset → 1:2.79, +100.3 RPM;
  RPM −60 → out −4.2 RPM (signs right). Mesh frequency = |RPM_in|·Z₁/60 ✓.
- **Contact ratio ε_α is the real number.** Computed from the drawn involute
  geometry by the true path-of-contact formula. Live at defaults: **1.55**;
  independent computation: mesh averages 1.547. Pressure-angle buttons move it
  correctly: α=14.5° → live 1.78 (independent 1.779), α=25° → live 1.40.
- **Mesh phasing.** The tooth-phase equations differentiate to exactly
  dθ₂/dθ₁ = −Z₁/Z₂ and dθ₄/dθ₁ = +(Z₁Z₃)/(Z₂Z₄); centre distances are the
  exact pitch-radius sums (the A–B and B–C offsets are solved from them).
- **Planetary / Willis equation.** (ω_S − ω_C)/(ω_R − ω_C) = −Z_R/Z_S with
  Z_R = Z_S + 2Z_P. All four clutch modes driven live at Z_S=18, Z_P=12,
  Z_R=42: ring held → 3.33:1, +10.8 RPM; carrier-in overdrive → 1:3.33,
  +120.0 RPM; carrier held → **−2.33:1 reverse, −15.4 RPM**; sun held →
  1.43:1, +25.2 RPM. Torque multipliers track |GR| × η in every mode,
  including < 1 in overdrive.
- **Planetary assembly rule enforced.** (Z_S + Z_R)/N_p must be integral;
  driven live: switching to 4 planets at Z_S=21, Z_P=12 auto-bumped Z_P to 13
  (Z_R 45 → 47) and the note updated to "(21 + 47)/4 = 17 (exact)".
- **Grashof classifier: 8/8.** Test battery on the shipped function: all four
  presets, an exact change-point set (S+L = P+Q → "Change-Point Linkage",
  also reproduced live via sliders), coupler-shortest → Grashof Double-Rocker,
  rocker-side-shortest → Rocker-Crank, clear non-Grashof. The live Grashof
  box (S+L vs P+Q with the type) was correct for every preset.
- **Four-bar motion matches its classification.** Full-revolution solver
  sweeps: crank-rocker preset — crank assemblable at 100% of θ₂, rocker
  swings **62.9°**, net 0 rev; double-crank — output link nets **+0.998
  rev/rev**; double-rocker and Watt presets — θ₂ assemblable only 56.7% /
  32.6% of the circle (neither side link can rotate, as classified), and the
  page rocks the input back and forth at the assembly limits instead of
  jamming or tearing the linkage.
- **Watt straight-line is real.** Coupler-midpoint path: the flattest
  quarter-cycle window deviates at most **0.09 px over a 64.6 px chord
  (0.14%)** from straight.
- **Jansen leg.** The 11 "holy numbers" are the canonical Strandbeest set
  (a=38 … m=15). The leg assembles at 100% of crank angles; the foot's
  stance phase holds its height within **3.1 px over a 72 px horizontal
  span** (stride height 168.5 px) — the flat-bottomed D-curve is genuine.
- **Geneva drive is mathematically exact.** Driven through three full drive
  revolutions per slot count with the shipped angle block: net index per
  revolution = 360/N to 4 decimal places (N=4/6/8); peak velocity ratio =
  sin β/(1 − sin β) exactly (2.41421 / 1.00000 / 0.61991); motion fraction
  = ½ − 1/N exactly; wheel deviation during dwell = **0**; velocity ratio
  at slot entry ≈ 1×10⁻¹⁶ — the page's "pin enters tangentially at zero
  impact velocity" claim is literally true. Wheel counter-rotates, correct
  for an external Geneva. Live info lines (Index / Motion / Dwell) exact
  for 4, 6, and 8 slots.
- **Escapement bookkeeping.** The wheel advances exactly half a tooth pitch
  per beat (230 beats → 115.0 teeth in simulation). Displayed formula values
  are mutually consistent: wheel RPM = 30·beatHz/Z verified at Z=15
  (2.00 RPM) and Z=24 (2.49 RPM); vph = beatHz × 3600.
- **Controls.** All 5 mechanism buttons + keyboard 1–5, every slider
  (teeth, links, pendulum, RPM −120…+120, torque, η, weight), all presets
  and segmented controls, branch flip, step/play/reset, 7 overlay toggles —
  all respond, zero JS exceptions.

## BENDS

1. **Status pill mangles the non-Grashof label.** The pill is produced by
   `type.replace('Grashof ', '')`, which turns "Non-Grashof Double-Rocker"
   into **"Non-Double-Rocker"** (double-rocker and Watt presets). The pill
   reads as the opposite of the truth; the Grashof box next to it states
   the type correctly.
2. **Decorative "efficiency" telemetry.** Four-bar 95.1%, Jansen 94.1%,
   Geneva 92.1%, escapement 90.2%, planetary 96.5%/95.5% are just the
   per-mesh η slider multiplied by an arbitrary constant (×0.97, ×96,
   ×0.94, ×0.92, ×0.985) — no loss model stands behind them, but they are
   presented in the same telemetry grid as the measured quantities.
   (The spur train's 96.0% is at least power-consistent with its torque.)
3. **Seconds-pendulum button label.** It sets L = 0.994 m internally —
   the correct seconds-pendulum length, giving T = 2.0003 s and 3599 vph —
   while the slider and label read "0.99 m".
4. **Title wording.** The lab is titled "Planetary Differentials", but with
   one member always braked the planetary set operates as a gearbox in all
   four modes, never as an open differential.
5. **"Watt … Lemniscate" wording.** The coupler curve is a sextic with a
   genuinely straight middle section (measured above), not a lemniscate.

## FALSE

1. **The escapement does not beat at its displayed rate.** Beat Freq,
   Period, vph, and wheel RPM are all computed from the small-angle formula
   T = 2π√(L/g) — but the page's own simulated pendulum, integrated with the
   shipped code verbatim (result insensitive to dt: identical at dt = 1/60
   and 1/120), beats measurably slower:

   | Setting | Displayed | Measured (sim) | Deviation |
   |---|---|---|---|
   | L = 0.99 m, weight 1.0× (defaults) | 1.002 Hz | **0.958 Hz** | −4.3% |
   | L = 0.25 m, weight 1.0× | 1.994 Hz | **1.792 Hz** | −10.1% |
   | L = 2.20 m, weight 1.0× | 0.672 Hz | **0.654 Hz** | −2.7% |
   | L = 0.99 m, weight 2.0× | 1.002 Hz | **0.729 Hz** | −27.2% |
   | L = 0.99 m, weight 0.4× | 1.002 Hz | **0.988 Hz** | −1.4% |

   Cause: the impulse that sustains the swing is sized by
   `targetAmp − |pendAngle|` sampled **at the release instant**, where
   |pendAngle| is always ≈ 0.075 rad — so the energy kick per beat is
   essentially constant no matter how wide the pendulum is already
   swinging, and the amplitude runs away from the 0.27 rad (15.5°) design
   target to ≈ **49°** at defaults and ≈ **132°** at 2.0× weight (bob
   swung past horizontal). At 49° amplitude the exact-sin pendulum's
   circular error lengthens the period by ≈ +4.8% — matching the measured
   −4.3% rate. The formulas on the panel describe a clock the simulation
   is not keeping. (The wheel still advances exactly half a tooth per
   beat — it is the timebase, not the counting, that is wrong.)

**Gears verdict: four of five labs are exact** — the spur train, planetary,
four-bar/Jansen, and Geneva mechanisms are as accurate as their formulas,
with every preset and control driven and verified. The escapement's
geometry and bookkeeping are right but its regulator is not: displayed
beat rate vs actual beat rate disagree by 4–27%, and the swing amplitude
runs away. Plus one mangled status label ("Non-Double-Rocker") and a row
of decorative efficiency figures to re-label or remove.
