# Packet Playground

Open index.html, or Launch.cmd. Framework-free static networking workshop: all 33 IPv4 prefix lengths, binary boundary and address window, simulated local/gateway delivery, DNS cases, interactive OSI layers, Wi-Fi simulation, real local snapshot import, and symptom-based troubleshooting. Core activities work offline. External sources require internet.

## The routing game

**Route It** (`route-it.html`) — the room's game: walk a packet across a small network one next hop at a time. Follow an intact table; choose between two roads that cost differently; re-route when a link drops mid-delivery; escape a stale-table loop before the TTL runs out; and sort a /24 street — 256 addresses, .0 and .255 as traps, the gateway for off-street mail. Its back door (`route-it-lesson.html`) teaches tables as next-turn-only maps, TTL, and the window arithmetic, and opens inside the game from a 📖 Lesson pop-up. Before it shipped, a headless proof delivered every level by its intended strategy, traced the loop's death at exactly 8 hops, and checked the address classifier against all 254 host doors on the street.

## Windows measurements

Extract the ZIP first. Run WiFi-Snapshot.cmd on the Windows device to check. It invokes the bundled reviewed PowerShell script under your existing policy, without bypassing it. It reads netsh wlan show interfaces, extracts percentage lines, and writes wifi-snapshot.json beside the helper. No SSID, BSSID, MAC, IP, credentials, or raw command output is saved. Take a new snapshot after moving, and select it in the page again. The page reads the selected file locally, not through an upload. Multiple readings retain their reported order; no adapter names are recorded.

No administrative privileges are requested, no software is installed, and no settings are changed. If Windows blocks access or no percentage is available, use the manual read-only command locally. Do not weaken script or location policy for this workshop. Windows signal quality is not raw RSSI/dBm or throughput.

## Validation

Run node test.cjs for subnet/routing/report checks. /31 means supported point-to-point endpoints; /32 one address. Delivery is a one-interface routing illustration, not a full routing table. The browser cannot inspect its actual Wi-Fi radio. No automatic scanning or Internet probes occur.
