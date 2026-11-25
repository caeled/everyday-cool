# Audit — robot-sensors-workshop.html (Antigravity build; Robot Room "Sensors" workshop)

Audit date: 2026-11-24. Method: the shipped file was loaded headlessly (jsdom,
`runScripts:"dangerously"`, virtual-console errors captured) in two forms — the
**unmodified** page, driven through its own UI (every preset, seg-button,
checkbox, slider and button clicked; telemetry read from the DOM), and an
**in-memory instrumented copy** (one appended line exposing the closure's
`state`, `rover`, `stepSim`, `castSensorRay`, `sampleLineTrack`, `loadPreset`;
the file on disk was not changed) so the sensor models could be measured at
known poses against hand-computed geometry. The uploaded file was not edited;
nothing was committed.

The page is a single-arena rover sim ("SensorLab"), not a set of separate
benches: ultrasonic sonar, 360° lidar, stereo camera, 5-channel IR line array,
tactile bumpers, a magnetometer/gyro odometry ghost, and a GPS + "Kalman"
fusion layer, over six preset labs (Full Sensor Suite, Glass vs. Foam, IR
Line-Follower, GPS-Denied Tunnel, Magnet & Gyro Drift, Icy Wheel Slip). There
is no `runProofs()` or self-test in the file. No real part numbers (HC-SR04,
MPU-6050, …) are named anywhere, so there are no datasheet claims to check;
the claims audited are the page's own labels and the behaviour of its models.
Units throughout are arena pixels labelled "cm" (an unstated 1 px = 1 cm
scale: arena 740×490 "cm", max range 280 "cm", top speed ≈ 95 "cm/s" — a
self-consistent scale, stated nowhere).

---

## LIVENESS — PASS (the anti-Qwen result)

Zero script errors on load and after a full UI drive: all six presets load,
telemetry updates live (sonar/lidar/IMU/KF-error/odom-error/GPS/bumper all
change value), IR indicator dots toggle, sliders relabel, drive/scope/tool
seg-buttons switch, waypoint clicks, wall painting, pause/reset/zen/drawer
all act. After Qwen's two dead-on-arrival pilots, this page simply runs.

## PASS — cores that measure true

- **Sonar geometry is exact.** Noise off, perpendicular concrete wall 100 px
  ahead of the nose: `sonarDist = 100.00`. The 5-ray cone (centre ray ±
  2 × 0.085 rad ≈ ±9.7°) takes the minimum, as a real wide-beam sensor
  effectively does.
- **Material rules are implemented as labelled, both directions.** Sonar
  hears glass (100.00 off a glass wall) and is blind to foam (280 / "none"
  with only foam in range); lidar sees foam (front = 122.00 off a foam wall)
  and passes through glass (front = 280, zero hits on the glass plane). The
  "Glass fools Lidar · Foam absorbs Sonar" key is true in the code.
- **Sonar specular cutoff works.** A short concrete wall at 50° incidence is
  invisible to sonar (280 / none — every sub-ray's cos(incidence) < 0.72 is
  discarded, so the echo "bounces away"); the same wall at 30° reads exactly
  100.0. (With a long wall, an edge sub-ray at shallower incidence survives
  and returns a reading — also physically sensible.)
- **IR line array model is exact and the follower holds the line.**
  `sampleLineTrack` returns 1 − d/9.5 inside 9.5 px of the centreline;
  sampled values match the formula (1.000 on the line, 0.000 at 60 px off),
  and the 5-sensor pattern on the line is symmetric (0, 0.21, 1.00, 0.21, 0).
  Driven for 120 s in IR Line mode, the rover's centre stayed within 9.5 px
  of the figure-8 track for **100.0% of steps** and was never lost.
- **Gyro bias integration is exact.** Stationary rover, bias 1.8 °/s:
  odometry heading reads **18.00° after 10.0 s**. The dead-reckoning drift
  story the page tells is really integrated, not scripted.
- **The position Kalman filter is a real scalar KF with an honest
  measurement.** Predict from (corrupted) odometry; GPS fix every 0.22 s is
  true pose + Gaussian noise (measured σ = 7.40 at slider 3.0, coded
  2.4 × 3.0 = 7.2); gain K = P/(P + R), posterior σ = √((1−K)P). Over 90 s of
  Fusion-preset patrol: **KF position error RMS 12.1 px vs odometry RMS
  30.6 px** (max 20.3 vs 40.5). In the GPS-Denied Tunnel run the covariance
  honestly grows (to 64.5 of its 72 cap) and contracts again on lock (5.3 at
  the end of the Fusion run). GPS-denied zones, the status pill, and the
  bumper/reflex wiring all behave as labelled.
- **Stereo noise grows with distance** (σ = 0.03·range + 0.5·slider), the
  right qualitative shape for stereo depth, and fog really degrades it
  (range 220 → 95, σ → 16 flat).
- **Self-containment is exemplary.** Zero external resources: no CDN, no
  webfonts, no external images, no `<link>` tags — the file makes no network
  requests at all. The collection's offline rule is fully satisfied.

## FALSE

- **"5-IR PID figure-8 race" / "IR Line PID" — there is no PID.** The line
  controller is one line: `targetW = err * 2.35`, where `err` is the IR
  weighted centroid. That is a proportional controller. No integral state,
  no derivative term, no previous-error variable exists anywhere in the
  file. The P controller itself is good (see the 100% on-line measurement
  above) — but two of the three letters in the label name machinery that
  was never built.
- **The Kalman heading update reads ground truth.** At each GPS fix the
  filter corrects its heading with `hErr = rover.theta − rover.kfTheta` —
  the *true* heading — attenuated by a gain. The page's own magnetometer
  model (`imuHeading`, which is computed every step and displayed) is never
  consumed by the filter; neither is any gyro-only estimate. Measured
  consequence: stationary with the gyro bias at 5.5 °/s, odometry heading
  drifts the full **330° in 60 s** while the KF heading error never exceeds
  **2.8°** — not because the fusion is clever, but because its heading
  "measurement" is the answer. Near the magnets the page's compass errs by
  up to **65.9°** (a magnet 60 px to the side swings the displayed heading
  from 57.30° to 350.04°), yet the KF heading anchor is untouched by that
  error; only its correction gain is damped. The position fusion is honest
  (above); the heading fusion is a ground-truth shortcut of exactly the
  kind this collection's audits flag. In the Magnet & Gyro Drift preset the
  fused ghost therefore cannot show the failure the lab is named for.

## BENDS (presentation layer — Antigravity's usual neighbourhood)

- **"360° Scanning ToF Lidar" / sonar: no time-of-flight exists.** Neither
  sensor models c, an echo time, or temperature; distances are exact
  geometric raycasts plus Gaussian noise. "ToF" is flavour text on a
  raycaster. (The 360° part is true: 72 rays at 5° steps.)
- **Stereo "65° FOV" overstates the fan.** The 17 stereo rays span
  ±8 × 0.068 rad = **±31.2° (62.3° total)**; the frustum is *drawn* at
  ±0.56 rad (64.2°). Measured: a target centred at +31.9° — inside the
  drawn frustum and inside the labelled 65° — returns **0 stereo points**.
- **"Kalman Filter + 95% Ellipse" is a 1.9σ circle.** The ellipse is drawn
  at radius `kfCov × 1.9`. A 1.9σ circle contains ≈ **83.6%** of a 2D
  Gaussian; a true 95% circle needs 2.45σ. The ellipse is real; its
  confidence label is ~11 points optimistic.
- **The "Sensor Range Noise (σ)" slider is no sensor's σ.** It is a master
  knob each sensor secretly rescales. Measured at slider = 3.0 cm: sonar
  σ ≈ **2.02** (coded 0.65×), lidar-front σ ≈ **0.59** (coded 0.25×, min of
  3 rays), GPS σ ≈ **7.40** (coded 2.4×). A visitor who sets "σ = 3.0 cm"
  gets 0.6–7.4 cm depending on which readout they watch.
- **Scope traces are not on a common scale.** In Range mode the Kalman
  error is plotted ×2 against a 180 full-scale while odometry drift is
  plotted ×1 against the same 180 — the two lines under one legend cannot
  be compared by eye (the ×2 happens to penalise the KF line).
- **Encoders are decoration; odometry never reads them.** Odometry
  integrates `rover.v × slipMult` directly. Sabotage test: wheel counters
  set to ±99,999 mid-run — odometry output bit-identical. The quadrature
  scope traces are a genuine 90° pair (sin/cos of wheel phase), but the
  "Icy Wheel Slip — Quadrature vs Kalman" lab's encoder plays no part in
  the estimate it is compared against; slip enters odometry by
  construction, not by counted pulses.
- **The slip % is not the slip delivered.** The slip multiplier oscillates,
  `1 + slip × (0.4 + 0.6·sin(3.1t))`: at the "8%" setting the odometry
  error factor swings −1.6%…+8% with a mean of ≈ +3.2% — about 40% of the
  labelled value on average. On ice the base becomes 0.45 with the same
  oscillation, and the gyro bias silently grows ×1.8 — neither is stated.
- **Ice slips the estimate, not the rover.** The true rover's motion is
  identical on and off ice; only odometry/encoder corruption changes. For a
  sensors workshop that is a defensible seam, but "Icy Wheel Slip" reads
  as though the wheels lose grip in the world, not just in the bookkeeping.
- **Magnetometer gain is a cartoon, printed nowhere.** One magnet 60 px
  away pulls 2.7× the base field (12000/d² falloff); the distortion meter
  pegs at 0.933 and the compass swings ~67°. The mechanism (inverse-square
  pull rotating the local field vector) is real; its sensitivity is
  arcade-grade and no constant is shown.
- **Auto patrol grinds against walls.** A colliding step cancels the whole
  move — translation *and* rotation — so while in contact the rover cannot
  turn away; escape waits for the back-off to break contact. Measured 60 s
  path lengths: Fusion **2310 px**, Tunnel **379 px**, Slip **445 px**,
  Glass vs. Foam **144 px**; in Magnet & Gyro Drift the rover spends
  **88% of steps** in bumper contact. The presets are drivable by hand, but
  "Auto Patrol" barely patrols three of its own six arenas.
- **Small label/code mismatches:** sonar telemetry switches to "NO ECHO"
  at ≥275 and lidar to ">280 cm" at ≥275, against the 280 range used in
  code; the sonar wave arcs are drawn ±14.9° while the sampled cone is
  ±9.7°; the code comment claims the specular cutoff is ">42°" where
  cos⁻¹(0.72) = 43.9°. The sim clock is wall-clock rAF with dt clamped to
  0.05 s, so below 20 fps the sim runs in slow motion rather than catching
  up.

## Integration readiness

**NOT READY — four small, well-scoped fixes, after which the remaining
items are lesson-note bends.** (1) The line controller's label: call it
P (or "proportional") everywhere "PID" now stands, or build the I and D
terms the label promises. (2) The Kalman heading update must consume the
page's own compass/gyro estimate — or be labelled as an ideal-compass
correction; as shipped, the fused heading is anchored to ground truth and
the Magnet & Gyro Drift lab's central phenomenon cannot appear in the
fused estimate. (3) The "95%" ellipse: draw at 2.45σ or relabel ≈84%.
(4) Stereo FOV: relabel 62° (or widen the fan to the drawn 64–65°).
Everything else — the σ-slider scaling, scope ×2 trace, decorative
encoders, slip oscillation, ice seam, magnet gain, wall-grinding patrol —
is honest-bend material for the lesson page, in the familiar Antigravity
pattern: the cores are real (sonar geometry, material rules, specular
cutoff, IR following, bias integration and the position KF all measured
true), and the bends live in the labels wrapped around them. Structure,
liveness and offline hygiene are the cleanest first showing of any guest
builder in this bundle.

---

## Repair addendum (2026-11-24, Steven's sanction)

Steven sanctioned the audit's four fixes in-house ("Sanction the four
fixes in-house, then integrate", 2026-11-24). The upload was not edited;
the repaired copy ships as `projects/robot-room/everyday-sensors.html`.

- Upload: `~/workspace/user/files/robot-sensors-workshop.html` —
  sha256 `a8e1480fd35135ff2c75d91af7d4a99917f43faa51a445e8f9f5ffaf0c9af50c`
- Repaired: `projects/robot-room/everyday-sensors.html` —
  sha256 `e21ef1e4126e8d40b11bf22557f4e6340114b88cb7f5da663750bd08c87a01c1`
- Diff: 6 hunks, nothing else moved (the four fixes below; fix 4 is two
  one-line constant changes).

**Fix 1 — "PID" relabelled to the proportional control it is.** The line
controller is `targetW = err * 2.35` (proportional only; no integral or
derivative state exists). Both surviving labels changed: preset sub
"5-IR PID figure-8 race" → "5-IR P-control figure-8 race"; drive button
"IR Line PID" → "IR Line P-Control". A whole-file search confirms zero
"PID" strings remain. The I and D terms were deliberately NOT built —
the room's Control workshop is the PID room; an honest P follower is
correct teaching here.

**Fix 2 — Kalman heading now consumes the page's own compass.** The
heading update read `hErr = rover.theta - rover.kfTheta` (ground
truth). It now computes the measurement from the page's magnetometer:
`compassTheta = rover.imuHeading` converted to radians and unwrapped to
[−π, π], and `hErr = compassTheta - rover.kfTheta`. The existing gain
structure is untouched (the position KF's K, capped at 0.45, damped by
(1 − magDistort × 0.7) — magDistort is the page's own sensor-derived
distortion estimate, not ground truth). No form of rover.theta feeds
the estimate. Re-measured (jsdom, fixed dt = 1/60, seeded RNG; the
original file run through the identical harness as the control):

- *Clean compass, gyro bias 5.5 °/s, stationary, 60 s:* odometry drifts
  the full 330.00° in both files; fused heading error max 2.92°, final
  1.91° — **identical in both files**, because with no magnets the
  compass reading equals the true heading and the honest update is
  arithmetically the same update. The cheat was invisible exactly where
  the compass is honest.
- *Magnet swing (the discriminating case):* rover stationary at
  57.30°, one magnet 60 px to the side (strength 1.0). Compass swings
  57.30° → 350.04° and magDistort pegs at 0.933 — identical in both
  files, reproducing the audit's numbers exactly. Fused heading error:
  original stays **0.00° at every mark** (its "measurement" was the
  answer). Repaired: **−29.98° at 1 s, −45.39° at 2 s, −63.39° at 5 s,
  −67.05° at 10 s, −67.25° from 20 s on** — the filter absorbs
  essentially the whole 67.26° compass error. The magDistort damping
  (≈ ×0.35 on the gain) slows the absorption to a ~2–3 s time
  constant; it does not prevent it. That is the honest behaviour of a
  compass-trusting filter, and the Magnet & Gyro Drift lab's central
  phenomenon can now appear in the fused estimate.

**Fix 3 — "95% Ellipse" drawn at 2.45σ.** The draw factor changed
`rover.kfCov * 1.9` → `rover.kfCov * 2.45`, so the existing label
becomes true (≈95% 2D containment). Verified from the shipped render
code's own canvas calls: with kfCov set to 10, the drawn radius is
24.5 (was 19.0).

**Fix 4 — Stereo FOV widened to the labelled 65°.** Ray step
`k * 0.068` → `k * 0.0709` (17 rays, k = −8…8: fan now ±0.5672 rad =
±32.50°, 65.0° total), and the drawn frustum `±0.56` → `±0.5672` rad
so label, fan and frustum agree. Verified: measured fan from the
returned points is now max |bearing| **32.50°** (was 31.17°); drawn
frustum half-angle measured from the render calls is 32.50° (was
32.08°); and a small target (3.4 px wide) centred at bearing +31.9°,
150 px from the nose — inside the labelled cone, returning **0 points
before the fix** — now returns **1 point**.

**Regression — the audit's key measurements, re-run post-repair**
(identical harness, original file as control): sonar exactness —
concrete wall 100 px ahead of the nose reads **100.00** in both files;
glass — sonar hears it (100.00), lidar passes through (280) in both;
foam — sonar blind (280), lidar reads it (144.00 from centre for a
wall 122 ahead of the nose) in both; gyro bias integration — 1.8 °/s
for 10.0 s gives exactly **18.00°** in both; IR line follower — rover
centre within 9.5 px of the figure-8 for **100.0%** of steps over
120 s in both; position KF — RMS error 12.9 px (repaired) vs 11.8 px
(original) over a 90 s Fusion patrol under this harness, both far
under odometry's (112–118 px here; odometry RMS is trajectory- and
harness-dependent — the audit's own run measured 30.6 px — the
invariant, KF ≪ odometry, holds in every harness). Zero script errors
in both files through the full drive.

**Readiness after repair: READY for integration.** The remaining audit
items (σ-slider rescaling, scope ×2 trace, decorative encoders, slip
oscillation ≈40% of label, ice seam, magnet gain cartoon, wall-grinding
patrol, no-ToF "ToF" label, 1 px = 1 cm unstated scale) are documented
bends, carried into the lesson page's honest notes.
