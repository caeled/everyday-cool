"use strict";
/* Everyday Electronics — page wiring. The rules live in elec.js. */
(function () {
 /* ---------- The circuit bench ---------- */
 const svg = document.getElementById("circuit-svg");
 const vSlider = document.getElementById("cb-volts");
 const rSlider = document.getElementById("cb-ohms");
 const vVal = document.getElementById("cb-volts-val");
 const rVal = document.getElementById("cb-ohms-val");
 const switchBtn = document.getElementById("cb-switch");
 const cbOut = document.getElementById("cb-result");
 let closed = true;

 function drawCircuit(st) {
  const b = st.ok ? st.brightness : 0;
  const glowOpacity = (b * 0.9).toFixed(2);
  const haloOpacity = (b * 0.35).toFixed(2);
  const blade = closed
   ? "<line class='wire-live' x1='272' y1='290' x2='172' y2='290'/>"
   : "<line class='wire-live' x1='272' y1='290' x2='196' y2='238'/>";
  const dots = st.ok && closed && st.current > 0
   ? [0, 1, 2, 3].map(k =>
      "<circle class='flow-dot' r='5'><animateMotion dur='" + Math.max(1.2, 7 / st.current) +
      "s' begin='-" + (k * Math.max(1.2, 7 / st.current) / 4) +
      "s' repeatCount='indefinite' path='M110,290 L110,70 L530,70 L530,290 Z'/></circle>").join("")
   : "";
  svg.innerHTML =
   "<rect class='bench-board' x='30' y='20' width='580' height='330' rx='16'/>" +
   /* wires */
   "<path class='wire' d='M110,130 L110,70 L530,70 L530,290 L272,290'/>" +
   "<path class='wire' d='M170,290 L110,290 L110,230'/>" +
   blade +
   "<circle class='contact' cx='272' cy='290' r='6'/><circle class='contact' cx='170' cy='290' r='6'/>" +
   /* battery: long plate = +, short thick plate = − */
   "<line class='plate' x1='88' y1='150' x2='132' y2='150'/>" +
   "<line class='plate-thick' x1='98' y1='168' x2='122' y2='168'/>" +
   "<line class='wire' x1='110' y1='150' x2='110' y2='130'/>" +
   "<line class='wire' x1='110' y1='168' x2='110' y2='230'/>" +
   "<text class='svg-label' x='66' y='146'>+</text>" +
   "<text class='svg-label' x='64' y='176'>−</text>" +
   "<text class='svg-label' x='110' y='205' text-anchor='middle'>battery</text>" +
   "<text class='svg-small' id='svg-volts' x='110' y='226' text-anchor='middle'></text>" +
   /* bulb */
   "<circle class='bulb-halo' cx='400' cy='70' r='46' opacity='" + haloOpacity + "'/>" +
   "<circle class='bulb-glass' cx='400' cy='70' r='27'/>" +
   "<circle class='bulb-glow' cx='400' cy='70' r='24' opacity='" + glowOpacity + "'/>" +
   "<path class='filament' d='M386,84 L394,58 L402,84 L410,58 L414,84'/>" +
   "<text class='svg-label' x='400' y='128' text-anchor='middle'>bulb</text>" +
   "<text class='svg-small' id='svg-ohms' x='400' y='148' text-anchor='middle'></text>" +
   /* switch label */
   "<text class='svg-label' x='221' y='322' text-anchor='middle'>switch</text>" +
   dots;
  document.getElementById("svg-volts").textContent = vSlider.value + " V";
  document.getElementById("svg-ohms").textContent = rSlider.value + " Ω";
  svg.setAttribute("aria-label", closed
   ? "A simple circuit, switch closed: a " + vSlider.value + " volt battery drives current through a " + rSlider.value + " ohm bulb, which glows."
   : "A simple circuit with the switch open: the loop is broken and the bulb is dark.");
 }

 function runCircuit() {
  vVal.textContent = vSlider.value + " volts";
  rVal.textContent = rSlider.value + " Ω";
  switchBtn.textContent = closed ? "Open the switch" : "Close the switch";
  const st = circuitState(vSlider.value, rSlider.value, closed);
  drawCircuit(st);
  if (!st.ok) { cbOut.textContent = st.error; return; }
  if (!st.closed) { cbOut.textContent = st.steps[0]; return; }
  cbOut.innerHTML = "<p><strong>Current: " + st.current + " amps · Power: " + st.power + " watts.</strong></p>" +
   st.steps.map(s => "<p>" + s + "</p>").join("");
 }
 vSlider.addEventListener("input", runCircuit);
 rSlider.addEventListener("input", runCircuit);
 switchBtn.addEventListener("click", () => { closed = !closed; runCircuit(); });
 runCircuit();

 /* ---------- The Ohm's law bench ---------- */
 const ohmOut = document.getElementById("ohm-result");
 document.getElementById("ohm-go").addEventListener("click", () => {
  const r = ohmSolve({
   v: document.getElementById("ohm-v").value,
   i: document.getElementById("ohm-i").value,
   r: document.getElementById("ohm-r").value
  });
  if (!r.ok) { ohmOut.textContent = r.error; return; }
  const names = { v: "Voltage", i: "Current", r: "Resistance" };
  const units = { v: "volts", i: "amps", r: "ohms" };
  ohmOut.innerHTML = "<p><strong>" + names[r.solved] + ": " + r[r.solved] + " " + units[r.solved] + "</strong> — the one you left empty.</p>" +
   "<ol>" + r.steps.map(s => "<li>" + s + "</li>").join("") + "</ol>" +
   "<p class='fine'>The full set: " + r.v + " volts, " + r.i + " amps, " + r.r + " ohms. Check it backwards: " +
   r.i + " × " + r.r + " = " + Math.round(r.i * r.r * 100) / 100 + ".</p>";
 });

 /* ---------- The LED resistor bench ---------- */
 const ledVf = document.getElementById("led-vf");
 const ledOut = document.getElementById("led-result");
 const presetBox = document.getElementById("led-presets");
 for (const led of LED_TYPES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "led-btn";
  b.dataset.id = led.id;
  b.innerHTML = "<span class='led-dot led-" + led.id + "'></span><span></span>";
  b.querySelector("span:last-child").textContent = led.name + " · " + led.vf + " V";
  b.addEventListener("click", () => {
   ledVf.value = led.vf;
   for (const x of presetBox.querySelectorAll(".led-btn")) x.classList.toggle("active", x === b);
  });
  presetBox.appendChild(b);
 }
 document.getElementById("led-go").addEventListener("click", () => {
  const r = ledResistor(document.getElementById("led-vs").value, ledVf.value, document.getElementById("led-ma").value);
  if (!r.ok) { ledOut.textContent = r.error; return; }
  ledOut.innerHTML = "<p><strong>Use a " + (r.e12Text || r.exactOhms + " Ω") + " resistor</strong> in series with the LED" +
   (r.e12Ohms !== r.exactOhms ? " (the exact sum says " + r.exactOhms + " Ω; " + r.e12Text + " is the nearest standard value at or above it)" : "") + ".</p>" +
   "<ol>" + r.steps.map(s => "<li>" + s + "</li>").join("") + "</ol>";
 });
})();

/* ---------- The breadboard ---------- */
(function () {
 const svg = document.getElementById("bb-svg");
 if (!svg) return;
 const NS = "http://www.w3.org/2000/svg";
 const hint = document.getElementById("bb-hint");
 const result = document.getElementById("bb-result");
 const probeOut = document.getElementById("bb-probe");
 const removeBtn = document.getElementById("bb-remove");
 function el(name, attrs, parent) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

 /* Geometry: rails outside, a–e, the groove, f–j, rails again. */
 const RAILX = { "L+": 40, "L-": 66, "R-": 414, "R+": 440 };
 const COLX = {}; "abcdefghij".split("").forEach((c, i) => { COLX[c] = i < 5 ? 104 + i * 26 : 238 + (i - 5) * 26; });
 const rowY = r => 56 + (r - 1) * 16.5;
 function holePos(h) { return h.rail ? { x: RAILX[h.rail], y: rowY(h.row) } : { x: COLX[h.col], y: rowY(h.row) }; }
 function holeKey(h) { return h.rail ? h.rail + "@" + h.row : h.row + h.col; }
 function parseKey(k) { if (k.indexOf("@") >= 0) { const p = k.split("@"); return { rail: p[0], row: +p[1] }; } const m = /^(\d+)([a-j])$/.exec(k); return { row: +m[1], col: m[2] }; }
 function netOf(key) { return bbNet(parseKey(key)); }
 const ALL_HOLES = [];
 for (let r = 1; r <= BB_ROWS; r++) { for (const rail of ["L+", "L-", "R-", "R+"]) ALL_HOLES.push({ rail, row: r }); for (const c of "abcdefghij") ALL_HOLES.push({ row: r, col: c }); }

 /* State */
 let parts = [];            /* {id, kind, holes:[keys], ...settings} */
 let engineParts = [];      /* parallel to parts, fed to createBreadboard */
 let sim = null;
 let nextId = 1;
 let tool = null;           /* armed palette kind, or "probe" */
 let firstKey = null;
 let probeKey = null;
 let selectedId = -1;
 const occupied = new Map(); /* hole key -> part id */
 const glowEls = new Map();  /* led part id -> glow circle element */

 function legsOf(p) {
  if (p.kind === "transistor") { const a = parseKey(p.holes[0]); return [p.holes[0], (a.row + 1) + a.col, (a.row + 2) + a.col]; }
  return p.holes;
 }
 function toEngine(p) {
  const n = k => netOf(k);
  switch (p.kind) {
   case "battery": return { kind: "battery", plus: n(p.holes[0]), minus: n(p.holes[1]), volts: p.volts };
   case "ac": return { kind: "ac", plus: n(p.holes[0]), minus: n(p.holes[1]), amp: p.amp, freq: p.freq };
   case "resistor": return { kind: "resistor", a: n(p.holes[0]), b: n(p.holes[1]), ohms: p.ohms };
   case "capacitor": return { kind: "capacitor", a: n(p.holes[0]), b: n(p.holes[1]), farads: p.farads };
   case "led": return { kind: "led", anode: n(p.holes[0]), cathode: n(p.holes[1]), color: p.color };
   case "switch": return { kind: "switch", a: n(p.holes[0]), b: n(p.holes[1]), closed: p.closed };
   case "button": return { kind: "button", a: n(p.holes[0]), b: n(p.holes[1]) };
   case "wire": return { kind: "wire", a: n(p.holes[0]), b: n(p.holes[1]) };
   case "transistor": { const a = parseKey(p.holes[0]); return { kind: "transistor", c: bbNet({ row: a.row, col: a.col }), b: bbNet({ row: a.row + 1, col: a.col }), e: bbNet({ row: a.row + 2, col: a.col }) }; }
  }
  return null;
 }
 function rebuildSim() {
  engineParts = parts.map(toEngine);
  sim = parts.length ? createBreadboard(engineParts) : null;
  if (sim) sim.step(0.05); /* settle fast operating points; keep the RC bend watchable */
 }
 function syncOccupied() {
  occupied.clear();
  for (const p of parts) for (const k of legsOf(p)) occupied.set(k, p.id);
 }
 function partIndex(id) { return parts.findIndex(p => p.id === id); }

 /* ---------- Drawing ---------- */
 function partLabel(p) {
  switch (p.kind) {
   case "battery": return p.volts + " V battery";
   case "ac": return "AC " + p.amp + " Vpk · " + p.freq + " Hz";
   case "resistor": return formatOhms(p.ohms);
   case "capacitor": return (p.farads * 1e6) + " µF";
   case "led": return p.color + " LED";
   case "transistor": return "2N2222";
   case "switch": return p.closed ? "switch · closed" : "switch · open";
   case "button": return "pushbutton";
   case "wire": return "wire";
  }
  return p.kind;
 }
 function drawPart(p) {
  const g = el("g", { "class": "bb-part-g" + (p.id === selectedId ? " sel" : ""), "data-pid": p.id }, svg);
  const legs = legsOf(p).map(k => ({ key: k, pos: holePos(parseKey(k)) }));
  const mid = { x: (legs[0].pos.x + legs[legs.length - 1].pos.x) / 2, y: (legs[0].pos.y + legs[legs.length - 1].pos.y) / 2 };
  if (p.id === selectedId) {
   const xs = legs.map(l => l.pos.x), ys = legs.map(l => l.pos.y);
   el("rect", { "class": "bb-sel-ring", x: Math.min(...xs) - 13, y: Math.min(...ys) - 13, width: Math.max(...xs) - Math.min(...xs) + 26, height: Math.max(...ys) - Math.min(...ys) + 26, rx: 9 }, g);
  }
  if (p.kind === "wire") {
   el("path", { "class": "bb-wire", d: "M" + legs[0].pos.x + "," + legs[0].pos.y + " L" + legs[1].pos.x + "," + legs[1].pos.y }, g);
   return;
  }
  for (const l of legs) el("line", { "class": "bb-leg", x1: l.pos.x, y1: l.pos.y, x2: mid.x, y2: mid.y }, g);
  const label = (x, y, text, cls) => { const t = el("text", { "class": cls || "bb-value", x, y, "text-anchor": "middle" }, g); t.textContent = text; };
  if (p.kind === "resistor") {
   el("rect", { "class": "bb-body-r", x: mid.x - 17, y: mid.y - 8, width: 34, height: 16, rx: 7 }, g);
   label(mid.x, mid.y + 21, partLabel(p));
  } else if (p.kind === "capacitor") {
   el("rect", { "class": "bb-body-c", x: mid.x - 13, y: mid.y - 12, width: 26, height: 24, rx: 5 }, g);
   label(mid.x, mid.y + 24, partLabel(p));
  } else if (p.kind === "led") {
   const rep = sim ? sim.partReport(partIndex(p.id)) : null;
   const glow = el("circle", { "class": "bb-led-glow", cx: mid.x, cy: mid.y, r: 17, opacity: 0 }, g);
   glowEls.set(p.id, glow);
   const body = el("circle", { cx: mid.x, cy: mid.y, r: 10, fill: rep && rep.popped ? "#3a3f45" : ({ red: "#e5484d", yellow: "#f5d90a", green: "#46a758" })[p.color], stroke: "#d9e5ed", "stroke-width": 1.5 }, g);
   body.setAttribute("data-led", p.id);
   if (rep && rep.popped) { el("path", { d: "M" + (mid.x - 6) + "," + (mid.y - 6) + " L" + (mid.x + 6) + "," + (mid.y + 6) + " M" + (mid.x + 6) + "," + (mid.y - 6) + " L" + (mid.x - 6) + "," + (mid.y + 6), stroke: "#e5484d", "stroke-width": 2 }, g); }
   const a = legs[0].pos; const t = el("text", { "class": "bb-label", x: a.x + 9, y: a.y - 6 }, g); t.textContent = "+";
   label(mid.x, mid.y + 23, partLabel(p));
  } else if (p.kind === "battery") {
   el("rect", { "class": "bb-body-batt", x: mid.x - 24, y: mid.y - 13, width: 48, height: 26, rx: 5 }, g);
   label(mid.x, mid.y + 4, p.volts + " V");
   const t = el("text", { "class": "bb-label", x: legs[0].pos.x + 9, y: legs[0].pos.y - 6 }, g); t.textContent = "+";
  } else if (p.kind === "ac") {
   el("circle", { "class": "bb-body-ac", cx: mid.x, cy: mid.y, r: 14 }, g);
   el("path", { d: "M" + (mid.x - 8) + "," + mid.y + " q4,-9 8,0 q4,9 8,0", fill: "none", stroke: "#7fdddb", "stroke-width": 2 }, g);
   label(mid.x, mid.y + 26, partLabel(p));
   const t = el("text", { "class": "bb-label", x: legs[0].pos.x + 9, y: legs[0].pos.y - 6 }, g); t.textContent = "+";
  } else if (p.kind === "transistor") {
   el("path", { "class": "bb-body-tr", d: "M" + (mid.x - 15) + "," + (mid.y - 16) + " a17,17 0 0 1 30,0 Z" }, g);
   const names = ["C", "B", "E"];
   legs.forEach((l, i) => { const t = el("text", { "class": "bb-label", x: l.pos.x + 10, y: l.pos.y + 3 }, g); t.textContent = names[i]; });
   label(mid.x, mid.y - 24, partLabel(p));
  } else if (p.kind === "switch") {
   const a = legs[0].pos, b = legs[1].pos;
   el("circle", { cx: a.x, cy: a.y, r: 3.5, fill: "#f5c369" }, g);
   el("circle", { cx: b.x, cy: b.y, r: 3.5, fill: "#f5c369" }, g);
   if (p.closed) el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#f5c369", "stroke-width": 3.5, "stroke-linecap": "round" }, g);
   else el("line", { x1: a.x, y1: a.y, x2: (a.x + b.x) / 2, y2: Math.min(a.y, b.y) - 15, stroke: "#f5c369", "stroke-width": 3.5, "stroke-linecap": "round" }, g);
   label(mid.x, mid.y + 22, partLabel(p));
  } else if (p.kind === "button") {
   el("rect", { "class": "bb-body-sw", x: mid.x - 11, y: mid.y - 11, width: 22, height: 22, rx: 5 }, g);
   el("circle", { cx: mid.x, cy: mid.y, r: 5.5, fill: "#f5c369" }, g);
   label(mid.x, mid.y + 24, partLabel(p));
  }
 }
 function render() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  glowEls.clear();
  el("rect", { x: 8, y: 8, width: 464, height: 554, rx: 18, fill: "#132a3d", stroke: "#304354" }, svg);
  for (const rail of ["L+", "R+"]) el("line", { "class": "bb-rail-plus", x1: RAILX[rail], y1: rowY(1), x2: RAILX[rail], y2: rowY(BB_ROWS) }, svg);
  for (const rail of ["L-", "R-"]) el("line", { "class": "bb-rail-minus", x1: RAILX[rail], y1: rowY(1), x2: RAILX[rail], y2: rowY(BB_ROWS) }, svg);
  el("line", { "class": "bb-groove", x1: (COLX.e + COLX.f) / 2, y1: rowY(1) - 8, x2: (COLX.e + COLX.f) / 2, y2: rowY(BB_ROWS) + 8 }, svg);
  for (let r = 5; r <= BB_ROWS; r += 5) {
   const t1 = el("text", { "class": "bb-rownum", x: COLX.a - 12, y: rowY(r) + 3, "text-anchor": "end" }, svg); t1.textContent = r;
   const t2 = el("text", { "class": "bb-rownum", x: COLX.j + 12, y: rowY(r) + 3 }, svg); t2.textContent = r;
  }
  const signs = [["L+", 24], ["L-", 82], ["R-", 398], ["R+", 458]];
  for (const [rail, x] of signs) { const t = el("text", { x, y: 34, "text-anchor": "middle", fill: rail.indexOf("+") > 0 ? "#e5484d" : "#3e8ef7", "font-weight": 700, "font-size": 15 }, svg); t.textContent = rail.slice(1); }
  const cols = el("text", { "class": "bb-rownum", x: (COLX.a + COLX.j) / 2, y: 34, "text-anchor": "middle" }, svg); cols.textContent = "a b c d e        f g h i j";
  for (const h of ALL_HOLES) {
   const key = holeKey(h), pos = holePos(h);
   const c = el("circle", { "class": "bb-hole" + (key === probeKey ? " bb-hole-probe" : "") + (key === firstKey ? " bb-hole-armed" : ""), cx: pos.x, cy: pos.y, r: h.rail ? 4.6 : 5.2, "data-key": key }, svg);
   if (occupied.has(key)) c.setAttribute("fill", "#3d5a72");
  }
  for (const p of parts) if (p.kind === "wire") drawPart(p);
  for (const p of parts) if (p.kind !== "wire") drawPart(p);
  svg.setAttribute("aria-label", "A solderless breadboard with " + parts.length + " parts plugged in. " + (parts.length ? parts.map(partLabel).join(", ") + "." : "The board is empty."));
 }
 function refresh() { syncOccupied(); rebuildSim(); render(); updateReadout(true); }

 /* ---------- Readouts ---------- */
 function fmtV(v) { return (Math.round(v * 100) / 100) + " V"; }
 function fmtA(a) {
  const mA = a * 1000;
  if (!isFinite(mA)) return "far too much current";
  if (Math.abs(mA) >= 100) return "about " + Math.round(mA) + " milliamps";
  if (Math.abs(mA) >= 1) return "about " + (Math.round(mA * 10) / 10) + " milliamps";
  const uA = a * 1e6;
  if (Math.abs(uA) >= 1) return "about " + Math.round(uA) + " microamps";
  return "no current";
 }
 function describePart(p) {
  const i = partIndex(p.id); if (i < 0 || !sim) return "";
  const rep = sim.partReport(i);
  switch (p.kind) {
   case "battery": return "<strong>" + partLabel(p) + ".</strong> Delivering " + fmtA(rep.current) + " to the board.";
   case "ac": return "<strong>" + partLabel(p) + ".</strong> Right now it sits at " + fmtV(sim.nodeVoltage(netOf(p.holes[0])) - sim.nodeVoltage(netOf(p.holes[1]))) + ", swinging " + p.amp + " V each way, " + p.freq + " times a second.";
   case "resistor": return "<strong>" + partLabel(p) + " resistor.</strong> " + fmtV(Math.abs(rep.va - rep.vb)) + " across it, " + fmtA(rep.current) + " through it — volts ÷ ohms, as always.";
   case "capacitor": return "<strong>" + partLabel(p) + " capacitor.</strong> Charged to " + fmtV(Math.abs(rep.charge)) + " right now. Watch the probe trace bend as it fills and empties — fast at first, then slower: that bend is the exponential, and it is the whole personality of a capacitor.";
   case "led":
    if (rep.popped) return "<strong>" + partLabel(p) + " — popped.</strong> It took more than its roughly 30-milliamp limit for more than a blink and died, the way real ones do. The LED resistor bench in section 02 exists to prevent exactly this funeral. Remove it and try again — with a resistor this time.";
    if (rep.over) return "<strong>" + partLabel(p) + " — dying.</strong> It is passing " + fmtA(rep.current) + ", well past its limit. It will pop in a blink unless the loop changes.";
    if (rep.lit) return "<strong>" + partLabel(p) + " — lit.</strong> Drawing " + fmtA(rep.current) + ", comfortably under its limit" + (rep.current > 0.02 ? " — though near the top of the comfortable range" : "") + ".";
    return "<strong>" + partLabel(p) + " — dark.</strong> No current is passing. Either the loop is open somewhere, or the LED is in backwards: its + leg (marked on the board) must face the battery's + side of the loop.";
   case "transistor":
    if (rep.mode === "off") return "<strong>Transistor (2N2222) — off.</strong> The base is getting nothing past its 0.7 V turn-on, so the collector-emitter path is an open switch. A transistor with no base current is just a gap.";
    if (rep.mode === "sat") return "<strong>Transistor (2N2222) — saturated.</strong> The base is asking for more collector current than the collector's resistor can supply, so the transistor is fully on, pressed against its 0.2 V floor — a closed switch, no longer amplifying.";
    return "<strong>Transistor (2N2222) — on and amplifying.</strong> Base current " + fmtA(rep.ib) + "; collector current " + fmtA(rep.ic) + " — the trickle at the base is commanding a flow about " + Math.round(rep.ic / Math.max(rep.ib, 1e-9)) + "× bigger through the collector. That ratio is β, and it is the whole invention.";
   case "switch": return "<strong>Switch — " + (p.closed ? "closed" : "open") + ".</strong> Click it to flip it. " + (p.closed ? "The loop through it is complete." : "The loop through it is broken here.");
   case "button": return "<strong>Pushbutton.</strong> Press and hold it (mouse or finger down on it) to close its contact; let go and it opens. It is the discharge button in the RC preset.";
   case "wire": return "<strong>Jumper wire.</strong> It joins " + p.holes[0] + " to " + p.holes[1] + " — the two holes, and everything tied to them, are one connection now.";
  }
  return "";
 }
 function updateReadout(force) {
  if (!sim || !parts.length) { result.innerHTML = "The board is empty. Load a preset, or pick a part and start plugging legs into holes."; probeOut.textContent = probeKey ? "Probe is on hole " + probeKey + ", but the board is empty." : "No probe attached yet."; return; }
  if (sim.isShorted()) {
   result.innerHTML = "<strong>⚠ Short circuit.</strong> Something joins the supply's + straight to its − with nothing in between to resist: the current has run away past 2 amps. On a real bench this is the moment wires get hot. Find the path that skips every part — a stray wire, a closed switch across the rails — and give the current some honest work to do.";
  } else if (selectedId >= 0 && partIndex(selectedId) >= 0) {
   result.innerHTML = describePart(parts[partIndex(selectedId)]);
  } else {
   const lit = parts.filter(p => p.kind === "led" && sim.partReport(partIndex(p.id)).lit).length;
   const popped = parts.filter(p => p.kind === "led" && sim.partReport(partIndex(p.id)).popped).length;
   result.innerHTML = "The circuit is live." + (lit ? " " + lit + " LED" + (lit > 1 ? "s are" : " is") + " lit." : "") + (popped ? " " + popped + " LED" + (popped > 1 ? "s have" : " has") + " popped — click " + (popped > 1 ? "them" : "it") + " for the story." : "") + " Click any part to read its numbers.";
  }
  if (probeKey) {
   const v = sim.nodeVoltage(netOf(probeKey));
   probeOut.innerHTML = "Probe on hole <strong>" + probeKey + "</strong>: <strong>" + fmtV(v) + "</strong> right now.";
  } else probeOut.textContent = "No probe attached yet — arm the probe tool and click any hole.";
 }

 /* ---------- Scope ---------- */
 const scope = document.getElementById("bb-scope");
 const sctx = scope.getContext("2d");
 const samples = [];
 function drawScope() {
  const w = scope.width, h = scope.height, midY = h / 2;
  sctx.clearRect(0, 0, w, h);
  sctx.strokeStyle = "#22384c"; sctx.lineWidth = 1;
  for (const frac of [0.25, 0.5, 0.75]) { sctx.beginPath(); sctx.moveTo(0, h * frac); sctx.lineTo(w, h * frac); sctx.stroke(); }
  sctx.fillStyle = "#5f7d90"; sctx.font = "11px system-ui";
  sctx.fillText("+12 V", 6, 14); sctx.fillText("0", 6, midY - 5); sctx.fillText("−12 V", 6, h - 6);
  if (samples.length < 2) return;
  sctx.strokeStyle = "#79d9c9"; sctx.lineWidth = 2; sctx.beginPath();
  samples.forEach((v, i) => {
   const x = i / (239) * w, y = midY - Math.max(-12.5, Math.min(12.5, v)) / 12.5 * (midY - 8);
   if (i === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
  });
  sctx.stroke();
 }

 /* ---------- Sim loop ---------- */
 let lastT = performance.now(), frame = 0;
 setInterval(() => {
  const now = performance.now();
  let steps = Math.round((now - lastT) / 1000 / BB_DT);
  lastT = now;
  steps = Math.max(0, Math.min(steps, 400));
  if (sim && steps) sim.step(steps);
  for (const [id, glow] of glowEls) {
   const i = partIndex(id); if (i < 0) continue;
   const rep = sim ? sim.partReport(i) : null;
   glow.setAttribute("opacity", rep ? (rep.brightness * 0.85).toFixed(2) : 0);
  }
  if (sim && probeKey) { samples.push(sim.nodeVoltage(netOf(probeKey))); if (samples.length > 240) samples.shift(); }
  else if (samples.length) samples.push(0);
  drawScope();
  if (++frame % 8 === 0) updateReadout(false);
 }, 25);

 /* ---------- Placement & tools ---------- */
 const KIND_NAMES = { battery: "battery (+ leg first, then −)", ac: "AC source (+ leg first, then −)", resistor: "resistor", capacitor: "capacitor", led: "LED (+ leg first — the long leg, toward +)", switch: "switch", button: "pushbutton", wire: "jumper wire" };
 function currentSettings(kind) {
  switch (kind) {
   case "battery": return { volts: +document.getElementById("bb-batt-v").value };
   case "ac": return { amp: +document.getElementById("bb-ac-amp").value, freq: +document.getElementById("bb-ac-freq").value };
   case "resistor": return { ohms: +document.getElementById("bb-r-val").value };
   case "capacitor": return { farads: +document.getElementById("bb-c-val").value * 1e-6 };
   case "led": return { color: document.getElementById("bb-led-color").value };
   case "switch": return { closed: true };
  }
  return {};
 }
 function armTool(kind) {
  tool = kind; firstKey = null;
  for (const b of document.querySelectorAll(".bb-part[data-kind]")) b.classList.toggle("active", b.dataset.kind === kind);
  if (!kind) { hint.textContent = "Pick a part above, drag it onto the board, or load a preset."; render(); return; }
  hint.textContent = kind === "probe" ? "Click any hole to clip the oscilloscope probe to it."
   : kind === "transistor" ? "Click a hole: the transistor's collector lands there, with base and emitter in the two rows below it, same column."
   : "Click the hole for the " + KIND_NAMES[kind] + "'s first leg.";
  render();
 }
 for (const b of document.querySelectorAll(".bb-part[data-kind]")) {
  b.addEventListener("click", () => armTool(tool === b.dataset.kind ? null : b.dataset.kind));
  b.addEventListener("pointerdown", ev => {
   const kind = b.dataset.kind;
   const startX = ev.clientX, startY = ev.clientY;
   let ghost = null;
   const move = mv => {
    if (!ghost && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 8) {
     ghost = document.createElement("div");
     ghost.textContent = b.textContent;
     ghost.style.cssText = "position:fixed;z-index:60;pointer-events:none;background:#f5c369;color:#082322;font:700 13px system-ui;padding:7px 11px;border-radius:7px;opacity:.92";
     document.body.appendChild(ghost);
    }
    if (ghost) { ghost.style.left = (mv.clientX + 10) + "px"; ghost.style.top = (mv.clientY + 10) + "px"; }
   };
   const up = uv => {
    document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
    if (ghost) { ghost.remove(); const key = holeFromClient(uv.clientX, uv.clientY); if (key) { armTool(kind); handleHole(key); } }
   };
   document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
  });
 }
 function holeFromClient(cx, cy) {
  const r = svg.getBoundingClientRect();
  const vx = (cx - r.left) / r.width * 480, vy = (cy - r.top) / r.height * 570;
  let best = null, bestD = 24;
  for (const h of ALL_HOLES) { const p = holePos(h), d = Math.hypot(p.x - vx, p.y - vy); if (d < bestD) { bestD = d; best = holeKey(h); } }
  return best;
 }
 function canPlace(kind, keys) {
  if (keys.some(k => occupied.has(k))) { hint.textContent = "That hole already has a leg in it — pick an empty one."; return false; }
  return true;
 }
 function placePart(kind, keys) {
  const p = Object.assign({ id: nextId++, kind, holes: keys }, currentSettings(kind));
  parts.push(p); selectedId = p.id; removeBtn.disabled = false;
  firstKey = null;
  hint.textContent = partLabel(p) + " placed. " + (kind === "transistor" ? "Collector, base, emitter run down from where you clicked." : "Pick another part, or click parts on the board to read them.");
  refresh();
 }
 function handleHole(key) {
  if (tool === "probe") { probeKey = key; samples.length = 0; armTool(null); hint.textContent = "Probe clipped to hole " + key + " — watch its trace."; render(); updateReadout(true); return; }
  if (!tool) {
   const pid = occupied.get(key);
   if (pid !== undefined) selectPart(pid);
   return;
  }
  if (tool === "transistor") {
   const h = parseKey(key);
   if (h.rail) { hint.textContent = "The transistor needs a row hole, not a rail — its legs must land in three different rows."; return; }
   if (h.row > BB_ROWS - 2) { hint.textContent = "Too close to the bottom edge — the transistor needs two more rows below for base and emitter."; return; }
   const keys = [key, (h.row + 1) + h.col, (h.row + 2) + h.col];
   if (canPlace(tool, keys)) placePart("transistor", [key]);
   return;
  }
  if (!firstKey) { firstKey = key; hint.textContent = "First leg in " + key + ". Now click the hole for the other leg."; render(); return; }
  if (key === firstKey) { firstKey = null; hint.textContent = "Placement cancelled — click a first hole again."; render(); return; }
  if (canPlace(tool, [firstKey, key])) placePart(tool, [firstKey, key]);
 }
 function selectPart(id) {
  selectedId = id; removeBtn.disabled = id < 0;
  render(); updateReadout(true);
 }
 svg.addEventListener("click", ev => {
  let node = ev.target;
  while (node && node !== svg) {
   if (node.dataset && node.dataset.key) { handleHole(node.dataset.key); return; }
   if (node.dataset && node.dataset.pid) {
    const id = +node.dataset.pid, i = partIndex(id);
    if (i >= 0 && parts[i].kind === "switch" && !tool) { parts[i].closed = !parts[i].closed; sim && sim.setClosed(i, parts[i].closed); }
    selectPart(id); return;
   }
   node = node.parentNode;
  }
  if (!tool) selectPart(-1);
 });
 svg.addEventListener("pointerdown", ev => {
  let node = ev.target;
  while (node && node !== svg) {
   if (node.dataset && node.dataset.pid) {
    const i = partIndex(+node.dataset.pid);
    if (i >= 0 && parts[i].kind === "button" && sim) sim.setPressed(i, true);
    return;
   }
   node = node.parentNode;
  }
 });
 window.addEventListener("pointerup", () => { if (sim) parts.forEach((p, i) => { if (p.kind === "button") sim.setPressed(i, false); }); });
 removeBtn.addEventListener("click", () => {
  const i = partIndex(selectedId); if (i < 0) return;
  parts.splice(i, 1); selectedId = -1; removeBtn.disabled = true;
  hint.textContent = "Part removed. The hole is free again.";
  refresh();
 });
 document.getElementById("bb-clear").addEventListener("click", () => {
  parts = []; selectedId = -1; probeKey = null; firstKey = null; samples.length = 0; removeBtn.disabled = true;
  hint.textContent = "Board cleared. A fresh sheet of plastic — load a preset or start plugging.";
  refresh();
 });
 /* Live variant controls: changing a value updates the selected part of
    that kind (or the next one you place). */
 function bindVariant(id, kind, apply) {
  document.getElementById(id).addEventListener("change", ev => {
   const i = partIndex(selectedId);
   if (i >= 0 && parts[i].kind === kind) { apply(parts[i], engineParts[i], ev.target); render(); updateReadout(true); }
  });
 }
 bindVariant("bb-batt-v", "battery", (p, e, t) => { p.volts = e.volts = +t.value; });
 bindVariant("bb-r-val", "resistor", (p, e, t) => { p.ohms = e.ohms = +t.value; });
 bindVariant("bb-c-val", "capacitor", (p, e, t) => { p.farads = e.farads = +t.value * 1e-6; });
 bindVariant("bb-led-color", "led", (p, e, t) => { p.color = e.color = t.value; });
 document.getElementById("bb-ac-amp").addEventListener("input", ev => {
  document.getElementById("bb-ac-amp-val").textContent = ev.target.value + " V";
  const i = partIndex(selectedId);
  if (i >= 0 && parts[i].kind === "ac") { parts[i].amp = engineParts[i].amp = +ev.target.value; }
 });
 document.getElementById("bb-ac-freq").addEventListener("input", ev => {
  document.getElementById("bb-ac-freq-val").textContent = ev.target.value + " Hz";
  const i = partIndex(selectedId);
  if (i >= 0 && parts[i].kind === "ac") { parts[i].freq = engineParts[i].freq = +ev.target.value; }
 });

 /* ---------- Presets ---------- */
 const R = (rail, row) => rail + "@" + row, H = (row, col) => row + col;
 const PRESETS = {
  starter() {
   return { probe: null, parts: [
    { kind: "battery", holes: [R("L+", 3), R("L-", 3)], volts: 5 },
    { kind: "wire", holes: [R("L+", 8), H(8, "a")] },
    { kind: "switch", holes: [H(8, "c"), H(12, "c")], closed: true },
    { kind: "resistor", holes: [H(12, "a"), H(16, "a")], ohms: 220 },
    { kind: "led", holes: [H(16, "c"), H(20, "c")], color: "red" },
    { kind: "wire", holes: [H(20, "a"), R("L-", 20)] }
   ] };
  },
  rc() {
   return { probe: H(16, "b"), parts: [
    { kind: "battery", holes: [R("L+", 3), R("L-", 3)], volts: 9 },
    { kind: "wire", holes: [R("L+", 8), H(8, "a")] },
    { kind: "switch", holes: [H(8, "c"), H(12, "c")], closed: true },
    { kind: "resistor", holes: [H(12, "a"), H(16, "a")], ohms: 10000 },
    { kind: "capacitor", holes: [H(16, "c"), H(20, "c")], farads: 100e-6 },
    { kind: "wire", holes: [H(20, "a"), R("L-", 20)] },
    { kind: "button", holes: [H(12, "e"), H(20, "e")] }
   ] };
  },
  amp() {
   return { probe: H(10, "h"), parts: [
    { kind: "battery", holes: [R("R+", 3), R("R-", 3)], volts: 9 },
    { kind: "ac", holes: [H(26, "f"), R("R-", 26)], amp: 0.2, freq: 60 },
    { kind: "capacitor", holes: [H(26, "h"), H(22, "h")], farads: 10e-6 },
    { kind: "wire", holes: [H(22, "f"), H(15, "f")] },
    { kind: "resistor", holes: [R("R+", 15), H(15, "j")], ohms: 10000 },
    { kind: "resistor", holes: [H(15, "g"), R("R-", 15)], ohms: 1000 },
    { kind: "transistor", holes: [H(14, "h")] },
    { kind: "resistor", holes: [H(14, "j"), R("R+", 14)], ohms: 1000 },
    { kind: "resistor", holes: [H(16, "j"), R("R-", 16)], ohms: 100 },
    { kind: "capacitor", holes: [H(14, "f"), H(10, "f")], farads: 10e-6 }
   ] };
  }
 };
 for (const b of document.querySelectorAll("[data-preset]")) {
  b.addEventListener("click", () => {
   const preset = PRESETS[b.dataset.preset]();
   parts = preset.parts.map(p => Object.assign({ id: nextId++ }, p));
   probeKey = preset.probe; samples.length = 0;
   selectedId = -1; removeBtn.disabled = true; armTool(null);
   hint.textContent = b.dataset.preset === "amp"
    ? "The amplifier is loaded and running: the probe sits on its output. Compare it with the whisper at the base (row 15, right side) — small in, big out."
    : b.dataset.preset === "rc"
     ? "Charging: watch the probe trace bend toward 9 V. Flip the switch open and hold the pushbutton down to discharge through the resistor — same bend, backwards."
     : "A working circuit: battery, switch, resistor, LED. Click the switch to break the loop; click the LED to read its current.";
   refresh();
  });
 }
 /* Start with the starter circuit on the board, so the bench is alive
    before anything is clicked. */
 parts = PRESETS.starter().parts.map(p => Object.assign({ id: nextId++ }, p));
 refresh();
})();

/* ---------- The crystal bench ---------- */
(function () {
 const capSlider = document.getElementById("cr-cap");
 if (!capSlider) return;
 const capVal = document.getElementById("cr-cap-val");
 const out = document.getElementById("cr-readout");
 const meter = document.getElementById("cr-meter");
 const needle = document.getElementById("cr-needle");
 const ampBox = document.getElementById("cr-amp");
 function run() {
  const cap = +capSlider.value * 1e-12;
  const freq = crystalFreq(CR_L, cap);
  capVal.textContent = capSlider.value + " pF";
  needle.style.left = ((freq - 530e3) / (1700e3 - 530e3) * 100) + "%";
  let best = null, bestLevel = 0;
  for (const st of CR_STATIONS) { const lv = crystalLevel(freq, st.freq); if (lv > bestLevel) { bestLevel = lv; best = st; } }
  const amplified = ampBox.checked;
  const eff = amplified ? Math.min(1, bestLevel * 3) : bestLevel;
  meter.style.width = (eff * 100).toFixed(0) + "%";
  const stationLine = bestLevel > 0.15 ? "<strong>" + best.name + "</strong> (" + Math.round(best.freq / 1000) + " kHz) is the strongest thing here. " : "";
  out.innerHTML = "<p><strong>Tuned to " + Math.round(freq / 1000) + " kHz</strong> — capacitor " + capSlider.value + " pF against the 250 µH coil. " + stationLine + crystalHearing(bestLevel, amplified) + "</p>" +
   "<p class='fine'>Signal level: " + Math.round(eff * 100) + "%" + (amplified ? " at amplified ears (the raw station is at " + Math.round(bestLevel * 100) + "% — the amplifier multiplies, it does not select)" : " at the earpiece") + ". Turn the capacitor slowly near a station: a real crystal set rewards patience exactly this much.</p>";
 }
 capSlider.addEventListener("input", run);
 ampBox.addEventListener("change", run);
 run();
})();
