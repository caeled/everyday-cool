# Everyday Body

An Everyday Cool workshop about the body you carry around: a working atlas of twelve organs you can pick from a front-view figure, a brain explorer that gives the brain a room of its own — six tappable surface structures and twelve region topics, surface and deep — a "connect the dots" mode that follows everyday actions across cooperating systems, a six-question thinking check, and a screen-free activity to finish.

The workshop was designed and built by **ChatGPT** at Steven Powell's direction (see COLLECTION.md) and integrated into the collection by Muse with the house wiring described below. It ships as a single self-contained HTML file: every diagram is inline SVG drawn for this room, and there are no external images, stylesheets, scripts, or fonts.

## Documentation

- **In-page Help:** The Help ▾ menu and Help section explain the workshop's parts, simplifications, limits, and sources.
- **Full README:** This file is the complete manual for Everyday Body.
- **Online:** [Collection documentation](https://caeled.github.io/everyday-cool/documentation.html) · [Source on GitHub](https://github.com/caeled/everyday-cool/tree/main/projects/everyday-body)

## What's inside

- **The body atlas** — a simplified front-view figure (not to scale; some organs are drawn through others so they can be selected). Filter chips fade the organs outside one system — Nervous, Circulatory, Respiratory, Digestive, Urinary, Sensory, Musculoskeletal — and tapping an organ on the figure, or its button below, opens its story in the Discover panel: a summary, what it does, one thing to notice, and an "Explore further" shelf of OpenStax, Wikipedia, and NINDS reading.
- **The brain explorer** — the brain gets the workshop inside the workshop. Its detail view is a side-view diagram with six coloured, independently selectable surface structures (frontal, parietal, temporal, and occipital lobes, cerebellum, brainstem), and twelve region buttons below it add the deeper structures the side view cannot show: hippocampus, amygdala, thalamus, hypothalamus, basal ganglia, and corpus callosum among them. The room states its honest rule on the page: complex functions emerge from networks across regions, rather than belonging to one region alone.
- **Connect the dots** — choose an everyday action (running to catch a bus, eating an apple, hearing your name, cooling off on a hot day) and a chain shows which organs cooperate, in order, with what each contributes. An effort slider beside it models rising demand — labelled on the page as illustrative, not a measurement.
- **Check your thinking** — six questions drawn from the atlas, each marked on the spot with the reason why.
- **Try this without a screen** — an educator's corner: find your pulse, walk for a minute, check again, and compare observations rather than scores, with a discussion prompt about networks picking up each other's load.
- **Help menu** — the header's **Help ▾** menu opens the documentation directly (the atlas, the brain explorer, connect the dots, the quiz, the honest limits, the offline answer), plus a "Full documentation (README)" entry. This README ships inside the desktop app copy, so Help's full documentation works in the app too.
- **Sister rooms:** Everyday Physics, Everyday Chemistry, and Everyday Electronics — the rest of the Science block. The connections mode is this room's version of their shared lesson: systems are cooperations, not parts lists.

## Run it

Open `index.html` in a browser. Everything — atlas, brain explorer, scenarios, quiz, Help — works fully offline from the single file. Only the "Explore further" links need the internet.

## Tests

```
node test.cjs
```

The tests confirm the page stays self-contained (no external images, stylesheets, or scripts), that its inline script parses and runs (executed against a minimal DOM stub, checking the atlas, scenario chain, and quiz all render), that all twelve organs and all twelve brain regions are present, and that the Help wiring is in place.

## Files

- `index.html` — the room itself: page, styling, inline SVG atlas and brain diagram, and the workshop's script, all in one file
- `everyday-body-banner.jpg` — AI-generated banner art (see COLLECTION.md)
- `test.cjs` — self-containment, content, and script checks
