# Audit — CS & AI Wave: Raytracer Pipeline Lab + Sorting & Trees Race

**Auditor:** Muse (independent audit, collection standard)
**Date:** 2026-11-24
**Files audited (as shipped, unmodified):**
- `~/workspace/user/files/raytracer-pipeline-lab.html` (3,909 lines)
- `~/workspace/user/files/sorting-trees-race.html` (4,512 lines)

**Method:** Both files' shipped scripts were extracted and run headlessly in Node (v24) under a DOM stub. Nothing was read-only reviewed: the raytracer's own `traceRay` / `intersectScene` / BVH / progressive renderer were executed and driven; the sorting page's own generators, `SortRunner`, race driver (`advanceRaceOp`), and `RedBlackTree` were executed and driven. Every quantitative result below was measured from the shipped code and checked against an independent implementation or published theory written separately in the harness. Exhibit files were not edited; no commits made.

---

# PART 1 — Raytracer Pipeline Lab

## Verdict in one line
A genuine per-pixel software ray tracer with correct core optics (intersection, reflection, Snell refraction, TIR all verified numerically), real stochastic soft shadows and real BVH acceleration — surrounded by a presentation layer that overstates several things: the "Fresnel" is Schlick's approximation, the Cornell "GI" is a painted analytic tint, the BVH speedup HUD is a proxy formula (not a measurement), the shadow "caustics" are an achromatic fudge — and the studio/sunset skies contain a real NaN defect that permanently poisons pixels.

## 1.1 Is it a real ray tracer? — PASS
- Rendering is a true per-pixel software ray tracer writing into an `ImageData` buffer: primary rays are constructed per pixel from a camera basis, jittered per sample, and `traceRay` recurses through reflection/refraction with a bounce budget. No raster/WebGL shortcut anywhere in the render path.
- The X-Ray / BVH inspector views are 2D canvas projections used only by the inspector panels — they do not feed the render. (Named so the lesson doesn't have to guess.)

## 1.2 Intersection math — PASS (exact)
- **Ray–sphere** vs an independent quadratic solver: **300/300 agreement**, worst |Δt| = 2.66×10⁻¹⁵. Head-on ray t = 4 exact, normal (0,0,1); a ray starting inside exits at t = 1.
- **Ray–box (AABB slab test)** vs an independent implementation: **300/300 agreement**, worst |Δt| = 8.88×10⁻¹⁶.
- **Floor plane**: in an empty scene, primIdx = −2, t = 3, normal (0,1,0) — exact.

## 1.3 Reflection / refraction / Fresnel — PASS with one BEND
- **Reflection**: a probe ray's reflected direction matches the independent reflection formula with cosine similarity 1.00000000.
- **Snell refraction**: at θI = 60.00° the page produces θT = 34.73°, identical to an independent Snell computation (34.73°); refracted direction cosine match 1.00000000.
- **Total internal reflection**: from-inside ray at θI = 71.81° > critical angle 41.14° (IOR 1.52) → TIR flag set. PASS.
- **BEND — "Fresnel" is Schlick, not exact Fresnel.** At 60° incidence the page returns R = 7.25%, which equals Schlick's approximation (7.25%) but not the exact Fresnel equations (9.25%) — Schlick under-reads by ≈22% relative at that angle. At normal incidence the page's 4.258% equals the exact ((n−1)/(n+1))² = 4.258%, so the bend only shows at grazing angles. A code comment calls it "Exact Schlick Fresnel" — Schlick is by definition an approximation; the word "Exact" is the bend.
- **Material IOR labels are correct**: Water 1.33, Crown Glass 1.52, Sapphire 1.77, Diamond 2.42. PASS.
- **Dispersion is real**: with dispersion ON vs OFF, an off-axis ray through a diamond-IOR (2.42) sphere against an emissive backdrop changes colour channels by up to 0.1555 (e.g. G 0.2238 → 0.3748). Limits, measured from behaviour: applied only on the primary entry ray (depth 0) and only for IOR ≥ 1.85. (A centre-ray test shows only 0.0003 delta — dispersion needs off-axis geometry, which is physically right.)

## 1.4 Shadows — PASS (soft shadows real) / BEND (transmittance claim)
- Shadow rays are genuinely traced per light. **Soft shadows are real**: light positions are stochastically jittered and accumulated over samples-per-pixel — penumbra emerges from the accumulation, not from a blur pass.
- **BEND — glass shadow transmittance is an achromatic fudge, not "colored caustics."** Measured: opaque blocker → transmittance 0; no blocker → 1; glass blocker head-on → 0.830, exactly the page's formula 0.18 + 0.65·|n·d|^2.2. The value is a single scalar — it carries no colour and no caustic focusing, despite code-comment language about coloured/partial shadows.

## 1.5 BVH — structure PASS, speedup HUD BENDS
- The 'bvh' preset contains **18 primitives = 16 spheres + 2 boxes**; page copy says "18-orb" — small copy bend (two of the eighteen are boxes).
- **BVH vs brute force: 0 hit mismatches over 1,000 camera rays** (and a second 4,000-ray run) — the accelerator returns identical geometry to the naive loop. PASS.
- Measured acceleration on rays that hit something: BVH averages **1.31 primitive tests vs brute force's 18.00 → a 13.79× reduction in primitive tests**, visiting ≈7.3 nodes per ray. (44% of all camera rays miss the root box entirely and cost 0 primitive tests.)
- **BEND — the HUD "BVH Speedup" is not a measurement.** It is a proxy formula, `totalPrims / (primTests + nodes×0.22)`, which evaluates to ≈24.1× averaged over all rays and ≈6.2× over hit rays only — framing-dependent and inflated relative to the honest 13.79× primitive-test reduction (which itself is not a wall-clock figure). A code comment separately claims "3–5× speedup" for the scene, a third inconsistent number. None of the three is a timed measurement.

## 1.6 Progressive rendering / SPP — cap PASS, one FALSE-grade defect
- The samples-per-pixel cap works: SPP stays at 64 (MAX_SPP) after extra render slices. PASS.
- **FALSE (robustness) — the renderer produces permanent NaN pixels, so "watch it converge" is not always true.** Driving the shipped renderer on the Classic scene (320×200 buffer) produced non-finite accumulation values; the final SPP-64 buffer contained 3 non-finite values (one pixel, all channels). Root cause isolated by replaying the render deterministically, capturing the exact ray, and tracing its bounce tree:
  - First poisoned pixel: SPP 19, pixel (148, 118), channel R. The pixel's ray rattles inside the glass sphere to depth 4, whose refracted exit direction comes out of the Snell formula slightly **unnormalised: |d| = 1.00008, with dy = 1.0000788 > 1**.
  - The studio sky computes `Math.pow(1 − Math.max(0, dy), 3.4)` → `Math.pow(−0.0000788, 3.4)` = **NaN** (non-integer exponent of a negative base). The sunset sky has the same pattern (`Math.pow(1 − h, 4.2)`). The obsidian/hallway skies use an integral exponent (5.0) and the Cornell sky is constant — both immune.
  - Once in the accumulation buffer, NaN never washes out (NaN + x = NaN): the pixel is permanently dead (renders black after tone mapping) and the SPP convergence statistic inherits the NaN (measured mean |est₁₆ − est₄| polluted at the 64-sample estimate).
  - Frequency in the test render was low (1 pixel in 64,000 at SPP 64) but the trigger is generic: any reflected/refracted/jittered ray with dy > 1 reaching a studio or sunset sky. The one-line-class fix (clamp the pow base at 0, or clamp dy to ≤ 1 in `sampleSky`) exists but is **not applied** — audit only, per instructions.
- "Throughput M rays/s" telemetry is self-reported from the renderer's own slice statistics and counts all ray types (primary + shadow + secondary). Not independently verified; treat as indicative, not measured.

## 1.7 Scene/preset copy — BENDS
- **Cornell Box "GI" — BEND (strong).** The red/green colour bleed is a hard-coded analytic tint inside `traceRay`, keyed to the cornell sky type with fixed constants depending only on hit x/normal-x, plus an analytic sphere-proximity ambient-occlusion term. No diffuse interreflection is ever traced. The effect looks like one-bounce GI; the mechanism is paint. The "Ambient Occlusion & GI" toggle gates both effects together.
- **"Diamond Prism" preset's hero object is a sphere**, not a prism. Copy bends.
- **Mirrors preset copy "Infinite 8-bounce tunnel" is hyperbole**: maxBounces = 8, and a probe ray chain terminated after 7 segments / 5 hits. BEND.
- Reflections toggle verified honest: with reflections off, metals fall back to sky shading (no fake reflection substituted). PASS.

## 1.8 Raytracer scoreboard
| Claim | Verdict | Evidence |
|---|---|---|
| Real per-pixel ray tracing | PASS | §1.1 |
| Ray–sphere / box / plane math | PASS | 300/300 + 300/300, Δ ≤ 2.7×10⁻¹⁵ |
| Reflection direction | PASS | cos = 1.00000000 |
| Snell refraction | PASS | 60.00° → 34.73° = independent |
| TIR | PASS | 71.81° > 41.14° critical |
| Fresnel | BENDS | Schlick 7.25% @60° vs exact 9.25% |
| IOR labels | PASS | 1.33 / 1.52 / 1.77 / 2.42 |
| Dispersion | PASS (depth-0, IOR ≥ 1.85 only) | Δ up to 0.1555 |
| Soft shadows | PASS | stochastic light jitter over SPP |
| Glass shadow "caustics" | BENDS | scalar 0.830 = page formula, achromatic |
| BVH correctness | PASS | 0 mismatches / 5,000 rays |
| BVH speedup HUD | BENDS | proxy formula ≈24×/6.2×; honest prim-test reduction 13.79× |
| "18-orb" BVH scene | BENDS | 16 spheres + 2 boxes |
| SPP cap 64 | PASS | holds after extra slices |
| Convergence always clean | FALSE | NaN pixel defect, §1.6 (studio/sunset sky pow of negative base) |
| Cornell "GI" | BENDS (strong) | hard-coded analytic tint, no traced interreflection |
| "Diamond Prism" | BENDS | hero object is a sphere |
| "Infinite" mirror tunnel | BENDS | 8-bounce cap; probe chain 7 segments |
| M rays/s telemetry | UNVERIFIED | self-reported, counts all ray types |

---

# PART 2 — Sorting & Trees Race

## Verdict in one line
The strongest-audited Antigravity piece in this wave: all seven sorts are correct and their counters match theory to the digit (insertion sort exact at both extremes, mergesort writes exact, radix genuinely comparison-free, quicksort genuinely immune to the sorted-input worst case), and the red-black tree survived a 3,000-operation fuzz under an independent validator. The bends are in the framing: the race's common "ops" currency mixes unlike units, the merge-family "Array Writes" counter undercounts by 2×, "Timsort" is a simplified teaching variant, and the Shellsort description omits the large Ciura gaps the code actually uses at n = 150.

## 2.1 Correctness — PASS (all seven, all distributions)
Each shipped generator was run to completion through the page's own `SortRunner` at n = 64 on all five offered distributions (random, nearly-sorted, reversed, organ-pipe, few-unique). In all 35 runs the output was (a) sorted, (b) a permutation of the input, and (c) confirmed by the page's own verification sweep (`verified = true`). No failures.

## 2.2 Counters vs theory — PASS, digit-exact where theory is exact
| Check | Measured | Theory | Verdict |
|---|---|---|---|
| Insertion, sorted n=64 | 63 cmp / 63 writes | n−1 = 63 / 63 | PASS exact |
| Insertion, reversed n=64 | 2,016 cmp / 2,079 writes | n(n−1)/2 = 2,016 / 2,016+63 = 2,079 | PASS exact |
| Mergesort, random n=64 | 299 cmp | worst-case bound n⌈lg n⌉ − 2^⌈lg n⌉ + 1 = 321 | PASS (under bound) |
| Mergesort, sorted n=64 | 192 cmp | best case (n/2)·lg n = 192 | PASS exact |
| Mergesort writes, all dists | 384 | n·lg n = 384 write events | PASS exact |
| Quicksort, sorted n=64 | 442 cmp | n² worst would be ≈2,016; n lg n ≈ 384 | PASS — see §2.3 |
| Quicksort, few-unique n=64 | 189 cmp | near-linear for 3-way partition | PASS |
| Radix, all dists | **0 comparisons** | 0 (non-comparison sort) | PASS exact |
| Radix ops, n=64 / n=56 | 384 / 336 | 2n × 3 digit passes | PASS exact |
| Heapsort, random n=150 | 1,713 cmp | ≤ 2n·log₂n ≈ 2,169 | PASS |
| Timsort, sorted n=64 | 63 cmp | n−1 for one natural run | PASS exact |
| Timsort, reversed n=64 | 63 cmp, 95 ops | n−1 cmp + reversal swaps | PASS |

## 2.3 Quicksort worst case — PASS (the trap is genuinely disarmed)
The shipped quicksort is median-of-three pivot with a 3-way (Dutch national flag) partition. On already-sorted input — the classic naive-pivot killer — it uses 442 comparisons at n = 64, nowhere near quadratic (≈2,016). On few-unique input (7 distinct values) it drops to 189 comparisons, confirming the 3-way partition does the duplicate handling the page describes. The page's complexity claims for its own implementation are honest.

## 2.4 The bends
- **BEND — merge-family "Array Writes" undercounts by exactly 2×.** Mergesort's counted writes are 384 (one yield per element written back per level), but each merge first copies the working range into an auxiliary buffer **without yielding**, so true element assignments are 768. Timsort's merge has the same structure. The counter is self-consistent as a count of *write events the animation shows*, but as an "Array Writes" statistic it halves the merge family's real write traffic — and it is compared in the UI against algorithms (insertion, quicksort) whose counters do capture every assignment.
- **BEND — "Timsort" is a simplified teaching variant.** What ships genuinely detects natural runs, extends short runs with insertion sort, and merges runs — and the adaptivity is measurable, not marketing: sorted input costs exactly 63 comparisons (one run), reversed costs 63 comparisons plus reversal swaps, nearly-sorted (165 cmp) beats random (448 cmp) by 2.7×. But real Timsort (Python/Java) uses minRun 32–64 (page: 8/16), a run stack with merge invariants, and galloping; the page merges pairwise bottom-up with none of those. The mechanism taught is real; the name promises the production algorithm.
- **BEND — Shellsort description omits gaps the code uses.** The code's Ciura sequence is [701, 301, 132, 57, 23, 10, 4, 1]; the UI description says "(57, 23, 10, 4, 1)". Measured from emitted events: at n = 64 the used sequence is exactly [57, 23, 10, 4, 1] (description accurate), but at n = 150 the code uses **[132, 57, 23, 10, 4, 1]** — the 132 gap the description never mentions.
- **BEND — the race's "ops" are not one currency.** The race steps each lane exactly one generator yield per tick, and this is implemented honestly: on identical input, every lane's race `finishOps` **exactly equals** its solo-run ops (verified for all four Classic Clash lanes on both random and reversed inputs — e.g. radix 336 = 336, insertion 1,665 = 1,665). But a yield is a different amount of work per algorithm: a comparison = 1 op; a swap = 1 op that performs 2 writes (quicksort ops 632 = 336 compares + 296 swaps, while its writes total 592); a radix bucket placement = 1 op; a mergesort auxiliary copy = 0 ops (see above). So the ops leaderboard ranks algorithms by *animation steps*, not by equal work — "Equal Ops/Tick" is literally true and still not an apples-to-apples speed measure. The page does not claim wall-clock timing as algorithm speed; the bend is confined to the shared ops counter.
- Minor: race `finishRank` is assigned when a sort's generator completes, before its verification sweep runs. Cosmetic; the sweep has never failed in testing.
- Radix note (not a bend): op/write counts are identical (384) on every distribution — correct behaviour for an LSD radix, and the page's distribution-independence framing is accurate.

## 2.5 Red-black tree — PASS (fuzz-verified two ways)
The engine is CLRS insert + delete with step snapshots and its own 5-invariant `verify()`. Every completed operation was checked with **both** the page's verify() **and an independent validator** written in the harness (BST bounds, red-red, equal black-height, root black, key-set equality against a JS Set model):
- **Ascending inserts 1..99**: valid after every insert under both validators. Final height **11** vs the displayed bound 2·log₂(n+1) = 13.3 — inside bound at every n. The page's naive-BST comparison is honest: its `computeNaiveBSTHeight()` returns **99** for the same ascending sequence.
- **Scrambled delete-all** (all 99 keys): valid after every delete under both validators; final count 0.
- **Random fuzz, 3,000 mixed insert/delete ops** (keys 1–99): valid after **every** operation under both validators; max height seen 8.
- **Animation honesty**: one verbose insert produced 12 snapshots, of which **2 intermediate snapshots are transiently invalid** (mid-fixup double-black/red-red states). The UI presents those steps as rebalancing-in-progress, and the final snapshot's banner — "All 5 RB-Properties Valid ✓" — was true at rest in every test. The claim holds where the page makes it (at rest); mid-animation frames are labelled as fixing, not valid.
- Duplicate insert and delete-of-missing-key are handled with accurate banners ("Key 31 already exists in tree", "Key 97 not found in tree") and no state corruption.

## 2.6 Sorting scoreboard
| Claim | Verdict | Evidence |
|---|---|---|
| All 7 sorts correct | PASS | 35/35 runs sorted + permutation + page-verified |
| Insertion O(n) best / O(n²) worst | PASS | 63 cmp sorted; 2,016 cmp reversed — both exact |
| Mergesort n log n | PASS | 299 ≤ 321 bound; 192 best exact; writes 384 exact |
| Quicksort worst case avoided | PASS | sorted input 442 cmp (median-of-three + 3-way) |
| Radix non-comparison | PASS | 0 comparisons; ops = 2n × passes exact |
| Heapsort bound | PASS | 1,713 ≤ ≈2,169 at n=150 |
| Timsort adaptivity | PASS | 63 cmp sorted & reversed; 165 vs 448 nearly vs random |
| "Timsort" = production algorithm | BENDS | simplified variant: no galloping, minRun 8/16, pairwise merges |
| Shellsort gap description | BENDS | omits 701/301/132; 132 measured in use at n=150 |
| "Array Writes" counter | BENDS | merge family undercounted 2× (aux copies unyielded) |
| Race "Equal Ops/Tick" | PASS as implemented / BENDS as currency | race ops = solo ops exactly; yields are unlike units |
| RB invariants maintained | PASS | ascending 99 + delete-all + 3,000-op fuzz, dual-validated |
| RB height bound 2·log₂(n+1) | PASS | h=11 ≤ 13.3 at n=99; naive BST h=99 as claimed |
| "All 5 RB-Properties Valid ✓" | PASS at rest | 2/12 mid-animation snapshots transiently invalid, labelled as fixing |

---

## Auditor's summary
- **Raytracer**: core optics and acceleration are genuinely right — this is a real ray tracer, not a fake. Three things a lesson must not repeat uncritically: Schlick-as-Fresnel, the painted Cornell GI, and the proxy BVH speedup. One real defect: the studio/sunset sky NaN (one-line-class fix, awaiting the collection owner's sanction like the other guest-file fixes).
- **Sorting & Trees**: the most numerically honest exhibit audited in this wave — counters match theory to the digit and the red-black tree is fuzz-clean. Its bends are framing-level (ops currency, merge write undercount, Timsort naming, Shellsort gap list), all nameable in one honest paragraph in the lesson.
