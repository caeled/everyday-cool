# Audit — FEA Topology Optimizer and Lidar SLAM Robot

Date: 2026-11-24  
Scope: audit only. The two uploaded exhibit files were not edited and nothing was committed.

Files audited:

- `~/workspace/user/files/fea-topology-optimizer.html`
- `~/workspace/user/files/lidar-slam-robot.html`

## Method

Both pages were run headlessly in Node/jsdom with canvas stubs. Reading the code was not treated as sufficient:

- The FEA solver class was extracted from the shipped page and exercised directly: equilibrium residuals, patch tests, a solid cantilever benchmark, force scaling, SIMP parameter sweeps, all six presets, and runs to the page's own convergence flag.
- The FEA browser UI was also driven: tabs, presets, Step/Play, sliders, view/tool buttons, checkboxes, canvas paint/erase, load dragging, drawer/cinema and keyboard shortcuts.
- The SLAM page was instrumented in memory only (the file on disk was not changed) to expose its shipped state and functions. I tested DDA rays against known geometry, collected thousands of noisy range samples, displaced the estimated pose by known amounts, drove the robot into a wall and a corner, ran autonomous exploration, and drove the DOM controls, canvas tools, pan/zoom and keyboard drive.

Verdict words used below:

- **PASS** — the claim is borne out by the shipped code under test.
- **BENDS** — the mechanism is real, but the label, scope, units or behaviour is materially narrower/different than presented.
- **FALSE** — the claim is contradicted by measurement or by an explicit ground-truth/scripted shortcut.

---

# 1. FEA Topology Optimizer

## Bottom line

**This is a real finite-element solve and a real SIMP/OC topology optimizer. It is not a visual heuristic wearing the vocabulary.**

The page assembles/applies a Q4 plane-stress stiffness operator, solves it with Jacobi-preconditioned conjugate gradients, computes element strain-energy sensitivities, applies the standard density-weighted sensitivity filter, and updates densities with an optimality-criteria bisection under a move limit. The measured compliance falls by 70–88% on the presets while the active-design volume stays on target.

The important failure is not the optimizer. It is the **stress/safety-factor presentation for intermediate-density material**: element stress is multiplied by `rho`, while the stiffness/constitutive law used for displacement is `Emin + rho^p (1-Emin)`. At uniform `rho = 0.4, p = 3`, that makes the reported peak von Mises stress **6.25×** the stress consistent with the page's own SIMP constitutive law, and turns a consistent safety factor of about **5.89** into a displayed **0.94**. In the six fully converged preset runs the peak happened to sit in a `rho = 1` element, so the final peak was not changed by this factor; the problem is serious during optimization, for probes, and for any design whose peak sits in grey material.

A second presentation bend is **Volume Used**: the optimizer's target applies to free/designable elements, but the telemetry denominator excludes permanent voids while including permanent solids. The Arch preset therefore reads **42.5%** and the Wheel **59.5%** while the target slider says **40%**.

## Claim-by-claim results

| Claim on the page | Verdict | Measured evidence |
|---|---:|---|
| “Q4 FEM · SIMP”; 48×24 Q4 mesh | **PASS** | Default mesh is 48×24 = 1,152 bilinear Q4 elements, 1,225 nodes, 2,450 DOFs. L-Bracket and Wheel switch to 34×34 as the UI reports. |
| Q4 bilinear plane-stress elements; 2×2 Gauss quadrature | **PASS** | The unit-element stiffness is formed from the plane-stress `D` matrix and `B` at the four 2×2 Gauss points. Constant-translation and infinitesimal-rotation patch tests gave strain energy 4.85×10⁻¹² and 1.37×10⁻¹⁶ respectively and peak von Mises values below 1.6×10⁻¹³ MPa in the normalized test fields — i.e. rigid modes produce no spurious stress. |
| Real stiffness solve / boundary conditions, not a fake deflection picture | **PASS** | `applyK` applies the element stiffness matrix-free, fixed DOFs are removed from the PCG solve, and loads are distributed bilinearly to nodes. For the initial uniform design, the free-DOF equilibrium residual was `||f-Ku|| / ||f|| = 9.09×10⁻⁵`, meeting the requested `1×10⁻⁴` tolerance. A high-accuracy solid solve reached relative residual `9.26×10⁻¹²`. |
| Cantilever deflection is physically credible | **PASS, with the right comparator** | A fully solid 1200×600×20 mm cantilever, 120 kN at the tip centre, gave tip-centre deflection **2.073 mm**. Euler–Bernoulli predicts **1.684 mm**, but this is a deep beam (L/H = 2), so shear matters. Timoshenko beam theory predicts **2.013 mm**; the FE result is **+3.0%** from that and +23.1% from Euler. Tip vertical displacement averaged over the end face was 1.981 mm. |
| Fixed-end bending stress | **BENDS** | FE centroid `sigma_xx` in the wall elements was **±139.1 MPa**. Nominal beam stress at the same element centroids (x = 12.5 mm from the wall, y = ±287.5 mm) is **±113.8 MPa**, so the Q4 centroid value is about **22% high**, with additional `sigma_yy = ±23.6 MPa` and shear `−21.8 MPa` from the clamp/load end effects. This is plausible coarse-Q4/end-effect behaviour, but the page's stress numbers should not be read as design-grade local stresses. |
| Peak von Mises / Safety Factor | **FALSE as a general physical claim during grey-density states; arithmetically consistent in the tested converged finals** | Stress is computed with a factor `rho`, not the SIMP effective modulus `Eeff = Emin + rho^p (1-Emin)`. At the initial uniform design (`rho=0.4`, `p=3`), the peak element had `rho=0.4`, `Eeff=0.064009`; reported peak VM was **933.5 MPa** and SF **0.94**. The VM consistent with the stiffness law is **149.4 MPa**, SF **5.89** — exactly the solid-beam peak scale. Ratio: **6.25×**. After full convergence, the peak element was `rho=1` in all six presets, so this factor did not alter those final peaks. Peak location is also at clamps/loads, i.e. singularity-prone. |
| “Strain Energy” telemetry in joules | **PASS for strain energy; BENDS for the word “compliance”** | The code reports `0.5 fᵀu`, which is strain energy `U`. In linear elasticity, compliance is `fᵀu = 2U`. The HUD label “Strain Energy” is therefore right; the sparkline/variable name “Compliance” is off by a factor of two if read literally. Percentage reduction is unaffected. Doubling the load on a fixed solved state scaled displacement ×2, VM ×2 and reported energy ×4 exactly, as required. |
| Material: Ti-6Al-4V, E₀ = 114 GPa, ν = 0.30, yield = 880 MPa, thickness 20 mm, element size 25 mm | **PASS as the model's stated constants** | These are the constants actually used. 114 GPa and ν=0.30 are standard textbook values for Ti-6Al-4V; 880 MPa is a defensible typical yield value, though real yield depends on product form/temper, which the page does not specify. Geometry follows from 25 mm elements: 1200×600 mm for the default mesh. |
| SIMP interpolation and sensitivity | **PASS** | `Eeff[e] = Emin + rho[e]^p (1-Emin)` with `Emin=1e-5`; sensitivity is `dc[e] = -p (1-Emin) rho[e]^(p-1) (uₑᵀ Kₑ uₑ)`. That is the standard compliance sensitivity for this interpolation. |
| Sensitivity filtering | **PASS** | The filter is the usual Sigmund-style cone filter: weights `rmin - dist`, filtered sensitivity weighted by neighbour `rho*dc` and divided by `rho[e]` and the weight sum. Changing `rmin` rebuilds the filter and un-converges the design. |
| Optimality Criteria update | **PASS** | The update is a genuine OC bisection on the Lagrange multiplier with move limit 0.2 and density bounds `[0.001, 1]`. Sensitivities are normalized by their mean magnitude before the update; that scale is absorbed by the bisected multiplier and does not change the OC form. |
| Target volume fraction | **PASS for designable elements; BENDS for the telemetry label** | 60-step runs landed at volume **0.200001** for target 0.20, **0.3999995** for 0.40 and **0.6500001** for 0.65 (measured over the optimizer's active denominator). But the HUD's “Volume Used” excludes void-mask elements and includes fixed solids: Arch reads **42.5%** and Wheel **59.5%** against a 40% slider. On L-Bracket the active-denominator value is 40.0% while material over the whole 34×34 bounding domain is only 24.8% because the cut-out quadrant is excluded. |
| Convergence behaviour | **PASS, with a loose criterion** | Default cantilever history over 100 steps was monotone decreasing in the recorded sequence (no upward violations): **1942.87 J → 282.48 J**. It had not met the page's convergence flag at step 100 (`lastChange=0.00620`); it converged at **step 165** with **281.21 J** and `lastChange=0.004448`. The flag is only “max density change < 0.0045 after at least 22 iterations” — a density-change stopping rule, not a KKT/objective-gradient test. |
| Presets all optimize | **PASS** | Runs to the page's own convergence flag: Cantilever 165 steps, 1942.87→281.21 J; MBB 37 steps, 339.99→40.22 J; Arch 36 steps, 83.28→9.58 J; L-Bracket 111 steps, 6969.90→1000.80 J; Wheel 60 steps, 91.94→26.51 J; Hole-Bypass 70 steps, 2254.24→321.10 J. Reductions: 70–88%. |
| SIMP penalty slider behaves as claimed | **PASS** | At uniform rho=0.4, initial energy rises with penalty as the interpolation dictates: p=1.5 → 491.57 J, p=3 → 1942.87 J, p=4.5 → 7676.32 J. After 25 steps the grey-element counts were 848/1152 at p=1.5, 388/1152 at p=3 and 310/1152 at p=4.5 — higher penalty really does push the design toward black-and-white. |
| Optimization pace slider (4–60 it/s) | **BENDS** | The main loop performs at most one optimizer step per animation frame and caps the accumulator, so the delivered rate is bounded by frame rate and step cost. Headless, the solver alone ran 100 default steps in 4.07 s (~24.6 steps/s before rendering), so 18 it/s is plausible on a good desktop, but 60 it/s is not guaranteed by the loop structure. |
| Deformation scale slider | **BENDS** | The slider does not multiply the physical displacement by the labelled factor. Rendering normalizes displacement: the multiplier is capped so the maximum visual displacement is about `0.24 × deformScale` element widths. It is a normalized picture control, not “3.0× the real deflection” in the physical sense. The telemetry deflection remains the physical value. |

## Driven interactions — FEA

All tested controls did something real; **no wholly dead control was found**.

- **Presets:** all six loaded. Mesh readout changed correctly (48×24 vs 34×34), force-angle readout changed to 90° for Wheel and 270° for the others, and the Arch/Wheel volume contradiction above was visible immediately in the HUD (42.5% / 59.5%).
- **Step +1:** iteration counter advanced 0 → 1. **Play/Pause:** status and button flipped between Optimizing/Pause and Paused/Play correctly, including via the Space key.
- **Force slider:** on a fixed solved state the scaling is exact (see above). In the live UI, changing force after an optimizer step recomputes post-processing from the current displacement field; because a step leaves densities one update ahead of the last solve, the first telemetry refresh after a step can pair a new density field with the previous equilibrium solution. The next solve removes the inconsistency. This is a one-iteration reporting lag, not a broken slider.
- **Angle slider:** changing 270° → 180° changed the solved deflection (32.38 mm class response rotated to a 6.77 mm max-deflection response in the UI test state).
- **Paint tools (canvas-driven):** painting a void near element (10,22) changed the live solve from **1942.9 J / 32.38 mm / 934 MPa** to **2393.5 J / 40.61 mm / 1390 MPa**. Painting the same spot solid moved it to **2154.5 J / 33.03 mm** and raised Volume Used to 40.7%; Erase moved it back toward the original (**1958.9 J / 32.51 mm**).
- **Load dragging:** dragging the load anchor changed the solve (**1958.9 J → 1305.9 J**); clicking a new load point in Load mode moved it again (**→ 380.1 J, max deflection 10.76 mm**). The tail-rotate handler is wired to the same rebuild/solve path.
- **Views/tools/toggles:** Density, von Mises and Principal views all selected; Load/Void/Solid/Erase tools all selected; mesh/trajectory/ghost/shade checkboxes toggled without errors. Drawer and Cinema toggled their classes; keys 1–3, R and H worked.
- **“Clear Painted” label — BENDS:** the button does not merely clear painted masks. It reloads the whole preset, resetting densities, iteration count, load positions and painted masks together. In the UI test it returned the iteration counter to 0. Useful, but broader than its label.
- **Audio button:** in jsdom there is no `AudioContext`, and the code guards that; the button still flips to “Audio On” because the enabled flag is set before/regardless of context creation. In a normal browser a click creates the context, so this was not counted as a dead control, but the label can claim “On” in an environment where no audio engine exists.

## FEA verdict

- **Real FEM:** PASS.
- **Real SIMP/OC optimization:** PASS.
- **Deflection and compliance/energy:** PASS (deep-beam deflection within 3.0% of Timoshenko).
- **Stress and safety factor:** FALSE as an unqualified physical readout for intermediate densities (6.25× discrepancy at rho=0.4, p=3 against the page's own constitutive law); BENDS even in solid regions because peaks are coarse-mesh, centroid and singularity dominated.
- **Volume label:** BENDS (Arch 42.5% and Wheel 59.5% beside a 40% target).
- **Controls:** no dead controls found; “Clear Painted” does more than its label says.

---

# 2. Lidar SLAM Robot

## Bottom line

**The sensing, odometry and mapping are substantially real; the “ICP + loop closure” layer is a hybrid with an explicit ground-truth cheat, and the loop-closure counter is not loop closure.**

What is real:

- Lidar ranges come from a DDA ray cast against the actual drawn static/dynamic grid. Against known geometry the distances are exact to the grid boundary.
- Range noise really is additive Gaussian noise on hit ranges (measured SD **3.99 cm** at σ = 4.0 cm over 11,700 hit samples).
- Odometry is integrated from the robot's actual post-collision displacement with systematic and stochastic error terms; at drift 0 it is exact.
- The occupancy map is a genuine log-odds grid updated from noisy measured endpoints projected from the **estimated** pose — it is not simply painted from ground truth.
- Frontier detection, inflated-costmap A* and Pure Pursuit are real implementations, and the collision resolver kept the robot out of walls in every run (maximum penetration ≈ 0 cells).

What is not what the badge says:

- The matcher is **correlative scan-to-map search**, not ICP: it scores scan endpoints in a blurred likelihood field over a small grid of candidate poses. It has no point correspondences and no iterative closest-point solve.
- After that search, the code **pulls the estimated pose directly toward the true robot pose** — 16% per call when the match score is high, 72% on a forced snap. That term uses `state.bot`, the ground truth, and cannot exist in a real SLAM system.
- “Loop closures” are counted from accumulated correction + odometry error + a 4.5 s cooldown, or immediately on a forced snap. In 60 s autonomous runs the counter reached **12–14 in every preset**, essentially the cadence ceiling, and a forced snap at the start pose — zero travel, no loop — **incremented the counter and moved the estimate off the true pose**.

## Claim-by-claim results

| Claim on the page | Verdict | Measured evidence |
|---|---:|---|
| 360° lidar, 120 rays default, 6.0 m max range | **PASS** | World is 160×104 cells at 0.15 m = 24.0×15.6 m. Default scan has 120 rays over 2π; max range is 40 cells = 6.0 m. With noise set to 0, every measured range equalled the DDA true range. In the Blank arena from (24,52), only 39/120 rays hit within 6 m; the rest correctly returned max range/no-hit. |
| Ray casting measures the drawn environment | **PASS** | Blank-arena known geometry: east to the centre disc **53 cells (7.95 m)**, west to the perimeter **22 cells (3.30 m)**, north/south **50 cells (7.50 m)**, and from x=100 west to the disc **16 cells (2.40 m)** — all exact first occupied-cell boundaries from the DDA. Dynamic obstacles are also raycast via the dynamic mask. |
| Gaussian range noise σ, default 4.0 cm | **PASS at default; BENDS at extremes** | Over 300 scans / 11,700 hit ranges at the office start: mean error **−0.11 cm**, SD **3.99 cm** vs σ=4.0 cm; extremes −15.5/+14.6 cm. Noise is applied only to hits; no-hit rays stay at max range. Measured distances are clamped to [0.4 cells, maxRange], so at σ=24 cm the distribution is truncated/clamped (one-scan RMS ≈22.5 cm) rather than a pure Gaussian. |
| Lidar rays/sec telemetry (7,200/s at start) | **PASS, by the page's own accounting** | The counter accumulates rays actually cast per real second. At 120 rays and one physics step per 60 fps frame that is 7,200/s. At 4× speed the loop casts a full 360° scan per physics substep, so the count rises accordingly. Note the model is an instantaneous full scan each step, not a rotating scanner; the spinning turret is visual. |
| Wheel odometry drift model | **PASS as a model; BENDS as a “1.0×” quantity** | Odometry integrates actual displacement (including collision-resolved motion). Drift 0: error exactly 0 over a 19.764-cell (2.96 m) straight drive. Drift 1.0, ICP off: odometry ended at dx=19.402, dy=+4.553 cells with heading error **+0.471 rad (27.0°)**; position error **4.567 cells = 68.5 cm** over 2.96 m. Drift 3.5: error **17.80 cells = 2.67 m**, heading error −2.03 rad in that run. The dominant term is a systematic heading bias of about 0.018–0.022 rad per cell travelled, whose sign is randomized per preset. “1.0×” has no physical baseline unit, so the number is a game dial, not a calibrated drift rate. |
| “ICP Scan-Matching” | **BENDS on the mechanism; FALSE on the implied purity** | The matcher is coarse-to-fine **correlative scan-to-map** search (±0.55 then ±0.18 cells; ±0.035 then ±0.012 rad normally) scoring endpoints against a distance-blurred likelihood field. A small imposed error of 0.583 cells was reduced to **0.130 cells** (heading 0.030 → 0.006 rad). But a **3-cell (45 cm) displacement was not corrected at all** by the normal matcher — outside its basin. Separately, the ground-truth pull below contaminates every strong match. |
| Pose correction is sensor-only | **FALSE** | Code path: if match score > 0.38 (or on force), `est` is moved toward `state.bot` — the true pose — by **16%** per normal call and **72%** on force snap. A forced snap with a 5.83-cell imposed error ended at **0.409 cells** and counted a loop closure; most of that recovery is outside the correlative search result and is supplied by the truth pull. With ICP enabled on a 2.96 m drift-1.0 drive, estimated-pose error was **0.428 cells (6.4 cm)** — good-looking, but not achievable from the matcher alone as implemented. |
| Loop Closure (badge, counter, “Trigger Loop Snap”) | **FALSE** | There is no place recognition, no pose graph and no revisit test. The counter increments when accumulated correction and odometry error pass thresholds after a 4.5 s cooldown, or on any successful forced snap. Evidence: (1) forced snap at the start pose with a real map: **loopClosures +1** and the estimate moved from exact truth to **0.063 cells error**; (2) forced snap with zero imposed error in the core test: error 0 → **0.091 cells**, counter +1; (3) 60 s runs produced **13, 13, 13, 13, 14, 12–13** closures across Office/Warehouse/Maze/Dynamic/Noisy/Blank — the 4.5 s cooldown ceiling, not six different place-revisit histories. |
| Bayesian log-odds occupancy mapping | **PASS, with small bends** | One noise-free scan from the office start at the true estimated pose changed 1,561 cells: **94 occupied** (>+0.35), **1,471 free** (<−0.35), the rest unknown. Updates add `+l_occ` at the endpoint and a proportional free increment along the ray, clamped to [−4.6, +5.4]. Bends: the occupied cell is placed **0.12 cells (1.8 cm) beyond** the measured range; the robot footprint is forcibly set to at most −1.2 log-odds every scan; dynamic-obstacle hits are written into the same persistent grid with no temporal decay, so movers can leave ghost walls until re-observed as free. |
| Map Explored / Coverage % | **BENDS** | The percentage counts reachable cells whose log-odds are below the free threshold, divided by a reachable-cell total computed from the **true** static grid. Using ground truth as an evaluation denominator is reasonable for a score, but “explored” really means “confidently observed free”; observed walls and weakly observed cells do not count. After 60 s in Blank it read **98.39%** while the planner status was already “Map Complete!”. |
| “Map Complete — 100% of reachable space discovered” | **FALSE** | In the Blank arena the robot was declared **Map Complete** with **0 frontiers** at **98.39%** explored. The completion rule fires when no frontier clusters survive the inflated-costmap/frontier filters (or at ≥98.8%, or as a fallback above 94% when remaining frontiers are unreachable). The banner's “100%” overstates the page's own coverage metric by 1.61 points in that run. |
| Frontier-based exploration | **PASS** | Frontiers are detected on the belief grid (known-free cells adjacent to unknown, excluding inflated-blocked cells), clustered by BFS, size-filtered (≥3 cells), and scored by cluster size, distance and heading continuity, with A* reachability tries and blacklisting. Office after 60 s still had 5–6 frontiers and was still exploring; Blank reached zero frontiers. |
| A* path planning with safety inflation; reroutes live | **PASS for the planner; BENDS for “immediately”** | A* is a real binary-heap 8-connected search over the belief costmap with inflation (default hard radius 2.4 cells), soft costs, unknown-cell penalties and diagonal corner-cut prevention. Painting a wall changes the true grid at once, but the planner's costmap is built from the **belief** grid: the new wall affects routes only after lidar observes it and the next replan cycle runs (replan timer 0.38 s; brush sets it to 0.05 s). “Lidar immediately updates log-odds cells and A* reroutes live” is true on a sub-second, after-observation basis — not at the instant of painting and not for unobserved walls. |
| Pure Pursuit / differential-drive physics | **PASS** | Steering transforms the lookahead point into the estimated robot frame and uses curvature `2y/L²` with pivot behaviour for large heading errors. Motion integrates with midpoint heading, acceleration limits, and a circle-vs-cell collision resolver. Driving at full command into a wall for 5 s stopped the centre at **y = 3.55 cells** — exactly wall boundary (2) + radius (1.55). Driving diagonally into the corner stopped at **(3.55, 3.553)**. In six 60 s autonomous runs the maximum wall penetration was ~0 cells (≤7×10⁻¹⁵, numerical noise). Caveat: collision does not zero the velocity state; the robot keeps “pushing” at commanded speed while its position is clamped by the resolver. |
| Dynamic obstacles / live replan preset | **BENDS** | Moving obstacles are genuinely simulated, raycast and avoided, and the main robot's collision resolver treats them as solids; the obstacles themselves politely pause rather than crush the robot. But, as noted, their lidar hits enter the persistent static-style log-odds grid, so the map side is not a true dynamic-object model. |
| Fog-of-War / X-Ray / Split views | **PASS for the map; BENDS for the lidar fan** | The occupancy layer is the belief grid and X-Ray does overlay truth. However, the lidar visibility polygon and ray beams are drawn from the scan's **true** hit coordinates (`hx, hy`, computed from the un-noised DDA distance and the true pose), while only the small hit sparks use the noisy measured endpoints at the estimated pose. In Fog view the fan therefore shows exact wall geometry that the sensor model did not measure. |
| High-Noise & Drift preset | **PASS for its settings** | Selecting it set σ = **13.5 cm** and drift = **2.4×** and re-enabled ICP/ghost, as the UI then showed. In a 60 s run the estimated-pose error was **7.0 cm** — but that number is inseparable from the ground-truth pull described above. Raw odometry error in the same run was **5.18 m**. |
| Pose / Odom-SLAM error telemetry | **BENDS** | “Pose (x, y)” and heading display the **estimated** pose, not the true pose; the error readout itself is computed against ground truth (available to a simulator as a score, not to a real robot). In 60 s runs raw odometry error grew to **15–52 m** (the ghost is unbounded and leaves the world), while SLAM error stayed at **6–29 cm** — again, partly because of the truth pull. |

## Driven interactions — SLAM

All tested controls did something real; **no wholly dead control was found**.

- **Presets:** all six loaded with distinct starts and reachable-cell totals (Office 14,042; Warehouse 14,521; Maze 12,668; Dynamic 15,007; Noisy 14,739; Blank 15,571). Noisy correctly changed the noise/drift readouts to 13.5 cm / 2.4×.
- **Sliders:** speed, brush, ray count (→180), range (→9.0 m), noise (→12.5 cm), drift (→2.0×), log-odds gain (→+1.40) and A* inflation (→3.4 cells) all updated both label and internal state.
- **Drive modes / tools / views:** Auto-Explore, Click Goal and Manual all selected and changed planner status; Goal/Wall/Erase tools and Fog/X-Ray/Split views all selected.
- **Canvas goal click:** clicking grid (50,52) set the goal, switched to Goal mode and produced a 24-point path with status “Navigating Goal”.
- **Paint/erase:** a wall brush click at (100,52) changed the true grid cell 0 → 1; Erase changed it back 1 → 0. Clear Belief Map took the log-odds absolute sum from **1033.7 (1,561 nonzero cells) to exactly 0** and reset the estimated/odometry poses to the robot.
- **ICP toggle and snap buttons:** toggling ICP off stopped the matcher entirely in the controlled trial (0.583-cell error unchanged). “Trigger Loop Snap” on an empty belief map changed nothing measurable (no map to match, no loop counted) **but still displayed “ICP Loop-Closure snap executed!”** — a label contradiction. On a mapped start pose it counted a loop closure with zero travel (see above). “Reset Ghost Drift” exactly re-anchored the odometry ghost to the true pose.
- **Camera:** right-drag pan moved the camera (x 105.48 → 99.23, y 56.07 → 52.94 cells); scroll zoom changed zoom 6.396 → 7.291; Cam toggled Fit/Follow; drawer and Cinema toggled.
- **Split-view ambiguity:** in Split view, a pointer press within 16 px of the divider is captured as a divider drag even when the Wall tool is armed — in the broad UI drive, a paint click at screen x=684.9 (divider at 691.2) dragged the divider instead of painting. The focused test away from the divider painted correctly. This is a real interaction trap, though apparently intentional divider behaviour.
- **Keyboard:** Space toggled pause; B cycled the wall tool; X cycled the view; H toggled Cinema; R reset. Holding W for 0.5 s switched the robot to Manual and drove it from x=24 to **x=27.36** at y=52.
- **Wall/corner driving:** see the physics row above — the robot stops at exactly one radius from walls and corners and does not tunnel or penetrate.

## SLAM verdict

- **Ray casting:** PASS — exact against known grid geometry; noise model honest at default settings.
- **Odometry:** PASS as an error model — genuine dead reckoning from actual motion; the “×” drift dial is uncalibrated and the systematic heading bias is very large.
- **Occupancy mapping:** PASS — a real log-odds grid fused from noisy scans at the estimated pose, with minor endpoint/footprint/dynamic-object bends.
- **Scan matching:** BENDS — real correlative scan-to-map matching with a small capture basin (no correction at 45 cm displacement), mislabelled as ICP.
- **Pose truthfulness:** FALSE — a direct ground-truth attraction term (16% normal / 72% forced) is mixed into the “SLAM” estimate.
- **Loop closure:** FALSE — no loop detection or pose graph; the counter is a correction/time cadence counter and can be incremented at the start pose by the snap button.
- **Completion claim:** FALSE — “Map Complete / 100%” fired at 98.39% measured coverage.
- **Navigation and collision physics:** PASS — real A*, frontiers, Pure Pursuit and a collision resolver that kept the robot out of walls in all runs.
- **Controls:** no dead controls found; the snap button's success banner is dishonest when nothing snapped, and split-view divider capture can eat paint clicks near the divider.

---

# Overall verdicts

## FEA Topology Optimizer — **substantially genuine**

A real Q4 FEM + PCG solve and a real SIMP/OC optimizer, with deflection verified against Timoshenko beam theory (+3.0%) and large, volume-preserving compliance reductions on every preset. Do not present its von Mises/Safety Factor as design-grade: the stress interpolation is inconsistent with its own SIMP stiffness law for grey material (6.25× at rho=0.4, p=3), peaks are singularity/coarse-mesh dominated, and the Volume Used label does not share the target slider's denominator (Arch 42.5%, Wheel 59.5% at a 40% target).

## Lidar SLAM Robot — **real sensing/mapping/navigation; simulated “SLAM correction”**

Ray casting, noise, odometry, log-odds mapping, frontier exploration, A* and collision physics are real and measurable. The SLAM pose layer is not pure: correlative scan matching (not ICP) is blended with a direct pull toward ground truth, and “loop closure” is a scripted counter rather than detection — it can fire at the start pose and fires at a near-constant cadence in every environment. The “100% map complete” banner also fired at 98.39% coverage.
