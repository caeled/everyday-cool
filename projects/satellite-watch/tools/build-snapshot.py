"""Refresh the bundled orbit snapshot (tle-snapshot.js) from CelesTrak.

Run by a maintainer, by hand: python tools/build-snapshot.py
It downloads each family's GP data once (CelesTrak asks for no more than one
download of a group every two hours), keeps every satellite for small
families and an even sample for the giant constellations, and writes
tle-snapshot.js. The page itself never needs this script.
"""
import json, pathlib, time, urllib.request, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP='
# family id -> (CelesTrak group, keep at most N, evenly sampled)
FAMILIES = {
    'stations': ('stations', None), 'starlink': ('starlink', 400), 'oneweb': ('oneweb', 160),
    'weather': ('weather', None), 'gps': ('gps-ops', None), 'glonass': ('glo-ops', None),
    'galileo': ('galileo', None), 'beidou': ('beidou', None), 'iridium': ('iridium-NEXT', None),
    'amateur': ('amateur', None), 'science': ('science', None), 'earth': ('resource', None),
    'visual': ('visual', None), 'recent': ('last-30-days', None),
}
UA = {'User-Agent': 'EverydayCool-SatelliteWatch-snapshot/1.0 (github.com/caeled/everyday-cool)'}

def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            return r.read().decode('utf-8', 'replace')
    except Exception as e:
        print('  failed:', url, e); return ''

def parse(text):
    lines = [l.rstrip() for l in text.splitlines() if l.strip()]
    out = []
    i = 0
    while i + 2 < len(lines):
        if lines[i + 1].startswith('1 ') and lines[i + 2].startswith('2 '):
            out.append([lines[i].strip(), lines[i + 1], lines[i + 2]]); i += 3
        else:
            i += 1
    return out

def sample(rows, n):
    if not n or len(rows) <= n: return rows
    step = len(rows) / n
    return [rows[int(k * step)] for k in range(n)]

snap = {'fetched': datetime.date.today().isoformat(), 'families': {}}
for fid, (group, cap) in FAMILIES.items():
    rows = parse(get(BASE + group))
    note = ''
    if fid == 'recent' and not rows:
        # CelesTrak's last-30-days list can be empty; fall back to the newest
        # catalogue numbers among active satellites (numbers are given out in
        # launch order), so "recent" still means recent.
        active = parse(get(BASE + 'active'))
        active.sort(key=lambda r: int(r[1][2:7].strip() or 0))
        rows = active[-120:]
        note = 'newest 120 catalogue numbers among active satellites (the last-30-days list was empty)'
    total = len(rows)
    snap['families'][fid] = {'group': group, 'total': total, 'kept': 0, 'note': note, 'tle': sample(rows, cap)}
    snap['families'][fid]['kept'] = len(snap['families'][fid]['tle'])
    print(f'{fid:9s} {group:14s} total {total:6d} kept {snap["families"][fid]["kept"]}')
    time.sleep(1)

body = json.dumps(snap, separators=(',', ':'))
(ROOT / 'tle-snapshot.js').write_text(
    '/* Satellite Watch: bundled orbit snapshot from CelesTrak (https://celestrak.org/), GP data,\n'
    ' * fetched ' + snap['fetched'] + ' by tools/build-snapshot.py. Used only when live data cannot be\n'
    ' * reached; orbits fade after a week or two, so the page always prefers fresh data. */\n'
    '(function (root) { var SNAP = ' + body + ';\n'
    "  if (typeof module === 'object' && module.exports) module.exports = SNAP; else root.SAT_WATCH_SNAPSHOT = SNAP; })(this);\n",
    encoding='utf-8')
print('wrote tle-snapshot.js', len(body), 'bytes')
