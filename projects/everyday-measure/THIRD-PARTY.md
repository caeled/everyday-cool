# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data files are bundled in this folder.

## Data sources (facts, not files)

- **Exact conversion factors** — the legal definitions, as published by NIST (SP 811, *Guide for the Use of the International System of Units*, and NIST's SI Units pages): 1 in = 2.54 cm exactly; 1 lb = 0.45359237 kg exactly (so 1 oz = 28.349523125 g); 1 US gallon = 231 in³ = 3.785411784 L exactly (so 1 fl oz = 29.5735295625 mL, 1 cup = 236.5882365 mL); 1 Imperial gallon = 4.54609 L; 1 US ton = 2,000 lb; 1 tonne = 1,000 kg. `test.cjs` re-checks every factor against these definitions on every run.
- **The nickel** — the US Mint's specification for the five-cent coin is a weight of 5.000 g. The paperclip (≈1 g) is a widely used classroom approximation and is labelled approximate on the page.
- **Comparison shelf** — the Olympic pool's 2,500,000 L is the World Aquatics (formerly FINA) minimum volume (50 m × 25 m × 2 m). The elephant (≈6,000 kg), average US car (≈4,100 lb), giraffe (≈5.5 m), and full bathtub (≈300 L) are round, sourced-in-spirit values for familiar things that genuinely vary; each is marked approximate on the page with its range or reason. The football field's 100 yards is exact by rule.
- **Breakage stories** — the Mars Climate Orbiter account follows NASA's investigation reporting (impulse reported in pound-force seconds where newton seconds were expected; 1 lbf ≈ 4.45 N; the $327.6M figure is the total cost of the two-spacecraft Mars Surveyor '98 program, orbiter plus Polar Lander; the orbiter alone cost about $125M). The Gimli Glider account follows the Canadian investigation reporting (density factor 1.77 lb/L used where 0.8 kg/L was required; the aircraft carried roughly half its required fuel; no fatalities). Both are told briefly and in the room's own words.
- **History** — Treaty of the Meter (1875), Mendenhall Order (1893), international yard and pound agreement (1959), Metric Conversion Act (1975): standard reference facts, cross-checked against the Wikipedia articles on the shelf.

## Linked, not loaded (each opens in a new tab, under its own terms)

NIST SI Units (nist.gov) · NIST SP 811 landing page (nist.gov) · Wikipedia: Metric system, United States customary units, Mars Climate Orbiter, Gimli Glider (wikipedia.org) · Khan Academy metric units of length review (khanacademy.org). Every link was checked live on 19 November 2026: the NIST and Wikipedia pages returned HTTP 200 to a direct request and their titles and content matched their labels. Khan Academy answers automated requests with a challenge page rather than the article; the article's existence, title, and content at the address given were confirmed through the search index crawl of the same day, and the page itself carries a note that the link opens normally in a browser.

## Nothing is called at view time

This page makes no network calls at all: the ladder, benches, and comparison shelf run entirely in the browser from data in `measure.js`, and the shelf links are only followed when a visitor presses one.

## Limitations

Displayed results are rounded to at most six decimal places, which can make a round trip (there and back) differ in the last digit — the tests hold the unrounded factors to the definitions. "Weight" on the benches is everyday language for mass; the room converts mass units (grams, pounds) and does not touch force units beyond naming the pound-force in the Orbiter story. US customary units have variants this room does not carry (dry pints and quarts, troy ounces, the survey foot); the volume bench covers liquid measure, which is what kitchens and fuel pumps use. Descriptions were written on 19 November 2026; each linked site's own pages are the authority.
