"use strict";
/* The Reflection & Friction companion workbench — engines are pure and exposed
   at window.__rf for the audit. Every law printed on the page is the law run here. */
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
function criticalAngle(n1, n2) { return Math.asin(n2 / n1) * R2D; }
function frictionAngle(mu) { return Math.atan(mu) * R2D; }
function snellOut(n1, n2, thDeg) { const s = (n1 / n2) * Math.sin(thDeg * D2R); return s > 1 ? null : Math.asin(s) * R2D; }
function bounce(vt, vn, s, et, en, mirror) {
  // vn is the INTO-surface speed (positive). Returns post-bounce components.
  const vn2 = en * vn;                                        // leaves the surface at en*vn
  if (mirror) return { vt2: vt, vn2, s2: s, thetaOut: Math.atan2(vt, vn2) * R2D };
  const u = vt - s;                                           // contact-point tangential velocity (s>0 = topspin surface speed)
  const dvt = -(2 / 7) * (1 + et) * u;                        // rigid solid-sphere grip impulse (Garwin form)
  const vt2 = vt + dvt, s2 = s + (5 / 7) * (1 + et) * u;
  return { vt2, vn2, s2, thetaOut: Math.atan2(vt2, vn2) * R2D };
}
function tireForce(a) { return a <= 7.5 ? a / 7.5 : Math.max(0.35, 1 - (a - 7.5) * 0.03); }
function wingCL(a) { return a <= 14.5 ? a / 14.5 : Math.max(0.3, 1 - (a - 14.5) * 0.09); }
function wingDrag(a) { const base = 0.02 + 0.0011 * a * a; return a <= 14.5 ? base : base + (a - 14.5) * 0.012; }
function kamm(b, c) { const r = Math.hypot(b, c); return { r, ok: r <= 100.5, left: Math.max(0, 100 - r) }; }
function stoneRetention(beta) { return 0.94 - 0.0022 * (beta - 20) * (beta - 20); }
function stoneRun(v0, beta) {
  if (beta > 38) return { skips: 0, distance: 0, dissipated: 100, plunged: true };
  const r = stoneRetention(beta), g = 9.81;
  let v = v0, skips = 0, dist = 0; const ke0 = v0 * v0;
  while (v >= 3 && skips < 200) {
    const t = 2 * v * Math.sin(beta * D2R) / g;
    dist += v * Math.cos(beta * D2R) * t;
    v *= r; skips++;
  }
  return { skips, distance: dist, dissipated: (1 - (v * v) / ke0) * 100, plunged: false };
}
window.__rf = { criticalAngle, frictionAngle, snellOut, bounce, tireForce, wingCL, wingDrag, kamm, stoneRetention, stoneRun };
const $ = id => document.getElementById(id);
const fmt = (x, n) => Number(x).toFixed(n === undefined ? 2 : n);
const AUDIT = new URLSearchParams(location.search).has("audit");

/* ---------- Bay 1: dual cones ---------- */
function bay1() {
  const th = parseFloat($("b1th").value), F = parseFloat($("b1F").value);
  const n1 = 1.50, n2 = 1.00, mu = parseFloat($("b1mu").value);
  const tc = criticalAngle(n1, n2), tf = frictionAngle(mu);
  const out = snellOut(n1, n2, th);
  const optical = out === null ? "LOCKED — total internal reflection" : "ESCAPES — refracts out at " + fmt(out, 1) + "°";
  const stick = Math.tan(th * D2R) <= mu;
  $("b1read").innerHTML =
    '<span class="chip">Critical cone θ<sub>c</sub> = <b>' + fmt(tc, 1) + '°</b></span>' +
    '<span class="chip">Friction cone θ<sub>f</sub> = <b>' + fmt(tf, 1) + '°</b> (μ = ' + fmt(mu, 3) + ')</span>' +
    '<span class="chip ' + (out === null ? "bad" : "good") + '">Light at ' + fmt(th, 0) + '°: <b>' + optical + '</b></span>' +
    '<span class="chip ' + (stick ? "good" : "bad") + '">Block at ' + fmt(th, 0) + '°: <b>' + (stick ? "SELF-LOCKED" : "SLIDES") + '</b></span>' +
    '<span class="chip">Push: F<sub>t</sub> = ' + fmt(F * Math.sin(th * D2R), 0) + ' N vs grip ' + fmt(mu * F * Math.cos(th * D2R), 0) + ' N — F cancels; the angle alone decides</span>';
  const cv = $("b1canvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  // left: glass (bottom) / air (top), ray from inside
  const ix = W * 0.25, iy = H * 0.52;
  ctx.fillStyle = "#dcebf5"; ctx.fillRect(20, iy, W * 0.44, H - iy - 16);
  ctx.fillStyle = "#f7f3e6"; ctx.fillRect(20, 16, W * 0.44, iy - 16);
  ctx.strokeStyle = "#8a8272"; ctx.strokeRect(20, 16, W * 0.44, H - 32);
  ctx.setLineDash([5, 5]); ctx.strokeStyle = "#b0a98f";
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + sgn * Math.tan(tc * D2R) * 150, iy - 150); ctx.stroke(); }
  ctx.setLineDash([]); ctx.strokeStyle = "#4a5160"; ctx.beginPath(); ctx.moveTo(ix, iy - 120); ctx.lineTo(ix, iy + 60); ctx.stroke();
  const sx = ix - Math.tan(th * D2R) * 130, sy = iy + 130;
  ctx.strokeStyle = "#d9940d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ix, iy); ctx.stroke();
  if (out === null) { ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix - Math.tan(th * D2R) * 130, iy + 130); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + Math.tan(out * D2R) * 130, iy - 130); ctx.stroke(); }
  ctx.lineWidth = 1; ctx.fillStyle = "#4a5160"; ctx.font = "14px system-ui";
  ctx.fillText("glass n=1.50", 30, H - 26); ctx.fillText("air", 30, 36); ctx.fillText("OPTICS", 30, 58);
  // right: block + push
  const bx = W * 0.62, by = H * 0.62, bw = 120, bh = 54;
  ctx.fillStyle = "#e8e2d2"; ctx.fillRect(bx - 30, by + bh, W * 0.34, 12);
  ctx.fillStyle = stick ? "#7ba05b" : "#c05a3a"; ctx.fillRect(bx, by, bw, bh);
  const cx = bx + bw / 2, cy = by + bh / 2, L = 120;
  const ax = cx - Math.sin(th * D2R) * L, ay = cy - Math.cos(th * D2R) * L;
  ctx.strokeStyle = "#a03d2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.fillStyle = "#a03d2a"; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
  ctx.lineWidth = 1; ctx.fillStyle = "#4a5160";
  ctx.fillText("MECHANICS — push at " + fmt(th, 0) + "° from the normal", bx - 30, 58);
  ctx.fillText(stick ? "the block holds — at ANY force" : "the block breaks free and slides", bx - 30, H - 26);
}

/* ---------- Bay 2: oblique bounce ---------- */
const MODES = {
  mirror:   { label: "Pure Mirror", et: 0, en: 0.90, s: 0, mirror: true },
  billiard: { label: "Billiard Cushion", et: 0, en: 0.85, s: 0, mirror: false },
  superball:{ label: "Superball Retro!", et: 0.85, en: 0.94, s: -14, mirror: false },
  topspin:  { label: "Heavy Topspin", et: 0, en: 0.85, s: 16, mirror: false }
};
let b2 = null;
function b2Launch() {
  const mode = MODES[$("b2mode").value];
  const v = parseFloat($("b2v").value), ang = parseFloat($("b2ang").value) * D2R;
  b2 = { x: 1.2, y: 2.2, vx: v * Math.cos(ang), vy: v * Math.sin(ang), s: mode.s, rot: 0, trail: [], bounces: 0, first: null, mode };
}
function b2Step(dt) {
  if (!b2) return;
  const g = 9.81, floor = 9.2, R = 0.55;
  b2.vy += g * dt; b2.x += b2.vx * dt; b2.y += b2.vy * dt;
  b2.rot += (b2.s / R) * dt;
  b2.trail.push([b2.x, b2.y]); if (b2.trail.length > 260) b2.trail.shift();
  if (b2.y + R >= floor && b2.vy > 0) {
    b2.y = floor - R;
    const r = bounce(b2.vx, b2.vy, b2.s, b2.mode.et, b2.mode.en, b2.mode.mirror);
    if (!b2.first) b2.first = { vtIn: b2.vx, vnIn: b2.vy, sIn: b2.s, ...r, thIn: Math.atan2(b2.vx, b2.vy) * R2D };
    b2.vx = r.vt2; b2.vy = -r.vn2; b2.s = r.s2; b2.bounces++;
    if (Math.abs(b2.vy) < 1.1 || b2.bounces > 7) { b2.vy = 0; b2.done = true; }
  }
  if (b2.x > 31) b2.done = true;
}
function b2Draw() {
  const cv = $("b2canvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const SX = W / 32, SY = H / 10.6, fy = 9.2 * SY;
  ctx.fillStyle = "#3a3f46"; ctx.fillRect(0, fy, W, H - fy);
  ctx.strokeStyle = "rgba(255,214,120,.25)"; ctx.beginPath();
  b2.trail.forEach((p, i) => { const X = p[0] * SX, Y = p[1] * SY; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
  if (b2.first) {
    const f = b2.first;
    $("b2read").innerHTML =
      '<span class="chip">θ in <b>' + fmt(f.thIn, 1) + '°</b> from the normal</span>' +
      '<span class="chip ' + (f.thetaOut < 0 ? "bad" : "good") + '">θ out <b>' + fmt(f.thetaOut, 1) + '°</b>' + (f.thetaOut < 0 ? " — RETRO-REFLECTION: it comes back at you" : "") + '</span>' +
      '<span class="chip">Tangential ' + fmt(f.vtIn, 1) + ' → <b>' + fmt(f.vt2, 1) + ' m/s</b></span>' +
      '<span class="chip">Spin (surface) ' + fmt(f.sIn, 0) + ' → <b>' + fmt(f.s2, 1) + ' m/s</b></span>' +
      '<span class="chip">' + b2.mode.label + ': e<sub>n</sub> ' + b2.mode.en + (b2.mode.mirror ? ", no tangential impulse at all" : ", e<sub>t</sub> " + b2.mode.et + " through the grip impulse") + '</span>';
  }
  ctx.fillStyle = "#d64533"; ctx.beginPath(); ctx.arc(b2.x * SX, b2.y * SY, 0.55 * SX, 0, 7); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(b2.x * SX, b2.y * SY); ctx.lineTo(b2.x * SX + Math.cos(b2.rot) * 0.55 * SX, b2.y * SY + Math.sin(b2.rot) * 0.55 * SX); ctx.stroke(); ctx.lineWidth = 1;
}

/* ---------- Bay 3: tire & wing + Kamm ---------- */
function bay3() {
  const a = parseFloat($("b3a").value);
  const cv = $("b3canvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const X = v => 50 + v / 22 * (W - 90), Y = v => H - 34 - v * (H - 80);
  ctx.strokeStyle = "#ccd2da"; ctx.beginPath(); ctx.moveTo(50, H - 34); ctx.lineTo(W - 40, H - 34); ctx.moveTo(50, 20); ctx.lineTo(50, H - 34); ctx.stroke();
  const plot = (fn, color) => { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x <= 22; x += 0.25) { const px = X(x), py = Y(fn(x)); x ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.lineWidth = 1; };
  plot(tireForce, "#b98a2f"); plot(wingCL, "#1f5f6e");
  ctx.setLineDash([4, 4]); ctx.strokeStyle = "#a03d2a"; ctx.beginPath(); ctx.moveTo(X(a), 20); ctx.lineTo(X(a), H - 34); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#4a5160"; ctx.font = "13px system-ui";
  ctx.fillText("slip / attack angle α →", W - 190, H - 10);
  ctx.fillStyle = "#b98a2f"; ctx.fillText("■ tire grip (peaks 7.5°)", 60, 34);
  ctx.fillStyle = "#1f5f6e"; ctx.fillText("■ wing lift (peaks 14.5°, then stalls)", 60, 54);
  const tf = tireForce(a), cl = wingCL(a), dr = wingDrag(a);
  $("b3read").innerHTML =
    '<span class="chip">At α = <b>' + fmt(a, 1) + '°</b></span>' +
    '<span class="chip ' + (a > 7.5 ? "bad" : "good") + '">Tire grip <b>' + fmt(tf * 100, 0) + '%</b> of peak' + (a > 7.5 ? " — past the peak: the tread is sliding" : "") + '</span>' +
    '<span class="chip ' + (a > 14.5 ? "bad" : "good") + '">Wing lift <b>' + fmt(cl * 100, 0) + '%</b> of peak' + (a > 14.5 ? " — STALLED: the flow has let go" : "") + '</span>' +
    '<span class="chip">Wing L/D right now ≈ <b>' + fmt(cl * 14.5 / Math.max(0.02, dr * 14.5), 1) + '</b></span>';
  // Kamm circle
  const B = parseFloat($("b3B").value), C = parseFloat($("b3C").value), k = kamm(B, C);
  const kc = $("b3kamm"), kx = kc.getContext("2d"), KW = kc.width, KH = kc.height;
  kx.clearRect(0, 0, KW, KH);
  const cx = KW / 2, cy = KH / 2, R = Math.min(KW, KH) / 2 - 16;
  kx.strokeStyle = k.ok ? "#7ba05b" : "#c05a3a"; kx.lineWidth = 2;
  kx.beginPath(); kx.arc(cx, cy, R, 0, 7); kx.stroke(); kx.lineWidth = 1;
  kx.strokeStyle = "#a03d2a"; kx.lineWidth = 3; kx.beginPath(); kx.moveTo(cx, cy); kx.lineTo(cx + C / 100 * R, cy - B / 100 * R); kx.stroke(); kx.lineWidth = 1;
  kx.fillStyle = "#4a5160"; kx.font = "12px system-ui"; kx.fillText("Kamm's circle", 8, 16);
  $("b3kread").innerHTML =
    '<span class="chip">Braking ' + fmt(B, 0) + '% · Cornering ' + fmt(C, 0) + '%</span>' +
    '<span class="chip ' + (k.ok ? "good" : "bad") + '">Resultant <b>' + fmt(k.r, 1) + '%</b> of the grip budget' + (k.ok ? " — " + fmt(k.left, 0) + "% still in hand" : " — OVER: something has to let go") + '</span>';
}

/* ---------- Bay 4: skipping stone ---------- */
let b4 = null;
function b4Launch() {
  const v0 = parseFloat($("b4v").value), beta = parseFloat($("b4beta").value);
  b4 = { x: 0.6, y: 1.0, vx: v0 * Math.cos(beta * D2R), vy: 0, v: v0, beta, skips: 0, rings: [], done: false, plunged: beta > 38, dist: 0 };
}
function b4Step(dt) {
  if (!b4 || b4.done) return;
  const g = 9.81, water = 8.6;
  b4.vy += g * dt; b4.x += b4.vx * dt; b4.y += b4.vy * dt;
  if (b4.y >= water && b4.vy > 0) {
    if (b4.plunged) { b4.done = true; b4.sank = true; return; }
    const r = stoneRetention(b4.beta);
    b4.skips++; b4.rings.push([b4.x, 0]); b4.dist = b4.x;
    b4.v *= r;
    if (b4.v < 3) { b4.done = true; return; }
    b4.vx = b4.v * Math.cos(b4.beta * D2R); b4.vy = -b4.v * Math.sin(b4.beta * D2R); b4.y = water - 0.01;
  }
  if (b4.x > 31) b4.done = true;
}
function b4Draw() {
  const cv = $("b4canvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const SX = W / 32, SY = H / 10.6, wy = 8.6 * SY;
  ctx.fillStyle = "#bcd3e8"; ctx.fillRect(0, wy, W, H - wy);
  ctx.strokeStyle = "rgba(31,95,110,.5)";
  b4.rings.forEach(rg => { ctx.beginPath(); ctx.ellipse(rg[0] * SX, wy, 14, 4, 0, 0, 7); ctx.stroke(); });
  ctx.fillStyle = "#5a5148"; ctx.beginPath(); ctx.ellipse(b4.x * SX, b4.y * SY, 13, 5, 0, 0, 7); ctx.fill();
  const run = stoneRun(parseFloat($("b4v").value), b4.beta);
  $("b4read").innerHTML = b4.plunged
    ? '<span class="chip bad"><b>Plunge.</b> At ' + fmt(b4.beta, 0) + '° the stone knifes in and the boundary keeps it — no skip at all.</span>'
    : '<span class="chip">Skips so far <b>' + b4.skips + '</b></span><span class="chip">Full run at this setting: <b>' + run.skips + ' skips</b>, ≈ ' + fmt(run.distance, 0) + ' m of hops</span><span class="chip">Kinetic energy turned to splash and heat: <b>' + fmt(run.dissipated, 0) + '%</b> — friction\u2019s thermodynamic arrow, paid per bounce</span>';
}

/* ---------- The Atlas ---------- */
const ATLAS = [
  ["Silver mirror", 0.001, 0, "Ft/Fn → 0 and ~99% of the energy conserved. The pure reflection end of the world."],
  ["Sailplane, L/D 50", 0.02, 1, "Effective friction 0.02 — it glides at 1.1°, flying on the razor edge of reflection."],
  ["Ice skate", 0.03, 2, "The blade rides a premelted water nanolayer: μ ≈ 0.03."],
  ["Jetliner, L/D 18", 0.056, 0, "Cruising flight is a 3.2° glide that never lands."],
  ["Train wheel on rail", 0.16, 1, "Rolls efficiently while keeping just enough traction to pull and brake."],
  ["Skipping stone at 20°", 0.35, 2, "Balances water reflection against splash drag — the mixed middle of the atlas."],
  ["Earthquake fault (Byerlee)", 0.65, 0, "Rock-on-rock friction 0.6–0.85; roughly 85% of the strain energy leaves as frictional heat."],
  ["Dry road tire", 0.95, 1, "A 43° friction cone — the grip every corner you have ever taken stood on."],
  ["Formula 1 slick", 1.6, 2, "Viscoelastic grip past μ 1.5: chemistry adding to geometry."],
  ["Gecko toe setae", 3.2, 0, "Directional van der Waals grip, μ > 3 — clings upside-down to a mirror itself."]
];
function atlasDraw() {
  const cv = $("atlascanvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const zones = [["PURE REFLECTION & GLIDE", "#e8f0e4"], ["MIXED COUPLING", "#f7f0da"], ["TRACTION · SELF-LOCKING · ADHESION", "#f9e4da"]];
  zones.forEach((z, i) => { ctx.fillStyle = z[1]; ctx.fillRect(40, 26 + i * ((H - 60) / 3), W - 70, (H - 60) / 3 - 4); ctx.fillStyle = "#4a5160"; ctx.font = "bold 12px system-ui"; ctx.fillText(z[0], 48, 44 + i * ((H - 60) / 3)); });
  const X = mu => 50 + (Math.log10(mu) + 3) / (Math.log10(5) + 3) * (W - 110);
  ctx.font = "12.5px system-ui";
  ATLAS.forEach((p, i) => {
    const zone = p[1] <= 0.06 ? 0 : p[1] <= 0.4 ? 1 : 2;
    const y = 26 + zone * ((H - 60) / 3) + 34 + p[2] * 30;
    ctx.fillStyle = "#a03d2a"; ctx.beginPath(); ctx.arc(X(p[1]), y, 5, 0, 7); ctx.fill();
    ctx.fillStyle = "#20242a"; ctx.fillText(p[0] + "  (μ " + p[1] + ")", X(p[1]) + 9, y + 4);
  });
  ctx.fillStyle = "#4a5160"; ctx.fillText("tangential coupling Ft/Fn (log scale) →", W - 300, H - 8);
  cv.onclick = e => {
    const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * (W / r.width), my = (e.clientY - r.top) * (H / r.height);
    let best = null, bd = 1e9;
    ATLAS.forEach(p => { const zone = p[1] <= 0.06 ? 0 : p[1] <= 0.4 ? 1 : 2; const y = 26 + zone * ((H - 60) / 3) + 34 + p[2] * 30; const d = Math.hypot(X(p[1]) - mx, y - my); if (d < bd) { bd = d; best = p; } });
    if (best && bd < 42) $("atlasread").innerHTML = '<span class="chip"><b>' + best[0] + '</b> — ' + best[3] + '</span>';
  };
}

/* ---------- init ---------- */
function loop() {
  b2Step(0.008); b2Draw(); b4Step(0.008); b4Draw();
  if (!b2.done || !b4.done) requestAnimationFrame(loop);
}
function init() {
  bay1();
  ["b1th", "b1F", "b1mu"].forEach(id => $(id).addEventListener("input", bay1));
  $("b1match").addEventListener("click", () => { $("b1mu").value = Math.tan(criticalAngle(1.5, 1.0) * D2R).toFixed(3); bay1(); });
  $("b1lock").addEventListener("click", () => { $("b1th").value = 20; $("b1F").value = 500; bay1(); });
  b2Launch(); b4Launch();
  if (!AUDIT) requestAnimationFrame(loop); else { for (let i = 0; i < 400 && !b2.done; i++) b2Step(0.008); b2Draw(); for (let i = 0; i < 900 && !b4.done; i++) b4Step(0.008); b4Draw(); }
  ["b2mode", "b2v", "b2ang"].forEach(id => $(id).addEventListener("change", () => { b2Launch(); if (AUDIT) return; requestAnimationFrame(loop); }));
  $("b2go").addEventListener("click", () => { b2Launch(); requestAnimationFrame(loop); });
  ["b3a", "b3B", "b3C"].forEach(id => $(id).addEventListener("input", bay3)); bay3();
  $("b3kamm").addEventListener("click", () => { $("b3B").value = 71; $("b3C").value = 71; bay3(); });
  document.querySelectorAll("[data-beta]").forEach(b => b.addEventListener("click", () => { $("b4beta").value = b.dataset.beta; b4Launch(); requestAnimationFrame(loop); }));
  ["b4v", "b4beta"].forEach(id => $(id).addEventListener("change", () => { b4Launch(); requestAnimationFrame(loop); }));
  $("b4go").addEventListener("click", () => { b4Launch(); requestAnimationFrame(loop); });
  atlasDraw();
  if (AUDIT) {
    const out = [];
    out.push("theta_c glass-air = " + fmt(criticalAngle(1.5, 1.0), 2) + " | theta_f mu0.9 = " + fmt(frictionAngle(0.9), 2) + " | match mu = " + fmt(Math.tan(criticalAngle(1.5, 1.0) * D2R), 4));
    out.push("snell 30deg = " + fmt(snellOut(1.5, 1.0, 30), 2) + " | snell 50deg = " + snellOut(1.5, 1.0, 50));
    const vt = 14 * Math.cos(35 * D2R), vn = 14 * Math.sin(35 * D2R);
    for (const k of ["mirror", "billiard", "superball", "topspin"]) { const m = MODES[k]; const r = bounce(vt, vn, m.s, m.et, m.en, m.mirror); out.push(k + ": vt' " + fmt(r.vt2, 2) + " thetaOut " + fmt(r.thetaOut, 2) + " s' " + fmt(r.s2, 2)); }
    out.push("tire 5/7.5/12 = " + fmt(tireForce(5), 3) + "/" + fmt(tireForce(7.5), 3) + "/" + fmt(tireForce(12), 3) + " | wing 10/14.5/20 = " + fmt(wingCL(10), 3) + "/" + fmt(wingCL(14.5), 3) + "/" + fmt(wingCL(20), 3));
    const kk = kamm(71, 71); out.push("kamm 71/71 r = " + fmt(kk.r, 1) + " ok = " + kk.ok + " | kamm 100/40 r = " + fmt(kamm(100, 40).r, 1) + " ok = " + kamm(100, 40).ok);
    for (const b of [6, 20, 43]) { const r = stoneRun(25, b); out.push("stone 25m/s beta " + b + ": skips " + r.skips + " dist " + fmt(r.distance, 1) + " diss " + fmt(r.dissipated, 1) + " plunged " + r.plunged); }
    const pre = document.createElement("pre"); pre.id = "auditout"; pre.textContent = out.join("\n"); document.body.appendChild(pre);
  }
}
document.addEventListener("DOMContentLoaded", init);
