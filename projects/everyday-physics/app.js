"use strict";
/* Everyday Physics — page wiring. The rules live in phys.js. */
(function () {
 const TAU = Math.PI * 2;
 const STEP_MS = 1000 / 60, MAX_FRAME_MS = 100, MAX_STEPS = 6;
 function $(id) { return document.getElementById(id); }
 function reduceMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
 }

 /* ================= The pool table ================= */
 const poolCv = $("pool-canvas"), pctx = poolCv.getContext("2d");
 const TABLE = { left: 70, top: 70, right: 830, bottom: 430 };
 const BALL_R = 16, POCKET_R = 25;
 const POCKETS = [
  { x: TABLE.left, y: TABLE.top }, { x: 450, y: TABLE.top - 4 }, { x: TABLE.right, y: TABLE.top },
  { x: TABLE.left, y: TABLE.bottom }, { x: 450, y: TABLE.bottom + 4 }, { x: TABLE.right, y: TABLE.bottom }];
 const FRICTION = 0.012;
 const poolOut = $("pool-result");
 let poolBalls, poolPaused = false, lastBounceMark = null, lastEvent = "";

 function rack() {
  poolBalls = [
   { id: 0, name: "cue ball", color: "#f4f1e6", x: 250, y: 250, vx: 0, vy: 0, r: BALL_R, potted: false },
   { id: 1, name: "Ball 1", color: "#f2c230", x: 570, y: 250, vx: 0, vy: 0, r: BALL_R, potted: false },
   { id: 2, name: "Ball 2", color: "#3e6fd9", x: 645, y: 208, vx: 0, vy: 0, r: BALL_R, potted: false },
   { id: 3, name: "Ball 3", color: "#d94f3d", x: 645, y: 292, vx: 0, vy: 0, r: BALL_R, potted: false },
   { id: 4, name: "Ball 4", color: "#7a4fd0", x: 720, y: 250, vx: 0, vy: 0, r: BALL_R, potted: false }];
  lastBounceMark = null;
 }
 rack();
 const allStopped = () => poolBalls.every(b => b.potted || (b.vx === 0 && b.vy === 0));
 const cueBall = () => poolBalls[0];

 function aim() {
  const a = Number($("pool-angle").value) * Math.PI / 180;
  return { x: Math.cos(a), y: Math.sin(a) };
 }

 /* What the cue ball would do if shot now: first contact (ball or cushion),
    used to draw the ghost line and the bounce angles. */
 function ghostPath() {
  const cue = cueBall(); if (cue.potted) return null;
  const d = aim();
  let best = null;
  for (const b of poolBalls) {
   if (b.id === 0 || b.potted) continue;
   const ox = b.x - cue.x, oy = b.y - cue.y;
   const proj = ox * d.x + oy * d.y;
   if (proj <= 0) continue;
   const perp2 = ox * ox + oy * oy - proj * proj, rr = 2 * BALL_R;
   if (perp2 >= rr * rr) continue;
   const t = proj - Math.sqrt(rr * rr - perp2);
   if (t > 0 && (!best || t < best.t)) best = { t, ball: b };
  }
  let tc = Infinity, surface = null;
  if (d.x > 0) { const t = (TABLE.right - BALL_R - cue.x) / d.x; if (t < tc) { tc = t; surface = "vertical"; } }
  if (d.x < 0) { const t = (TABLE.left + BALL_R - cue.x) / d.x; if (t < tc) { tc = t; surface = "vertical"; } }
  if (d.y > 0) { const t = (TABLE.bottom - BALL_R - cue.y) / d.y; if (t < tc) { tc = t; surface = "horizontal"; } }
  if (d.y < 0) { const t = (TABLE.top + BALL_R - cue.y) / d.y; if (t < tc) { tc = t; surface = "horizontal"; } }
  if (best && best.t < tc) return { kind: "ball", ball: best.ball, t: best.t };
  if (tc < Infinity) return { kind: "cushion", t: tc, surface };
  return null;
 }

 function drawPool() {
  const W = poolCv.width, H = poolCv.height;
  pctx.clearRect(0, 0, W, H);
  /* table: rails then felt */
  pctx.fillStyle = "#6d4a2f"; roundRect(pctx, 18, 18, W - 36, H - 36, 26); pctx.fill();
  pctx.fillStyle = "#2e7d4f"; roundRect(pctx, TABLE.left - 22, TABLE.top - 22, (TABLE.right - TABLE.left) + 44, (TABLE.bottom - TABLE.top) + 44, 18); pctx.fill();
  pctx.fillStyle = "#2e7d4f"; pctx.fillRect(TABLE.left, TABLE.top, TABLE.right - TABLE.left, TABLE.bottom - TABLE.top);
  for (const p of POCKETS) { pctx.fillStyle = "#101418"; pctx.beginPath(); pctx.arc(p.x, p.y, POCKET_R, 0, TAU); pctx.fill(); }
  const cue = cueBall();
  /* ghost aim + physics overlays, only while everything is at rest */
  if (allStopped() && !cue.potted) {
   const g = ghostPath(), d = aim();
   pctx.save();
   pctx.strokeStyle = "rgba(245,240,220,.85)"; pctx.setLineDash([7, 7]); pctx.lineWidth = 2;
   if (g) {
    const hx = cue.x + d.x * g.t, hy = cue.y + d.y * g.t;
    line(pctx, cue.x, cue.y, hx, hy);
    if (g.kind === "cushion") {
     const rd = g.surface === "vertical" ? { x: -d.x, y: d.y } : { x: d.x, y: -d.y };
     line(pctx, hx, hy, hx + rd.x * 130, hy + rd.y * 130);
     const ang = angleToSurface(d.x, d.y, g.surface);
     pctx.setLineDash([]);
     pctx.fillStyle = "#f5c369"; pctx.font = "700 17px system-ui";
     pctx.fillText("in " + ang + "°", hx + (g.surface === "vertical" ? (d.x > 0 ? -64 : 12) : 10), hy + (g.surface === "horizontal" ? (d.y > 0 ? -12 : 26) : -10));
     pctx.fillText("out " + ang + "°", hx + rd.x * 138 + (rd.x < 0 ? -52 : 6), hy + rd.y * 138 + 6);
    } else {
     const b = g.ball;
     const nx = (b.x - hx) / (2 * BALL_R), ny = (b.y - hy) / (2 * BALL_R);
     pctx.strokeStyle = "rgba(245,195,105,.95)";
     line(pctx, b.x, b.y, b.x + nx * 74, b.y + ny * 74);
     const dot = d.x * nx + d.y * ny;
     const sx = d.x - dot * nx, sy = d.y - dot * ny, sl = Math.hypot(sx, sy);
     if (sl > 0.08) { pctx.strokeStyle = "rgba(245,240,220,.6)"; line(pctx, hx, hy, hx + sx / sl * 58, hy + sy / sl * 58); }
     pctx.setLineDash([]);
     pctx.beginPath(); pctx.arc(hx, hy, BALL_R, 0, TAU); pctx.strokeStyle = "rgba(245,240,220,.5)"; pctx.stroke();
    }
   }
   pctx.restore();
  }
  /* last bounce annotation */
  if (lastBounceMark) {
   pctx.fillStyle = "#f5c369"; pctx.font = "700 16px system-ui";
   pctx.fillText(lastBounceMark.angle + "° in = " + lastBounceMark.angle + "° out", lastBounceMark.x + 12, lastBounceMark.y - 12);
   pctx.beginPath(); pctx.arc(lastBounceMark.x, lastBounceMark.y, 5, 0, TAU); pctx.fill();
  }
  /* balls */
  for (const b of poolBalls) {
   if (b.potted) continue;
   pctx.beginPath(); pctx.arc(b.x, b.y, BALL_R, 0, TAU); pctx.fillStyle = b.color; pctx.fill();
   pctx.lineWidth = 2; pctx.strokeStyle = "rgba(0,0,0,.35)"; pctx.stroke();
   if (b.id > 0) { pctx.fillStyle = "#fff"; pctx.beginPath(); pctx.arc(b.x, b.y, 8.5, 0, TAU); pctx.fill();
    pctx.fillStyle = "#14202b"; pctx.font = "700 12px system-ui"; pctx.textAlign = "center"; pctx.fillText(b.id, b.x, b.y + 4); pctx.textAlign = "left"; }
   if ($("pool-arrows").checked && (b.vx !== 0 || b.vy !== 0)) {
    const sp = Math.hypot(b.vx, b.vy), ux = b.vx / sp, uy = b.vy / sp, len = 26 + sp * 5;
    pctx.strokeStyle = "#ffb84d"; pctx.lineWidth = 3;
    line(pctx, b.x, b.y, b.x + ux * len, b.y + uy * len);
    pctx.beginPath();
    pctx.moveTo(b.x + ux * (len + 10), b.y + uy * (len + 10));
    pctx.lineTo(b.x + ux * len - uy * 6, b.y + uy * len + ux * 6);
    pctx.lineTo(b.x + ux * len + uy * 6, b.y + uy * len - ux * 6);
    pctx.closePath(); pctx.fillStyle = "#ffb84d"; pctx.fill();
   }
  }
 }
 function line(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
 function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

 function stepPool() {
  if (!allStopped()) {
   for (const b of poolBalls) {
    if (b.potted || (b.vx === 0 && b.vy === 0)) continue;
    const before = { vx: b.vx, vy: b.vy };
    const s = poolStep({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: b.r }, TABLE, FRICTION);
    b.x = s.x; b.y = s.y; b.vx = s.vx; b.vy = s.vy;
    if (s.bounce) {
     const surf = (s.bounce === "left" || s.bounce === "right") ? "vertical" : "horizontal";
     const ang = angleToSurface(before.vx, before.vy, surf);
     lastBounceMark = { x: b.x, y: b.y, angle: ang };
     lastEvent = b.name + " off the " + s.bounce + " cushion: " + ang + "° in, " + ang + "° out — the reflection rule. The cushion hands back the sideways part of the speed untouched and flips the part that ran into it.";
    }
   }
   /* pockets */
   for (const b of poolBalls) {
    if (b.potted) continue;
    for (const p of POCKETS) {
     if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R) {
      b.potted = true; b.vx = 0; b.vy = 0;
      lastEvent = b.id === 0 ? "The cue ball is potted (a scratch). It will come back to the head spot once everything stops." :
       b.name + " is potted. Gone from the table — its momentum went into the pocket, not into another ball.";
      break;
     }
    }
   }
   /* collisions */
   for (let i = 0; i < poolBalls.length; i++) for (let j = i + 1; j < poolBalls.length; j++) {
    const a = poolBalls[i], c = poolBalls[j];
    if (a.potted || c.potted) continue;
    const dx = c.x - a.x, dy = c.y - a.y, dist = Math.hypot(dx, dy);
    if (dist === 0 || dist >= 2 * BALL_R) continue;
    const nx = dx / dist, ny = dy / dist, overlap = (2 * BALL_R - dist) / 2;
    a.x -= nx * overlap; a.y -= ny * overlap; c.x += nx * overlap; c.y += ny * overlap;
    const hit = collideEqualMass(a, c);
    if (hit) {
     a.vx = hit.a.vx; a.vy = hit.a.vy; c.vx = hit.b.vx; c.vy = hit.b.vy;
     lastEvent = (a.id === 0 || c.id === 0)
      ? "The cue ball's hit: " + (a.id === 0 ? c.name : a.name) + " took the part of the cue ball's speed that pointed along the line between their centres; the cue ball kept the sideways part. Nothing was lost — the momentum just changed pockets."
      : a.name + " and " + c.name + " swapped the parts of their speed that pointed along the line between their centres. Total momentum after the hit is exactly what it was before.";
    }
   }
   if (allStopped()) {
    if (cueBall().potted) { const cue = cueBall(); cue.potted = false; cue.x = 250; cue.y = 250; }
    if (lastEvent) poolOut.innerHTML = "<p>" + lastEvent + "</p>";
   }
  }
 }
 let poolRaf = null, poolLast = null, poolAcc = 0;
 function poolLoop(now) {
  poolRaf = null;
  const dt = clampedElapsed(poolLast, now, MAX_FRAME_MS);
  poolLast = now;
  if (!poolPaused) {
   const run = consumeSteps(poolAcc + dt, STEP_MS, MAX_STEPS);
   poolAcc = run.acc;
   for (let i = 0; i < run.steps; i++) stepPool();
  }
  drawPool();
  if (!allStopped() && !poolPaused) {
   poolRaf = requestAnimationFrame(poolLoop);
  } else {
   poolLast = null; poolAcc = 0;
  }
 }
 function startPoolLoop() {
  if (poolRaf != null) return;
  poolLast = null; poolAcc = 0;
  poolRaf = requestAnimationFrame(poolLoop);
 }
 $("pool-angle").addEventListener("input", () => { $("pool-angle-val").textContent = $("pool-angle").value + "°"; });
 $("pool-power").addEventListener("input", () => { $("pool-power-val").textContent = $("pool-power").value; });
 $("pool-shoot").addEventListener("click", () => {
  if (!allStopped()) return;
  const cue = cueBall(), d = aim(), p = Number($("pool-power").value);
  cue.vx = d.x * p; cue.vy = d.y * p; lastEvent = ""; lastBounceMark = null;
  poolOut.innerHTML = "<p>The cue ball is away at power " + p + ". Watch the arrows: speed is a direction as well as a size.</p>";
  startPoolLoop();
 });
 $("pool-pause").addEventListener("click", () => {
  poolPaused = !poolPaused;
  $("pool-pause").textContent = poolPaused ? "Resume" : "Pause";
  if (!poolPaused && !allStopped()) startPoolLoop();
 });
 $("pool-step").addEventListener("click", () => {
  if (!poolPaused) { poolPaused = true; $("pool-pause").textContent = "Resume"; }
  stepPool(); /* exactly one frame of motion, collisions and all */
  drawPool();
 });
 $("pool-reset").addEventListener("click", () => { rack(); poolOut.innerHTML = "<p>Fresh table. Aim with the slider or by pointing on the table, set the power, and shoot.</p>"; drawPool(); });
 poolCv.addEventListener("pointerdown", (e) => {
  if (!allStopped()) return;
  const rect = poolCv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * poolCv.width / rect.width;
  const y = (e.clientY - rect.top) * poolCv.height / rect.height;
  const cue = cueBall();
  let deg = Math.atan2(y - cue.y, x - cue.x) * 180 / Math.PI; if (deg < 0) deg += 360;
  $("pool-angle").value = Math.round(deg);
  $("pool-angle-val").textContent = Math.round(deg) + "°";
  drawPool();
 });
 drawPool();

 /* ================= The ballistics launcher ================= */
 const balCv = $("bal-canvas"), bctx = balCv.getContext("2d");
 const BAL = { x0: 70, ground: 400, pxPerM: 13, targetM: 45 };
 const balOut = $("bal-result");
 let balShots = []; /* {points:[{x,y}], color, hit} */
 let balFlight = null; /* {speed, angle, t, points} */
 let targetHit = false;
 const balColors = ["#f5c369", "#7fdddb", "#f28ba8", "#a8d97f"];

 function balXY(xM, yM) { return { x: BAL.x0 + xM * BAL.pxPerM, y: Math.max(8, BAL.ground - yM * BAL.pxPerM) }; }
 function drawTarget() {
  const base = balXY(BAL.targetM, 0), w = 2.2 * BAL.pxPerM, bh = 1.1 * BAL.pxPerM;
  bctx.save();
  bctx.fillStyle = targetHit ? "#8a6a45" : "#b0824f";
  bctx.strokeStyle = "#5d4326"; bctx.lineWidth = 2;
  const blocks = targetHit
   ? [[0, 0, 0.5], [w * 0.4, 0, -0.4], [w * 0.2, -bh, 0.9]]
   : [[0, 0, 0], [w, 0, 0], [w * 0.5, -bh, 0]];
  for (const [ox, oy, rot] of blocks) {
   bctx.save(); bctx.translate(base.x + ox, base.y + oy); bctx.rotate(rot);
   bctx.fillRect(-w / 2, -bh, w, bh); bctx.strokeRect(-w / 2, -bh, w, bh); bctx.restore();
  }
  bctx.fillStyle = "#9db4c0"; bctx.font = "13px system-ui"; bctx.textAlign = "center";
  bctx.fillText("target · " + BAL.targetM + " m", base.x + w / 2, base.y + 20); bctx.textAlign = "left";
  bctx.restore();
 }
 function drawBal() {
  const W = balCv.width, H = balCv.height;
  bctx.clearRect(0, 0, W, H);
  bctx.fillStyle = "#87b5d6"; bctx.fillRect(0, 0, W, BAL.ground);
  bctx.fillStyle = "#5d7a43"; bctx.fillRect(0, BAL.ground, W, H - BAL.ground);
  bctx.strokeStyle = "rgba(20,32,43,.35)"; bctx.lineWidth = 1;
  for (let m = 0; m <= 60; m += 5) { const p = balXY(m, 0); bctx.beginPath(); bctx.moveTo(p.x, BAL.ground); bctx.lineTo(p.x, BAL.ground + (m % 10 === 0 ? 12 : 7)); bctx.stroke();
   if (m % 10 === 0) { bctx.fillStyle = "#20303c"; bctx.font = "12px system-ui"; bctx.textAlign = "center"; bctx.fillText(m + " m", p.x, BAL.ground + 28); bctx.textAlign = "left"; } }
  /* launcher */
  const ang = (balFlight ? balFlight.angle : Number($("bal-angle").value)) * Math.PI / 180;
  const lp = balXY(0, 0);
  bctx.save(); bctx.translate(lp.x, lp.y); bctx.rotate(-ang);
  bctx.fillStyle = "#8a5a33"; bctx.fillRect(0, -7, 52, 14);
  bctx.fillStyle = "#5d4326"; bctx.fillRect(44, -10, 8, 20); bctx.restore();
  bctx.fillStyle = "#6d4a2f"; bctx.fillRect(lp.x - 16, lp.y - 4, 34, 10);
  drawTarget();
  for (const s of balShots) {
   bctx.fillStyle = s.color;
   for (const pt of s.points) { const p = balXY(pt.x, pt.y); bctx.beginPath(); bctx.arc(p.x, p.y, 3, 0, TAU); bctx.fill(); }
  }
  if (balFlight) {
   bctx.fillStyle = "#14202b";
   for (const pt of balFlight.points) { const p = balXY(pt.x, pt.y); bctx.beginPath(); bctx.arc(p.x, p.y, 3.4, 0, TAU); bctx.fill(); }
   const last = balFlight.points[balFlight.points.length - 1];
   if (last) { const p = balXY(last.x, last.y); bctx.beginPath(); bctx.arc(p.x, p.y, 8, 0, TAU); bctx.fillStyle = "#d94f3d"; bctx.fill(); bctx.strokeStyle = "#14202b"; bctx.stroke(); }
  }
 }
 let balRaf = null, balLast = null, balAcc = 0;
 function balAdvance(dtSec) {
  if (!balFlight) return;
  const f = balFlight, info = projectileFlight(f.speed, f.angle);
  f.t += dtSec;
  const pos = projectileAt(f.speed, f.angle, f.t);
  if (pos.y <= 0 && f.t > 0) {
   f.points.push({ x: info.range, y: 0 });
   const hit = Math.abs(info.range - (BAL.targetM + 1.1)) <= 1.6;
   if (hit) targetHit = true;
   balShots.push({ points: f.points, color: balColors[balShots.length % balColors.length], hit });
   if (balShots.length > 4) balShots.shift();
   balOut.innerHTML = "<p><strong>Landed at " + info.range + " m</strong> after " + info.flightTime + " s in the air, highest point " + info.apex + " m. " +
    (hit ? "<strong>Target hit!</strong> The stack is down — that arc threaded the whole range and arrived at the target's doorstep." :
     "The target stands at " + BAL.targetM + " m. " + (info.range < BAL.targetM ? "Too short: more speed, or an angle closer to 45°." : "Too long: less speed, or a steeper angle to trade distance for height.")) + "</p>";
   balFlight = null;
  } else {
   f.points.push(pos);
   balOut.innerHTML = "<p>Flying: " + pos.x + " m out, " + Math.max(0, pos.y) + " m up. Gravity is bending the path down the whole way — the dots are the same curve every throw makes.</p>";
  }
 }
 function balLoop(now) {
  balRaf = null;
  const dt = clampedElapsed(balLast, now, MAX_FRAME_MS);
  balLast = now;
  const run = consumeSteps(balAcc + dt, STEP_MS, MAX_STEPS);
  balAcc = run.acc;
  for (let i = 0; i < run.steps; i++) balAdvance(STEP_MS / 1000);
  drawBal();
  if (balFlight) balRaf = requestAnimationFrame(balLoop);
  else { balLast = null; balAcc = 0; }
 }
 function startBalLoop() {
  if (balRaf != null) return;
  balLast = null; balAcc = 0;
  balRaf = requestAnimationFrame(balLoop);
 }
 function launch(speed, angle, quiet) {
  const info = projectileFlight(speed, angle);
  if (!info.ok) { balOut.textContent = info.error; return; }
  targetHit = false;
  balFlight = { speed, angle, t: 0, points: [{ x: 0, y: 0 }] };
  if (!quiet) balOut.innerHTML = "<p>Launched at " + angle + "° and " + speed + " m/s. The sums promise: highest point " + info.apex + " m, flight time " + info.flightTime + " s, range " + info.range + " m. Watch whether the dots agree.</p>";
  startBalLoop();
 }
 $("bal-angle").addEventListener("input", () => { $("bal-angle-val").textContent = $("bal-angle").value + "°"; if (!balFlight) drawBal(); });
 $("bal-speed").addEventListener("input", () => { $("bal-speed-val").textContent = $("bal-speed").value + " m/s"; });
 $("bal-launch").addEventListener("click", () => launch(Number($("bal-speed").value), Number($("bal-angle").value), false));
 $("bal-compare").addEventListener("click", () => {
  const speed = Number($("bal-speed").value);
  balShots = []; targetHit = false;
  for (const a of [30, 45, 60]) {
   const info = projectileFlight(speed, a), pts = [];
   for (let t = 0; t <= info.flightTime; t += info.flightTime / 40) pts.push(projectileAt(speed, a, t));
   pts.push({ x: info.range, y: 0 });
   balShots.push({ points: pts, color: balColors[[30, 45, 60].indexOf(a)], hit: false });
  }
  balFlight = null;
  const r = a => projectileFlight(speed, a).range;
  balOut.innerHTML = "<p>Same speed (" + speed + " m/s), three angles. 30° landed at " + r(30) + " m, 45° at " + r(45) + " m, 60° at " + r(60) + " m. 30° and 60° land together — partners around 45° always do — and 45° beats them both. Steeper is higher and shorter; shallower is flatter and, past 45°, shorter too.</p>";
  drawBal();
 });
 $("bal-clear").addEventListener("click", () => { balShots = []; balFlight = null; targetHit = false; balOut.innerHTML = "<p>Range cleared. Set the angle and speed, and launch.</p>"; drawBal(); });
 drawBal();

 /* ================= The pendulum ================= */
 const penCv = $("pen-canvas"), nctx = penCv.getContext("2d");
 let penWeight = 0.5, penStart = performance.now(), penRaf = null;
 const PEN_W = [{ kg: 0.1, r: 13, label: "Light bob · 0.1 kg" }, { kg: 0.5, r: 19, label: "Middle bob · 0.5 kg" }, { kg: 2, r: 27, label: "Heavy bob · 2 kg" }];
 for (const w of PEN_W) {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = w.label; if (w.kg === penWeight) b.classList.add("active");
  b.addEventListener("click", () => {
   penWeight = w.kg;
   for (const x of $("pen-weights").querySelectorAll("button")) x.classList.toggle("active", x === b);
   penReadout();
  });
  $("pen-weights").appendChild(b);
 }
 function penAngle() { return Number($("pen-angle").value); }
 function penReadout() {
  const L = Number($("pen-length").value), ang = penAngle(), info = pendulumPeriod(L, ang);
  $("pen-length-val").textContent = L.toFixed(2) + " m";
  $("pen-angle-val").textContent = ang + "°";
  if (!info.ok) { $("pen-result").textContent = info.error; return; }
  const wide = ang >= 20;
  $("pen-result").innerHTML = "<p><strong>Period: " + info.period + " s</strong> — one full swing out and back — for a " + L.toFixed(2) + " m string at a " + ang + "° swing. The bob right now weighs " + penWeight + " kg, and the period does not care: swap the bob, the count stays " + info.period + " s. " +
   (wide
    ? "A wide swing runs a little long: the small-swing sum T = 2 × π × √(" + L.toFixed(2) + " ÷ 9.8) would be " + info.smallPeriod + " s, and the standard large-angle correction stretches that to " + info.period + " s."
    : "For this small, honest swing, width hardly changes the count: T = 2 × π × √(" + L.toFixed(2) + " ÷ 9.8) is " + info.smallPeriod + " s, and the large-angle correction leaves it at " + info.period + " s. Widen the swing and the period creeps longer.") + "</p>";
  if (reduceMotion()) drawPen(performance.now());
 }
 function drawPen(now) {
  const L = Number($("pen-length").value), ang = penAngle(), info = pendulumPeriod(L, ang);
  const W = penCv.width, H = penCv.height, px = 230, py = 34, pxPerM = 128;
  nctx.clearRect(0, 0, W, H);
  nctx.fillStyle = "#6d4a2f"; nctx.fillRect(px - 90, py - 12, 180, 12);
  if (info.ok) {
   const amp = ang * Math.PI / 180;
   const th = reduceMotion() ? 0 : amp * Math.cos(TAU * ((now - penStart) / 1000) / info.period);
   const bx = px + Math.sin(th) * L * pxPerM, by = py + Math.cos(th) * L * pxPerM;
   const bob = PEN_W.find(w => w.kg === penWeight) || PEN_W[1];
   nctx.strokeStyle = "#d9e5ed"; nctx.lineWidth = 2.5;
   line(nctx, px, py, bx, by);
   nctx.beginPath(); nctx.arc(bx, by, bob.r, 0, TAU); nctx.fillStyle = "#b0824f"; nctx.fill(); nctx.strokeStyle = "#5d4326"; nctx.stroke();
   nctx.fillStyle = "#9db4c0"; nctx.font = "13px system-ui"; nctx.textAlign = "center";
   nctx.fillText(L.toFixed(2) + " m of string · " + ang + "° swing", px, H - 12); nctx.textAlign = "left";
  }
 }
 function penLoop(now) {
  penRaf = null;
  drawPen(now);
  if (!reduceMotion()) penRaf = requestAnimationFrame(penLoop);
 }
 $("pen-length").addEventListener("input", penReadout);
 $("pen-angle").addEventListener("input", penReadout);
 penReadout();
 if (reduceMotion()) drawPen(performance.now());
 else penRaf = requestAnimationFrame(penLoop);

 /* ================= The seesaw ================= */
 const seeCv = $("see-canvas"), sctx = seeCv.getContext("2d");
 const SEE = { heavyKg: 40, lightKg: 20 };
 function drawSeesaw() {
  const hd = Number($("see-heavy").value), ld = Number($("see-light").value);
  const st = seesaw(SEE.heavyKg, hd, SEE.lightKg, ld);
  $("see-heavy-val").textContent = hd + (hd === 1 ? " step" : " steps");
  $("see-light-val").textContent = ld + (ld === 1 ? " step" : " steps");
  const W = seeCv.width, H = seeCv.height, cx = W / 2, cy = 208, stepPx = 34;
  sctx.clearRect(0, 0, W, H);
  sctx.fillStyle = "#5d7a43"; sctx.fillRect(0, 252, W, H - 252);
  const tilt = st.ok ? (st.balanced ? 0 : (st.tips === "heavy" ? -0.13 : 0.13)) : 0;
  sctx.save(); sctx.translate(cx, cy); sctx.rotate(tilt);
  sctx.fillStyle = "#8a5a33"; sctx.fillRect(-196, -7, 392, 14);
  sctx.fillStyle = "#5d4326";
  for (let sIdx = 1; sIdx <= 4; sIdx++) { sctx.fillRect(-sIdx * stepPx - 1, -12, 2, 10); sctx.fillRect(sIdx * stepPx - 1, -12, 2, 10); }
  function weight(distSteps, kg, side, color) {
   if (distSteps === 0) return;
   const x = side * distSteps * stepPx, size = kg >= 40 ? 52 : 40;
   sctx.fillStyle = color; sctx.fillRect(x - size / 2, -7 - size, size, size);
   sctx.fillStyle = "#14202b"; sctx.font = "700 14px system-ui"; sctx.textAlign = "center";
   sctx.fillText(kg + " kg", x, -7 - size / 2 + 5); sctx.textAlign = "left";
  }
  weight(hd, SEE.heavyKg, -1, "#d94f3d");
  weight(ld, SEE.lightKg, 1, "#3e6fd9");
  sctx.restore();
  sctx.beginPath(); sctx.moveTo(cx - 26, 254); sctx.lineTo(cx + 26, 254); sctx.lineTo(cx, cy + 4); sctx.closePath();
  sctx.fillStyle = "#6d4a2f"; sctx.fill();
  if (st.ok) {
   const bal = seesawBalanceDistance(SEE.heavyKg, hd, SEE.lightKg);
   $("see-result").innerHTML = "<p><strong>" + (st.balanced ? "Balanced." : st.tips === "heavy" ? "The heavy side goes down." : "The light side goes down.") + "</strong> " +
    "Heavy side: " + SEE.heavyKg + " kg × " + hd + " steps = " + st.heavyTorque + ". Light side: " + SEE.lightKg + " kg × " + ld + " steps = " + st.lightTorque + ". " +
    (st.balanced ? "The pushes match, so the beam floats level — weight times distance is the whole story."
     : (hd > 0 && bal !== null ? "To balance this from the light side, the 20 kg weight would need to sit at " + bal + " steps out." : "Distance is leverage: the same weight pushes harder the further out it sits.")) + "</p>";
  }
 }
 $("see-heavy").addEventListener("input", drawSeesaw);
 $("see-light").addEventListener("input", drawSeesaw);
 drawSeesaw();
})();
