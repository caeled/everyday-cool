/* prefers-reduced-motion: paint a static frame, then pause rAF loops */
(function(){try{if(typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){var r=window.requestAnimationFrame.bind(window),n=0;window.requestAnimationFrame=function(c){if(n>=2)return 0;n+=1;return r(c);};}}catch(e){}})();
'use strict';
/* Stack-a-Bot: screen, clock, and keys for the Games Room.
   All rules live in stackabot.js; this file listens, updates, and draws. */
const CELL = 30;
const boardCv = document.getElementById('board');
const btx = boardCv.getContext('2d');
const nextCv = document.getElementById('next');
const ntx = nextCv.getContext('2d');
const el = id => document.getElementById(id);
const scoreEl = el('score'), linesEl = el('lines'), levelEl = el('level'),
  statusEl = el('game-status'), robotEl = el('robot-status');

let board, queue, current, nextType, score, lines, state, dropMs, lastTime, rafId;

function refill() { while (queue.length < 7) queue.push(...makeBag(Math.random)); }
function spawn() {
  const type = nextType;
  nextType = queue.shift(); refill();
  const size = PIECES[type].size;
  current = { type, rot: 0, x: Math.floor((COLS - size) / 2), y: type === 'I' ? -1 : 0 };
  if (collides(board, pieceCells(type, 0), current.x, current.y)) { gameOver(); }
  drawNext();
}
function startGame() {
  board = emptyBoard(); queue = []; refill();
  nextType = queue.shift(); refill();
  score = 0; lines = 0; state = 'playing'; dropMs = 0; lastTime = null;
  el('start').textContent = 'Restart';
  spawn(); updatePanel('A fresh stack of parts. Good luck, builder.');
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(tick);
}
function gameOver() {
  state = 'over';
  updatePanel(`Game over. You scored ${score} and built ${robotProgress(lines).robots} whole robot(s). Press Start to stack again.`);
}
function tick(t) {
  if (state !== 'playing') return;
  if (lastTime === null) lastTime = t;
  dropMs += t - lastTime; lastTime = t;
  const interval = dropInterval(levelFor(lines));
  if (dropMs >= interval) { stepDown(); dropMs = 0; }
  draw();
  rafId = requestAnimationFrame(tick);
}
function tryMove(dx, dy, rot) {
  const r = rot !== undefined ? rot : current.rot;
  const cells = pieceCells(current.type, r);
  if (!collides(board, cells, current.x + dx, current.y + dy)) {
    current.x += dx; current.y += dy; current.rot = r; return true;
  }
  return false;
}
function tryRotate() {
  const r = (current.rot + 1) % 4;
  for (const kick of [0, -1, 1, -2, 2]) if (tryMove(kick, 0, r)) return;
}
function stepDown() { if (!tryMove(0, 1)) lockPiece(); }
function hardDrop() {
  let fell = 0;
  while (tryMove(0, 1)) fell++;
  score += fell * 2; lockPiece();
}
function lockPiece() {
  board = merge(board, pieceCells(current.type, current.rot), current.x, current.y, current.type);
  const before = robotProgress(lines);
  const res = clearLines(board);
  board = res.board;
  if (res.cleared > 0) {
    lines += res.cleared;
    score += scoreFor(res.cleared, levelFor(lines));
    const now = robotProgress(lines);
    if (now.robots > before.robots) updatePanel(`Robot complete! That's ${now.robots} built. A fresh robot rolls onto the bench.`);
    else if (now.partsLit > before.partsLit) updatePanel(`Part lit: the robot's ${now.litNames[now.partsLit - 1].toLowerCase()} glows.`);
  }
  updatePanel(); spawn(); draw();
}
function ghostY() {
  let y = current.y;
  while (!collides(board, pieceCells(current.type, current.rot), current.x, y + 1)) y++;
  return y;
}
function drawCell(ctx, x, y, color, ghost) {
  ctx.globalAlpha = ghost ? 0.25 : 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4, 5);
  ctx.fill();
  ctx.globalAlpha = 1;
}
function draw() {
  btx.fillStyle = '#101f30';
  btx.fillRect(0, 0, boardCv.width, boardCv.height);
  btx.strokeStyle = 'rgba(127, 221, 219, 0.08)';
  for (let x = 1; x < COLS; x++) { btx.beginPath(); btx.moveTo(x * CELL, 0); btx.lineTo(x * CELL, boardCv.height); btx.stroke(); }
  for (let y = 1; y < ROWS; y++) { btx.beginPath(); btx.moveTo(0, y * CELL); btx.lineTo(boardCv.width, y * CELL); btx.stroke(); }
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
    if (board[y][x]) drawCell(btx, x, y, PIECES[board[y][x]].color, false);
  if (current && state !== 'over') {
    const cells = pieceCells(current.type, current.rot);
    const gy = ghostY();
    for (const [cx, cy] of cells) if (gy + cy >= 0) drawCell(btx, current.x + cx, gy + cy, PIECES[current.type].color, true);
    for (const [cx, cy] of cells) if (current.y + cy >= 0) drawCell(btx, current.x + cx, current.y + cy, PIECES[current.type].color, false);
  }
  if (state === 'over') {
    btx.fillStyle = 'rgba(8, 18, 28, 0.72)'; btx.fillRect(0, 0, boardCv.width, boardCv.height);
    btx.fillStyle = '#f5c369'; btx.font = '700 30px system-ui'; btx.textAlign = 'center';
    btx.fillText('STACKED OUT', boardCv.width / 2, boardCv.height / 2);
  }
}
function drawNext() {
  ntx.fillStyle = '#101f30'; ntx.fillRect(0, 0, nextCv.width, nextCv.height);
  if (!nextType) return;
  const cells = pieceCells(nextType, 0), size = PIECES[nextType].size, s = 22;
  const ox = (nextCv.width - size * s) / 2, oy = (nextCv.height - size * s) / 2;
  ntx.fillStyle = PIECES[nextType].color;
  for (const [cx, cy] of cells) { ntx.beginPath(); ntx.roundRect(ox + cx * s + 1, oy + cy * s + 1, s - 2, s - 2, 4); ntx.fill(); }
}
function updatePanel(message) {
  scoreEl.textContent = score; linesEl.textContent = lines; levelEl.textContent = levelFor(lines);
  const rp = robotProgress(lines);
  document.querySelectorAll('#robot-svg .part').forEach((g, i) => g.classList.toggle('lit', i < rp.partsLit));
  robotEl.textContent = rp.partsLit === 0 && rp.robots === 0
    ? 'The bench robot is dark. Clear 2 rows to light its antenna.'
    : `Robots built: ${rp.robots}. This robot has ${rp.partsLit} of 6 parts lit` +
      (rp.nextPart ? `; ${rp.linesToNextPart} more row(s) lights the ${rp.nextPart.toLowerCase()}.` : '.');
  if (message) statusEl.textContent = message;
}
el('start').addEventListener('click', startGame);
el('pause').addEventListener('click', () => {
  if (state === 'playing') { state = 'paused'; updatePanel('Paused. Press Resume when you are ready.'); el('pause').textContent = 'Resume'; }
  else if (state === 'paused') { state = 'playing'; lastTime = null; el('pause').textContent = 'Pause'; rafId = requestAnimationFrame(tick); }
});
document.addEventListener('keydown', e => {
  if (state !== 'playing') return;
  const k = e.key;
  if (k === 'ArrowLeft') { tryMove(-1, 0); draw(); }
  else if (k === 'ArrowRight') { tryMove(1, 0); draw(); }
  else if (k === 'ArrowDown') { if (tryMove(0, 1)) score += 1; draw(); }
  else if (k === 'ArrowUp' || k === 'x' || k === 'X') { tryRotate(); draw(); }
  else if (k === ' ') { e.preventDefault(); hardDrop(); }
  else return;
  if (k.startsWith('Arrow')) e.preventDefault();
  updatePanel();
});
document.querySelectorAll('[data-move]').forEach(btn => btn.addEventListener('click', () => {
  if (state !== 'playing') return;
  const m = btn.dataset.move;
  if (m === 'left') tryMove(-1, 0);
  else if (m === 'right') tryMove(1, 0);
  else if (m === 'down') { if (tryMove(0, 1)) score += 1; }
  else if (m === 'rotate') tryRotate();
  else if (m === 'drop') hardDrop();
  draw(); updatePanel();
}));
board = emptyBoard(); state = 'idle'; draw(); updatePanel('Press Start, then steer the falling parts with the arrow keys.');
