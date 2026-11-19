"use strict";
/* Everyday Language — page wiring. All data lives in lang.js; this file
   only draws it and answers taps. Nothing is stored or sent anywhere. */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- The family tree ---------- */
let selectedNode = "english";
function renderTree() {
 const wrap = $("#tree-root");
 function build(id) {
  const n = treeNode(id);
  const kids = treeChildren(id);
  const onPath = ancestryPath("english").includes(id);
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tree-node" + (id === selectedNode ? " selected" : "") + (onPath ? " on-path" : "");
  btn.dataset.node = id;
  btn.innerHTML = esc(n.name) + (id === "english" ? '<span class="leaf-tag">← YOU ARE HERE</span>' : "");
  btn.addEventListener("click", () => { selectedNode = id; renderTree(); showNode(); });
  li.appendChild(btn);
  if (kids.length) {
   const ul = document.createElement("ul");
   kids.forEach((k) => ul.appendChild(build(k.id)));
   li.appendChild(ul);
  }
  return li;
 }
 wrap.innerHTML = "";
 const rootUl = document.createElement("ul");
 rootUl.appendChild(build("pie"));
 wrap.appendChild(rootUl);
}
function showNode() {
 const n = treeNode(selectedNode);
 const path = ancestryPath(selectedNode).map((id) => treeNode(id).name).join(" → ");
 $("#node-name").textContent = n.name;
 $("#node-langs").textContent = n.langs;
 $("#node-fact").textContent = n.fact;
 $("#node-path").innerHTML = "<strong>Its line back to the root:</strong> " + esc(path);
}

/* ---------- Cognates bench ---------- */
let cogIndex = 0;
function renderCogButtons() {
 $("#cog-words").innerHTML = COGNATES.map((c, i) =>
  `<button type="button" data-cog="${i}" class="${i === cogIndex ? "active" : ""}">${esc(c.word)}</button>`).join("");
 $("#cog-words").querySelectorAll("button").forEach((b) =>
  b.addEventListener("click", () => { cogIndex = Number(b.dataset.cog); renderCogButtons(); showCognate(); }));
}
function showCognate() {
 const c = COGNATES[cogIndex];
 $("#cog-title").textContent = "“" + c.word + "” and its family";
 $("#cog-root").innerHTML = "Reconstructed parent: <strong>" + esc(c.root) + "</strong> — " + esc(c.rootGloss) +
  ". A star (*) means the word was never written down; linguists rebuilt it from the descendants below.";
 const branches = [];
 for (const [, branch] of c.forms) if (!branches.includes(branch)) branches.push(branch);
 $("#cog-rows").innerHTML = c.forms.map(([lang, branch, form]) =>
  `<tr><td>${esc(lang)}</td><td class="cog-branch">${esc(branch)}</td><td><span class="cog-form">${esc(form)}</span></td></tr>`).join("");
 $("#cog-note").textContent = c.note;
 $("#cog-watch").innerHTML = c.watchOut ? "<strong>False friend warning:</strong> " + esc(c.watchOut) : "";
 $("#cog-watch").style.display = c.watchOut ? "" : "none";
}

/* ---------- Mini translator (a phrasebook) ---------- */
function renderPhrasebook() {
 $("#phrase-select").innerHTML = PHRASES.map((p) => `<option value="${p.id}">${esc(p.en)}</option>`).join("");
 $("#lang-select").innerHTML = LANGS.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
 $("#phrase-select").addEventListener("change", showPhrase);
 $("#lang-select").addEventListener("change", showPhrase);
 showPhrase();
}
function showPhrase() {
 const pid = $("#phrase-select").value, lid = $("#lang-select").value;
 const en = PHRASES.find((p) => p.id === pid).en;
 const langName = LANGS.find((l) => l.id === lid).name;
 $("#phrase-answer").textContent = translate(pid, lid);
 $("#phrase-caption").textContent = "“" + en + "” in " + langName + ".";
 $("#phrase-note").textContent = PHRASE_NOTES[pid] || "";
}

/* ---------- Where language lives (brain bench) ---------- */
const BRAIN = {
 broca: ["Broca's area", "At the front of the left side, in the frontal lobe. This is the production bench: choosing words and putting them in grammatical order. When a stroke damages it, the result is Broca's aphasia — understanding stays largely intact, but speech comes out slowly and telegraphically, a few effortful words at a time. We know its job largely because of what stops working when it breaks."],
 wernicke: ["Wernicke's area", "At the back of the upper temporal lobe, usually on the left. This is the comprehension bench: matching the sounds of speech to meaning. Damage here gives Wernicke's aphasia — speech flows fluently, but the words stop making sense, and the speaker may not notice. Production without comprehension, the mirror image of Broca's aphasia."],
 arcuate: ["Arcuate fasciculus", "The cable between the two benches: a bundle of nerve fibres arcing from Wernicke's area to Broca's. It is what lets you repeat a word or a phone number you have just heard. When it is damaged, understanding and speech can both survive while repeating a phrase fails — proof the connection itself is part of the machine."],
 vwfa: ["Visual word form area", "A patch on the underside of the left temporal lobe that specialises in recognising written words at a glance. It only develops as a person learns to read — nobody is born with it — which makes it living proof that the language map is partly written by experience. (How specialised it really is remains debated among researchers.)"],
};
let brainKey = "broca";
function showBrain() {
 document.querySelectorAll("[data-brain]").forEach((el) => {
  el.classList.toggle("active", el.dataset.brain === brainKey);
 });
 const [name, text] = BRAIN[brainKey];
 $("#brain-name").textContent = name;
 $("#brain-text").textContent = text;
}
document.querySelectorAll("[data-brain]").forEach((el) => {
 const go = () => { brainKey = el.dataset.brain; showBrain(); };
 el.addEventListener("click", go);
 el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
});

/* ---------- The link shelf (rendered from lang.js) ---------- */
function renderShelf() {
 $("#shelf").innerHTML = LINKS.map((g) =>
  `<div class="shelf-group"><h3>${esc(g.group)}</h3><ul class="shelf-list">` +
  g.items.map(([name, url, blurb]) =>
   `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a><p>${esc(blurb)}</p></li>`).join("") +
  "</ul></div>").join("");
}

renderTree();
showNode();
renderCogButtons();
showCognate();
renderPhrasebook();
showBrain();
renderShelf();
