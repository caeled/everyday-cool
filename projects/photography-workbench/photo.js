"use strict";
/* The Photography Workbench — every number on this page is computed, none is typed in.
   Audit hooks: window.__photo exposes the pure functions. */

// ---------- pure engines ----------
function ev100(N, t) { return Math.log2((N * N) / t); }              // exposure value at ISO 100
function stopsOff(N, t, iso, sceneEV) { return (ev100(N, t) - Math.log2(iso / 100)) - sceneEV; }
function fov(f, sensorW, sensorH) {                                    // degrees
  const d = Math.sqrt(sensorW * sensorW + sensorH * sensorH);
  const r = Math.atan;
  return { h: 2 * r(sensorW / 2 / f) * 180 / Math.PI, v: 2 * r(sensorH / 2 / f) * 180 / Math.PI, d: 2 * r(d / 2 / f) * 180 / Math.PI };
}
function dof(f, N, c, s) {                                             // all mm; returns mm, far may be Infinity
  const H = f + (f * f) / (N * c);
  const near = s * (H - f) / (H + s - 2 * f);
  const far = s >= H ? Infinity : s * (H - f) / (H - s);
  return { H, near, far };
}
function inverseSquare(d) { return { rel: 1 / (d * d), stops: 2 * Math.log2(d) }; }  // relative to 1 m
window.__photo = { ev100, stopsOff, fov, dof, inverseSquare };

const $ = id => document.getElementById(id);
const fmt = (x, n) => Number(x).toFixed(n === undefined ? 2 : n);

// ---------- the shared scene ----------
function paintScene(ctx, w, h, birdX) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, "#a8c8e8"); sky.addColorStop(1, "#e8f0e0");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.62);
  ctx.fillStyle = "#f4d47c"; ctx.beginPath(); ctx.arc(w * 0.8, h * 0.16, h * 0.055, 0, 7); ctx.fill();
  ctx.fillStyle = "#8fa3bf"; ctx.beginPath();                       // far mountains
  ctx.moveTo(0, h * 0.62); ctx.lineTo(w * 0.18, h * 0.3); ctx.lineTo(w * 0.38, h * 0.52);
  ctx.lineTo(w * 0.55, h * 0.26); ctx.lineTo(w * 0.78, h * 0.5); ctx.lineTo(w, h * 0.36);
  ctx.lineTo(w, h * 0.62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#bcd3e8"; ctx.fillRect(0, h * 0.62, w, h * 0.14);  // lake
  ctx.fillStyle = "#7d9b6a"; ctx.beginPath();                        // near hill
  ctx.moveTo(0, h); ctx.lineTo(0, h * 0.78); ctx.quadraticCurveTo(w * 0.4, h * 0.66, w, h * 0.8); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#5a4632"; ctx.lineWidth = Math.max(3, w * 0.008); // tree
  ctx.beginPath(); ctx.moveTo(w * 0.13, h * 0.97); ctx.lineTo(w * 0.13, h * 0.62); ctx.stroke();
  ctx.fillStyle = "#4e7a3d"; ctx.beginPath(); ctx.arc(w * 0.13, h * 0.55, h * 0.11, 0, 7); ctx.fill();
  if (birdX !== null && birdX !== undefined) {                       // the bird
    ctx.fillStyle = "#2c3440";
    const y = h * 0.22, s = h * 0.02;
    ctx.beginPath(); ctx.moveTo(birdX - s * 1.6, y); ctx.quadraticCurveTo(birdX - s * 0.6, y - s * 1.1, birdX, y);
    ctx.quadraticCurveTo(birdX + s * 0.6, y - s * 1.1, birdX + s * 1.6, y);
    ctx.quadraticCurveTo(birdX + s * 0.5, y + s * 0.5, birdX, y + s * 0.4);
    ctx.quadraticCurveTo(birdX - s * 0.5, y + s * 0.5, birdX - s * 1.6, y); ctx.fill();
  }
}

// ---------- Bench 1: exposure ----------
const SCENE_EV = 15; // bright daylight, the sunny-16 scene
let noisePat = null;
function makeNoise() {
  const c = document.createElement("canvas"); c.width = c.height = 140;
  const x = c.getContext("2d"), img = x.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) { const v = 90 + Math.random() * 90; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0); return c;
}
function exposureFrame(now) {
  const cv = $("expcanvas"); if (!cv) return;
  const ctx = cv.getContext("2d"), w = cv.width, h = cv.height;
  const N = parseFloat($("expN").value), t = parseFloat($("expT").value), iso = parseFloat($("expISO").value);
  const off = stopsOff(N, t, iso, SCENE_EV);
  const bright = Math.pow(2, -off);
  const bg = document.createElement("canvas"); bg.width = w; bg.height = h;
  paintScene(bg.getContext("2d"), w, h, null);
  ctx.save();
  ctx.filter = "brightness(" + Math.min(2.6, Math.max(0.04, bright)) + ")";
  const blurPx = Math.max(0, (4.2 - Math.log2(N)) * 2.1);            // f/1.4 soft, f/16 crisp
  ctx.filter += " blur(" + blurPx.toFixed(1) + "px)";
  ctx.drawImage(bg, -8, -8, w + 16, h + 16);
  ctx.restore();
  const period = 9000, bx = ((now % period) / period) * (w + 120) - 60;
  const smear = Math.min(130, t * 420);                              // shutter drags the bird
  ctx.save();
  const ghosts = Math.max(1, Math.round(smear / 14));
  for (let i = ghosts; i >= 0; i--) {
    const g = document.createElement("canvas"); g.width = w; g.height = h;
    const gx = g.getContext("2d"); gx.filter = "brightness(" + Math.min(2.6, Math.max(0.04, bright)) + ")";
    paintScene(gx, w, h, bx - i * 13);
    ctx.globalAlpha = i === 0 ? 0.95 : 0.16;
    ctx.drawImage(g, 0, 0);
  }
  ctx.restore();
  if (!noisePat) noisePat = makeNoise();
  const na = Math.min(0.34, Math.log2(iso / 100) * 0.055);
  if (na > 0.01) { ctx.save(); ctx.globalAlpha = na; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(noisePat, 0, 0, w, h); ctx.restore(); }
  const r = $("expread");
  const verdict = Math.abs(off) < 0.34 ? ["Right on — this is the exposure the scene wants.", "good"]
    : off > 0 ? [fmt(off, 1) + " stops too dark. Open the aperture, slow the shutter, or raise the ISO.", "bad"]
    : [fmt(-off, 1) + " stops too bright — blown out. Stop down, speed the shutter, or lower the ISO.", "bad"];
  r.innerHTML = '<span class="chip">EV ' + fmt(ev100(N, t), 1) + ' at ISO 100</span>' +
    '<span class="chip">Scene wants EV ' + SCENE_EV + '</span>' +
    '<span class="chip ' + verdict[1] + '">' + verdict[0] + '</span>' +
    '<span class="chip">Same EV, different picture: aperture bends <b>depth</b>, shutter bends <b>motion</b>, ISO bends <b>noise</b>.</span>';
}
function exposureLoop(now) { exposureFrame(now); requestAnimationFrame(exposureLoop); }

// ---------- Bench 2: the lens ----------
function lensDraw() {
  const f = parseFloat($("lensF").value);
  const cv = $("lenscanvas"), ctx = cv.getContext("2d"), w = cv.width, h = cv.height;
  const full = document.createElement("canvas"); full.width = w; full.height = h;
  paintScene(full.getContext("2d"), w, h, w * 0.62);
  const scale = f / 14;                                              // 14 mm sees it all
  const sw = w / scale, sh = h / scale, sx = (w - sw) / 2, sy = (h - sh) / 2;
  ctx.fillStyle = "#101418"; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(full, sx, sy, sw, sh, 0, 0, w, h);
  const a = fov(f, 36, 24);
  $("lensread").innerHTML =
    '<span class="chip"><b>' + f + ' mm</b> on full frame</span>' +
    '<span class="chip">Sees <b>' + fmt(a.h, 1) + '°</b> wide · ' + fmt(a.v, 1) + '° tall · ' + fmt(a.d, 1) + '° diagonal</span>' +
    '<span class="chip">On an APS-C body (1.5× crop) it frames like a <b>' + fmt(f * 1.5, 0) + ' mm</b></span>' +
    '<span class="chip">' + (f < 24 ? "Ultra-wide: space stretches, edges lean." : f < 35 ? "Wide: the reporter’s view — context first." : f <= 58 ? "Normal: near how an eye takes a scene." : f <= 135 ? "Portrait country: faces flatter, backgrounds melt." : "Telephoto: distant things pulled close and stacked flat.") + '</span>';
  const cells = document.querySelectorAll("#sensorbox rect");
  const names = { ff: [36, 24], apsc: [23.5, 15.6], mft: [17.3, 13], one: [13.2, 8.8], phone: [9.8, 7.3] };
  $("sensorread").textContent = "Full frame 36×24 mm · APS-C 23.5×15.6 · Micro Four Thirds 17.3×13 · 1-inch 13.2×8.8 · a phone ≈9.8×7.3 — drawn to one scale. The sensor is the film's heir: its size sets the crop, the depth of field, and how hard the pixels must work.";
}

// ---------- Bench 3: depth of field ----------
function dofDraw() {
  const f = parseFloat($("dofF").value), N = parseFloat($("dofN").value);
  const sM = parseFloat($("dofS").value), c = parseFloat($("dofC").value);
  const r = dof(f, N, c, sM * 1000);
  const H = r.H / 1000, near = r.near / 1000, far = r.far === Infinity ? Infinity : r.far / 1000;
  $("dofread").innerHTML =
    '<span class="chip">Hyperfocal distance <b>' + fmt(H, 2) + ' m</b></span>' +
    '<span class="chip">Sharp from <b>' + fmt(near, 2) + ' m</b> to <b>' + (far === Infinity ? "∞" : fmt(far, 2) + " m") + '</b></span>' +
    '<span class="chip">Total depth of field <b>' + (far === Infinity ? "to the horizon" : fmt(far - near, 2) + " m") + '</b></span>' +
    '<span class="chip">Focus at the hyperfocal and everything from ' + fmt(H / 2, 2) + ' m to ∞ holds.</span>';
  const cv = $("dofcanvas"), ctx = cv.getContext("2d"), w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  const maxD = Math.max(30, (far === Infinity ? sM * 4 : far * 1.35));
  const X = d => 30 + (Math.log10(Math.max(0.3, d)) - Math.log10(0.3)) / (Math.log10(maxD) - Math.log10(0.3)) * (w - 60);
  ctx.strokeStyle = "#8a8272"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, h * 0.55); ctx.lineTo(w - 30, h * 0.55); ctx.stroke();
  ctx.fillStyle = "#7ba05b"; ctx.fillRect(X(near), h * 0.38, X(far === Infinity ? maxD : far) - X(near), h * 0.34);
  ctx.fillStyle = "#a03d2a"; ctx.beginPath(); ctx.arc(X(sM), h * 0.55, 7, 0, 7); ctx.fill();
  ctx.fillStyle = "#4c463c"; ctx.font = "13px system-ui";
  ctx.fillText("camera", 26, h * 0.3);
  ctx.fillText("subject " + fmt(sM, 1) + " m", X(sM) - 26, h * 0.3);
  ctx.fillText("sharp zone", X(near) + 6, h * 0.9);
  ctx.fillText(fmt(maxD, 0) + " m →", w - 78, h * 0.9);
}

// ---------- Bench 4: light falls off ----------
function lightDraw() {
  const d = parseFloat($("lightD").value);
  const r = inverseSquare(d);
  const cv = $("lightcanvas"), ctx = cv.getContext("2d"), w = cv.width, h = cv.height;
  ctx.fillStyle = "#14181d"; ctx.fillRect(0, 0, w, h);
  const lx = 70, ly = h / 2, px = 90 + d * 78;
  const grad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 46 + d * 78);
  grad.addColorStop(0, "rgba(255,214,120," + Math.min(0.95, 0.25 + r.rel) + ")");
  grad.addColorStop(1, "rgba(255,214,120,0)");
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(lx, ly, 46 + d * 78, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffd678"; ctx.beginPath(); ctx.arc(lx, ly, 13, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(230,235,240," + Math.max(0.06, r.rel) + ")";
  ctx.beginPath(); ctx.arc(px, ly, 30, 0, 7); ctx.fill();
  ctx.strokeStyle = "#5a6470"; ctx.strokeRect(px - 30, ly - 30, 60, 60);
  ctx.fillStyle = "#cfd6dd"; ctx.font = "13px system-ui";
  ctx.fillText("lamp", lx - 14, ly + 38); ctx.fillText("subject", px - 24, ly + 52);
  $("lightread").innerHTML =
    '<span class="chip">Distance <b>' + fmt(d, 1) + ' m</b></span>' +
    '<span class="chip">Light arriving <b>' + fmt(r.rel * 100, 1) + '%</b> of the 1-metre amount</span>' +
    '<span class="chip">That is <b>' + fmt(r.stops, 1) + ' stops</b> lost — open up, slow down, or add light</span>' +
    '<span class="chip">Double the distance, quarter the light. Always. It is geometry, not opinion.</span>';
}

// ---------- Bench 5: the frame ----------
let gridMode = "thirds";
function frameDraw() {
  const cv = $("framecanvas"), ctx = cv.getContext("2d"), w = cv.width, h = cv.height;
  paintScene(ctx, w, h, w * 0.6);
  const asp = $("frameAsp").value;
  let cw = w, ch = h;
  if (asp !== "full") { const p = asp.split(":").map(Number), r = p[0] / p[1], fr = w / h; if (r > fr) ch = w / r; else cw = h * r; }
  const x0 = (w - cw) / 2, y0 = (h - ch) / 2;
  ctx.fillStyle = "rgba(10,10,12,0.45)";
  ctx.fillRect(0, 0, w, y0); ctx.fillRect(0, y0 + ch, w, h - y0 - ch); ctx.fillRect(0, y0, x0, ch); ctx.fillRect(x0 + cw, y0, w - x0 - cw, ch);
  ctx.strokeStyle = "#ffd678"; ctx.lineWidth = 1.6;
  const line = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  if (gridMode === "thirds") { for (const f of [1 / 3, 2 / 3]) { line(x0 + cw * f, y0, x0 + cw * f, y0 + ch); line(x0, y0 + ch * f, x0 + cw, y0 + ch * f); } }
  if (gridMode === "golden") { for (const f of [0.382, 0.618]) { line(x0 + cw * f, y0, x0 + cw * f, y0 + ch); line(x0, y0 + ch * f, x0 + cw, y0 + ch * f); } }
  if (gridMode === "diag") { line(x0, y0, x0 + cw, y0 + ch); line(x0 + cw, y0, x0, y0 + ch); }
  if (gridMode === "center") { line(x0 + cw / 2, y0, x0 + cw / 2, y0 + ch); line(x0, y0 + ch / 2, x0 + cw, y0 + ch / 2); }
  ctx.strokeStyle = "#fff"; ctx.strokeRect(x0, y0, cw, ch);
}

// ---------- wiring ----------
function init() {
  if ($("expcanvas")) { if (new URLSearchParams(location.search).has("audit")) exposureFrame(1200); else requestAnimationFrame(exposureLoop); }
  if ($("lenscanvas")) { $("lensF").addEventListener("input", lensDraw); lensDraw(); }
  if ($("dofcanvas")) { ["dofF", "dofN", "dofS", "dofC"].forEach(id => $(id).addEventListener("input", dofDraw)); dofDraw(); }
  if ($("lightcanvas")) { $("lightD").addEventListener("input", lightDraw); lightDraw(); }
  if ($("framecanvas")) {
    document.querySelectorAll(".gridbtns button").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll(".gridbtns button").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); gridMode = b.dataset.grid; frameDraw();
    }));
    $("frameAsp").addEventListener("change", frameDraw); frameDraw();
  }
  if (new URLSearchParams(location.search).has("audit")) {
    const out = [];
    out.push("EV f/16 1/125 ISO100 stopsOff vs EV15 = " + fmt(stopsOff(16, 1 / 125, 100, 15), 3));
    out.push("EV f/2.8 1/250 ISO400 stopsOff vs EV15 = " + fmt(stopsOff(2.8, 1 / 250, 400, 15), 3));
    const a = fov(50, 36, 24); out.push("FOV 50mm h/v/d = " + fmt(a.h, 2) + "/" + fmt(a.v, 2) + "/" + fmt(a.d, 2));
    const d1 = dof(50, 8, 0.029, 3000); out.push("DOF 50mm f/8 3m: H=" + fmt(d1.H / 1000, 2) + "m near=" + fmt(d1.near / 1000, 2) + "m far=" + fmt(d1.far / 1000, 2) + "m");
    const d2 = dof(35, 2, 0.029, 1500); out.push("DOF 35mm f/2 1.5m: H=" + fmt(d2.H / 1000, 2) + "m near=" + fmt(d2.near / 1000, 2) + "m far=" + fmt(d2.far / 1000, 2) + "m");
    const l = inverseSquare(2); out.push("Inverse square 2m: rel=" + fmt(l.rel, 3) + " stops=" + fmt(l.stops, 2));
    const pre = document.createElement("pre"); pre.id = "auditout"; pre.textContent = out.join("\n");
    document.body.appendChild(pre);
  }
}
document.addEventListener("DOMContentLoaded", init);
