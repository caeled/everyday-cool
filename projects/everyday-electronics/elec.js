"use strict";
/* Everyday Electronics — the rules, with no DOM code, so Node can check them.
   Everything here is Ohm's law and the LED resistor rule, worked the way the
   page shows it: V = I × R, I = V ÷ R, R = V ÷ I, P = V × I.
   The LED bench uses the standard typical forward voltages printed in LED
   datasheets and hobby references (red ≈ 2.0 V, blue/white ≈ 3.2 V). */

function round2(n) { return Math.round(n * 100) / 100; }

/* The circuit bench: a battery, a switch, and a bulb.
   Brightness is scaled so about 3 watts reads as fully bright — the size of
   a small torch bulb — and the page says that is a picture scale, not a
   measurement. */
const FULL_BRIGHT_WATTS = 3;
function circuitState(volts, ohms, closed) {
 const v = Number(volts), r = Number(ohms);
 if (!Number.isFinite(v) || v <= 0) return { ok: false, error: "The battery voltage needs to be a number bigger than zero." };
 if (!Number.isFinite(r) || r <= 0) return { ok: false, error: "The resistance needs to be a number bigger than zero — a real bulb always resists the flow at least a little." };
 if (!closed) return { ok: true, closed: false, volts: v, ohms: r, current: 0, power: 0, brightness: 0,
  steps: ["The switch is open, so the loop is broken. No complete loop, no flow: the current is 0 amps and the bulb stays dark."] };
 const current = v / r, power = v * current;
 return { ok: true, closed: true, volts: v, ohms: r, current: round2(current), power: round2(power),
  brightness: Math.min(1, power / FULL_BRIGHT_WATTS),
  steps: [
   "Current = volts ÷ resistance = " + v + " ÷ " + r + " = " + round2(current) + " amps.",
   "Power = volts × current = " + v + " × " + round2(current) + " = " + round2(power) + " watts — that power is what the bulb turns into light and heat."
  ] };
}

/* The Ohm's law bench: give any two of V, I, R; get the third, worked. */
function ohmSolve(given) {
 const names = { v: "voltage (volts)", i: "current (amps)", r: "resistance (ohms)" };
 const vals = {};
 for (const k of ["v", "i", "r"]) {
  const raw = given ? given[k] : null;
  if (raw === null || raw === undefined || raw === "") continue;
  const n = Number(raw);
  if (!Number.isFinite(n)) return { ok: false, error: "The " + names[k] + " needs to be a number." };
  if (n <= 0) return { ok: false, error: "The " + names[k] + " needs to be bigger than zero for this bench — zero or less would mean no battery, no flow, or a perfect wire, and the sums stop making sense." };
  vals[k] = n;
 }
 const keys = Object.keys(vals);
 if (keys.length !== 2) return { ok: false, error: "Fill in exactly two of the three boxes — the bench works out the one you leave empty." };
 let solved, steps;
 if (!("v" in vals)) { vals.v = round2(vals.i * vals.r); solved = "v";
  steps = ["Voltage = current × resistance.", vals.i + " × " + vals.r + " = " + vals.v + ", so the voltage is " + vals.v + " volts."]; }
 else if (!("i" in vals)) { vals.i = round2(vals.v / vals.r); solved = "i";
  steps = ["Current = voltage ÷ resistance.", vals.v + " ÷ " + vals.r + " = " + vals.i + ", so the current is " + vals.i + " amps."]; }
 else { vals.r = round2(vals.v / vals.i); solved = "r";
  steps = ["Resistance = voltage ÷ current.", vals.v + " ÷ " + vals.i + " = " + vals.r + ", so the resistance is " + vals.r + " ohms."]; }
 return { ok: true, v: vals.v, i: vals.i, r: vals.r, solved, steps };
}

/* Standard resistor values: the E12 series — twelve values per decade,
   the ones actually sold in shops. */
const E12_BASE = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
function nearestE12Up(value) {
 const v = Number(value);
 if (!Number.isFinite(v) || v <= 0) return null;
 for (let decade = 0; decade <= 6; decade++) {
  const scale = Math.pow(10, decade);
  for (const base of E12_BASE) {
   const candidate = round2(base * scale);
   if (candidate >= v - 1e-9) return candidate;
  }
 }
 return null; /* bigger than the largest E12 value in range */
}
function formatOhms(ohms) {
 if (ohms >= 1000) { const k = round2(ohms / 1000); return k + " kΩ"; }
 return round2(ohms) + " Ω";
}

/* The LED resistor bench. An LED must never meet a battery without a
   resistor to limit the current; the resistor drops the leftover voltage.
   Typical forward voltages (datasheet-typical for ordinary indicator LEDs). */
const LED_TYPES = [
 { id: "red", name: "Red", vf: 2.0 },
 { id: "yellow", name: "Yellow", vf: 2.1 },
 { id: "green", name: "Green", vf: 2.2 },
 { id: "blue", name: "Blue", vf: 3.2 },
 { id: "white", name: "White", vf: 3.2 }
];
function ledById(id) { return LED_TYPES.find(l => l.id === id) || null; }

function ledResistor(supplyVolts, forwardVolts, currentMA) {
 const vs = Number(supplyVolts), vf = Number(forwardVolts), ma = Number(currentMA);
 if (!Number.isFinite(vs) || vs <= 0) return { ok: false, error: "The supply voltage needs to be a number bigger than zero — that is the battery or power pack feeding the LED." };
 if (!Number.isFinite(vf) || vf <= 0) return { ok: false, error: "The LED's forward voltage needs to be a number bigger than zero — pick a colour above, or type the value from the LED's packet." };
 if (!Number.isFinite(ma) || ma <= 0) return { ok: false, error: "The current needs to be a number bigger than zero — 20 mA is the usual safe brightness for an ordinary LED." };
 if (vs <= vf) return { ok: false, error: "The supply (" + vs + " V) is not bigger than the LED's forward voltage (" + vf + " V), so there is no leftover voltage for a resistor to drop — the LED would not light. Use a bigger supply, or an LED colour with a lower forward voltage." };
 const amps = ma / 1000;
 const drop = round2(vs - vf);
 const exact = drop / amps;
 const e12 = nearestE12Up(exact);
 const resistorPowerMW = Math.round(drop * amps * 1000);
 return { ok: true, supplyVolts: vs, forwardVolts: vf, currentMA: ma, dropVolts: drop,
  exactOhms: round2(exact), e12Ohms: e12, e12Text: e12 === null ? null : formatOhms(e12),
  resistorPowerMW,
  steps: [
   "The LED keeps " + vf + " V for itself. The resistor must drop the rest: " + vs + " − " + vf + " = " + drop + " V.",
   "Resistor = volts to drop ÷ current in amps = " + drop + " ÷ " + amps + " = " + round2(exact) + " Ω.",
   "Resistors come in standard values, so round UP to the next standard (E12) value: " + (e12 === null ? "bigger than this bench covers" : formatOhms(e12)) + ". Rounding up means a touch less current than planned — the LED is slightly gentler, never overloaded.",
   "The resistor turns the dropped power into a little heat: " + drop + " V × " + amps + " A = " + resistorPowerMW + " milliwatts — an ordinary quarter-watt (250 mW) resistor handles that easily."
  ] };
}

/* ================= The breadboard =================
   A solderless breadboard, modelled the way the plastic one is wired:
   each row's left five holes (a–e) are one net, each row's right five
   (f–j) are another, the centre gap separates them, and each power rail
   is one long net. Parts join nets; wires merge them. The simulation is
   a fixed-timestep transient solve (modified nodal analysis, backward
   Euler for capacitors), iterated each step so the LED and the
   transistor can settle. The model is deliberately simple and the page
   says so: ideal wires and parts, an LED that is a forward voltage plus
   a small resistance when lit, and a transistor that is a 0.7 V
   base-emitter drop plus a fixed current gain of 100 — no saturation
   curves, no temperature effects. */

const BB_ROWS = 30;
const BB_DT = 1 / 4800;              /* the page's timestep: 4800 steps a second */
const BB_LED_VF = { red: 1.8, yellow: 2.0, green: 2.1 };
const BB_LED_RD = 5;                 /* ohms of slope resistance in a lit LED */
const BB_LED_MAX_MA = 30;            /* past this, sustained, the LED pops */
const BB_POP_SECONDS = 0.05;         /* how long overcurrent takes to kill it */
const BB_BETA = 100;                 /* transistor current gain, fixed */
const BB_VBE = 0.7;                  /* base-emitter drop when on, volts */
const BB_RBE = 25;                   /* base-emitter slope resistance, ohms */
const BB_VCE_SAT = 0.2;              /* saturation clamp, volts */
const BB_SHORT_AMPS = 2;             /* a source pushing past this is a short */

function bbNet(hole) {
 if (!hole) return null;
 if (hole.rail) return "rail:" + hole.rail;
 const side = "abcde".indexOf(hole.col) >= 0 ? "L" : "R";
 return "row:" + hole.row + ":" + side;
}

/* Parts are described by the nets their legs land on:
   {kind:"battery", plus, minus, volts}   {kind:"ac", plus, minus, amp, freq}
   {kind:"resistor", a, b, ohms}          {kind:"capacitor", a, b, farads}
   {kind:"led", anode, cathode, color}    {kind:"switch", a, b, closed}
   {kind:"wire", a, b}                     {kind:"transistor", c, b, e}      */
function createBreadboard(parts, opts) {
 const dt = (opts && opts.dt) || BB_DT;
 /* Wires merge nets: union-find over net names. */
 const parent = {};
 function find(x) { parent[x] = parent[x] || x; let r = x; while (parent[r] !== r) r = parent[r]; while (parent[x] !== r) { const n = parent[x]; parent[x] = r; x = n; } return r; }
 function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
 for (const p of parts) {
  if (p.kind === "wire") union(p.a, p.b);
 }
 function net(n) { return find(n); }
 /* The reference (0 V) net: a battery's minus if there is one, else an
    AC source's minus, else the first net we meet. */
 let ref = null;
 for (const p of parts) { if (p.kind === "battery") { ref = net(p.minus); break; } }
 if (ref === null) for (const p of parts) { if (p.kind === "ac") { ref = net(p.minus); break; } }
 const netSet = new Set();
 function touch(n) { if (n !== null && n !== undefined) netSet.add(net(n)); }
 for (const p of parts) {
  if (p.kind === "wire") continue;
  if (p.kind === "transistor") { touch(p.c); touch(p.b); touch(p.e); }
  else if (p.kind === "battery" || p.kind === "ac") { touch(p.plus); touch(p.minus); }
  else if (p.kind === "led") { touch(p.anode); touch(p.cathode); }
  else { touch(p.a); touch(p.b); }
 }
 if (ref === null && netSet.size) ref = netSet.values().next().value;
 const nodes = [...netSet].filter(n => n !== ref);
 const idx = new Map(nodes.map((n, i) => [n, i]));
 /* Per-part state. */
 const st = parts.map(p => ({
  capV: 0,                       /* capacitor: voltage (a − b) after last step */
  ledOn: false, ledI: 0, overT: 0, popped: false,
  trMode: "off", trIc: 0, trIb: 0,
  closed: p.kind === "switch" ? !!p.closed : false,
  pressed: false,
  branchI: 0, vA: 0, vB: 0, current: 0
 }));
 let time = 0, lastV = new Map(), shorted = false, solved = false;

 function solveStep() {
  /* Iterate: assemble the linear system with the nonlinear parts in
     their current modes, solve, update modes, repeat until steady. */
  let V = new Map(lastV);
  for (let iter = 0; iter < 8; iter++) {
   const n = nodes.length;
   const branches = [];         /* {p, q, value} voltage-source branches */
   parts.forEach((p, i) => {
    if (p.kind === "battery" && net(p.plus) !== net(p.minus)) branches.push({ part: i, p: net(p.plus), q: net(p.minus), value: p.volts });
    else if (p.kind === "ac" && net(p.plus) !== net(p.minus)) branches.push({ part: i, p: net(p.plus), q: net(p.minus), value: p.amp * Math.sin(2 * Math.PI * p.freq * (time + dt)) });
    else if (p.kind === "transistor" && st[i].trMode === "sat" && net(p.c) !== net(p.e)) branches.push({ part: i, p: net(p.c), q: net(p.e), value: BB_VCE_SAT, transistor: true });
   });
   const m = branches.length, size = n + m;
   const A = Array.from({ length: size }, () => new Float64Array(size));
   const z = new Float64Array(size);
   const I = netName => idx.has(netName) ? idx.get(netName) : -1;
   function gStamp(a, b, g) {
    const ia = I(a), ib = I(b);
    if (ia >= 0) A[ia][ia] += g;
    if (ib >= 0) A[ib][ib] += g;
    if (ia >= 0 && ib >= 0) { A[ia][ib] -= g; A[ib][ia] -= g; }
   }
   function iInject(a, b, amps) { /* fixed current flowing a → b */
    const ia = I(a), ib = I(b);
    if (ia >= 0) z[ia] -= amps;
    if (ib >= 0) z[ib] += amps;
   }
   for (let k = 0; k < n; k++) A[k][k] += 1e-9;   /* keeps floating nets finite */
   parts.forEach((p, i) => {
    const s = st[i];
    switch (p.kind) {
     case "resistor": gStamp(net(p.a), net(p.b), 1 / p.ohms); break;
     case "capacitor": {
      const g = p.farads / dt;
      gStamp(net(p.a), net(p.b), g);
      iInject(net(p.b), net(p.a), g * s.capV);   /* history term */
      break;
     }
     case "switch": if (s.closed) gStamp(net(p.a), net(p.b), 10); break;
     case "button": if (s.pressed) gStamp(net(p.a), net(p.b), 10); break;
     case "led": {
      if (s.popped) break;
      if (s.ledOn) { const g = 1 / BB_LED_RD, vf = BB_LED_VF[p.color] || 2.0; gStamp(net(p.anode), net(p.cathode), g); iInject(net(p.cathode), net(p.anode), g * vf); }
      else gStamp(net(p.anode), net(p.cathode), 1e-7);
      break;
     }
     case "transistor": {
      const b = net(p.b), e = net(p.e), c = net(p.c);
      if (s.trMode === "off") { gStamp(b, e, 1e-7); break; }
      const g = 1 / BB_RBE; gStamp(b, e, g); iInject(e, b, g * BB_VBE);
      if (s.trMode === "active") {
       /* Collector as a voltage-controlled current source, stamped
          straight into the matrix: Ic = gm × (Vb − Ve − Vbe), with
          gm = β ÷ Rbe. (Stamping Ic as a fixed current source and
          re-deriving it from Vbe each pass diverges — the loop gain
          through an emitter resistor is β × Re ÷ Rbe, far over 1.) */
       const gm = BB_BETA / BB_RBE, ic = I(c), ie = I(e), ib = I(b);
       if (ic >= 0) { if (ib >= 0) A[ic][ib] += gm; if (ie >= 0) A[ic][ie] -= gm; z[ic] += gm * BB_VBE; }
       if (ie >= 0) { if (ib >= 0) A[ie][ib] -= gm; A[ie][ie] += gm; z[ie] -= gm * BB_VBE; }
      }
      break;
     }
    }
   });
   branches.forEach((br, bi) => {
    const row = n + bi, ip = I(br.p), iq = I(br.q);
    if (ip >= 0) { A[ip][row] += 1; A[row][ip] += 1; }
    if (iq >= 0) { A[iq][row] -= 1; A[row][iq] -= 1; }
    z[row] = br.value;
   });
   /* Gaussian elimination with partial pivoting. */
   const x = new Float64Array(size);
   let singular = false;
   for (let col = 0; col < size; col++) {
    let piv = col;
    for (let r = col + 1; r < size; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    if (Math.abs(A[piv][col]) < 1e-12) { singular = true; A[piv][col] = 1e-9; }
    if (piv !== col) { const t = A[piv]; A[piv] = A[col]; A[col] = t; const tz = z[piv]; z[piv] = z[col]; z[col] = tz; }
    for (let r = col + 1; r < size; r++) {
     const f = A[r][col] / A[col][col];
     if (f === 0) continue;
     for (let c2 = col; c2 < size; c2++) A[r][c2] -= f * A[col][c2];
     z[r] -= f * z[col];
    }
   }
   for (let r = size - 1; r >= 0; r--) {
    let sum = z[r];
    for (let c2 = r + 1; c2 < size; c2++) sum -= A[r][c2] * x[c2];
    x[r] = sum / A[r][r];
   }
   const newV = new Map();
   nodes.forEach((nm, k) => newV.set(nm, x[k]));
   branches.forEach((br, bi) => { st[br.part].branchI = x[n + bi]; if (br.transistor) st[br.part].trIc = x[n + bi]; });
   const volt = nm => nm === ref ? 0 : (newV.get(nm) || 0);
   /* Update the nonlinear modes from this solution. */
   let maxDelta = 0;
   nodes.forEach(nm => { maxDelta = Math.max(maxDelta, Math.abs((newV.get(nm) || 0) - (V.get(nm) || 0))); });
   parts.forEach((p, i) => {
    const s = st[i];
    if (p.kind === "led" && !s.popped) {
     const vd = volt(net(p.anode)) - volt(net(p.cathode)), vf = BB_LED_VF[p.color] || 2.0;
     if (s.ledOn) { s.ledI = (vd - vf) / BB_LED_RD; if (s.ledI < 0) { s.ledOn = false; s.ledI = 0; } }
     else if (vd > vf) s.ledOn = true;
    }
    if (p.kind === "transistor") {
     const vb = volt(net(p.b)), ve = volt(net(p.e)), vc = volt(net(p.c));
     const vbe = vb - ve;
     if (s.trMode === "off") {
      s.trIb = 0; s.trIc = 0;
      if (vbe > BB_VBE) s.trMode = "active";
     } else if (s.trMode === "active") {
      s.trIb = (vbe - BB_VBE) / BB_RBE;
      s.trIc = BB_BETA * s.trIb;
      if (s.trIb <= 0) { s.trMode = "off"; s.trIb = 0; s.trIc = 0; }
      else if (vc - ve < BB_VCE_SAT) s.trMode = "sat";
     } else if (s.trMode === "sat") {
      /* In saturation the branch solve set trIc; the base still obeys
         the same junction rule. Leave saturation when the circuit is
         offering the collector less than the active formula wants. */
      s.trIb = (vbe - BB_VBE) / BB_RBE;
      if (s.trIb <= 0) { s.trMode = "off"; s.trIb = 0; s.trIc = 0; }
      else if (s.trIc < BB_BETA * s.trIb - 1e-12) s.trMode = "active";
     }
    }
   });
   V = newV;
   if (singular) break;
   if (maxDelta < 1e-4 && iter >= 1) break;
  }
  lastV = V;
  solved = true;
  /* Commit capacitor voltages, part currents, and the LED pop rule. */
  const volt = nm => nm === ref ? 0 : (lastV.get(nm) || 0);
  shorted = false;
  parts.forEach((p, i) => {
   const s = st[i];
   if (p.kind === "capacitor") { s.vA = volt(net(p.a)); s.vB = volt(net(p.b)); s.current = (p.farads / dt) * ((s.vA - s.vB) - s.capV); s.capV = s.vA - s.vB; }
   else if (p.kind === "resistor") { s.vA = volt(net(p.a)); s.vB = volt(net(p.b)); s.current = (s.vA - s.vB) / p.ohms; }
   else if (p.kind === "led") { s.vA = volt(net(p.anode)); s.vB = volt(net(p.cathode)); s.current = s.popped ? 0 : s.ledI; }
   else if (p.kind === "battery" || p.kind === "ac") {
    if (net(p.plus) === net(p.minus)) { shorted = true; s.current = Infinity; }
    else { s.current = -s.branchI; if (Math.abs(s.current) > BB_SHORT_AMPS) shorted = true; }
   }
   else if (p.kind === "transistor") { s.vA = volt(net(p.c)); s.vB = volt(net(p.e)); s.current = s.trIc; }
   else if (p.kind === "switch" || p.kind === "button") {
    s.vA = volt(net(p.a)); s.vB = volt(net(p.b));
    const on = p.kind === "switch" ? s.closed : s.pressed;
    s.current = on ? (s.vA - s.vB) * 10 : 0;
   }
   if (p.kind === "led" && !s.popped) {
    if (Math.abs(s.ledI) * 1000 > BB_LED_MAX_MA) { s.overT += dt; if (s.overT >= BB_POP_SECONDS) { s.popped = true; s.ledOn = false; s.ledI = 0; s.current = 0; } }
    else s.overT = Math.max(0, s.overT - dt / 2);
   }
  });
  time += dt;
 }
 return {
  step(n) { const count = n || 1; for (let k = 0; k < count; k++) solveStep(); },
  time() { return time; },
  dt() { return dt; },
  refNet() { return ref; },
  nodeVoltage(nm) { const r = net(nm); return r === ref ? 0 : (lastV.get(r) || 0); },
  isShorted() { return shorted; },
  setClosed(i, closed) { if (st[i]) st[i].closed = !!closed; },
  setPressed(i, pressed) { if (st[i]) st[i].pressed = !!pressed; },
  partReport(i) {
   const p = parts[i], s = st[i];
   if (!p) return null;
   const base = { kind: p.kind, va: s.vA, vb: s.vB, current: s.current };
   if (p.kind === "led") { base.lit = !s.popped && s.ledI > 0.0005; base.brightness = s.popped ? 0 : Math.min(1, Math.abs(s.ledI) / 0.02); base.popped = s.popped; base.over = !s.popped && Math.abs(s.ledI) * 1000 > BB_LED_MAX_MA; }
   if (p.kind === "transistor") { base.ib = s.trIb; base.ic = s.trIc; base.vce = s.vA - s.vB; base.mode = s.trMode; }
   if (p.kind === "capacitor") base.charge = s.capV;
   return base;
  }
 };
}

/* ================= The crystal radio bench =================
   The plan's coil: about 100 turns on a wide cardboard tube. Rather than
   pretend to a precision the winding does not have, the bench fixes the
   inductance at a stated round value in the right range — 250 µH — and
   pairs it with a real salvaged-AM-radio tuning capacitor, 40–365 pF.
   Resonance is the textbook f = 1 / (2π√(LC)). */
const CR_L = 250e-6;
const CR_C_MIN = 40e-12, CR_C_MAX = 365e-12;
function crystalFreq(L, C) { return 1 / (2 * Math.PI * Math.sqrt(L * C)); }
const CR_STATIONS = [
 { name: "KOWL · oldies", freq: 620e3 },
 { name: "WJAZ · big band & jazz", freq: 830e3 },
 { name: "KTWN · talk", freq: 1050e3 },
 { name: "WAVE · pop", freq: 1280e3 },
 { name: "KNTE · night signals", freq: 1540e3 }
];
const CR_HALF_WIDTH = 12000;   /* how selective the tank is, in Hz */
function crystalLevel(freq, stationFreq) {
 const d = (freq - stationFreq) / CR_HALF_WIDTH;
 return 1 / (1 + d * d);
}
function crystalHearing(level, amplified) {
 const eff = amplified ? Math.min(1, level * 3) : level;
 if (amplified) {
  if (eff > 0.6) return "Loud enough for a small speaker — with the amplifier doing the lifting, the whole room can hear this one.";
  if (eff > 0.3) return "Comfortably there: the amplifier has pulled the station up out of the static.";
  if (eff > 0.12) return "Faint even amplified — you are on the edge of this station's skirt. Tune a touch slower.";
  return "Static. Between stations the amplifier only makes the static louder — it cannot invent a signal.";
 }
 if (eff > 0.75) return "Clear — but faint. One earpiece, a quiet room, and the station is right there: this is the crystal set at its best.";
 if (eff > 0.4) return "There, but buried: the voice fades in and out of the static, the way distant AM does after dark.";
 if (eff > 0.15) return "Mostly static, with something ghosting underneath. A slower turn of the dial might find it.";
 return "Static — the honest sound between stations. Nothing is broken; there is simply nothing here to hear.";
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { circuitState, ohmSolve, E12_BASE, nearestE12Up, formatOhms, LED_TYPES, ledById, ledResistor, FULL_BRIGHT_WATTS,
  BB_ROWS, BB_DT, BB_LED_VF, BB_LED_MAX_MA, BB_BETA, BB_VBE, bbNet, createBreadboard,
  CR_L, CR_C_MIN, CR_C_MAX, CR_STATIONS, crystalFreq, crystalLevel, crystalHearing };
}
