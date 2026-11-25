# Audit — Acoustics FFT Synth & Supersonic Mach Lab (Antigravity builds)

Audit date: 2026-11-24. Method: the shipped single-file pages were read in full; their pure
cores were extracted **verbatim** (function-for-function, no retyping) and driven headlessly
in Node — the page's own FFT, synthesis, oblique-shock solver, Prandtl–Meyer, area–Mach and
nozzle code produced every "measured" number below. Independent references: a naive O(N²)
DFT written for this audit, Bessel Jₙ series, the standard normal-shock / θ–β–M /
Prandtl–Meyer / isentropic area relations recomputed independently in Python, and published
table anchors (NACA 1135 values). No exhibit files were edited; nothing was committed.

Files audited (as uploaded):
- `~/workspace/user/files/acoustics-fft-synth.html` — "Harmonics — String/Pipe Acoustics, Synthesizers & Live FFT Spectrogram"
- `~/workspace/user/files/supersonic-mach-lab.html` — "Mach — Supersonic Shockwaves, Aerodynamics & Rocket Nozzles"

Intended home: Everyday Physics.

---

## 1. acoustics-fft-synth.html

**Overall: the DSP core is genuinely excellent — a real radix-2 FFT that matches an
independent DFT to floating-point noise. The physics series (string, pipe) are exact.
Bends live in the presentation layer: the "live FFT" analyses a twin model rather than the
audio you hear, one "pure harmonic" claim overstates, and harmonics fold (alias) at extreme
slider settings.**

### Claim-by-claim

| # | Claim (page) | Verdict | Measured |
|---|---|---|---|
| A1 | "Cooley–Tukey Radix-2 FFT", 1024-pt (512 optional) | **PASS** | Shipped `radix2FFT` vs independent naive DFT on single tone / two tones / harmonic stack: max abs difference 1.2–1.5 × 10⁻¹⁴ across all 512 bins. Bin-centred magnitudes exact: 0.8 → 0.800000, 0.4 → 0.400001, stack 1.0/0.5/⅓ → 1.000001/0.500005/0.333336. 512-pt mode: bin width 32 Hz, 0.7-amp tone reads 0.699995. |
| A2 | Window functions Hann / Hamming / Blackman / Rect | **PASS** | Formulas are the textbook ones (Hann 0.5(1−cos), Hamming 0.54−0.46cos, Blackman 0.42−0.5cos+0.08cos2, Rect = 1). Windows are coherent-gain normalised (Σw/N = 1.000000), so bin-centred amplitudes read true. Leakage behaviour per theory: off-bin 440 Hz tone, leakage 10 bins away — Rect 0.0316 vs Hann 0.0003 (peak 0.722). |
| A3 | Sample rate / Nyquist (code comment: SR 16384, Nyquist 8192 Hz) | **PASS with a bend (A12)** | The analyser's internal SR is 16384 Hz; bin widths 16 Hz (N=1024) / 32 Hz (N=512) confirmed. This SR is the *model's*, not the WebAudio context rate — the display synthesis is generated at 16384 Hz regardless of the device. |
| A4 | "FFT Peak: 262 Hz (C4)" readout; parabolic peak interpolation | **PASS** | Pure C4 sine (261.6256 Hz) through the shipped pipeline: peak reads **261.86 Hz**, note C4 (+0.24 Hz ≈ +1.6 cents). String default pluck: peak 261.85 Hz, C4. Note namer exact (A4 = 440.00, 0 cents; +50-cent tone rounds to A#4 −50¢, standard). |
| A5 | Peak magnitude readout | **BENDS** | No scalloping correction: a 0.85-amp tone at worst-case half-bin offset reads 0.784 (−0.7 dB; Hann worst case −1.42 dB). Standard analyser behaviour, but linear-scale magnitudes of off-bin tones under-read up to ~18%. |
| A6 | String: fₙ = n·v/2L; f₀ = 261.6 Hz at v=340.1, L=65 cm | **PASS** | getStringF0 = 261.615 Hz. FFT peaks sit at n·f₀. |
| A7 | Pluck spectrum aₙ ∝ sin(nπx₀/L)/n² (page's reference equations) | **PASS** | `pluckString(0.24)` mode amplitudes match the analytic triangular-pluck series to all printed digits (n=1…8: 0.76052, 0.27720, 0.09511, 0.00870, −0.02612, −0.03031, −0.01914, −0.00432). |
| A8 | "Pluck at exact center (0.50 L) to eliminate all even harmonics" | **PASS** | Centre pluck: even mode amplitudes ≈ 10⁻¹⁷ (exact zeros); FFT even bins at the added-noise floor (8.8 × 10⁻⁵ vs fundamental 0.539). |
| A9 | "Click the 1/3 node … for a pure 12th natural harmonic" | **BENDS** | Node finger 3 suppresses non-multiples of 3 to ×0.015 and boosts n=3 (×2.35) — but the spectrum is **not pure**: n=6 sits at 32% of n=3 (0.0712 vs 0.2235), n=9 at 7%, n=12 at 3%, and the suppressed fundamental still leaks at 5%. Dominated by the 12th, honestly; "pure" overstates it. (Also a deliberate design boost, disclosed in a code comment but not on the page.) |
| A10 | Pipe: open fₙ = nc/2L; closed fₙ = nc/4L, odd n only; "dropping f₀ by an octave and erasing all even harmonics" | **PASS** | c(20 °C) = 331.3 + 0.606·20 = **343.42 m/s** (standard linear law; true 343.2). Open f₀ = 261.75 Hz; closed f₀ = 130.88 Hz — exact octave. Closed weights: every even n exactly 0; FFT even bin 4.5 × 10⁻⁴ vs fundamental 0.336 (0.13%, the page's own added breath-noise floor). Closed-pipe overblow 2 correctly isolates n=3 (a closed pipe overblows at the twelfth) with a 0.16 whisper at n=9. |
| A11 | Pipe "Natural Rich" harmonic weights | **BENDS (minor)** | Frequencies exact; the *amplitudes* are invented rolloffs (open: n^−1.12 with a 0.92 dip at n=2; closed: k^−0.95 on odd k) — plausible organ/clarinet shapes, presented as "natural" without saying they are a chosen model, not a measured pipe spectrum. |
| A12 | Harmonics at extreme string settings | **BENDS (aliasing)** | At max tension + min length (v=620 m/s, L=30 cm → f₀=1033.3 Hz), modes 8–12 exceed the 8192 Hz Nyquist and **fold back as phantom inharmonic peaks**: mode 9 (9300 Hz) appears at 7084 Hz with magnitude 0.0046 — 34% of the genuine 7th harmonic's 0.0137 — at a frequency that is *not* a multiple of f₀ (ratio 6.86). Mode 8 folds to 8117 Hz (0.0029). Within piano range (f₀ ≤ 523 Hz) all 12 modes are clean; only slider extremes alias. |
| A13 | Synth presets: Triangle "Odd 1/n²", Sawtooth "All 1/n", Square "Odd 1/n" | **PASS** | Driven through the FFT at bin-centred 256 Hz: sawtooth magnitudes ratio exactly 1 : ½ : ⅓ : ¼ … (0.3127, 0.1564, 0.1042, 0.0782…); triangle odd ratios 1 : 1/9 : 1/25 : 1/49 (measured 1 : 0.111 : 0.040 : 0.020) with the correct alternating signs (phases π at n=3, 7) and even bin at 3 × 10⁻⁵; square odd 1/n by construction of the drawbar table. Only 8 partials exist (drawbar bank) — a truncated series, fine for the label. Clarinet preset carries small even partials (0.05, 0.06, 0.04, 0.03) under an "Odd reed" label — realistic for a real clarinet, worth a footnote, not a failure. |
| A14 | FM synthesis (Bell preset β=2.65, ratio 2.76, "inharmonic") | **PASS** | Genuine phase modulation, y = sin(2πf₁t + β·sin 2πf_m t); audio engine uses the correct deviation Δf = β·f_m. Sideband ratios to carrier vs Bessel \|Jₙ(2.65)\|: measured [1, 3.54, 3.81, 2.12] vs theory [1, 3.80, 3.87, 2.04] (≤7% off, from negative-frequency folding + Hann leakage). Clean no-fold configuration (f₁=440, f_m=220, β=1): J₁/J₀ measured 0.62/0.65 vs 0.575, J₂/J₀ 0.177 vs 0.150, J₃/J₀ 0.029 vs 0.026 — right distribution, leakage-level deviations. |
| A15 | Beats: "Beat Freq \|f₂−f₁\|", Δf slider 0–15 Hz | **PASS** | Frame-RMS envelope driven over simTime: 0.557 → null 0.119 near t = 1/(2Δf) → 0.559 at t = 0.285 s; period = 0.286 s = 1/3.5 Hz exactly. (One FFT frame is 62.5 ms — shorter than the beat period — so beats are seen on the scope/across frames, not inside one spectrum; that's inherent to the tool, not a defect.) |
| A16 | Spectral centroid readout | **PASS** | Default pluck (x₀=0.24) live centroid measured 450.8 Hz; independent centroid of the pluck series ≈ 454 Hz. (The static HTML placeholder "612 Hz" is replaced on the first frame — cosmetic only.) |
| A17 | "Live FFT" / "Live Web Audio Synthesizer" framing | **BENDS** | There is **no AnalyserNode anywhere**. The spectrum/scope/waterfall analyse a second, deterministic synthesis built from the same parameters — not the sound actually produced. For Synth and Pipe modes the twin and the audio bank share parameters, so the displayed spectrum matches what you hear in content. For String mode they diverge in detail: you *hear* a Karplus–Strong pluck (comb-shaped by pluck position, code is a genuine KS loop) while you *see* the exact modal Fourier series. Honest label would be "model FFT". |
| A18 | Spectrum display range | **BENDS (minor)** | Analysis runs to 8192 Hz but the spectrum and waterfall axes stop at **4400 Hz**; harmonics above 4.4 kHz are computed but never drawn (at C4 all 12 modes fit; at C5 only 8 of 12 are visible). Undisclosed truncation. |
| A19 | Audio/display partial count | **BENDS (minor)** | Display synthesis uses 12 modes (string/pipe); the audible pipe/synth banks have only 8 oscillators (partials 9–12 silent in audio, present on screen). Small at their weights, but the twin-model gap again. |

### Interactions driven (headless, shipped code)
FFT vs DFT (3 signals × 2 sizes), all four windows, string plucks at 0.24 / 0.50 / node-3,
pipe open/closed/overblow through the FFT, sawtooth + triangle presets through the FFT,
FM at two (β, ratio) settings vs Bessel, beats envelope over 0.6 s of simTime, aliasing at
slider extremes, note naming. Every control in the panel traces to a working handler that
feeds the synthesis (FFT size, window, scales, palettes, freeze, peak-hold, drawbars,
sliders, piano keys A–K, node buttons) — **no dead controls found**. The WebAudio path
itself (Karplus–Strong string, FM voice) cannot be heard headlessly; its parameters were
verified by reading the engine against the verified display model (deviation = β·f_m ✓,
pipe osc cap 7200 Hz, synth cap 7400 Hz).

---

## 2. supersonic-mach-lab.html

**Overall: the gas-dynamics core is textbook-exact — normal shocks, θ–β–M, Prandtl–Meyer,
area–Mach and the whole nozzle solver reproduce published tables and an independent
recomputation to every printed digit. The bends are in the coefficient layer wrapped
around that core (a silent +0.012 in the drag, regime-boundary jumps, heuristic
subsonic/transonic curves), one wrong readout (freestream speed under CO₂/He), and a
probe that fades the shock jump with distance.**

### Claim-by-claim

| # | Claim (page) | Verdict | Measured |
|---|---|---|---|
| M1 | Normal-shock relations (used for bow shock, HUD P₂/P₁, capsule) | **PASS** | vs NACA 1135, γ=1.4 — M=1.5: p 2.4583, ρ 1.8621, T 1.3202, M₂ 0.7011, p₀₂/p₀₁ 0.9298. M=2: 4.5000 / 2.6667 / 1.6875 / 0.5774 / 0.7209. M=2.2: 5.4800 / 2.9512 / 1.8569 / 0.5471 / 0.6281. M=3: 10.3333 / 3.8571 / 2.6790 / 0.4752 / 0.3283. M=3.8: 16.680 / 4.4568 / 3.7426 / 0.4407 / 0.1645. All exact. |
| M2 | "Exact θ–β–M attached oblique shocks" (preset copy) | **PASS** | Weak-branch solver vs published tables — M=2.0, θ=10°: β=**39.31°**, p₂/p₁=1.7066, M₂=1.6405 (table 39.3° / 1.706 / 1.641). M=3.0, θ=20°: β=**37.76°**, p=3.7713, M₂=1.9941 (table 37.8° / 3.77 / 1.994). M=4.0, θ=15°: β=27.06°, p=3.6973. θ_max: M=1.5 → 12.11°, M=2 → 22.97°, M=3 → 34.07°, M=4 → 38.77° — all match published θ_max. Drawn shock rays are rendered at exactly the solved β. |
| M3 | Mach angle μ = asin(1/M); drawn Mach cone | **PASS** | μ: M=1.5 → 41.81°, M=2.2 → 27.04°, M=4 → 14.48° — exact. The cone is drawn from the nose at exactly ±μ (cos/sin construction) with a labelled arc; the bow-shock hyperbola asymptotes to the same μ. HUD default μ=27.0° ✓. |
| M4 | Prandtl–Meyer expansion fans at the shoulder | **PASS** | ν(M): 1.5 → 11.905°, 2.0 → 26.380°, 2.2 → 31.732°, 2.4 → 36.747°, 3.0 → 49.757°, 4.0 → 65.785° — published values to the last digit (26.38 / 31.73 / 49.76 / 65.79). Inverse solver returns M=2.0000 and 3.0001 for ν=26.38°/49.76°. Fan rays are drawn between μ(M₂) and μ(M₃) about the surface angles — the correct construction. Shoulder turn is 2θ (front + rear facet angles) for wedge/airfoil, θ for rocket — geometrically right for those profiles. |
| M5 | Stagnation T₀ = 567 K and freestream 749 m/s at M=2.2 (HUD) | **PASS** | T₀ = 288.15 × (1+0.2·2.2²) = **567.1 K**; a = √(1.4·287.05·288.15) = 340.3 m/s; V = **748.6 m/s**. Both exact for sea-level standard air. (Tunnel temperature is fixed sea-level — the page makes no altitude claim for the tunnel, so none is violated.) |
| M6 | Default wedge telemetry: β, P₂/P₁, C_D | **PASS (solver) / placeholder drift** | Solver at the default (M=2.2, θ=11°, α=0): β=**36.81°**, P₂/P₁=**1.8605**, C_D=**0.0905**. The static HTML first-paint placeholders say 36.5° / 1.89× / 0.088 — replaced by the live values on the first frame, but the placeholders themselves disagree with the page's own solver by 1–3% (hand-rounded from an earlier tuning, evidently). |
| M7 | Diamond wave drag C_D (shock–expansion) | **BENDS** | Independent shock–expansion for the 11° diamond at M=2.2: front cp = +0.2540, rear cp = −0.1497 → C_D = **0.0785** (linear theory 0.0771). The page returns **0.0905** — exactly +0.012 higher, a hard-coded constant added inside the axial-force sum (`+ 0.012`, presumably a skin-friction allowance) that is disclosed nowhere. +15% at the default condition; relatively larger at low-drag settings. The underlying integration is otherwise exact (M₂=1.7843, M₃=2.6384, p₃=0.4929 all match the independent solve digit-for-digit). |
| M8 | Supersonic lift, "Supersonic Diamond Airfoil Lift" preset (M=2.4, α=9.5°) | **BENDS** | Page: C_L=**0.3119**, C_D=0.0823, L/D=3.79 — close to Ackeret C_L = 4α/√(M²−1) = 0.3043 (+2.5%), plausible shock–expansion. **But** the airfoil body silently flies at effHalfAngle = 0.72 × the slider angle (7.5° → 5.4°); the wedge body uses 1.00× and the rocket 0.92×. The factor is nowhere on the page, so the geometry the coefficients describe is not the geometry the slider names. (The drawn airfoil is a biconvex lens, max half-thickness 0.44·tanθ — a third, different thickness again.) |
| M9 | Capsule (blunt body) coefficients; Billig standoff | **BENDS** | Standoff uses Billig's real correlation Δ/R = 0.143·exp(3.24/M²) → at M=3.8, Δ = 0.0465 chord (noseR 0.26) — plausible (Apollo-class Δ/D ≈ 0.05). But the aero module's nose radius (0.22 + (θ−6)·0.005 = 0.26) differs from the drawn body's rMax (0.276), and C_D = 0.82·cp_max = **1.272** at M=3.8 is a Newtonian-flavoured invention (right neighbourhood; Apollo ≈ 1.3). **C_L sign:** at α=+10° the capsule returns C_L = **−0.086** — negative lift for nose-up pitch, opposite to the page's own convention everywhere else (airfoil at +α gives +C_L; the −0.36·cp_max·sin2α·0.45 trim term's sign is at best an undocumented Apollo-style trim convention, at worst flipped). L/D displays negative. |
| M10 | Subsonic & transonic C_L / C_D curves | **BENDS** | Heuristic regime formulas (Prandtl–Glauert below M=0.8, a Gaussian "wave-drag spike" bell between 0.8–1.2), plausible in shape and magnitude (transonic preset C_D=0.162, subsonic C_L slope ≈ 5.4/rad before PG). Not computed from the flow, and the page never says so. **Regime-boundary discontinuity:** at α=5°, C_L = 0.786 just below M=0.80 (PG branch) but 0.562 at M=0.80 (transonic branch) — a visible −28% step when sweeping Mach through 0.80; C_D steps too. |
| M11 | Detachment behaviour | **BENDS (minor)** | Solver detaches at θ > 0.995·θ_max: at M=2, θ = 0.997·θ_max (22.90°) is reported **detached** although the attached weak solution exists. A 0.5%-of-θ_max false-detachment band (≈0.1–0.2°). Detached sharp-body coefficients and standoff (0.03 + 0.22·excess + …) are heuristics; magnitudes plausible (M=1.5, θ=24°: C_D=0.879). |
| M12 | Gas medium buttons γ: Air 1.40 / CO₂ 1.29 / He 1.66 | **PASS for shocks, FALSE for velocity** | γ values are the real ones, and shock physics follows γ correctly (M=2.2, θ=11°: β = 36.23° at γ=1.29, 36.81° at 1.40, 38.26° at 1.66; T₀ follows (γ−1) exactly). **But** freestream speed always uses R_air = 287.05: at M=2.2 the page shows 719 m/s (CO₂) and 815 m/s (He) where the true speeds of sound give 583 m/s (a_CO₂ = 265.0 m/s) and **2193 m/s** (a_He = 996.8 m/s). The "Freestream Flow" m/s readout is wrong for both non-air gases — by 2.7× for helium. |
| M13 | Nozzle: choked throat, area–Mach exit conditions | **PASS** | A/A*: 0.5 → 1.3398, 2.0 → 1.6875, 2.2 → 2.0050, 3.0 → 4.2346 (published values exact); solver inverts both branches (A/A*=1.6875 → M=2.0000 super / 0.3722 sub, published 0.3722). Exit Mach: Aₑ/A*=7.5, γ=1.24 → **Mₑ=3.1743**; γ=1.40 → 3.6072; Aₑ/A*=13.5, γ=1.24 → 3.6266 — all confirmed by independent root-solve. The 1-D profile through the drawn contour is isentropic area–Mach at every station (throat sample M=1.000 forced at s=0.54; just past the throat M=1.508 at local A/A*=1.20 ✓). |
| M14 | Nozzle: thrust, Isp, ṁ, Pₑ at defaults (P_c=3.20 MPa, Aₑ/A*=7.5, γ=1.24, Pₐ=101.3 kPa) | **PASS** | Independent recomputation reproduces the page **to every digit**: Pₑ=53.29 kPa, Tₑ=1516 K, vₑ=2666 m/s, ṁ=84.30 kg/s (standard choked-flow formula, A*=0.045 m²), F=208.5 kN, Isp=252.2 s. Pₑ/Pₐ=0.526 → "Overexpanded · Diamonds" regime label is correct, as is the sea-level Mach-diamonds preset copy. Vacuum preset (Aₑ/A*=13.5, P_c=4.5 MPa): Isp=305.1 s, F=354.7 kN — plausible upper-stage numbers. "Match Pₑ = Pₐ" button sets Pₐ := Pₑ exactly (verified in handler). |
| M15 | Chamber temperature / propellant buttons | **BENDS (minor)** | T_c is hard-coded 3350 K for every propellant; only γ (and a γ-keyed R: 296.8 / 375 / 580) changes. 3350 K is credible for RP-1/LOX-class, low for LH₂ (~3600 K), and meaningless for the N₂ button if read as cold gas (page Isp for N₂ = 205.9 s vs ~75 s for a real cold-gas N₂ thruster). The buttons are labelled "Propellant Gas (γ)", which softens it — but the fixed T_c is disclosed nowhere. |
| M16 | Altitude from ambient pressure ("Nozzle & Atmosphere … km") | **PASS (approx)** | alt = −7.2·ln(Pₐ/101.325): Pₐ=25 kPa → **10.08 km** vs ISA ≈ 10.36 km (−3%). A scale-height approximation, close everywhere in the slider range; Pₐ→0 caps at "Vacuum (>85 km)". |
| M17 | Flow probe (hover) + field visualisation | **BENDS** | The probe/field sampler *starts* from the solver's true region values (near-body behind the default shock it reads P/P₁=1.841, M=1.793, T=346 K vs exact 1.861 / 1.784 / 347 K — within ~1%), but then blends toward freestream with perpendicular distance (`0.28 + 0.72·exp(−…)`): a point genuinely behind the shock far from the body (2.5, 1.9) reads **P/P₁=1.335, M=2.069** where the true post-shock state is 1.861 / 1.784 (−28% on the jump). The schlieren/pressure/Mach/temperature fields inherit the same fade, and the trailing "recompression shock" is drawn at μ(M₃)+0.14 rad — a Mach-line proxy, not the θ–β–M angle for the wake turn. Fields are art guided by real region values; probe numbers far from the body are not the flow. |
| M18 | Sonic-boom / regime banners, Mach sweep, presets | **PASS (behaviour)** | All six presets set exactly the state their banners name (verified against PRESETS table); Mach sweep animates M within the 0.2–4.0 slider range; boom flash triggers on crossing M=1; regime labels switch at 0.80 / 1.20 / 3.50 as coded. Slider max M=4.0 while the regime pill says "Hypersonic" from 3.5 — conventional enough (M≥5 purists would differ; the page's own banding is at least self-consistent in the tunnel, though the capsule preset at M=3.8 is bannered "Re-Entry … Plasma" — plasma glow at M=3.8 in sea-level-temperature air is artistic licence, T₀ there is only 1120 K). |

### Interactions driven (headless, shipped code)
Normal shocks M=1.5–3.8; oblique solves at five (M, θ) anchors + θ_max sweep + detachment
margin probe; Prandtl–Meyer ν and inverse; area–Mach both branches; full
`computeTunnelAero` drives for the default wedge, the airfoil-lift preset, the capsule
preset (α=0 and α=10°), the transonic preset, subsonic points, a γ sweep, an
α-beyond-half-angle case (upper-surface expansion branch fires correctly), and a detached
wedge; full `computeNozzlePhysics` drives for the default, vacuum, 25 kPa and N₂
configurations plus the internal profile array; the flow-probe sampler at seven field
points. Every control traces to a working handler (sliders, body/gas/propellant buttons,
sweep, ascent demo, Match Pₑ=Pₐ, display modes, overlay checkboxes) — **no dead controls
found**. The drawn geometry (cone at μ, shocks at β, fan between μ(M₂)/μ(M₃), bow-shock
hyperbola asymptoting to μ) was verified by reading the render code against the solver
outputs, since canvas pixels can't be measured headlessly.

---

## Bottom lines for the lesson writer

**Acoustics** — lead with the genuine article: a real Cooley–Tukey FFT that matches an
independent DFT to 10⁻¹⁴, exact pluck/pipe series, true FM sidebands. The three honest
caveats: (1) the analyser watches a parameter-matched *model* of the sound, not the audio
signal itself (no AnalyserNode; string audio is Karplus–Strong while the display is the
modal series); (2) "pure 12th" from the 1/3 node is really "12th-dominant" (n=6 at ~⅓);
(3) above ~680 Hz fundamental the top string modes alias into phantom inharmonic peaks,
and the display silently stops at 4.4 kHz.

**Mach** — lead with the exact core: normal shocks, θ–β–M, Prandtl–Meyer, area–Mach and
the nozzle solver are table-perfect (the nozzle's thrust/Isp reproduce an independent
solve digit-for-digit). The honest caveats: (1) C_D carries a silent +0.012 (default
diamond: 0.091 shown vs 0.079 pure shock–expansion); (2) the airfoil secretly flies at
0.72× the named half-angle; (3) subsonic/transonic coefficients are heuristic curves with
a −28% C_L step at M=0.80; (4) the m/s readout is wrong under CO₂/He (air's R is kept —
helium is off 2.7×); (5) the hover probe and fields fade the true shock jump with
distance (up to −28%); (6) capsule C_L goes negative at positive AoA under the page's own
sign convention.
