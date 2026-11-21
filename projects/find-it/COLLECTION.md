# Collection origin

Original Everyday Cool workshop, added 16 November 2026 at Steven Powell's request. In the Everyday Cool ideas side chat that morning he proposed a "silly 'Find it' app": a "Find:" menu of the things a traveller might want (his first named ones: Coffee, Salad, Fitness Center, Hospital, Pharmacy), able to find your location or take one by ZIP code, showing a basic street map inline, with Directions. He decided it should be a NEW room in Everyday Cool (not inside the Map Room, not a standalone app), with a link to it placed in the Map Room — and reciprocal linking back, following the collection's existing cross-link pattern (A Library ↔ Library App). He also directed that the updated Everyday Cool desktop app get Mac and Windows installers, which ship as app v1.0.5 through the app repo's existing build workflow. Built by Muse (AI assistant) and added directly to the collection at his direction; this folder is the maintained original, and there is no upstream copy.

The map stack is the Map Room's: OpenStreetMap data drawn by Leaflet, both loaded from their public services at view time (nothing vendored). Find-me uses the browser's geolocation; ZIP and town searches use Nominatim; category searches use the Overpass API (overpass-api.de) around the map centre. Directions buttons hand off to Google Maps directions, with OpenStreetMap directions as the alternative link. The page footer discloses all of this in plain language. A Help/documentation section is included in the page, per Steven's note the same morning that all the apps really need Help with documentation.

The rules live in `findit.js` (no DOM), checked by `test.cjs`.

Banner: `find-it-banner.jpg`, AI-generated watercolor to the room's concept — to Steven's art direction — a robot/AI looking at a map with an eyepiece: a friendly robot with a brass magnifying eyepiece (jeweler's loupe) over one eye, bending over a big paper street map covered in colourful pins, with a steaming coffee cup and a small green pharmacy-cross sign on the table — generated 16 November 2026 as part of adding this room, in the style and dimensions (2736×912) of the collection's other banners.

Local changes to imported files: none (no files were imported; all files originate here).

Documentation update, 20 November 2026: `index.html`, `style.css`, `README.md`, and `COLLECTION.md` gained a professional documentation treatment — a Source on GitHub link in the Help menu, a documentation lede and action bar in the Help section, matching styles, and a Documentation section in the README — at Steven Powell's direction ('the documentation section is the only part that doesn't look like a real program'). No bench, lesson, or behaviour changed.

The same documentation update also added a Steve's Profile link (Steven Powell's LinkedIn) at the foot of the Help section — `index.html` and `style.css`.

Cross-link (21 November 2026): at Steven Powell's direction, the Keep Going shelf in `index.html` gained an entry for A Library's Shelf It! (`../a-library/dewey-game.html`) — this room finds places by name; the Library's new subject search finds books by subject and kicks out the Dewey number — and the game's search panel links back to this room. Changed files: `index.html`, `COLLECTION.md`.
