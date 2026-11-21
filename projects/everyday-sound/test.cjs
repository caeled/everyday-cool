"use strict";
const assert = require("node:assert");
const S = require("./sound.js");

function near(actual, expected, tol, msg) {
  assert.ok(Math.abs(actual - expected) <= tol, msg + ": got " + actual + ", want " + expected + " ±" + tol);
}

/* Pitch: the anchors of the whole room */
near(S.noteFreq(69), 440, 1e-9, "A4 is 440 Hz");
near(S.noteFreq(60), 261.6256, 0.001, "C4 is 261.63 Hz");
near(S.noteFreq(72), 523.2511, 0.001, "C5 is 523.25 Hz");
near(S.noteFreq(84), 1046.502, 0.01, "C6 is 1046.50 Hz");
assert.strictEqual(S.freqToNote(440).label, "A4", "440 Hz names itself A4");
assert.strictEqual(S.freqToNote(440).cents, 0, "440 Hz is dead-on A4");
assert.strictEqual(S.freqToNote(261.63).label, "C4", "261.63 Hz names itself C4");
assert.strictEqual(S.freqToNote(466.16).label, "A#4", "466.16 Hz is A#4");
near(S.wavelength(440), 343 / 440, 1e-9, "A4's wavelength in air");
near(S.wavelength(343), 1, 1e-9, "a 343 Hz wave is one metre long");

/* Decibels: the ladder and the two rules that matter */
assert.strictEqual(S.DB_LADDER.length, 9, "nine rungs on the ladder");
near(S.dbIntensityRatio(10), 10, 1e-9, "+10 dB is ×10 intensity");
near(S.dbIntensityRatio(3), 1.9953, 0.001, "+3 dB is about ×2 intensity");
near(S.dbIntensityRatio(30), 1000, 1e-6, "+30 dB is ×1000 intensity");
near(S.dbIntensityRatio(0), 1, 1e-12, "0 dB difference is ×1");
assert.strictEqual(S.nioshSafeHours(85), 8, "85 dB: 8 hours");
assert.strictEqual(S.nioshSafeHours(88), 4, "88 dB: 4 hours (halved per +3)");
assert.strictEqual(S.nioshSafeHours(91), 2, "91 dB: 2 hours");
near(S.nioshSafeHours(100), 0.25, 1e-9, "100 dB: 15 minutes");
assert.strictEqual(S.nioshSafeHours(60), Infinity, "below 85 dB the guidance sets no limit");

/* Air: speed, echoes, thunder */
assert.strictEqual(S.speedOfSound(20), 343, "343 m/s at 20 °C");
near(S.speedOfSound(30), 349, 1e-9, "+0.6 m/s per degree");
near(S.speedOfSound(0), 331, 1e-9, "331 m/s at freezing");
near(S.echoDistance(2), 343, 1e-9, "a 2-second echo means a wall 343 m away (there and back)");
near(S.echoDistance(1), 171.5, 1e-9, "a 1-second echo: 171.5 m");
const th = S.thunder(6);
near(th.ruleKm, 2, 1e-12, "thunder rule: 6 seconds ≈ 2 km");
near(th.exactKm, 2.058, 0.001, "thunder computed: 6 seconds = 2.058 km");
assert.ok(S.SPEEDS[2].speed > S.SPEEDS[1].speed && S.SPEEDS[1].speed > S.SPEEDS[0].speed, "steel beats water beats air");
near(S.travelTime(1000, 5960), 0.1678, 0.001, "1 km through a steel rail: 0.17 s");
near(S.travelTime(1000, 343), 2.9155, 0.001, "1 km through air: 2.92 s");
assert.ok(S.travelTime(1000, 343) - S.travelTime(1000, 5960) > 2.7, "the rail wins by about 2.7 s");

/* Strings: length and tension */
near(S.stringFreq(110, 0.5, 1), 220, 1e-9, "half the string, double the pitch — the octave");
near(S.stringFreq(110, 2 / 3, 1), 165, 1e-9, "two-thirds of the string: the fifth above");
near(S.stringFreq(110, 1, 4), 220, 1e-9, "four times the tension: also an octave");
near(S.stringFreq(110, 1, 1), 110, 1e-12, "untouched string stays itself");

/* Intervals: pure ratios vs the piano's compromise */
const byName = (n) => S.INTERVALS.find((i) => i.name.startsWith(n));
near(S.justRatio(byName("Octave")), 2, 1e-12, "the octave is 2:1");
near(S.justRatio(byName("Perfect fifth")), 1.5, 1e-12, "the pure fifth is 3:2 = 1.500");
near(S.justRatio(byName("Perfect fourth")), 4 / 3, 1e-12, "the pure fourth is 4:3");
near(S.justRatio(byName("Major third")), 1.25, 1e-12, "the pure major third is 5:4");
near(S.temperedRatio(12), 2, 1e-12, "the tempered octave is still exactly 2");
near(S.temperedRatio(7), 1.498307, 0.000001, "the tempered fifth is 1.498, not 1.500");
near(S.centsBetween(1.5, S.temperedRatio(7)), 1.955, 0.01, "the piano's fifth is ~2 cents flat of pure");
near(S.centsBetween(1.25, S.temperedRatio(4)), -13.69, 0.05, "the piano's major third is ~14 cents sharp of pure");
assert.ok(Math.abs(S.justRatio(byName("Tritone")) - Math.SQRT2) < 0.01, "the tritone sits near √2 — nowhere simple");

/* The major scale: steps sum to the octave */
assert.strictEqual(S.MAJOR_STEPS.reduce((a, b) => a + b, 0), 12, "W W H W W W H sums to 12 semitones");
assert.deepStrictEqual(S.MAJOR_STEP_LABELS, ["whole", "whole", "half", "whole", "whole", "whole", "half"]);

/* Rhythm: a 4/4 measure must sum to exactly 1 */
assert.strictEqual(S.measureStatus(8).state, "exact", "8 eighths fill the measure");
assert.strictEqual(S.measureStatus(4 + 2 + 2).state, "exact", "half + quarter + quarter fills it too");
assert.strictEqual(S.measureStatus(2 + 2 + 2 + 2).state, "exact", "four quarters fill it");
const under = S.measureStatus(4 + 2);
assert.strictEqual(under.state, "under");
assert.strictEqual(S.fractionOfEighths(under.remaining), "1/4", "room for one more quarter");
const over = S.measureStatus(8 + 1);
assert.strictEqual(over.state, "over");
assert.strictEqual(S.fractionOfEighths(over.excess), "1/8", "one eighth too many");
assert.strictEqual(S.fractionOfEighths(8), "1", "a full measure is the whole 1");

/* The circle of fifths: twelve stops, each +7 semitones */
assert.strictEqual(S.CIRCLE.length, 12, "twelve notes on the ring");
for (let i = 0; i < 12; i++) {
  const a = S.CIRCLE[i].pc, b = S.CIRCLE[(i + 1) % 12].pc;
  assert.strictEqual(((b - a) % 12 + 12) % 12, 7, "each step around the ring is a fifth (+7)");
}
assert.strictEqual(new Set(S.CIRCLE.map((c) => c.pc)).size, 12, "every pitch class appears once");

/* The piano: range, keyboard map, voices */
assert.strictEqual(S.PIANO_HIGH - S.PIANO_LOW, 24, "two octaves plus the top C");
const mapped = Object.values(S.KEYMAP).sort((a, b) => a - b);
assert.deepStrictEqual(mapped, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "the A row covers a full octave, C to C");
for (const id of ["piano", "organ", "pluck", "bell", "synth"]) {
  const v = S.instrumentById(id);
  assert.ok(v, id + " exists");
  assert.ok(v.partials.length >= 1, id + " has partials");
  for (const [mult, amp] of v.partials) assert.ok(mult > 0 && amp > 0 && amp <= 1, id + " partials are sane");
  assert.ok(v.attack >= 0 && v.release > 0, id + " has an envelope");
  assert.ok(v.tau > 0 || v.sustain > 0, id + " either decays or sustains");
}
const bell = S.instrumentById("bell");
assert.ok(bell.partials.some(([m]) => Math.abs(m - 2.74) < 0.01), "the bell keeps its inharmonic 2.74 partial — that's what makes it a bell");

/* Ode to Joy: 15 notes, 16 beats, all inside the piano's range */
assert.strictEqual(S.ODE_TO_JOY.length, 15, "the demo phrase has 15 notes");
near(S.melodyDuration(S.ODE_TO_JOY, 120), 8, 1e-9, "16 beats at 120 BPM is 8 seconds");
const ode = S.melodyNotes(S.ODE_TO_JOY, 120);
assert.ok(ode.every((n) => n.midi >= S.PIANO_LOW && n.midi <= S.PIANO_HIGH), "every demo note fits the keyboard");
near(ode[12].duration / ode[0].duration, 1.5, 0.01, "the dotted note lasts half again as long");

/* MIDI: VLQ coding */
assert.deepStrictEqual(S.vlqEncode(0), [0]);
assert.deepStrictEqual(S.vlqEncode(127), [127]);
assert.deepStrictEqual(S.vlqEncode(128), [0x81, 0x00]);
assert.deepStrictEqual(S.vlqEncode(480), [0x83, 0x60]);
for (const v of [0, 1, 63, 127, 128, 480, 8192, 0x0fffff]) {
  const enc = S.vlqEncode(v), dec = S.vlqDecode(new Uint8Array(enc), 0);
  assert.strictEqual(dec.value, v, "VLQ round-trips " + v);
  assert.strictEqual(dec.length, enc.length);
}

/* MIDI: the writer and reader agree — a full round trip */
const song = [
  { midi: 60, start: 0, duration: 0.5, velocity: 100 },
  { midi: 64, start: 0.5, duration: 0.5, velocity: 90 },
  { midi: 67, start: 1.0, duration: 1.0, velocity: 110 },
  { midi: 72, start: 1.0, duration: 1.0, velocity: 80 }, // a chord with the note above
];
const bytes = S.buildMidiFile(song, { bpm: 120 });
assert.strictEqual(String.fromCharCode(...bytes.slice(0, 4)), "MThd", "the file starts with MThd");
const back = S.parseMidiFile(bytes);
assert.strictEqual(back.format, 0, "the writer makes format 0");
assert.strictEqual(back.notes.length, 4, "all four notes survive the round trip");
for (let i = 0; i < song.length; i++) {
  const got = back.notes.find((n) => n.midi === song[i].midi && Math.abs(n.start - song[i].start) < 0.01);
  assert.ok(got, "note " + song[i].midi + " at " + song[i].start + "s is found");
  near(got.duration, song[i].duration, 0.01, "duration of midi " + song[i].midi);
  assert.strictEqual(got.velocity, song[i].velocity, "velocity of midi " + song[i].midi);
}
near(back.durationSec, 2.0, 0.01, "the song lasts 2 seconds");

/* MIDI: a hand-built format-1 file — tempo track plus a notes track */
function handTrack(events) {
  const body = [];
  for (const b of events) body.push(b);
  return [0x4d, 0x54, 0x72, 0x6b, (body.length >>> 24) & 0xff, (body.length >>> 16) & 0xff, (body.length >>> 8) & 0xff, body.length & 0xff, ...body];
}
const tempoTrack = handTrack([
  0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, // tempo 500000 µs = 120 BPM
  0x00, 0xff, 0x2f, 0x00,
]);
const notesTrack = handTrack([
  0x00, 0x90, 60, 100,          // note on C4
  ...S.vlqEncode(480), 0x80, 60, 0, // one quarter later: note off
  0x00, 0x90, 64, 90,           // note on E4
  ...S.vlqEncode(240), 0x90, 64, 0, // half a quarter later: off, written as note-on velocity 0
  0x00, 0xff, 0x2f, 0x00,
]);
const fmt1 = new Uint8Array([
  0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 2, 0x01, 0xe0, // MThd: format 1, 2 tracks, 480 tpq
  ...tempoTrack, ...notesTrack,
]);
const parsed1 = S.parseMidiFile(fmt1);
assert.strictEqual(parsed1.format, 1, "the hand-built file reads as format 1");
assert.strictEqual(parsed1.trackCount, 2);
assert.strictEqual(parsed1.notes.length, 2, "both notes are found across the tracks");
near(parsed1.notes[0].duration, 0.5, 0.005, "C4 lasts one quarter at 120 BPM");
near(parsed1.notes[1].duration, 0.25, 0.005, "E4 lasts half a quarter");
assert.strictEqual(parsed1.notes[0].velocity, 100);

/* MIDI: a tempo change mid-file is honoured */
const tempoTrack2 = handTrack([
  0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,          // 120 BPM at tick 0
  ...S.vlqEncode(480), 0xff, 0x51, 0x03, 0x0f, 0x42, 0x40, // 60 BPM at tick 480
  0x00, 0xff, 0x2f, 0x00,
]);
const notesTrack2 = handTrack([
  0x00, 0x90, 69, 96,
  ...S.vlqEncode(960), 0x80, 69, 0, // two quarters long, spanning the tempo change
  0x00, 0xff, 0x2f, 0x00,
]);
const fmt1b = new Uint8Array([
  0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 2, 0x01, 0xe0,
  ...tempoTrack2, ...notesTrack2,
]);
const parsed2 = S.parseMidiFile(fmt1b);
near(parsed2.notes[0].duration, 0.5 + 1.0, 0.005, "the note lasts 0.5 s at 120 BPM plus 1.0 s at 60 BPM");

assert.throws(() => S.parseMidiFile(new Uint8Array([1, 2, 3, 4])), /Not a MIDI file/, "junk is refused plainly");

/* Tune the String: the game file ships in this folder, self-contained, and linked */
const fs = require("node:fs");
const path = require("node:path");
const gameFile = path.join(__dirname, "tune-the-string.html");
assert.ok(fs.existsSync(gameFile), "tune-the-string.html exists in the room folder");
const gameHtml = fs.readFileSync(gameFile, "utf8");
assert.ok(!/https?:\/\//.test(gameHtml), "Tune the String references nothing external (no http/https URLs)");
assert.ok(!/<(?:script|img|link)\b[^>]*\b(?:src|href)\s*=/i.test(gameHtml), "Tune the String loads no external scripts, images, or stylesheets");
const roomPage = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(roomPage.includes('href="tune-the-string.html"'), "the room page links to Tune the String");

console.log("Everyday Sound: all rule tests passed.");
