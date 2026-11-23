"use strict";
/* Everyday Earth — pure rules. No DOM: test.cjs checks this file directly.
   Every bench on the page reads the data and functions below, so the page
   and the tests can never drift apart. The room's one rule: every number
   is the honest one, with its range or its "about" still attached — crust
   thickness varies, topsoil times are a range, and a forecast is a
   probability, never a promise. */

/* ---- The water cycle: four stages, one loop, no new water ----
   The same water, endlessly rearranged: the Sun lifts it, the air cools
   it, gravity brings it down, and the land and sea gather it to start
   again. About 90% of the air's moisture rises from oceans, seas, and
   lakes; the rest is breathed out by plants (transpiration) — USGS
   figures, rounded the way the page states them. */
const WATER_CYCLE = [
 { id: "evaporation", name: "Evaporation", short: "The Sun lifts water into the air",
   steps: [
    "Sunlight warms the surface of oceans, lakes, rivers, and wet soil, and the fastest water molecules escape into the air as invisible vapour.",
    "Plants do it too: roots pull water up and leaves breathe it out — transpiration. Together the two are sometimes called evapotranspiration.",
    "About 90% of the air's moisture comes straight off open water; most of the rest comes out of leaves.",
    "Nothing is used up and nothing is made. The water only changes costume — liquid to gas — and climbs."] },
 { id: "condensation", name: "Condensation", short: "The air cools, and the vapour gathers",
   steps: [
    "Rising air cools — roughly a degree Celsius for every 100 metres up — and cold air cannot hold as much vapour as warm air.",
    "The vapour condenses onto specks of dust and salt, becoming droplets too small to fall: a cloud is born, which is why clouds have flat bottoms — that is the height where the cooling air lets go.",
    "The same thing happens on a small scale as dew on grass and fog on a cold morning: surfaces colder than the air collect the water the air drops."] },
 { id: "precipitation", name: "Precipitation", short: "The droplets grow heavy and fall",
   steps: [
    "Inside a cloud, droplets bump and merge until they are too heavy for the air to hold, and gravity takes them: rain.",
    "Cold enough on the way down and the same water arrives as snow, sleet, or hail — one stage, several costumes again.",
    "Most rain that falls on land falls on the oceans' account: the wind carried the vapour inland first. Weather is the water cycle with a travel budget."] },
 { id: "collection", name: "Collection & runoff", short: "The land and sea gather it up again",
   steps: [
    "Fallen water gathers: some runs off the surface into streams and rivers, some soaks in and becomes groundwater, some is caught by lakes and by ice.",
    "Groundwater is the slow lane — water in deep rock can sit underground for thousands of years before a spring or a well lets it out.",
    "All of it is heading, sooner or later, back to a surface the Sun can lift it from. The loop closes; evaporation is already waiting."] }
];
function cycleStage(id) {
 return WATER_CYCLE.find((s) => s.id === id) || null;
}
function nextStage(id) {
 const i = WATER_CYCLE.findIndex((s) => s.id === id);
 if (i < 0) return null;
 return WATER_CYCLE[(i + 1) % WATER_CYCLE.length];
}

/* ---- Rocks: three families, told by how each was born ----
   Igneous: born from melt. Sedimentary: born from layers, pressed.
   Metamorphic: born from other rocks, changed by heat and pressure
   without melting. Nine rocks a person actually meets, sorted. */
const ROCK_FAMILIES = {
 "Igneous": "Born from melted rock — magma underground, lava at the surface — cooled until it froze solid.",
 "Sedimentary": "Born from pieces and remains — sand, mud, shells — laid down in layers and pressed or cemented into stone.",
 "Metamorphic": "Born from other rocks — buried, heated, and squeezed until the original changed into something new, without ever melting."
};
const ROCKS = [
 { name: "Granite", family: "Igneous", how: "Magma that cooled slowly, deep underground, so its crystals had time to grow big enough to see — the salt-and-pepper speckle.", see: "Kitchen countertops, curbstones, and the fronts of old city banks." },
 { name: "Basalt", family: "Igneous", how: "Lava that poured out and cooled fast at the surface, freezing fine-grained and dark before crystals could grow.", see: "The ocean floor is made of it; also black sand beaches and much road gravel." },
 { name: "Pumice", family: "Igneous", how: "Lava so full of gas bubbles as it froze that the stone is mostly holes — light enough to float on water.", see: "The scrubbing stone in the bathroom, and light garden rock." },
 { name: "Sandstone", family: "Sedimentary", how: "Sand — from beaches, rivers, and dunes — buried and cemented grain to grain until it held together as stone.", see: "The striped cliffs of the desert Southwest, and a lot of old building stone." },
 { name: "Limestone", family: "Sedimentary", how: "The shells and skeletons of sea creatures, rained down on ancient sea floors and pressed into rock — a graveyard that became a cliff.", see: "Chalk's close cousin; cement is made from it, and caves dissolve through it." },
 { name: "Shale", family: "Sedimentary", how: "Mud, settled in quiet water and pressed flat — it still remembers being layers, and splits into thin sheets.", see: "The flaky grey rock in road cuts that you can peel with a fingernail." },
 { name: "Marble", family: "Metamorphic", how: "Limestone, buried and cooked by heat and pressure until its grains recrystallised into interlocking swirls — the same chemistry, a new stone.", see: "Statues, grand floors, and the Taj Mahal." },
 { name: "Slate", family: "Metamorphic", how: "Shale, squeezed hard enough to line its minerals up, so it splits into flat, hard, waterproof sheets.", see: "Roof tiles and the blackboards of old classrooms." },
 { name: "Gneiss", family: "Metamorphic", how: "Granite and its kin, heated and pressed until their minerals sorted themselves into wavy light and dark bands.", see: "Polished decorative stone — granite's dramatic, banded relative." }
];
function rockInfo(name) {
 return ROCKS.find((r) => r.name === name) || null;
}
function rocksByFamily(family) {
 return ROCKS.filter((r) => r.family === family);
}
/* The rock cycle in brief: every family can become every other, given
   time and the right treatment. The loop, as steps a bench can print. */
function rockCycle() {
 return { steps: [
  "Start anywhere — say, with granite, an igneous rock cooling from magma deep underground.",
  "Weather breaks every rock at the surface: wind, water, ice, and roots crumble it into sediment.",
  "Buried and pressed, sediment becomes sedimentary rock — sandstone, limestone, shale.",
  "Buried deeper, heat and pressure cook any rock into metamorphic rock — limestone into marble, shale into slate.",
  "Hot enough at last, any rock melts back into magma — and the wheel has come all the way around.",
  "The catch is the timescale: the full turn takes millions of years. Rocks are not permanent; they are just slow."] };
}

/* ---- Soil: five horizons, read like a layer cake ----
   The letters are the soil scientist's shorthand (O, A, B, C, R). The
   garden lives in A — the topsoil — and topsoil is the slow part:
   an inch of it can take a few hundred to a thousand years to form,
   which is why losing it to erosion is a one-way door. */
const SOIL_HORIZONS = [
 { letter: "O", name: "Organic layer", depth: "The surface itself", what: "Fallen leaves, needles, and litter, mid-decay — the forest's compost pile, feeding everything below it." },
 { letter: "A", name: "Topsoil", depth: "The first few inches to a foot or so", what: "Dark, crumbly, and alive: mineral soil mixed with rotted organic matter, roots, worms, and more microbes in a teaspoon than people on Earth. This is the horizon gardens and farms live in." },
 { letter: "B", name: "Subsoil", depth: "Below the topsoil", what: "Paler and firmer: minerals washed down from above collect here — iron, clay, salts. Fewer roots, less life, but a storehouse of water and nutrients the deep roots tap." },
 { letter: "C", name: "Parent material", depth: "Deeper still", what: "Broken, weathered rock — the raw ingredient soil is being made from. Barely touched by life; the horizon that says what the soil above it will become." },
 { letter: "R", name: "Bedrock", depth: "The bottom", what: "Solid, unbroken rock. Roots and water mostly stop here — and, given a few hundred thousand years, this is where new soil comes from." }
];
function soilHorizon(letter) {
 return SOIL_HORIZONS.find((h) => h.letter === letter) || null;
}

/* ---- The deep Earth: layers at their true depths ----
   Depths in kilometres below the surface. The crust's bottom is a range
   (5–10 km under oceans, 30–50 under continents, up to ~70 under great
   mountain ranges); the bench uses the deepest common figure, 70, so the
   crust gets its best case — and still comes out a hairline. */
const EARTH_RADIUS_KM = 6371;
const EARTH_LAYERS = [
 { name: "Crust", top: 0, bottom: 70, what: "The thin skin everything lives on — 5 to 10 km thick under the oceans, 30 to 50 under the continents, up to about 70 under the highest mountains. Every mine, well, and borehole ever dug is still in it." },
 { name: "Mantle", top: 70, bottom: 2900, what: "Hot rock that is solid but able to creep, over millions of years, like very stiff toffee — its slow churning is what drags the continents around. This is most of the planet: everything from under the crust to 2,900 km down." },
 { name: "Outer core", top: 2900, bottom: 5150, what: "Liquid iron and nickel, hot enough to glow — its swirling is what generates the Earth's magnetic field, the one the Survival Guide's compass needles follow." },
 { name: "Inner core", top: 5150, bottom: 6371, what: "A ball of iron and nickel about 1,220 km in radius, squeezed solid by pressure despite being roughly 5,100–6,000 °C — about as hot as the surface of the Sun. Even 'solid' is seismology's best reading rather than a certainty: research published in February 2025 found its near-surface seems to deform and shift shape over time, less rigid than once thought. Nobody has been there; we know it from earthquake waves that pass through it." }
];
function depthLayer(km) {
 if (typeof km !== "number" || !isFinite(km) || km < 0) return { ok: false };
 if (km > EARTH_RADIUS_KM) return { ok: false };
 const layer = EARTH_LAYERS.find((l) => km >= l.top && km < l.bottom) || EARTH_LAYERS[EARTH_LAYERS.length - 1];
 const toCenter = EARTH_RADIUS_KM - km;
 const pct = Math.round((km / EARTH_RADIUS_KM) * 1000) / 10;
 return { ok: true, km, layer: layer.name, what: layer.what, toCenter, pct,
  steps: [
   km + " km down is inside the " + layer.name.toLowerCase() + " (" + layer.top.toLocaleString("en-US") + "–" + layer.bottom.toLocaleString("en-US") + " km).",
   layer.what,
   "That is " + pct + "% of the way to the centre — " + toCenter.toLocaleString("en-US") + " km still to go.",
   "For scale: the deepest mine reaches about 3.9 km, the deepest hole ever drilled about 12.3 km, and the deepest ocean trench about 10.9 km. All three are still in the crust — scratches on the skin."] };
}

/* ---- Weather from the ground ----
   Fronts: the borders between air masses, drawn on the map and felt on
   the skin. The barometer: one instrument, read as a trend — rising
   means the air above you is getting heavier (fair weather's habit),
   falling means it is lightening (storms' habit). Trend thresholds are
   the traditional three-hour rules of thumb, stated as rules of thumb. */
const FRONTS = {
 cold: { name: "Cold front", symbol: "A line of triangles, pointing the way the front is moving",
  steps: [
   "Cold, heavy air is bulldozing into warm air, and the warm air has nowhere to go but up — fast.",
   "Going up fast is what builds tall storm clouds: expect a band of showers or thunderstorms as the front passes, sometimes a fierce but brief one.",
   "Behind it: cooler, drier, clearer air. The classic pattern is a stormy hour, then a washed-clean sky and a jacket you didn't need that morning."] },
 warm: { name: "Warm front", symbol: "A line of semicircles, pointing the way the front is moving",
  steps: [
   "Warm air is sliding gently up and over a wedge of cold air — a ramp, not a bulldozer — so the lift is slow and spread over hundreds of kilometres.",
   "Expect high thin cloud first, thickening over a day or so into long, steady rain or snow, then the front passes.",
   "Behind it: warmer, more humid air. The pattern is a slow grey build, a long wet spell, then a milder sky."] }
};
function frontInfo(kind) {
 const f = FRONTS[kind];
 if (!f) return { ok: false };
 return { ok: true, kind, name: f.name, symbol: f.symbol, steps: f.steps.slice() };
}
const CLOUDS = [
 { name: "Cirrus", look: "Wispy streaks and feathers, very high — above about 6 km", foretells: "Fair weather right now. If the streaks thicken and lower over a day or two, a warm front may be on its way — the sky's earliest weather bulletin." },
 { name: "Cumulus", look: "Puffy white heaps with flat bottoms, like floating cauliflower", foretells: "The picnic clouds: fair weather, made by rising bubbles of warm air. Honest warning — if they keep growing taller through the afternoon, they are on their way to becoming the next entry." },
 { name: "Stratus", look: "A flat grey blanket, low — under about 2 km — covering the whole sky", foretells: "Dull, still, settled weather. Drizzle or light snow possible; storms are not. The sky has put a lid on." },
 { name: "Cumulonimbus", look: "A dark tower of cloud, sometimes with a flat anvil top, reaching 12 km or more", foretells: "A thunderstorm, built and loaded: heavy rain, lightning, possibly hail and violent gusts. This is the one cloud that gives orders — when thunder roars, go indoors." }
];
function cloudInfo(name) {
 return CLOUDS.find((c) => c.name === name) || null;
}
function pressureTrend(changeHpa) {
 if (typeof changeHpa !== "number" || !isFinite(changeHpa)) return { ok: false };
 let trend, meaning;
 if (changeHpa >= 2) { trend = "Rising quickly"; meaning = "The air overhead is getting heavier fast — unsettled weather is clearing out. Expect improving skies and often a freshening wind as the high pressure builds in."; }
 else if (changeHpa >= 0.6) { trend = "Rising"; meaning = "High pressure is building or holding. Fair, settled weather is the way to bet — the barometer's version of good news."; }
 else if (changeHpa > -0.6) { trend = "Steady"; meaning = "Nothing is changing hands up there. Expect more of whatever you have — the honest forecast a single instrument can make."; }
 else if (changeHpa > -2) { trend = "Falling"; meaning = "Low pressure is on its way in. Expect the weather to turn — cloud thickening, rain more likely in the next day or so."; }
 else { trend = "Falling quickly"; meaning = "Pressure dropping fast is the classic storm warning: strong wind and heavy rain are likely within hours. Old barometers printed it in one word: STORMY."; }
 return { ok: true, change: changeHpa, trend, steps: [
  "Over the last three hours the pressure changed by " + (changeHpa > 0 ? "+" : "") + changeHpa + " hPa — the needle is " + trend.toLowerCase() + ".",
  meaning,
  "The honest limit: a barometer reads one place and one trend. It is a good witness, not a forecast service — for the whole map, check the National Weather Service."] };
}
/* Mean sea-level pressure is 1013.25 hPa = 29.92 inches of mercury.
   1 inHg = 33.8639 hPa, by definition of the conventional inch of mercury. */
function hpaToInhg(hpa) { return hpa / 33.8639; }
function inhgToHpa(inhg) { return inhg * 33.8639; }

const api = { WATER_CYCLE, cycleStage, nextStage, ROCK_FAMILIES, ROCKS, rockInfo, rocksByFamily, rockCycle,
 SOIL_HORIZONS, soilHorizon, EARTH_RADIUS_KM, EARTH_LAYERS, depthLayer,
 FRONTS, frontInfo, CLOUDS, cloudInfo, pressureTrend, hpaToInhg, inhgToHpa };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") Object.assign(window, api);
