# Decisions Everywhere

Very few people are taught how to decide. This workshop makes decision-making visible.

## Try this

Open `index.html` in a browser and work through eight rooms, each with a small experiment: sort statements into observations, facts, predictions, opinions, and guesses; diagnose a broken flashlight by eliminating causes; shop at a store where you can only ever have two of three wishes; predict coin flips, dice rolls, and card draws, then run them; find what a dramatic chart is not showing; ride short choices into their long-term results; calibrate a confidence meter against evidence; and run one real budget decision through the full cycle — **SEE → QUESTION → TEST → DECIDE → REVIEW**. Field missions and an educator guide close the workshop.

## The expected-value game

**The Boring Bet Wins** (`the-boring-bet-wins.html`) — the workshop's game, seated in the probability room: three doors with their expected values printed on them — a boring bet with a small honest edge (+2.6 a round), a fair coin (0), and a flashy wheel (−2.5) — played over free rounds, a 30-round challenge, and a Long Run simulator (100 runs × 1,000 rounds). Its back door (`the-boring-bet-wins-lesson.html`) works all three EVs by hand and teaches variance, the law of large numbers, and gambler's ruin; it opens inside the game from a 📖 Lesson pop-up. Before it shipped, a headless proof verified the EVs as exact fractions and measured the long run: the flashy line ruined 100 of 100 runs; the boring line's median climbed from 500 to 3,114 with no ruins.

## Understand it

The learner is anyone who makes decisions, which is everyone: upper elementary through adult learners, no prior technical knowledge required. The outcome is a practiced habit, not a fact set — observe before concluding, ask what is missing, test before deciding, expect tradeoffs, set confidence to match evidence, and review afterward. The probability benches are labeled simulations run on the browser's random number generator; they demonstrate how randomness behaves, and no result predicts any real-world event. The flashlight, products, school, and chart are fictional teaching examples.

## Start and carry it

Entry point: `index.html` (or double-click `Launch.cmd` on Windows). Everything the workshop needs is in this folder: no framework, account, installation, analytics, or internet connection. The page sends nothing and stores nothing; the Big Decision Lab's writing stays in the page and vanishes when it closes. A modern browser with JavaScript enabled runs the activities; the introductions, discoveries, field missions, and educator guide remain readable without it. Collection navigation and the ZIP link assume the complete Everyday Cool collection; the workshop also works as a standalone folder.

## Sources and credits

Original workshop for Everyday Cool. Author and curator: Steven Powell. Design brief prepared by Copilot (31 October 2026) from Steven Powell's proposal and preserved in full as [DESIGN.md](DESIGN.md). Implementation by Muse (31 October 2026), reviewed as a collection proposal. All statements, products, scenarios, and the sales chart are fictional and original; no third-party media, code, or copied text. See [THIRD-PARTY.md](THIRD-PARTY.md) and [COLLECTION.md](COLLECTION.md).

## Verify

Run `node test.cjs` if Node.js is installed; it checks the statement answer key, the flashlight elimination logic, every tradeoff pair, deterministic probability helpers, the confidence bands, and the scenario and lab data. Keyboard access, labels, contrast, and reduced-motion behavior follow the collection's accessibility standards; every activity is operable by keyboard and announces results in status regions.

## License

Original code in this folder is MIT (see `LICENSE`). Original educational writing is CC BY 4.0 (see `LICENSE-CONTENT.md`). Third-party materials — there are none bundled — would retain their own terms.
