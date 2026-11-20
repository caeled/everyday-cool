# Sources & limitations — Everyday Engineering

Everything interactive in this room is computed in the visitor's browser from rules baked into `engineering.js`. The page sends nothing anywhere. This file records where the room's facts come from and where its models stop.

## The physics

- **Lever:** mechanical advantage = effort arm ÷ load arm; effort = load ÷ MA. Standard statics (torque balance about the fulcrum), as treated in Wikipedia's *Mechanical advantage* and *Lever* articles.
- **Pulley:** with *n* rope segments supporting the moving block, each segment carries load ÷ *n*; effort = load ÷ *n* and rope pulled = *n* × lift height. Ideal-machine treatment; see *Block and tackle*.
- **Ramp:** the effort along a frictionless incline of angle θ is load × sin θ; ramp length for a rise *h* is *h* ÷ sin θ. See *Inclined plane* — which also covers the friction the bench leaves out, as the page says.
- **Frames:** a triangle's angles are determined by its side lengths (SSS congruence), so a pin-jointed triangle cannot change shape without changing a side; a four-sided frame can rack into a parallelogram at constant side lengths. The bench models exactly this geometry and nothing about material strength.
- **Weights as kilograms of push:** the benches speak of a load's mass and the "kilograms of push" it takes, converting to newtons (× 9.81) alongside. That is the workshop convention of the whole STEM bench — a bathroom-scale way of feeling force — not a claim that mass and force are the same unit.

## The log table

The mantissas are the common (base-10) logarithms of 1.0–10.0 in steps of 0.1, rounded to four decimal places — the form printed tables carried from Napier's successors through the twentieth century (the room dates the era 1614 to the 1970s, from the first published tables to the electronic calculator's arrival). The lookup method is the historical one: characteristic from the number's power of ten, mantissa from the table, and **linear interpolation (proportional parts)** between entries. Linear interpolation of a curved function is an approximation: across a 0.1 step it can sit about one unit in the fourth decimal off the true log (the page's worked example, log 2.53, shows exactly this: .4030 by the table, .4031 true). The bench deliberately computes by the table's method rather than calling a calculator function, so the wobble is visible instead of hidden; `test.cjs` bounds it at two fourth-decimal units.

## The ramp standard

The wheelchair-ramp figure — a maximum slope of **1:12** (one unit of rise per twelve units of run, ≈ 4.76°) — is the long-standing accessibility standard for new ramps in the United States (the ADA Standards for Accessible Design, §405.2: "Ramp runs shall have a running slope not steeper than 1:12"). The room states it as the standard it is; local rules and older buildings vary, and the room does not present itself as building advice.

## The links shelf

Twelve destinations in three groups, each opened and verified live (HTTP 200) on 19 November 2026: eleven Wikipedia articles — *Simple machine*, *Lever*, *Wheel and axle*, *Pulley*, *Block and tackle*, *Inclined plane*, *Wedge*, *Screw (simple machine)*, *Mechanical advantage*, *Logarithm*, *Slide rule* — and Explain That Stuff's *Simple machines* explainer. They are pointers to living pages, not preserved content; their text belongs to their editors and publishers and will change on their schedules. (Encyclopaedia Britannica's simple-machine article was considered and left off: it refuses automated checks with a 403, so it could not be verified the way this collection verifies a link.)

## Scope lines, stated rather than silent

- The benches are **ideal machines**: no friction, no flex, no rope stretch, no slipping fulcrums. The page says so at every bench, and the "Honest limits" Help card repeats it. Real rigs need more effort than the readouts show.
- The pulley bench rigs **one to four segments** — enough to teach the count. Real block-and-tackle work runs higher, with efficiency losses per wheel that the bench's friction note names but does not model.
- The frames bench models **geometry only**. Whether a real frame stands also depends on its joints, its material, and its fasteners; the page's fine print says so.
- Rigging and lifting safety lines on the page (never stand under a hoisted load; chock and block; eye protection for struck tools) are the room's own plain statements of standard workshop practice, not a substitute for training.
