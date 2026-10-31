# Workshop Author Guide

How to write a workshop that belongs in Everyday Cool. This guide is for
authors: people building a workshop in their own fork who may propose it for
the official collection. It expands [CONTRIBUTING.md](CONTRIBUTING.md),
which covers the submission process, and the workshop skeleton in
[templates/workshop/README.md](templates/workshop/README.md), which every
new workshop starts from.

## Educational goals

Every workshop in this collection teaches how a system works. Whatever the
subject — a network, a storm, a secret code, a robot — the learner should
come away able to say what the moving parts are and what happens when one
of them changes.

- **Start with a curiosity hook.** One sentence that makes someone want to
  try. State who the workshop is for and what they should understand
  afterward; the collection's idea issues ask for exactly this.
- **Give them something to do.** A concrete activity comes first, then the
  explanation. The hub's rhythm is *Ask → Try → Notice → Understand*: a
  question, a small experiment, a moment of noticing, then the idea itself.
- **Explain honestly.** Identify simplifications. Label simulations, and
  distinguish a toy model from a real-world prediction. A learner who knows
  where the model stops has learned something true.
- **Cite sources someone can follow.** Accurate, attributable references
  belong in the workshop's *Sources and credits* section, following the
  template.

## Accessibility

Accessibility is a standing requirement, not a finishing touch.

- Readable navigation, full keyboard access, visible focus, and form labels.
- Sufficient color contrast; never carry meaning by color alone.
- No compulsory motion or autoplay. Respect reduced-motion preferences.
- Captions or an accessible alternative for essential media, and a
  meaningful alternative activity when a feature cannot be made accessible.
- Keep language as plain as the subject allows. A clearer sentence is an
  accessibility improvement.

Check these before submitting, and say what you checked. Barriers reported
later are handled as first-class corrections.

## Offline requirements

The collection is portable: people download it and carry it to places the
internet does not reach. Design for that.

- **Core activities should work offline and process locally** wherever
  practical. Prefer local processing; if an activity sends a request to an
  external service, explain what is sent and why.
- **State requirements honestly** in the workshop's *Start and carry it*
  section: what needs internet (videos, external reading, live data), what
  needs a particular device or browser feature, and what needs a secure
  context. Some cryptography features, for example, require HTTPS or
  localhost.
- **Keep helpers optional and understandable.** Download helpers must be
  limited to official or clearly documented sources. No installers,
  executables, large models, or bundled videos without prior discussion.
- A simple browser activity is welcome. Complexity should earn its place.

## Licensing

- New original collection code is licensed **MIT**; original educational
  writing is **CC BY 4.0**. Include the license files in the workshop
  folder, as every bundled project does.
- Bundled projects keep their own included licenses. **Do not change an
  existing license, and never relicense somebody else's work.** Keep
  publisher media separate from original material.
- Credit third-party work separately, in the project's `THIRD-PARTY.md`,
  with its own terms intact.
- The official collection is free to access: no subscription funnels, ads,
  affiliate links, paid prompt packs, or mandatory paid AI accounts. The
  free licenses permit commercial reuse elsewhere; that policy governs what
  *we publish*, and a fork's existence does not imply endorsement.

## Provenance

A workshop's origins must be as inspectable as its content.

- Record authorship, sources, media permissions, and dependency licenses in
  the workshop's *Sources and credits* section.
- Disclose material AI assistance — the collection itself is built with AI
  assistance, human curiosity, and review — and **check AI-assisted
  material yourself** before proposing it.
- When a project joins the collection as a copy, its origin is recorded in
  `provenance/<id>.json`: original Git blob hashes and the source commit
  for repository imports, or SHA-256 digests for author-supplied files.
  Intentional changes to imported files are recorded in that project's
  `COLLECTION.md`. See [MAINTAINING.md](MAINTAINING.md).
- Use fictional examples. Include no personal data, credentials, tracking,
  hidden uploads, or unauthorized copyrighted material.

## Contribution standards

- Develop in your own fork, on a branch, in `projects/your-short-name/`,
  starting from the template. You may publish your fork under its licenses
  without waiting for inclusion here; identify your changes and authorship
  and do not imply endorsement.
- A pull request explains the learning outcome, the before/after behavior,
  sources, licensing, offline behavior, and checks performed, with a
  screenshot for a visible change. Update `catalog.json` for a proposed new
  entry without presenting it as already accepted.
- If a bundled project changes, run `python tools/build-packages.py` and
  `python tools/check-collection.py`. Keep unrelated edits out of the
  proposal.
- Contributions are proposals. Steven reviews and decides what joins the
  official collection; there is no automatic approval or publication.

## Before you submit

- [ ] A named learner, a curiosity hook, and a stated learning outcome.
- [ ] A concrete activity that teaches how a system works, with
      simplifications and simulations labeled.
- [ ] Keyboard access, labels, contrast, and motion/media behavior checked.
- [ ] Offline and internet requirements stated honestly; local processing
      preferred and any external request explained.
- [ ] Licenses included and unchanged; third-party work credited in
      `THIRD-PARTY.md`.
- [ ] Sources cited; material AI assistance disclosed and self-checked.
- [ ] No personal data, credentials, tracking, or sales funnels.
- [ ] Catalog updated if proposed, and the collection checks run.
