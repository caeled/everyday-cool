# Audit — CS & AI Wave: Transformer Attention Lab + Neural Backprop Lab

Audited 2026-11-24 by Muse (integration audit, pre-shelving). Method, per collection standard:
the shipped code was **run and driven**, not just read. Both pages were loaded headlessly
(jsdom, canvas stubbed — drawing calls absorbed, all logic/DOM real) and every control was
exercised; both pure cores were extracted **verbatim** from the shipped files and run in Node;
the attention matrices were then recomputed **independently in NumPy** from the shipped Q/K/V,
and the backprop gradients were verified by **central finite differences**. Exhibits were not
edited; nothing was committed.

---

## 1. transformer-attention-lab.html

### The arithmetic is exact — PASS
Independent NumPy recomputation of softmax(QKᵀ/√d_k)V from the shipped Q, K, V, for all
6 presets × causal mask on/off × 4 heads:

- raw Q·K dots: max diff **0.0**; scaled scores: **0.0**; softmax weights: **≤ 2.2×10⁻¹⁶**;
  context vectors (weights·V): **≤ 8.9×10⁻¹⁶**.
- Every attention row sums to 1 (max error 4.4×10⁻¹⁶).
- Causal mask: upper-triangular weights are **exactly 0** in every row of every preset;
  turning the mask on renormalizes correctly (focus pair it→animal 40.4% → 21.6%).
- Attention entropy HUD is honest: the "it" row entropy reads 2.56 bits; recomputed 2.5555 bits.
- Sharpness slider does exactly what its label says, in the right direction, to the digit:
  on H1, 2.40× → it→animal **69.8%**, row entropy **1.05 bits**; 0.35× → **17.7%**, **3.36 bits**
  (both match the extracted core exactly).

### Headline linguistic claims — PASS (as computed)
Driven through the page's own preset buttons:

- Winograd "tired": H1 sends "it" → "animal" at **40.4%** (its top key).
- Winograd "wide": the same head flips "it" → "street" at **39.3%**. The flip is real in the shipped state.
- Polysemy preset: "bank" → "river" 40.5% (river-bank reading, driven live).
- Quantum Coref preset: "her" → "Alice" 48.3%. Code preset: "a" → first "a" 66.0%.

### Sampling studio math — PASS, with a structural bend
- Temperature softmax, top-k, entropy: recomputed independently at six (T, k, p) settings —
  base probabilities match to **≤ 1.1×10⁻¹⁶**, sample probabilities sum to 1, entropies match
  to all printed digits (T=0.85 default: H = 1.7307 bits, nucleus 4).
- The page's own note "Low T → 0.1 sharpens onto greedy argmax" is literally true in the code:
  at T=0.1 the top candidate takes probability **1.0** and the nucleus collapses to 1 token.
  At T=2.5 the top probability flattens to 0.283 and the nucleus grows 4 → 5.
- Driven end-to-end: Sample appends a drawn token after its roulette animation; Auto-Gen
  appends exactly 4; candidate-bar click force-appends; the 18-token cap refuses with a banner.
- **BEND — top-p is computed after top-k, on the renormalized survivors.** Standard nucleus
  sampling takes p-mass from the full distribution; here cumulation runs over the top-k
  renormalized probabilities, so with the default k=6 the "0.88 nucleus" is 88% of six
  candidates, never of all ten. Internally consistent, nonstandard order.
- **BEND — the sampler's logits do not come from the attention model.** Next-token logits are
  a hand-written table of 14 regex continuation rules plus fallbacks. The attention state and
  the "Autoregressive Decoding" studio are two separate machines sharing a page; nothing in
  the transformer computation feeds the sampler.

### FALSE — the "Concat" blended head, and the W-matrix framing
- The fifth head is tagged **"Concat"** in the UI. It is not a concatenation. Verified exactly
  (diff 0.0): blended weights are the **elementwise mean** of the four heads' weight matrices,
  and the blended context is the **mean of the four context vectors**. There is no concat and
  no output projection W_O anywhere in the file.
- Worse, the blend is internally inconsistent: the blended head's displayed *scaled scores*
  (mean raw dots / √8 × sharpness) do **not** softmax to its displayed weights — max
  discrepancy **0.0775** across presets. In "All Heads" mode the Live Scaled Dot-Product
  Trace shows numbers whose softmax is not the α the page displays beside them.
- The heads are tagged **W_1…W_4** and the notes say each token "projects into" Q, K, V.
  For Q and K that is not what the code does: they are **hand-written rule tables keyed on
  the token's identity** — e.g. H1's query for "it" is a constant vector selected by whether
  the sentence contains "tired" or "wide"; pronoun keys are suppressed by hard-coded factors
  (×0.15, ×−0.35); code tokens get literal constants (2.1 / −0.4). Only V is a genuine linear
  map of the embedding, and it is diagonal. There are no learned weights. The downstream
  attention arithmetic is exact, but the W_1…W_4 framing claims a mechanism the file does
  not contain.

### BENDS — multi-head shape and positional encoding
- Each of the four heads runs at full width d_k = 8. In a real 4-head model with d_model = 8,
  each head would have d_k = 2 and the four d_k=2 outputs would be concatenated. The page's
  d_k = 8 label is self-consistent, but the architecture it draws is four parallel full-width
  attentions averaged — not multi-head attention as the term is used.
- Positional encoding is genuinely multi-frequency sin/cos and does inject order, but the
  formula is **not** the Vaswani et al. formula the exhibit's framing invokes: it uses base
  **100** instead of 10000 and multiplies every angle by an extra **1.35**. Measured PE(1) =
  [0.976, 0.219, 0.414, 0.910, 0.135, 0.991, 0.043, 0.999] vs the standard
  [0.841, 0.540, 0.0998, 0.995, 0.0100, 1.000, 0.001, 1.000]. The PE is also attenuated ×0.12
  and added to only 6 of the 8 embedding dims; dims 7–8 carry separate cos/sin(pos·0.55)
  position features. Embeddings themselves are a hand lexicon for known words plus a
  deterministic hash (FNV + sin) for unknown words.
- Static first-paint placeholders in the HTML disagree with the page's own solver:
  "Q:'it' → K:'animal' (68%)" (solver: 40.4%), "Attn Entropy 1.62 bits" (solver: 2.56),
  sampling "H = 1.94b" (solver: 1.73b). All are replaced the moment the script runs, but a
  no-JS render states three wrong numbers. (Same placeholder disease as the Mach lab.)

### Interactions driven
Head buttons 1–5, mask buttons + M key, sharpness/temperature/top-k/top-p sliders, Sample,
Auto-Gen (4), Reset, candidate-bar force-append, custom-text Apply (tokenizer correctly
re-tokenized a 9-token test sentence), all six presets, keyboard head select (key "3"),
six visual-subsystem toggles, play/pause — **all functional, no dead controls, no errors**.
Tokenizer caps sequences at 18 tokens, matching the sampler's cap banner.

### Not claimed
The page makes **no parameter-count and no complexity (O(n²)) claims** — grep-verified;
nothing to check there.

**Verdict: attention and sampling arithmetic PASS to machine precision; the Winograd/
polysemy demonstrations genuinely occur in the shipped state. FALSE: the "Concat" label
and the implied learned W_1…W_4 projections (hand rule tables; blend is a mean, and its
displayed scores don't softmax to its displayed weights). BENDS: top-p-after-top-k order,
rule-table sampler logits, full-width heads, nonstandard PE formula, wrong static
placeholders.**

---

## 2. neural-backprop-lab.html

### Gradients are exact — PASS
Central finite differences (ε=10⁻⁶) against the shipped analytic gradients, per-sample BCE
loss, six architectures × the page's own activations — [2,4,4,1] tanh, [2,6,1] relu,
[4,5,3,1] swish, [6,8,8,6,1] tanh, [2,1] sigmoid, [3,1] tanh; 295 parameters checked:

- Max absolute FD-vs-analytic error **≤ 1.5×10⁻¹⁰** on every architecture; max relative
  error on gradients > 10⁻⁴ is ≤ 2×10⁻⁷. The output delta is the exact BCE+sigmoid
  dL/dz = p − t; hidden deltas use the true activation derivatives (the Swish derivative,
  written a + s(1−a), is algebraically identical to the true s + a(1−s) — checked).
- Adam is textbook Adam with bias correction (β₁=0.9, β₂=0.999, ε=10⁻⁸), implemented as written.

### Training claims — PASS, driven end-to-end twice (core and in-page)
Core runs at the page's own preset settings, 300 epochs, page's own dataset generator:

| Preset | Loss start → 300 ep | Train acc | Test acc |
|---|---|---|---|
| Twin Spirals | 0.728 → **0.0053** | 100% | 100% |
| Classic XOR | 0.702 → **0.0053** | 100% | 100% |
| Concentric Rings (Swish) | 0.700 → **0.0040** | 100% | 100% |
| Two Moons (ReLU) | 0.711 → **0.0303** | 99.4% | 96.4% |

In-page drive (spirals preset, live): epoch counter climbed to 620 at 2 ep/frame, train
loss 0.606 → **0.009**, accuracy 98.3%; XOR preset in-page reached **100% / loss 0.011**.
Pause freezes the epoch counter exactly; resume continues; the slow-mo Backprop Wave runs
without error and suspends training while active, as coded.

- **XOR honesty check:** the same XOR data with **0 hidden layers** plateaus at loss 0.680
  (≈ ln 2) and 62% accuracy — above 50% only because the generator labels by pre-noise
  quadrant and clamps outliers; it decisively does not solve XOR, while the hidden-layer
  net reaches 100%. The "single perceptron = linear, can't do XOR" lesson the page teaches
  is true in its own code.
- **Learning-rate behaviour:** SGD sweep on XOR — lr 0.001 → 79.3%, 0.03 → 94%, 0.3 → 100%,
  3.0 → 98% and still finite. Note the stability at lr=3 is *engineered*: gradients are
  clamped to ±5 in the update step and non-finite weights are reset to 0. True, but the
  page does not mention the clamp.
- **Overfitting demo delivers its claim:** page's overfit config, 300 epochs — λ=0: |W|=10.27,
  train loss 0.000, **test loss 1.521**, test acc 70%; λ=0.025: |W|=4.65, train loss 0.072,
  **test loss 0.508**, test acc 80%. The train/test gap and L2's smoothing effect are real
  in the shipped code.
- **Parameter counts are exact:** HUD matches Σ(W+B) for every preset — spirals 127,
  XOR 37, rings 51, moons 51, overfit 189, perceptron 3 — and after live architecture
  edits ([4,8,1] → 49, [4,1] → 5).
- **Held-out split is as labelled:** generator marks max(4, ⌊25%⌋) as test (240 → 60 verified).
- **Architecture bounds are as labelled:** hidden layers cap at 3, neurons per layer cap
  at 8, minimum 0 layers (clicked through all caps); feature chips change input width and
  parameter count accordingly; LR slider is logarithmic (10^-3 … 10^-0.5 → 0.001 … 0.316).

### BENDS
- The Backpropagation Inspector's ∂L/∂w readout is `lastGradW` — the gradient **after**
  the L2 term (λ·W) is added and after the ±5 clamp. At default λ=0.0005 the distortion is
  tiny, but the number shown is not the pure ∂L/∂w its label states, and at the L2=0.025
  quick-setting the reg contribution is material.
- The activation badge (Tanh/ReLU/Sigmoid/Swish) describes the **hidden** layers only;
  the output unit is always a sigmoid rescaled to (−1, +1), whatever is selected. Standard
  practice for BCE, nowhere disclosed on the page.
- Empty-data state (Custom dataset, no points painted / after Clear): HUD shows loss
  0.000 and accuracy 0.0% rather than a blank/undefined state; Step Epoch on empty data is
  a silent no-op. Cosmetic only — nothing crashes.

### Interactions driven
Step Epoch (+1 per click, loss moves), Play/Pause, all six preset buttons (each applies
its stated architecture/activation/optimizer and the HUD parameter count matches),
layer ± and per-layer neuron steppers (caps enforced), feature chips, LR / L2 / noise
(max σ 0.50) / sample-count (max 360) sliders, L2 quick buttons (0 / 0.025), all six
dataset generators, Regenerate, Clear, Re-Initialize, Reset, Backprop Wave, activation
×4 and optimizer ×2 switches (each rebuilds and trains). **No dead controls, no page
errors.** Canvas paint input was dispatched without error but could not be meaningfully
exercised under jsdom's zero-layout — the one interaction not fully driven.

**Verdict: PASS-grade exhibit. Gradients exact to finite-difference precision, every
preset converges as claimed, the XOR and overfitting lessons are true in the shipped
code, counts and bounds honest. Bends are labelling-grade only: inspector gradient is
post-L2/post-clamp, the output unit is always sigmoid regardless of the activation
badge, and the gradient clamp that keeps extreme learning rates stable goes unmentioned.**

---

## Method notes
- Attention recomputation: NumPy, from Q/K/V dumped out of the shipped
  `computeTransformerState` run verbatim in Node — so the check separates "is the
  softmax(QKᵀ/√d)V math right" (yes, exactly) from "are Q/K what the page says they
  are" (no — rule tables).
- Backprop FD check used the page's own exported core hook (`__PERCEPTRON_CORE__`),
  which the file itself provides for non-DOM verification.
- Both pages were also driven in jsdom with a stub 2D canvas context; one early
  harness artifact (a frozen epoch counter) was traced to the stub's missing
  `createImageData`, fixed in the harness, and the drive re-run clean — the page was
  not at fault.
