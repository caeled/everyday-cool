"""Build reviewed portable source packages. No network, installers, or execution."""
import pathlib,json,zipfile
root=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))
def included(p):
 return not any(x in {'.git','__pycache__','media','node_modules','.venv'} for x in p.parts) and p.name!='asl-chart.jpg' and p.suffix not in {'.pyc','.mp4','.webm','.mkv'}
def archive(dest,folder,prefix):
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(folder.rglob('*')):
   if p.is_file() and included(p.relative_to(folder)): z.write(p,str(pathlib.PurePosixPath(prefix)/p.relative_to(folder).as_posix()))
downloads=root/'downloads';downloads.mkdir(exist_ok=True)
for project in catalog['projects']:
 if project['bundled']: archive(root/project['download'],root/'projects'/project['id'],project['id'])
archive(root.parent/'everyday-cool.zip',root,'everyday-cool')
print('Built',sum(p['bundled'] for p in catalog['projects']),'individual packages and',root.parent/'everyday-cool.zip')
