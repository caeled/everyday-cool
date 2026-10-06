# Maintain the collection

## Add or edit a listing

`catalog.json` is the source of truth. Each entry has a unique `id`, title, topic, description, starter activity, source address, original live address, and either a bundled entry point or a clearly marked external link. Bundled entries carry their imported commit and file hashes in `provenance/`.

1. Review the learning experience and its sources, licenses, accessibility, privacy, and internet requirements.
2. Add a self-contained folder under `projects/`, or list an external resource without claiming its source is bundled.
3. Update the catalog. Run `python tools/build-hub.py` to regenerate the static landing page.
4. Run `python tools/build-packages.py`, then `python tools/check-collection.py`. Run appropriate project-specific checks for changes inside a workshop.
5. Review the diff, open the local page, and commit the reviewed change. GitHub Pages uses the reviewed main branch; pull requests do not publish automatically.

## Originals and collection copies

The original addresses remain maintained. The initial bundled copies preserve published source at the commits in the catalog. The original histories remain in the original repositories, linked from `provenance/`.

When an original changes, compare its source against the recorded import commit and the collection copy. Review additions and removals, retain licenses, and carry over desired changes in a pull request. Refresh the recorded upstream commit and provenance file only after verifying the new source. Do not overwrite local collection improvements without comparison. When a collection improvement belongs in an original, make a separate reviewed change there.

There is deliberately no network sync or automatic upstream replacement. Included project `Publish-GitHub.ps1` helpers still name their original standalone repository; **do not use them to publish this collection**. Publish from the collection root using its own Git remote. Likewise, project's media helpers retain their original terms and destinations.

## Source records

`provenance/<id>.json` records original Git blob hashes and the source commit. Newline differences from browser publication are recognized during the initial validation. If you modify a copied file, record the intentional change in its `COLLECTION.md`; the checker reports modified snapshot files and requires them to be listed there. A source record is an origin record, not a claim that future changes are byte-identical.

## Downloads

Project ZIPs in `downloads/` are generated from each project folder, with credits and notices. The complete portable archive is written beside the collection folder and includes the hub, source copies, and individual archives. Large optional media is excluded from these starting packages. Files downloaded later into a workshop should not be committed or bundled without review.

## Publishing

The repository is `https://github.com/caeled/everyday-cool`. Enable GitHub Pages from `main` / root. `.nojekyll` serves these static files without a framework build. Keep repository write access limited to maintainers and review all changes before merging.
