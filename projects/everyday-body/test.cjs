"use strict";
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

/* House branding and banner */
assert.ok(html.includes("<title>Everyday Body · Everyday Cool</title>"), "house title");
assert.ok(html.includes('src="everyday-body-banner.jpg"'), "banner is a local file on the page");
assert.ok(fs.existsSync(path.join(__dirname, "everyday-body-banner.jpg")), "banner file exists in the room folder");

/* No external images, stylesheets, or scripts — the room is one self-contained file */
assert.ok(!/<img[^>]+src\s*=\s*"https?:/i.test(html), "no external <img> sources");
assert.ok(!/url\(\s*["']?https?:/i.test(html), "no external CSS url() loads");
assert.ok(!/<link[^>]+href\s*=\s*"https?:/i.test(html), "no external stylesheets");
assert.ok(!/<script[^>]+src\s*=\s*"https?:/i.test(html), "no external scripts");

/* The page's script parses */
const match = html.match(/<script>([\s\S]*)<\/script>/);
assert.ok(match, "inline script present");
const code = match[1];
new vm.Script(code); // throws on a syntax error

/* …and runs: execute it against a minimal DOM stub and confirm the
   atlas, the scenario chain, and the quiz all render their first state. */
function makeEl() {
  return {
    children: [], style: {}, dataset: {}, value: "run",
    innerHTML: "", textContent: "",
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelectorAll() { return []; }, querySelector() { return makeEl(); },
    scrollIntoView() {}, focus() {}, setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, appendChild() {},
  };
}
const byId = {};
const documentStub = {
  querySelector(sel) {
    if (sel.startsWith("#")) { const id = sel.slice(1); return byId[id] || (byId[id] = makeEl()); }
    return makeEl();
  },
  querySelectorAll() { return []; },
  createElement() { return makeEl(); },
};
documentStub.querySelector("#effort").value = "30";
const sandbox = { document: documentStub, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
new vm.Script(code).runInContext(sandbox);
assert.strictEqual(documentStub.querySelector("#organ-name").textContent, "Brain", "atlas opens on the Brain");
assert.ok(documentStub.querySelector("#chain").innerHTML.length > 0, "scenario chain renders");
assert.ok(documentStub.querySelector("#question").textContent.length > 0, "quiz renders a question");

/* The organ set (12 selectable organs) */
for (const name of ["Brain", "Heart", "Lungs", "Liver", "Stomach", "Pancreas", "Kidneys",
                    "Intestines", "Urinary bladder", "Eyes", "Skeleton", "Muscles"]) {
  assert.ok(html.includes(name), "organ present: " + name);
}

/* The brain explorer's twelve regions */
for (const name of ["Frontal lobe", "Parietal lobe", "Temporal lobe", "Occipital lobe",
                    "Cerebellum", "Brainstem", "Hippocampus", "Amygdala", "Thalamus",
                    "Hypothalamus", "Basal ganglia", "Corpus callosum"]) {
  assert.ok(html.includes(name), "brain region present: " + name);
}

/* The honest caveat and the scenario mode are on the page */
assert.ok(html.includes("networks across"), "functions-emerge-from-networks caveat is stated");
assert.ok(html.includes("Running to catch a bus"), "connection scenario present");
assert.ok(html.includes("Try this without a screen"), "screen-free activity present");

/* House wiring: Help menu, Help section, README link, back link to the hub */
assert.ok(html.includes("Help ▾"), "Help menu in the header");
assert.ok(html.includes('id="help"'), "Help section present");
assert.ok(html.includes('href="README.md"'), "full documentation linked");
assert.ok(html.includes("caeled.github.io/everyday-cool/"), "back link to the collection hub");

/* Human Body Lab data integrity and state transitions, without browser dependencies. */
const run = source => vm.runInContext(source, sandbox);
assert.equal(run('labRegions.length'), 25);
assert.equal(run('new Set(labRegions.map(r=>r.id)).size'), 25);
assert.equal(run('detectiveCases.length'), 5);
assert.ok(run('labRegions.every(r=>organs.some(o=>o.id===r.organ)&&r.muscles&&r.bones&&r.nerves)'));
assert.ok(run('detectiveCases.every(c=>labRegions.some(r=>r.id===c.region)&&organs.some(o=>o.id===c.organ)&&["regions","muscles","bones","nerves"].includes(c.layer))'));
run("labChoose('r9-right')");
assert.equal(documentStub.querySelector('#lab-region').value, 'r9-right');
run("labChoose('nonexistent')");
assert.equal(run('labSelected'), 'r9-right', 'invalid region cannot corrupt selection');
documentStub.querySelector('#lab-back').onclick();
assert.equal(run('labView'), 'back');
assert.equal(run('labSelected'), 'r9-right', 'anatomical side survives view switch');
documentStub.querySelector('#detective-notes').oninput({target:{value:'My prediction'}});
documentStub.querySelector('#detective-case').onchange({target:{value:'1'}});
assert.equal(documentStub.querySelector('#detective-notes').value, '', 'each case has independent notes');
documentStub.querySelector('#detective-case').onchange({target:{value:'0'}});
assert.equal(documentStub.querySelector('#detective-notes').value, 'My prediction');
documentStub.querySelector('#detective-map').onclick();
assert.equal(run('labSelected'), run('detectiveCases[0].region'));
assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/.test(code), 'core content has no network or persistent-storage dependency');
console.log('everyday-body tests: all passed (atlas, brain, Help, 25-region lab, 5 cases, state transitions, offline dependencies)');
