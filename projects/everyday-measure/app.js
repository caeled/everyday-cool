"use strict";
/* Everyday Measure — page wiring. The rules live in measure.js. */
(function () {
 const $ = (id) => document.getElementById(id);
 const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

 /* ---- The prefix ladder ---- */
 let ladderFrom = "kilo";
 const stepsBox = $("ladder-steps");
 const toSel = $("ladder-to");
 for (const p of PREFIXES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "step-btn" + (p.prefix === ladderFrom ? " active" : "");
  b.dataset.prefix = p.prefix;
  b.style.marginLeft = (PREFIXES.indexOf(p) * 14) + "px";
  b.innerHTML = "<span class='step-name'></span><span class='step-factor'></span><span class='step-meaning'></span>";
  b.querySelector(".step-name").textContent = p.symbol ? p.prefix + " (" + p.symbol + ")" : "base unit";
  b.querySelector(".step-factor").textContent = "×10" + sup(p.power);
  b.querySelector(".step-meaning").textContent = p.meaning;
  b.addEventListener("click", () => {
   ladderFrom = p.prefix;
   stepsBox.querySelectorAll(".step-btn").forEach((x) => x.classList.toggle("active", x.dataset.prefix === ladderFrom));
   runLadder();
  });
  stepsBox.appendChild(b);
  const o = document.createElement("option");
  o.value = p.prefix;
  o.textContent = p.symbol ? p.prefix + " (" + p.symbol + ") — " + p.meaning : "base unit — " + p.meaning;
  toSel.appendChild(o);
 }
 toSel.value = "centi";
 function sup(n) { return String(n).replace("-", "⁻").replace(/0/g, "⁰").replace(/1/g, "¹").replace(/2/g, "²").replace(/3/g, "³").replace(/6/g, "⁶").replace(/9/g, "⁹"); }
 function runLadder() {
  const qty = parseFloat($("ladder-qty").value);
  const base = $("ladder-base").value;
  const r = rescale(qty, ladderFrom, toSel.value, base);
  const box = $("ladder-result");
  if (!r.ok) { box.innerHTML = "<p>Type a number, and the ladder will climb it.</p>"; return; }
  const toP = prefixByName(toSel.value);
  const toUnit = (toP.symbol ? toP.prefix : "") + base;
  box.innerHTML = "<p class='big-answer'>" + esc(fmt(qty)) + " " + esc((prefixByName(ladderFrom).symbol ? ladderFrom : "") + base) +
   "s = " + esc(fmt(r.result)) + " " + esc(toUnit) + "s</p><ol>" +
   r.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol>";
 }
 $("ladder-qty").addEventListener("input", runLadder);
 $("ladder-base").addEventListener("change", runLadder);
 toSel.addEventListener("change", runLadder);
 runLadder();

 /* ---- The converter benches ---- */
 function buildBench(kind, boxId) {
  const K = UNITS[kind], box = $(boxId);
  const opts = (sel) => K.units.map((u) => "<option value='" + u.id + "'" + (u.id === sel ? " selected" : "") + ">" + esc(u.name) + "</option>").join("");
  box.innerHTML = "<h3>" + esc(K.label) + "</h3>" +
   "<label class='bench-label' for='" + boxId + "-v'>How much?</label>" +
   "<input class='bench-input' id='" + boxId + "-v' type='number' step='any' value='" + K.sample + "'>" +
   "<label class='bench-label' for='" + boxId + "-f'>From</label><select class='bench-input' id='" + boxId + "-f'>" + opts(K.from) + "</select>" +
   "<label class='bench-label' for='" + boxId + "-t'>To</label><select class='bench-input' id='" + boxId + "-t'>" + opts(K.to) + "</select>" +
   "<div class='result' id='" + boxId + "-r' role='status'></div>";
  const run = () => {
   const v = parseFloat($(boxId + "-v").value);
   const r = convert(kind, v, $(boxId + "-f").value, $(boxId + "-t").value);
   const out = $(boxId + "-r");
   if (!r.ok) { out.innerHTML = "<p>Type a number, and the bench will convert it — with the working shown.</p>"; return; }
   const to = unitById(kind, $(boxId + "-t").value);
   out.innerHTML = "<p class='big-answer'>" + esc(fmt(v)) + " → " + esc(fmt(r.result)) + " " + esc(to.name) + "</p><ol>" +
    r.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol>";
  };
  ["v", "f", "t"].forEach((k) => $(boxId + "-" + k).addEventListener("input", run));
  run();
 }
 buildBench("length", "conv-length");
 buildBench("mass", "conv-mass");
 buildBench("volume", "conv-volume");

 /* ---- Temperature ---- */
 let tempDir = "f2c";
 function runTemp() {
  const v = parseFloat($("temp-v").value);
  const out = $("temp-r");
  const r = tempDir === "f2c" ? fToC(v) : cToF(v);
  if (!r.ok) { out.innerHTML = "<p>Type a temperature, and the bench will walk the formula.</p>"; return; }
  out.innerHTML = "<p class='big-answer'>" + esc(fmt(v)) + (tempDir === "f2c" ? " °F → " : " °C → ") +
   esc(fmt(r.result)) + (tempDir === "f2c" ? " °C" : " °F") + "</p><ol>" +
   r.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol>";
 }
 $("temp-v").addEventListener("input", runTemp);
 $("temp-f2c").addEventListener("click", () => { tempDir = "f2c"; $("temp-f2c").classList.add("active"); $("temp-c2f").classList.remove("active"); runTemp(); });
 $("temp-c2f").addEventListener("click", () => { tempDir = "c2f"; $("temp-c2f").classList.add("active"); $("temp-f2c").classList.remove("active"); runTemp(); });
 runTemp();

 /* ---- The comparison shelf: one thing, two readings, level beam ---- */
 const picker = $("thing-picker");
 let currentThing = "elephant";
 for (const t of THINGS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "combo-btn" + (t.id === currentThing ? " active" : "");
  b.dataset.id = t.id;
  b.innerHTML = "<span class='combo-name'></span>";
  b.querySelector(".combo-name").textContent = t.name;
  b.addEventListener("click", () => {
   currentThing = t.id;
   picker.querySelectorAll(".combo-btn").forEach((x) => x.classList.toggle("active", x.dataset.id === currentThing));
   drawThing();
  });
  picker.appendChild(b);
 }
 function drawThing() {
  const t = thingById(currentThing), r = thingReadings(t);
  $("compare-metric").textContent = r.metric;
  $("compare-us").textContent = r.us;
  $("compare-note").textContent = (t.approx ? "Approximate. " : "") + t.note;
  $("compare-title").textContent = t.name;
 }
 drawThing();
})();
