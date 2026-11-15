const a = require('node:assert/strict'), g = require('./stackabot.js');

// Every piece is four squares, and rotating four times returns it to itself.
for (const t of g.TYPES) {
  a.equal(g.pieceCells(t, 0).length, 4, t);
  a.deepEqual(g.pieceCells(t, 4), g.pieceCells(t, 0), t);
}
// The O piece covers the same squares after a turn (order may differ).
const asSet = cells => cells.map(c => c.join(',')).sort();
a.deepEqual(asSet(g.pieceCells('O', 1)), asSet(g.pieceCells('O', 0)));
a.deepEqual(asSet(g.pieceCells('T', 2)), asSet([[0, 2], [1, 2], [2, 2], [1, 1]]));
// Collision: walls, floor, and settled squares all block.
const empty = g.emptyBoard();
a.equal(g.collides(empty, g.pieceCells('I', 0), 0, 18), false);
a.equal(g.collides(empty, g.pieceCells('I', 0), -1, 18), true);
a.equal(g.collides(empty, g.pieceCells('I', 0), 7, 18), true);
a.equal(g.collides(empty, g.pieceCells('I', 0), 0, 19), true);
const floor = g.merge(empty, g.pieceCells('O', 0), 0, 18, 'O');
a.equal(g.collides(floor, g.pieceCells('O', 0), 0, 18), true);
a.equal(floor[18][0], 'O'); a.equal(floor[19][1], 'O');
// Clearing: a full row vanishes, rows above fall, count is reported.
let b = g.emptyBoard();
for (let x = 0; x < g.COLS; x++) b[19][x] = 'I';
b[18][3] = 'T';
const one = g.clearLines(b);
a.equal(one.cleared, 1);
a.equal(one.board[19][3], 'T');
a.equal(one.board[18][3], null);
let b2 = g.emptyBoard();
for (const y of [18, 19]) for (let x = 0; x < g.COLS; x++) b2[y][x] = 'Z';
a.equal(g.clearLines(b2).cleared, 2);
// Scoring and levels.
a.equal(g.scoreFor(1, 1), 100); a.equal(g.scoreFor(4, 1), 800); a.equal(g.scoreFor(2, 3), 900);
a.equal(g.levelFor(0), 1); a.equal(g.levelFor(9), 1); a.equal(g.levelFor(10), 2);
a.ok(g.dropInterval(1) > g.dropInterval(5));
a.equal(g.dropInterval(99), 80);
// The 7-bag always holds each piece exactly once, and a seeded bag is repeatable.
const bag = g.makeBag(g.mulberry32(42));
a.deepEqual([...bag].sort(), [...g.TYPES].sort());
a.deepEqual(g.makeBag(g.mulberry32(7)), g.makeBag(g.mulberry32(7)));
// The bench robot lights a part every two rows and completes at twelve.
a.deepEqual([g.robotProgress(0).partsLit, g.robotProgress(0).robots], [0, 0]);
a.equal(g.robotProgress(2).partsLit, 1);
a.equal(g.robotProgress(2).litNames[0], 'Antenna');
a.equal(g.robotProgress(11).partsLit, 5);
a.deepEqual([g.robotProgress(12).robots, g.robotProgress(12).partsLit], [1, 0]);
a.equal(g.robotProgress(14).robots, 1);
a.equal(g.robotProgress(14).partsLit, 1);
console.log('Stack-a-Bot rules passed: pieces, rotation, collision, merging, line clears, scoring, levels, the 7-bag, and the bench robot.');
