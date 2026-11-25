# 📦 The Baton Box

**A small relay server for pass-and-play games — games you play together,
but not at the same time.**

One person (the *host*) runs the box on their computer. It keeps every
game's place: **whose turn it is**, and the game's current **state blob**
(a chunk of text the game itself makes when you export — the box never
reads inside it). Players open the box in any browser on the same
network, take their turn in the game, paste the new blob back, and the
baton passes to the next player. Turns can take five minutes or five
days.

The box understands **no game**. Any game that can pack its state into a
blob and say whose turn is next can ride it. **The Relay** — Steven
Powell's asynchronous courier-bot game — is passenger #1, not the only
one. The full author contract is in [CONTRACT.md](CONTRACT.md).

Zero dependencies: **Python 3 standard library only.** No build step, no
internet needed, works on Windows, Mac, and Linux.

---

## Quickstart

**Host (once, ~5 minutes):**

1. Install Python 3 if you don't have it — free from
   [python.org](https://www.python.org/downloads/). On Windows, tick
   **“Add Python to PATH”** during install.
2. Keep this `baton-box` folder together somewhere simple (Desktop is
   fine).
3. Start the box:
   - **Windows:** double-click `start-baton-box.bat`
   - **Mac/Linux:** in a terminal in this folder, `python3 baton_box.py`
     (plain `python baton_box.py` also works on many systems)
4. The box prints its addresses and serves a home page at
   **`http://<host-address>:8917`** (default port **8917**; override
   with the `BATON_BOX_PORT` environment variable). Leave the window
   open while you play — that window *is* the box. Ctrl+C or closing it
   puts the box away; games are saved and return next start.

**Players:** join the host's Wi-Fi, open the address, type the 6-letter
**game code**, play. The box's own [/help page](#) (served at `/help`)
explains every step in plain words — it's written for a family at a
kitchen table or a teacher with ten minutes before class, and it's the
same text summarized below.

## How a game flows

**Create** (home page): pick the game, name the session, list player
names in turn order, and optionally paste a first state blob. If you
leave the blob blank, the first player starts a fresh game in the game
page and hands back the first blob — the box handles both.

**Join**: enter the session code → the session page says, big and
clear, whose turn it is.

**Take a turn**: the session page shows the current blob with a one-tap
**Copy** button and numbered steps: copy the code → open the game
(served by the box at `/games/the-relay.html`) → use the game's
**Import** → play → use the game's **Export Code**.

**Hand back**: paste the new blob on the session page. The box stores
it, remembers the last 10 blobs, and advances the turn to the next
player. If the session changed after you loaded it (two people played
from the same blob), the box refuses with a plain-language warning and
lets a human choose: replace, or reload and replay. Last write wins
only when a person says so.

## The contract, in one breath

A session is `{gameId, code, title, players[], turnIndex, state,
updatedAt, history}`. The box stores and forwards; it **never parses
state**. A game qualifies if it can (1) pack its state into a text blob,
(2) list its players in turn order, (3) serve one page that imports and
exports blobs, and (4) drop a tiny `manifest.json` in `games/<game>/`.
**No changes to `baton_box.py` to add a game** — the self-test proves
it with a dummy game registered by manifest alone. Details, the
manifest format, and the JSON API: [CONTRACT.md](CONTRACT.md).

## Files

| File | Size | What it is |
|---|---|---|
| `baton_box.py` | 36,372 B | The whole server: storage, API, and all pages (home, session, help, host list), inline. Stdlib only. |
| `games/the-relay/the-relay.html` | 85,725 B | A **copy** of The Relay client, served by the box. See provenance below. |
| `games/the-relay/manifest.json` | 343 B | The Relay's manifest — passenger #1. |
| `CONTRACT.md` | 5,550 B | The contract for future game authors + API reference. |
| `selftest.py` | 8,700 B | End-to-end HTTP self-test (see results below). |
| `start-baton-box.bat` | 419 B | Windows double-click starter. |
| `sessions.json` | *(created at runtime)* | All sessions, written atomically after every change. This is the backup file — copy it somewhere safe now and then. Delete it to empty the box. |

## The Relay copy — provenance

`games/the-relay/the-relay.html` is a byte-for-byte **copy** of the
collection's client, made 2026-11-24 so the box can serve the game on
the local network:

- Source: `~/workspace/everyday-cool/projects/nerd-heaven-tech-support/the-relay.html`
  (the Everyday Cool collection remains the authoritative version)
- sha256: `db090d66934ab146ac96be0dcb545a90938e2e7a64cfb811ffa29c0634dcf996`
- The self-test re-verifies the served bytes against this hash.

If the collection's Relay is updated, re-copy the file here and update
the hash above.

## Test results

`python3 selftest.py` — copies the box to a throwaway folder, registers
a dummy game (`test-echo`) by manifest only, starts the server on a
test port, and drives the full loop over real HTTP. **20/20 passed**
(2026-11-24):

- server starts; shelf lists `the-relay` **and** manifest-only `test-echo`
- home and help pages serve; the served Relay page is byte-identical
- create → 6-char code, first turn correct → load blob → hand back
  advances the turn and stores the new blob → second player loads the
  advanced state
- stale hand-back refused (HTTP 409) and changes nothing; forced
  hand-back succeeds and wraps the turn
- play page renders whose turn it is; a session runs for the dummy game
- `sessions.json` written; **session survives a full server restart**

## Honest limits

- **Same network by default.** Players must reach the host's machine
  (same Wi-Fi/LAN). School/office networks sometimes isolate devices;
  a home network or hotspot usually fixes it.
- **The host machine must be on**, with the box window open, while
  anyone loads or hands back. Between turns it can sleep for days —
  the state waits in `sessions.json`.
- **Honor system, not a bank vault.** No passwords. Anyone on the
  network with a session code can view that session's blob and hand
  back a turn. Never put secrets in a state blob.
- **The box doesn't know any game's rules.** A nonsense blob is carried
  faithfully and only rejected by the game on import.
- **One named compromise:** the box does *not* deep-link a blob into
  The Relay. The collection's client (which this project serves
  unmodified, on purpose) has no URL/fragment import hook — its import
  is a paste box. So a turn is: **copy** (one tap, on the session page)
  → open the game → **paste** into Import. Two extra taps, documented
  in the steps on every session page and in the help notes. If a future
  client adds a `#import=` hook, the box can grow a deep link without
  changing the contract.
