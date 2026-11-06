# Body Symptom Mapper v0.1

Standalone offline symptom-journal prototype, created for Steven Powell with OpenAI Codex assistance on November 6, 2026. This is an archived working prototype, not yet a cataloged Everyday Cool workshop.

## Run

Download body-symptom-mapper.html and open it in a modern browser. No server, installation, dependencies, or network connection is needed. Drag to rotate; click the body to add a marker; click a marker or list entry to edit. Left/right refer to the person's body. New locations save immediately; use Save marker to apply edited details.

Pain, tension, weakness, numbness, and other categories support intensity 0–10, notes, and observation/creation/update timestamps. Marker coordinates are stored in body space independently of the viewing angle. The simplified ellipsoid anatomy is a location aid, not diagnostic or anatomically precise medical software.

Browser storage is best-effort, particularly for local files and private browsing. Export JSON for a portable backup; importing replaces existing records after confirmation. PNG exports the current view plus all numbered record summaries. Exports include saved details, not unsubmitted form edits. Records are local, not encrypted; use care on shared devices.

## Try with fictional data

Add a marker on the left shoulder, rotate to the back, then return to the front. The body-space location stays fixed while the screen projection changes. Export and reimport JSON to see how coordinates and observations form a portable record. Do not commit personal symptom records to this repository.

## Validation

Developer-only prerequisites: Node.js and Playwright with Chromium. From this folder:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/mapper.cjs
```

Optionally set CHROMIUM_PATH to an installed Chromium executable. Tests create disposable artifacts in the system temporary directory. They supply HTML through an intercepted test URL with browser networking disabled; the test environment blocks file URLs, so direct file navigation was not browser-tested there.

Checks passed: offline execution, anatomical sides/front/back, mouse rotation, invariant coordinates, marker occlusion, editing, persistence on reload, PNG and JSON downloads, JSON import round trip and rejection, deletion, mobile width, and no JavaScript errors.

## Known limits / before catalog publication

- Marker placement requires a pointer; keyboard rotation and labeled form controls are available, but full keyboard placement and a nonvisual location alternative are still needed.
- Rotation is around the vertical axis only; the model is deliberately simplified.
- Large PNG reports are constrained by browser canvas limits.
- Add workshop-level explanation, accessibility review, catalog/provenance integration, and generated packages before proposing this for the public workshop catalog.

This folder preserves the HTML delivered through Drive in this chat. It contains no user symptom records, screenshots of personal records, or generated exports.

## Licenses

Original code: MIT (LICENSE). Original explanatory writing: CC BY 4.0 (LICENSE-CONTENT.md), following the collection's licensing conventions. No runtime third-party libraries or media are bundled.
