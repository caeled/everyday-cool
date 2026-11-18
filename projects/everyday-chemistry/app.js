"use strict";
/* Everyday Chemistry — page wiring. The rules live in chem.js. */
(function () {
 const pickerBox = document.getElementById("picker");
 const atomSvg = document.getElementById("atom-svg");
 const atomFacts = document.getElementById("atom-facts");
 const atomStatus = document.getElementById("atom-status");
 let current = null;

 for (const sym of PICKER) {
  const el = elementBySymbol(sym);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "el-btn";
  b.dataset.sym = sym;
  b.innerHTML = "<span class='el-num'></span><span class='el-sym'></span><span class='el-name'></span>";
  b.querySelector(".el-num").textContent = el.number;
  b.querySelector(".el-sym").textContent = sym;
  b.querySelector(".el-name").textContent = el.name;
  b.addEventListener("click", () => showAtom(el));
  pickerBox.appendChild(b);
 }

 function drawAtom(el) {
  const cx = 210, cy = 210;
  const neutrons = neutronsOf(el), massNo = massNumberOf(el);
  let s = "";
  el.shells.forEach((count, idx) => {
   const r = 52 + idx * 34;
   s += "<circle class='shell-ring' cx='" + cx + "' cy='" + cy + "' r='" + r + "'/>";
   for (let k = 0; k < count; k++) {
    const a = (2 * Math.PI * k) / count - Math.PI / 2 + idx * 0.35;
    const x = (cx + r * Math.cos(a)).toFixed(1), y = (cy + r * Math.sin(a)).toFixed(1);
    s += "<circle class='electron' cx='" + x + "' cy='" + y + "' r='6'/>";
   }
  });
  s += "<circle class='nucleus' cx='" + cx + "' cy='" + cy + "' r='40'/>";
  s += "<text class='nuc-sym' x='" + cx + "' y='" + (cy - 2) + "'>" + el.symbol + "</text>";
  s += "<text class='nuc-sub' x='" + cx + "' y='" + (cy + 18) + "'>" + el.number + "p · " + neutrons + "n</text>";
  atomSvg.innerHTML = s;
  atomSvg.setAttribute("aria-label", "Drawing of a " + el.name + " atom: a nucleus with " +
   el.number + " protons and " + neutrons + " neutrons, and " + el.number +
   " electrons in " + el.shells.length + (el.shells.length === 1 ? " shell" : " shells") + ".");
  return massNo;
 }

 function showAtom(el) {
  current = el;
  const massNo = drawAtom(el);
  const neutrons = neutronsOf(el);
  for (const b of pickerBox.querySelectorAll(".el-btn"))
   b.classList.toggle("active", b.dataset.sym === el.symbol);
  atomFacts.innerHTML =
   "<h3>" + el.name + " <span class='fact-sym'>" + el.symbol + "</span></h3>" +
   "<ul class='fact-list'>" +
   "<li><strong>Atomic number " + el.number + "</strong> — every " + el.name.toLowerCase() + " atom has exactly " + el.number + (el.number === 1 ? " proton" : " protons") + ". That number is its identity card.</li>" +
   "<li><strong>Protons: " + el.number + "</strong></li>" +
   "<li><strong>Neutrons: " + neutrons + "</strong> — in the most common kind of " + el.name.toLowerCase() + " (mass number " + massNo + ": " + massNo + " − " + el.number + " = " + neutrons + "). Heavier or lighter brothers and sisters (isotopes) carry a different count.</li>" +
   "<li><strong>Electrons: " + el.number + "</strong>, arranged in shells " + el.shells.join(", ") + " — reading from the shell nearest the nucleus outward.</li>" +
   "<li><strong>Standard atomic mass: " + el.mass + "</strong> — the average weight of this element's atoms, counting all its isotopes as they occur in nature.</li>" +
   "</ul>";
  atomStatus.textContent = el.name + " is on the bench: " + el.number + " protons, " + neutrons + " neutrons, " + el.number + " electrons.";
 }

 /* Neutron calculator */
 const ncBtn = document.getElementById("nc-go");
 const ncOut = document.getElementById("nc-result");
 ncBtn.addEventListener("click", () => {
  const r = neutronCalc(document.getElementById("nc-z").value, document.getElementById("nc-a").value);
  if (!r.ok) { ncOut.textContent = r.error; return; }
  ncOut.innerHTML = "";
  const list = document.createElement("ol");
  for (const step of r.steps) { const li = document.createElement("li"); li.textContent = step; list.appendChild(li); }
  ncOut.appendChild(list);
 });

 /* Formula bench */
 const fbInput = document.getElementById("fb-input");
 const fbOut = document.getElementById("fb-result");
 function runFormula() {
  const parsed = parseFormula(fbInput.value);
  if (!parsed.ok) { fbOut.textContent = parsed.error; return; }
  const mm = molarMass(parsed);
  let html = "<p class='fb-tally'><strong>" + fbInput.value.trim() + "</strong> holds " +
   totalAtoms(parsed) + " atoms in each molecule or unit: " + tallyText(parsed) + ".</p>";
  html += "<table class='fb-table'><thead><tr><th>Element</th><th>Atoms</th><th>Each weighs</th><th>Together</th></tr></thead><tbody>";
  for (const line of mm.lines)
   html += "<tr><td>" + line.name + " (" + line.symbol + ")</td><td>" + line.count + "</td><td>" +
    line.mass + "</td><td>" + line.count + " × " + line.mass + " = " + line.part + "</td></tr>";
  html += "</tbody></table>";
  html += "<p class='fb-total'>Adding the rows: <strong>molar mass ≈ " + mm.total + " grams per mole</strong> — " +
   "one mole is 602,214,076,000,000,000,000,000 molecules (Avogadro's number), and that many of these would weigh about " + mm.total + " grams.</p>";
  fbOut.innerHTML = html;
 }
 document.getElementById("fb-go").addEventListener("click", runFormula);
 fbInput.addEventListener("keydown", e => { if (e.key === "Enter") runFormula(); });

 /* Combinations bench */
 const comboBox = document.getElementById("combos");
 const comboOut = document.getElementById("combo-result");
 for (const c of COMPOUNDS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "combo-btn";
  b.innerHTML = "<span class='combo-name'></span><span class='combo-formula'></span><span class='combo-where'></span>";
  b.querySelector(".combo-name").textContent = c.name;
  b.querySelector(".combo-formula").textContent = c.formula;
  b.querySelector(".combo-where").textContent = c.where;
  b.addEventListener("click", () => {
   const parsed = parseFormula(c.formula);
   comboOut.innerHTML = "<p><strong>" + c.name + "</strong> (" + c.formula + ") — " + c.where.toLowerCase() +
    ". One unit holds " + totalAtoms(parsed) + " atoms: " + tallyText(parsed) + ". " + c.ratio + "</p>" +
    "<p class='fine'>It is loaded in the formula bench above — press “Count and weigh” there to see it weighed.</p>";
   fbInput.value = c.formula;
   runFormula();
   document.getElementById("numbers").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  comboBox.appendChild(b);
 }

 showAtom(elementBySymbol("O"));
})();
