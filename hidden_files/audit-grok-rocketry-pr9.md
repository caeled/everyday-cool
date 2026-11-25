# Audit — Grok PR #9: Rocketry & Thrust (branch `feature/rocketry-thrust`, head `409c03a`)

Auditor: Muse, 2026-11-24. Read-only audit: branch checked out in a separate worktree, main untouched, nothing merged, nothing edited. Method: the shipped core extracted and run in Node; the full page driven under a DOM stub (init + all 51 event handlers, normal and reduced-motion modes); independent hand calculations for every headline number; the live site fetched and its script parse-checked.

**Recommendation: CLEAN MERGE.** No false claims found. Every bend is disclosed on the page's or lesson's own face.

---

## Grok's four claims

### 1. Counts recomputed — TRUE, verified by counting the branch pages
- Dad's Arcade: **170 cards**, header "170 games.<br>170 lessons attached." (main baseline 169/169; diff is exactly the header + one Rocketry card with page and lesson links).
- Full Index: **383 entries**, pill "383 Items" (main 381; the only added titles are "Rocketry & Thrust — the Physics of Rockets" and "…— the lesson").
- Physics Game Table: **71** `file:` entries (main 70), the new one being Rocketry with an explicit `lesson:` field, cat `orbital`.
- Bonus: sitemap 424 → **426** `<loc>`, exactly the two rocketry URLs.

### 2. "All tests pass" — TRUE on both harnesses
- Grok's `projects/everyday-physics/test.cjs` passes on the branch, including its new Rocketry block (page present, self-contained, titled, 16/16 core proofs, g₀, Isp, Tsiolkovsky, staging, clamped clock).
- The repo's own gate, run against the branch tree, verbatim:
  `Collection verified: 37 entries, 763 imported files, all project ZIPs, hub links, 2548 room-page links, licenses, and provenance.`
  (Main baseline: 761 files / 2517 links — the deltas are exactly the rocketry pair and its links.)
- Rocketry lives **inside the existing everyday-physics project**, so no new catalog entry or LICENSE files arise; the project's COLLECTION.md, README.md and provenance map are updated, and the everyday-physics ZIP contains both new files.

### 3. Zoom and reduced-motion rules — TRUE
- Both rocketry pages: `<meta name="viewport" content="width=device-width, initial-scale=1">` — no `maximum-scale`, no `user-scalable=no`.
- Reduced motion: CSS `@media (prefers-reduced-motion: reduce)` block on both pages, plus a JS `matchMedia` path on the exhibit that is *better* than PR #8's rAF shim (which froze canvas sims after two frames): here, reduced motion makes each bench compute and draw its final result at once — the launch runs to completion, the brick sequence resolves instantly, the orbit draws its full path. Verified by driving the page with `matches=true`: zero errors.

### 4. The Game Table fix — TRUE ON BOTH SIDES; the live Table really is blank
- **Live page proven broken:** the live `physics-game-table.html` carries one inline script (38,596 chars, byte-identical to main's) containing both the games array and the renderer. It fails `node --check`: `SyntaxError: Unexpected identifier 's'` at `title: 'Maxwell's Demon',`. A parse error in that script means **no cards render at all** on the live site.
- **Fix is minimal and correct:** straight apostrophe → typographic (`Maxwell’s Demon`), exactly three missing commas restored (Corrected by Halves, Yahtzee, Boggle — visible in the diff as three `}` → `},`), plus the Rocketry card itself. The branch script parses clean.
- **His regression check works:** the new `node:vm` parse check in test.cjs **fails with an AssertionError against main's old table file** and passes on the branch. His explanation for why the old harness missed it (it counted `file:` entries by regex, never parsing) is accurate.

---

## The rocketry physics — measured independently

Page structure: nine benches, one marked `ROCKET-CORE`, Help ▾ with full documentation, banner/topbar in house format, fully offline (the only external URL in the exhibit is an anchor to nar.org; the lesson's 13 external links are references, no loaded resources). The page's own `runProofs()` returns **16/16 PASS** in Node and renders "16 / 16 passed" in the driven page.

- **Rocket equation:** `rocketEq(311, 100, 30)` = 3671.96 m/s, identical to the hand calculation 311·g₀·ln(100/30).
- **Bricks → rocket equation:** momentum conserved to 1.42e-14 kg·m/s over ten throws; 2,000 tiny throws give 4.0542 m/s vs u·ln(150/100) = 4.0547 (0.012%).
- **Flight core vs Tsiolkovsky:** with gravity and drag switched off, burnout speed 2748.87 m/s vs analytic 2748.87 — exact to the printed digits.
- **Staging:** the equal-ratio formula reproduces the textbook result; 500 t / 10 t payload / ε 0.08 / Isp 330 s → 1 stage 7.50, 2 stages 10.10, 3 stages 10.77, 4 stages 11.05 km/s (the lesson's "four give 11.05" verified — the proof table only prints three). An explicit two-stage stack sums exactly (10.9852 = 4.0840 + 6.9012 km/s).
- **Atmosphere:** a genuine layered USSA-1976 implementation with geopotential conversion: p(0) = 101325 Pa exact, ρ(0) = 1.2250 kg/m³, p(11 km) = 22700 Pa, p(20 km geometric) = 5529 Pa (correct for the geopotential height it converts to).
- **Nozzle:** area-ratio ↔ Mach round trip error 4.4e-16; matched nozzle thrust equals ṁ·vₑ exactly; F_vac − F_sl = p₀·Aₑ to within 1e-6 N. Ideal-model Isp vs published: RS-25 model 449 s vs 452.3 (−0.7%); Merlin-like 294 s vs 282 (+4.3%); Merlin-Vacuum bell (ε 165) 356 s vs 348 (+2.3%) — all inside the page's stated 5% and disclosed as "ideal runs a little high." The ε-165 bell at sea level correctly triggers the flow-separation warning.
- **Liftoff bookkeeping:** TWR 0.9 sits on the pad and lifts at t = 31.35 s vs predicted 31.33 (within one 1/60 s step); burnout identity 4020.6 = 5709.2 − 1655.2 (gravity) − 33.3 (drag) holds to printed precision. A TWR-0.5 vehicle burns down on the pad and lifts when light enough — correct physics, no stall or freeze.
- **Δv budget:** totals LEO 9.4, Moon surface 15.37, Mars orbit 15.50, Mars surface 19.60 km/s — all within accepted published ranges; legs sourced to Wikipedia's Δv budget with route/year caveats printed, and the Mars-surface leg carries its "flown all on rockets" caveat.
- **Engines table:** all ten rows match published figures (F-1 263/304, SRB 242/268, Merlin 1D 282/311, MVac 348, RS-25 366/452.3, RL10B-2 465.5, PPS-1350 1660, NSTAR 1700–3300 as a labelled range, Raptor 330/375 labelled as 2017 design targets). The liftoff bench's engine presets use the same numbers.
- **Orbit:** v_c at 400 km = 7.673 km/s; integrated lap 92.43 min vs analytic 92.41; escape 10.851 km/s. Edge drives: v = 0 falls back and registers the hit (t = 302 s); v = escape leaves with no period and no freeze.
- **Model rockets:** class ranges exact (C = 5–10 N·s, doubling per letter, fractional classes decode, garbage codes rejected in words). C6 in a 40 g rocket: apogee 314.6 m, burnout 103.4 m/s, coast 5.6 s against the C6-5's 5 s delay — plausible and self-consistent. NAR launch-site table matches the Safety Code's published table.
- **Lesson arithmetic spot-checks:** Merlin v_e 282 × g₀ = 2765 m/s ✓; RS-25 452.3 × g₀ = 4436 ✓; mass ratio for 9.4 km/s at Isp 350 s ≈ 15.5 → 93.5% propellant ✓; at 282 s ≈ 30 ✓. Stories check out (NYT editorial 13 Jan 1920, correction 17 Jul 1969; Pettit's 2012 "Tyranny" essay and its soda-can figures).

### Bends — all disclosed on the page or in the lesson; none hidden
1. **Ideal nozzle runs high** (+4.3% on the Merlin-like preset): frozen, 1-D, isentropic flow with one γ per propellant. Disclosed in the Help docs, on the bench, and in the lesson's honest note with the percentages.
2. **C6 Isp 83 s vs ≈82 s** implied by the page's own rounded motor data (8.8 N·s, 11 g propellant): the lesson's honest note states this verbatim. Trivial.
3. **Model-rocket descent after apogee** is drawn with a gravity-only fall estimate (the core stops at apogee; drag ignored on the way down). The bench is labelled an average-thrust model; the fall segment is not separately labelled an estimate on the chart. Smallest nit in the PR; not a merge blocker.
4. **The loss-bookkeeping proof is near-true by construction** (both sides accumulate from the same RK4 stages). It still verifies the integrator's internal consistency, and the independent Tsiolkovsky proof (exact to printed digits) covers the physics.
5. **stagedDv with payload > liftoff mass returns a negative Δv** rather than an error — unreachable from the UI, which clamps payload to ≤ 50% of liftoff mass.

### False claims
**None found.** Every claim measured — Grok's four, the page's sixteen proofs, the lesson's numbers — reproduced.

---

## Blast radius — 28 files, all accounted for
Rocketry page + lesson; everyday-physics index (Exhibits card after Resonance + an onward link beside Stage It), physics-game-table (fix + card), test.cjs (71 count, vm parse regression, rocketry block), COLLECTION.md, README.md, provenance; cross-links, each a single rocketry pointer with a COLLECTION.md note: satellite-watch index (+1 line), tonights-sky index (+1 sentence), Java Young Robot Builders back door **142** (sequential, heading "One hundred forty-two"), Nerd Heaven shelf +1 lesson line (spelled count 143, service worker v35 → v36); arcade.html, full-index.html, sitemap.xml; five rebuilt ZIPs matching those content changes. **No privacy, location, or family content touched; no unrelated edits.** catalog.json untouched — correct, since rocketry is an exhibit inside an existing project.

## One discrepancy in Grok's message (immaterial)
"PR #9 is up to date with main" — the branch merged main at `88d0d1d` (Deep Dives). Current main is one commit further, `6da665d` (Steven's hub intro). The PR touches none of that commit's files, and `git merge-tree` confirms **PR #9 merges cleanly into current main**.

## Recommendation
**Merge clean, as-is.** The Game Table fix alone repairs a live page that currently renders nothing; the rocketry room is the most carefully self-disclosed guest build audited so far. The only nit worth Steven's optional attention is bend 3 (the unlabelled gravity-only descent segment on the model-rocket chart) — a wording label, not a physics error, and no reason to hold the merge.
