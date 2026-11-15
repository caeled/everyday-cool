// Radio astronomy math checks. Run: node tests/radio.test.cjs   (development only)
const assert = require('node:assert/strict');
const path = require('node:path');
const R = require(path.join(__dirname, '..', 'radio.js'));
const A = require(path.join(__dirname, '..', 'astro.js'));
let count = 0;
function check(ok, what) { assert.ok(ok, what); count++; }
const near = (a, b, tol) => Math.abs(a - b) <= tol;

check(near(R.HI_MHZ * 1e6 / 1e6, 1420.405751768, 1e-9) && near(R.C / (R.HI_MHZ * 1e6), 0.21106, 1e-4), 'hydrogen line is 1420.406 MHz = 21.1 cm');
check(near(R.frequencyHz(3), 99.93e6, 1e4), '3 m is about 100 MHz (FM radio)');
check(near(R.photonEnergyEV(550e-9), 2.25, 0.02), 'green light photons carry about 2.25 eV');
check(R.band(550e-9).name === 'Visible light' && R.band(0.21).name === 'Radio' && R.band(1e-10).name === 'X-rays' && R.band(1e-13).name === 'Gamma rays' && R.band(15).name === 'Radio' && R.band(30).name === 'Long radio' && R.band(2e-3).name === 'Microwaves', 'spectrum bands');
// Resolution: a 0.8 m dish at 21 cm has a beam of roughly 15-20 degrees; Arecibo-size dish ~ 3 arcmin
check(near(R.resolutionArcsec(0.211, 0.8) / 3600, 18.4, 1), '0.8 m dish at 21 cm: about 18 deg (Rayleigh); the plan quotes ~15 deg beam width');
check(near(R.resolutionArcsec(0.211, 300) / 60, 2.9, 0.2), '300 m dish at 21 cm: about 3 arcminutes');
check(near(R.diameterFor(0.211, 60), 885, 10), 'matching the eye (60") at 21 cm needs about 885 m');
check(near(R.resolutionArcsec(550e-9, 0.007), 19.8, 0.5), 'a 7 mm pupil in green light: about 20" (theory; real eyes about 60")');
// Interferometer fringes
check(near(R.fringe(0, 10, 0.21), 1, 1e-12), 'source straight up: full response');
check(near(R.fringe(R.fringeSpacingDeg(10, 0.21) / 2, 10, 0.21), 0, 1e-3), 'half a fringe away: no response');
check(near(R.fringeSpacingDeg(100, 0.21), 0.1203, 1e-3), '100 m baseline at 21 cm: fringes 0.12 deg apart');
// Doppler and rotation
check(near(R.dopplerMHz(0), R.HI_MHZ, 1e-12) && R.dopplerMHz(100) < R.HI_MHZ && near(R.HI_MHZ - R.dopplerMHz(100), 0.4738, 1e-3), 'gas receding at 100 km/s is heard 0.47 MHz lower');
check(near(R.radialVelocity(30, 0.001, 'flat'), 0, 0.1), 'nearby gas has almost no relative motion');
let vmax = -1e9; for (let d = 0; d < 20; d += 0.01) vmax = Math.max(vmax, R.radialVelocity(30, d, 'flat'));
check(near(vmax, R.tangentVelocity(30), 0.5) && near(vmax, 115, 0.5), 'tangent point at l=30 on a flat curve: 115 km/s, at d = R0 cos l');
check(near(R.radialVelocity(30, R.R0 * Math.cos(Math.PI / 6), 'flat'), 115, 0.1), 'the tangent point sits at d = R0 cos l');
check(R.rotationSpeed(16.4, 'kepler') < R.rotationSpeed(16.4, 'flat') * 0.75, 'a Keplerian galaxy would turn much slower far out');
const spec = R.hydrogenSpectrum(30, 'flat');
check(spec.length === 151 && Math.max(...spec.map((b) => b.power)) === 1, 'simulated spectrum is normalised');
// Galactic coordinates
const gc = R.galacticToEq(0, 0);
check(A.separation(gc.ra, gc.dec, 17.7611, -29.008) < 0.1, 'galactic centre (l=0,b=0) is next to Sgr A*');
const ngp = R.galacticToEq(0, 90);
check(near(ngp.ra * 15, 192.859, 0.01) && near(ngp.dec, 27.128, 0.01), 'north galactic pole');
const cyg = R.galacticToEq(76.19, 5.76); // Cygnus A's galactic coordinates
check(A.separation(cyg.ra, cyg.dec, 19.9912, 40.734) < 0.3, 'Cygnus A from galactic coordinates');
check(R.SOURCES.length === 6 && R.SOURCES.every((s) => s.ra >= 0 && s.ra < 24 && Math.abs(s.dec) <= 90), 'radio source list is sane');
check(near(1 / R.PULSARS.find((p) => p.id === 'Crab').period, 29.95, 0.1) && near(1 / R.PULSARS.find((p) => p.id === 'B1937').period, 642, 1), 'pulsar spin rates');
console.log(`Radio checks passed: ${count} checks (spectrum, resolution, fringes, Doppler and rotation curve, galactic coordinates).`);
