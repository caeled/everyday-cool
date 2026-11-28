# Collection copy

Original Everyday Cool workshop authorized by the curator. No imported third-party code or media. Address examples are private or documentation ranges. The Windows helper is optional, read-only, and never executed automatically by the website.

Banner added November 15, 2026: packet-banner.jpg (AI/robots theme), part of the collection-wide banner pass.

Documentation update (20 November 2026): at Steven Powell's direction, `index.html` gained a professional Documentation & source panel with the room README, GitHub source, sources and limitations, workshop download, collection documentation index, and curator profile link. Changed files: `index.html`, `COLLECTION.md`. The addition is documentation and navigation only; no lesson content or workshop behaviour was changed.

Game (21 November 2026): at Steven Powell's direction, the room gained its first game — `route-it.html`, **Route It**: walk a packet across a small network one next hop at a time — follow an intact table, choose between two roads that cost differently, re-route when a link drops mid-delivery, escape a stale-table loop before the TTL runs out, and sort a /24 street (256 addresses; .0 and .255 as traps; the gateway for off-street mail). The failure is data, not script: a level's link-down is derived from hop count, and one address classifier (mask arithmetic) judges the window level, the game, and the proof alike — the proof checked all 254 host doors. `route-it-lesson.html` is its back door (tables as next-turn-only maps; "routing is dead reckoning for packets"; the loop traced hop by hop), opened from inside the game by a Lesson pop-up. `index.html` gained a routing-game section. The game also visits the Physics Game Table, the Arcade shelf, and both lesson shelves. Changed files: `route-it.html`, `route-it-lesson.html`, `index.html`, `README.md`, `COLLECTION.md`.

## Addendum — 2026-11-26: Route the Package

New house game at Steven Powell's direction (his idea of 21 November 2026, queued since):
`route-the-package.html` + `route-the-package-lesson.html` — Route It's physical twin.
Nine hubs, eighteen lanes, five last-mile vans, a seeded snowed-in hub and a flagged
mis-sort lane; both pars (hours, dollars) computed live by Dijkstra. Audit 11/11 on the
shipped page (independent Dijkstra agrees; closed hub never offered; a button-driven
delivery lands exactly on par; the mis-sort demonstrably loops). `index.html` gained
section 08; Dad's Arcade gained its card beside Route It's (192 games / 192 lessons).


Forum link (26 November 2026): `index.html` gained the collection's Join our Forum line (Steven's Google Group — anyone may ask to join, members post), the feedback door he asked to have everywhere.

## Screen sizes (2026-11-27 evening)

`route-the-package.html` gained through the across-the-board rollout: Route the Package gained SIZE / FULL SCREEN / POP OUT (display only). Audited: the map grows 632 to 1,480 px with zero page errors; routing is chosen with buttons, so nothing about play changes at scale.. The choice is remembered per page; full-screen buttons call the standard API and Steven's click is their receipt.

## Network Packet Journey workbench (2026-11-27 night)

`network-packet-journey.html` — Antigravity's end-to-end protocol microscope, integrated at Steven's direction: nine stages from Host A's application layer to Server B's delivery (TLS 1.3 AEAD, TCP segmentation against the 1,500-byte MTU, IPv4 + Ethernet + CRC-32, physical transduction, NAT rewrite with TTL 64→63, ISP core at 63→62, FEC/CRC checks and out-of-order reassembly, AEAD verify and decrypt), a clickable topology, a live oscilloscope of the frame bits, a header-fields inspector with live wire hex, and three sabotage controls (flip a wire bit, drop segment #2, active tamper). Sanctioned additions at integration: the banner figure (`packet-journey-banner.jpg` — AI watercolor by Muse at Steven's direction: the keeper at a brass tap, its stream dissolving into packets sucked into a coiled cable), a References & STEM Doors shelf (27 Wikipedia doors, subnetting included at Steven's request, plus internal doors to Route It, Route the Package, the Neighborhood Bench, Pack 002, and the BBS Door), and the standard display-only screen-size block. Audit (Muse, headless, the delivered file): Transmit plus all nine stages step cleanly, the bit-flip engages the CRC/FEC vocabulary, zero page exceptions. Wired as panel 09 on the room's front page, Full Index 451, sitemap 507. The reference shelf was then dressed as a CRT reference monitor at Steven's direction (phosphor-green monospace links, lighter on click, scanlines that pass clicks through, all 32 doors opening in a new window, a prompt line with a blinking block cursor) — visual embellishment is a tool, per Steven; only credit language stays plain. One further addition sits in the monitor chin, deliberately unexplained on the page.
