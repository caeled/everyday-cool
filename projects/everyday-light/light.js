"use strict";
/* Everyday Light — the pure rules: mixing light and mixing pigment,
   the colour wheel and its chords, the thin lens, Rayleigh
   scattering, the sun's path and a stick's shadow, and the spectrum.
   No DOM — app.js wires this to the page, and test.cjs checks it
   in Node. */

/* ---------------- Mixing light (additive) ---------------- */

/* Coloured light adds. Three lamps — red, green, blue — each pour
   their channel into the shared pool, and the pool is simply the
   sum, channel by channel, capped at full. All three at full is
   white; red + green with no blue is yellow, which surprises every
   painter the first time: it is the signature of adding light
   instead of stirring pigment. Inputs and outputs are 0–255. */
function clamp255(x) { return Math.max(0, Math.min(255, Math.round(x))); }
function mixLight(r, g, b) { return { r: clamp255(r), g: clamp255(g), b: clamp255(b) }; }
function rgbString(c) { return "rgb(" + c.r + ", " + c.g + ", " + c.b + ")"; }

/* ---------------- Mixing pigment (subtractive) ---------------- */

/* Pigment subtracts. Each paint is a filter: it lets some of the
   spectrum bounce off and swallows the rest, so mixing paints
   multiplies what survives — every added pigment can only take
   light away, never add it. The bench models each of the three
   printer's pigments by the share of red, green, and blue light it
   reflects when laid down at full strength:
     cyan    swallows red    (reflects green and blue)
     magenta swallows green  (reflects red and blue)
     yellow  swallows blue   (reflects red and green)
   A partial amount leans the surface partway from white paper
   toward the pigment's full reflectance, and the three leanings
   multiply. Real pigments leak — none of them swallows its colour
   completely — so full cyan + magenta + yellow lands at a deep,
   warm near-black (about rgb(10, 8, 8) in this model), not a true
   one. That leak is exactly why printers carry a fourth, black
   cartridge: the K in CMYK. Amounts are 0–100 (percent). */
const PIGMENTS = {
  cyan: { r: 0.05, g: 0.75, b: 0.85 },
  magenta: { r: 0.85, g: 0.05, b: 0.75 },
  yellow: { r: 0.90, g: 0.85, b: 0.05 },
};
function mixPigment(c, m, y) {
  const amt = { cyan: c / 100, magenta: m / 100, yellow: y / 100 };
  const out = {};
  for (const ch of ["r", "g", "b"]) {
    let refl = 1;
    for (const p of ["cyan", "magenta", "yellow"]) {
      refl *= (1 - amt[p]) + amt[p] * PIGMENTS[p][ch];
    }
    out[ch] = clamp255(refl * 255);
  }
  return out;
}

/* ---------------- The colour wheel and its chords ---------------- */

/* Twelve hues, thirty degrees apart, in spectrum order — the same
   twelve-points-on-a-circle move the circle of fifths makes in
   Everyday Sound, turned from pitch to colour. A "chord" is a set
   of hues chosen by their geometry on the wheel, named the way
   music names its chords because the idea is the same: notes (or
   hues) picked by the distances between them. */
const HUES = [
  { name: "Red", hue: 0 }, { name: "Orange", hue: 30 }, { name: "Yellow", hue: 60 },
  { name: "Chartreuse", hue: 90 }, { name: "Green", hue: 120 }, { name: "Spring green", hue: 150 },
  { name: "Cyan", hue: 180 }, { name: "Azure", hue: 210 }, { name: "Blue", hue: 240 },
  { name: "Violet", hue: 270 }, { name: "Magenta", hue: 300 }, { name: "Rose", hue: 330 },
];
const CHORDS = {
  complementary: { label: "Complementary", steps: [0, 6], blurb: "Two hues straight across the wheel from each other — 180° apart. The loudest contrast there is: each makes the other look brighter, which is why life jackets are orange against a blue sea." },
  analogous: { label: "Analogous", steps: [-1, 0, 1], blurb: "Three neighbours in a row, 30° apart. No contrast to speak of — a chord of agreement, the colours of one thing: autumn leaves, shallow water, a sunset's own gradient." },
  triadic: { label: "Triadic", steps: [0, 4, 8], blurb: "Three hues a third of the wheel apart — 120° steps, an equilateral triangle. Bold but balanced: the primary colours themselves (red, yellow, blue) are a triad." },
  split: { label: "Split-complementary", steps: [0, 5, 7], blurb: "One hue plus the two that flank its opposite — 150° and 210° around the ring. Nearly the complementary's punch, with an extra voice to soften it." },
};
function chordIndices(type, root) {
  return CHORDS[type].steps.map((s) => (((root + s) % 12) + 12) % 12);
}
function hueAngle(i) { return i * 30; }
function hueColor(i, lightness) { return "hsl(" + HUES[i].hue + ", 72%, " + (lightness == null ? 55 : lightness) + "%)"; }

/* ---------------- The thin lens ---------------- */

/* A convex lens, idealised to no thickness: light through it obeys
     1/f = 1/do + 1/di        (distances in the same units)
   with the magnification m = −di/do. The minus sign is the news:
   a real image from a single convex lens is upside down. When the
   object sits inside the focal length (do < f) the formula hands
   back a negative di — the image is virtual, upright, and on the
   object's own side: that is the magnifying glass. */
function thinLens(f, dObj) {
  const denom = dObj - f;
  if (Math.abs(denom) < 1e-12) return { di: Infinity, m: -Infinity, real: false, atInfinity: true };
  const di = (f * dObj) / denom;
  return { di, m: -di / dObj, real: di > 0, atInfinity: false };
}

/* ---------------- Rayleigh scattering: the sky ---------------- */

/* Air molecules scatter short wavelengths far more than long ones:
   the scattered share grows as 1/λ⁴. Blue light at 450 nm is
   scattered (650/450)⁴ ≈ 4.35 times as strongly as red at 650 nm.
   Overhead, that scattered blue is the sky. Toward sunset the
   sunlight's path through the air stretches dozens of times
   longer, the blue is scattered out of the beam on the way, and
   what arrives is the red that was left behind. One rule, both
   colours. */
function rayleighRatio(l1, l2) { return Math.pow(l2 / l1, 4); }
function scatterStrength(lambdaNm) { return Math.pow(550 / lambdaNm, 4); } // relative to green 550

/* The air mass — how many "atmospheres thick" the sunlight's slant
   path is — is roughly 1/sin(altitude), capped near the horizon. */
function airMass(altDeg) {
  const s = Math.sin(Math.max(altDeg, 0.5) * Math.PI / 180);
  return Math.min(1 / s, 40);
}

/* The direct sun's colour after a given air path, modelled on three
   sample wavelengths (red 650, green 550, blue 450 nm) with one
   extinction coefficient: intensity = exp(−0.10 × path × scatter).
   At path 1 the sun stays near-white; by path 30 the blue is spent
   and the disc is deep red. */
function sunColor(path) {
  const sample = { r: 650, g: 550, b: 450 };
  const out = {};
  for (const ch of ["r", "g", "b"]) {
    out[ch] = clamp255(255 * Math.exp(-0.10 * path * scatterStrength(sample[ch])));
  }
  return out;
}

/* The sky's colour, same model from the other side: the light the
   beam lost to scattering, which is why it runs blue — strongest
   blue overhead, paler toward the horizon where the long path
   scatters every colour and washes the blue toward white. */
function skyColor(path) {
  const sample = { r: 650, g: 550, b: 450 };
  const wash = 1 / (1 + path * 0.35);
  const out = {};
  for (const ch of ["r", "g", "b"]) {
    const scattered = scatterStrength(sample[ch]) / scatterStrength(450);
    out[ch] = clamp255(255 * (scattered * wash + (1 - wash) * 0.85));
  }
  return out;
}

/* ---------------- The sun's path and a stick's shadow ---------------- */

/* The sun's declination — how far north or south of the equator it
   shines from — swings between ±23.44° across the year. The four
   season markers the bench offers: */
const SEASONS = [
  { name: "Spring equinox (about 20 March)", decl: 0 },
  { name: "Summer solstice (about 21 June)", decl: 23.44 },
  { name: "Autumn equinox (about 22 September)", decl: 0 },
  { name: "Winter solstice (about 21 December)", decl: -23.44 },
];

/* Solar altitude and azimuth for a latitude, declination, and
   solar hour. Azimuth is measured clockwise from north
   (0 = N, 90 = E, 180 = S, 270 = W). Standard spherical
   astronomy — the same geometry Everyday Time's sundial bench
   squeezes into hour lines. */
function sunPosition(latDeg, declDeg, hour) {
  const lat = latDeg * Math.PI / 180, decl = declDeg * Math.PI / 180;
  const H = (hour - 12) * 15 * Math.PI / 180;
  const sinAlt = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(decl) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat) || 1e-9);
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
  if (H > 0) az = 360 - az; // afternoon: the sun is in the western half
  return { altDeg: alt * 180 / Math.PI, azDeg: az };
}

/* A vertical stick of height h casts a shadow of h / tan(altitude)
   — equivalently h × tan(zenith angle). Below the horizon there is
   no shadow at all. */
function shadowLength(height, altDeg) {
  if (altDeg <= 0) return Infinity;
  return height / Math.tan(altDeg * Math.PI / 180);
}
/* The shadow points exactly away from the sun. */
function shadowDirection(azDeg) { return (azDeg + 180) % 360; }
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
function compassName(deg) { return COMPASS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]; }

/* ---------------- The spectrum ---------------- */

/* Light is a wave, and the visible band is a narrow slice of it:
   wavelengths 380–750 nanometres. Frequency follows from the
   speed of light: f = c/λ — at 500 nm (green), about 600 THz. */
const SPEED_OF_LIGHT = 299792458; // m/s, exact by definition since 1983
function wavelengthFreqTHz(nm) { return SPEED_OF_LIGHT / (nm * 1e-9) / 1e12; }
/* A screen's approximation of a wavelength's colour: walk the hue
   wheel from violet (380) to red (750), dimming the two ends where
   the eye itself fades. It is an approximation and says so — a
   monitor mixes three lights to suggest a colour it cannot truly
   show, and past the ends there is no colour for us at all. */
function wavelengthColor(nm) {
  const t = (nm - 380) / (750 - 380);
  const hue = 270 * (1 - t);
  const fade = nm < 420 ? 0.55 + 0.45 * (nm - 380) / 40 : nm > 700 ? 1 - 0.45 * (nm - 700) / 50 : 1;
  return "hsl(" + hue.toFixed(0) + ", 90%, " + (52 * fade).toFixed(0) + "%)";
}

/* ---------------- Small helpers ---------------- */

function fmt(x, digits) {
  if (!isFinite(x)) return "—";
  const d = digits == null ? 2 : digits;
  return Number(x.toFixed(d)).toLocaleString("en-US", { maximumFractionDigits: d });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    mixLight, rgbString, PIGMENTS, mixPigment,
    HUES, CHORDS, chordIndices, hueAngle, hueColor,
    thinLens, rayleighRatio, scatterStrength, airMass, sunColor, skyColor,
    SEASONS, sunPosition, shadowLength, shadowDirection, compassName,
    SPEED_OF_LIGHT, wavelengthFreqTHz, wavelengthColor, fmt,
  };
}
