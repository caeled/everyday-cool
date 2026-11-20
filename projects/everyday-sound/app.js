"use strict";
/* Everyday Sound — page wiring. The rules live in sound.js. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- Audio core ----------------
     One context, made on the first press (browsers insist a person
     asks before a page makes noise). One master gain, kept modest. */
  let ctx = null, master = null;
  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* Start one synthesized voice from an INSTRUMENTS recipe.
     when/dur are absolute context times / seconds for scheduled
     playback; dur == null means "held" — the caller ends it with
     voice.release(). voice.hush() silences immediately. */
  function startVoice(midi, instrumentId, velocity, when, dur) {
    ensureCtx();
    const recipe = instrumentById(instrumentId);
    const t0 = when == null ? ctx.currentTime : when;
    const freq = noteFreq(midi);
    const out = ctx.createGain();
    out.gain.value = 1;
    let node = out;
    if (recipe.filter) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(recipe.filter, t0);
      if (recipe.filterEnd) f.frequency.exponentialRampToValueAtTime(recipe.filterEnd, t0 + 0.35);
      out.connect(f);
      node = f;
    }
    node.connect(master);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    const peak = 0.22 * Math.max(0.05, Math.min(1, velocity == null ? 1 : velocity));
    env.gain.linearRampToValueAtTime(peak, t0 + recipe.attack);
    if (recipe.tau > 0) {
      env.gain.setTargetAtTime(0, t0 + recipe.attack, recipe.tau);
    } else if (recipe.sustain > 0) {
      env.gain.setTargetAtTime(peak * recipe.sustain, t0 + recipe.attack, 0.05);
    }
    env.connect(out);
    const oscs = [];
    for (const [mult, amp] of recipe.partials) {
      const o = ctx.createOscillator();
      o.type = recipe.wave;
      o.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.value = amp;
      o.connect(g); g.connect(env);
      o.start(t0);
      oscs.push(o);
    }
    let stopped = false;
    function stopAt(t) {
      if (stopped) return;
      stopped = true;
      try {
        env.gain.cancelScheduledValues(t);
        env.gain.setValueAtTime(Math.max(env.gain.value, 0.0001), t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.03, recipe.release));
      } catch (e) { /* already gone */ }
      for (const o of oscs) { try { o.stop(t + recipe.release + 0.15); } catch (e) { /* already stopped */ } }
    }
    if (dur != null) {
      const ringOut = recipe.tau > 0 ? recipe.attack + recipe.tau * 9 : 0;
      stopAt(t0 + Math.max(dur, ringOut));
    }
    return {
      release() { stopAt(ctx.currentTime); },
      hush() {
        if (stopped) return;
        stopped = true;
        try { env.gain.cancelScheduledValues(ctx.currentTime); env.gain.setTargetAtTime(0, ctx.currentTime, 0.015); } catch (e) { /* gone */ }
        for (const o of oscs) { try { o.stop(ctx.currentTime + 0.1); } catch (e) { /* stopped */ } }
      },
    };
  }

  /* A plain one-shot tone at any frequency (benches that are not the piano). */
  function playFreq(freq, seconds, type, level) {
    ensureCtx();
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type || "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(level || 0.12, t0 + 0.01);
    g.gain.setTargetAtTime(0, t0 + seconds - 0.08, 0.03);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + seconds + 0.2);
  }

  /* ---------------- 01 · The tone bench ---------------- */
  let toneOsc = null, toneGain = null;
  const toneSlider = $("tone-slider");
  function toneFreqFromSlider() {
    const v = Number(toneSlider.value) / 1000;
    return 30 * Math.pow(4000 / 30, v);
  }
  function runTone() {
    const f = toneFreqFromSlider();
    $("tone-freq-label").textContent = "— " + fmt(f, f < 100 ? 1 : 0) + " Hz";
    const note = freqToNote(f);
    const lam = wavelength(f);
    $("tone-readout").innerHTML =
      "<p class='big-answer'>" + fmt(f, f < 100 ? 1 : 0) + " Hz — about " + esc(note.label) +
      (note.cents !== 0 ? " (" + (note.cents > 0 ? "+" : "") + note.cents + " cents)" : " (dead on)") + "</p>" +
      "<p>One wave of this tone is <strong>" + (lam >= 1 ? fmt(lam) + " m" : fmt(lam * 100, 1) + " cm") +
      "</strong> long in air. " + (f < 80 ? "Down here your speakers are mostly harmonics — see the honesty line below." : "") + "</p>";
    if (toneOsc) toneOsc.frequency.setTargetAtTime(f, ctx.currentTime, 0.02);
  }
  toneSlider.addEventListener("input", runTone);
  $("tone-play").addEventListener("click", () => {
    ensureCtx();
    if (toneOsc) {
      toneGain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
      const o = toneOsc; setTimeout(() => { try { o.stop(); } catch (e) { /* done */ } }, 200);
      toneOsc = null;
      $("tone-play").textContent = "Play";
      return;
    }
    toneOsc = ctx.createOscillator();
    toneOsc.type = "sine";
    toneOsc.frequency.value = toneFreqFromSlider();
    toneGain = ctx.createGain();
    toneGain.gain.value = 0.12;
    toneOsc.connect(toneGain); toneGain.connect(master);
    toneOsc.start();
    $("tone-play").textContent = "Stop";
  });
  runTone();

  /* ---------------- 02 · The decibel ladder ---------------- */
  const dbA = $("db-a"), dbB = $("db-b");
  for (const rung of DB_LADDER) {
    for (const sel of [dbA, dbB]) {
      const o = document.createElement("option");
      o.value = rung.db;
      o.textContent = rung.name + " — " + rung.db + " dB";
      sel.appendChild(o);
    }
  }
  dbA.value = "60"; dbB.value = "90";
  function runDb() {
    const a = Number(dbA.value), b = Number(dbB.value);
    const hi = Math.max(a, b), lo = Math.min(a, b), diff = hi - lo;
    const ratio = dbIntensityRatio(diff);
    const hours = nioshSafeHours(hi);
    let safe;
    if (hours === Infinity) safe = "Both are under 85 dB, where the NIOSH guidance sets no time limit — ordinary life, not a hazard.";
    else if (hours >= 1) safe = "At " + hi + " dB, NIOSH's recommended safe exposure is about <strong>" + fmt(hours, hours < 2 ? 2 : 1) + " hours</strong> in a day — after that, the risk of hearing damage starts to climb.";
    else safe = "At " + hi + " dB, NIOSH's recommended safe exposure is only about <strong>" + Math.round(hours * 60) + " minutes</strong> in a day. Ears need protection up there.";
    $("db-result").innerHTML =
      "<p class='big-answer'>" + diff + " dB apart — ×" + fmt(ratio, ratio < 10 ? 1 : 0) + " the sound energy</p><ol>" +
      "<li>The louder sound is " + hi + " dB; the quieter is " + lo + " dB. Difference: " + diff + " dB.</li>" +
      "<li>Intensity multiplies by ten for every 10 dB: 10<sup>" + diff + "/10</sup> = ×" + fmt(ratio, ratio < 10 ? 2 : 0) + ".</li>" +
      "<li>To your ears, the rule of thumb is gentler: every +10 dB sounds roughly <em>twice</em> as loud — so this gap feels like about ×" + fmt(Math.pow(2, diff / 10), 1) + " the loudness.</li></ol>" +
      "<p>" + safe + "</p>";
  }
  dbA.addEventListener("change", runDb);
  dbB.addEventListener("change", runDb);
  runDb();

  /* ---------------- 03 · Strings & skins ---------------- */
  const STRING_BASE = 110; // an A string, A2
  function stringState() {
    return { len: Number($("string-len").value) / 100, ten: Number($("string-ten").value) / 100 };
  }
  function runString() {
    const s = stringState();
    const f = stringFreq(STRING_BASE, s.len, s.ten);
    const note = freqToNote(f);
    $("string-len-val").textContent = Math.round(s.len * 100) + "% of the string";
    $("string-ten-val").textContent = Math.round(s.ten * 100) + "% tension";
    $("string-result").innerHTML =
      "<p class='big-answer'>" + fmt(f, 1) + " Hz — about " + esc(note.label) + "</p>" +
      "<p>110 Hz ÷ " + fmt(s.len) + " (length) × √" + fmt(s.ten) + " (tension) = " + fmt(f, 1) + " Hz. " +
      (Math.abs(s.len - 0.5) < 0.001 && s.ten === 1 ? "Half the string: exactly the octave. That is not a coincidence — it is the oldest fact in music." : "") + "</p>";
    const wave = $("string-wave");
    if (wave) {
      const halfWaves = Math.max(1, Math.round(1 / s.len));
      let d = "M 10 45";
      for (let i = 0; i < halfWaves * 2; i++) {
        const x = 10 + (i + 1) * (380 / (halfWaves * 2));
        d += " Q " + (x - 380 / (halfWaves * 4)) + " " + (i % 2 === 0 ? 15 : 75) + " " + x + " 45";
      }
      wave.setAttribute("d", d);
    }
  }
  $("string-len").addEventListener("input", runString);
  $("string-ten").addEventListener("input", runString);
  for (const [id, len, ten] of [["str-full", 100, 100], ["str-half", 50, 100], ["str-fifth", 67, 100], ["str-fourth", 75, 100], ["str-tension", 100, 400]]) {
    $(id).addEventListener("click", () => {
      $("string-len").value = len; $("string-ten").value = ten;
      runString();
    });
  }
  $("string-play").addEventListener("click", () => {
    const s = stringState();
    playFreq(stringFreq(STRING_BASE, s.len, s.ten), 1.4, "triangle", 0.14);
  });
  runString();

  /* ---------------- 04 · Echoes & thunder ---------------- */
  function runEcho() {
    const t = parseFloat($("echo-sec").value), temp = parseFloat($("echo-temp").value);
    if (!(t > 0)) { $("echo-result").innerHTML = "<p>Give the echo a time to come back.</p>"; return; }
    const d = echoDistance(t, isNaN(temp) ? 20 : temp);
    $("echo-result").innerHTML =
      "<p class='big-answer'>The wall is about " + fmt(d, d < 100 ? 1 : 0) + " m away (" + fmt(d * 3.28084, 0) + " ft)</p>" +
      "<p>The sound travelled there <em>and back</em>: " + fmt(speedOfSound(isNaN(temp) ? 20 : temp), 0) + " m/s × " + fmt(t) +
      " s ÷ 2 = " + fmt(d, 1) + " m. A canyon wall half a second away is a lovely instrument; a handclap and a stopwatch are the whole lab.</p>";
  }
  $("echo-sec").addEventListener("input", runEcho);
  $("echo-temp").addEventListener("input", runEcho);
  runEcho();
  function runThunder() {
    const t = parseFloat($("thunder-sec").value);
    if (!(t > 0)) { $("thunder-result").innerHTML = "<p>Count the seconds first.</p>"; return; }
    const r = thunder(t);
    $("thunder-result").innerHTML =
      "<p class='big-answer'>About " + fmt(r.ruleKm, 1) + " km away (rule) · " + fmt(r.exactKm) + " km (computed)</p>" +
      "<p>The rule of thumb — seconds ÷ 3 — says " + fmt(r.ruleKm, 1) + " km. The speed of sound at 20 °C says " +
      fmt(r.exactKm) + " km (" + fmt(r.exactMi) + " miles). The rule is off by a few percent, in the safe direction: the storm is a touch farther than it says.</p>";
  }
  $("thunder-sec").addEventListener("input", runThunder);
  runThunder();

  /* ---------------- 05 · Sound travels ---------------- */
  function runTravels() {
    const d = parseFloat($("travel-dist").value);
    if (!(d > 0)) { $("travel-result").innerHTML = "<p>Give the sound a distance to cross.</p>"; return; }
    const rows = SPEEDS.map((s) =>
      "<tr><td>" + esc(s.medium) + "</td><td>" + fmt(s.speed, 0) + " m/s</td><td>" + fmt(travelTime(d, s.speed), 3) + " s</td></tr>").join("");
    const gap = travelTime(d, 343) - travelTime(d, 5960);
    $("travel-result").innerHTML =
      "<table class='trap'><tr><th>Through</th><th>Speed</th><th>Time for " + fmt(d, 0) + " m</th></tr>" + rows + "</table>" +
      "<p>Through steel the sound arrives <strong>" + fmt(gap) + " seconds</strong> before it comes through the air. " +
      "That is the old railway trick: ear to the rail, and you hear the train that is still too far away to hear standing up.</p>";
  }
  $("travel-dist").addEventListener("input", runTravels);
  runTravels();

  /* ---------------- 07 · Intervals ---------------- */
  let intervalMode = "just";
  function renderIntervals() {
    const root = Number($("interval-root").value);
    $("interval-list").innerHTML = INTERVALS.map((iv, i) => {
      const just = justRatio(iv), temp = temperedRatio(iv.semitones);
      const pianoCents = Math.round(centsBetween(temp, just));
      const tuning = (iv.semitones === 0 || iv.semitones === 12)
        ? "the piano agrees exactly — this one is never compromised"
        : "the piano's version sits " + Math.abs(pianoCents) + " cents " + (pianoCents > 0 ? "sharp" : "flat") + " of pure";
      return "<div class='interval-row'><button type='button' data-iv='" + i + "'>▶ " + esc(iv.name) + "</button>" +
        "<div class='interval-info'><strong>" + iv.ratio[0] + ":" + iv.ratio[1] + "</strong> — pure " + fmt(root * just, 1) +
        " Hz · piano tuning " + fmt(root * temp, 1) + " Hz (" + tuning + ")<br><span class='fine'>" + esc(iv.blurb) + "</span></div></div>";
    }).join("");
    $("interval-list").querySelectorAll("button[data-iv]").forEach((b) => {
      b.addEventListener("click", () => {
        const iv = INTERVALS[Number(b.dataset.iv)];
        const upper = root * (intervalMode === "just" ? justRatio(iv) : temperedRatio(iv.semitones));
        playFreq(root, 2.4, "sine", 0.11);
        playFreq(upper, 2.4, "sine", 0.11);
      });
    });
  }
  $("interval-root").addEventListener("change", renderIntervals);
  for (const [id, mode] of [["mode-just", "just"], ["mode-tempered", "tempered"]]) {
    $(id).addEventListener("click", () => {
      intervalMode = mode;
      $("mode-just").classList.toggle("active", mode === "just");
      $("mode-tempered").classList.toggle("active", mode === "tempered");
    });
  }
  renderIntervals();

  /* ---------------- 08 · The little piano ---------------- */
  const keyEls = new Map();
  const held = new Map();
  function currentInstrument() { return $("piano-inst").value; }

  function lightKey(midi, on, cls) {
    const el = keyEls.get(midi);
    if (el) el.classList.toggle(cls || "active", on);
  }
  const SCALE_DEGREES = { 0: 1, 2: 2, 4: 3, 5: 4, 7: 5, 9: 6, 11: 7 };
  function showNote(midi) {
    const f = noteFreq(midi);
    const n = freqToNote(f);
    const deg = SCALE_DEGREES[((midi % 12) + 12) % 12];
    $("piano-readout").innerHTML = "<p class='big-answer'>" + esc(n.label) + " · " + fmt(f, 1) + " Hz</p>" +
      "<p>" + (deg ? "Scale degree " + deg + " of C major." : "A black key — a sharp/flat, between two white-key notes.") +
      " Every key to the right doubles back on the same names an octave higher: pitch climbs by doubling, which is why Everyday Math's logarithms fit music so well.</p>";
  }

  /* Recording hooks live in these two functions, so every way of
     playing — pointer, computer keys, a MIDI keyboard — is captured. */
  let rec = null;
  let take = null;
  function pianoNoteOn(midi, velocity) {
    if (held.has(midi)) return;
    held.set(midi, startVoice(midi, currentInstrument(), velocity, null, null));
    lightKey(midi, true);
    showNote(midi);
    if (rec && !rec.open.has(midi)) {
      rec.open.set(midi, { start: ctx.currentTime - rec.t0, velocity: Math.round(127 * Math.max(0.05, Math.min(1, velocity))) });
    }
  }
  function pianoNoteOff(midi) {
    const v = held.get(midi);
    if (v) { v.release(); held.delete(midi); }
    lightKey(midi, false);
    if (rec && rec.open.has(midi)) {
      const o = rec.open.get(midi);
      rec.notes.push({ midi, start: o.start, duration: Math.max(0.05, ctx.currentTime - rec.t0 - o.start), velocity: o.velocity });
      rec.open.delete(midi);
    }
  }

  (function buildPiano() {
    const box = $("piano-keys");
    const whites = [];
    for (let m = PIANO_LOW; m <= PIANO_HIGH; m++) {
      if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) whites.push(m);
    }
    const W = whites.length, whiteW = 100 / W;
    const whiteIndex = new Map(whites.map((m, i) => [m, i]));
    for (let m = PIANO_LOW; m <= PIANO_HIGH; m++) {
      const pc = ((m % 12) + 12) % 12;
      const isWhite = whiteIndex.has(m);
      const el = document.createElement("div");
      el.className = "piano-key " + (isWhite ? "white-key" : "black-key");
      el.dataset.midi = m;
      if (isWhite) {
        const i = whiteIndex.get(m);
        el.style.left = (i * whiteW) + "%";
        el.style.width = whiteW + "%";
        el.innerHTML = "<span class='key-label'>" + esc(freqToNote(noteFreq(m)).label) + "</span>";
      } else {
        const prevWhite = whites.filter((w) => w < m).pop();
        el.style.left = ((whiteIndex.get(prevWhite) + 1) * whiteW) + "%";
        el.style.width = (whiteW * 0.62) + "%";
      }
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Play " + freqToNote(noteFreq(m)).label);
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); pianoNoteOn(m, 1); });
      el.addEventListener("pointerup", () => pianoNoteOff(m));
      el.addEventListener("pointercancel", () => pianoNoteOff(m));
      el.addEventListener("contextmenu", (e) => e.preventDefault());
      box.appendChild(el);
      keyEls.set(m, el);
    }
  })();

  /* Computer keys: A row = one octave from C, Z/X shift the octave. */
  let keyBase = 60;
  const downKeys = new Map();
  function updateKeyBase() {
    $("keybase-label").textContent = "Computer keys play from " + freqToNote(noteFreq(keyBase)).label + " — Z shifts down an octave, X shifts up.";
  }
  window.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "z") { keyBase = Math.max(36, keyBase - 12); updateKeyBase(); return; }
    if (k === "x") { keyBase = Math.min(72, keyBase + 12); updateKeyBase(); return; }
    if (k in KEYMAP && !e.repeat && !downKeys.has(k)) {
      const midi = keyBase + KEYMAP[k];
      downKeys.set(k, midi);
      pianoNoteOn(midi, 1);
    }
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (downKeys.has(k)) { pianoNoteOff(downKeys.get(k)); downKeys.delete(k); }
  });
  updateKeyBase();

  /* Web MIDI in — progressive enhancement only. */
  if (navigator.requestMIDIAccess) {
    $("midi-row").hidden = false;
    $("midi-connect").addEventListener("click", async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        const names = [];
        const hook = (input) => {
          input.onmidimessage = (e) => {
            const cmd = e.data[0] & 0xf0, note = e.data[1], vel = e.data[2];
            if (cmd === 0x90 && vel > 0) pianoNoteOn(note, vel / 127);
            else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) pianoNoteOff(note);
          };
          if (!names.includes(input.name)) names.push(input.name || "MIDI device");
        };
        access.inputs.forEach(hook);
        access.onstatechange = (e) => { if (e.port.state === "connected" && e.port.type === "input") hook(e.port); };
        $("midi-status").textContent = names.length ? "Listening to: " + names.join(", ") + ". Play away." : "No MIDI keyboard found — plug one in and press Connect again.";
      } catch (err) {
        $("midi-status").textContent = "MIDI permission wasn't granted, so the bench stays pointer-and-keys only. Nothing was recorded or sent anywhere.";
      }
    });
  }

  /* ---------------- Take a song with you: playback ---------------- */
  let play = null;
  function stopPlayback() {
    if (!play) return;
    play.timeouts.forEach(clearTimeout);
    play.voices.forEach((v) => v.hush());
    play = null;
    for (const el of keyEls.values()) el.classList.remove("active-play");
    refreshTransport();
  }
  function playSong(notes, source, durationSec) {
    stopPlayback();
    ensureCtx();
    const t0 = ctx.currentTime + 0.08;
    const timeouts = [], voices = [];
    for (const n of notes) {
      voices.push(startVoice(n.midi, currentInstrument(), (n.velocity || 96) / 127, t0 + n.start, n.duration));
      timeouts.push(setTimeout(() => lightKey(n.midi, true, "active-play"), n.start * 1000));
      timeouts.push(setTimeout(() => lightKey(n.midi, false, "active-play"), (n.start + n.duration) * 1000));
    }
    timeouts.push(setTimeout(() => { if (play && play.source === source) { play = null; refreshTransport(); } }, (durationSec + 0.5) * 1000));
    play = { timeouts, voices, source };
    refreshTransport();
  }
  function refreshTransport() {
    for (const [id, source] of [["song-play", "song"], ["demo-play", "demo"], ["take-play", "take"]]) {
      const b = $(id);
      if (!b) continue;
      b.textContent = play && play.source === source ? "Stop" : b.dataset.label;
    }
    $("song-play").disabled = !loadedSong;
    $("take-play").disabled = !take;
    $("take-download").disabled = !take;
  }

  /* Load a .mid from the visitor's own disk — parsed right here. */
  let loadedSong = null;
  $("midi-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = parseMidiFile(new Uint8Array(await file.arrayBuffer()));
      loadedSong = { name: file.name, notes: parsed.notes, durationSec: parsed.durationSec };
      $("song-info").innerHTML = "<strong>" + esc(file.name) + "</strong> — " + parsed.notes.length + " notes, " +
        fmt(parsed.durationSec, 1) + " seconds, format " + parsed.format + ". Press Play and watch the keys.";
    } catch (err) {
      loadedSong = null;
      $("song-info").textContent = "That file would not parse as a Standard MIDI File: " + err.message;
    }
    refreshTransport();
  });
  $("song-play").addEventListener("click", () => {
    if (play && play.source === "song") stopPlayback();
    else if (loadedSong) playSong(loadedSong.notes, "song", loadedSong.durationSec);
  });
  $("demo-play").addEventListener("click", () => {
    if (play && play.source === "demo") stopPlayback();
    else playSong(melodyNotes(ODE_TO_JOY, 120), "demo", melodyDuration(ODE_TO_JOY, 120));
  });
  $("scale-play").addEventListener("click", () => {
    const notes = [60, 62, 64, 65, 67, 69, 71, 72].map((m, i) => ({ midi: m, start: i * 0.45, duration: 0.42, velocity: 100 }));
    playSong(notes, "scale", 8 * 0.45);
  });

  /* Record what you play; download it as a real .mid. */
  function updateRecUi() {
    $("take-record").textContent = rec ? "■ Stop recording" : "● Record";
    if (take) {
      const dur = take.notes.length ? Math.max(...take.notes.map((n) => n.start + n.duration)) : 0;
      $("take-info").textContent = "Your take: " + take.notes.length + " notes, " + fmt(dur, 1) + " seconds, at " + take.bpm + " BPM. Play it back, or download the .mid and open it anywhere MIDI plays.";
    } else if (rec) {
      $("take-info").textContent = "Recording… every note you play — pointer, computer keys, or a connected MIDI keyboard — is being written down with its timing.";
    } else {
      $("take-info").textContent = "Press Record, play something, press Stop — then take it with you as a real MIDI file.";
    }
    refreshTransport();
  }
  $("take-record").addEventListener("click", () => {
    if (rec) {
      const endT = ctx.currentTime - rec.t0;
      for (const [midi, o] of rec.open) {
        rec.notes.push({ midi, start: o.start, duration: Math.max(0.05, endT - o.start), velocity: o.velocity });
      }
      take = { notes: rec.notes.slice().sort((a, b) => a.start - b.start), bpm: Number($("take-tempo").value) || 120 };
      rec = null;
    } else {
      ensureCtx();
      stopPlayback();
      rec = { t0: ctx.currentTime, open: new Map(), notes: [] };
      take = null;
    }
    updateRecUi();
  });
  $("take-play").addEventListener("click", () => {
    if (play && play.source === "take") stopPlayback();
    else if (take && take.notes.length) {
      const dur = Math.max(...take.notes.map((n) => n.start + n.duration));
      playSong(take.notes, "take", dur);
    }
  });
  $("take-download").addEventListener("click", () => {
    if (!take) return;
    const blob = new Blob([buildMidiFile(take.notes, { bpm: take.bpm })], { type: "audio/midi" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-song.mid";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  updateRecUi();

  /* ---------------- 09 · Rhythm is fractions ---------------- */
  let measure = [];
  function renderMeasure() {
    const total = measure.reduce((a, m) => a + m.eighths, 0);
    const bar = $("measure-bar");
    bar.classList.toggle("over", total > MEASURE_EIGHTHS);
    bar.innerHTML = measure.length
      ? measure.map((m) => "<div class='measure-block' style='width:" + (m.eighths / MEASURE_EIGHTHS * 100) + "%'>" + esc(m.fraction) + "</div>").join("")
      : "<div class='measure-empty'>Tap the notes below to fill this 4/4 measure…</div>";
    const st = measureStatus(total);
    let msg;
    if (st.state === "exact") msg = "Exactly full — the fractions sum to 1, a complete measure. Conductors, drummers, and bakers all live by this rule: the parts must make the whole.";
    else if (st.state === "under") msg = "Room for " + fractionOfEighths(st.remaining) + " more. A half-finished measure is not wrong — it is unfinished, and the music waits.";
    else msg = "Over by " + fractionOfEighths(st.excess) + " — a real measure would burst. Take the last note back out.";
    $("measure-readout").innerHTML = "<p class='big-answer'>" + esc(fractionOfEighths(total)) + " of 1</p><p>" + msg + "</p>";
  }
  for (const nv of NOTE_VALUES) {
    $("add-" + nv.id).addEventListener("click", () => { measure.push(nv); renderMeasure(); });
  }
  $("measure-undo").addEventListener("click", () => { measure.pop(); renderMeasure(); });
  $("measure-clear").addEventListener("click", () => { measure = []; renderMeasure(); });
  renderMeasure();

  /* ---------------- 10 · The circle of fifths ---------------- */
  (function buildCircle() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = $("circle-svg");
    const C = 170, R = 118;
    const pt = (i) => {
      const a = (-90 + i * 30) * Math.PI / 180;
      return [C + R * Math.cos(a), C + R * Math.sin(a)];
    };
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = pt(i), [x2, y2] = pt((i + 1) % 12);
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", x1); line.setAttribute("y1", y1);
      line.setAttribute("x2", x2); line.setAttribute("y2", y2);
      line.setAttribute("class", "circle-link");
      svg.appendChild(line);
    }
    CIRCLE.forEach((node, i) => {
      const [x, y] = pt(i);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "circle-node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", "Play " + node.name + " and hear its fifth");
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 27);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", x); t.setAttribute("y", y + 5);
      t.setAttribute("text-anchor", "middle");
      t.textContent = node.name;
      g.appendChild(c); g.appendChild(t);
      const speak = () => {
        const next = CIRCLE[(i + 1) % 12];
        playFreq(noteFreq(60 + node.pc), 1.1, "sine", 0.12);
        setTimeout(() => playFreq(noteFreq(60 + next.pc), 1.1, "sine", 0.12), 350);
        lightKey(60 + node.pc, true, "active-play");
        setTimeout(() => lightKey(60 + node.pc, false, "active-play"), 900);
        $("circle-readout").innerHTML = "<p class='big-answer'>" + esc(node.name) + " → " + esc(next.name) + ": a perfect fifth</p>" +
          "<p>Seven semitones up, a 3:2 ratio — the smoothest step in music, drawn as one side of a twelve-sided ring. " +
          "Walk all twelve sides and you return to " + esc(node.name) + ", seven octaves higher — geometry you can hear.</p>";
      };
      g.addEventListener("click", speak);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); speak(); } });
      svg.appendChild(g);
    });
  })();
})();
