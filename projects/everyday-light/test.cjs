"use strict";
const assert = require("node:assert");
const L = require("./light.js");

function near(actual, expected, tol, msg) {
  assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* Mixing light: additive, and full is white */
assert.deepStrictEqual(L.mixLight(255, 255, 255), { r: 255, g: 255, b: 255 }, "all three lamps at full is white");
assert.deepStrictEqual(L.mixLight(255, 255, 0), { r: 255, g: 255, b: 0 }, "red + green light, no blue, is yellow");
assert.deepStrictEqual(L.mixLight(255, 0, 255), { r: 255, g: 0, b: 255 }, "red + blue light is magenta");
assert.deepStrictEqual(L.mixLight(0, 0, 0), { r: 0, g: 0, b: 0 }, "no lamps is black");
assert.deepStrictEqual(L.mixLight(300, -5, 128), { r: 255, g: 0, b: 128 }, "channels clamp to 0–255");

/* Mixing pigment: subtractive, and full is a near-black that leaks */
assert.deepStrictEqual(L.mixPigment(0, 0, 0), { r: 255, g: 255, b: 255 }, "bare paper is white");
const full = L.mixPigment(100, 100, 100);
assert.ok(full.r < 30 && full.g < 30 && full.b < 30, "full C+M+Y lands near black in the model (got " + JSON.stringify(full) + ")");
assert.ok(full.r + full.g + full.b > 0, "but it leaks — it is not a true black, which is why printers add K");
const yel = L.mixPigment(0, 0, 100);
assert.ok(yel.r > 200 && yel.g > 180 && yel.b < 40, "yellow pigment alone: red and green bounce, blue is swallowed");
const cyn = L.mixPigment(100, 0, 0);
assert.ok(cyn.r < 40 && cyn.g > 150 && cyn.b > 180, "cyan pigment alone: red is swallowed, green and blue bounce");
const half = L.mixPigment(50, 0, 0);
assert.ok(half.r > cyn.r && half.r < 255, "half-strength cyan swallows only part of the red");
assert.ok(L.mixPigment(100, 100, 0).b > 150 && L.mixPigment(100, 100, 0).r < 40, "cyan + magenta makes a blue: only blue survives both filters");

/* The wheel and its chords: the geometry is the definition */
assert.strictEqual(L.HUES.length, 12, "twelve hues on the wheel");
assert.strictEqual(L.hueAngle(6), 180, "six steps around the wheel is 180°");
const comp = L.chordIndices("complementary", 0);
assert.deepStrictEqual(comp, [0, 6], "red's complement is the hue six steps away");
assert.strictEqual((L.hueAngle(comp[1]) - L.hueAngle(comp[0])) % 360, 180, "complementary pairs sit exactly 180° apart");
for (let root = 0; root < 12; root++) {
  const c = L.chordIndices("complementary", root);
  assert.strictEqual((c[1] - c[0] + 12) % 12, 6, "every complement is six steps from its root (root " + root + ")");
}
const tri = L.chordIndices("triadic", 0);
assert.deepStrictEqual(tri, [0, 4, 8], "a triad is root, +4, +8");
assert.strictEqual(L.hueAngle(tri[1]) - L.hueAngle(tri[0]), 120, "triadic steps are 120°");
assert.strictEqual(L.hueAngle(tri[2]) - L.hueAngle(tri[1]), 120, "and 120° again");
const ana = L.chordIndices("analogous", 0);
assert.deepStrictEqual(ana, [11, 0, 1], "analogous wraps around the wheel: neighbour, root, neighbour");
const split = L.chordIndices("split", 0);
assert.deepStrictEqual(split, [0, 5, 7], "split-complementary flanks the complement");
assert.deepStrictEqual(L.chordIndices("triadic", 3), [3, 7, 11], "chords rotate with the root");

/* The thin lens: 1/f = 1/do + 1/di, and the minus sign in m */
const lens = L.thinLens(10, 30);
near(lens.di, 15, 1e-9, "f = 10 cm, object at 30 cm: the image forms at 15 cm");
near(lens.m, -0.5, 1e-9, "magnification −0.5 — half size, and the minus means inverted");
assert.strictEqual(lens.real, true, "that image is real — it can land on a screen");
const farther = L.thinLens(10, 20);
near(farther.di, 20, 1e-9, "object at twice the focal length: image at twice the focal length");
near(farther.m, -1, 1e-9, "same size, inverted");
const glass = L.thinLens(10, 5);
assert.ok(glass.di < 0, "object inside the focal length: a virtual image (negative di)");
assert.ok(glass.m > 1, "and magnified upright — the magnifying glass");
assert.strictEqual(glass.real, false);
const atF = L.thinLens(10, 10);
assert.strictEqual(atF.atInfinity, true, "object at the focal point: the image is at infinity");

/* Rayleigh: 1/λ⁴ does all the work */
near(L.rayleighRatio(450, 650), 4.35, 0.02, "blue 450 nm scatters ≈ ×4.35 more than red 650 nm");
near(L.scatterStrength(550), 1, 1e-12, "green 550 nm is the reference");
assert.ok(L.scatterStrength(450) > L.scatterStrength(550) && L.scatterStrength(550) > L.scatterStrength(650), "scattering climbs as wavelength shrinks");
near(L.airMass(90), 1, 1e-9, "overhead, the path is one air mass");
assert.ok(L.airMass(5) > 10, "near the horizon the path is ten-plus air masses");
const noon = L.sunColor(1), sunset = L.sunColor(30);
assert.ok(noon.b > 180, "the midday sun keeps most of its blue — near white");
assert.ok(sunset.r > sunset.g && sunset.g > sunset.b, "after 30 air masses the sun runs red: r > g > b");
assert.ok(sunset.b < 5, "the blue is spent");
const sky = L.skyColor(1);
assert.ok(sky.b > sky.g && sky.g > sky.r, "the sky's scattered light runs blue: b > g > r");

/* The sun's path and a stick's shadow */
const noonEq = L.sunPosition(41.3, 0, 12); // Defiance latitude, equinox, solar noon
near(noonEq.altDeg, 48.7, 0.05, "equinox noon at 41.3°N: the sun stands 90 − 41.3 = 48.7° high");
near(L.shadowLength(1, noonEq.altDeg), Math.tan(41.3 * Math.PI / 180), 0.01, "so a 1 m stick's noon shadow is height × tan(41.3°) ≈ 0.88 m");
near(L.sunPosition(41.3, 0, 6).altDeg, 0, 0.6, "at 6 AM on the equinox the sun is on the horizon");
assert.ok(L.sunPosition(41.3, 23.44, 12).altDeg > noonEq.altDeg, "the summer noon sun stands higher");
assert.ok(L.sunPosition(41.3, -23.44, 12).altDeg < noonEq.altDeg, "the winter noon sun stands lower");
assert.ok(L.shadowLength(1, L.sunPosition(41.3, -23.44, 12).altDeg) > L.shadowLength(1, noonEq.altDeg), "winter noon shadows are the longer ones");
assert.strictEqual(L.shadowLength(1, -3), Infinity, "no sun, no shadow");
near(L.shadowDirection(90), 270, 1e-9, "a morning sun in the east throws its shadow west");
assert.strictEqual(L.compassName(270), "west");
assert.strictEqual(L.compassName(0), "north");

/* The spectrum: f = c/λ, and the band's two edges */
near(L.wavelengthFreqTHz(500), 599.6, 0.5, "green 500 nm vibrates at ≈ 600 THz");
near(L.wavelengthFreqTHz(750), 399.7, 0.5, "the red edge, 750 nm: ≈ 400 THz");
near(L.wavelengthFreqTHz(380), 788.9, 0.5, "the violet edge, 380 nm: ≈ 789 THz");
assert.ok(L.wavelengthFreqTHz(400) > L.wavelengthFreqTHz(700), "shorter wavelength, higher frequency");
assert.ok(/^hsl\(/.test(L.wavelengthColor(550)), "a wavelength maps to a screen colour string");

console.log("Everyday Light: all rule tests passed.");

/* Laser & Mirrors: the room's game, integrated 20 November 2026 */
const fs = require("node:fs");
const path = require("node:path");
const laserPath = path.join(__dirname, "laser-mirrors.html");
assert.ok(fs.existsSync(laserPath), "Laser & Mirrors sits in this room");
const laserHtml = fs.readFileSync(laserPath, "utf8");
assert.ok(!/(?:src|href)="https?:\/\//i.test(laserHtml), "Laser & Mirrors loads nothing external");
const lightRoomHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(lightRoomHtml.includes('href="laser-mirrors.html"'), "the Light room links to Laser & Mirrors");
console.log("Everyday Light: Laser & Mirrors checks passed (exists, nothing external, room links to it).");
