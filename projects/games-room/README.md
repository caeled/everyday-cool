# The Games Room

An Everyday Cool workshop about games: where to play them honestly, one to play right here, and how they are built.

## What's inside

- **The game shelves** — eleven legitimate places to play online (the Internet Archive's arcade and MS-DOS library, AARP Games, Lichess, Pogo, MSN Play, NYT Games, Poki, CrazyGames, Kongregate, and itch.io's browser games), each card stating who runs it and what "free" really means there.
- **Stack-a-Bot** — a falling-parts game (Tetris-style) that runs on the page. Clear rows to light up a bench robot, one part per two rows; twelve rows completes it. Keyboard and touch controls.
- **The build-a-game workshop** — the listen-update-draw loop and the five ingredients of a game, mapped to Stack-a-Bot's own code, with three one-line changes to try.

## Run it

Open `index.html` in a browser. No server, no build step, no network needed for the game and workshop; the shelves link outward.

## Tests

```
node test.cjs
```

The rules (pieces, rotation, collision, line clears, scoring, the 7-bag, the bench robot) live in `stackabot.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `stackabot.js` — pure game rules
- `app.js` — canvas, clock, keys, and the bench robot display
- `style.css` — the room's styling
- `games-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `tensor-tris.html` — Tensor-Tris, the matrix-block arcade game (built with Google Antigravity, supplied by Steven; also dealt at the Physics Game Table)
- `tensor-tris-lesson.html` — the game's lesson page: the matrix mathematics it really runs on, and the name-vs-reality audit (there are no tensors in Tensor-Tris)
- `zenith-othello.html` — Zenith Othello, the self-learning Reversi tribute (built by Gemini Neon at Steven's direction, recreating his father Henry's Heathkit-Zenith program): an 11-weight evaluator plus an experience book, learning from human games and self-play alike, integrated unchanged
- `zenith-othello-lesson.html` — the game's lesson page: the family history, how the learning actually works, and the audit (the tabula rasa is literal — eleven zeros; the trained brain beats the greedy benchmark 90% to the untrained 21%)
- `zenith-chess.html` — Zenith Chess, the self-learning chess engine (built by Gemini Neon at Steven's direction): every piece starts worth 1.0 and piece values + square tables are discovered from game outcomes alone, integrated unchanged except one Steven-directed adjustment (21 November 2026): watched self-play speeds slowed to 1–2.5 s a move so a game can be followed
- `zenith-chess-lesson.html` — the game's lesson page: perft-verified rules, the learning method, and the audit's learned-values table (after 5,000 self-play games: N 1.68, B 2.69, R 4.24, Q 4.11 against the conventional 3/3/5/9)
- `test.cjs` — rule tests
