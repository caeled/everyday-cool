# Collection origin

Original Everyday Cool workshop, added 15 November 2026 at Steven Powell's request ("a games room filled with links to legit sites with online games... maybe a brief workshop with building a simple game info about games development then maybe an asteroids or Tetris variation to play right from it"). Built by Muse (AI assistant) in the main chat and added directly to the collection at his direction; this folder is the maintained original, and there is no upstream copy.

The playable game is Stack-a-Bot, a Tetris variation: falling crates of robot parts, and every two cleared rows lights another part of a bench robot. Its rules live in `stackabot.js` (no DOM), checked by `test.cjs`.

Banner: `games-banner.jpg`, AI-generated watercolor (robots at an arcade cabinet, stacking giant blocks), generated 15 November 2026 as part of adding this room, in the style of the collection-wide banner pass of the same day.

The eleven game shelves and three learning links were each verified live on 15 November 2026 (HTTP 200; lichess.org answers 200 to a browser user agent and 403 to a bare script, a bot wall rather than a dead link). Their terms notes (ads, accounts, subscriptions) are as observed that day and are re-stated in `THIRD-PARTY.md`.

Local changes to imported files: none (no files were imported; all files originate here).

Documentation update (20 November 2026): at Steven Powell's direction, `index.html` gained a professional Documentation & source panel with the room README, GitHub source, sources and limitations, workshop download, collection documentation index, and curator profile link. Changed files: `index.html`, `COLLECTION.md`. The addition is documentation and navigation only; no lesson content or workshop behaviour was changed.

Game Table link added (20 November 2026): `index.html` and `COLLECTION.md` — the Tensor-Tris section gained a link across to the Physics Game Table in Everyday Physics (`../everyday-physics/physics-game-table.html`), the portal page whose Tensor-Tris card points back at this room's copy of the game. No game, lesson, or behaviour changed.

Lesson added, 20 November 2026: `tensor-tris-lesson.html`, `README.md`, and `COLLECTION.md`. Tensor-Tris gained its back door: a lesson page covering the game's real mathematics — pieces as matrices, the (x, y) → (−y, x) rotation transform, authentic SRS wall kicks, the 7-bag randomiser, T-spin detection, and the heuristic evaluator whose feature-weight dot product powers the Copilot hint — and naming the name-vs-reality gap plainly: the code's highest-rank array is rank 2, nothing is trained, and the score's "FLOPs" are points, not operations.
