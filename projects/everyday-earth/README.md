# Everyday Earth

An Everyday Cool workshop about the planet under the bench: the water cycle as one endless loop, the three rock families and the rocks you actually meet, soil in its five horizons, the Earth's layers at their true depths, and weather read from the ground — fronts, clouds, and a barometer — with doors out to Wikipedia, the USGS, NOAA, UC Davis's Earth Day, and the pocket Weather Everywhere.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Earth.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-earth)

## What's inside

- **The water cycle bench** — one drawn landscape (lake, mountain, cloud) with the four stages tappable: evaporation (with the USGS's ~90% ocean share and transpiration beside it), condensation (why clouds have flat bottoms), precipitation, and collection & runoff (groundwater as the slow lane). Each stage names the next, because the loop is the lesson. The honesty card keeps the headline claim's edges showing: the water is older than the dinosaurs; individual molecules are not immortal.
- **The rock sorter** — nine rocks, three per family: granite, basalt, pumice (igneous — born from melt); sandstone, limestone, shale (sedimentary — born from layers); marble, slate, gneiss (metamorphic — born from other rocks, changed). Each answers with its family's birth story, how it formed, and where you actually see it — granite countertops, limestone caves, marble floors. Companion cards give the rock cycle in brief and the three-question field method (crystals, layers, or bands).
- **The soil bench** — the five horizons drawn as a layer cake and tappable: O organic litter, A topsoil, B subsoil, C parent material, R bedrock, with the garden angle throughout and the drawing honestly labelled not to scale. The topsoil card carries the formation range: an inch in a few hundred to a thousand years (the USDA's often-quoted figure is ~500), which is why erosion is a one-way door.
- **The depth bench** — any depth from the surface to the centre (6,371 km) reports its layer — crust, mantle, outer core, inner core — over a bar drawn at true scale, where the crust, given its deepest figure of 70 km, is still a hairline. Chips mark the deepest mine (~3.9 km), the Mariana Trench (~10.9 km), and the deepest hole ever drilled (~12.3 km): all still in the crust. Companion cards explain how seismology knows (earthquake waves are the X-ray) and how the liquid outer core runs the compass the Survival Guide depends on.
- **Weather from the ground** — a front bench (cold front the bulldozer: brief storms, then cooler dry air; warm front the ramp: long steady rain, then warmer air, with the map symbols named), a cloud spotter (cirrus, cumulus, stratus, cumulonimbus — look, height, and what each foretells), and a barometer bench (hPa ⇄ inHg, and the three-hour trend read by the traditional rules of thumb). The honesty card states the section's limit plainly — a forecast is a probability, not a promise — and prints the one certain rule: when thunder roars, go indoors.
- **Links out** — fifteen destinations in four grouped shelves, every one verified live on 19 November 2026: the ideas one by one on Wikipedia (Earth science, Water cycle, Rock (geology), Rock cycle, Soil horizon, Internal structure of Earth, Weather front, Cloud); the survey and the forecast (USGS's Water Cycle, the National Weather Service, NOAA); weather in your pocket (the Travel Kit's releases, carrying Weather Everywhere); and the day and the school (EARTHDAY.ORG, UC Davis's Earth Day page, and the UC Davis Library's traditions exhibit — the record of Whole Earth Week, March 1970, one of the first Earth Day celebrations anywhere, kept carefully distinct from Earth Day's national founding).
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the water cycle, rocks and their families, soil horizon by horizon, down to the core, weather from the ground, the links shelf, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Tonight's Sky (we look down; that room looks up), Weather Everywhere (the weather at planetary scale, and in the Travel Kit's pocket), and The Survival Guide (Earth skills outdoors — including the compass whose needle answers to the outer core).

## Run it

Open `index.html` in a browser. The cycle, sorter, soil, depth and weather benches, and Help work fully offline — they are data and arithmetic. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (the water cycle's stages and loop, the nine rocks and their families, the rock cycle, the soil horizons, the layer boundaries at their true depths, the fronts, the clouds, the barometer trend thresholds, and the hPa ⇄ inHg conversion) live in `earth.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that the cycle closes (collection feeds evaporation), that granite is igneous, limestone sedimentary, and marble metamorphic, that the deepest mine, trench, and borehole all land in the crust while 2,900 km lands in the outer core, that a −2 hPa three-hour fall reads "falling quickly," and that 1013.25 hPa converts to 29.92 inHg.

## Files

- `index.html` — the room itself
- `earth.js` — pure rules: the water cycle stages, the rock families and sorter data, the rock cycle, the soil horizons, the Earth's layers and the depth lookup, the fronts, the clouds, the barometer trends, the pressure conversion
- `app.js` — the wiring: the cycle scene, the sorter, the soil diagram, the true-scale depth bar, the weather benches
- `style.css` — the room's styling (shared Everyday Cool room styling plus the benches)
- `everyday-earth-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
