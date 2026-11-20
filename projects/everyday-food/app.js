"use strict";
/* Everyday Food — page wiring. The rules and data live in food.js. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- The tongue bench ----------------
     Pick a taste; the tongue lights by sensitivity. The point is in
     the numbers: nothing on this diagram is dark. */
  const regionEls = {};
  document.querySelectorAll("[data-region]").forEach((el) => { regionEls[el.getAttribute("data-region")] = el; });

  function showTaste(id) {
    const taste = tasteById(id);
    if (!taste) return;
    TONGUE_REGIONS.forEach((r) => {
      const v = taste.sensitivity[r.id];
      const el = regionEls[r.id];
      if (el) el.querySelectorAll("ellipse").forEach((e) => { e.style.fillOpacity = (0.12 + 0.88 * v).toFixed(2); });
    });
    document.querySelectorAll("#tongue-buttons button").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-taste") === id);
    });
    const parts = TONGUE_REGIONS.map((r) => r.name + " " + Math.round(taste.sensitivity[r.id] * 100));
    $("tongue-readout").innerHTML =
      "<p><span class=\"big-answer\">" + esc(taste.name) + "</span></p>" +
      "<p>" + esc(taste.signal) + "</p>" +
      "<p>Sensitivity by region: " + parts.join(" · ") + " (out of 100). Sensed <strong>everywhere</strong> — the brightest region leads by a lean, not by a landslide.</p>";
  }
  document.querySelectorAll("#tongue-buttons button").forEach((b) => {
    b.addEventListener("click", () => showTaste(b.getAttribute("data-taste")));
  });
  showTaste("sweet");

  /* ---------------- Bitter + sweet: the balance bench ---------------- */
  const dishSel = $("dish-select");
  DISHES.forEach((d) => {
    const o = document.createElement("option");
    o.value = d.id; o.textContent = d.name;
    dishSel.appendChild(o);
  });
  function showDish(id) {
    const dish = dishById(id);
    if (!dish) return;
    const bars = FLAVOUR_AXES.map((axis) => {
      const v = dish.profile[axis];
      const label = axis.charAt(0).toUpperCase() + axis.slice(1);
      return "<div class=\"profile-row\"><span class=\"profile-name\">" + label + "</span>" +
        "<span class=\"profile-track\"><span class=\"profile-fill\" style=\"width:" + (v * 10) + "%\"></span></span>" +
        "<span class=\"profile-val\">" + v + "</span></div>";
    }).join("");
    $("dish-result").innerHTML =
      "<p><span class=\"big-answer\">" + esc(dish.name) + "</span></p>" + bars +
      "<p>" + esc(dish.why) + "</p>" +
      "<p class=\"fine\"><strong>The lever:</strong> " + esc(dish.lever) + "</p>";
  }
  dishSel.addEventListener("change", () => showDish(dishSel.value));
  showDish(DISHES[0].id);

  /* ---------------- The Dutch-oven coal bench ---------------- */
  const sizeSel = $("oven-size"), tempSel = $("oven-temp");
  DUTCH_OVEN_SIZES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s + "-inch oven";
    if (s === 12) o.selected = true;
    sizeSel.appendChild(o);
  });
  DUTCH_OVEN_TEMPS.forEach((t) => {
    const o = document.createElement("option");
    o.value = t; o.textContent = t + " °F";
    if (t === 325) o.selected = true;
    tempSel.appendChild(o);
  });
  function showCoals() {
    const size = Number(sizeSel.value), temp = Number(tempSel.value);
    const r = dutchOvenCoals(size, temp);
    if (!r) { $("oven-result").innerHTML = "<p>Off the chart — pick a listed size and temperature.</p>"; return; }
    $("oven-result").innerHTML =
      "<p><span class=\"big-answer\">" + r.top + " on top · " + r.bottom + " underneath</span> — " + r.total + " briquettes in all, for a " + size + "-inch oven at " + temp + " °F.</p>" +
      "<p>The chart's rule, so you can rebuild it from memory: at 325 °F it's the diameter + 3 on top and − 3 underneath, and every 25 °F more adds one coal to each side. Spread the top coals in a ring near the rim, the bottom ones in a loose ring — never a pile dead-centre, which scorches.</p>";
  }
  sizeSel.addEventListener("change", showCoals);
  tempSel.addEventListener("change", showCoals);
  showCoals();
})();
