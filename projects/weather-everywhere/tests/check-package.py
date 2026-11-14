from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
root=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f"Duplicate id: {a['id']}"
            self.ids.add(a['id'])
        for key in ['href','src']:
            if key in a:self.refs.append(a[key])
p=Parser();p.feed((root/'index.html').read_text(encoding='utf-8'))
for ref in p.refs:
    u=urlsplit(ref)
    if u.scheme:continue
    if u.path:assert (root/unquote(u.path)).is_file(),f'Missing asset: {ref}'
    elif u.fragment:assert u.fragment in p.ids,f'Missing anchor: {ref}'
for name in ['assets/land.js','assets/snapshots.js','Launch.cmd','Serve.cmd','SCIENCE.md','LICENSE','tools/Save-Forecasts.ps1','tools/Build-Package.ps1','tools/Publish-GitHub.ps1']:
    assert (root/name).is_file(),name
print(f'Package verified: {len(p.ids)} unique IDs and {len(p.refs)} links/assets.')
