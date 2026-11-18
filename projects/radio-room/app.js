"use strict";
/* The Radio Room — player wiring. The rules live in radio.js. */
(function () {
 const audio = document.getElementById("radio-audio");
 const needle = document.getElementById("needle");
 const readout = document.getElementById("readout");
 const status = document.getElementById("radio-status");
 const presetBox = document.getElementById("presets");
 const stopBtn = document.getElementById("stop-btn");
 const tuneBtn = document.getElementById("tune-knob");
 const volume = document.getElementById("volume");
 let current = null;

 for (const p of PRESETS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "preset-btn";
  b.dataset.id = p.id;
  b.innerHTML = "<span class='preset-freq'></span><span class='preset-name'></span>";
  b.querySelector(".preset-freq").textContent = p.freq.toFixed(1);
  b.querySelector(".preset-name").textContent = p.name;
  b.addEventListener("click", () => tune(p));
  presetBox.appendChild(b);
 }

 function markActive() {
  for (const b of presetBox.querySelectorAll(".preset-btn"))
   b.classList.toggle("active", current && b.dataset.id === current.id);
 }

 function tune(station) {
  current = station;
  needle.style.left = needlePercent(station.freq) + "%";
  readout.textContent = dialReadout(station);
  status.textContent = "Tuning to " + station.name + "… " + station.blurb;
  markActive();
  audio.src = station.stream;
  const played = audio.play();
  if (played && played.catch) played.catch(() => {
   status.textContent = "The player was blocked from starting on its own — press a station button again, and it should play. If it still will not, the stream may be down; the Help section says what to try.";
  });
 }

 function stop() {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  status.textContent = current
   ? "Stopped. " + current.name + " is still on the dial — press its button to listen again."
   : "Stopped.";
 }

 stopBtn.addEventListener("click", stop);
 tuneBtn.addEventListener("click", () => tune(nextStation(current && current.id)));
 volume.addEventListener("input", () => { audio.volume = volume.value / 100; });
 audio.volume = volume.value / 100;

 audio.addEventListener("playing", () => {
  if (current) status.textContent = "Now playing: " + current.name + " (SomaFM, live stream). " + current.blurb;
 });
 audio.addEventListener("error", () => {
  if (!current) return;
  status.textContent = "That stream did not answer just now. Streams hiccup — wait a moment and press the station again, or pick another station. Nothing is wrong with your device.";
 }, true);
})();

/* The Scanner Tuner — a finder, not a player. It works out the listener's
   county (their device location, or a ZIP / town they type) by asking
   OpenStreetMap's Nominatim service to name the place, then points them at
   Broadcastify's own page for that county, where Broadcastify's own player
   plays the feeds. Nothing is kept: the answer lives only while the page
   is open, and no Broadcastify API is used. */
(function () {
 const locateBtn = document.getElementById("scanner-locate");
 const placeInput = document.getElementById("scanner-place");
 const findBtn = document.getElementById("scanner-find");
 const result = document.getElementById("scanner-result");
 const goLink = document.getElementById("scanner-go");
 if (!locateBtn || !placeInput || !findBtn || !result || !goLink) return;

 function say(text) { result.textContent = text; }

 function showPlace(county, state) {
  const c = tidyCountyName(county), s = (state || "").trim();
  const target = scannerTarget(c, s);
  goLink.href = target.url;
  goLink.hidden = false;
  if (target.level === "county") {
   say("You are in " + c + " County, " + s + ". This room has that county's own Broadcastify page ready — the button below opens it, and the feeds play there, in Broadcastify's player.");
   goLink.textContent = "Open " + c + " County feeds on Broadcastify ↗";
  } else if (target.level === "state") {
   say("You are in " + (c ? c + " County, " : "") + "Ohio. This room only carries county links it has checked, and that county is not among them — the button below opens Broadcastify's Ohio page, where every Ohio county's feeds are listed.");
   goLink.textContent = "Open Ohio feeds on Broadcastify ↗";
  } else {
   say("You are in " + (c ? c + " County, " : "") + (s || "parts this room's map does not cover") + ". This room's checked county links cover Ohio, so the button below opens Broadcastify's front door — pick your state and county there, and the feeds play in Broadcastify's player.");
   goLink.textContent = "Open Broadcastify — find your county ↗";
  }
 }

 function lookupFailed() {
  say("That lookup did not answer just now. Place lookups are a shared public service (OpenStreetMap's Nominatim) and it can be busy — wait a moment and try again, or type a ZIP or town below.");
 }

 function placeFromAddress(address) {
  if (!address) { lookupFailed(); return; }
  showPlace(address.county || "", address.state || "");
 }

 locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
   say("This device will not say where it is, so the tuner cannot find your county that way. The ZIP or town box does the same job — type where you are and press Find my county.");
   return;
  }
  say("Asking your device where you are…");
  goLink.hidden = true;
  navigator.geolocation.getCurrentPosition(pos => {
   say("Found you — asking OpenStreetMap to name the county…");
   fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=" +
     encodeURIComponent(pos.coords.latitude) + "&lon=" + encodeURIComponent(pos.coords.longitude))
    .then(r => (r.ok ? r.json() : Promise.reject(new Error("lookup"))))
    .then(data => placeFromAddress(data && data.address))
    .catch(lookupFailed);
  }, () => {
   say("No location came back — either the device would not share it or it could not find itself. Nothing was sent anywhere. The ZIP or town box does the same job with a place name instead.");
  }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 });
 });

 function findPlace() {
  const q = placeInput.value.trim();
  if (!q) { say("Type a ZIP code or a town first, then press Find my county."); placeInput.focus(); return; }
  say("Looking up " + q + "…");
  goLink.hidden = true;
  fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=" +
    encodeURIComponent(q))
   .then(r => (r.ok ? r.json() : Promise.reject(new Error("lookup"))))
   .then(hits => {
    if (!hits || !hits.length) {
     say("OpenStreetMap does not know a place by that name. Check the spelling, or try the nearest town — the lookup only covers the United States, which is where Broadcastify's county pages live.");
     return;
    }
    placeFromAddress(hits[0].address);
   })
   .catch(lookupFailed);
 }
 findBtn.addEventListener("click", findPlace);
 placeInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); findPlace(); } });
})();
