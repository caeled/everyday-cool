# Audit — CS Wave: Cipher (ECC/DH/RSA/SHA-256) & Entropy (Huffman/LZW/JPEG DCT)

Files audited (as shipped, byte-for-byte, in `~/workspace/user/files/`):
- `cryptography-ecc-lab.html` ("Cipher")
- `compression-huffman-dct.html` ("Entropy")

Method: the pure-logic sections were extracted verbatim from each shipped file and
executed headlessly in Node (with only a DOM stub for RSA's `<select>` population and
canvas/ImageData stubs for the DCT pipeline). Every result was cross-checked against
independent implementations: Python modular arithmetic / `hashlib`, a heapq Huffman,
a strict LZW decoder-width simulation, and a NumPy direct double-sum orthonormal
DCT-II. Interactions were driven through the same code paths the buttons/sliders
call (field/prime/preset switches, full add tables, scalar trails, key exchanges,
all RSA prime pairs, all presets, custom text, quality sweeps). Canvas rendering
itself was not executed (no live browser available to this audit); all numbers
below come from the shipped math, which is what the canvas displays.

Totals: **54/54** independent checks pass for Cipher, **74/74** for Entropy.
No FALSE numeric claims were found in either file. The bends are in labels and
demo theatre, itemised below.

---

## 1. cryptography-ecc-lab.html — "Cipher"

### Lab 1 · ECC over ℝ — PASS
- `eccRealAdd` chord/tangent formulas verified against independent analytic
  computation: for the default curve y²=x³−2x+2, P=(−1.15→snapped on-curve),
  Q=(0.45,…): R = P+Q = (0.8294578622961171, −0.9548568327764647), identical to
  the independent result to all printed digits; on-curve residual −1.1×10⁻¹⁶.
- Doubling 2P = (2.648226…, −3.908430…) matches; residual −1.8×10⁻¹⁵.
- P + (−P) correctly returns the point at infinity 𝒪.

### Lab 1 · ECC over 𝔽_p — PASS (arithmetic is exactly right)
- Point enumeration matches independent brute force for **all 16 combinations**
  of p ∈ {23, 37, 67, 97} × presets {classic (−2,2), secp-form (0,7),
  island (−3,1), gentle (−1,3)}. E.g. classic@67: 57 affine points, #E = 58;
  secp-form@67: 78 affine, #E = 79; island@97: 110 affine, #E = 111.
  All satisfy the Hasse bound. The on-page `#E = points + 1` tag is correct.
- **Full add table** on classic@67: all 57×57 = 3,249 pairs computed with the
  shipped `eccFpAdd`; closure on the curve holds for every result
  (0 off-curve), exactly 57 pairs sum to 𝒪 (one inverse per point, as theory
  requires), and a hash of the whole table matches the independent Python
  group law exactly.
- Doubling the unique y=0 point (27, 0) correctly yields 𝒪.
- Scalar trail: shipped `eccRebuildTrail` values 1G…32G for the default
  generator G = (2, 41) all match independent repeated addition
  (2G=(56,57), 3G=(1,66), 7G=(39,22), 32G=(28,18)). G has order 58 = #E,
  i.e. the default G really is a generator of the full group.

### ECDH — substrate PASS; no ECDH protocol in the page
- The page contains **no ECDH exchange and no signature scheme** (the "DH" lab
  is classical mod-p Diffie–Hellman). What exists is k·G presented as
  private/public key. Driving the shipped `eccFpAdd` as both parties —
  α·(β·G) vs β·(α·G) on classic@67 — agrees for all tested pairs and matches
  independent Python: (α,β)=(3,5)→(32,55); (7,11)→(40,65); (13,29)→(27,0);
  (31,17)→(65,20). The group law the page teaches would support ECDH; the
  page just never performs one.

### Lab 2 · Classical Diffie–Hellman — PASS
- `dhCompute` (BigInt modpow) matches Python `pow` for every preset at the
  default secrets a=6, b=15: p=23,g=5 → A=8, B=19, S=2; p=47 → A=21, B=41,
  S=32; p=97 → A=8, B=46, S=85; p=257,g=3 → A=215, B=83, S=159; p=7919,g=7 →
  A=6783, B=7623, S=860. SA = SB in all cases.
- Slider extremes on the big group (a=120, b=119, the UI cap) still agree:
  S=3654.

### Lab 3 · RSA — PASS (exhaustive)
- Default key is the classic textbook example and is exact: p=61, q=53,
  n=3233, φ=3120, e=17, **d=2753**, e·d ≡ 1 (mod φ). All 12 packets of
  "HELLO CIPHER" encrypt/decrypt correctly.
- Exhaustive sweep with the shipped code: **every** ordered prime pair from
  the page's list (20×19), **every** e the page offers for that pair, and
  every ASCII m in 32…126 — **461,320 cases, 0 failures** (for m < n).
- Failure mode is real but honestly flagged: choose the smallest pair
  (n=323) and type '€' (m=8364 ≥ n) and decryption returns 289 ≠ m — the
  status pill drops "Verified 100%" and shows "n Too Small". Raw per-character
  textbook RSA, no padding — and the page never claims otherwise.

### Lab 4 · SHA-256 + PoW — PASS (bit-exact)
- The hand-rolled FIPS 180-4 implementation matches `hashlib.sha256` exactly
  on: empty string (e3b0c442…), "abc" (ba7816bf…), both default messages, a
  1000-byte multi-block input, and UTF-8 input ("héllo ✓").
- Avalanche readout for the default pair ("…2026" vs "…2027", a genuine
  1-bit input difference): **129/256 bits differ = 50.39%** — matches
  independent Hamming distance; the "~50%" claim is accurate.
- `shaFlipOneBit` really does flip exactly one bit (XOR with a single-bit
  mask, constrained to printable ASCII) — verified by construction.
- PoW miner: searching sha256("Crypto Lab 2026:" + nonce) for prefix "00"
  with the shipped function finds nonce **821**, identical to the independent
  search. The miner hashes the displayed string format and stops on the
  displayed nonce.

### BENDS — Cipher
1. **"Double-and-Add: O(log k) curve hops" is not what the code does.**
   `eccRebuildTrail` computes k·G by repeated addition (G+G+G+…), the hop
   animation steps through every integer multiple one at a time, and the
   binary-decomposition box ("k = 7 = (111)₂ = 4G + 2G + G") describes a
   method that is never executed. Every resulting point is numerically
   correct; the algorithm label is false.
2. **"secp256k1 Form" preset is only the equation shape.** It sets a=0, b=7 —
   over ℝ, or mod p ∈ {23…97} in 𝔽_p mode. The actual secp256k1 (Bitcoin's
   curve) lives over p = 2²⁵⁶ − 2³² − 977 with a fixed generator and order;
   none of that is present. The word "Form" and the sub-label "a = 0, b = 7"
   hedge it, but a learner could easily believe they are using the real curve.
3. **Eve's brute-force ticker is rigged.** The DH render loop explicitly
   skips the true secret (`if (dh.eveTryIdx === dh.a) dh.eveTryIdx++`), so
   the "Brute DLP: g^x ≢ A" readout can never show a hit. Combined with the
   slider cap (secrets ≤ 120 even for p=7919), the discrete log in this demo
   is trivially searchable; "Stuck on DLP!" is theatre at these sizes. The
   protocol math itself is exact.
4. ECC over ℝ is presented beside 𝔽_p with the same "private key k / public
   key k·G" language; over ℝ there is no ECDLP hardness at all. The formula
   bar does say "Domain: ℝ²", and 𝔽_p mode carries the ECDLP label — a
   soft bend, worth a learner's caution.

---

## 2. compression-huffman-dct.html — "Entropy"

### Huffman — PASS (optimal, bound-checked)
For all four presets and six custom inputs (including Unicode, a two-symbol
text, a pangram, and the empty string), driving the shipped `buildHuffman`:
- Entropy H matches independent computation to <10⁻⁹ everywhere
  (prose 4.1369, DNA 1.4010, skewed 1.4151, noise 6.2095 b/sym).
- Average code length L equals the independent heapq-Huffman optimum to
  <10⁻⁹ in every case (prose L=4.1748, DNA 1.4872, ABRACADABRA 2.0909).
- Shannon bound H ≤ L < H+1 holds for every input with ≥2 symbols;
  Kraft sum = 1.000000 (complete prefix code) in all those cases.
- Decode(encode(text)) === text in all cases — the footer's "Lossless:
  VERIFIED" is computed from a real round-trip and is true.
- Preset label check: English Prose is billed "(~4.1 b/sym)"; measured
  H = 4.137. PASS.

### LZW — PASS (including the bit accounting)
- Round-trip decode(encode(x)) === x for all presets, a Unicode string, the
  classic TOBEORNOTTOBEORTOBEORNOT, a single character, and the empty string.
  The repetitive presets exercise the decoder's KwKwK branch (code == next
  dictionary index); it is handled correctly.
- The "LZW Var-Width" bit total was suspected of width-schedule drift; a
  strict decoder-synchronised width simulation in Python reproduces the
  page's totals **exactly** (delta 0) on prose (1062 bits), DNA (261),
  skewed (180), and TOBEORNOT (144). The Huffman-vs-LZW winner badge
  therefore compares honest numbers on both sides.

### 8×8 DCT — PASS (textbook-exact)
- Shipped `dct2d` vs an independent NumPy direct double-sum orthonormal
  DCT-II: max difference ≤ 2.3×10⁻¹³ across constant, impulse, ramp, and
  random blocks. DC of a constant-100 block = 800.0 exactly (8·mean, as the
  orthonormal form requires). IDCT∘DCT round-trip max error 2.6×10⁻¹³;
  Parseval holds to 1.6×10⁻¹⁶ relative.
- The pipeline applies the JPEG level shift (−128) before the DCT — present
  in the shipped code.
- Q50 luminance and chrominance tables are byte-identical to the JPEG
  Annex K standard tables; the zig-zag order is the canonical sequence;
  `scaledQuantTable` reproduces the IJG quality scaling at q = 1, 25, 50,
  75, 90, 100 (q=100 → all 1s, the correct limiting behaviour).

### JPEG pipeline metrics — PASS (PSNR is real)
- Driving the shipped `generateDctPreset` + `recomputeDctPipeline`:
  portrait@Q45 gives MSE 59.53, PSNR 30.38 dB — recomputing PSNR from the
  dumped original/reconstructed pixels independently gives 30.38 dB.
  Full sweep behaves as theory requires: portrait 25.68 dB @Q10 → 37.21 dB
  @Q90; checkerboard (high-frequency) is worst (23.07 dB @Q45), sunset
  (smooth) best (32.77 dB @Q45); zero-coefficient share rises as quality
  falls (portrait 84.6% @Q90 → 97.3% @Q10). Raw size readouts are exact
  (12.00 KB colour, 4.00 KB luma for 64×64).

### BENDS — Entropy
1. **"Est. JPEG Size" is a heuristic estimator, not an encoder.** It uses
   invented constants (640-bit header allowance, ~4 bits per non-zero
   coefficient plus a run-length fudge, chroma at 5.2 bits per non-zero).
   Cross-check: a real PIL/libjpeg encode of the same 64×64 portrait at
   quality 45 is 0.99 KB vs the page's 0.73 KB estimate (1.36×). Right
   order of magnitude and correctly labelled "Est.", but ~25–35% low on
   this sample and not comparable bit-for-bit with any real JPEG file.
2. **"Random Noise — Max entropy incompressible" is loose wording.** The
   preset's entropy is 6.21 b/sym — essentially maximal *for its 74-symbol
   alphabet* — yet the page's own Space Saved shows +21.6%, because the
   baseline is 8-bit ASCII and the alphabet is small. The numbers on the
   page are all honest; the word "incompressible" contradicts the meter
   next to it.
3. **Single-symbol edge case sits exactly on the Shannon bound.** For
   "AAAAAAAAAAAA" the page assigns code "0", so H=0 but L=1 = H+1,
   violating the strict L < H+1 form of the bound (the standard degenerate
   exception for a one-symbol alphabet). Round-trip still verifies.
4. **"Keep Top K Zig-Zag" is a teaching addition, not JPEG.** Real JPEG
   has no top-K truncation; the control is labelled as its own slider and
   not claimed to be standard, but it silently compounds with quantization
   in the PSNR/size figures.
5. **Force-ON cell override fabricates a coefficient.** Toggling a dead
   cell ON injects dequantised value 48.0 when the true coefficient is
   negligible (|raw| < 2) instead of restoring the true value. Disclosed
   only as an override count in the block info; the reconstructed image
   then contains a wave that was never in the source.

---

## Interaction coverage
Driven through shipped code paths: ECC field switch, all 4 primes × 4 curve
presets, full 57×57 addition table, doubling/inverse buttons' underlying ops,
scalar slider range 1–32 and hop trail, DH all presets + random-secret ranges
+ slider extremes, RSA all prime pairs / all offered e values / sample and
custom messages (incl. an m ≥ n failure case), SHA live inputs, 1-bit flip,
PoW search at difficulty 2; Huffman all presets + live custom text (incl.
empty, single-symbol, Unicode), encode/decode round-trips, LZW tab numbers;
DCT all three procedural presets × Q ∈ {10, 45, 90}, luma-only mode, top-K
and quantisation paths. Not driven: canvas pixel rendering and pointer
hit-testing (no live browser in this audit environment) — those layers only
display the values verified above.
