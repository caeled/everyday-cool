'use strict';
/* Stack-a-Bot: pure game logic for the Everyday Cool Games Room.
   Falling tetrominoes ("crates of robot parts") on a 10 x 20 board.
   No DOM here, so the rules can be tested in Node (see test.cjs). */
const COLS = 10, ROWS = 20;
const PIECES = {
  I: { size: 4, color: '#7fdddb', cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  O: { size: 2, color: '#f5c369', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  T: { size: 3, color: '#c792ea', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  S: { size: 3, color: '#8fd18b', cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  Z: { size: 3, color: '#ef8f8f', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  L: { size: 3, color: '#f0a35e', cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
  J: { size: 3, color: '#7fb2e5', cells: [[0, 0], [0, 1], [1, 1], [2, 1]] }
};
const TYPES = Object.keys(PIECES);
const SCORES = [0, 100, 300, 500, 800];
const ROBOT_PARTS = ['Antenna', 'Head', 'Eyes', 'Body', 'Arms', 'Legs'];
const LINES_PER_PART = 2;
const LINES_PER_ROBOT = ROBOT_PARTS.length * LINES_PER_PART;

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}
function rotateCells(cells, size) {
  return cells.map(([x, y]) => [size - 1 - y, x]);
}
function pieceCells(type, rotation) {
  const p = PIECES[type];
  let cells = p.cells.map(c => [...c]);
  for (let r = 0; r < ((rotation % 4) + 4) % 4; r++) cells = rotateCells(cells, p.size);
  return cells;
}
function collides(board, cells, ox, oy) {
  return cells.some(([cx, cy]) => {
    const x = ox + cx, y = oy + cy;
    return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x] !== null);
  });
}
function merge(board, cells, ox, oy, type) {
  const next = board.map(row => [...row]);
  for (const [cx, cy] of cells) {
    const x = ox + cx, y = oy + cy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = type;
  }
  return next;
}
function clearLines(board) {
  const kept = board.filter(row => row.some(cell => cell === null));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null));
  return { board: kept, cleared };
}
function scoreFor(cleared, level) {
  return (SCORES[cleared] || 0) * level;
}
function levelFor(totalLines) {
  return Math.floor(totalLines / 10) + 1;
}
function dropInterval(level) {
  return Math.max(80, 800 - (level - 1) * 70);
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeBag(rng) {
  const bag = [...TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}
function robotProgress(totalLines) {
  const robots = Math.floor(totalLines / LINES_PER_ROBOT);
  const into = totalLines % LINES_PER_ROBOT;
  const partsLit = Math.floor(into / LINES_PER_PART);
  return {
    robots,
    partsLit,
    litNames: ROBOT_PARTS.slice(0, partsLit),
    nextPart: partsLit < ROBOT_PARTS.length ? ROBOT_PARTS[partsLit] : null,
    linesToNextPart: partsLit < ROBOT_PARTS.length ? LINES_PER_PART - (into % LINES_PER_PART) : 0
  };
}
if (typeof module !== 'undefined') module.exports = {
  COLS, ROWS, PIECES, TYPES, SCORES, ROBOT_PARTS, LINES_PER_PART, LINES_PER_ROBOT,
  emptyBoard, rotateCells, pieceCells, collides, merge, clearLines,
  scoreFor, levelFor, dropInterval, mulberry32, makeBag, robotProgress
};
