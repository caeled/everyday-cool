"use strict";
/* Everyday Food — the pure rules: the tongue's sensitivity table, the
   bitter/sweet dish profiles, the Dutch-oven briquette chart, and the
   food-plant identification data. No DOM — app.js wires this to the
   page, and test.cjs checks it in Node. */

/* ---------------- The tongue, audited ----------------
   Relative sensitivity (0–1) of each taste in each tongue region.
   The audit's whole point lives in these numbers: every taste is
   sensed in EVERY region — nothing is at or near zero — and the
   regional differences are mild leans, not the school map's walls.
   Values are a teaching summary of the modern measurements (the
   regional thresholds Hänig actually published in 1901 differ by
   small factors, not by kind), not laboratory data. */

const TONGUE_REGIONS = [
  { id: "tip", name: "Tip" },
  { id: "front-edges", name: "Front edges" },
  { id: "back-edges", name: "Back edges" },
  { id: "back", name: "Back" },
];

const TASTES = [
  {
    id: "sweet", name: "Sweet",
    signal: "Energy ahead — ripe fruit, honey, milk sugars. The safe-fuel signal.",
    sensitivity: { "tip": 1.0, "front-edges": 0.9, "back-edges": 0.8, "back": 0.7 },
  },
  {
    id: "salty", name: "Salty",
    signal: "Minerals in balance — the taste of sodium the body must keep level.",
    sensitivity: { "tip": 1.0, "front-edges": 0.95, "back-edges": 0.8, "back": 0.75 },
  },
  {
    id: "sour", name: "Sour",
    signal: "Acid present — unripe fruit, spoilage, fermentation. A caution light, not a ban.",
    sensitivity: { "tip": 0.8, "front-edges": 0.95, "back-edges": 1.0, "back": 0.85 },
  },
  {
    id: "bitter", name: "Bitter",
    signal: "Possible poison — most plant alkaloids taste bitter. The alarm bell, tuned loudest at the back, the last checkpoint before swallowing.",
    sensitivity: { "tip": 0.7, "front-edges": 0.75, "back-edges": 0.9, "back": 1.0 },
  },
  {
    id: "umami", name: "Umami",
    signal: "Protein ahead — the savoury taste of glutamates: broth, tomatoes, aged cheese, cooked mushrooms.",
    sensitivity: { "tip": 0.85, "front-edges": 0.9, "back-edges": 0.9, "back": 0.95 },
  },
];

function tasteById(id) { return TASTES.find((t) => t.id === id) || null; }

/* ---------------- Bitter + sweet: the negotiation ----------------
   Each dish's profile on five axes, 0–10. The bench's claim is
   modest and checkable: in every dish here, bitter and sweet are
   BOTH on the table — the dish works because they negotiate, with
   salt, acid, and fat as the mediators. */

const FLAVOUR_AXES = ["bitter", "sweet", "salt", "acid", "fat"];

const DISHES = [
  {
    id: "dark-chocolate", name: "Dark chocolate (70%)",
    profile: { bitter: 8, sweet: 4, salt: 1, acid: 2, fat: 7 },
    why: "Cacao is honestly bitter — that is the bean talking. The sugar doesn't hide it; it gives the bitterness somewhere to stand, and the cocoa butter slows the whole thing down so the flavour lasts. Drop the sugar (100% bars exist) and most people taste only the alarm.",
    lever: "Too harsh? A flake of salt — salt mutes bitter perception and makes the sweet read louder without adding any.",
  },
  {
    id: "grapefruit", name: "Grapefruit with sugar",
    profile: { bitter: 5, sweet: 6, salt: 0, acid: 8, fat: 0 },
    why: "Grapefruit carries a real bitter compound (naringin) in its pith and membranes, on top of a loud acid. A spoon of sugar doesn't remove either — it rebalances the panel so the fruit's own sweetness registers. Broiled, the top caramelises and the negotiation gets easier still.",
    lever: "Still too bitter? Eat it with a pinch of salt on top, the old diner trick — or broil it and let heat do the sweetening.",
  },
  {
    id: "coffee", name: "Coffee, with milk and a sugar",
    profile: { bitter: 6, sweet: 5, salt: 0, acid: 3, fat: 4 },
    why: "Black coffee is bitterness nearly alone — chlorogenic acids and roast compounds, bitter 9 on this bench's scale — which is why so much of the world negotiates it down with milk fat and sugar. Neither erases the bitter; they give it company, and the drink becomes a chord instead of a single loud note.",
    lever: "Too bitter even so? The usual fault is the brewing, not the bean: water too hot or a steep too long pulls extra bitter compounds out.",
  },
  {
    id: "salted-caramel", name: "Salted caramel",
    profile: { bitter: 2, sweet: 9, salt: 5, acid: 0, fat: 6 },
    why: "Caramel is sugar cooked to the edge of burning — its faint bitterness is the taste of almost-too-far. Salt is the mediator here: it suppresses what little bitter there is and makes sweetness taste more like itself, which is why a salted caramel reads richer than a sweeter plain one.",
    lever: "Tastes flat? It's rarely more sugar it wants. A few more flakes of salt wake the whole profile up.",
  },
  {
    id: "sweet-tea", name: "Sweet tea with lemon",
    profile: { bitter: 3, sweet: 8, salt: 0, acid: 5, fat: 0 },
    why: "Tea's bitterness is tannin — a mild plant defence, the same family of compounds that makes unripe fruit pucker. Sugar handles the tannin; lemon's acid brightens the panel and keeps the sweetness from tasting sleepy. Three negotiators, one glass.",
    lever: "Too tannic? A shorter steep. Tannins keep extracting the longer the leaves sit — time is an ingredient.",
  },
];

function dishById(id) { return DISHES.find((d) => d.id === id) || null; }

/* ---------------- The camp kitchen: Dutch-oven coals ----------------
   The published briquette chart as circulated from J. Wayne Fears'
   "The Complete Book of Dutch Oven Cooking" and reproduced by
   Chuckwagon Supply: at 325 °F the count is the oven's diameter + 3
   on top, diameter − 3 underneath, and every +25 °F adds one coal
   on top and one underneath. Lodge's own chart splits the heat
   differently (more on top) — the disagreement is documented in
   THIRD-PARTY.md; counts are a starting point, not a promise. */

const DUTCH_OVEN_SIZES = [8, 10, 12, 14, 16];
const DUTCH_OVEN_TEMPS = [300, 325, 350, 375];

const DUTCH_OVEN_CHART = {
  300: { 8: [10, 4], 10: [12, 6], 12: [14, 8], 14: [16, 10], 16: [18, 12] },
  325: { 8: [11, 5], 10: [13, 7], 12: [15, 9], 14: [17, 11], 16: [19, 13] },
  350: { 8: [12, 6], 10: [14, 8], 12: [16, 10], 14: [18, 12], 16: [20, 14] },
  375: { 8: [13, 7], 10: [15, 9], 12: [17, 11], 14: [19, 13], 16: [21, 15] },
};

/* Returns { top, bottom, total } or null for anything off the chart. */
function dutchOvenCoals(sizeInches, tempF) {
  const row = DUTCH_OVEN_CHART[tempF];
  if (!row || !row[sizeInches]) return null;
  const pair = row[sizeInches];
  return { top: pair[0], bottom: pair[1], total: pair[0] + pair[1] };
}

/* ---------------- Food plants: identification data ----------------
   Every plant here is taught the same way: the marks that must ALL
   agree before the name is earned, the season for the part named,
   the look-alike that punishes a shortcut, and a caution. Months are
   1–12, northern hemisphere, temperate North America — the room's
   home ground; other places shift the calendar. */

const PLANTS = [
  {
    id: "dandelion", name: "Dandelion",
    part: "Young leaves, flowers, root",
    season: { start: 3, end: 10 }, bestMonths: "Leaves best March–May, before the flowers; usable, more bitter, all season",
    marks: [
      "Leaves in a flat ground rosette, deeply jagged — the 'lion's teeth' the name (dent-de-lion) describes",
      "One flower per stalk, and the stalk is hollow, smooth, and leafless",
      "Broken leaf or stalk weeps white milky sap",
      "A single stout taproot, never a bulb or a rhizome mat",
    ],
    lookalike: {
      name: "Cat's ear and other false dandelions",
      note: "Hairy leaves and solid, branching stems give them away. The mix-up costs you a bitter mouthful, not a hospital trip — but a rosette you can't name before it flowers is a rosette you leave alone.",
    },
    caution: "Lawn dandelions are only as clean as the lawn. Herbicides and weed-and-feed make the commonest plant the riskiest plate.",
  },
  {
    id: "plantain", name: "Broadleaf plantain",
    part: "Young leaves; seeds",
    season: { start: 4, end: 10 }, bestMonths: "Young leaves April–June; seeds late summer",
    marks: [
      "Wide oval leaves, all from one ground rosette, hugging the soil",
      "Five to seven strong ribs run tip-to-base, parallel — no branching vein net",
      "A torn leaf's ribs pull out in elastic strings",
      "A leafless spike rises from the centre, packed with tiny seeds",
    ],
    lookalike: {
      name: "Lily-of-the-valley (young leaves)",
      note: "Its leaves unroll from a stem base, carry a fine branching vein pattern instead of plantain's bold parallel ribs, and grow in colonies from rhizomes. It is genuinely poisonous — this is the confusion that makes the ribs worth checking, every time.",
    },
    caution: "Plantain loves paths, driveways, and field edges — which is to say, runoff, dog traffic, and spray drift. Pick high, pick away from the road.",
  },
  {
    id: "clover", name: "Red & white clover",
    part: "Flower heads, young leaves",
    season: { start: 5, end: 9 }, bestMonths: "Flower heads May–September, picked fresh and dry",
    marks: [
      "Leaflets in threes, on their own little stalks, from a creeping or upright stem",
      "Red clover: a round pink-red flower head sitting on a short stalk, leaflets often with a pale chevron",
      "White clover: a white-to-pale-pink ball of small florets, stems that creep and root at the joints",
      "The flower head is a cluster of many tiny tube florets — never one single flower",
    ],
    lookalike: {
      name: "Wood sorrel",
      note: "The friendly mix-up: wood sorrel's leaflets are hearts, not ovals, and they fold down along a centre crease. It's a different plant with a different (lemony, oxalic) taste — the lesson is that 'three leaflets' alone names nothing.",
    },
    caution: "Clover from a treated lawn is out, and mouldy clover hay is a livestock poison story — fresh, clean, correctly named flower heads are the whole lesson here.",
  },
  {
    id: "blackberry", name: "Blackberry",
    part: "Fruit",
    season: { start: 7, end: 9 }, bestMonths: "Fruit July–September, fully black and soft",
    marks: [
      "Arching, thorny canes that root where their tips touch ground",
      "Leaves of three to five toothed leaflets, pale and slightly hairy beneath",
      "White-to-pink five-petalled flowers before the fruit",
      "The fruit is a cluster of small drupelets — and the green core (torus) comes away INSIDE the picked berry",
    ],
    lookalike: {
      name: "Raspberry",
      note: "The classic tell: a raspberry slips off its core and leaves it on the plant like a thimble; a blackberry keeps the core and eats soft. Both are food — the point is that one small structural mark, checked, separates them with certainty.",
    },
    caution: "The hazard at a bramble patch is usually not the berry but the company: poison ivy's 'leaves of three' climbs through blackberry canes. Gloves, long sleeves, and eyes on the canes, not just the fruit.",
  },
  {
    id: "wood-sorrel", name: "Wood sorrel",
    part: "Leaves and flowers, in small amounts",
    season: { start: 4, end: 10 }, bestMonths: "Spring through fall, whenever the leaves are fresh",
    marks: [
      "Three leaflets, each one a clean heart shape, meeting at a point",
      "The leaflets fold downward along their crease at night and in harsh sun",
      "Small five-petalled flowers — yellow in the common yard species, pink in some woodland ones",
      "No clover-style flower ball, no creeping rooting stems; a delicate, low plant",
    ],
    lookalike: {
      name: "Clover",
      note: "Round or oval leaflets that never fold, and ball-shaped flower heads. Sorrel's hearts-plus-fold is the mark pair; one without the other is not enough.",
    },
    caution: "The lemon tang is oxalic acid. That means garnish amounts — a few leaves in a salad — not bowls of it, and people with kidney trouble or gout should skip it entirely.",
  },
  {
    id: "cattail", name: "Cattail",
    part: "Young shoots (spring), pollen (early summer), rhizomes (fall–spring)",
    season: { start: 3, end: 11 }, bestMonths: "Shoots in spring; pollen when the spike turns gold; rhizomes in the cold months",
    marks: [
      "The brown, hot-dog-on-a-stick flower spike — in season, a yellow pollen spike stands directly above it",
      "Long, flat, strap leaves, taller than you are, from the base",
      "Grows standing in shallow water or marsh edges, in colonies",
      "The brown spike persists through winter, fraying into fluff",
    ],
    lookalike: {
      name: "Blue flag iris (young shoots)",
      note: "Before any spike exists, young cattail and iris shoots can be confused — and iris is poisonous. The rule that saves you: no brown spike, no cattail harvest. The spike is the signature; without it, the name isn't earned.",
    },
    caution: "Cattails are water filters that keep what they catch — heavy metals and runoff included. Harvest only from water you'd trust, which rules out roadside ditches entirely.",
  },
];

function plantById(id) { return PLANTS.find((p) => p.id === id) || null; }

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function monthName(m) { return MONTH_NAMES[m - 1] || null; }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TONGUE_REGIONS, TASTES, tasteById,
    FLAVOUR_AXES, DISHES, dishById,
    DUTCH_OVEN_SIZES, DUTCH_OVEN_TEMPS, DUTCH_OVEN_CHART, dutchOvenCoals,
    PLANTS, plantById, MONTH_NAMES, monthName,
  };
}
