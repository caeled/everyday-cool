# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data files are bundled in this folder.

## Data sources (facts, not files)

- **Standard atomic weights** — the conventional values published by the Commission on Isotopic Abundances and Atomic Weights (CIAAW), as printed on standard periodic tables (e.g. oxygen 15.999, iron 55.845, chlorine 35.45). The values in `chem.js` were checked against those standard values before shipping, and `test.cjs` re-checks the shell sums and several molar masses on every run.
- **Bohr shell counts** — the textbook shell arrangements printed on school periodic tables (chlorine 2,8,7; calcium 2,8,8,2; iron 2,8,14,2; gold 2,8,18,32,18,1). For elements past calcium these are the standard school-level simplification of a more complicated reality; the page and Help say the drawing is a map, not a photograph.
- **Neutron counts** — computed, not copied: for each element, the standard mass is rounded to a whole number (the mass number of its most common isotope) and the proton count subtracted. The page states this method plainly wherever the number appears.

## Linked, not loaded (each opens in a new tab, under its own terms)

PhET Build an Atom (phet.colorado.edu) · Royal Society of Chemistry periodic table (rsc.org/periodic-table) · Ptable (ptable.com) · Khan Academy chemistry (khanacademy.org) · American Chemical Society, Celebrating Chemistry (acs.org). Every link was checked live on 18 November 2026: PhET, Ptable, Khan Academy, and ACS returned HTTP 200 to a direct request; the RSC table answers direct script requests oddly through some networks, but its page was fetched and read in full the same day and is live at the address given.

## Nothing is called at view time

Unlike some rooms, this page makes no network calls at all: the benches run entirely in the browser from data in `chem.js`, and the shelf links are only followed when a visitor presses one.

## Limitations

The Bohr model is a teaching picture: electrons do not orbit in circles, and shell counts for the transition and heavier metals are the textbook simplification. Molar masses use the standard (average) atomic weights, so a weighed result is the average mole mass, not the mass of one specific isotope's mole. The formula bench reads formulas with plain digits and round brackets; it does not read subscript characters pasted from other documents, charges, or state symbols, and it says so in plain language when it cannot read something. The kitchen experiments are written for ordinary kitchen safety with adult help at the marked steps; they are introductions, not laboratory procedures. Descriptions were written on 18 November 2026; each linked site's own pages are the authority.
