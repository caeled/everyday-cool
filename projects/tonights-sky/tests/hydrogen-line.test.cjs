// Hear the Hydrogen Line checks. Run: node tests/hydrogen-line.test.cjs   (development only)
// Extracts the exhibit's HI-CORE from the page, runs its built-in proofs in node:vm, and checks the
// page stays offline (no external src, no fetch/XHR) and keeps its lesson and room links.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'hydrogen-line.html'), 'utf8');
const lesson = fs.readFileSync(path.join(root, 'hydrogen-line-lesson.html'), 'utf8');
let count = 0;
function check(ok, what) { assert.ok(ok, what); count++; }

const a = page.indexOf('/* HI-CORE-BEGIN */'), b = page.indexOf('/* HI-CORE-END */');
check(a > 0 && b > a, 'the page carries one marked HI-CORE');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(page.slice(a, b) + '\nthis.HI = HI;', ctx);
const HI = ctx.HI;
const rows = HI.runProofs();
for (const r of rows) check(r.ok, 'proof: ' + r.claim + ' — ' + r.measured);
check(rows.length === 16, 'sixteen proofs');
check(HI.F0_MHZ === 1420.405751768 && HI.R0 === 8.2 && HI.V0 === 230, 'constants as documented');
// Doppler sign convention: positive = receding = lower frequency
check(HI.freqFromVel(50) < HI.F0 && HI.freqFromVel(-50) > HI.F0 && HI.velFromFreq(HI.F0 - 1000) > 0, 'radio-convention sign');
// Same constants as the room's radio.js (Listening to the sky)
const R = require(path.join(root, 'radio.js'));
check(R.R0 === HI.R0 && R.V0 === HI.V0 && Math.abs(R.HI_MHZ - HI.F0_MHZ) < 1e-9, 'agrees with radio.js on R0, V0 and f0');
check(Math.abs(R.tangentVelocity(30) - HI.tangentVelocity(30, 'flat')) < 1e-9, 'agrees with radio.js on the tangent velocity');
// Seeded noise repeats exactly
const n1 = HI.gaussNoise(64, 1, 7), n2 = HI.gaussNoise(64, 1, 7);
check(n1.every((x, i) => x === n2[i]), 'noise is seeded and repeatable');
// Offline: no external scripts, images, styles or frames; no network calls in the script
for (const [name, html] of [['hydrogen-line.html', page], ['hydrogen-line-lesson.html', lesson]]) {
  check(!/\s(src|data-src)\s*=\s*["']?(https?:)?\/\//i.test(html), name + ': no external src');
  check(!/<link[^>]+href\s*=\s*["']?(https?:)?\/\//i.test(html), name + ': no external stylesheet');
  check(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon|import\(/.test(html), name + ': no network calls');
  check(/<meta name="viewport" content="width=device-width, initial-scale=1">/.test(html) && !/maximum-scale|user-scalable/.test(html), name + ': zoom allowed');
  check(/prefers-reduced-motion: reduce/.test(html), name + ': reduced-motion CSS');
}
check(/matchMedia\("\(prefers-reduced-motion: reduce\)"\)/.test(page), 'exhibit checks reduced motion in script');
// Links: lesson, plan, banner, room
for (const ref of ['hydrogen-line-lesson.html', 'backyard-radio-telescope.html', 'hydrogen-line-banner.webp', 'index.html']) {
  check(page.includes('"' + ref) && fs.existsSync(path.join(root, ref)), 'exhibit links ' + ref);
}
check(lesson.includes('href="hydrogen-line.html"') && lesson.includes('href="backyard-radio-telescope.html"'), 'lesson links back to the exhibit and the plan');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check(idx.includes('href="hydrogen-line.html"') && idx.includes('href="hydrogen-line-lesson.html"'), 'room index carries the exhibit and its lesson');
check(fs.readFileSync(path.join(root, 'backyard-radio-telescope.html'), 'utf8').includes('href="hydrogen-line.html"'), 'the plan page links the exhibit');
console.log('Hydrogen-line checks passed: ' + count + ' checks (16 built-in proofs, constants, Doppler sign, agreement with radio.js, offline, zoom, reduced motion, links).');
