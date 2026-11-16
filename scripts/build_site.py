"""Empaqueta solo los archivos públicos. No modifica DNS ni publica servicios."""
import argparse
import shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=ROOT/'public');args=p.parse_args();out=args.output.resolve()
if out==ROOT or out in ROOT.parents:p.error('Destino separado requerido')
if out.exists() and any(out.iterdir()):p.error('Usa un destino vacío para evitar archivos residuales')
out.mkdir(parents=True,exist_ok=True)
for folder in ['assets','css','js','servicios']:shutil.copytree(ROOT/folder,out/folder)
for name in ['index.html','privacidad.html','gracias.html','favicon.svg','robots.txt','sitemap.xml','llms.txt']:shutil.copy2(ROOT/name,out/name)
print('Artefacto público generado')
