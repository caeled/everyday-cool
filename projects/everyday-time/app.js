"use strict";
/* Everyday Time — page wiring. The rules live in time.js. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function parseDateInput(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!m) return null;
    return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  }
  function hourLabel(h) {
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    const ap = hr < 12 ? "AM" : "PM";
    const h12 = hr % 12 === 0 ? 12 : hr % 12;
    return h12 + (min ? ":" + String(min).padStart(2, "0") : "") + " " + ap;
  }

  /* ---------------- 01 · The sundial bench ---------------- */
  const dialSvg = $("dial-svg");
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  const DIAL_C = { x: 200, y: 208 }, DIAL_R = 178;
  function drawDial(lat, hour) {
    while (dialSvg.firstChild) dialSvg.removeChild(dialSvg.firstChild);
    const plate = svgEl("rect", { x: 8, y: 8, width: 384, height: 232, rx: 14, class: "dial-plate" });
    dialSvg.appendChild(plate);
    // The hour lines, 6 AM to 6 PM.
    const ends = {};
    for (let h = 6; h <= 18; h++) {
      const a = sundialHourAngle(lat, h) * Math.PI / 180;
      const x = DIAL_C.x + DIAL_R * Math.sin(a), y = DIAL_C.y - DIAL_R * Math.cos(a);
      ends[h] = { x, y };
      dialSvg.appendChild(svgEl("line", { x1: DIAL_C.x, y1: DIAL_C.y, x2: x, y2: y, class: "dial-line" + (h === 12 ? " dial-noon" : "") }));
      const lx = DIAL_C.x + (DIAL_R - 24) * Math.sin(a), ly = DIAL_C.y - (DIAL_R - 24) * Math.cos(a);
      const t = svgEl("text", { x: lx, y: ly + 4, class: "dial-label", "text-anchor": "middle" });
      t.textContent = h === 12 ? "12" : (h < 12 ? h + "a" : (h - 12) + "p");
      dialSvg.appendChild(t);
    }
    // North marker at the top of the noon line.
    const nt = svgEl("text", { x: DIAL_C.x, y: 26, class: "dial-north", "text-anchor": "middle" });
    nt.textContent = "N ↑";
    dialSvg.appendChild(nt);
    // The shadow for the chosen hour falls exactly along its hour line —
    // that is the whole invention.
    const aH = sundialHourAngle(lat, hour) * Math.PI / 180;
    const sx = DIAL_C.x + DIAL_R * Math.sin(aH), sy = DIAL_C.y - DIAL_R * Math.cos(aH);
    dialSvg.appendChild(svgEl("line", { x1: DIAL_C.x, y1: DIAL_C.y, x2: sx, y2: sy, class: "dial-shadow" }));
    dialSvg.appendChild(svgEl("circle", { cx: sx, cy: sy, r: 5, class: "dial-tip" }));
    // The gnomon: the triangular blade whose sloping edge casts the shadow.
    dialSvg.appendChild(svgEl("polygon", { points: DIAL_C.x + "," + DIAL_C.y + " " + DIAL_C.x + "," + (DIAL_C.y - 88) + " " + (DIAL_C.x - 22) + "," + DIAL_C.y, class: "dial-gnomon" }));
  }
  function currentPreset() { return SUNDIAL_PRESETS[Number($("dial-preset").value)] || SUNDIAL_PRESETS[0]; }
  function runDial() {
    const preset = currentPreset();
    const lat = Number($("dial-lat").value);
    const hour = Number($("dial-hour").value);
    $("dial-lat-val").textContent = fmt(lat, 1) + "°N";
    $("dial-hour-val").textContent = hourLabel(hour) + " solar time";
    drawDial(lat, hour);
    const angle = sundialHourAngle(lat, hour);
    const date = parseDateInput($("dial-date").value) || { y: 2026, m: 11, d: 20 };
    const doy = dayOfYear(date.y, date.m, date.d);
    const vs = sundialVsClock(doy, preset.lon, preset.meridian);
    const behind = vs.total < 0;
    const eotTxt = vs.eot >= 0
      ? "the equation of time puts the sun <strong>" + fmt(Math.abs(vs.eot), 0) + " minutes ahead</strong> of the steady clock"
      : "the equation of time puts the sun <strong>" + fmt(Math.abs(vs.eot), 0) + " minutes behind</strong> the steady clock";
    const lonTxt = "and " + esc(preset.name.split(" — ")[0]) + " sits " + fmt(Math.abs(preset.lon - preset.meridian), 1) + "° " +
      (preset.lon < preset.meridian ? "west" : "east") + " of its time zone's standard meridian (" + esc(preset.zone) + "), worth <strong>" +
      fmt(Math.abs(vs.longitudeShift), 0) + " minutes</strong> the " + (vs.longitudeShift < 0 ? "slow" : "fast") + " way";
    $("dial-result").innerHTML =
      "<p class='big-answer'>At " + hourLabel(hour) + ", the shadow lies " + fmt(Math.abs(angle), 1) + "° " + (angle < 0 ? "west" : angle > 0 ? "east" : "") + " of the noon line</p>" +
      "<p>tan(angle) = sin(" + fmt(lat, 1) + "°) × tan(" + fmt(Math.abs(hour - 12) * 15, 0) + "°) — the latitude squeezes the sun's even 15°-an-hour march into the dial's uneven lines. " +
      (lat === 0 ? "<strong>At the equator the squeeze is total:</strong> sin(0°) = 0, every hour line lands on the noon line, and a horizontal sundial simply cannot be built — equatorial dials tilt the plate instead." : "Near the equator the lines crowd together; toward the poles they spread.") + "</p>" +
      "<p><strong>Sundial vs. clock in " + esc(preset.name.split(" — ")[0]) + ", on " + MONTHS[date.m - 1] + " " + date.d + ":</strong> " + eotTxt + ", " + lonTxt +
      ". Net: a sundial there reads about <strong>" + fmt(Math.abs(vs.total), 0) + " minutes " + (behind ? "behind" : "ahead of") + " your clock</strong> — before daylight saving pushes the clock another hour away from the sun.</p>";
  }
  $("dial-preset").addEventListener("change", () => {
    const p = currentPreset();
    $("dial-lat").value = p.lat;
    runDial();
  });
  $("dial-lat").addEventListener("input", runDial);
  $("dial-hour").addEventListener("input", runDial);
  $("dial-date").addEventListener("change", runDial);
  (function fillPresets() {
    const sel = $("dial-preset");
    SUNDIAL_PRESETS.forEach((p, i) => {
      const o = document.createElement("option");
      o.value = i; o.textContent = p.name + " — " + fmt(Math.abs(p.lat), 1) + "°" + (p.lat >= 0 ? "N" : "S");
      sel.appendChild(o);
    });
    sel.value = "0";
    $("dial-lat").value = SUNDIAL_PRESETS[0].lat;
  })();
  runDial();

  /* ---------------- 02 · The leap-year machine ---------------- */
  function gateRow(num, question, state, note) {
    return "<div class='gate-row " + state + "'><span class='gate-num'>GATE " + num + "</span><span class='gate-q'>" +
      esc(question) + "</span><span class='gate-note'>" + note + "</span></div>";
  }
  function runLeap() {
    const year = Math.trunc(Number($("leap-year").value));
    if (!isFinite(year) || $("leap-year").value === "") { $("leap-gates").innerHTML = ""; $("leap-result").innerHTML = "<p>Give the machine a year.</p>"; return; }
    const info = leapInfo(year);
    let rows = "", verdict = "";
    rows += gateRow(1, year + " ÷ 4 = " + (info.byFour ? fmt(year / 4, 0) + " exactly" : "not a whole number"),
      info.byFour ? "pass" : "stop",
      info.byFour ? "Passes. Most years stop here and are not leap years; this one goes on." : "Stopped. An ordinary year: 365 days.");
    if (info.byFour) {
      rows += gateRow(2, year + " ÷ 100 = " + (info.byHundred ? fmt(year / 100, 0) + " exactly" : "not a whole number"),
        info.byHundred ? "warn" : "pass",
        info.byHundred ? "A century year. The ÷4 leap is cancelled — unless gate 3 restores it." : "Not a century year, so the ÷4 verdict stands.");
      if (info.byHundred) {
        rows += gateRow(3, year + " ÷ 400 = " + (info.byFourHundred ? fmt(year / 400, 0) + " exactly" : "not a whole number"),
          info.byFourHundred ? "pass" : "stop",
          info.byFourHundred ? "Restored! The rarest leap years of all — one a century gets its February 29 back." : "Not restored. The century year keeps its 365 days.");
      }
    }
    verdict = info.leap
      ? "<p class='big-answer'>" + year + " IS a leap year — February has 29 days</p>"
      : "<p class='big-answer'>" + year + " is NOT a leap year — 365 days</p>";
    $("leap-gates").innerHTML = rows;
    $("leap-result").innerHTML = verdict +
      "<p>The rule averages <strong>365.2425 days</strong> a year (365 + ¼ − 1⁄100 + 1⁄400). The real year is ≈365.2422 days, so the calendar gains about a day every 3,200 years — close enough that nobody alive needs to care, and the machine says so rather than pretending it is exact.</p>";
  }
  $("leap-year").addEventListener("input", runLeap);
  document.querySelectorAll("[data-year]").forEach((b) => b.addEventListener("click", () => { $("leap-year").value = b.dataset.year; runLeap(); }));
  runLeap();

  /* ---------------- 03 · Time zones ---------------- */
  function runZones() {
    const date = parseDateInput($("zone-date").value) || { y: 2026, m: 11, d: 20 };
    const hourUtc = Number($("zone-hour").value);
    $("zone-hour-val").textContent = String(hourUtc).padStart(2, "0") + ":00 UTC — " + WEEKDAYS[weekdayIndex(daysFromCivil(date.y, date.m, date.d))] + ", " + MONTHS[date.m - 1] + " " + date.d + ", " + date.y;
    const rows = zoneReadout(daysFromCivil(date.y, date.m, date.d), hourUtc);
    $("zone-result").innerHTML =
      "<table class='trap'><tr><th>City</th><th>Standard offset</th><th>There, it is</th><th>Day</th></tr>" +
      rows.map((r) =>
        "<tr><td>" + esc(r.name) + "<br><span class='fine'>" + esc(r.zone) + "</span></td><td>UTC" + (r.offset < 0 ? "−" + Math.abs(r.offset) : "+" + r.offset) + "</td><td><strong>" +
        r.weekday + ", " + hourLabel(r.hour) + "</strong></td><td>" + (r.dayShift === 0 ? "same day" : r.dayShift > 0 ? "a day ahead" : "a day behind") + "</td></tr>").join("") +
      "</table>";
    $("zone-dst").innerHTML = rows.map((r) => "<li><strong>" + esc(r.name) + ":</strong> " + esc(r.dst) + "</li>").join("");
  }
  $("zone-date").addEventListener("change", runZones);
  $("zone-hour").addEventListener("input", runZones);
  runZones();

  /* ---------------- 04 · The scale ladder ---------------- */
  let ladderSel = 5; // the year
  function renderLadder() {
    $("ladder-list").innerHTML = LADDER.map((r, i) =>
      "<button type='button' class='step-btn" + (i === ladderSel ? " active" : "") + "' data-rung='" + i + "'><span class='step-name'>" +
      esc(r.name) + "</span><span class='step-factor'>" + fmt(r.seconds, r.seconds < 1000 ? 0 : 0) + " s</span><span class='step-meaning'>" + esc(r.anchor) + "</span></button>").join("");
    document.querySelectorAll("[data-rung]").forEach((b) => b.addEventListener("click", () => { ladderSel = Number(b.dataset.rung); renderLadder(); }));
    const r = LADDER[ladderSel];
    let contains = "";
    if (ladderSel > 0) {
      const prev = LADDER[ladderSel - 1];
      contains = "<p>That is <strong>" + fmt(r.seconds / prev.seconds, r.seconds / prev.seconds < 100 ? 2 : 0) + " × " + esc(prev.name.toLowerCase()) + "</strong>" +
        (ladderSel > 1 ? ", and " + fmt(r.seconds / LADDER[ladderSel - 2].seconds, 0) + " × " + esc(LADDER[ladderSel - 2].name.toLowerCase()) : "") + ".</p>";
    }
    $("ladder-result").innerHTML = "<p class='big-answer'>" + esc(r.name) + " = " + fmt(r.seconds, 0) + " seconds</p><p>" + esc(r.anchor) + "</p>" + contains;
  }
  renderLadder();
  function runHeartbeats() {
    const age = Number($("hb-age").value), bpm = Number($("hb-bpm").value);
    if (!(age > 0) || !(bpm > 0)) { $("hb-result").innerHTML = "<p>Give it an age and a resting heart rate.</p>"; return; }
    const beats = lifetimeHeartbeats(age, bpm), secs = lifetimeSeconds(age);
    $("hb-result").innerHTML =
      "<p class='big-answer'>About " + fmt(beats / 1e9, 2) + " billion heartbeats</p>" +
      "<p>" + fmt(bpm, 0) + " beats a minute × 60 × 24 × 365.2425 × " + fmt(age, 0) + " years = <strong>" + fmt(beats, 0) + " beats</strong>. " +
      "The same life is " + fmt(secs / 1e9, 2) + " billion seconds long — and the two numbers land close because a resting heart beats about once a second. A human life, counted either way, comes out near <em>three billion</em>.</p>" +
      "<p class='fine'>Honestly: nobody's heart holds one rate for a lifetime — it races, sleeps, and slows. This is the size of the number, not a reading from anyone's chest.</p>";
  }
  $("hb-age").addEventListener("input", runHeartbeats);
  $("hb-bpm").addEventListener("input", runHeartbeats);
  runHeartbeats();

  /* ---------------- 05 · The pendulum bench ---------------- */
  let pendT = pendulumPeriod(1);
  function runPendulum() {
    const cm = Number($("pend-len").value);
    const L = cm / 100;
    pendT = pendulumPeriod(L);
    $("pend-len-val").textContent = fmt(cm, 0) + " cm";
    const ticks = 7200 / pendT; // one tick each half-period
    $("pend-result").innerHTML =
      "<p class='big-answer'>Period " + fmt(pendT, 2) + " s — about " + fmt(ticks, 0) + " ticks an hour</p>" +
      "<p>T = 2π√(L/g) = 2π√(" + fmt(L, 2) + " ÷ 9.81) = " + fmt(pendT, 3) + " s, and a clock ticks at each end of the swing, so it ticks every " + fmt(pendT / 2, 2) + " s. " +
      (Math.abs(L - secondsPendulumLength()) < 0.02
        ? "You are standing on the <strong>seconds pendulum</strong>: 0.994 m, ticking exactly once a second — the length that set the height of a grandfather clock."
        : "The grandfather-clock length is 0.994 m — one tick a second. Slide toward it and watch the period settle on 2.00 s.") + "</p>";
    const rod = $("pend-rod"), bob = $("pend-bob");
    const px = 46 + L * 62;
    rod.setAttribute("y2", 26 + px);
    bob.setAttribute("cy", 26 + px);
  }
  $("pend-len").addEventListener("input", runPendulum);
  runPendulum();
  (function swing() {
    const g = $("pend-swing");
    function frame(now) {
      const a = 13 * Math.sin(2 * Math.PI * (now / 1000) / pendT);
      g.setAttribute("transform", "rotate(" + a.toFixed(2) + " 150 26)");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------------- 06 · Days between dates ---------------- */
  function runDates() {
    const a = parseDateInput($("date-a").value), b = parseDateInput($("date-b").value);
    if (!a || !b) { $("date-result").innerHTML = "<p>Pick two dates.</p>"; return; }
    const diff = daysBetween(a.y, a.m, a.d, b.y, b.m, b.d);
    const abs = Math.abs(diff), weeks = Math.floor(abs / 7), rem = abs % 7;
    $("date-result").innerHTML =
      "<p class='big-answer'>" + fmt(abs, 0) + " days apart</p>" +
      "<p>" + MONTHS[a.m - 1] + " " + a.d + ", " + a.y + " was a <strong>" + weekdayName(a.y, a.m, a.d) + "</strong>; " +
      MONTHS[b.m - 1] + " " + b.d + ", " + b.y + " was a <strong>" + weekdayName(b.y, b.m, b.d) + "</strong>. " +
      "Between them: <strong>" + fmt(weeks, 0) + " weeks" + (rem ? " and " + rem + " day" + (rem > 1 ? "s" : "") : " exactly") + "</strong>" +
      (diff < 0 ? " — counted backwards, because the second date is the earlier one." : ".") + "</p>";
  }
  $("date-a").addEventListener("change", runDates);
  $("date-b").addEventListener("change", runDates);
  runDates();
})();
