# Sources, credits, and model limits

## Bundled data and code

- **Yale Bright Star Catalogue, 5th revised edition** (D. Hoffleit and W. H. Warren Jr., 1991; Yale University Observatory / NASA Astronomical Data Center), retrieved as the `heasarc_bsc5p` table from NASA HEASARC: https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html . `sky-data.js` keeps the 903 stars of magnitude 4.5 and brighter (positions rounded to 0.01°, magnitude, B−V colour, HR number, Bayer/Flamsteed label). The catalogue is a freely distributed scientific data set; credit is retained here. T Coronae Borealis (HR 5958) is left out because the catalogue lists it at its 1946 outburst brightness.
- **d3-celestial** constellation stick figures (`constellations.lines.json`) and names (`constellations.json`), Copyright (c) 2015, Olaf Frohn, https://github.com/ofrohn/d3-celestial , BSD 3-Clause License. Reduced and rounded in `sky-data.js`. The licence text:

  > Copyright (c) 2015, Olaf Frohn. All rights reserved.
  > Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  > 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  > 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  > 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  > THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

- **satellite.js 5.0.0** (SGP4/SDP4 orbit propagation), (c) 2013 Shashwat Kandadai and UCSC, https://github.com/shashwatak/satellite-js , MIT License; unmodified minified build in `vendor/satellite.min.js`, licence in `vendor/satellite-js-LICENSE.md`. SGP4 follows Vallado, Crawford, Hujsak and Kelso, "Revisiting Spacetrack Report #3" (AIAA 2006-6753).
- **Satellite orbits** (two-line element sets) in `satellites-tle.js`: CelesTrak, https://celestrak.org/ (Dr T.S. Kelso), GP data groups `stations` and `starlink`, fetched 14 November 2026. Orbital data originates with the U.S. Space Force via Space-Track; CelesTrak redistributes it for public use. Included: the ISS, all 24 satellites of Starlink launch 2026-159, and a sample of 48 other Starlink satellites. No SpaceX Dragon was flying free on that date. The optional **Refresh orbits** button requests the same two public lists from celestrak.org; no location or personal data is sent.
- **Backyard radio telescope plan** (`downloads/backyard-radio-telescope-plan.pdf`, 4 pages, 4 November 2026): supplied by Steven Powell and shipped unchanged (SHA-256 recorded in `../../provenance/tonights-sky.json`). "Plan prepared November 4, 2026, with Muse. The dish, the mount, and the idea are the family's." The idea is Henry Douglas Powell's, a ham radio operator since 1956. It is not covered by this workshop's MIT/CC BY notices unless Steven says so; ask before reusing it elsewhere. A related photo post is linked, not copied: https://www.facebook.com/photo?fbid=10244026378851229&set=a.1174251832908 (Facebook; may require a login).

## Methods and reference values

- Skywatch (`sky.py`, Steven Powell, Bordeom repository, commit 3891b43, 10 November 2026): the orbital elements, Moon perturbation terms, precession, magnitude formulas, red night mode, deep-sky list and several self-test cases were ported from it to JavaScript.
- Paul Schlyter, "How to compute planetary positions", https://stjarnhimlen.se/comp/ppcomp.html (orbital elements and perturbations).
- Jean Meeus, *Astronomical Algorithms*, 2nd ed., Willmann-Bell, 1998 (Julian day, sidereal time, precession, planet magnitudes).
- Test reference positions: NASA/JPL Horizons, https://ssd.jpl.nasa.gov/horizons/ , queried 14 November 2026. Test reference satellite passes: Skyfield 1.55 and python-sgp4 2.27 (Brandon Rhodes, MIT). Neither is bundled.
- Radio source positions and rough flux densities: standard values (e.g. Baars et al. 1977 for Cas A, Cyg A, Tau A, Vir A). Galactic coordinate pole: IAU 1958 system in J2000. Pulsar periods: ATNF Pulsar Catalogue values, rounded.
- Distances to stars are rounded modern (Hipparcos/Gaia-era) estimates; far ones are uncertain and marked "roughly".

## External links

NASA Radio JOVE, the Society of Amateur Radio Astronomers, NRAO, Green Bank Observatory, bigear.org, CelesTrak and Facebook are external sites with their own terms. Links need internet. No endorsement or affiliation is implied. No affiliation with SpaceX, NASA, or any observatory.

## Model limits

Approximate positions: Sun and planets within a few hundredths of a degree near 2026, the Moon within about 0.1–0.3°, decreasing slowly for dates far from today. Atmospheric refraction, ΔT, nutation, aberration and stellar proper motion are ignored. The Sun, Moon and planets are drawn larger than life. Twilight colours and faint-star limits are a sketch. Satellite predictions depend on orbit age (good for about 1–2 weeks) and use a cylindrical Earth shadow; brightness is not predicted. The radio sky picture, hydrogen spectrum, interferometer fringes and pulsar sounds are labelled simulations.
