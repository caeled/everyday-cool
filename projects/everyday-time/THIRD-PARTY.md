# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data files are bundled in this folder.

## Data sources (facts, not files)

- **Sundial geometry** — the horizontal-dial hour-line rule, tan(angle) = sin(latitude) × tan(hour angle), is the standard gnomonics formula, as set out in the Wikipedia Sundial article on the shelf and in the North American Sundial Society's design guidance. The gnomon's triangular blade and the shadow-along-the-hour-line behaviour follow from the same geometry.
- **The equation of time** — computed with the standard approximation (9.87·sin 2B − 7.53·cos B − 1.5·sin B, B = 360/365 × (day − 81)), accurate to well under a minute against published tables (the Wikipedia Equation of time article's values: ≈+14 min on 20 November, ≈−14 min on 11 February, zero near 15 April and 14 June, maximum ≈+16.4 min in early November). `test.cjs` re-checks the famous days. The longitude term — 4 minutes per degree from the time zone's standard meridian — is exact by definition of mean time.
- **The calendar** — the Gregorian rule (÷4, ÷100, ÷400) and its 365.2425-day average are the civil calendar's own definitions; the tropical year ≈365.2422 days and the resulting ≈1-day-per-3,200-years drift are the standard published figures. The 1582 reform (ten days deleted) and the British/American switch of September 1752 are the standard history, also on the shelf's Leap year article. Weekdays and day counts use Howard Hinnant's days-from-civil algorithm (public domain algorithm, implemented here from its published form) in the proleptic Gregorian calendar.
- **Time zones** — standard UTC offsets for the seven bench cities are the published civil offsets (US Eastern −5, Central −6, Pacific −8, London 0, Berlin +1, Tokyo +9, Sydney +10). Daylight-saving seasons are stated as the usual rules (US: second Sunday of March to first Sunday of November; Europe: last Sunday of March to last Sunday of October; Sydney: first Sunday of October to first Sunday of April). Governments change these; the bench's offsets are standard time by design and say so.
- **The pendulum** — T = 2π√(L/g) with g = 9.81 m/s² is the standard small-angle result; the seconds pendulum (0.994 m for a 2-second period) and the temperature-compensation history (gridiron, mercury, invar) are the standard horological record, as on the shelf's Pendulum article.
- **Durations and anchors** — a mean Gregorian year is 365.2425 days by definition of the calendar. The Earth's age, 4.54 billion years, is the standard radiometric figure. The longest verified human lifespan, 122 years (Jeanne Calment), is the standard record. Resting heart-rate arithmetic is multiplication, and the bench labels its result an order of magnitude, not a measurement.
- **Official time** — time.gov (NIST and the US Naval Observatory) and NIST's Time and Frequency Division are the shelf's authorities for what the second and the national clock are. Royal Museums Greenwich's time pages were consulted as background for the meridian material but did not answer automated link checks, so — following this collection's practice — they are cited here as a source and kept off the linked shelf.

## Linked, not loaded (each opens in a new tab, under its own terms)

time.gov · NIST Time and Frequency Division (nist.gov) · North American Sundial Society (sundials.org) · Wikipedia: Sundial, Equation of time, Leap year, Pendulum, Time zone (wikipedia.org) · timeanddate World Clock and Duration Calculator (timeanddate.com). Every link was checked live on 20 November 2026 and returned HTTP 200 to a browser-style request.

## Nothing is called at view time

This page makes no network calls at all: the benches run entirely in the browser from code in this folder, and the zones bench takes its moment from the visitor's input rather than any clock, local or remote. The shelf links are only followed when a visitor presses one.

## Limitations

The sundial bench models a horizontal dial at northern latitudes 0–65°; southern-hemisphere dials mirror the lines and number them in reverse, and the bench does not draw those. Its equation-of-time figure is the standard approximation, not a full ephemeris — good to well under a minute, and the bench claims no more. The zones bench is standard time only, with daylight saving confessed in text rather than computed; changeover dates move by law and the bench's "roughly" is deliberate. The pendulum animation runs at the computed period but is drawn, not simulated — air resistance and the wide-swing correction are discussed, not modelled. Date arithmetic is proleptic Gregorian throughout. Descriptions were written on 20 November 2026; each linked site's own pages are the authority.
