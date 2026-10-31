'use strict';
/* Decisions Everywhere — local logic only. Nothing is stored or sent. */

/* ---------- Room 1: Guessing and Knowing ---------- */
const CATEGORIES = ['Observation', 'Fact', 'Prediction', 'Opinion', 'Guess'];
const STATEMENTS = [
  { text: 'The grass is wet.', answer: 'Observation',
    note: 'You can see and feel this right now. An observation reports what your senses found, with no explanation attached.' },
  { text: 'It probably rained.', answer: 'Guess',
    note: 'Nobody saw rain. “Probably” is the tell: this is a conclusion you are inferring from the wet grass, not something observed.' },
  { text: 'It will rain tomorrow.', answer: 'Prediction',
    note: 'It is about the future. It may turn out right or wrong, but nobody can check it yet.' },
  { text: 'Rainy weather is pleasant.', answer: 'Opinion',
    note: '“Pleasant” is a judgment. Someone else can feel the opposite about the very same weather.' },
  { text: 'Water boils at 100 °C at sea level.', answer: 'Fact',
    note: 'Anyone, anywhere, can test this claim and get the same result. Checkable and repeatable makes it a fact.' },
  { text: 'The library closes at 6 pm on Fridays.', answer: 'Fact',
    note: 'A checkable detail. You could verify it against the library’s posted hours right now.' },
  { text: 'I can see three red cars parked on this street.', answer: 'Observation',
    note: 'A direct report of what you are looking at in this moment — nothing added, nothing explained.' },
  { text: 'Our team will win the game on Saturday.', answer: 'Prediction',
    note: 'Confidence does not move a claim out of the future. Win or lose, today it is still a prediction.' },
  { text: 'Chocolate ice cream tastes better than vanilla.', answer: 'Opinion',
    note: '“Better” here means “better to me.” Taste cannot settle the question for everyone.' },
  { text: 'Maybe the cat knocked the plant over.', answer: 'Guess',
    note: '“Maybe,” plus no witness: a possible explanation offered without evidence. It might be true; nobody knows yet.' },
  { text: 'The plant is lying on the floor.', answer: 'Observation',
    note: 'A plain report of what is in front of you. Notice how it leaves the explaining for later.' },
  { text: 'A triangle has three sides.', answer: 'Fact',
    note: 'True by definition, and anyone can check it against the definition at any time.' }
];
function checkStatement(index, category) {
  return STATEMENTS[index].answer === category;
}

/* ---------- Room 2: The Broken Flashlight ---------- */
const CAUSES = ['Dead batteries', 'Backward batteries', 'Dirty contacts', 'Defective switch', 'Broken bulb'];
const FLASHLIGHT_ANSWER = 'Dirty contacts';
const CLUES = [
  { text: 'Test 1 — Swap in batteries you know are charged. The flashlight stays dark.',
    eliminates: 'Dead batteries',
    why: 'Good power went in and nothing changed, so power was never the problem.' },
  { text: 'Test 2 — Check the batteries against the + and − marks in the tube. They are in the right way round.',
    eliminates: 'Backward batteries',
    why: 'Orientation is correct, so it cannot be the cause.' },
  { text: 'Test 3 — Look closely at the bulb. The filament is in one unbroken piece.',
    eliminates: 'Broken bulb',
    why: 'A broken filament would show a gap. There is none.' },
  { text: 'Test 4 — Click the switch twenty times and test it with a meter. It clicks firmly and connects every single time.',
    eliminates: 'Defective switch',
    why: 'The switch does its job under test, so it leaves the list too.' }
];
function remainingCauses(revealedCount) {
  const gone = new Set(CLUES.slice(0, revealedCount).map(c => c.eliminates));
  return CAUSES.filter(c => !gone.has(c));
}

/* ---------- Room 3: The Tradeoff Store ---------- */
const PRODUCTS = [
  { name: 'Zoom Kart — a racing game player', traits: ['Cheap', 'Fast', 'Reliable'], outcomes: {
    'Cheap|Fast':    { title: 'Zoom Kart: Street Edition', gave: 'Reliable',
      text: 'Costs little and races at full speed from day one.',
      note: 'By winter the steering wobbles and two buttons stick. The speed was real; lasting was the price you paid.' },
    'Cheap|Reliable': { title: 'Zoom Kart: Sturdy Edition', gave: 'Fast',
      text: 'Costs little and keeps working year after year.',
      note: 'It is the slowest racer on the shelf. Winning takes patience and very good corners.' },
    'Fast|Reliable': { title: 'Zoom Kart: Pro Edition', gave: 'Cheap',
      text: 'Blazing fast, and built to survive season after season of play.',
      note: 'It costs as much as three Street Editions. Your savings will feel this one.' } } },
  { name: 'FeatherBook — a laptop', traits: ['Powerful', 'Portable', 'Affordable'], outcomes: {
    'Affordable|Powerful': { title: 'FeatherBook Desk', gave: 'Portable',
      text: 'Edits video without breaking a sweat, at a gentle price.',
      note: 'It weighs as much as a small bag of bricks. Carrying it anywhere is a workout.' },
    'Affordable|Portable': { title: 'FeatherBook Air', gave: 'Powerful',
      text: 'Light enough to forget it is in your bag, at a gentle price.',
      note: 'Ask it to edit a big video and it thinks very, very slowly. Lightness was bought with strength.' },
    'Portable|Powerful':  { title: 'FeatherBook Pro Slim', gave: 'Affordable',
      text: 'Feather-light and seriously strong — the full wish list in one machine.',
      note: 'Almost the full wish list: the price tag is the one thing that is not light.' } } }
];
function pairKey(a, b) { return [a, b].sort().join('|'); }
function tradeoffOutcome(product, a, b) {
  return product.outcomes[pairKey(a, b)] || null;
}

/* ---------- Room 4: The Coin That Lies ---------- */
function flipCoins(n, rng) {
  rng = rng || Math.random;
  const out = [];
  for (let i = 0; i < n; i++) out.push(rng() < 0.5); /* true = heads */
  return out;
}
function countHeads(seq) { return seq.filter(Boolean).length; }
function longestRun(seq) {
  let best = 0, cur = 0, prev = null;
  for (const v of seq) { cur = (v === prev) ? cur + 1 : 1; prev = v; if (cur > best) best = cur; }
  return best;
}
function rollDicePairs(n, rng) {
  rng = rng || Math.random;
  const out = [];
  for (let i = 0; i < n; i++) out.push([1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)]);
  return out;
}
function tallyTotals(pairs) {
  const tally = {};
  for (const [a, b] of pairs) tally[a + b] = (tally[a + b] || 0) + 1;
  return tally;
}
const SUITS = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
function drawCards(n, rng) {
  rng = rng || Math.random;
  const out = [];
  for (let i = 0; i < n; i++) {
    const v = Math.floor(rng() * 52), suit = Math.floor(v / 13);
    out.push({ label: RANKS[v % 13] + ' of ' + SUITS[suit], red: suit === 1 || suit === 2 });
  }
  return out;
}

/* ---------- Room 7: Confidence Meter ---------- */
const CLAIMS = [
  { text: 'The sun will rise tomorrow morning.', low: 90, high: 100,
    evidence: 'The Earth has turned the same way for billions of mornings, and astronomers predict sunrise to the second. This is about as certain as an everyday claim gets.' },
  { text: 'It will rain during our picnic on Saturday.', low: 25, high: 60,
    evidence: 'The forecast says a 40% chance of rain. That means: out of ten similar Saturdays, about four were rainy and six were not. A coin flip with a slight lean.' },
  { text: 'The next coin flip will land on heads.', low: 40, high: 60,
    evidence: 'The coin does not remember the last flip. Heads is exactly as likely as tails — half and half, every single time.' },
  { text: 'The library book I want will still be on the shelf when I visit.', low: 20, high: 70,
    evidence: 'You have not checked the catalogue, and popular books get borrowed. The honest answer is “it depends” — and one catalogue check would turn this guess into knowledge.' }
];
function confidenceLabel(v) {
  if (v < 25) return 'Very uncertain';
  if (v < 50) return 'Some evidence';
  if (v < 75) return 'Strong evidence';
  return 'Extremely likely';
}
function confidenceVerdict(claim, v) {
  if (v >= claim.low && v <= claim.high) return 'inside';
  return v < claim.low ? 'low' : 'high';
}

/* ---------- Room 6: The Time Machine ---------- */
const SCENARIOS = [
  { id: 'coins', title: 'The twenty coins',
    setup: 'Every week you earn 20 coins of pocket money. The new game everyone is playing costs 20. The telescope you dream about costs 200.',
    options: [
      { id: 'save', label: 'Save the coins', stops: [
        ['Tomorrow', '20 coins sit in your jar. The new game is not yours — yet.'],
        ['Next month', 'The jar holds about 80. Waiting starts to feel like a superpower.'],
        ['Next year', 'More than 1,000 coins have passed through the jar. The telescope is yours, with coins left over.'] ] },
      { id: 'spend', label: 'Spend as you go', stops: [
        ['Tomorrow', 'The new game is yours tonight, and it is glorious.'],
        ['Next month', 'The game is finished and a little boring. The jar is empty.'],
        ['Next year', 'The telescope still costs 200 and the jar is still empty — but you had a year of small treats along the way.'] ] } ] },
  { id: 'practice', title: 'The song',
    setup: 'There is a song you want to play well. It would take ten minutes of practice a day. Or you could leave it for later.',
    options: [
      { id: 'practice', label: 'Practice ten minutes a day', stops: [
        ['Tomorrow', 'Your fingers remember a tiny bit more than yesterday.'],
        ['Next month', 'The hard bar in the middle of the song stops being hard.'],
        ['Next year', 'You play the whole song for a friend — and start teaching them.'] ] },
      { id: 'later', label: 'Leave it for later', stops: [
        ['Tomorrow', 'Ten extra minutes of free time today. The song is exactly as hard as yesterday.'],
        ['Next month', 'The lesson book is somewhere under a pile of other things.'],
        ['Next year', 'The song is still waiting. It is patient. Starting now would still work — later is not never.'] ] } ] },
  { id: 'bicycle', title: 'The bicycle',
    setup: 'Your bicycle has a wobbly wheel and worn brakes. A repair costs a little. A new bicycle costs everything you have saved.',
    options: [
      { id: 'repair', label: 'Repair the bicycle', stops: [
        ['Tomorrow', 'An afternoon with tools, and money still left in the jar.'],
        ['Next month', 'The bike rides like it means it, and you know how every part works.'],
        ['Next year', 'You have repaired it twice more, each time faster. Small fixes keep it rolling.'] ] },
      { id: 'replace', label: 'Replace the bicycle', stops: [
        ['Tomorrow', 'A brand-new bicycle today — and an empty jar.'],
        ['Next month', 'It rides beautifully, and there is nothing saved for the next surprise.'],
        ['Next year', 'The new bike needs its own first repair — and this time, you know the choice well.'] ] } ] }
];

/* ---------- Room 8: The Big Decision Lab ---------- */
const LAB = {
  computers: { label: 'Faster computers',
    see: 'Count the computers, then count the students who share them. How old are the machines, really?',
    question: 'Is the waiting caused by slow computers — or by the Wi-Fi dropping out?',
    test: 'Time ten students doing the same task and watch where the waiting actually happens.' },
  internet: { label: 'Better internet',
    see: 'Notice when the internet actually fails. All day long, or at one busy hour?',
    question: 'Is the connection itself slow, or is one corner of the building a dead zone?',
    test: 'Try the same download in three different rooms and compare the times.' },
  playground: { label: 'More playground equipment',
    see: 'Watch the playground at break. What is worn out, what is crowded, what is ignored?',
    question: 'Do students need new equipment — or more of the one thing everyone queues for?',
    test: 'Count how many students use each piece of equipment during one break.' }
};

/* ---------- Browser wiring (skipped under Node tests) ---------- */
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* Room 1 */
  (function () {
    let i = 0, firstTry = 0, misses = 0;
    const box = $('r1-statement'), fb = $('r1-feedback'), prog = $('r1-progress'), next = $('r1-next'), done = $('r1-done');
    const buttons = Array.from(document.querySelectorAll('#r1-buttons button'));
    function render() {
      box.textContent = '“' + STATEMENTS[i].text + '”';
      prog.textContent = 'Statement ' + (i + 1) + ' of ' + STATEMENTS.length + ' · sorted on the first try: ' + firstTry;
      fb.textContent = ''; next.hidden = true; misses = 0;
      buttons.forEach(b => { b.disabled = false; });
    }
    buttons.forEach(b => b.addEventListener('click', () => {
      const cat = b.dataset.cat;
      if (checkStatement(i, cat)) {
        if (misses === 0) firstTry++;
        fb.replaceChildren(el('strong', null, cat + '. '), document.createTextNode(STATEMENTS[i].note));
        buttons.forEach(x => { x.disabled = true; });
        if (i === STATEMENTS.length - 1) {
          done.hidden = false;
          done.textContent = 'All ' + STATEMENTS.length + ' statements sorted. First-try sorts: ' + firstTry + ' of ' + STATEMENTS.length + '. The misses are not failures — they are a map of which categories blur together for you.';
          prog.textContent = 'Finished · sorted on the first try: ' + firstTry + ' of ' + STATEMENTS.length;
        } else { next.hidden = false; next.focus(); }
      } else {
        misses++;
        fb.textContent = 'Not quite. Ask: is it something sensed right now, something anyone can check, something about the future, a feeling or judgment, or a maybe? Try again.';
      }
    }));
    next.addEventListener('click', () => { i++; render(); });
    render();
  })();

  /* Room 2 */
  (function () {
    let revealed = 0, guessed = false;
    const list = $('r2-causes'), cluesBox = $('r2-clues'), result = $('r2-result'), clueBtn = $('r2-clue-btn');
    function renderCauses() {
      const remaining = remainingCauses(revealed);
      list.replaceChildren(...CAUSES.map(c => {
        const li = el('li', remaining.includes(c) ? null : 'eliminated', c);
        if (!remaining.includes(c)) li.appendChild(document.createTextNode(' — eliminated'));
        return li;
      }));
    }
    $('r2-guess-form').addEventListener('submit', e => {
      e.preventDefault();
      const pick = document.querySelector('input[name="r2guess"]:checked');
      if (!pick) return;
      guessed = pick.value;
      $('r2-guess-result').textContent = 'Your first guess: ' + guessed + '. Hold onto it — now let the clues cross-examine it.';
      clueBtn.disabled = false; clueBtn.focus();
    });
    clueBtn.addEventListener('click', () => {
      if (revealed >= CLUES.length) return;
      const clue = CLUES[revealed]; revealed++;
      const item = el('li', null); item.append(el('strong', null, clue.text + ' '), document.createTextNode('(' + clue.eliminates + ' eliminated: ' + clue.why + ')'));
      cluesBox.appendChild(item); renderCauses();
      if (revealed === CLUES.length) {
        clueBtn.disabled = true;
        const remaining = remainingCauses(revealed);
        let verdict = 'One suspect is left standing: ' + remaining[0] + '. A pencil eraser on the metal contacts, a quick polish — and the flashlight lights. The clues did not just find the answer; they proved the other four wrong.';
        if (guessed === FLASHLIGHT_ANSWER) verdict = 'Your first guess was right — and now it is more than a guess. ' + verdict;
        else if (guessed) verdict = 'Your first guess (' + guessed + ') did not survive the clues. That is not a failure; that is the method working. ' + verdict;
        result.replaceChildren(el('strong', null, 'Case closed. '), document.createTextNode(verdict));
      }
    });
    renderCauses();
  })();

  /* Room 3 */
  (function () {
    const host = $('r3-products');
    PRODUCTS.forEach((p, pi) => {
      const card = el('article', 'card');
      card.append(el('h3', null, p.name), el('p', null, 'The store offers any two of: ' + p.traits.join(' · ') + '. The third is the price. Choose a pair:'));
      const row = el('div', 'btnrow'), out = el('div', 'result'); out.setAttribute('role', 'status');
      [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => {
        const btn = el('button', null, p.traits[a] + ' + ' + p.traits[b]); btn.type = 'button';
        btn.addEventListener('click', () => {
          const o = tradeoffOutcome(p, p.traits[a], p.traits[b]);
          out.replaceChildren(
            el('strong', null, 'You chose ' + p.traits[a] + ' + ' + p.traits[b] + ' → ' + o.title + '. '),
            document.createTextNode(o.text + ' Given up: ' + o.gave + '. ' + o.note));
        });
        row.appendChild(btn);
      });
      card.append(row, out); host.appendChild(card);
    });
  })();

  /* Room 4 */
  (function () {
    let coinTotal = [];
    $('r4-flip10').addEventListener('click', () => {
      const pick = document.querySelector('input[name="r4predict"]:checked');
      const seq = flipCoins(10); coinTotal = seq;
      const heads = countHeads(seq), run = longestRun(seq);
      const chips = $('r4-seq'); chips.replaceChildren(...seq.map(h => el('span', 'chip', h ? 'H' : 'T')));
      let verdict;
      const actual = heads > 5 ? 'heads' : heads < 5 ? 'tails' : 'even';
      if (pick) verdict = (pick.value === actual) ? 'Your prediction matched this run. ' : 'Your prediction (' + pick.value + ') did not match this run — and one run of ten proves almost nothing either way. ';
      else verdict = '';
      $('r4-coin-result').textContent = verdict + 'Heads: ' + heads + ' of 10. Longest streak: ' + run + ' in a row. A streak of ' + run + ' feels like a pattern; in pure coin flips it is completely ordinary. Now try ninety more.';
      $('r4-flip90').disabled = false;
    });
    $('r4-flip90').addEventListener('click', () => {
      coinTotal = coinTotal.concat(flipCoins(90));
      const heads = countHeads(coinTotal);
      $('r4-coin-result').textContent = 'After ' + coinTotal.length + ' flips: ' + heads + ' heads (' + Math.round(heads / coinTotal.length * 100) + '%). Longest streak anywhere in the run: ' + longestRun(coinTotal) + '. Small runs lie wildly; big runs drift toward half — that drift is the law of large numbers introducing itself.';
      $('r4-flip90').disabled = true;
    });
    $('r4-dice-btn').addEventListener('click', () => {
      const predicted = Number($('r4-dice-predict').value);
      const tally = tallyTotals(rollDicePairs(36));
      const rows = Object.keys(tally).sort((a, b) => a - b).map(t => t + ' came up ' + tally[t] + '×').join(' · ');
      const best = Object.keys(tally).reduce((a, b) => tally[b] > tally[a] ? b : a);
      $('r4-dice-result').textContent = '36 rolls of two dice: ' + rows + '. You predicted ' + predicted + ' (it appeared ' + (tally[predicted] || 0) + ' times). The most common total was ' + best + '. Seven usually wins this race: six different pairs of dice make 7, while only one pair makes 2 or 12. One session of 36 can still surprise you — run it again and compare.';
    });
    $('r4-card-btn').addEventListener('click', () => {
      const pick = document.querySelector('input[name="r4card"]:checked');
      const cards = drawCards(10);
      const reds = cards.filter(c => c.red).length;
      $('r4-card-result').textContent = 'You drew: ' + cards.map(c => c.label).join(', ') + '. Red: ' + reds + ' · Black: ' + (10 - reds) + '.' + (pick ? (pick.value === 'red' ? (reds > 5 ? ' Red won this draw, as you predicted.' : ' Red did not win this draw — ten cards is a small sample of a fair deck.') : (reds < 5 ? ' Black won this draw, as you predicted.' : ' Black did not win this draw — ten cards is a small sample of a fair deck.')) : '');
    });
  })();

  /* Room 5 */
  (function () {
    [1, 2, 3].forEach(n => {
      $('r5-btn-' + n).addEventListener('click', () => { $('r5-note-' + n).hidden = false; $('r5-btn-' + n).disabled = true; });
    });
    $('r5-honest-btn').addEventListener('click', () => {
      $('graph-honest').hidden = false; $('r5-honest-note').hidden = false; $('r5-honest-btn').disabled = true;
    });
  })();

  /* Room 6 */
  (function () {
    const host = $('r6-scenarios');
    SCENARIOS.forEach(s => {
      const card = el('article', 'card');
      card.append(el('h3', null, s.title), el('p', null, s.setup));
      const row = el('div', 'btnrow'), out = el('div', 'result'); out.setAttribute('role', 'status');
      s.options.forEach(o => {
        const btn = el('button', null, o.label); btn.type = 'button';
        btn.addEventListener('click', () => {
          out.replaceChildren(...o.stops.map(([when, what]) => {
            const p = el('p', null); p.append(el('strong', null, when + ': '), document.createTextNode(what)); return p;
          }));
        });
        row.appendChild(btn);
      });
      card.append(row, out); host.appendChild(card);
    });
  })();

  /* Room 7 */
  (function () {
    const host = $('r7-claims');
    CLAIMS.forEach((claim, ci) => {
      const card = el('article', 'card');
      card.append(el('h3', null, 'Claim ' + (ci + 1)), el('p', 'big', '“' + claim.text + '”'));
      const lab = el('label', null, 'Your confidence'); lab.htmlFor = 'r7-range-' + ci;
      const range = document.createElement('input');
      range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50'; range.id = 'r7-range-' + ci;
      const readout = el('p', 'note', ''); readout.setAttribute('role', 'status');
      const show = () => { readout.textContent = range.value + ' / 100 — ' + confidenceLabel(Number(range.value)); };
      range.addEventListener('input', show); show();
      const btn = el('button', null, 'Check the evidence'); btn.type = 'button';
      const out = el('div', 'result'); out.setAttribute('role', 'status');
      btn.addEventListener('click', () => {
        const v = Number(range.value), verdict = confidenceVerdict(claim, v);
        const head = verdict === 'inside' ? 'Well calibrated. ' : verdict === 'low' ? 'Lower than the evidence supports. ' : 'Higher than the evidence supports. ';
        out.replaceChildren(el('strong', null, head), document.createTextNode(claim.evidence + ' A reasonable setting here is roughly ' + claim.low + '–' + claim.high + '.'));
      });
      card.append(lab, range, readout, btn, out); host.appendChild(card);
    });
  })();

  /* Room 8 */
  (function () {
    $('r8-form').addEventListener('submit', e => {
      e.preventDefault();
      const pick = document.querySelector('input[name="r8choice"]:checked');
      if (!pick) return;
      const lab = LAB[pick.value];
      const why = $('r8-why').value.trim(), info = $('r8-info').value.trim();
      const out = $('r8-result'); out.replaceChildren();
      out.append(el('h3', null, 'Your decision, reviewed'));
      const add = (h, t) => { const p = el('p', null); p.append(el('strong', null, h + ' '), document.createTextNode(t)); out.appendChild(p); };
      add('Your choice:', lab.label + '.');
      add('Your reason:', why ? '“' + why + '”' : '(none written — a decision with no stated reason is hard to review later. Worth writing one sentence.)');
      add('SEE:', lab.see);
      add('QUESTION:', lab.question);
      add('TEST:', lab.test);
      add('DECIDE:', 'You chose ' + lab.label + '. The budget allows one, so the other two wishes become next year’s question — write them down before they are forgotten.');
      add('Information you wanted:', info ? '“' + info + '” — good. A decision that names its missing information can be revisited when the information arrives.' : '(none named — before the money is spent, ask once more: what am I not being shown?)');
      add('REVIEW:', 'After one term, ask the students: did this choice fix the problem you actually saw? That last step is the one most decisions skip — and it is the step that makes the next decision better.');
    });
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORIES, STATEMENTS, checkStatement, CAUSES, CLUES, FLASHLIGHT_ANSWER,
    remainingCauses, PRODUCTS, pairKey, tradeoffOutcome, flipCoins, countHeads, longestRun,
    rollDicePairs, tallyTotals, drawCards, CLAIMS, confidenceLabel, confidenceVerdict, SCENARIOS, LAB };
}
