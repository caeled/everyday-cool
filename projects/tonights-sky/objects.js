/* Tonight's Sky: names, distances and friendly facts. Original Everyday Cool writing (CC BY 4.0)
 * and data tables (MIT). Star distances are rounded modern estimates in light-years
 * (mostly Hipparcos/Gaia era); anything beyond a few hundred light-years is uncertain,
 * and those marked `rough: true` are very uncertain. */
(function (root) {
  'use strict';
  // HR number: [proper name, distance in light-years, note, rough?]
  var NAMED = {
    2491: ['Sirius', 8.6, 'The brightest star in the night sky. Its nickname is the Dog Star.'],
    2326: ['Canopus', 310, 'Second-brightest star. Spacecraft have used it to steer by.'],
    5340: ['Arcturus', 37, 'An orange giant. Follow the arc of the Big Dipper\u2019s handle to find it.'],
    5459: ['Rigil Kentaurus (Alpha Centauri)', 4.4, 'The nearest star system you can see without a telescope.'],
    7001: ['Vega', 25, 'Part of the Summer Triangle. In about 12,000 years it will be the North Star.'],
    1708: ['Capella', 43, 'Looks like one star, but it is two yellow giants orbiting each other.'],
    1713: ['Rigel', 860, 'Orion\u2019s bright blue-white foot.'],
    2943: ['Procyon', 11.5, 'The \u201cLittle Dog\u201d star. Close by, as stars go.'],
    472: ['Achernar', 139, 'Spins so fast that it bulges at its middle.'],
    2061: ['Betelgeuse', 550, 'A red supergiant in Orion\u2019s shoulder. One day it will explode as a supernova (probably not soon).', true],
    5267: ['Hadar', 390, 'Points the way to the Southern Cross.'],
    7557: ['Altair', 16.7, 'Part of the Summer Triangle. It spins once every 9 hours.'],
    1457: ['Aldebaran', 65, 'The orange eye of Taurus the Bull.'],
    6134: ['Antares', 550, 'The red heart of Scorpius. Its name means \u201crival of Mars\u201d.', true],
    5056: ['Spica', 250, 'A hot blue star in Virgo, near the path the planets follow.'],
    2990: ['Pollux', 34, 'The brighter of the Gemini twins. A planet orbits it.'],
    8728: ['Fomalhaut', 25, 'The lonely bright star of the autumn sky, with a dusty ring around it.'],
    4853: ['Mimosa', 280, 'One of the stars of the Southern Cross.'],
    7924: ['Deneb', 2600, 'Very far away and very bright: many thousands of times brighter than the Sun.', true],
    4730: ['Acrux', 320, 'The bottom of the Southern Cross.'],
    3982: ['Regulus', 79, 'The heart of Leo the Lion, sitting right on the ecliptic.'],
    2618: ['Adhara', 430, 'In Canis Major, near Sirius.'],
    2891: ['Castor', 51, 'Looks like one star, but it is really six stars bound together.'],
    4763: ['Gacrux', 88, 'The red top of the Southern Cross.'],
    6527: ['Shaula', 570, 'The stinger at the tip of Scorpius\u2019s tail.', true],
    1790: ['Bellatrix', 250, 'Orion\u2019s other shoulder.'],
    1791: ['Elnath', 130, 'The tip of a horn of Taurus the Bull.'],
    3685: ['Miaplacidus', 113, 'A bright star of the far southern sky.'],
    1903: ['Alnilam', 2000, 'The middle star of Orion\u2019s Belt.', true],
    1948: ['Alnitak', 1200, 'The eastern star of Orion\u2019s Belt.', true],
    1852: ['Mintaka', 1200, 'The western star of Orion\u2019s Belt. It sits almost exactly on the celestial equator.', true],
    2004: ['Saiph', 650, 'Orion\u2019s other foot.', true],
    424: ['Polaris', 430, 'The North Star. It barely moves, because Earth\u2019s axis points almost right at it.'],
    4301: ['Dubhe', 123, 'A Big Dipper pointer star: follow it with Merak to Polaris.'],
    4295: ['Merak', 79, 'A Big Dipper pointer star.'],
    4554: ['Phecda', 84, 'A corner of the Big Dipper\u2019s bowl.'],
    4660: ['Megrez', 81, 'The faintest star of the Big Dipper.'],
    4905: ['Alioth', 81, 'The brightest star of the Big Dipper.'],
    5054: ['Mizar', 83, 'Look closely: a fainter star, Alcor, sits right beside it.'],
    5191: ['Alkaid', 104, 'The end of the Big Dipper\u2019s handle.'],
    936: ['Algol', 90, 'The \u201cDemon Star\u201d. It dims every 2.9 days when its partner passes in front of it.'],
    1017: ['Mirfak', 510, 'The brightest star in Perseus.'],
    15: ['Alpheratz', 97, 'Shared by Andromeda and the Great Square of Pegasus.'],
    337: ['Mirach', 200, 'Start here and hop two stars up to find the Andromeda Galaxy.'],
    603: ['Almach', 350, 'A beautiful gold-and-blue double star in a small telescope.'],
    168: ['Schedar', 230, 'Part of the W shape of Cassiopeia.'],
    21: ['Caph', 55, 'Part of the W shape of Cassiopeia.'],
    617: ['Hamal', 66, 'The brightest star in Aries the Ram.'],
    4534: ['Denebola', 36, 'The tail of Leo the Lion.'],
    7417: ['Albireo', 430, 'A gold star and a blue star side by side in a small telescope.'],
    7796: ['Sadr', 1800, 'The middle of the Northern Cross.', true],
    6556: ['Rasalhague', 49, 'The head of Ophiuchus, the serpent bearer.'],
    5563: ['Kochab', 130, 'The bright end of the Little Dipper\u2019s bowl.'],
    3748: ['Alphard', 180, 'The lonely heart of Hydra, the longest constellation.'],
    1165: ['Alcyone', 440, 'The brightest star of the Pleiades, the Seven Sisters.'],
    8308: ['Enif', 690, 'The nose of Pegasus.'],
    8781: ['Markab', 133, 'A corner of the Great Square of Pegasus.'],
    188: ['Diphda', 96, 'The brightest star in Cetus the Whale.'],
    681: ['Mira', 300, '\u201cThe Wonderful\u201d: it swells and fades over about 11 months, sometimes vanishing to the eye.'],
    5291: ['Thuban', 300, 'The North Star when the Egyptian pyramids were being built.'],
    6705: ['Eltanin', 154, 'The eye of Draco the Dragon.'],
    5793: ['Alphecca', 75, 'The jewel of the Northern Crown.'],
    7121: ['Nunki', 230, 'Part of the Teapot in Sagittarius.'],
    6879: ['Kaus Australis', 140, 'The brightest star of the Teapot in Sagittarius.'],
    8162: ['Alderamin', 49, 'In Cepheus. It will be close to the North Star in about 5,500 years.'],
    2088: ['Menkalinan', 81, 'Two stars that eclipse each other, in Auriga.'],
    2693: ['Wezen', 1600, 'A supergiant in Canis Major.', true],
    2294: ['Mirzam', 490, '\u201cThe Announcer\u201d: it rises just before Sirius.'],
    2421: ['Alhena', 109, 'The foot of one of the Gemini twins.'],
    7790: ['Peacock', 180, 'The brightest star in Pavo the Peacock.'],
    8425: ['Alnair', 101, 'The brightest star in Grus the Crane.'],
    6217: ['Atria', 390, 'The brightest star of the Southern Triangle.'],
    3307: ['Avior', 630, 'Part of the \u201cFalse Cross\u201d, which fools people looking for the Southern Cross.', true],
    99: ['Ankaa', 85, 'The brightest star in Phoenix.'],
    5531: ['Zubenelgenubi', 75, 'Its name means \u201cthe southern claw\u201d, from when Libra was part of Scorpius.'],
    5506: ['Izar', 200, 'A lovely orange-and-blue double star in Bo\u00f6tes.'],
    3634: ['Suhail', 545, 'A bright orange star in Vela, the sails.', true]
  };

  var BODIES = {
    Sun: { kind: 'star', color: '#ffd76a', note: 'Our star. Never look at it directly or through binoculars or a telescope.' },
    Moon: { kind: 'moon', color: '#e8e6dc', note: 'Our Moon shows the same face to us all the time. Its phase depends on where it is compared with the Sun.' },
    Mercury: { kind: 'planet', color: '#c9b9a6', note: 'The smallest planet and the closest to the Sun. Hard to spot: it never strays far from the Sun.' },
    Venus: { kind: 'planet', color: '#fff3c4', note: 'The brightest planet. Thick clouds reflect lots of sunlight. People often mistake it for an airplane.' },
    Mars: { kind: 'planet', color: '#ff8a5c', note: 'The red planet. Its colour comes from rusty dust.' },
    Jupiter: { kind: 'planet', color: '#f1d9b0', note: 'The biggest planet. Binoculars held steady show up to four of its moons.' },
    Saturn: { kind: 'planet', color: '#e8d48f', note: 'The ringed planet. Even a small telescope shows the rings.' },
    Uranus: { kind: 'planet', color: '#a9e3e8', note: 'An ice giant tipped on its side. Just at the edge of what eyes can see in a very dark sky.' },
    Neptune: { kind: 'planet', color: '#7fa7ff', note: 'The farthest planet. You need binoculars or a telescope, and a chart.' }
  };

  // A few binocular treasures from Skywatch's deep-sky list: [id, name, RA h, Dec deg (J2000), mag, ly, note]
  var DEEP_SKY = [
    ['M31', 'Andromeda Galaxy', 0.71, 41.27, 3.4, 2500000, 'The farthest thing most people can see with their eyes alone.'],
    ['M45', 'Pleiades', 3.78, 24.12, 1.6, 440, 'The Seven Sisters: a family of young stars. Most people see six.'],
    ['M42', 'Orion Nebula', 5.59, -5.39, 4.0, 1340, 'A cloud where new stars are being born, in Orion\u2019s sword.'],
    ['M44', 'Beehive Cluster', 8.67, 19.98, 3.7, 600, 'A fuzzy patch to the eye that becomes dozens of stars in binoculars.'],
    ['M13', 'Hercules Cluster', 16.70, 36.46, 5.8, 22000, 'A ball of hundreds of thousands of very old stars.'],
    ['M8', 'Lagoon Nebula', 18.06, -24.38, 6.0, 4100, 'A glowing cloud above the spout of the Teapot.'],
    ['M7', 'Ptolemy Cluster', 17.90, -34.79, 3.3, 980, 'A bright cluster near the tail of Scorpius, written about almost 2,000 years ago.'],
    ['N869', 'Double Cluster', 2.32, 57.13, 5.3, 7500, 'Two star clusters side by side, between Perseus and Cassiopeia.'],
    ['M33', 'Triangulum Galaxy', 1.56, 30.66, 5.7, 2700000, 'A face-on spiral galaxy. Needs a truly dark sky.'],
    ['M41', 'M41', 6.77, -20.75, 4.5, 2300, 'A cluster just south of Sirius.'],
    ['N5139', 'Omega Centauri', 13.45, -47.48, 3.7, 17000, 'The biggest, brightest ball of stars in our galaxy\u2019s sky.'],
    ['N104', '47 Tucanae', 0.40, -72.08, 4.1, 15000, 'A huge star ball next to the Small Magellanic Cloud.']
  ];

  // Preset places. Times are shown in each place's own time zone.
  var PLACES = [
    { id: 'columbus', name: 'Columbus, Ohio, USA', lat: 39.96, lon: -83.00, tz: 'America/New_York' },
    { id: 'miami', name: 'Miami, Florida, USA', lat: 25.76, lon: -80.19, tz: 'America/New_York' },
    { id: 'denver', name: 'Denver, Colorado, USA', lat: 39.74, lon: -104.99, tz: 'America/Denver' },
    { id: 'anchorage', name: 'Anchorage, Alaska, USA', lat: 61.22, lon: -149.90, tz: 'America/Anchorage' },
    { id: 'honolulu', name: 'Honolulu, Hawaii, USA', lat: 21.31, lon: -157.86, tz: 'Pacific/Honolulu' },
    { id: 'quito', name: 'Quito, Ecuador (on the equator)', lat: -0.18, lon: -78.47, tz: 'America/Guayaquil' },
    { id: 'london', name: 'London, England', lat: 51.51, lon: -0.13, tz: 'Europe/London' },
    { id: 'tromso', name: 'Troms\u00f8, Norway (Arctic)', lat: 69.65, lon: 18.96, tz: 'Europe/Oslo' },
    { id: 'capetown', name: 'Cape Town, South Africa', lat: -33.92, lon: 18.42, tz: 'Africa/Johannesburg' },
    { id: 'sydney', name: 'Sydney, Australia', lat: -33.87, lon: 151.21, tz: 'Australia/Sydney' },
    { id: 'northpole', name: 'The North Pole (pretend)', lat: 89.99, lon: 0, tz: 'UTC' }
  ];

  var api = { NAMED: NAMED, BODIES: BODIES, DEEP_SKY: DEEP_SKY, PLACES: PLACES };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SKY_OBJECTS = api;
})(this);
