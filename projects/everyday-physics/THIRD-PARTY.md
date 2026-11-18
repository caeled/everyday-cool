# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data files are bundled in this folder.

## Data sources (facts, not files)

- **Reflection** — a bounce off a flat surface keeps the velocity component parallel to the surface and reverses the perpendicular component, so the angle to the surface is the same in and out. The standard treatment in every introductory mechanics text; the pool table computes it, and `test.cjs` re-checks the equality on both axes.
- **Equal-mass elastic collisions** — for two equal masses meeting elastically, the velocity components along the line of centres are exchanged and the perpendicular components are unchanged; total momentum and kinetic energy are conserved. Standard mechanics; asserted in `test.cjs` for head-on and glancing cases.
- **Projectile motion** — range R = v²·sin(2θ)/g, apex h = (v·sinθ)²/(2g), flight time t = 2·v·sinθ/g, with g = 9.8 m/s². These assume launch and landing at the same height and no air resistance — the page says so wherever the sums appear.
- **The pendulum** — T = 2π√(L/g), the small-swing approximation taught everywhere; the page and Help use "small, honest swings" wording because a widely swung real pendulum's period runs slightly long.
- **Torque and balance** — a beam balances when force × distance matches on both sides of the pivot. The seesaw's weights are masses used as weights in the everyday sense (40 kg against 20 kg under the same gravity), which the card wording keeps plain.

## Linked, not loaded (each opens in a new tab, under its own terms)

PhET Projectile Motion and PhET Collision Lab (phet.colorado.edu) · The Physics Classroom (physicsclassroom.com) · Khan Academy physics (khanacademy.org) · Wikipedia articles on Physics, Classical mechanics, Projectile motion, and Momentum (en.wikipedia.org), the "read deeper" group added at Steven's standing request on the pattern set by Everyday Electronics. Every link was checked live on 18 November 2026 and returned HTTP 200.

## Nothing is called at view time

This page makes no network calls at all: the games and benches run entirely in the browser from the rules in `phys.js`, and the shelf links are only followed when a visitor presses one.

## Limitations

The pool table is a teaching model, not a pool simulation: no spin or throw, friction as a steady share of speed lost per frame rather than cloth physics, all balls equal in mass, and speeds in the table's own units (pixels per frame), which the page states rather than converting. The launcher's world has no air, so its ranges are the longest a real throw at those numbers could never quite reach; the linked PhET Projectile Motion simulation offers the with-air comparison. The pendulum animation is timed by the same formula it teaches, so it cannot disagree with the readout — a real string, a real stopwatch, and the experiment cards are the honest check. The seesaw treats its two weights as fixed so the distance lesson stays in front. Descriptions were written on 18 November 2026; each linked site's own pages are the authority.
