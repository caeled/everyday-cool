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
- `test.cjs` — rule tests
