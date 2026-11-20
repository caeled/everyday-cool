# Everyday Time

An Everyday Cool workshop about the one measurement nobody can see: how we carve time up, measure it, and agree on it. A sundial bench that draws a real dial for your latitude and adds up exactly why it disagrees with your clock; a leap-year machine that runs any year through the Gregorian gates; a time-zones bench that reads one UTC moment on seven walls; a ladder of durations from a heartbeat to the age of the Earth; a pendulum that swings at its true speed; and honest calendar arithmetic between any two dates.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Time.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-time)

## What's inside

- **The sundial bench** — a horizontal sundial drawn for any latitude (0–65°) by the hour-line formula tan(angle) = sin(latitude) × tan(hour angle), with six preset places (Defiance, New York, Key West, London, Anchorage, and Quito on the equator, where the bench honestly shows the dial failing — every hour line collapses onto the noon line). A second readout adds up the sundial-vs-clock difference for a chosen place and date: the equation of time plus 4 minutes per degree of longitude from the time zone's standard meridian. In Defiance the longitude term alone is −37 minutes; the bench shows both parts, not just the sum.
- **The leap-year machine** — any year run visibly through the three Gregorian gates (÷4 → leap, ÷100 → not, ÷400 → leap again), each gate showing its arithmetic and verdict. A companion card tells the two patches' history (Caesar's single gate, ten days of drift by 1582, Gregory's correction), and the summary prints the rule's own limit: 365.2425 days against the tropical year's ≈365.2422 — about a day of drift per 3,200 years.
- **The time zones bench** — one entered UTC moment (date + hour) read in seven cities at their standard offsets — Defiance & New York, Chicago, Los Angeles, London, Berlin, Tokyo, Sydney — with weekday and day-shift computed by integer day-counting, never from the visitor's clock. Daylight saving is handled as a printed confession: each city's daylight offset and rough season listed under the table, Sydney's southern reversal included.
- **The scale ladder** — eight durations from a second to the age of the Earth (4.54 billion years), each with its length in seconds and a feel-it anchor; selecting a rung shows its multiples of the rungs below. A companion card marks the week as the ladder's one purely human rung. Beside it, the **heartbeats-in-a-lifetime bench**: age × resting rate → total beats (≈3 billion at ordinary rates, and ≈3 billion seconds for the same life), with the order-of-magnitude honesty line attached.
- **The pendulum bench** — T = 2π√(L/g): a length slider (15–200 cm), the period, the ticks per hour at one tick per half-swing, and an SVG pendulum animated at the computed period — a metre's swing takes its real two seconds. The seconds pendulum (0.994 m, the grandfather clock's height) is called out when reached. The honesty line covers the small-swing approximation and temperature compensation.
- **Days between dates** — two dates → days apart, weeks and remainder, and each date's weekday, all from a days-from-civil integer algorithm in the proleptic Gregorian calendar. The Julian limit (1582; September 1752 in Britain and America) is printed on the bench.
- **Links out** — nine destinations, every one verified live on 20 November 2026, in four groups: the official time (time.gov, NIST's Time and Frequency Division); the North American Sundial Society; Wikipedia read-deeper (Sundial, Equation of time, Leap year, Pendulum, Time zone); and timeanddate's world clock and duration calculator. Royal Museums Greenwich is a fact source in THIRD-PARTY.md but not a shelf link — its pages did not answer automated checks.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (every bench, honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Earth (the day and year are its motions — and Earth's Keep Going list now links back here), Tonight's Sky (the original clock face), The Survival Guide (its shadow-stick navigation is this room's sundial stripped to a stick — linked from its direction section and its Keep Going list, both ways), Everyday Measure (a second is a measurement), and Everyday Math (the gates, the counting, and the pendulum's square root).

## Run it

Open `index.html` in a browser. Everything — benches, drawings, the swinging pendulum — runs from the files in this folder, offline. Only the Links Out shelf needs the internet.

## Tests

```
node test.cjs
```

The rules (the leap gates on 2000/1900/2024/2100, the pendulum at 1 m and 0.25 m, the seconds pendulum, day counts and known weekdays including 2026-11-20 as a Friday, time-zone readouts for known UTC moments in both day-shift directions, sundial hour-line angles by the tan formula at Defiance's latitude, the equation of time at its famous zero and extreme days, the Defiance sundial-vs-clock sum, and the lifetime-heartbeat arithmetic) live in `time.js` with no DOM code, so Node can check them directly.

## Files

- `index.html` — the room itself
- `time.js` — pure rules: sundial geometry, the equation of time, the leap gates, time zones, calendar counting, the ladder, heartbeats, the pendulum
- `app.js` — the wiring: the drawn dial, the gates display, the zone table, the ladder, the animated pendulum, the date bench
- `style.css` — the room's styling (shared Everyday Cool room styling plus the dial, gates, ladder, and pendulum)
- `everyday-time-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — rule tests
