"""Validación con binarios oficiales, sin iniciar ni publicar el stack."""
import json,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
images=json.loads((ROOT/'infra/images.lock.json').read_text())
def run(args):
    result=subprocess.run(args,cwd=ROOT,capture_output=True,text=True,timeout=240)
    if result.returncode:raise RuntimeError('Infrastructure validation failed: '+args[-1]+'\n'+result.stderr[-1800:]+result.stdout[-1800:])
with tempfile.TemporaryDirectory(prefix='jjti-config-') as temp:
    cfg=Path(temp)/'prometheus.yml'
    run(['python3','scripts/configure_monitoring.py','--origin','https://jj-ti.net','--output',str(cfg)])
    run(['docker','run','--rm','-e','SITE_ORIGIN=https://jj-ti.net','-v',f'{ROOT}/infra/Caddyfile:/etc/caddy/Caddyfile:ro',images['caddy:2-alpine'],'caddy','adapt','--config','/etc/caddy/Caddyfile'])
    run(['docker','run','--rm','--entrypoint','/bin/promtool','-v',f'{cfg}:/etc/prometheus/prometheus.yml:ro','-v',f'{ROOT}/infra/alerts.yaml:/etc/prometheus/alerts.yaml:ro',images['prom/prometheus:latest'],'check','config','/etc/prometheus/prometheus.yml'])
    run(['docker','run','--rm','-v',f'{ROOT}/infra/collector.yaml:/etc/collector.yaml:ro',images['otel/opentelemetry-collector-contrib:latest'],'validate','--config=/etc/collector.yaml'])
print('PASS: Caddy, Prometheus/rules y Collector con binarios oficiales')
