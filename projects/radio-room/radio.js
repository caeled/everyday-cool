"use strict";
/* The Radio Room — pure rules, no DOM, so Node can check them (test.cjs).
   The playable presets are SomaFM channels: SomaFM publishes direct stream
   addresses for its own channels and welcomes players that use them. Every
   stream address here was verified live (HTTP 200 from the Icecast server)
   on 17 November 2026. Everything else in the room links out. */

const DIAL_MIN = 88, DIAL_MAX = 108; /* the FM band, for the needle's travel */

const PRESETS = [
 { id: "groove-salad", name: "Groove Salad", freq: 89.1,
   blurb: "Ambient and downtempo beats — SomaFM's front porch.",
   stream: "https://ice1.somafm.com/groovesalad-128-mp3" },
 { id: "lush", name: "Lush", freq: 92.3,
   blurb: "Mellow, mostly female vocals. Soft, but never sleepy.",
   stream: "https://ice1.somafm.com/lush-128-mp3" },
 { id: "secret-agent", name: "Secret Agent", freq: 95.7,
   blurb: "Spy lounge and soundtrack cool. Shaken, not stirred.",
   stream: "https://ice1.somafm.com/secretagent-128-mp3" },
 { id: "illinois-street", name: "Illinois Street Lounge", freq: 99.3,
   blurb: "Classic bachelor-pad exotica and cocktail jazz.",
   stream: "https://ice1.somafm.com/illstreet-128-mp3" },
 { id: "left-coast-70s", name: "Left Coast 70s", freq: 103.1,
   blurb: "Seventies songwriters and soft rock, California side.",
   stream: "https://ice1.somafm.com/seventies-128-mp3" },
 { id: "boot-liquor", name: "Boot Liquor", freq: 106.9,
   blurb: "Americana roots: country, blues, and front-porch picking.",
   stream: "https://ice1.somafm.com/bootliquor-128-mp3" }
];

function needlePercent(freq) {
 if (typeof freq !== "number" || Number.isNaN(freq)) return 0;
 const p = (freq - DIAL_MIN) / (DIAL_MAX - DIAL_MIN) * 100;
 return Math.min(100, Math.max(0, p));
}

function stationById(id) {
 return PRESETS.find(p => p.id === id) || null;
}

function nextStation(id) {
 const i = PRESETS.findIndex(p => p.id === id);
 if (i < 0) return PRESETS[0];
 return PRESETS[(i + 1) % PRESETS.length];
}

function dialReadout(station) {
 if (!station) return "— pick a station —";
 return station.freq.toFixed(1) + " · " + station.name;
}

/* ---- The Scanner Tuner -------------------------------------------------
   A finder, not a player. Broadcastify's developer terms offer no way to
   play its scanner audio inside another page (its feed-catalog API is a
   paid product and is not offered for scanner-listening apps), so this
   tuner does the honest thing instead: it works out the listener's county
   and hands them to Broadcastify's own county page, where its own player
   plays the feeds. The Ohio county links below were read from
   Broadcastify's own Ohio page (broadcastify.com/listen/stid/39) and
   checked on 17 November 2026; they are links, not data loaded at view
   time, and no Broadcastify API is used anywhere in this room. */

const BROADCASTIFY_BROWSE = "https://www.broadcastify.com/listen/";
const BROADCASTIFY_OHIO = "https://www.broadcastify.com/listen/stid/39";
const HOME_COUNTY = "Defiance"; /* Steven's home county, the panel preset */

/* Ohio county name (as Nominatim reports it, without the word "County")
   -> the county number in its Broadcastify page address. All 88 counties. */
const OHIO_COUNTY_IDS = {
 "Adams": 2040, "Allen": 2041, "Ashland": 2042, "Ashtabula": 2043,
 "Athens": 2044, "Auglaize": 2045, "Belmont": 2046, "Brown": 2047,
 "Butler": 2048, "Carroll": 2049, "Champaign": 2050, "Clark": 2051,
 "Clermont": 2052, "Clinton": 2053, "Columbiana": 2054, "Coshocton": 2055,
 "Crawford": 2056, "Cuyahoga": 2057, "Darke": 2058, "Defiance": 2059,
 "Delaware": 2060, "Erie": 2061, "Fairfield": 2062, "Fayette": 2063,
 "Franklin": 2064, "Fulton": 2065, "Gallia": 2066, "Geauga": 2067,
 "Greene": 2068, "Guernsey": 2069, "Hamilton": 2070, "Hancock": 2071,
 "Hardin": 2072, "Harrison": 2073, "Henry": 2074, "Highland": 2075,
 "Hocking": 2076, "Holmes": 2077, "Huron": 2078, "Jackson": 2079,
 "Jefferson": 2080, "Knox": 2081, "Lake": 2082, "Lawrence": 2083,
 "Licking": 2084, "Logan": 2085, "Lorain": 2086, "Lucas": 2087,
 "Madison": 2088, "Mahoning": 2089, "Marion": 2090, "Medina": 2091,
 "Meigs": 2092, "Mercer": 2093, "Miami": 2094, "Monroe": 2095,
 "Montgomery": 2096, "Morgan": 2097, "Morrow": 2098, "Muskingum": 2099,
 "Noble": 2100, "Ottawa": 2101, "Paulding": 2102, "Perry": 2103,
 "Pickaway": 2104, "Pike": 2105, "Portage": 2106, "Preble": 2107,
 "Putnam": 2108, "Richland": 2109, "Ross": 2110, "Sandusky": 2111,
 "Scioto": 2112, "Seneca": 2113, "Shelby": 2114, "Stark": 2115,
 "Summit": 2116, "Trumbull": 2117, "Tuscarawas": 2118, "Union": 2119,
 "Van Wert": 2120, "Vinton": 2121, "Warren": 2122, "Washington": 2123,
 "Wayne": 2124, "Williams": 2125, "Wood": 2126, "Wyandot": 2127
};

/* Nominatim names a county "Defiance County"; the map above keys on the
   bare name. Returns "" for anything unusable. */
function tidyCountyName(name) {
 if (typeof name !== "string") return "";
 return name.replace(/\s+County\s*$/i, "").trim();
}

/* The Broadcastify page address for an Ohio county, or null when this
   room has no baked link for it. */
function ohioCountyUrl(county) {
 const id = OHIO_COUNTY_IDS[tidyCountyName(county)];
 return id ? "https://www.broadcastify.com/listen/ctid/" + id : null;
}

/* Where the tuner sends a listener, given the county and state the lookup
   found (either may be ""). County page when we have the county's link;
   Ohio's state page for anywhere else in Ohio; Broadcastify's front door
   for everywhere else. */
function scannerTarget(county, state) {
 const url = ohioCountyUrl(county);
 if (url) return { url, level: "county" };
 if (typeof state === "string" && state.trim().toLowerCase() === "ohio")
  return { url: BROADCASTIFY_OHIO, level: "state" };
 return { url: BROADCASTIFY_BROWSE, level: "browse" };
}

if (typeof module !== "undefined" && module.exports) {
 module.exports = { PRESETS, DIAL_MIN, DIAL_MAX, needlePercent, stationById, nextStation, dialReadout,
  BROADCASTIFY_BROWSE, BROADCASTIFY_OHIO, HOME_COUNTY, OHIO_COUNTY_IDS, tidyCountyName, ohioCountyUrl, scannerTarget };
}
