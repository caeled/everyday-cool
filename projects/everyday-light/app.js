"use strict";
/* Everyday Light — page wiring. The rules live in light.js. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---------------- 01 · Two ways to mix ---------------- */
  function runLightMix() {
    const r = Number($("lamp-r").value), g = Number($("lamp-g").value), b = Number($("lamp-b").value);
    $("lamp-r-val").textContent = r; $("lamp-g-val").textContent = g; $("lamp-b-val").textContent = b;
    $("lamp-circle-r").style.background = "rgb(" + r + ", 0, 0)";
    $("lamp-circle-g").style.background = "rgb(0, " + g + ", 0)";
    $("lamp-circle-b").style.background = "rgb(0, 0, " + b + ")";
    const mix = mixLight(r, g, b);
    $("light-swatch").style.background = rgbString(mix);
    const parts = [];
    if (r > 0) parts.push("red " + r);
    if (g > 0) parts.push("green " + g);
    if (b > 0) parts.push("blue " + b);
    let verdict = "";
    if (r === 255 && g === 255 && b === 255) verdict = "<p class='big-answer'>White.</p><p>All three lamps at full — every channel of light your screen can pour, poured. Lamp light <em>adds</em>: the mix can only get brighter than its brightest ingredient.</p>";
    else if (r === 0 && g === 0 && b === 0) verdict = "<p class='big-answer'>Black.</p><p>Three lamps, all off. Adding light starts from darkness and climbs.</p>";
    else verdict = "<p class='big-answer'>" + esc(rgbString(mix)) + "</p><p>" + (parts.length ? "Pouring " + parts.join(", ") + "." : "") + " Where the circles overlap on the stage, the browser is doing the same sum with its screen blend — look at the two-lamp overlaps: red over green makes <strong>yellow</strong>, the additive surprise no paintbox prepares you for.</p>";
    $("light-result").innerHTML = verdict;
  }
  ["lamp-r", "lamp-g", "lamp-b"].forEach((id) => $(id).addEventListener("input", runLightMix));
  runLightMix();

  function runPaintMix() {
    const c = Number($("paint-c").value), m = Number($("paint-m").value), y = Number($("paint-y").value);
    $("paint-c-val").textContent = c + "%"; $("paint-m-val").textContent = m + "%"; $("paint-y-val").textContent = y + "%";
    const mix = mixPigment(c, m, y);
    $("paint-swatch").style.background = rgbString(mix);
    let verdict;
    if (c === 0 && m === 0 && y === 0) verdict = "<p class='big-answer'>Bare paper — white.</p><p>Pigment mixing starts from the paper's white and can only climb down. Every spoonful takes some light away and gives none back.</p>";
    else if (c === 100 && m === 100 && y === 100) verdict = "<p class='big-answer'>" + esc(rgbString(mix)) + " — near black, not black.</p><p>All three at full, and the model lands at a deep warm murk instead of a true black — because real pigments leak. Each swallows its own colour hungrily and the others only mostly. That leak is why your printer carries a fourth cartridge, black — the <strong>K</strong> in CMYK — instead of trusting the three to finish the job.</p>";
    else verdict = "<p class='big-answer'>" + esc(rgbString(mix)) + "</p><p>Cyan " + c + "%, magenta " + m + "%, yellow " + y + "%. Each pigment is a filter: cyan swallows red, magenta swallows green, yellow swallows blue — and what reaches your eye is whatever light all three let through.</p>";
    $("paint-result").innerHTML = verdict;
  }
  ["paint-c", "paint-m", "paint-y"].forEach((id) => $(id).addEventListener("input", runPaintMix));
  runPaintMix();

  /* ---------------- 02 · Colour chords ---------------- */
  let chordType = "complementary", chordRoot = 0;
  const wheelSvg = $("wheel-svg");
  const WHEEL_C = 170, WHEEL_R = 128;
  function wedgePath(i) {
    const a0 = (i * 30 - 15 - 90) * Math.PI / 180, a1 = (i * 30 + 15 - 90) * Math.PI / 180;
    const x0 = WHEEL_C + WHEEL_R * Math.cos(a0), y0 = WHEEL_C + WHEEL_R * Math.sin(a0);
    const x1 = WHEEL_C + WHEEL_R * Math.cos(a1), y1 = WHEEL_C + WHEEL_R * Math.sin(a1);
    return "M " + WHEEL_C + " " + WHEEL_C + " L " + x0.toFixed(1) + " " + y0.toFixed(1) + " A " + WHEEL_R + " " + WHEEL_R + " 0 0 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + " Z";
  }
  function drawWheel() {
    while (wheelSvg.firstChild) wheelSvg.removeChild(wheelSvg.firstChild);
    const inChord = chordIndices(chordType, chordRoot);
    HUES.forEach((h, i) => {
      const p = svgEl("path", { d: wedgePath(i), fill: hueColor(i, i % 2 ? 52 : 58), class: "wheel-wedge" + (inChord.includes(i) ? " in-chord" : ""), tabindex: "0", role: "button", "aria-label": h.name + (i === chordRoot ? " (chord root)" : "") });
      p.addEventListener("click", () => { chordRoot = i; drawWheel(); });
      p.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chordRoot = i; drawWheel(); } });
      wheelSvg.appendChild(p);
      const a = (i * 30 - 90) * Math.PI / 180;
      const t = svgEl("text", { x: WHEEL_C + (WHEEL_R - 26) * Math.cos(a), y: WHEEL_C + (WHEEL_R - 26) * Math.sin(a) + 4, class: "wheel-label", "text-anchor": "middle" });
      t.textContent = h.name.split(" ")[0];
      wheelSvg.appendChild(t);
    });
    // The chord's skeleton, drawn last so it lies over the wedges:
    // lines joining the chord's notes across the wheel.
    inChord.forEach((idx, k) => {
      const other = inChord[(k + 1) % inChord.length];
      if (inChord.length > 1 && !(inChord.length === 2 && k === 1)) {
        const a = (idx * 30 - 90) * Math.PI / 180, b2 = (other * 30 - 90) * Math.PI / 180;
        wheelSvg.appendChild(svgEl("line", {
          x1: WHEEL_C + (WHEEL_R - 44) * Math.cos(a), y1: WHEEL_C + (WHEEL_R - 44) * Math.sin(a),
          x2: WHEEL_C + (WHEEL_R - 44) * Math.cos(b2), y2: WHEEL_C + (WHEEL_R - 44) * Math.sin(b2),
          class: "wheel-chord-line",
        }));
      }
    });
    const names = inChord.map((i) => HUES[i].name);
    $("palette").innerHTML = inChord.map((i) =>
      "<div class='pal-swatch' style='background:" + hueColor(i) + "'><span>" + esc(HUES[i].name) + "</span><span class='pal-angle'>" + hueAngle(i) + "°" + (i === chordRoot ? " · root" : "") + "</span></div>").join("");
    $("chord-result").innerHTML =
      "<p class='big-answer'>" + esc(CHORDS[chordType].label) + " on " + esc(HUES[chordRoot].name) + ": " + esc(names.join(" · ")) + "</p><p>" + esc(CHORDS[chordType].blurb) + "</p>";
  }
  document.querySelectorAll("[data-chord]").forEach((b) => b.addEventListener("click", () => {
    chordType = b.dataset.chord;
    document.querySelectorAll("[data-chord]").forEach((x) => x.classList.toggle("active", x === b));
    drawWheel();
  }));
  drawWheel();

  /* ---------------- 03 · The lens bench ---------------- */
  const lensSvg = $("lens-svg");
  const LENS_X = 215, AXIS_Y = 120, PX = 3; // 3 px per cm
  function drawLens() {
    const f = Number($("lens-f").value), dObj = Number($("lens-do").value);
    $("lens-f-val").textContent = f + " cm";
    $("lens-do-val").textContent = dObj + " cm";
    const res = thinLens(f, dObj);
    while (lensSvg.firstChild) lensSvg.removeChild(lensSvg.firstChild);
    // Axis
    lensSvg.appendChild(svgEl("line", { x1: 8, y1: AXIS_Y, x2: 452, y2: AXIS_Y, class: "lens-axis" }));
    // Focal points and the lens
    [-1, 1].forEach((s) => {
      const fx = LENS_X + s * f * PX;
      lensSvg.appendChild(svgEl("circle", { cx: fx, cy: AXIS_Y, r: 3.5, class: "lens-focal" }));
      const t = svgEl("text", { x: fx, y: AXIS_Y + 22, class: "lens-small", "text-anchor": "middle" });
      t.textContent = "F"; lensSvg.appendChild(t);
    });
    lensSvg.appendChild(svgEl("line", { x1: LENS_X, y1: 26, x2: LENS_X, y2: 214, class: "lens-body" }));
    lensSvg.appendChild(svgEl("polygon", { points: LENS_X + ",18 " + (LENS_X - 6) + ",32 " + (LENS_X + 6) + ",32", class: "lens-body" }));
    lensSvg.appendChild(svgEl("polygon", { points: LENS_X + ",222 " + (LENS_X - 6) + ",208 " + (LENS_X + 6) + ",208", class: "lens-body" }));
    // Object arrow, 8 cm tall, standing on the axis
    const objH = 8 * PX, objX = LENS_X - dObj * PX, objTop = AXIS_Y - objH;
    lensSvg.appendChild(svgEl("line", { x1: objX, y1: AXIS_Y, x2: objX, y2: objTop, class: "lens-object" }));
    lensSvg.appendChild(svgEl("polygon", { points: objX + "," + (objTop - 7) + " " + (objX - 4) + "," + (objTop + 2) + " " + (objX + 4) + "," + (objTop + 2), class: "lens-object" }));
    const ot = svgEl("text", { x: objX, y: AXIS_Y + 22, class: "lens-small", "text-anchor": "middle" });
    ot.textContent = "object"; lensSvg.appendChild(ot);
    // Image: drawn where the formula puts it, clamped to the frame
    const drawDi = Math.max(-55, Math.min(62, res.di));
    const imgX = LENS_X + drawDi * PX;
    const imgH = res.atInfinity ? 0 : objH * Math.abs(res.m);
    const imgTop = res.m < 0 ? AXIS_Y + Math.min(imgH, 88) : AXIS_Y - Math.min(imgH, 88);
    if (!res.atInfinity) {
      lensSvg.appendChild(svgEl("line", { x1: imgX, y1: AXIS_Y, x2: imgX, y2: imgTop, class: res.real ? "lens-image" : "lens-image virtual" }));
      const it = svgEl("text", { x: imgX, y: AXIS_Y + 22, class: "lens-small", "text-anchor": "middle" });
      it.textContent = res.real ? "image" : "virtual image"; lensSvg.appendChild(it);
    }
    // The three principal rays, from the object's tip
    const tip = { x: objX, y: objTop };
    // 1 · parallel to the lens, then through the far focal point
    lensSvg.appendChild(svgEl("line", { x1: tip.x, y1: tip.y, x2: LENS_X, y2: tip.y, class: "ray" }));
    const farF = { x: LENS_X + f * PX, y: AXIS_Y };
    const slope1 = (farF.y - tip.y) / (farF.x - LENS_X);
    const endX1 = res.real ? Math.max(imgX, LENS_X + 30) : LENS_X + 120;
    lensSvg.appendChild(svgEl("line", { x1: LENS_X, y1: tip.y, x2: endX1, y2: tip.y + slope1 * (endX1 - LENS_X), class: "ray" }));
    // 2 · straight through the centre, unbent
    const slope2 = (AXIS_Y - tip.y) / (LENS_X - tip.x);
    const endX2 = res.real ? imgX : LENS_X + 120;
    lensSvg.appendChild(svgEl("line", { x1: tip.x, y1: tip.y, x2: endX2, y2: tip.y + slope2 * (endX2 - tip.x), class: "ray" }));
    // 3 · through the near focal point, then parallel
    const nearF = { x: LENS_X - f * PX, y: AXIS_Y };
    const slope3 = (tip.y - nearF.y) / (tip.x - nearF.x);
    const lensY3 = tip.y + slope3 * (LENS_X - tip.x);
    lensSvg.appendChild(svgEl("line", { x1: tip.x, y1: tip.y, x2: LENS_X, y2: lensY3, class: "ray" }));
    lensSvg.appendChild(svgEl("line", { x1: LENS_X, y1: lensY3, x2: res.real ? imgX : LENS_X + 120, y2: lensY3, class: "ray" }));
    if (!res.real && !res.atInfinity) {
      // Dashed backward extensions to the virtual image
      lensSvg.appendChild(svgEl("line", { x1: LENS_X, y1: tip.y, x2: imgX, y2: imgTop, class: "ray dash" }));
      lensSvg.appendChild(svgEl("line", { x1: LENS_X, y1: lensY3, x2: imgX, y2: imgTop, class: "ray dash" }));
    }
    // Readout
    let html;
    if (res.atInfinity) {
      html = "<p class='big-answer'>The image is at infinity.</p><p>The object stands exactly at the focal point, so the lens sends its light out in a parallel beam — a searchlight, run backwards. 1/" + f + " = 1/" + dObj + " + 1/di leaves nothing for 1/di: di has run off the end of the ruler.</p>";
    } else if (res.real) {
      html = "<p class='big-answer'>Image " + fmt(res.di, 1) + " cm past the lens — upside down, " + fmt(Math.abs(res.m), 2) + "× the object's size.</p>" +
        "<p>1/f = 1/do + 1/di → 1/" + f + " = 1/" + dObj + " + 1/" + fmt(res.di, 1) + ", and the magnification m = −di/do = <strong>" + fmt(res.m, 2) + "</strong>. The minus sign is not bookkeeping: follow the three rays and they genuinely meet below the axis. Every camera that has ever taken a photograph formed its picture this way, upside down, and flipped it afterwards.</p>";
    } else {
      html = "<p class='big-answer'>No real image — the lens is a magnifier here.</p>" +
        "<p>The object sits inside the focal length (" + dObj + " cm &lt; " + f + " cm), so the rays leave the lens still spreading and never meet. Your eye traces them back — the dashed lines — to a virtual image " + fmt(Math.abs(res.di), 1) + " cm behind the object side, upright and " + fmt(res.m, 2) + "× life size. That is the whole of the magnifying glass: geometry, not magic.</p>";
    }
    $("lens-result").innerHTML = html;
  }
  $("lens-f").addEventListener("input", drawLens);
  $("lens-do").addEventListener("input", drawLens);
  drawLens();

  /* ---------------- 04 · Why the sky is blue ---------------- */
  function runSky() {
    const alt = Number($("sky-alt").value);
    $("sky-alt-val").textContent = alt + "°";
    const path = airMass(alt);
    const sun = sunColor(path), sky = skyColor(path);
    $("sun-swatch").style.background = rgbString(sun);
    $("sky-swatch").style.background = rgbString(sky);
    $("sky-result").innerHTML =
      "<p class='big-answer'>Sun " + fmt(alt, 0) + "° up: a path of " + fmt(path, 1) + " air masses.</p>" +
      "<p>Blue light (450 nm) is scattered <strong>" + fmt(rayleighRatio(450, 650), 2) + "×</strong> more strongly than red (650 nm) — the 1/λ⁴ rule. Overhead, the scattered blue comes at you from every direction (the sky swatch, " + esc(rgbString(sky)) + ") and the sun itself stays near white. Stretch the path and the beam pays the scattering toll again and again: the blue is spent into the sky long before arrival, the green thins, and the red — scattered least — is what is left in the disc (" + esc(rgbString(sun)) + " at this height). Sunset is not the sun changing; it is the sun <em>filtered</em>.</p>";
  }
  $("sky-alt").addEventListener("input", runSky);
  runSky();

  /* ---------------- 05 · Shadows through the day ---------------- */
  function runShadow() {
    const lat = Number($("sh-lat").value);
    const season = SEASONS[Number($("sh-season").value)];
    const hour = Number($("sh-hour").value);
    const height = Number($("sh-height").value) || 1;
    $("sh-lat-val").textContent = fmt(lat, 1) + "°N";
    $("sh-hour-val").textContent = (hour === 12 ? "12 noon" : hour < 12 ? hour + " AM" : (hour - 12) + " PM") + " solar time";
    const pos = sunPosition(lat, season.decl, hour);
    const svg = $("shadow-svg");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const C = { x: 170, y: 170 };
    // Compass rose
    svg.appendChild(svgEl("circle", { cx: C.x, cy: C.y, r: 140, class: "shadow-ring" }));
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([t, deg]) => {
      const a = deg * Math.PI / 180;
      const tx = svgEl("text", { x: C.x + 152 * Math.sin(a), y: C.y - 152 * Math.cos(a) + 5, class: "shadow-compass", "text-anchor": "middle" });
      tx.textContent = t; svg.appendChild(tx);
    });
    svg.appendChild(svgEl("circle", { cx: C.x, cy: C.y, r: 6, class: "shadow-stick" }));
    if (pos.altDeg > 0) {
      const len = shadowLength(height, pos.altDeg);
      const dir = shadowDirection(pos.azDeg) * Math.PI / 180;
      const pxLen = Math.min(132, len / height * 66);
      const x2 = C.x + pxLen * Math.sin(dir), y2 = C.y - pxLen * Math.cos(dir);
      svg.appendChild(svgEl("line", { x1: C.x, y1: C.y, x2: x2, y2: y2, class: "shadow-line" }));
      svg.appendChild(svgEl("circle", { cx: x2, cy: y2, r: 4.5, class: "shadow-tip" }));
      const sunA = pos.azDeg * Math.PI / 180;
      svg.appendChild(svgEl("circle", { cx: C.x + 118 * Math.sin(sunA), cy: C.y - 118 * Math.cos(sunA), r: 10, class: "shadow-sun" }));
      $("shadow-result").innerHTML =
        "<p class='big-answer'>Shadow: " + fmt(len, 2) + " m, pointing " + compassName(shadowDirection(pos.azDeg)) + ".</p>" +
        "<p>The sun stands " + fmt(pos.altDeg, 1) + "° high in the " + compassName(pos.azDeg) + ", so a " + fmt(height, 2) + " m stick's shadow runs " + fmt(len, 2) + " m the opposite way — shadow = height ÷ tan(" + fmt(pos.altDeg, 1) + "°). At noon on the equinox at this latitude the arithmetic is the tidy version Everyday Time's sundial is built on: the shadow is the height × tan(latitude). Drag the hour and watch the shadow sweep and stretch; pick the winter solstice and watch noon itself go long.</p>";
    } else {
      $("shadow-result").innerHTML =
        "<p class='big-answer'>The sun is below the horizon.</p><p>At " + esc(season.name.split(" (")[0].toLowerCase()) + ", latitude " + fmt(lat, 1) + "°N, the sun has not risen yet or has already set at this hour — no altitude, no shadow. Slide toward noon.</p>";
    }
  }
  $("sh-season").addEventListener("change", runShadow);
  $("sh-lat").addEventListener("input", runShadow);
  $("sh-hour").addEventListener("input", runShadow);
  $("sh-height").addEventListener("input", runShadow);
  (function fillSeasons() {
    const sel = $("sh-season");
    SEASONS.forEach((s, i) => {
      const o = document.createElement("option");
      o.value = i; o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.value = "0";
  })();
  runShadow();

  /* ---------------- 06 · Seeing the spectrum ---------------- */
  function runSpectrum() {
    const nm = Number($("spec-slider").value);
    $("spec-val").textContent = nm + " nm";
    $("spec-swatch").style.background = wavelengthColor(nm);
    $("spec-marker").style.left = ((nm - 380) / (750 - 380) * 100) + "%";
    let band;
    if (nm < 450) band = "violet-blue light — the short, energetic end of the visible band";
    else if (nm < 495) band = "blue to cyan light";
    else if (nm < 570) band = "green light — where the eye is most sensitive, which is why laser pointers and safety vests live here";
    else if (nm < 590) band = "yellow light";
    else if (nm < 620) band = "orange light";
    else band = "red light — the long, gentle end of the visible band";
    $("spec-result").innerHTML =
      "<p class='big-answer'>" + nm + " nm — " + fmt(wavelengthFreqTHz(nm), 0) + " THz.</p>" +
      "<p>This is " + band + ". Its frequency is c ÷ λ = 299,792,458 m/s ÷ " + nm + " nm. Shorten the wavelength and the frequency climbs: the whole visible band spans barely a factor of two, one octave of light, from about 400 to about 790 THz.</p>";
  }
  $("spec-slider").addEventListener("input", runSpectrum);
  runSpectrum();
})();
