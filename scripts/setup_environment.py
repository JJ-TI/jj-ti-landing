"""Genera secretos locales y configuración pública sin imprimir credenciales."""
import argparse,os,secrets,json
from pathlib import Path
from urllib.parse import urlsplit
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--origin',required=True);p.add_argument('--output',type=Path,default=Path('.env'));args=p.parse_args()
u=urlsplit(args.origin)
if not u.netloc or u.path not in ['', '/'] or (u.scheme!='https' and u.hostname not in ['localhost','127.0.0.1']):p.error('Usa un origen HTTPS, sin rutas, o localhost para laboratorio')
if args.output.exists():p.error('No se sobrescriben secretos existentes')
values={'SITE_ORIGIN':args.origin.rstrip('/'),'DATA_KEY':secrets.token_hex(32),'ANALYTICS_KEY':secrets.token_hex(32),'IP_RATE_KEY':secrets.token_hex(32),'POSTGRES_PASSWORD':secrets.token_hex(32),'DB_PASSWORD':secrets.token_hex(32),'GRAFANA_DB_PASSWORD':secrets.token_hex(32),'GRAFANA_ADMIN_PASSWORD':secrets.token_hex(32),'SMTP_HOST':'','SMTP_PORT':'587','SMTP_SECURE':'false','SMTP_FROM':'','SMTP_TO':'info@jj-ti.net','SMTP_USER':'','SMTP_PASS':''}
fd=os.open(args.output,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,'w') as f:f.write(''.join(k+'='+v+'\n' for k,v in values.items()))
print('Archivo de entorno creado con permisos 0600; completa SMTP antes de publicar')
