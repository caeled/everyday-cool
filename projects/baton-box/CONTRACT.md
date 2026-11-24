# The Baton Box Contract

*For game authors: what your game must do to ride the Baton Box, and what
the box promises in return. Written plain, because the next author might
be a kid with a good idea.*

## The one idea

The Baton Box is a relay server for **pass-and-play games**: games where
players take turns *at different times*, never all at once. The box holds
each game's place — whose turn it is, and the game's current state — and
hands it to the next player when they show up.

**The box understands no game.** It never looks inside your state. It
stores it, forwards it, and keeps the turn order. That is the whole
design, and it is why any game that fits the contract below can ride.

## What your game must provide

1. **A state blob.** Your whole game-in-progress, packed into a single
   string of text that your game can produce ("export") and read back
   ("import"). The Relay's blob is a base64 *Relay Code*; yours can be
   JSON, base64, or any text format your game likes. Practical limits:
   keep it under ~1 MB and made of ordinary text. The blob should carry
   whatever your game needs to resume exactly — board, scores, and,
   ideally, whose turn your game thinks it is (the box tracks turn order
   too, and the two should agree).
2. **A player list, in turn order.** Plain names, given when a session
   is created. The box advances the turn by one name per hand-back,
   wrapping around. 2–12 players.
3. **A single web page** (one self-contained HTML file is the house
   style — no external requests, works offline) with a way for a player
   to **import** a blob and **export** the new blob when their turn
   ends.
4. **A manifest** (see below). That's it. No changes to `baton_box.py`
   are needed — or allowed — to add a game.

## What the box guarantees

- **Storage.** Every hand-back is written to `sessions.json` beside the
  server, atomically (write-then-rename), so a crash or restart mid-save
  does not corrupt the games. Sessions survive restarts.
- **Turn order.** One hand-back advances the turn exactly one player.
  The box remembers the last 10 blobs per session as history.
- **Join codes.** Each session gets a short, human-friendly 6-character
  code (no look-alike characters like 0/O or 1/I).
- **Stale-write warning.** If a player hands back a blob based on an
  older state than the current one, the box refuses with HTTP 409 and
  the UI explains, in plain words, and lets the player choose: replace,
  or reload and replay. Last write wins only when a human says so.
- **Serving.** Your game's page is served at `/games/<your-page>` on the
  host's network, alongside the box's own pages.

## What the box does NOT do

- **No accounts, no passwords, no authentication.** Anyone on the host's
  network with a session code can view that session's blob and hand back
  a turn. It is an honor-system game box for families, friends, and
  classrooms. Never put secrets in a state blob.
- **No rules enforcement.** The box cannot tell a legal blob from
  nonsense; the game itself validates on import.
- **No internet play** by itself. The box serves the local network. (A
  host *may* expose it with their own tools; that's their call and their
  risk.)
- **No simultaneous play.** If two players play from the same blob at
  the same time, the stale-write warning is the safety net, and the
  players settle it like players.

## The manifest

Create `games/<your-game>/manifest.json` next to your page:

```json
{
  "id": "the-relay",
  "title": "The Relay",
  "page": "the-relay.html",
  "blurb": "One or two plain sentences shown on the box's home page.",
  "stateName": "Relay Code",
  "turnEnds": "paste-code",
  "players": "2-4"
}
```

| Field | Meaning |
|---|---|
| `id` | Short unique id, letters/digits/dashes. Used in the API. |
| `title` | Display name. |
| `page` | Filename of the game's page, in the same folder. |
| `blurb` | What players read on the shelf. Optional. |
| `stateName` | What your game calls its blob ("Relay Code", "save string"…). Used in the box's instructions so players hear your game's own word. Optional; defaults to "state code". |
| `turnEnds` | How a turn ends. v1 supports `"paste-code"`: the player pastes a new blob to hand back. (Future values may add deep-link hand-back for games that support it.) |
| `players` | Human-readable player range for display. Optional. |

Drop the folder in, restart (or not — the box rescans), and your game is
on the shelf. The self-test (`selftest.py`) proves this with a dummy
game, `test-echo`, registered by manifest alone.

## The API (for tools and future clients)

All JSON. Base: `http://<host>:8765`.

- `GET /api/games` — the shelf.
- `GET /api/sessions` — all sessions (summaries + current blob).
- `POST /api/sessions` — `{gameId, title, players[], state}` → `201`
  with the session, including its new `code`. `state` may be empty: the
  first player then starts fresh in the game and hands back the first
  blob.
- `GET /api/sessions/<code>` — one session.
- `POST /api/sessions/<code>/handback` — `{state, baseUpdatedAt, force}`.
  `baseUpdatedAt` is the `updatedAt` of the session when the player
  loaded it. Mismatch → `409 {error:"stale", …}` unless `force:true`.
  Success advances `turnIndex` by one and stores the blob.
- `POST /api/sessions/<code>/delete` — host housekeeping.

A session object: `{code, gameId, title, players, turnIndex,
currentPlayer, state, hasState, updatedAt, updatedHuman, createdHuman,
history:[{byPlayer, turnIndex, whenHuman}]}`.
