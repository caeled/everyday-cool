const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
// The eighteen game lessons shelved on the home page, in the page's gentlest-first order.
const LESSONS = [
  '../everyday-light/laser-mirrors-lesson.html',
  '../everyday-sound/tune-the-string-lesson.html',
  '../everyday-physics/ballast-lesson.html',
  '../everyday-physics/stage-it-lesson.html',
  '../everyday-physics/docking-lesson.html',
  '../everyday-engineering/shake-table-lesson.html',
  '../a-library/dewey-game-lesson.html',
  '../everyday-electronics/dont-cook-the-led-lesson.html',
  '../everyday-computing/wire-the-adder-lesson.html',
  '../nerd-heaven-tech-support/find-the-fault-lesson.html',
  '../map-room/go-thataway-lesson.html',
  '../everyday-chemistry/balance-it-lesson.html',
  '../secret-squares/pass-it-on-lesson.html',
  '../packet-playground/route-it-lesson.html',
  '../decisions-everywhere/the-boring-bet-wins-lesson.html',
  '../satellite-watch/catch-the-pass-lesson.html',
  '../everyday-measure/anchors-lesson.html',
  '../nerd-heaven-tech-support/corrected-by-halves-lesson.html',
];

test('the home page shelves all eighteen game lessons', () => {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const href of LESSONS) {
    assert.ok(home.includes(`href="${href}"`), `index.html links ${href}`);
  }
});

test('every game-lesson link resolves to a real lesson page', () => {
  for (const href of LESSONS) {
    const target = path.resolve(ROOT, href);
    assert.ok(fs.existsSync(target), `${href} resolves to a file`);
    assert.match(fs.readFileSync(target, 'utf8'), /<title>/, `${href} is an HTML page with a title`);
  }
});
