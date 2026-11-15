/* Tonight's Sky: radio astronomy math and data. Original Everyday Cool code, MIT.
 * The demos built on this are simulations with simplified physics; each one says so. */
(function (root) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI, C = 299792458; // m/s
  var H_EV = 4.135667696e-15; // Planck constant, eV s
  var HI_MHZ = 1420.405751768; // the 21 cm line of neutral hydrogen

  /* -- The electromagnetic spectrum ------------------------------------------------------- */
  // [shortest wavelength in metres, name, everyday example, reaches the ground?]
  var BANDS = [
    [0, 'Gamma rays', 'Exploding stars, black hole jets, and medical scanners', 'No: the air stops them (lucky for us)'],
    [1e-11, 'X-rays', 'Hot gas around black holes; hospital X-rays', 'No: only telescopes in space see them'],
    [1e-8, 'Ultraviolet', 'Hot young stars; the light that causes sunburn', 'Only a little: ozone blocks most of it'],
    [3.8e-7, 'Visible light', 'Everything your eyes see: stars, planets, rainbows', 'Yes: the "optical window"'],
    [7.5e-7, 'Infrared', 'Warm things, dusty star nurseries; TV remotes', 'Partly: some bands get through, best from mountains or space'],
    [1e-3, 'Microwaves', 'The afterglow of the Big Bang; microwave ovens; Wi-Fi', 'Partly: from about 1 cm and longer it gets through'],
    [1e-1, 'Radio', 'Pulsars, the Milky Way, Jupiter\u2019s storms; FM radio', 'Yes: the "radio window", up to about 20 m'],
    [20, 'Long radio', 'Jupiter\u2019s bursts near 15 m; AM radio', 'Mostly no: the ionosphere reflects it back to space']
  ];
  function band(lambdaM) {
    var b = BANDS[0];
    for (var i = 0; i < BANDS.length; i++) if (lambdaM >= BANDS[i][0]) b = BANDS[i];
    return { name: b[1], example: b[2], ground: b[3] };
  }
  function frequencyHz(lambdaM) { return C / lambdaM; }
  function photonEnergyEV(lambdaM) { return H_EV * C / lambdaM; }

  /* -- Resolution and interferometry ------------------------------------------------------- */
  /** Smallest detail a dish or lens of diameter D can separate, in arcseconds (Rayleigh, 1.22 lambda / D). */
  function resolutionArcsec(lambdaM, diameterM) { return 1.22 * lambdaM / diameterM * R2D * 3600; }
  /** Dish diameter needed to reach a given resolution. */
  function diameterFor(lambdaM, arcsec) { return 1.22 * lambdaM / (arcsec / 3600 * D2R); }
  /** Two-dish fringe pattern: response (0..1) to a point source at angle theta (degrees from straight up). */
  function fringe(thetaDeg, baselineM, lambdaM) {
    var x = Math.PI * baselineM * Math.sin(thetaDeg * D2R) / lambdaM;
    return Math.cos(x) * Math.cos(x);
  }
  /** Fringe spacing in degrees (small-angle): lambda / B. */
  function fringeSpacingDeg(baselineM, lambdaM) { return lambdaM / baselineM * R2D; }

  /* -- The 21 cm line and the Milky Way's rotation ---------------------------------------- */
  var R0 = 8.2, V0 = 230; // kpc, km/s: the Sun's distance from the centre and its orbital speed (rounded)
  /** Orbital speed at radius R (kpc). 'flat' = what we measure; 'kepler' = if all the mass sat at the centre. */
  function rotationSpeed(R, model) {
    if (model === 'kepler') return V0 * Math.sqrt(R0 / Math.max(R, 0.5));
    return V0 * Math.min(1, R / 0.8); // flat curve, with a solid-body core
  }
  /** Line-of-sight velocity (km/s, + = moving away) of gas at distance d (kpc) along galactic longitude l. */
  function radialVelocity(lDeg, dKpc, model) {
    var l = lDeg * D2R, R = Math.sqrt(R0 * R0 + dKpc * dKpc - 2 * R0 * dKpc * Math.cos(l));
    return R0 * Math.sin(l) * (rotationSpeed(R, model) / R - V0 / R0);
  }
  /** Observed frequency (MHz) of the hydrogen line from gas moving at v km/s (+ away). */
  function dopplerMHz(vKms) { return HI_MHZ * (1 - vKms * 1000 / C); }
  /** Simulated hydrogen spectrum along longitude l: [{v, power}] from -150..+150 km/s. */
  function hydrogenSpectrum(lDeg, model) {
    var bins = [], i, d;
    for (i = 0; i <= 150; i++) bins.push({ v: -150 + i * 2, power: 0 });
    for (d = 0.05; d < 25; d += 0.05) {
      var l = lDeg * D2R, R = Math.sqrt(R0 * R0 + d * d - 2 * R0 * d * Math.cos(l));
      if (R > 18) continue;
      var v = radialVelocity(lDeg, d, model), dens = Math.exp(-R / 7) * (R < 3 ? 0.4 : 1);
      for (i = 0; i < bins.length; i++) bins[i].power += dens * Math.exp(-Math.pow((bins[i].v - v) / 6, 2));
    }
    var max = Math.max.apply(null, bins.map(function (b) { return b.power; })) || 1;
    bins.forEach(function (b) { b.power /= max; });
    return bins;
  }
  /** Fastest (tangent-point) velocity on a flat rotation curve, for 0 < l < 90. */
  function tangentVelocity(lDeg) { return V0 * (1 - Math.sin(lDeg * D2R)); }

  /* -- The radio sky ---------------------------------------------------------------------------- */
  /** Galactic (l, b) -> J2000 { ra (hours), dec } using the IAU 1958 pole in J2000 coordinates. */
  function galacticToEq(l, b) {
    var aG = 192.85948, dG = 27.12825, lNCP = 122.93192;
    var sb = Math.sin(b * D2R), cb = Math.cos(b * D2R), sd = Math.sin(dG * D2R), cd = Math.cos(dG * D2R);
    var dl = (lNCP - l) * D2R;
    var dec = Math.asin(sb * sd + cb * cd * Math.cos(dl)) * R2D;
    var ra = aG + Math.atan2(cb * Math.sin(dl), sb * cd - cb * sd * Math.cos(dl)) * R2D;
    return { ra: (((ra % 360) + 360) % 360) / 15, dec: dec };
  }
  // Bright radio sources (J2000). Flux densities are rough values near 1.4 GHz, in janskys.
  var SOURCES = [
    { id: 'CasA', name: 'Cassiopeia A', ra: 23.3906, dec: 58.815, jy: 1700, note: 'The brightest radio source beyond the solar system: the wreck of a star that exploded about 350 years ago, 11,000 light-years away.' },
    { id: 'CygA', name: 'Cygnus A', ra: 19.9912, dec: 40.734, jy: 1600, note: 'A galaxy 600 million light-years away whose central black hole blasts out two jets of radio-bright gas.' },
    { id: 'SgrA', name: 'Sagittarius A*', ra: 17.7611, dec: -29.008, jy: 1, note: 'The black hole at the centre of our galaxy, inside the brightest part of the Milky Way\u2019s radio glow. Jansky\u2019s hiss came from this direction.' },
    { id: 'TauA', name: 'Taurus A (Crab Nebula)', ra: 5.5755, dec: 22.015, jy: 1000, note: 'The leftovers of a supernova seen in the year 1054, with a pulsar spinning 30 times a second at its heart.' },
    { id: 'VirA', name: 'Virgo A (M87)', ra: 12.5137, dec: 12.391, jy: 210, note: 'A giant galaxy with a jet. Its black hole was the first one ever photographed, using radio dishes across the whole Earth.' },
    { id: 'CenA', name: 'Centaurus A', ra: 13.4243, dec: -43.019, jy: 1300, note: 'The nearest big radio galaxy, with radio lobes that cover an area of sky bigger than 200 full Moons.' }
  ];
  // Pulsars for the listening demo: real rotation periods.
  var PULSARS = [
    { id: 'B0329', name: 'PSR B0329+54', period: 0.714519, note: 'One of the brightest pulsars in the northern sky: about 1.4 ticks a second.' },
    { id: 'Vela', name: 'Vela pulsar', period: 0.089328, note: 'A young pulsar: about 11 spins a second.' },
    { id: 'Crab', name: 'Crab pulsar', period: 0.033392, note: 'Spins about 30 times a second, born in the supernova of 1054.' },
    { id: 'B1937', name: 'PSR B1937+21', period: 0.0015578, note: 'The first "millisecond pulsar" found: 642 spins a second, so fast it hums.' }
  ];

  var api = { C: C, HI_MHZ: HI_MHZ, BANDS: BANDS, band: band, frequencyHz: frequencyHz, photonEnergyEV: photonEnergyEV,
    resolutionArcsec: resolutionArcsec, diameterFor: diameterFor, fringe: fringe, fringeSpacingDeg: fringeSpacingDeg,
    R0: R0, V0: V0, rotationSpeed: rotationSpeed, radialVelocity: radialVelocity, dopplerMHz: dopplerMHz,
    hydrogenSpectrum: hydrogenSpectrum, tangentVelocity: tangentVelocity, galacticToEq: galacticToEq,
    SOURCES: SOURCES, PULSARS: PULSARS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RadioMath = api;
})(this);
