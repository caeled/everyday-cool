# Audit — robot-arm-ik.html & pid-inverted-pendulum.html (Antigravity builds)

Audit date: 2026-11-24. Method: both pages were loaded headlessly (jsdom, canvas stubbed)
and **driven through their own interfaces** — preset buttons, solver segments, sliders,
checkboxes, canvas pointer drags — while reading the pages' own telemetry DOM. Reference
values were computed independently (closed-form FK/Jacobian for the arm; a mass-matrix
Lagrangian integrator and analytic control-theory results for the pendulum). No exhibit
files were edited; nothing was committed.

---

# 1. robot-arm-ik.html — "Kinematics" (FABRIK & Jacobian)

World: planar serial arm, total reach normalized to 400 mm for every DOF/profile.

## PASS

- **Forward kinematics is exact.** FK mode, 3-DOF industrial (L = 173.6/133.3/93.1 mm):
  pose [30°, −50°, 20°] → page EE (369, 41), independent FK (368.7, 41.2);
  [90°, −90°, 0°] → page (226, 174), ref (226.4, 173.6); [0°, 0°, 0°] → (400, 0).
  2-DOF equal links [90°, −90°] → page (200, 200), ref exactly (200, 200).
- **All three IK solvers reach reachable targets.** 6 targets (r = 71…370 mm) ×
  FABRIK / DLS / CCD: final error 0.0–0.3 mm each (solver tolerance in code is 0.45 mm),
  status "Reached", EE coordinates match the requested target to the millimetre.
- **Unreachable-outside handling is exact.** Target (600, 0): EE stops at (400, 0),
  error readout 200 mm (predicted 200). Target (425, 0): error 25 mm (predicted 25).
  Status "Out of Reach" in both cases.
- **Full-extension singularity is reported truthfully.** 2-link, target (400, 0):
  error 0.4 mm, condition readout 2%, status "Near Singularity!". At the straight
  FK pose the manipulability is exactly 0 and condition 0%, status "Near Singularity!".
- **Manipulability math is right.** At [30°, −50°, 20°]: independent
  w = √det(JJᵀ) = 26,436 mm², s₂/s₁ = 14%. Page shows 26.4 (= w/1000, see Bends)
  and 14%. At the straight pose both are 0, matching.
- **Servo slew limit is real and enforced.** Speed slider 2 rad/s: Σ|ω| peaked at
  342 °/s against a 3-joint cap of 344 °/s; a ~340 mm target jump took 1.45 s to
  converge vs 0.05–0.15 s at 14/30 rad/s.
- **Joint limits hold.** Elbow-limit preset (CCD, ±95°, figure-8, 20 s sampled):
  max |θ₂|,|θ₃| observed = 95°, zero violations. FK sliders clamp at the limit.
- **Flip Elbow is a true mirror solution.** FK pose [30°, −50°, 20°]: EE (369, 41)
  before and after; angles mirror to (−17°, +50°, −20°) as the geometry requires.
- **Manual obstacle avoidance works as coded.** FABRIK, obstacle r = 44 mm at
  (110, 60), target behind it at (300, 155): minimum link-segment distance to the
  obstacle centre over 7 s was 74.3 mm vs the solver's safe radius 44 + 22 (margin)
  + 8 (link half-thickness) = 74 mm; target still reached, error 0, "Obstacle Avoid"
  status appeared. Clear-all and obstacle counter work.
- **Path tracking is tight.** Square Weld preset, 30 s: max error 0.4 mm, "Reached"
  in 120/120 samples. 6-DOF Snake figure-8, 25 s: max error 0.4 mm.
- **DOF/profile geometry.** DOF slider 2–8 and all three profiles keep total reach
  at exactly 400 mm (telemetry "N-DOF · 400"); FK slider count follows DOF.
- Pause freezes the arm; Reset re-applies the preset; audio toggle is safe with no
  AudioContext present.

## BENDS

- **Manipulability readout is w/1000, unlabelled.** The card says "Manipulability w"
  but displays w/1000 (a code comment calls it "cm²-like readability"). The number
  26.4 is really 26,436 mm². Beside it, the "Dexterity √det(JJᵀ)" bar mixes two
  quantities: the fill width is w normalized against a heuristic reference, while
  the % text is the condition ratio s₂/s₁. Both are computed correctly; the
  labelling conflates them.
- **The manipulability ellipsoid is not to scale.** Its axes use the true JJᵀ
  eigen-directions and singular-value *ratio*, but the drawing multiplies both
  singular values by an arbitrary 0.22 display factor, unlabelled. Shape and
  orientation are honest; absolute size is illustrative.
- **Inner-annulus targets: correct status, sub-optimal stop.** 2-link classic,
  target (50, 0) inside the annulus hole (true inner boundary 120.8 mm): status
  correctly says "Out of Reach", but DLS parks the EE at radius 126.9 mm, off-axis
  at (109, 65), leaving error 87.8 mm where 70.8 mm is achievable. It does not find
  the closest boundary point.
- **Damping λ is a scaled knob, and its classic trade-off is masked.** The slider's
  λ enters the normal equations as λ_eff = λ · 400 · 0.42 ≈ 168λ mm (37 mm at the
  default 0.22); the label just says "λ". Because the solver re-runs every frame
  from the current pose, all tested λ (0.01 / 0.22 / 1.00) still reached a
  near-boundary target (392, 40) to ≤0.4 mm — the textbook DLS steady-state bias
  never appears in this architecture; λ mostly reshapes the transient (peak Σ|ω|
  950–1324 °/s, non-monotonic in λ).
- **"Max Solver Iterations" is per animation frame, not per target.** The solver
  re-runs each frame from the servo's current pose, so even a cap of 2 iterations
  converges over successive frames (a large jump showed 63 mm error at 0.2 s with
  cap 2, then converged). The telemetry "1 / 24" is the last frame's count, which
  is honest but easy to misread.
- **The Singularity preset's circle overshoots the workspace.** Its "sweep to the
  outer reach boundary" circle (centre (145, 50), r = 256) actually reaches radius
  409.4 mm — 9.4 mm past the 400 mm reach. Measured over 40 s: error peaks at
  exactly 9.4 mm and the status flips to "Out of Reach" in 15/160 samples. The DLS
  solver is fine; the preset's geometry over-promises by 9.4 mm.
- **CCD is a damped variant** (0.78 gain, ±0.45 rad/joint/sweep clamps), not
  textbook CCD — converges well in all reachable tests, but the page doesn't say so.

## FALSE

- **DLS and CCD freeze forever at a reachable target on the singular axis.**
  From the straight 2-link pose (θ = 0, 0), target (300, 0) — dead ahead, well
  inside the workspace: after 5 s both solvers still show error = 100 mm with
  angles unchanged at 0°/0° (the Jacobian/CCD gradient is exactly zero there).
  The status pill does say "Near Singularity!", but the arm never moves and no
  recovery exists in these two solvers. FABRIK escapes the identical setup via
  its built-in collinear kick and reaches with error 0 (angles 28°, −88°).
  Off-axis targets from the same pose (300, 100) are reached by all three.
- **The shipped Pick & Place preset drives links through its own obstacles.**
  Sampling the preset for 26.7 s (~4 cycles), reconstructing joint positions from
  the page's own angle telemetry: link segments were inside an obstacle disc in
  32 of 800 samples. Worst event: segment 3 passed **1.1 mm from the centre** of
  the (−115, 35) r = 30 obstacle — straight through it — while the status read
  "Obstacle Avoid". Both obstacles (0, 118) r 44 and (−115, 35) r 30 were
  penetrated. The end-effector path is pushed around the obstacles (the manual
  test above passes), but link bodies are not kept clear in this preset, and the
  transfer-arc target itself passes ~16 mm from the (0, 118) obstacle's centre,
  i.e. inside it, which the links then chase. "Obstacle Pick & Place" over-claims:
  it is EE-point avoidance with link clipping, in the preset designed to show it off.

---

# 2. pid-inverted-pendulum.html — "Stabilizer" (Cart–Pole / Quadcopter / Step Bench)

Integration: fixed 1/240 s substeps (verified: sim clock advances exactly with the
speed buttons — 60 frames = 2.00 s at 2×).

## PASS

- **The cart–pole dynamics are the exact nonlinear Lagrangian equations.**
  With all gains zeroed and swing-up off, the falling pole was compared against an
  independent mass-matrix derivation (M = 1.0 kg, m = 0.35 kg, L = 1.15 m)
  integrated separately: over 1.0 s of free fall through 154°, Δθ ≤ 0.6° and
  Δx = 0.00 m at every checkpoint. (Caveats under Bends: point-mass pendulum,
  added viscous friction, ad-hoc wind split.) RK4 substeps at 240 Hz as claimed.
- **Tuned Cart–Pole preset does what it says.** From θ = 16.0°, x = −0.6 → xRef
  +0.6: "Balanced" at 1.75 s; max |θ| after 5 s = 0.2°; final x = +0.60 m,
  θ = 0.0°, SS error 0.0°. Rail Step Jump: x settles at −1.40 m, rebalanced in
  2.3 s. Poke impulse (ω kick ±2.15 rad/s): max |θ| 15.8°, recovered in 3.6 s.
  With u_max cut to 15 N it still recovers from a poke (3.9 s).
- **The step-response metrics engine is accurate.** Page-reported overshoot vs
  overshoot computed from independently sampled traces, four separate runs:
  53.2% vs 52.4% (cart angle), 4.6% vs 4.5% (rail step), 60.7% vs 60.4% and
  18.7% vs 18.6% (windup, AW off/on), 48.9/7.7/9.9% vs 48.0/8.0/10.0% (bench
  regimes). Settling times agree within the difference of tolerance definitions.
- **No-Kᵢ steady-state error is theoretically exact.** Bench, Kp = 12, Ki = 0,
  spring k = 2.6, target 1.5: page SS error +0.267 m; analytic
  k·r/(Kp + k) = 0.2671 m; measured mean position 1.230 = predicted 1.2329.
- **Anti-windup works, direction and rough size as advertised.** Windup preset
  (u_max = 10 N, Ki = 22): overshoot 60.4% with anti-windup off vs 18.6% with it
  on (page's own readouts: 60.7% / 18.7%). See Bends for the "fix" wording.
- **Derivative kick is real and isolated to the D term.** On a step jump, peak
  |D term| = 689.7 N with "Derivative on Error" on vs 45.4 N with derivative on
  measurement (u itself saturates at the 45 N limit either way, so the kick is
  visible in the D bar, as the lesson text describes).
- **Gain extremes behave as control theory says.** Cart–pole Kp = 150, Ki = 60,
  Kd = 0: balance is destroyed (pole driven to 180°, ends up cycling in swing-up
  mode, never Balanced). Kp = 150, Ki = 0, Kd = 40: balances cleanly
  (max |θ| after 5 s = 0.1°) — the D term is doing genuine work.
- **Quadcopter architecture is as described.** Altitude PID with gravity
  feedforward (hover thrust measured 11.8 N = mg exactly for m = 1.2 kg),
  horizontal PID → pitch cascade with per-rotor mixing and ±35.5° pitch cap —
  all present in the driven behaviour. Flip disturbance (φ = 0.85 rad,
  ω = 5.5 rad/s, vy = −2.6): recovered to Locked Hover in 2.0 s.
- **Physical parameter sliders are live.** Mass 1.5 kg with stock gains: Balanced
  (θ 0.9°, x within 0.04 m). Gravity 1.6 m/s²: still converging at 12 s
  (θ 1.3°) — slower, as lower-g dynamics dictate. Speed buttons scale the sim
  clock correctly.
- **Bench damping is quantitatively right** where it can be isolated: free-plant
  log-decrement ≈ 0.19/s vs 0.175/s theory (c = 0.35); closed-loop per-stage
  reference integration reproduces theory exactly (see the ZOH finding for the
  one systematic deviation, which is in the control hold, not the plant).

## BENDS

- **Zero-order-held control force quietly eats damping (≈ Kp·dt/2).** The PID
  force u is computed once per 1/240 s substep and held constant across the RK4
  stages. That injects negative damping of Kp·dt/2 ≈ 0.075 N·s/m at bench
  defaults. Verified to 4 decimals by replica integration: with per-stage force
  recomputation the bench decays at exactly theory (0.175/s at c = 0.35;
  0.040/s at c = 0.08); as shipped it decays at 0.1375/s and 0.0027/s.
  Consequence: the **P-Only Wild Osc preset's "sustained ringing" is
  accidentally true** — its damper (c = 0.08) should eat 58% of the amplitude
  in 21 s, but as shipped the amplitude falls only ~5% in 21 s (peaks
  1.324 → 1.26 m over 40 s) because the hold artifact cancels the damper.
  The oscillation frequency is exact (period 1.02 s vs √(38)/2π predicted
  0.98 Hz); only the decay is wrong, by ~13×, in the "more sustained" direction.
- **"Critically Damped Drone" overshoots and has a long tail.** Altitude step
  1.2 → 3.2 m: measured peak 3.28 m = 4.0% overshoot (page OS readout 3.9%).
  "Locked Hover" status arrives at 1.6 s, but the page's own settling-time
  readout for the same step says 12.16 s (integral tail). A snap by the lock
  criterion; not critically damped by the response metrics.
- **Bench regime names are gain nicknames, not response classes.** "Critical"
  (toast: "near-zero overshoot") measures 7.7–8.0% overshoot. "Overdamped"
  (toast: "sluggish crawl, zero oscillation") measures 9.9% overshoot — an
  overdamped response by definition has none; the hump is integral-driven.
  It is correctly the slowest to settle (9.65 s vs 3.92 s underdamped).
- **Anti-windup "fix" overstates.** The windup preset's toast says toggle
  anti-windup ON "to fix" the overshoot; measured: 60.7% → 18.7%. A 42-point
  improvement, not a fix — saturation at u_max = 10 N still costs ~19%.
- **Stormy Wind Hover leans but cannot hold station.** Mean pitch −18°…−33°
  (leaning into the wind, as claimed) and it never crashes, but over 60 s the
  mean 2D position error wanders 0.6–3.1 m window to window, status "Saturated"
  most of the time: the ±35.5° pitch cap is at/below what the gust peaks demand
  (steady wind alone needs ~31° of lean). "Hover" is doing heavy lifting.
- **Cart–pole model simplifications under the "exact" banner.** The Lagrangian
  core is exact for a *point-mass* pendulum (no rod inertia). Shipped extras:
  cart friction bx = 0.10, pivot friction bth = 0.012, and wind enters through
  ad-hoc splits (0.25×F_wind on the cart, 0.45×F_wind·L·cosθ as bob torque) —
  reasonable game physics, not an aerodynamic model.
- **Tuned Cart–Pole's own OS readout is 53.2%.** The angle channel treats the
  deliberate lean used to move the cart 1.2 m as overshoot (θ swings to −8.4°).
  The balance itself is genuinely crisp (Balanced at 1.75 s); the metric
  framing makes the flagship preset look sloppy on its own scope.

## FALSE

- **Swing-Up & Catch never catches.** The dedicated preset (and the
  "Auto Swing-Up & Catch Assist" generally) was driven for 90 s: in every 5 s
  window the pole's closest approach to upright was **99.1°** — the swing
  amplitude plateaus at ~81° in a limit cycle, nowhere near the catch window
  (|θ| < 20.6°, |ω| < 4.2 rad/s). The cart wanders ±1.6 m meanwhile. Same
  result recovering from Drop with assist toggled on mid-run: never caught.
  The Åström–Furuta energy formula is implemented as written in the code, but
  with the shipped pump gain (4.6), centring term (11.5/6.8) and friction, the
  pumped energy plateaus where input balances losses — the headline feature of
  the preset, and the recovery path for every fall with assist on, does not
  work as shipped. (With assist *off*, Drop correctly stays Fallen at ±179°,
  and ordinary PID recovery from pokes/gusts is unaffected — this failure is
  specific to the swing-up path.)

---

## Method notes & limits

- Telemetry is rounded by the pages (arm: 1 mm / 1°; pendulum: 0.1° / 0.01 m /
  0.1 N); arm link-clearance figures carry ≈ ±3 mm reconstruction tolerance,
  which does not affect any verdict (worst penetration was 1.1 mm from an
  obstacle *centre*).
- Solvers were driven at 60 fps synthetic frames; the pendulum runs its own
  240 Hz substeps inside each frame, so its results are frame-rate independent.
  The arm's solvers re-run per frame by design (noted where it matters).
- A first-frame dt-clamp in the harness initially mimicked a physics lag in the
  open-loop comparison; re-run with aligned start states, the cart–pole matched
  the independent integrator to ≤0.6° (see PASS). All other results were
  re-checked against such artifacts.
- Not assessed: WebAudio output, canvas rendering quality, touch input,
  the quadcopter's scope-channel P/I/D bar bookkeeping in quad_x mode.
