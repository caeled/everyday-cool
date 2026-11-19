"use strict";
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const L = require("./lang.js");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

/* House branding and banner */
assert.ok(html.includes("<title>Everyday Language · Everyday Cool</title>"), "house title");
assert.ok(html.includes('src="everyday-language-banner.jpg"'), "banner is a local file on the page");
assert.ok(fs.existsSync(path.join(__dirname, "everyday-language-banner.jpg")), "banner file exists in the room folder");

/* The page loads only local code — no external scripts or stylesheets */
assert.ok(!/<script[^>]+src\s*=\s*"https?:/i.test(html), "no external scripts");
assert.ok(!/<link[^>]+href\s*=\s*"https?:/i.test(html), "no external stylesheets");
assert.ok(!/<img[^>]+src\s*=\s*"https?:/i.test(html), "no external images");

/* Both scripts parse */
for (const f of ["lang.js", "app.js"]) {
 new vm.Script(fs.readFileSync(path.join(__dirname, f), "utf8")); // throws on a syntax error
}

/* ---- The family tree ---- */
const ids = L.TREE.map((n) => n.id);
assert.strictEqual(new Set(ids).size, ids.length, "tree node ids are unique");
assert.strictEqual(L.TREE.filter((n) => n.parent === null).length, 1, "exactly one root");
for (const n of L.TREE) {
 assert.ok(n.name && n.langs && n.fact, "node carries name, languages, and a fact: " + n.id);
 if (n.parent !== null) assert.ok(L.treeNode(n.parent), "parent resolves: " + n.id);
}
assert.deepStrictEqual(L.ancestryPath("english"),
 ["pie", "germanic", "west-germanic", "anglo-frisian", "english"],
 "English's ancestry resolves root-ward through Germanic — never through Latin or French");
assert.deepStrictEqual(L.ancestryPath("romance"), ["pie", "italic", "romance"],
 "Romance descends from Italic/Latin, as a cousin branch");
assert.deepStrictEqual(L.ancestryPath("nope"), [], "an unknown node has no path");

/* ---- The cognates bench ---- */
assert.strictEqual(L.COGNATES.length, 11, "eleven word families on the bench");
for (const c of L.COGNATES) {
 assert.ok(c.word && c.root && c.rootGloss && c.note, "cognate set is complete: " + c.word);
 assert.ok(c.forms.length >= 6, "at least six descendants listed: " + c.word);
 const langs = c.forms.map((f) => f[0]);
 const branches = new Set(c.forms.map((f) => f[1]));
 assert.ok(langs.includes("English") && langs.includes("German"), "English and German present: " + c.word);
 assert.ok(branches.size >= 4, "at least four branches represented: " + c.word);
 for (const f of c.forms) {
  assert.strictEqual(f.length, 3, "each form is language, branch, word: " + c.word);
  assert.ok(f.every((s) => typeof s === "string" && s.length > 0), "no empty fields: " + c.word);
 }
}

/* ---- The phrasebook: every phrase in every language ---- */
assert.strictEqual(L.PHRASES.length, 10, "ten phrases");
assert.strictEqual(L.LANGS.length, 6, "six languages");
for (const p of L.PHRASES) {
 for (const l of L.LANGS) {
  const t = L.translate(p.id, l.id);
  assert.ok(typeof t === "string" && t.length > 0, `phrase ${p.id} exists in ${l.id}`);
 }
}
assert.strictEqual(L.translate("nope", "es"), null, "an unknown phrase is refused");
assert.strictEqual(L.translate("hello", "nope"), null, "an unknown language is refused");
for (const k of Object.keys(L.PHRASE_NOTES)) {
 assert.ok(L.PHRASES.some((p) => p.id === k), "phrase note names a real phrase: " + k);
}

/* ---- The other great families ---- */
assert.strictEqual(L.FAMILIES.length, 5, "five other families on the strip");
for (const f of L.FAMILIES) assert.ok(f.name && f.size && f.langs && f.fact, "family card complete: " + f.name);

/* ---- The link shelf ---- */
assert.ok(L.LINKS.length >= 3, "shelf has its groups");
let linkCount = 0;
for (const g of L.LINKS) {
 assert.ok(g.group && g.items.length > 0, "shelf group non-empty: " + g.group);
 for (const [name, url, blurb] of g.items) {
  assert.ok(name && blurb, "link carries a name and a blurb: " + name);
  assert.ok(url.startsWith("https://"), "link is https: " + url);
  linkCount++;
 }
}
assert.ok(linkCount >= 12, "at least twelve links on the shelf");

/* ---- Page wiring: cross-links, Travel Kit, Help ---- */
assert.ok(html.includes('href="../secret-squares/index.html"'), "cross-link to Secret Squares");
assert.ok(html.includes('href="../everyday-body/index.html"'), "cross-link to Everyday Body's brain explorer");
assert.ok(html.includes("https://github.com/caeled/travel-kit-app/releases"), "Travel Kit card links its releases page");
assert.ok(html.includes("Take it traveling"), "Travel Kit card present beside the phrasebook");
assert.ok(html.includes("Help ▾"), "Help menu in the header");
for (const id of ["help-tree", "help-cognates", "help-translator", "help-brain", "help-honesty", "help-offline"]) {
 assert.ok(html.includes('id="' + id + '"'), "help card present: " + id);
}
assert.ok(html.includes('href="README.md"'), "full documentation linked");
assert.ok(html.includes("English is a Germanic language"), "the headline surprise is stated on the page");
assert.ok(html.includes("phrasebook, not a translator") || html.includes("phrasebook, not a translator".replace(",", ",")), "phrasebook honesty stated");

console.log("everyday-language tests: all passed (tree ancestry, 11 cognate families, 10×6 phrasebook, families strip, link shelf, page wiring)");
