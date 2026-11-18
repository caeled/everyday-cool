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
