# Sources & limitations

## Bundled material

All lesson/Help text and code are original work written for this workshop (code MIT, lessons CC BY 4.0). The banner image is AI-generated art made for this room. No third-party code, fonts, or data are bundled in this folder.

## Loaded / called at view time (not bundled)

- **Leaflet 1.9.4** — the map library, loaded from the unpkg CDN with pinned integrity hashes. BSD 2-Clause license, © Vladimir Agafonkin and contributors. https://leafletjs.com
- **OpenStreetMap tiles** — map pictures served by the OpenStreetMap Foundation's tile servers. Map data © OpenStreetMap contributors, available under the Open Database License (ODbL). https://www.openstreetmap.org/copyright
- **Nominatim** — OpenStreetMap's search service, used for ZIP code and town lookups: one search per button press, no bulk lookups. https://nominatim.openstreetmap.org
- **Overpass API** — the OpenStreetMap query service used for category searches: one user-tapped category at a time, around the map centre. The main instance (overpass-api.de) is tried first; if it stalls or refuses, the community mirrors overpass.kumi.systems and overpass.private.coffee are tried in turn, each with its own time limit. https://wiki.openstreetmap.org/wiki/Overpass_API
- **Google Maps directions** — linked, not loaded: Directions buttons open a Google Maps directions URL in a new tab, under Google's own terms. OpenStreetMap directions are offered as the alternative on every result.

## Limitations

Coverage is exactly OpenStreetMap's coverage: a real place that nobody has added yet will not appear, and the Help section says so and points to how to add it. Category tags are volunteers' tags — a café tagged only as a restaurant (or the reverse) can land in a neighbouring category. The search radius is about 5 miles (8 km) around the centre spot; in sparse country the nearest match may sit outside it and the page will honestly report none found. Distances shown are straight-line; road distance from the Directions link will be longer. Find-me accuracy belongs to the visitor's device. Overpass is a shared public service and can ask busy visitors to wait; the page reports a failed search plainly rather than pretending. Shelf descriptions were written on 16 November 2026; each linked service's own pages are the authority.
