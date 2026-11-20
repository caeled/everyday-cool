# Everyday Physics

An Everyday Cool workshop built around two playable games with the physics drawn on top: a pool table that shows reflection angles and momentum hand-over as they happen, and a ballistics launcher that draws every flight as gravity's one curve. Underneath: a pendulum bench, a seesaw bench, four kitchen-table experiments, and a verified links shelf with a Wikipedia "read deeper" group.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Physics.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-physics)

## What's inside

- **The pool table** — a top-down canvas table with a cue ball and four object balls. Aim by slider or by tapping the table; a power slider sets the shot. While the balls rest, a ghost line draws the shot in advance: at a cushion, the reflected path with the incoming and outgoing angles measured (from the cushion's face) and labelled equal; at a ball, the struck ball's direction along the line of centres (gold) and the cue ball's leftover sideways path (faint). Balls roll with a steady friction slow-down, cushion bounces mirror the velocity component, and ball-to-ball collisions are elastic between equal masses — the components along the line of centres are exchanged, so momentum visibly hands over. A readout names what just happened after each bounce or hit; speed arrows are toggleable; Pause and Step-one-frame let you watch a collision happen slowly. Balls can be potted (a scratched cue ball returns to the head spot), but there are no turns or scoring — the overlays are the game. Simplifications are stated on the page: no spin, no throw, steady-share friction, equal masses, and speeds in the table's own pixel-per-frame units.
- **The ballistics launcher** — Angry Birds rules on an honest scale: a 60-metre range in real metres and seconds, g = 9.8 m/s², no air resistance (stated on the page). Angle and speed sliders, a dotted trajectory drawn as it flies and kept after landing (up to four shots in different colours), live and final readouts (angle, speed, apex, flight time, range), a crate stack target at 45 m, and a "same speed, three angles" compare button that draws 30°/45°/60° side by side and states the plain truths: 45° goes farthest at the same speed; partner angles around 45° land together; steeper is higher and shorter.
- **The pendulum** — a swinging pendulum whose period is computed from its string length, T = 2π√(L/g), with a swing-width slider (default 12°, up to 60°) that applies the standard large-angle correction so a wide swing honestly runs a little long, and bob-weight buttons that change the bob and pointedly change nothing else. The lesson: period follows length first; weight does not appear; width only matters when the swing is wide. The pool table and launcher animations use a fixed 1/60 s timestep from elapsed time (large dt is clamped when a tab resumes) so their speed does not depend on the display's refresh rate; if the device asks for reduced motion, the pendulum hangs still and the other canvases rest when nothing is moving.
- **The seesaw** — a 40 kg weight against a 20 kg weight on a beam, position sliders in steps from the middle; balance is weight × distance against weight × distance, both products printed, with the light weight's balancing distance worked out. The lesson: a small weight far out balances a big weight close in.
- **Experiment cards** — four, in the Chemistry/Electronics card shape (needs, numbered steps, what it shows, safety line): the balloon rocket (action and reaction), the egg drop (momentum spread over time), the paper airplane lab (fair testing — one change at a time, three flights, the middle score), and pendulum painting (the swing's plane drawn in paint). Nothing with fire, nothing thrown at people, nothing higher than a chair.
- **Links out** — four destinations verified live on 18 November 2026 (PhET Projectile Motion, PhET Collision Lab, The Physics Classroom, Khan Academy Physics) plus the "Read deeper — Wikipedia" group Steven asked for on the Electronics pattern: Physics, Classical mechanics, Projectile motion, Momentum — all verified the same day.
- **How physics works here** — a brief plain-language workshop: reflection, momentum hand-over, gravity's one curve, the pendulum's one variable, and torque.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the pool table, the launcher, the pendulum, the seesaw, the experiment cards, safety plainly, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Electronics (the bench next door), Everyday Chemistry, The Radio Room (whose ham & CB shelf this room's Keep Going names), Tonight's Sky, Satellite Watch (gravity taken all the way around), and The Games Room (the shape cousin: shelf + things that work on the page + workshop).

## Run it

Open `index.html` in a browser. The games, benches, and cards work fully offline — they are arithmetic and drawing. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (reflection, the pool step, equal-mass collisions, projectile range/apex/flight-time, the pendulum period including the large-angle correction, seesaw torque, and the animation timestep helpers) live in `phys.js` with no DOM code, so Node can check them directly. The tests assert, among other things, that a cushion bounce keeps the incoming angle equal to the outgoing angle on both axes, that a head-on equal-mass hit swaps the velocities outright, that a glancing hit conserves momentum and energy, that 20 m/s at 45° ranges 40.82 m and beats both 30° and 60° (which land together), that a 1 m pendulum's small-swing period is about 2.01 s and a 60° swing runs longer (factor ≈ 1.0732), that a tab-resume dt is clamped, and that 40 kg at 1 step balances 20 kg at 2 steps.

## Files

- `index.html` — the room itself
- `phys.js` — pure rules: reflection and angles, the pool step, equal-mass collisions, projectile sums, the pendulum period, seesaw torque
- `app.js` — the wiring: the pool table, the launcher, the pendulum, and the seesaw canvases and controls
- `style.css` — the room's styling (shared Everyday Cool room styling plus the canvas benches)
- `everyday-physics-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
