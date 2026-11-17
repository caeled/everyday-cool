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
