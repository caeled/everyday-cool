"use strict";
/* Everyday Earth — page wiring. The rules live in earth.js. */
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
 const num = (id) => parseFloat($(id).value);

 /* ---- The water cycle bench: one scene, four stages ---- */
 let cycleId = "evaporation";
 function drawCycle() {
  const svg = $("cycle-svg"); svg.innerHTML = "";
  // sky and sun
  el("rect", { x: 0, y: 0, width: 720, height: 300, fill: "#0d2036" }, svg);
  el("circle", { cx: 90, cy: 58, r: 30, fill: "#f5c369" }, svg);
  el("circle", { cx: 90, cy: 58, r: 44, fill: "none", stroke: "#f5c369", "stroke-width": 2, "stroke-dasharray": "4 7", opacity: .6 }, svg);
  // mountain and land
  el("polygon", { points: "330,300 470,120 610,300", fill: "#1d3a2a" }, svg);
  el("polygon", { points: "438,168 470,120 504,170 486,182 470,158 454,182", fill: "#d9e5ed" }, svg);
  el("rect", { x: 0, y: 262, width: 720, height: 38, fill: "#14301d" }, svg);
  // lake / ocean at the left
  el("path", { d: "M0,238 Q60,228 120,238 T240,238 L240,300 L0,300 Z", fill: "#175d8a" }, svg);
  // cloud
  const cloudFill = cycleId === "condensation" || cycleId === "precipitation" ? "#e8eef2" : "#9db4c0";
  el("ellipse", { cx: 400, cy: 84, rx: 86, ry: 30, fill: cloudFill }, svg);
  el("ellipse", { cx: 356, cy: 96, rx: 58, ry: 24, fill: cloudFill }, svg);
  el("ellipse", { cx: 448, cy: 96, rx: 58, ry: 24, fill: cloudFill }, svg);
  // stage art, lit when its stage is chosen
  const on = (id, col) => cycleId === id ? col : "#3d5a73";
  // evaporation: wavy arrows rising off the water
  for (let i = 0; i < 3; i++) {
   el("path", { d: "M" + (60 + i * 55) + ",225 q10,-18 0,-36 q-10,-18 0,-36", fill: "none", stroke: on("evaporation", "#f5c369"), "stroke-width": 4, "stroke-linecap": "round" }, svg);
  }
  // precipitation: rain lines under the cloud
  for (let i = 0; i < 5; i++) {
   el("line", { x1: 340 + i * 32, y1: 132, x2: 332 + i * 32, y2: 168, stroke: on("precipitation", "#7fdddb"), "stroke-width": 4, "stroke-linecap": "round" }, svg);
  }
  // collection: the river running off the mountain into the lake
  el("path", { d: "M520,205 q-60,25 -120,30 q-80,6 -160,4", fill: "none", stroke: on("collection", "#7fdddb"), "stroke-width": 6, "stroke-linecap": "round" }, svg);
  el("circle", { cx: 250, cy: 238, r: 7, fill: on("collection", "#7fdddb") }, svg);
  // condensation marker: droplets gathering in the cloud
  for (let i = 0; i < 4; i++) {
   el("circle", { cx: 362 + i * 26, cy: 88, r: 5, fill: on("condensation", "#175d8a") }, svg);
  }
  const t = (x, y, s, col) => { const n = el("text", { x, y, "text-anchor": "middle", fill: col || "#d9e5ed", "font-size": 15, "font-weight": 700 }, svg); n.textContent = s; };
  t(118, 292, "the lake", "#b1cbd4");
  t(470, 292, "the mountain", "#b1cbd4");
 }
 function runCycle() {
  const s = cycleStage(cycleId);
  drawCycle();
  document.querySelectorAll(".cycle-btn").forEach((b) => b.classList.toggle("active", b.dataset.stage === cycleId));
  const next = nextStage(cycleId);
  showSteps($("cycle-result"), s.name + " — " + s.short, { steps: s.steps.concat(["Next in the loop: " + next.name.toLowerCase() + "."]) });
 }
 document.querySelectorAll(".cycle-btn").forEach((b) => b.addEventListener("click", () => { cycleId = b.dataset.stage; runCycle(); }));

 /* ---- The rock sorter ---- */
 let rockName = "Granite";
 function runRock() {
  const r = rockInfo(rockName);
  document.querySelectorAll(".rock-btn").forEach((b) => b.classList.toggle("active", b.dataset.rock === rockName));
  showSteps($("rock-result"), r.name + " — " + r.family, { steps: [
   ROCK_FAMILIES[r.family],
   "How this one formed: " + r.how,
   "Where you actually see it: " + r.see] });
 }
 document.querySelectorAll(".rock-btn").forEach((b) => b.addEventListener("click", () => { rockName = b.dataset.rock; runRock(); }));

 /* ---- The soil bench: five horizons, drawn to feel ---- */
 let soilLetter = "A";
 function drawSoil() {
  const svg = $("soil-svg"); svg.innerHTML = "";
  const rows = [
   { letter: "O", y: 10, h: 30, fill: "#4a3520", label: "O — leaf litter" },
   { letter: "A", y: 44, h: 58, fill: "#5d4028", label: "A — topsoil" },
   { letter: "B", y: 106, h: 62, fill: "#8a6134", label: "B — subsoil" },
   { letter: "C", y: 172, h: 56, fill: "#a8895a", label: "C — parent material" },
   { letter: "R", y: 232, h: 58, fill: "#5a6a75", label: "R — bedrock" }
  ];
  rows.forEach((r) => {
   el("rect", { x: 90, y: r.y, width: 420, height: r.h, fill: r.fill, stroke: soilLetter === r.letter ? "#f5c369" : "#304354", "stroke-width": soilLetter === r.letter ? 4 : 1 }, svg);
   const t = el("text", { x: 300, y: r.y + r.h / 2 + 6, "text-anchor": "middle", fill: "#f7f3e8", "font-size": 16, "font-weight": 700 }, svg);
   t.textContent = r.label;
  });
  // roots in the topsoil, grass on top
  for (let i = 0; i < 6; i++) {
   el("path", { d: "M" + (140 + i * 70) + ",44 q4,20 -2,38", fill: "none", stroke: "#d9c9a8", "stroke-width": 2 }, svg);
   el("path", { d: "M" + (140 + i * 70) + ",12 q-4,-8 -9,-10 M" + (140 + i * 70) + ",12 q4,-8 9,-10", fill: "none", stroke: "#79d9c9", "stroke-width": 2.5 }, svg);
  }
  const note = el("text", { x: 530, y: 160, fill: "#9db4c0", "font-size": 13.5 }, svg);
  note.textContent = "Not to scale —";
  const note2 = el("text", { x: 530, y: 180, fill: "#9db4c0", "font-size": 13.5 }, svg);
  note2.textContent = "bedrock can be";
  const note3 = el("text", { x: 530, y: 200, fill: "#9db4c0", "font-size": 13.5 }, svg);
  note3.textContent = "metres down.";
 }
 function runSoil() {
  const h = soilHorizon(soilLetter);
  drawSoil();
  document.querySelectorAll(".soil-btn").forEach((b) => b.classList.toggle("active", b.dataset.letter === soilLetter));
  showSteps($("soil-result"), h.letter + " — " + h.name + " · " + h.depth, { steps: [h.what] });
 }
 document.querySelectorAll(".soil-btn").forEach((b) => b.addEventListener("click", () => { soilLetter = b.dataset.letter; runSoil(); }));

 /* ---- The depth bench: how far down is that? ---- */
 function drawDepth(km) {
  const svg = $("depth-svg"); svg.innerHTML = "";
  const x0 = 30, x1 = 690, y = 96, h = 54;
  const X = (d) => x0 + (d / EARTH_RADIUS_KM) * (x1 - x0);
  const segs = [
   { to: 70, fill: "#c98d4e", name: "Crust" },
   { to: 2900, fill: "#8a4a2a", name: "Mantle" },
   { to: 5150, fill: "#c23b2a", name: "Outer core" },
   { to: 6371, fill: "#f5c369", name: "Inner core" }
  ];
  let from = 0;
  segs.forEach((s) => {
   el("rect", { x: X(from), y, width: Math.max(2, X(s.to) - X(from)), height: h, fill: s.fill }, svg);
   const t = el("text", { x: (X(from) + X(s.to)) / 2, y: y + h + 26, "text-anchor": "middle", fill: "#b1cbd4", "font-size": 13.5, "font-weight": 700 }, svg);
   t.textContent = s.name;
   from = s.to;
  });
  el("line", { x1: X(km), y1: y - 26, x2: X(km), y2: y + h + 4, stroke: "#f7f3e8", "stroke-width": 3 }, svg);
  const t = el("text", { x: Math.min(Math.max(X(km), 70), 650), y: y - 34, "text-anchor": "middle", fill: "#f7f3e8", "font-size": 14.5, "font-weight": 700 }, svg);
  t.textContent = "you are here: " + km + " km";
  const cap = el("text", { x: 360, y: 22, "text-anchor": "middle", fill: "#9db4c0", "font-size": 13.5 }, svg);
  cap.textContent = "Drawn at true scale — the crust is the hairline at the left.";
 }
 function runDepth() {
  const km = num("depth-input");
  const r = depthLayer(km);
  const out = $("depth-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a depth between the surface and the centre — 0 to 6,371 km — and I'll tell you what layer you're standing in.</p>"; drawDepth(0); return; }
  drawDepth(km);
  showSteps(out, km + " km down: the " + r.layer.toLowerCase(), r);
 }
 $("depth-input").addEventListener("input", runDepth);
 document.querySelectorAll(".depth-chip").forEach((b) => b.addEventListener("click", () => { $("depth-input").value = b.dataset.km; runDepth(); }));

 /* ---- Weather: fronts, clouds, and the barometer ---- */
 let frontKind = "cold";
 function runFront() {
  const r = frontInfo(frontKind);
  document.querySelectorAll(".front-btn").forEach((b) => b.classList.toggle("active", b.dataset.front === frontKind));
  showSteps($("front-result"), r.name + " — " + r.symbol.toLowerCase(), r);
 }
 document.querySelectorAll(".front-btn").forEach((b) => b.addEventListener("click", () => { frontKind = b.dataset.front; runFront(); }));
 let cloudName = "Cumulus";
 function runCloud() {
  const c = cloudInfo(cloudName);
  document.querySelectorAll(".cloud-btn").forEach((b) => b.classList.toggle("active", b.dataset.cloud === cloudName));
  showSteps($("cloud-result"), c.name + " — " + c.look, { steps: [c.foretells] });
 }
 document.querySelectorAll(".cloud-btn").forEach((b) => b.addEventListener("click", () => { cloudName = b.dataset.cloud; runCloud(); }));
 function runBaro() {
  const p = num("baro-pressure"), ch = num("baro-change");
  const r = pressureTrend(ch);
  const out = $("baro-result");
  if (!r.ok || !isFinite(p)) { out.innerHTML = "<p>Give me the pressure and how much it moved in three hours, and I'll read the needle.</p>"; return; }
  showSteps(out, p + " hPa (" + hpaToInhg(p).toFixed(2) + " inHg) — " + r.trend.toLowerCase(), r);
 }
 ["baro-pressure", "baro-change"].forEach((id) => $(id).addEventListener("input", runBaro));

 runCycle(); runRock(); runSoil(); runDepth(); runFront(); runCloud(); runBaro();
})();

