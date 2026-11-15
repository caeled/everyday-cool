"""Check the Tonight's Sky folder: local links, unique ids, required files, no network calls
except the documented CelesTrak refresh. Inspects files only; runs nothing."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, re
root = Path(__file__).resolve().parents[1]


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = set(); self.refs = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f"Duplicate id: {a['id']}"
            self.ids.add(a['id'])
        for key in ['href', 'src']:
            if key in a: self.refs.append(a[key])


p = Parser(); p.feed((root / 'index.html').read_text(encoding='utf-8'))
for ref in p.refs:
    u = urlsplit(ref)
    if u.scheme: continue
    if u.path:
        target = (root / unquote(u.path)).resolve()
        if '../../' in ref: continue  # collection navigation, present in the full package
        assert target.is_file(), f'Missing asset: {ref}'
    elif u.fragment: assert u.fragment in p.ids, f'Missing anchor: {ref}'
for name in ['astro.js', 'sky-data.js', 'objects.js', 'app.js', 'radio.js', 'satpass.js', 'satellites-tle.js',
             'vendor/satellite.min.js', 'vendor/satellite-js-LICENSE.md', 'style.css', 'Launch.cmd', 'LICENSE',
             'LICENSE-CONTENT.md', 'THIRD-PARTY.md', 'COLLECTION.md', 'README.md', 'downloads/backyard-radio-telescope-plan.pdf']:
    assert (root / name).is_file(), name
# The only network address any script may call is CelesTrak, behind the Refresh button.
for js in ['app.js', 'astro.js', 'objects.js', 'radio.js', 'satpass.js']:
    urls = set(re.findall(r'https?://[^\s\'")]+', (root / js).read_text(encoding='utf-8')))
    assert urls <= {'https://celestrak.org/NORAD/elements/gp.php?FORMAT=tle&GROUP='}, (js, urls)
assert 'fetch(' not in (root / 'astro.js').read_text() and 'fetch(' not in (root / 'satpass.js').read_text()
pdf = (root / 'downloads/backyard-radio-telescope-plan.pdf').read_bytes()
assert hashlib.sha256(pdf).hexdigest() == '39c0ba35b5d77253b28e2634026b4e809469306ede09c3233ea096e019c6eaec', 'plan PDF changed'
print(f'Package verified: {len(p.ids)} unique IDs, {len(p.refs)} links/assets, only the documented CelesTrak request, plan PDF unchanged.')
