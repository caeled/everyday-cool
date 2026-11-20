"use strict";
/* Everyday Computing — page wiring. The rules live in computing.js. */
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

 /* ---- The binary bench: eight switches ---- */
 let bits = numberToBits(42).bits.slice();
 function renderBits() {
  const row = $("bits-row");
  row.innerHTML = "";
  bits.forEach((b, i) => {
   const btn = document.createElement("button");
   btn.type = "button";
   btn.className = "bit-btn" + (b ? " on" : "");
   btn.innerHTML = "<span class='place'>" + BIT_PLACES[i] + "</span><span class='bitval'>" + b + "</span>";
   btn.setAttribute("aria-label", "Bit worth " + BIT_PLACES[i] + ", currently " + b);
   btn.addEventListener("click", () => { bits[i] = bits[i] ? 0 : 1; syncFromBits(); });
   row.appendChild(btn);
  });
 }
 function syncFromBits() {
  renderBits();
  const r = bitsToNumber(bits);
  $("dec-input").value = r.value;
  showSteps($("bits-result"), bits.join("") + " = " + r.value, r);
 }
 function syncFromDecimal() {
  const n = parseInt($("dec-input").value, 10);
  const r = numberToBits(n);
  if (!r.ok) { $("bits-result").innerHTML = "<p>Give me a whole number from 0 to 255 — eight switches can hold no more, and no less than nothing.</p>"; return; }
  bits = r.bits.slice();
  renderBits();
  const back = bitsToNumber(bits);
  showSteps($("bits-result"), n + " = " + bits.join(""), { steps: r.steps.concat(back.steps.slice(2)) });
 }
 $("dec-input").addEventListener("input", syncFromDecimal);
 document.querySelectorAll(".dec-chip").forEach((b) => b.addEventListener("click", () => { $("dec-input").value = b.dataset.n; syncFromDecimal(); }));
 syncFromBits();

 /* ---- The gates bench ---- */
 let gateType = "AND", gateA = 0, gateB = 0;
 function renderGateTable() {
  const t = truthTable(gateType);
  const head = t.rows[0].ins.length === 1 ? "<th>IN</th>" : "<th>A</th><th>B</th>";
  let html = "<table class='data-table'><thead><tr>" + head + "<th>OUT</th></tr></thead><tbody>";
  for (const row of t.rows) {
   const now = row.ins.every((v, i) => v === (i === 0 ? gateA : gateB)) && row.ins.length === GATES[gateType].inputs;
   html += "<tr" + (now ? " class='now'" : "") + ">" + row.ins.map((v) => "<td>" + v + "</td>").join("") + "<td>" + row.out + "</td></tr>";
  }
  $("gate-table").innerHTML = html + "</tbody></table>";
 }
 function runGate() {
  const g = GATES[gateType];
  document.querySelectorAll(".gate-btn").forEach((b) => b.classList.toggle("active", b.dataset.type === gateType));
  $("gate-a").textContent = "A · " + gateA;
  $("gate-a").classList.toggle("on", gateA === 1);
  $("gate-b").style.display = g.inputs === 1 ? "none" : "";
  $("gate-b").textContent = "B · " + gateB;
  $("gate-b").classList.toggle("on", gateB === 1);
  const ins = g.inputs === 1 ? [gateA] : [gateA, gateB];
  const r = gateEval(gateType, ins);
  $("gate-lamp").className = "lamp" + (r.out ? " on" : "");
  renderGateTable();
  showSteps($("gate-result"), gateType + " — " + g.plain + ": the lamp is " + (r.out ? "ON" : "OFF"), { steps: [
   g.rule,
   "Right now: " + ins.map((v, i) => (i === 0 ? "A" : "B") + " = " + v).join(", ") + " → OUT = " + r.out + ". The highlighted row of the table is the one you are standing on.",
   "That is the gate's entire character. Everything else in this room — the adder, the net, the builder — is these six rules, wired together."] });
 }
 document.querySelectorAll(".gate-btn").forEach((b) => b.addEventListener("click", () => { gateType = b.dataset.type; runGate(); }));
 $("gate-a").addEventListener("click", () => { gateA = gateA ? 0 : 1; runGate(); });
 $("gate-b").addEventListener("click", () => { gateB = gateB ? 0 : 1; runGate(); });
 runGate();

 /* ---- The half adder bench ---- */
 let addA = 0, addB = 0;
 function runAdder() {
  $("add-a").textContent = "A · " + addA;
  $("add-a").classList.toggle("on", addA === 1);
  $("add-b").textContent = "B · " + addB;
  $("add-b").classList.toggle("on", addB === 1);
  const r = halfAdder(addA, addB);
  $("sum-lamp").className = "lamp" + (r.sum ? " on" : "");
  $("carry-lamp").className = "lamp" + (r.carry ? " on" : "");
  showSteps($("add-result"), addA + " + " + addB + " = " + r.carry + "" + r.sum + " (binary)", r);
 }
 $("add-a").addEventListener("click", () => { addA = addA ? 0 : 1; runAdder(); });
 $("add-b").addEventListener("click", () => { addB = addB ? 0 : 1; runAdder(); });
 runAdder();

 /* ---- The toy net bench ---- */
 let net = [0, 0, 0];
 const WIRE_ON = "#f5c369", WIRE_OFF = "#3d5a73";
 function wire(svg, pts, v) {
  el("polyline", { points: pts, fill: "none", stroke: v ? WIRE_ON : WIRE_OFF, "stroke-width": v ? 5 : 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
 }
 function gateBox(svg, x, y, label, v) {
  el("rect", { x: x - 46, y: y - 24, width: 92, height: 48, rx: 9, fill: "#132334", stroke: v ? WIRE_ON : "#557384", "stroke-width": v ? 3 : 1.5 }, svg);
  const t = el("text", { x, y: y + 6, "text-anchor": "middle", fill: "#d9e5ed", "font-size": 16, "font-weight": 800 }, svg);
  t.textContent = label;
 }
 function drawNet(r) {
  const svg = $("net-svg"); svg.innerHTML = "";
  el("rect", { x: 0, y: 0, width: 720, height: 300, fill: "#0d2036" }, svg);
  const [a, b, c] = net;
  // wires first, under the boxes
  wire(svg, "96,52 200,52 200,96 234,96", a);            // first bit down to the ends-AND
  wire(svg, "96,252 170,252 170,120 234,120", c);        // last bit up to the ends-AND
  wire(svg, "96,150 234,150", b);                        // middle bit straight to the NOT
  wire(svg, "326,108 420,108 420,138 454,138", r.bothEnds); // ends-AND to the final AND
  wire(svg, "326,150 390,150 390,162 454,162", r.notB);     // NOT to the final AND
  wire(svg, "546,150 610,150", r.out);                   // final AND to the lamp
  // inputs
  const names = ["first", "middle", "last"];
  [a, b, c].forEach((v, i) => {
   const y = [52, 150, 252][i];
   el("circle", { cx: 78, cy: y, r: 17, fill: v ? WIRE_ON : "#132334", stroke: "#557384", "stroke-width": 2 }, svg);
   const t = el("text", { x: 78, y: y + 6, "text-anchor": "middle", fill: v ? "#082322" : "#d9e5ed", "font-size": 16, "font-weight": 800 }, svg);
   t.textContent = v;
   const n = el("text", { x: 78, y: y - 26, "text-anchor": "middle", fill: "#9db4c0", "font-size": 12.5 }, svg);
   n.textContent = names[i];
  });
  gateBox(svg, 280, 108, "AND", r.bothEnds);
  gateBox(svg, 280, 150, "NOT", r.notB);
  gateBox(svg, 500, 150, "AND", r.out);
  const ends = el("text", { x: 280, y: 66, "text-anchor": "middle", fill: "#9db4c0", "font-size": 12.5 }, svg);
  ends.textContent = "the two ends";
  el("circle", { cx: 636, cy: 150, r: 24, fill: r.out ? WIRE_ON : "#132334", stroke: "#557384", "stroke-width": 2 }, svg);
  const lt = el("text", { x: 636, y: 196, "text-anchor": "middle", fill: "#9db4c0", "font-size": 12.5 }, svg);
  lt.textContent = "the lamp";
  const cap = el("text", { x: 360, y: 288, "text-anchor": "middle", fill: "#9db4c0", "font-size": 13.5 }, svg);
  cap.textContent = "Wired to love one pattern: 1 · 0 · 1 — ends lit, middle quiet.";
 }
 function renderNetTable(r) {
  let html = "<table class='data-table'><thead><tr><th>Pattern</th><th>Matches</th><th>The lamp</th></tr></thead><tbody>";
  for (let n = 0; n < 8; n++) {
   const p = [(n >> 2) & 1, (n >> 1) & 1, n & 1];
   const d = netDetail(p[0], p[1], p[2]);
   const now = p.every((v, i) => v === net[i]);
   html += "<tr" + (now ? " class='now'" : "") + "><td>" + p.join(" · ") + "</td><td>" + d.matches + " of 3</td><td>" + (d.out ? "LIGHTS" : "dark") + "</td></tr>";
  }
  $("net-table").innerHTML = html + "</tbody></table>";
 }
 function runNet() {
  const r = netDetail(net[0], net[1], net[2]);
  drawNet(r);
  renderNetTable(r);
  document.querySelectorAll(".net-btn").forEach((b) => {
   const i = Number(b.dataset.bit);
   b.textContent = ["First", "Middle", "Last"][i] + " bit · " + net[i];
   b.classList.toggle("active", net[i] === 1);
  });
  showSteps($("net-result"), net.join(" · ") + (r.out ? " — the pattern! The lamp lights." : " — not the pattern. The lamp stays dark."), r);
 }
 document.querySelectorAll(".net-btn").forEach((b) => b.addEventListener("click", () => { const i = Number(b.dataset.bit); net[i] = net[i] ? 0 : 1; runNet(); }));
 runNet();

 /* ---- The logic builder ---- */
 let circuit = newCircuit();
 let switches = { A: 0, B: 0, C: 0, D: 0 };
 let hand = null;
 const srcLabel = (src) => !src ? null : src.switch ? "Switch " + src.switch : "Gate " + src.gate.slice(1) + " · " + findGate(circuit, src.gate).type + " OUT";
 const sameHand = (src) => hand && ((hand.switch && hand.switch === src.switch) || (hand.gate && hand.gate === src.gate));
 function setStatus(msg) { $("builder-status").innerHTML = "<p>" + esc(msg) + "</p>"; }
 function pickUp(src) {
  if (sameHand(src)) { hand = null; setStatus("Wire put down. Tap any output to pick one up, or tap a filled slot to unplug it."); }
  else { hand = src.switch ? { switch: src.switch } : { gate: src.gate }; setStatus("Wire in hand: " + srcLabel(hand) + ". Now tap an input slot — a gate's IN, or a lamp — to plug it in."); }
  renderBuilder(false);
 }
 function slotTap(target, current) {
  if (hand) {
   const r = connect(circuit, target, hand);
   if (r.ok) setStatus("Plugged " + srcLabel(hand) + " in. The board re-evaluated itself — watch the lamps.");
   hand = null;
  } else if (current) {
   disconnect(circuit, target);
   setStatus("Unplugged. That input now reads 0, the way a loose wire does.");
  } else {
   setStatus("That slot is empty. Pick a wire up first — tap a switch's OUT or a gate's OUT — then tap the slot.");
  }
  renderBuilder(false);
 }
 function renderBuilder(announce) {
  const values = evaluateCircuit(circuit, switches);
  // switches
  const srow = $("bsw-row"); srow.innerHTML = "";
  for (const s of BUILDER_SWITCHES) {
   const card = document.createElement("div");
   card.className = "gate-card switch-card";
   const tog = document.createElement("button");
   tog.type = "button"; tog.className = "switch-btn" + (switches[s] ? " on" : "");
   tog.textContent = "Switch " + s + " · " + switches[s];
   tog.addEventListener("click", () => { switches[s] = switches[s] ? 0 : 1; renderBuilder(false); });
   const out = document.createElement("button");
   out.type = "button"; out.className = "out-btn" + (sameHand({ switch: s }) ? " armed" : "");
   out.textContent = "OUT · " + switches[s] + " — tap to carry";
   out.addEventListener("click", () => pickUp({ switch: s }));
   card.appendChild(tog); card.appendChild(out);
   srow.appendChild(card);
  }
  // gates
  const board = $("board"); board.innerHTML = "";
  if (!circuit.gates.length) board.innerHTML = "<p class='fine'>The board is empty. Place a gate from the parts bin, or load the XOR trick to see a finished circuit.</p>";
  for (const g of circuit.gates) {
   const card = document.createElement("div");
   card.className = "gate-card";
   const head = document.createElement("h4");
   head.innerHTML = "<span>Gate " + g.id.slice(1) + " · " + esc(g.type) + "</span>";
   const rm = document.createElement("button");
   rm.type = "button"; rm.className = "rm-btn"; rm.textContent = "×"; rm.title = "Remove this gate";
   rm.addEventListener("click", () => { removeGate(circuit, g.id); if (hand && hand.gate === g.id) hand = null; setStatus("Gate removed — everything it fed is unwired now."); renderBuilder(false); });
   head.appendChild(rm);
   card.appendChild(head);
   g.ins.forEach((src, slot) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "slot-btn";
    b.textContent = "IN " + (slot + 1) + " — " + (src ? srcLabel(src) : "tap to wire");
    b.addEventListener("click", () => slotTap({ gate: g.id, slot }, src));
    card.appendChild(b);
   });
   const out = document.createElement("button");
   out.type = "button"; out.className = "out-btn" + (sameHand({ gate: g.id }) ? " armed" : "");
   const v = values.gates[g.id];
   out.textContent = "OUT · " + (v === null ? "?" : v) + " — tap to carry";
   out.addEventListener("click", () => pickUp({ gate: g.id }));
   card.appendChild(out);
   board.appendChild(card);
  }
  // lamps
  const lrow = $("lamps"); lrow.innerHTML = "";
  for (const l of circuit.lamps) {
   const card = document.createElement("div");
   card.className = "gate-card lamp-card";
   const v = values.lamps[l.id];
   const lamp = document.createElement("span");
   lamp.className = "lamp" + (v === 1 ? " on" : "");
   lamp.textContent = v === null && l.src ? "?" : "";
   const slot = document.createElement("button");
   slot.type = "button"; slot.className = "slot-btn";
   slot.textContent = "Lamp " + l.id.slice(1) + " — " + (l.src ? srcLabel(l.src) : "tap to wire");
   slot.addEventListener("click", () => slotTap({ lamp: l.id }, l.src));
   card.appendChild(lamp); card.appendChild(slot);
   lrow.appendChild(card);
  }
  // result
  const lampText = circuit.lamps.length
   ? circuit.lamps.map((l) => { const v = values.lamps[l.id]; return "Lamp " + l.id.slice(1) + ": " + (v === null ? (l.src ? "no steady answer — its wiring loops" : "unwired") : v === 1 ? "ON" : "off"); }).join(" · ")
   : "No lamps yet — add one and wire it to a gate, and the board has something to say.";
  const loopNote = Object.values(values.gates).some((v) => v === null) ? " A gate is showing ? — its wiring loops back on itself, and a loop has no steady answer." : "";
  $("builder-result").innerHTML = "<p class='big-answer'>" + esc(lampText) + "</p><p>" + esc(loopNote.trim() || "Every output on the board is settled. Flip a switch and watch the wiring think.") + "</p>";
  if (announce) setStatus("The board is ready. Tap an output to pick up its wire; tap an input slot to plug it in.");
 }
 document.querySelectorAll(".pal-btn").forEach((b) => b.addEventListener("click", () => {
  const id = addGate(circuit, b.dataset.type);
  setStatus(id ? "Placed a " + b.dataset.type + " gate (Gate " + id.slice(1) + "). Wire its inputs, then carry its OUT onward." : "The board is full — twelve gates is the limit this room teaches with.");
  renderBuilder(false);
 }));
 $("add-lamp").addEventListener("click", () => {
  const id = addLamp(circuit);
  setStatus(id ? "Lamp " + id.slice(1) + " added. Wire it to any output and it will report that wire's value." : "Four lamps is the board's limit.");
  renderBuilder(false);
 });
 $("preset-xor").addEventListener("click", () => {
  circuit = xorCircuit(); hand = null;
  setStatus("The XOR trick is built: Gate 1 ORs the switches, Gate 2 ANDs them, Gate 3 NOTs the AND, and Gate 4 ANDs the OR with the NOT. Flip switches A and B — the lamp lights exactly when they differ.");
  renderBuilder(false);
 });
 $("clear-board").addEventListener("click", () => {
  circuit = newCircuit(); hand = null;
  setStatus("Board cleared. A bare board, four switches, and the parts bin — wire something.");
  renderBuilder(false);
 });
 renderBuilder(true);

 /* ---- The sizes bench ---- */
 const fmt = (v) => {
  if (v === 0) return "0";
  if (Number.isInteger(v)) return v.toLocaleString("en-US");
  return parseFloat(v.toPrecision(6)).toLocaleString("en-US", { maximumFractionDigits: 6 });
 };
 function runSizes() {
  const count = parseFloat($("size-input").value);
  const unit = sizeUnit($("size-unit").value);
  const r = bitsFor(count, $("size-unit").value);
  const out = $("size-result");
  if (!r.ok || !unit) { out.innerHTML = "<p>Give me an amount — 1, 500, 2.5 — and pick its unit, and I'll read it on both ladders.</p>"; return; }
  const t = sizeTable(r.bits);
  let html = "<p class='big-answer'>" + esc(fmt(count)) + " " + esc(unit.name) + " = " + esc(fmt(r.bits)) + " bits</p><table class='data-table'><thead><tr><th>Unit</th><th>How much that is</th><th>The rung</th></tr></thead><tbody>";
  for (const row of t.rows) html += "<tr" + (row.id === unit.id ? " class='now'" : "") + "><td>" + esc(row.name) + "</td><td>" + esc(fmt(row.value)) + "</td><td class='note-cell'>" + esc(row.note) + "</td></tr>";
  out.innerHTML = html + "</tbody></table>";
 }
 SIZE_UNITS.forEach((u) => {
  const o = document.createElement("option");
  o.value = u.id; o.textContent = u.name;
  $("size-unit").appendChild(o);
 });
 $("size-unit").value = "mebibyte";
 ["size-input", "size-unit"].forEach((id) => $(id).addEventListener("input", runSizes));
 runSizes();

 /* ---- The sorting bench ---- */
 const SCRAMBLES = [[5, 2, 4, 1, 3], [3, 5, 1, 4, 2], [4, 1, 5, 2, 3]];
 let sortArr = SCRAMBLES[0].slice(), scrambleIdx = 0, sortPasses = 0;
 function renderSort(msg, steps) {
  const row = $("sort-cards"); row.innerHTML = "";
  for (const v of sortArr) {
   const d = document.createElement("div");
   d.className = "scard"; d.textContent = v;
   row.appendChild(d);
  }
  if (msg) showSteps($("sort-result"), msg, { steps: steps || [] });
 }
 function runPass() {
  const p = bubblePass(sortArr);
  sortArr = p.result; sortPasses++;
  renderSort("Pass " + sortPasses + ": " + p.swaps + (p.swaps === 1 ? " swap" : " swaps") + ", " + p.comparisons + " comparisons", p.steps.concat([p.swaps === 0 ? "A silent pass means the row is sorted — that is the algorithm's stopping rule." : "The biggest unsorted card has bubbled one step nearer the end."]));
 }
 $("sort-pass").addEventListener("click", runPass);
 $("sort-all").addEventListener("click", () => {
  const r = bubbleSort(sortArr);
  sortArr = r.result; sortPasses += r.passes;
  renderSort("Sorted: " + sortArr.join(", "), ["The full run took " + r.passes + (r.passes === 1 ? " pass" : " passes") + ", " + r.swaps + " swaps, and " + r.comparisons + " comparisons — every one of them checkable, which is why this slow sort teaches first.", "A faster algorithm would take shortcuts you cannot watch. This one hides nothing."]);
 });
 $("sort-shuffle").addEventListener("click", () => {
  scrambleIdx = (scrambleIdx + 1) % SCRAMBLES.length;
  sortArr = SCRAMBLES[scrambleIdx].slice(); sortPasses = 0;
  renderSort("A fresh row: " + sortArr.join(", "), ["Five cards, dealt in a fixed scramble so you can run the same race twice and compare. Run a pass and watch the biggest card drift right."]);
 });
 $("sort-reset").addEventListener("click", () => {
  scrambleIdx = 0; sortArr = SCRAMBLES[0].slice(); sortPasses = 0;
  renderSort("Back to the starting row: " + sortArr.join(", "), ["The row the bench opened with. One pass at a time, or sort it all and read the bill."]);
 });
 renderSort("The row: 5, 2, 4, 1, 3", ["Nothing is sorted yet. Run one pass and narrate it with the bench: compare the first pair, swap if they are out of order, step right, repeat."]);
})();
