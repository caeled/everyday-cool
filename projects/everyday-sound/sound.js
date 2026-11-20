"use strict";
/* Everyday Sound — the pure rules: pitch, decibels, echoes, strings,
   intervals, rhythm, the piano's voices, and a Standard MIDI File
   reader/writer. No DOM, no WebAudio — app.js wires this to the page,
   and test.cjs checks it in Node. */

/* ---------------- Pitch ---------------- */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/* Equal temperament from A4 = 440 Hz, the modern tuning standard. */
function noteFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
function freqToMidiFloat(freq) { return 69 + 12 * Math.log2(freq / 440); }

function freqToNote(freq) {
  const exact = freqToMidiFloat(freq);
  const midi = Math.round(exact);
  const pc = ((midi % 12) + 12) % 12;
  return {
    midi,
    name: NOTE_NAMES[pc],
    octave: Math.floor(midi / 12) - 1,
    label: NOTE_NAMES[pc] + (Math.floor(midi / 12) - 1),
    cents: Math.round((exact - midi) * 100),
  };
}

/* A sound wave's length in air: speed ÷ frequency. */
function wavelength(freq, speed) { return (speed || 343) / freq; }

/* ---------------- Decibels ---------------- */

/* Typical values, the ones NIOSH and OSHA publish for familiar sounds.
   Real machines vary, and distance matters — the page says so. */
const DB_LADDER = [
  { name: "A whisper, an arm's length away", db: 30 },
  { name: "A quiet library", db: 40 },
  { name: "Normal conversation", db: 60 },
  { name: "A vacuum cleaner", db: 70 },
  { name: "A food blender", db: 85 },
  { name: "A lawn mower", db: 90 },
  { name: "A motorcycle, close up", db: 95 },
  { name: "A chainsaw", db: 110 },
  { name: "A jet taking off, 100 metres away", db: 130 },
];

/* Intensity (the physical energy) grows by ×10 for every +10 dB. */
function dbIntensityRatio(diffDb) { return Math.pow(10, diffDb / 10); }

/* NIOSH's recommended limit: 85 dB for 8 hours, and the safe time
   halves for every +3 dB. Below 85 dB there is no time limit in the
   guidance — reported here as Infinity and worded on the page. */
function nioshSafeHours(db) {
  if (db < 85) return Infinity;
  return 8 / Math.pow(2, (db - 85) / 3);
}

/* ---------------- Air, echoes, thunder ---------------- */

/* The speed of sound in air: 343 m/s at 20 °C, gaining roughly
   0.6 m/s for every degree warmer. */
function speedOfSound(tempC) { return 343 + 0.6 * (tempC - 20); }

/* An echo goes there and back, so the wall is half the trip. */
function echoDistance(seconds, tempC) {
  return speedOfSound(tempC == null ? 20 : tempC) * seconds / 2;
}

/* The thunder rule: count the seconds between flash and bang.
   ÷3 ≈ kilometres (the rule of thumb); the computed value uses the
   actual speed at the given temperature. */
function thunder(seconds, tempC) {
  const v = speedOfSound(tempC == null ? 20 : tempC);
  return { ruleKm: seconds / 3, exactKm: v * seconds / 1000, ruleMi: seconds / 5, exactMi: v * seconds / 1609.344 };
}

const SPEEDS = [
  { medium: "Air (20 °C)", speed: 343 },
  { medium: "Water", speed: 1480 },
  { medium: "Steel", speed: 5960 },
];
function travelTime(distanceM, speed) { return distanceM / speed; }

/* ---------------- Strings ---------------- */

/* A string's pitch: inversely proportional to its length, and
   proportional to the square root of its tension. Halve the length,
   double the frequency — an octave up. */
function stringFreq(baseFreq, lengthRatio, tensionRatio) {
  return baseFreq / lengthRatio * Math.sqrt(tensionRatio == null ? 1 : tensionRatio);
}

/* ---------------- Intervals: music as ratios ---------------- */

/* The just (pure) ratios, small whole numbers. The tritone's ratio is
   genuinely awkward — 45:32 is one traditional spelling — which is
   part of why it rubs. */
const INTERVALS = [
  { name: "Unison", semitones: 0, ratio: [1, 1], blurb: "The same note twice. The waves are one wave." },
  { name: "Major third", semitones: 4, ratio: [5, 4], blurb: "Bright and sweet — the lift inside a major chord." },
  { name: "Perfect fourth", semitones: 5, ratio: [4, 3], blurb: "Open and hymn-like; the start of many a tune's second phrase." },
  { name: "Tritone — the rough one", semitones: 6, ratio: [45, 32], blurb: "Half an octave, and it lands nowhere comfortable. For centuries it was called the devil in music." },
  { name: "Perfect fifth", semitones: 7, ratio: [3, 2], blurb: "The most consonant interval after the octave — power chords are built on it." },
  { name: "Octave", semitones: 12, ratio: [2, 1], blurb: "So smooth the two notes share a name. Every second wave lines up exactly." },
];
function justRatio(interval) { return interval.ratio[0] / interval.ratio[1]; }
/* Equal temperament: the octave is sliced into twelve equal steps. */
function temperedRatio(semitones) { return Math.pow(2, semitones / 12); }
function centsBetween(a, b) { return 1200 * Math.log2(a / b); }

/* ---------------- The major scale ---------------- */

const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1];
const MAJOR_STEP_LABELS = ["whole", "whole", "half", "whole", "whole", "whole", "half"];

/* ---------------- Rhythm is fractions ---------------- */

/* Values counted in eighth notes so a 4/4 measure holds exactly 8. */
const NOTE_VALUES = [
  { id: "whole", name: "Whole note", eighths: 8, fraction: "1" },
  { id: "half", name: "Half note", eighths: 4, fraction: "1/2" },
  { id: "quarter", name: "Quarter note", eighths: 2, fraction: "1/4" },
  { id: "eighth", name: "Eighth note", eighths: 1, fraction: "1/8" },
];
const MEASURE_EIGHTHS = 8;
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function fractionOfEighths(n) {
  if (n === 0) return "0";
  if (n === MEASURE_EIGHTHS) return "1";
  const g = gcd(n, MEASURE_EIGHTHS);
  return (n / g) + "/" + (MEASURE_EIGHTHS / g);
}
function measureStatus(totalEighths) {
  if (totalEighths === MEASURE_EIGHTHS) return { state: "exact", remaining: 0, excess: 0 };
  if (totalEighths < MEASURE_EIGHTHS) return { state: "under", remaining: MEASURE_EIGHTHS - totalEighths, excess: 0 };
  return { state: "over", remaining: 0, excess: totalEighths - MEASURE_EIGHTHS };
}

/* ---------------- The circle of fifths ---------------- */

/* Twelve pitch classes on a ring, each a perfect fifth (7 semitones,
   ratio 3:2) above the last. After twelve fifths you arrive back at
   the start — seven octaves up, in pure tuning a whisker sharp,
   which is one of the reasons temperament exists. */
const CIRCLE = [
  { name: "C", pc: 0 }, { name: "G", pc: 7 }, { name: "D", pc: 2 }, { name: "A", pc: 9 },
  { name: "E", pc: 4 }, { name: "B", pc: 11 }, { name: "Gb", pc: 6 }, { name: "Db", pc: 1 },
  { name: "Ab", pc: 8 }, { name: "Eb", pc: 3 }, { name: "Bb", pc: 10 }, { name: "F", pc: 5 },
];

/* ---------------- The piano ---------------- */

/* Two octaves, C4 (MIDI 60) to C6 (MIDI 84). */
const PIANO_LOW = 60;
const PIANO_HIGH = 84;

/* Computer-keyboard mapping: the A row plays one octave of C major
   plus the black keys on the W row, the usual tracker layout. */
const KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };

/* The five synthesized voices. These are parameter recipes, not
   recordings: partials are [frequency multiple, amplitude] pairs,
   tau is the decay time constant in seconds (0 = sustain while held),
   release is the fade-out when a held note ends. app.js turns a
   recipe into WebAudio nodes; test.cjs checks the recipes are sane. */
const INSTRUMENTS = [
  { id: "piano", name: "Piano", wave: "sine",
    partials: [[1, 1], [2, 0.5], [3, 0.25], [4, 0.1]],
    attack: 0.005, tau: 0.45, sustain: 0, release: 0.12, filter: 0, filterEnd: 0 },
  { id: "organ", name: "Organ", wave: "sine",
    partials: [[1, 0.7], [2, 0.5], [3, 0.3], [4, 0.15]],
    attack: 0.04, tau: 0, sustain: 0.85, release: 0.3, filter: 0, filterEnd: 0 },
  { id: "pluck", name: "Plucked string", wave: "triangle",
    partials: [[1, 1], [2, 0.3]],
    attack: 0.003, tau: 0.16, sustain: 0, release: 0.08, filter: 2800, filterEnd: 400 },
  { id: "bell", name: "Bell", wave: "sine",
    partials: [[1, 1], [2.74, 0.55], [5.43, 0.28]],
    attack: 0.002, tau: 1.1, sustain: 0, release: 0.2, filter: 0, filterEnd: 0 },
  { id: "synth", name: "Synth", wave: "sawtooth",
    partials: [[1, 0.8]],
    attack: 0.01, tau: 0, sustain: 0.6, release: 0.18, filter: 1400, filterEnd: 0 },
];
function instrumentById(id) { return INSTRUMENTS.find((i) => i.id === id) || INSTRUMENTS[0]; }

/* ---------------- A built-in tune ---------------- */

/* Ode to Joy — Beethoven, 1824, public domain. [midi, beats]. */
const ODE_TO_JOY = [
  [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
  [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2],
];
function melodyNotes(melody, bpm) {
  const spb = 60 / bpm;
  let t = 0;
  return melody.map(([midi, beats]) => {
    const note = { midi, start: t, duration: beats * spb * 0.92, velocity: 96 };
    t += beats * spb;
    return note;
  });
}
function melodyDuration(melody, bpm) {
  return melody.reduce((sum, [, beats]) => sum + beats, 0) * 60 / bpm;
}

/* ---------------- Standard MIDI Files ----------------
   A reader and a writer in plain JavaScript, from the SMF
   specification (MIDI Manufacturers Association / midi.org).
   Notes are { midi, start, duration, velocity } in seconds. */

function vlqEncode(value) {
  const bytes = [value & 0x7f];
  value >>= 7;
  while (value > 0) { bytes.unshift((value & 0x7f) | 0x80); value >>= 7; }
  return bytes;
}
function vlqDecode(bytes, offset) {
  let value = 0, i = offset;
  for (;;) {
    const b = bytes[i++];
    value = (value << 7) | (b & 0x7f);
    if (!(b & 0x80)) break;
  }
  return { value, length: i - offset };
}

/* Write a format-0 file: one track, a tempo meta event, full status
   bytes (no running status — simpler, and every reader accepts it). */
function buildMidiFile(notes, opts) {
  const bpm = (opts && opts.bpm) || 120;
  const tpq = 480;
  const usPerQuarter = Math.round(60000000 / bpm);
  const secToTicks = (s) => Math.round(s * tpq * bpm / 60);
  const events = [];
  for (const n of notes) {
    const on = secToTicks(n.start), off = secToTicks(n.start + Math.max(n.duration, 0.03));
    events.push({ tick: on, kind: 1, midi: n.midi, vel: Math.max(1, Math.min(127, n.velocity || 96)) });
    events.push({ tick: off, kind: 0, midi: n.midi, vel: 0 });
  }
  events.sort((a, b) => a.tick - b.tick || a.kind - b.kind); // offs before ons at the same tick
  const track = [];
  track.push(0x00, 0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff);
  let lastTick = 0;
  for (const e of events) {
    track.push(...vlqEncode(e.tick - lastTick));
    lastTick = e.tick;
    track.push(e.kind === 1 ? 0x90 : 0x80, e.midi, e.vel);
  }
  track.push(...vlqEncode(0), 0xff, 0x2f, 0x00);
  const out = [];
  const pushStr = (s) => { for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i)); };
  const push32 = (v) => out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
  const push16 = (v) => out.push((v >> 8) & 0xff, v & 0xff);
  pushStr("MThd"); push32(6); push16(0); push16(1); push16(tpq);
  pushStr("MTrk"); push32(track.length);
  out.push(...track);
  return new Uint8Array(out);
}

/* Read formats 0 and 1 (and survive 2): every track's notes merged,
   ticks converted to seconds through the file's tempo map. */
function parseMidiFile(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const strAt = (i, n) => { let s = ""; for (let k = 0; k < n; k++) s += String.fromCharCode(u8[i + k]); return s; };
  const u32 = (i) => ((u8[i] << 24) | (u8[i + 1] << 16) | (u8[i + 2] << 8) | u8[i + 3]) >>> 0;
  const u16 = (i) => (u8[i] << 8) | u8[i + 1];
  if (strAt(0, 4) !== "MThd") throw new Error("Not a MIDI file (no MThd header).");
  const format = u16(8);
  const trackCount = u16(10);
  const tpq = u16(12) & 0x7fff;
  let pos = 8 + u32(4);
  const tempoEvents = []; // {tick, usPerQuarter} across all tracks
  const rawNotes = [];    // {midi, startTick, endTick, velocity}
  let maxTick = 0;
  for (let t = 0; t < trackCount; t++) {
    if (strAt(pos, 4) !== "MTrk") throw new Error("Corrupt MIDI file (missing MTrk chunk).");
    const len = u32(pos + 4);
    let p = pos + 8;
    const end = p + len;
    let tick = 0, running = 0;
    const open = new Map(); // channel*128+midi -> {tick, velocity}
    while (p < end) {
      const d = vlqDecode(u8, p); p += d.length; tick += d.value;
      let status = u8[p];
      if (status < 0x80) { status = running; } else { p++; if (status < 0xf0) running = status; }
      if (status === 0xff) {
        const type = u8[p++];
        const ml = vlqDecode(u8, p); p += ml.length;
        if (type === 0x51 && ml.value === 3) {
          tempoEvents.push({ tick, us: (u8[p] << 16) | (u8[p + 1] << 8) | u8[p + 2] });
        }
        p += ml.value;
      } else if (status === 0xf0 || status === 0xf7) {
        const sl = vlqDecode(u8, p); p += sl.length + sl.value;
      } else {
        const kind = status & 0xf0, channel = status & 0x0f;
        const dataLen = (kind === 0xc0 || kind === 0xd0) ? 1 : 2;
        const d1 = u8[p], d2 = dataLen === 2 ? u8[p + 1] : 0;
        p += dataLen;
        const key = channel * 128 + d1;
        if (kind === 0x90 && d2 > 0) {
          if (open.has(key)) { const o = open.get(key); rawNotes.push({ midi: d1, startTick: o.tick, endTick: tick, velocity: o.velocity }); }
          open.set(key, { tick, velocity: d2 });
        } else if (kind === 0x80 || (kind === 0x90 && d2 === 0)) {
          if (open.has(key)) { const o = open.get(key); rawNotes.push({ midi: d1, startTick: o.tick, endTick: tick, velocity: o.velocity }); open.delete(key); }
        }
      }
      if (tick > maxTick) maxTick = tick;
    }
    for (const [key, o] of open) rawNotes.push({ midi: key % 128, startTick: o.tick, endTick: maxTick, velocity: o.velocity });
    pos = end;
  }
  tempoEvents.sort((a, b) => a.tick - b.tick);
  function tickToSec(tick) {
    let sec = 0, last = 0, us = 500000;
    for (const ev of tempoEvents) {
      if (ev.tick >= tick) break;
      sec += (ev.tick - last) / tpq * us / 1e6;
      last = ev.tick; us = ev.us;
    }
    return sec + (tick - last) / tpq * us / 1e6;
  }
  const notes = rawNotes.map((n) => ({
    midi: n.midi, velocity: n.velocity,
    start: tickToSec(n.startTick), duration: Math.max(0.03, tickToSec(n.endTick) - tickToSec(n.startTick)),
  })).sort((a, b) => a.start - b.start || a.midi - b.midi);
  return { format, tpq, trackCount, durationSec: tickToSec(maxTick), notes };
}

/* ---------------- Small helpers ---------------- */

function fmt(x, digits) {
  if (!isFinite(x)) return "—";
  const d = digits == null ? 2 : digits;
  return Number(x.toFixed(d)).toLocaleString("en-US", { maximumFractionDigits: d });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NOTE_NAMES, noteFreq, freqToMidiFloat, freqToNote, wavelength,
    DB_LADDER, dbIntensityRatio, nioshSafeHours,
    speedOfSound, echoDistance, thunder, SPEEDS, travelTime,
    stringFreq, INTERVALS, justRatio, temperedRatio, centsBetween,
    MAJOR_STEPS, MAJOR_STEP_LABELS, NOTE_VALUES, MEASURE_EIGHTHS, fractionOfEighths, measureStatus,
    CIRCLE, PIANO_LOW, PIANO_HIGH, KEYMAP, INSTRUMENTS, instrumentById,
    ODE_TO_JOY, melodyNotes, melodyDuration,
    vlqEncode, vlqDecode, buildMidiFile, parseMidiFile, fmt,
  };
}
