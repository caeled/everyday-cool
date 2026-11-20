# Collection origin

Original Everyday Cool workshop, added 18 November 2026 at Steven Powell's request. "Everyday Physics" was the last of the science trio Steven named in the Everyday Cool ideas side chat (Everyday Chemistry and Everyday Electronics were built the same day); he shaped this room himself — a pool table with angle, reflection, and force demonstrated in a real game, and simple ballistics in the Angry Birds style — and added the standing request, set by the Electronics shelf, that the room carry the same kind of Wikipedia STEM links ("Read deeper"). Built by Muse (AI assistant) and added directly to the collection at his direction; this folder is the maintained original, and there is no upstream copy.

The room follows the Games Room / Radio Room shape (a verified shelf of legitimate places, things that work right on the page, a short workshop underneath) and the Find It / Radio Room pattern (Help ▾ menu with full documentation, banner verified on the page and inside the desktop app). The updated Everyday Cool desktop app ships as app v1.0.14 through the app repo's existing build workflow.

The two centrepieces are Steven's, and the physics on them is drawn, not hidden: the pool table's ghost line labels the equal angles at a cushion and shows the struck ball's direction and the cue ball's leftover path before the shot is taken, and its collisions exchange exactly the velocity components along the line of centres, so momentum is seen to hand over rather than merely asserted. The launcher keeps its shots on the range for comparison and states its one big simplification — no air resistance — on the page, in the Help, and here. The simulation scales are kept honest in the open: the launcher and pendulum use real metres, seconds, and g = 9.8 m/s²; the pool table's speeds are in its own pixel-per-frame units and the page says so.

Everything interactive is computed in the visitor's browser from the rules in `phys.js` — the page sends nothing anywhere.

The rules live in `phys.js` (no DOM), checked by `test.cjs`.

Banner: `everyday-physics-banner.jpg`, AI-generated watercolor — a friendly robot with safety goggles pushed up on its head, lining up a pool shot on a small green pool table, dotted trajectory lines and angle marks over the felt, a little wooden ballistics launcher beside the table with a dotted arc over it — generated 18 November 2026 as part of adding this room, in the style and dimensions (2736×912) of the collection's other banners.

Local change (18 November 2026, later): review fixes — the pool table and launcher now advance on a fixed 1/60 s timestep from elapsed time (large dt clamped when a tab resumes); the pendulum gained a swing-width slider whose wide swings use the standard large-angle period correction, defaulting to a 12° swing; Keep Going gained Satellite Watch (Radio was already linked); reduced-motion preferences pause the always-running canvases. Recorded here as part of the same-day review pass.

Documentation update, 20 November 2026: `index.html`, `style.css`, `README.md`, and `COLLECTION.md` gained a professional documentation treatment — a Source on GitHub link in the Help menu, a documentation lede and action bar in the Help section, matching styles, and a Documentation section in the README — at Steven Powell's direction ('the documentation section is the only part that doesn't look like a real program'). No bench, lesson, or behaviour changed.

The same documentation update also added a Steve's Profile link (Steven Powell's LinkedIn) at the foot of the Help section — `index.html` and `style.css`.
