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

if (typeof module !== "undefined" && module.exports) {
 module.exports = { PRESETS, DIAL_MIN, DIAL_MAX, needlePercent, stationById, nextStation, dialReadout };
}
