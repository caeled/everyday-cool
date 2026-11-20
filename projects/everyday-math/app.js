"use strict";
/* Everyday Math — page wiring. The rules live in math.js. */
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
 const int = (id) => parseInt($(id).value, 10);

 /* ---- The nines bench: two columns write the table ---- */
 function runNines() {
  const rows = Math.max(1, Math.min(10, int("nines-rows") || 10));
  const t = ninesTable();
  const body = $("nines-body");
  body.innerHTML = t.rows.slice(0, rows).map((r) =>
   "<tr><td>9 × " + r.m + "</td><td class='col-tens'>" + r.tens + "</td><td class='col-ones'>" + r.ones +
   "</td><td class='col-prod'>" + String(r.product).padStart(2, "0") + "</td><td>" + r.tens + " + " + r.ones + " = " + r.digitSum + "</td></tr>").join("");
  showSteps($("nines-result"), rows === 10 ? "The whole table, from two columns" : rows + (rows === 1 ? " row" : " rows") + " built", t);
 }
 $("nines-rows").addEventListener("input", runNines);

 /* ---- Times eleven ---- */
 function runEleven() {
  const r = timesEleven(int("eleven-input"));
  const out = $("eleven-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a whole number from 0 to 99, and watch it split and add.</p>"; return; }
  showSteps(out, r.n + " × 11 = " + fmt(r.result), r);
 }
 $("eleven-input").addEventListener("input", runEleven);

 /* ---- Squares ending in 5 ---- */
 function runFive() {
  const r = squareFive(int("five-input"));
  const out = $("five-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a whole number that ends in 5 — 15, 35, 65, 115 — and the trick is yours.</p>"; return; }
  showSteps(out, r.n + "² = " + fmt(r.result), r);
 }
 $("five-input").addEventListener("input", runFive);

 /* ---- Divisibility ---- */
 function runDiv() {
  const r = divisibility(int("div-input"));
  const out = $("div-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a whole number (not zero) and the rules will vote on it.</p>"; return; }
  out.innerHTML = "<p class='big-answer'>Does " + fmt(r.n) + " divide? The rules vote:</p><ul class='vote-list'>" +
   r.results.map((x) => "<li><span class='vote " + (x.yes ? "yes" : "no") + "'>" + (x.yes ? "YES" : "no") + "</span> <strong>by " + x.d + "</strong> — " + esc(x.why) + "</li>").join("") + "</ul>";
 }
 $("div-input").addEventListener("input", runDiv);

 /* ---- Casting out nines ---- */
 function runCast() {
  const r = castingOutNines(int("cast-a"), int("cast-b"), int("cast-c"));
  const out = $("cast-result");
  if (!r.ok) { out.innerHTML = "<p>Give me two whole numbers and a claimed answer, and the nines will check it.</p>"; return; }
  const big = !r.match ? "The check says NO — the claim is certainly wrong"
   : r.correct ? "The check says PASS — and the claim is right"
   : "The check says PASS — but the claim is wrong anyway";
  showSteps(out, big, r);
 }
 ["cast-a", "cast-b", "cast-c"].forEach((id) => $(id).addEventListener("input", runCast));

 /* ---- Fractions: add, and scale a recipe ---- */
 function runFracAdd() {
  const r = fracAdd(int("fa-n1"), int("fa-d1"), int("fa-n2"), int("fa-d2"));
  const out = $("fa-result");
  if (!r.ok) { out.innerHTML = "<p>Whole numbers only, and denominators above zero — a cup can't be cut into zero pieces.</p>"; return; }
  showSteps(out, int("fa-n1") + "/" + int("fa-d1") + " + " + int("fa-n2") + "/" + int("fa-d2") + " = " + (r.den === 1 ? r.num : r.num + "/" + r.den), r);
 }
 ["fa-n1", "fa-d1", "fa-n2", "fa-d2"].forEach((id) => $(id).addEventListener("input", runFracAdd));
 let scaleK = { kn: 2, kd: 1 };
 function fracText(r) {
  if (r.den === 1) return String(r.num);
  if (r.num > r.den) return Math.floor(r.num / r.den) + " " + (r.num % r.den) + "/" + r.den;
  return r.num + "/" + r.den;
 }
 function runScale() {
  const r = fracScale(int("fs-n"), int("fs-d"), scaleK.kn, scaleK.kd);
  const out = $("fs-result");
  if (!r.ok) { out.innerHTML = "<p>Whole numbers only, and a denominator above zero.</p>"; return; }
  showSteps(out, int("fs-n") + "/" + int("fs-d") + " × " + (scaleK.kd === 1 ? scaleK.kn : scaleK.kn + "/" + scaleK.kd) + " = " + fracText(r), r);
 }
 ["fs-n", "fs-d"].forEach((id) => $(id).addEventListener("input", runScale));
 document.querySelectorAll(".scale-btn").forEach((b) => b.addEventListener("click", () => {
  scaleK = { kn: parseInt(b.dataset.kn, 10), kd: parseInt(b.dataset.kd, 10) };
  document.querySelectorAll(".scale-btn").forEach((x) => x.classList.toggle("active", x === b));
  runScale();
 }));

 /* ---- Percents: the tip and the discount ---- */
 function runTip() {
  const r = tipAndTotal(num("tip-bill"), num("tip-pct"));
  const out = $("tip-result");
  if (!r.ok) { out.innerHTML = "<p>Give me the bill and a tip percent, and I'll split it honestly.</p>"; return; }
  showSteps(out, fmt(r.pct) + "% tip on " + fmtMoney(r.bill) + " is " + fmtMoney(r.tip) + " — " + fmtMoney(r.total) + " all in", r);
 }
 ["tip-bill", "tip-pct"].forEach((id) => $(id).addEventListener("input", runTip));
 function runDisc() {
  const r = discountPrice(num("disc-price"), num("disc-pct"));
  const out = $("disc-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a price and a percent off (0 to 100).</p>"; return; }
  showSteps(out, fmt(r.pct) + "% off " + fmtMoney(r.price) + " — you pay " + fmtMoney(r.pay), r);
 }
 ["disc-price", "disc-pct"].forEach((id) => $(id).addEventListener("input", runDisc));

 /* ---- Pythagoras: the ladder, the screen, the shortcut ---- */
 let pyMode = "hyp";
 function runPy() {
  const a = num("py-a"), b = num("py-b");
  const r = pyMode === "hyp" ? pythagoras(a, b) : pythagorasLeg(a, b);
  const out = $("py-result");
  drawPy(pyMode === "hyp" ? a : b, pyMode === "hyp" ? b : (r.ok ? r.result : 0), pyMode === "hyp" ? (r.ok ? r.result : 0) : a);
  if (!r.ok) { out.innerHTML = "<p>" + (pyMode === "hyp" ? "Give me the two legs of a right triangle." : "The long side must be longer than the known leg — it is the longest side there is.") + "</p>"; return; }
  showSteps(out, (pyMode === "hyp" ? "The long side is " : "The missing leg is ") + fmt(r.result), r);
 }
 function drawPy(a, b, c) {
  const svg = $("py-svg"); svg.innerHTML = "";
  el("line", { x1: 30, y1: 190, x2: 690, y2: 190, stroke: "#557384", "stroke-width": 3 }, svg);
  el("polygon", { points: "150,190 150,50 560,190", fill: "#132334", stroke: "#c98d4e", "stroke-width": 3 }, svg);
  el("polyline", { points: "150,168 172,168 172,190", fill: "none", stroke: "#f5c369", "stroke-width": 3 }, svg);
  const t = (x, y, s, col) => { const n = el("text", { x, y, "text-anchor": "middle", fill: col || "#d9e5ed", "font-size": 16, "font-weight": 700 }, svg); n.textContent = s; };
  t(120, 125, "b = " + (b ? fmt(b) : "?"), "#7fdddb");
  t(355, 218, "a = " + (a ? fmt(a) : "?"), "#7fdddb");
  t(370, 105, "c = " + (c ? fmt(c) : "?"), "#f5c369");
 }
 document.querySelectorAll(".py-btn").forEach((btn) => btn.addEventListener("click", () => {
  pyMode = btn.dataset.mode;
  document.querySelectorAll(".py-btn").forEach((x) => x.classList.toggle("active", x === btn));
  $("py-a-label").textContent = pyMode === "hyp" ? "Leg a" : "Long side c (the hypotenuse)";
  $("py-b-label").textContent = pyMode === "hyp" ? "Leg b" : "Known leg";
  runPy();
 }));
 ["py-a", "py-b"].forEach((id) => $(id).addEventListener("input", runPy));

 /* ---- Averages: one line, many numbers ---- */
 function runAvg() {
  const parts = $("avg-input").value.split(/[,\s]+/).filter((s) => s.length).map(Number);
  const r = average(parts);
  const out = $("avg-result");
  if (!r.ok) { out.innerHTML = "<p>Type two or more numbers, separated by commas, and I'll average them with the working shown.</p>"; return; }
  showSteps(out, "The average is " + fmt(r.result), r);
 }
 $("avg-input").addEventListener("input", runAvg);

 /* ---- Huge and tiny: scientific notation, both directions ---- */
 function runSci() {
  const raw = $("sci-input").value.replace(/,/g, "").trim();
  const x = parseFloat(raw);
  const r = toScientific(x);
  const out = $("sci-result");
  if (!r.ok) { out.innerHTML = "<p>Type any number but zero — huge, tiny, or in between — and I'll write it the short way.</p>"; return; }
  showSteps(out, fmt(x) + " = " + r.mantissa + " × 10" + supInt(r.exponent), r);
 }
 $("sci-input").addEventListener("input", runSci);
 document.querySelectorAll(".sci-chip").forEach((b) => b.addEventListener("click", () => { $("sci-input").value = b.dataset.num; runSci(); }));
 function runUnSci() {
  const r = fromScientific(num("unsci-m"), int("unsci-e"));
  const out = $("unsci-result");
  if (!r.ok) { out.innerHTML = "<p>Give me a digit part and a whole-number exponent.</p>"; return; }
  showSteps(out, r.mantissa + " × 10" + supInt(r.exponent) + " = " + calcFormat(r.value), r);
 }
 ["unsci-m", "unsci-e"].forEach((id) => $(id).addEventListener("input", runUnSci));

 /* ---- The log bench: the full table, with proportional parts ---- */
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
  const r = logSheet(num("log-input"));
  const out = $("log-result");
  if (!r.ok) { out.innerHTML = "<p>Type a number above zero, and the full table will look it up.</p>"; return; }
  showSteps(out, "log₁₀(" + fmt(r.x) + ") ≈ " + r.result.toFixed(4) + " — characteristic + mantissa, interpolated", r);
 }
 $("log-input").addEventListener("input", runLog);

 /* ---- The calculator ---- */
 const calc = { entry: "0", acc: null, op: null, fresh: true, mode: "deg", error: false };
 const OPGLYPH = { "+": "+", "-": "−", "*": "×", "/": "÷", "pow": "^" };
 function calcShow() {
  $("calc-display").textContent = calc.entry;
  $("calc-tape").textContent = calc.acc !== null && calc.op ? calcFormat(calc.acc) + " " + OPGLYPH[calc.op] : "";
  $("calc-mode").textContent = calc.mode.toUpperCase();
 }
 function calcValue() { return parseFloat(calc.entry); }
 function calcFail() { calc.entry = "Error"; calc.acc = null; calc.op = null; calc.fresh = true; calc.error = true; calcShow(); }
 function calcDigit(d) {
  if (calc.error) { calc.entry = "0"; calc.error = false; calc.fresh = true; }
  if (calc.fresh) { calc.entry = d; calc.fresh = false; }
  else if (calc.entry === "0") calc.entry = d;
  else if (calc.entry.replace(/[-e]/g, "").length < 16) calc.entry += d;
  calcShow();
 }
 function calcBinary(op) {
  if (calc.error) return;
  const v = calcValue();
  if (!isFinite(v)) { calcFail(); return; }
  if (calc.acc !== null && calc.op && !calc.fresh) {
   const r = calcApply(calc.op, calc.acc, v);
   if (!r.ok || !isFinite(r.result)) { calcFail(); return; }
   calc.acc = r.result; calc.entry = calcFormat(r.result);
  } else calc.acc = v;
  calc.op = op; calc.fresh = true; calcShow();
 }
 function calcEquals() {
  if (calc.error || calc.acc === null || !calc.op) return;
  const r = calcApply(calc.op, calc.acc, calcValue());
  if (!r.ok || !isFinite(r.result)) { calcFail(); return; }
  calc.entry = calcFormat(r.result); calc.acc = null; calc.op = null; calc.fresh = true; calcShow();
 }
 function calcFn(fn) {
  if (calc.error) return;
  const r = calcFunc(fn, calcValue(), calc.mode);
  if (!r.ok || !isFinite(r.result)) { calcFail(); return; }
  calc.entry = calcFormat(r.result); calc.fresh = true; calcShow();
 }
 document.querySelectorAll(".calc-key").forEach((b) => b.addEventListener("click", () => {
  const k = b.dataset;
  if (k.digit !== undefined) calcDigit(k.digit);
  else if (k.op) calcBinary(k.op);
  else if (k.fn) calcFn(k.fn);
  else if (k.act === "dot") { if (calc.fresh) { calc.entry = "0."; calc.fresh = false; calc.error = false; } else if (!calc.entry.includes(".") && !calc.entry.includes("e")) calc.entry += "."; calcShow(); }
  else if (k.act === "ee") { if (!calc.entry.includes("e") && !calc.error) { calc.entry += "e"; calc.fresh = false; } calcShow(); }
  else if (k.act === "neg") { if (!calc.error) calc.entry = calc.entry.startsWith("-") ? calc.entry.slice(1) : (calc.entry === "0" ? "0" : "-" + calc.entry); calcShow(); }
  else if (k.act === "back") { if (!calc.fresh && !calc.error) { calc.entry = calc.entry.slice(0, -1); if (calc.entry === "" || calc.entry === "-") calc.entry = "0"; } calcShow(); }
  else if (k.act === "clear") { calc.entry = "0"; calc.acc = null; calc.op = null; calc.fresh = true; calc.error = false; calcShow(); }
  else if (k.act === "eq") calcEquals();
  else if (k.act === "pi") { calc.entry = calcFormat(Math.PI); calc.fresh = true; calc.error = false; calcShow(); }
  else if (k.act === "econst") { calc.entry = calcFormat(Math.E); calc.fresh = true; calc.error = false; calcShow(); }
  else if (k.act === "mode") { calc.mode = calc.mode === "deg" ? "rad" : "deg"; calcShow(); }
 }));
 calcShow();
 $("float-lie").textContent = String(0.1 + 0.2);

 /* ---- The printable sheet: built from the same rules the tests check ---- */
 (function buildSheet() {
  const t = timesTable(16);
  let times = "<table class='sheet-table'><thead><tr><th>×</th>";
  for (let c = 1; c <= 16; c++) times += "<th>" + c + "</th>";
  times += "</tr></thead><tbody>";
  t.grid.forEach((row, ri) => {
   times += "<tr><th>" + (ri + 1) + "</th>" + row.map((v, ci) => "<td" + (ci === ri ? " class='diag'" : "") + ">" + v + "</td>").join("") + "</tr>";
  });
  times += "</tbody></table>";
  $("sheet-times").innerHTML = times;
  let logs = "<table class='sheet-table'><thead><tr><th>n</th>";
  for (let h = 0; h <= 9; h++) logs += "<th>" + h + "</th>";
  logs += "</tr></thead><tbody>";
  for (let row = 0; row < 90; row++) {
   logs += "<tr><th>" + (1 + row / 10).toFixed(1) + "</th>";
   for (let h = 0; h <= 9; h++) logs += "<td>" + LOG_TABLE_FINE[row * 10 + h].toFixed(4).slice(2) + "</td>";
   logs += "</tr>";
  }
  logs += "</tbody></table>";
  $("sheet-logs").innerHTML = logs;
  const ex = logSheet(4.372);
  $("sheet-example").innerHTML = ex.steps.map((s) => "<li>" + esc(s) + "</li>").join("");
 })();
 $("print-btn").addEventListener("click", () => window.print());

 runNines(); runEleven(); runFive(); runDiv(); runCast();
 runFracAdd(); runScale(); runTip(); runDisc(); runPy(); runAvg();
 runSci(); runUnSci(); runLog();
})();
