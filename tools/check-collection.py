"""Inspect catalog, provenance, local links, and ZIP contents. Execute no workshops."""
import pathlib,json,hashlib,zipfile,re
from html.parser import HTMLParser
root=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))['projects']
assert len({p['id'] for p in catalog})==len(catalog)
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
count=0
for project in catalog:
 if not project['bundled']: assert project['entry'] is None and project['download'] is None;continue
 folder=root/'projects'/project['id'];assert (root/project['entry']).is_file()
 for name in ['LICENSE','LICENSE-CONTENT.md','README.md','COLLECTION.md']:assert (folder/name).is_file()
 source=json.loads((root/'provenance'/f"{project['id']}.json").read_text())
 assert source['commit']==project['importCommit']
 note=(folder/'COLLECTION.md').read_text(encoding='utf-8')
 for name,sha in source['files'].items():
  b=(folder/name).read_bytes();lf=b.replace(b'\r\n',b'\n');count+=1
  if sha not in ({hashlib.sha256(b).hexdigest(),hashlib.sha256(lf).hexdigest(),hashlib.sha256(lf+b'\n').hexdigest()} if source.get('format')=='sha256' else {blob(b),blob(lf),blob(lf+b'\n')}):
   assert f'`{name}`' in note and 'Local changes to imported files: none.' not in note,'Unrecorded change: '+name
 with zipfile.ZipFile(root/project['download']) as z:
  assert z.testzip() is None
  expected={p.relative_to(folder).as_posix():p.read_bytes() for p in folder.rglob('*') if p.is_file() and not any(s in {'.git','__pycache__','media','node_modules','.venv'} for s in p.relative_to(folder).parts) and p.name!='asl-chart.jpg' and p.suffix not in {'.pyc','.mp4','.webm','.mkv'}}
  actual={n.split('/',1)[1]:z.read(n) for n in z.namelist()}
  assert actual==expected,'Stale or incorrect project ZIP: '+project['id']
class Check(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for key in ['href','src']:
   if key in a:self.links.append(a[key])
c=Check();c.feed((root/'index.html').read_text(encoding='utf-8'));assert len(c.ids)==len(set(c.ids))
for link in c.links:
 if link.startswith('#'): assert link=='#' or link[1:] in c.ids,link
 elif not re.match(r'^[a-z]+:',link):assert (root/link.split('#')[0]).is_file(),link
for p in catalog:assert p['title'] in (root/'index.html').read_text(encoding='utf-8')
print(f'Collection verified: {len(catalog)} entries, {count} imported files, all project ZIPs, hub links, licenses, and provenance.')
