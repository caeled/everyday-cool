"use strict";
/* Everyday Engineering — page wiring. The rules live in engineering.js. */
(function () {
 const $ = (id) => document.getElementById(id);
 const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
 const SVGNS = "http://www.w3.org/2000/svg";
 function el(name, attrs, parent) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
 }
 function showSteps(box, big, r) {
  box.innerHTML = "<p class='big-answer'>" + esc(big) + "</p><ol>" +
   r.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol>";
 }

 /* ---- The lever bench: slide the fulcrum, lift the crate ---- */
 const LEVER_BEAM = 3; // metres, fixed for the bench
 function runLever() {
  const load = parseFloat($("lever-load").value);
  const f = parseFloat($("lever-fulcrum").value); // percent of beam from the crate
  const r = lever(load, LEVER_BEAM, LEVER_BEAM * f / 100);
  const out = $("lever-result");
  drawLever(f);
  if (!r.ok) { out.innerHTML = "<p>Give the crate a weight, and keep the fulcrum on the beam.</p>"; return; }
  showSteps(out, "Mechanical advantage " + fmt(r.ma) + " — the " + fmt(load) + " kg crate lifts with " + fmt(r.effortKg) + " kg of push", r);
 }
 function drawLever(f) {
  const svg = $("lever-svg"); svg.innerHTML = "";
  const W = 720, base = 190, x0 = 70, x1 = 650;
  const fx = x0 + (x1 - x0) * f / 100;
  el("line", { x1: 20, y1: base, x2: 700, y2: base, stroke: "#557384", "stroke-width": 3 }, svg);
  // Beam, tilted: crate end down, effort end up, pivoting on the fulcrum.
  const tilt = 26;
  const yAt = (x) => 128 - (x - fx) * tilt / 300;
  el("line", { x1: x0 - 16, y1: yAt(x0 - 16), x2: x1 + 16, y2: yAt(x1 + 16), stroke: "#c98d4e", "stroke-width": 13, "stroke-linecap": "round" }, svg);
  el("polygon", { points: (fx - 30) + "," + base + " " + (fx + 30) + "," + base + " " + fx + ",140", fill: "#8d99a6" }, svg);
  el("circle", { cx: fx, cy: 140, r: 6, fill: "#f5c369" }, svg);
  // The crate on the left end.
  const cy = yAt(x0) - 34;
  el("rect", { x: x0 - 30, y: cy, width: 60, height: 34, rx: 3, fill: "#a9743f", stroke: "#6e4a26", "stroke-width": 2 }, svg);
  el("line", { x1: x0 - 30, y1: cy + 17, x2: x0 + 30, y2: cy + 17, stroke: "#6e4a26", "stroke-width": 2 }, svg);
  const t1 = el("text", { x: x0, y: cy - 8, "text-anchor": "middle", fill: "#d9e5ed", "font-size": 14, "font-weight": 700 }, svg);
  t1.textContent = "CRATE";
  // The push arrow at the right end.
  const ey = yAt(x1);
  el("line", { x1: x1, y1: ey - 44, x2: x1, y2: ey - 8, stroke: "#79d9c9", "stroke-width": 5 }, svg);
  el("polygon", { points: (x1 - 7) + "," + (ey - 10) + " " + (x1 + 7) + "," + (ey - 10) + " " + x1 + "," + (ey + 2), fill: "#79d9c9" }, svg);
  const t2 = el("text", { x: x1, y: ey - 54, "text-anchor": "middle", fill: "#79d9c9", "font-size": 14, "font-weight": 700 }, svg);
  t2.textContent = "YOU PUSH";
  const t3 = el("text", { x: fx, y: base + 22, "text-anchor": "middle", fill: "#9db4c0", "font-size": 13 }, svg);
  t3.textContent = "fulcrum";
 }
 $("lever-load").addEventListener("input", runLever);
 $("lever-fulcrum").addEventListener("input", runLever);

 /* ---- The pulley bench: count the segments, feel the trade ---- */
 let pulleySegs = 3;
 function runPulley() {
  const load = parseFloat($("pulley-load").value);
  const r = pulley(load, pulleySegs);
  const out = $("pulley-result");
  drawPulley(pulleySegs);
  if (!r.ok) { out.innerHTML = "<p>Give the load a weight, and the bench will rig the pulleys.</p>"; return; }
  showSteps(out, pulleySegs + (pulleySegs === 1 ? " segment" : " segments") + " — the " + fmt(load) + " kg load lifts with " + fmt(r.effortKg) + " kg of pull", r);
 }
 function drawPulley(n) {
  const svg = $("pulley-svg"); svg.innerHTML = "";
  el("rect", { x: 30, y: 14, width: 660, height: 12, rx: 4, fill: "#8d99a6" }, svg); // the beam
  const topX = 250, botX = 250, topY = 62, botY = 168;
  const wheel = (cx, cy) => {
   el("circle", { cx, cy, r: 21, fill: "#132334", stroke: "#f5c369", "stroke-width": 4 }, svg);
   el("circle", { cx, cy, r: 5, fill: "#f5c369" }, svg);
  };
  // Fixed pulley on the beam (always present), moving pulley on the load.
  wheel(topX, topY);
  el("line", { x1: topX, y1: 26, x2: topX, y2: topY - 21, stroke: "#f5c369", "stroke-width": 4 }, svg);
  wheel(botX, botY);
  // Supporting segments between the two pulleys, spread by count.
  for (let i = 0; i < n; i++) {
   const x = botX - 18 + (36 * (n === 1 ? 0.5 : i / (n - 1)));
   el("line", { x1: x, y1: topY + 10, x2: x, y2: botY - 10, stroke: "#7fdddb", "stroke-width": 3 }, svg);
  }
  // The free end: over the fixed pulley and down to the hand.
  el("line", { x1: topX + 21, y1: topY, x2: 520, y2: topY, stroke: "#7fdddb", "stroke-width": 3 }, svg);
  el("line", { x1: 520, y1: topY, x2: 520, y2: 168, stroke: "#7fdddb", "stroke-width": 3 }, svg);
  el("line", { x1: 520, y1: 168, x2: 520, y2: 190, stroke: "#79d9c9", "stroke-width": 5 }, svg);
  el("polygon", { points: "513,188 527,188 520,200", fill: "#79d9c9" }, svg);
  const tp = el("text", { x: 520, y: 222, "text-anchor": "middle", fill: "#79d9c9", "font-size": 14, "font-weight": 700 }, svg);
  tp.textContent = "YOU PULL";
  // The load under the moving pulley.
  el("line", { x1: botX, y1: botY + 21, x2: botX, y2: botY + 32, stroke: "#f5c369", "stroke-width": 4 }, svg);
  el("rect", { x: botX - 42, y: botY + 32, width: 84, height: 40, rx: 3, fill: "#a9743f", stroke: "#6e4a26", "stroke-width": 2 }, svg);
  const tl = el("text", { x: botX, y: botY + 24, "text-anchor": "middle", fill: "#d9e5ed", "font-size": 14, "font-weight": 700 }, svg);
  tl.textContent = "LOAD";
  const ts = el("text", { x: 640, y: 120, "text-anchor": "middle", fill: "#9db4c0", "font-size": 13 }, svg);
  ts.textContent = n + (n === 1 ? " segment" : " segments");
 }
 document.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => {
  pulleySegs = parseInt(b.dataset.segs, 10);
  document.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
  runPulley();
 }));
 $("pulley-load").addEventListener("input", runPulley);

 /* ---- The ramp bench: gentler slope, longer walk ---- */
 function runRamp() {
  const load = parseFloat($("ramp-load").value);
  const angle = parseFloat($("ramp-angle").value);
  const r = ramp(load, angle, 1); // readouts are for a 1 m climb
  const out = $("ramp-result");
  drawRamp(angle);
  if (!r.ok) { out.innerHTML = "<p>Give the load a weight and a slope between level and steep.</p>"; return; }
  const std = rampStandard(1);
  showSteps(out, "At " + fmt(angle) + "° the " + fmt(load) + " kg load pushes back with " + fmt(r.effortKg) + " kg — a 1:" + fmt(r.ratio) + " slope", r);
  const note = document.createElement("p");
  note.textContent = "For comparison, the wheelchair-ramp standard is 1:12 — about " + fmt(std.angleDeg) + "°. A 1 m rise at that standard runs " + fmt(std.runM) + " m of ramp.";
  out.appendChild(note);
 }
 function drawRamp(angle) {
  const svg = $("ramp-svg"); svg.innerHTML = "";
  const x0 = 60, y0 = 190, runPx = 560;
  const risePx = Math.tan(angle * Math.PI / 180) * runPx;
  const y1 = Math.max(30, y0 - risePx);
  const x1 = x0 + runPx * (y0 - y1) / (risePx || 1);
  el("line", { x1: 20, y1: y0, x2: 700, y2: y0, stroke: "#557384", "stroke-width": 3 }, svg);
  el("polygon", { points: x0 + "," + y0 + " " + (x0 + (x1 - x0)) + "," + y0 + " " + x1 + "," + y1, fill: "#132334", stroke: "#c98d4e", "stroke-width": 3 }, svg);
  // The load, partway up the slope.
  const mx = x0 + (x1 - x0) * 0.45, my = y0 - (y0 - y1) * 0.45;
  const g = el("g", { transform: "translate(" + mx + " " + my + ") rotate(" + (-angle) + ")" }, svg);
  el("rect", { x: -26, y: -30, width: 52, height: 30, rx: 3, fill: "#a9743f", stroke: "#6e4a26", "stroke-width": 2 }, g);
  const t = el("text", { x: x1, y: y1 - 12, "text-anchor": "end", fill: "#f5c369", "font-size": 15, "font-weight": 700 }, svg);
  t.textContent = fmt(angle) + "°";
 }
 $("ramp-load").addEventListener("input", runRamp);
 $("ramp-angle").addEventListener("input", runRamp);

 /* ---- The frames bench: push the frame, watch it lean ---- */
 let frameShape = "square";
 function runFrames() {
  const push = parseFloat($("frame-push").value);
  const r = frameLean(frameShape, push / 100);
  drawFrame(frameShape, r.ok ? r.leanM * 100 : 0);
  const out = $("frame-result");
  if (!r.ok) { out.innerHTML = "<p>Pick a frame and give it a push.</p>"; return; }
  const msg = frameShape === "square"
   ? "The square racks: pushed " + fmt(push) + " cm at the base, its top leans the same " + fmt(push) + " cm. The joints swung — nothing in a square's shape stops them."
   : frameShape === "triangle"
    ? "The triangle holds: pushed " + fmt(push) + " cm, its top leans 0 cm. Its angles are fixed by its side lengths — there is no swing to give."
    : "The braced square holds: pushed " + fmt(push) + " cm, its top leans 0 cm. One diagonal board split the square into two triangles, and triangles don't rack.";
  out.innerHTML = "<p class='big-answer'>" + esc(msg) + "</p>";
 }
 function drawFrame(shape, leanCm) {
  const svg = $("frame-svg"); svg.innerHTML = "";
  const y0 = 200, h = 130, w = 170, x0 = 275;
  const lean = Math.min(leanCm, 60) * 1.6; // pixels of lean, capped for the drawing
  const wood = { stroke: "#c98d4e", "stroke-width": 10, "stroke-linecap": "round" };
  el("line", { x1: 20, y1: y0 + 8, x2: 700, y2: y0 + 8, stroke: "#557384", "stroke-width": 3 }, svg);
  if (shape === "triangle") {
   el("line", Object.assign({ x1: x0 - 20, y1: y0, x2: x0 + w / 2, y2: y0 - h }, wood), svg);
   el("line", Object.assign({ x1: x0 + w / 2, y1: y0 - h, x2: x0 + w + 20, y2: y0 }, wood), svg);
   el("line", Object.assign({ x1: x0 - 20, y1: y0, x2: x0 + w + 20, y2: y0 }, wood), svg);
  } else {
   el("line", Object.assign({ x1: x0, y1: y0, x2: x0 + lean, y2: y0 - h }, wood), svg);
   el("line", Object.assign({ x1: x0 + w, y1: y0, x2: x0 + w + lean, y2: y0 - h }, wood), svg);
   el("line", Object.assign({ x1: x0 + lean, y1: y0 - h, x2: x0 + w + lean, y2: y0 - h }, wood), svg);
   el("line", Object.assign({ x1: x0, y1: y0, x2: x0 + w, y2: y0 }, wood), svg);
   if (shape === "braced")
    el("line", { x1: x0, y1: y0, x2: x0 + w + lean, y2: y0 - h, stroke: "#79d9c9", "stroke-width": 7, "stroke-linecap": "round" }, svg);
  }
  // The push arrow at the top corner.
  const ax = (shape === "triangle" ? x0 + w / 2 : x0 + w + lean) + 56, ay = y0 - h + 4;
  el("line", { x1: ax - 44, y1: ay, x2: ax - 6, y2: ay, stroke: "#79d9c9", "stroke-width": 5 }, svg);
  el("polygon", { points: (ax - 8) + "," + (ay - 7) + " " + (ax - 8) + "," + (ay + 7) + " " + (ax + 4) + "," + ay, fill: "#79d9c9" }, svg);
  const t = el("text", { x: ax - 24, y: ay - 14, "text-anchor": "middle", fill: "#79d9c9", "font-size": 14, "font-weight": 700 }, svg);
  t.textContent = "PUSH";
 }
 document.querySelectorAll(".frame-btn").forEach((b) => b.addEventListener("click", () => {
  frameShape = b.dataset.shape;
  document.querySelectorAll(".frame-btn").forEach((x) => x.classList.toggle("active", x === b));
  runFrames();
 }));
 $("frame-push").addEventListener("input", runFrames);

 /* ---- The pocket log table: look it up the 300-year-old way ---- */
 const grid = $("log-grid");
 for (let i = 0; i < 90; i++) {
  const cell = document.createElement("div");
  cell.className = "log-cell";
  const n = document.createElement("span"); n.className = "log-n"; n.textContent = (1 + i / 10).toFixed(1);
  const v = document.createElement("span"); v.className = "log-v"; v.textContent = "." + LOG_TABLE[i].toFixed(4).slice(2);
  cell.appendChild(n); cell.appendChild(v);
  grid.appendChild(cell);
 }
 function runLog() {
  const x = parseFloat($("log-input").value);
  const r = log10Table(x);
  const out = $("log-result");
  if (!r.ok) { out.innerHTML = "<p>Type a number above zero, and the table will look it up.</p>"; return; }
  showSteps(out, "log₁₀(" + fmt(x) + ") ≈ " + r.result.toFixed(4) + " — by the table, not the calculator", r);
 }
 $("log-input").addEventListener("input", runLog);

 runLever(); runPulley(); runRamp(); runFrames(); runLog();
})();
