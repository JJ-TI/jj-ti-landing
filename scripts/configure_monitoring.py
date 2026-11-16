"""Genera la configuración Prometheus con el origen público elegido."""
import argparse,json
from pathlib import Path
from urllib.parse import urlsplit
p=argparse.ArgumentParser();p.add_argument('--origin',required=True);p.add_argument('--output',type=Path,default=Path('.runtime/prometheus.yml'));args=p.parse_args()
u=urlsplit(args.origin)
if u.scheme not in ['http','https'] or not u.netloc or u.path not in ['','/']:p.error('Origen inválido')
data={'global':{'scrape_interval':'15s','evaluation_interval':'15s'},'rule_files':['/etc/prometheus/alerts.yaml'],'scrape_configs':[{'job_name':'api','static_configs':[{'targets':['api:9464']}]},{'job_name':'site','metrics_path':'/probe','params':{'module':['http_site']},'static_configs':[{'targets':[args.origin.rstrip('/')]}],'relabel_configs':[{'source_labels':['__address__'],'target_label':'__param_target'},{'source_labels':['__param_target'],'target_label':'instance'},{'target_label':'__address__','replacement':'blackbox:9115'}]},{'job_name':'ready','metrics_path':'/probe','params':{'module':['http_ready']},'static_configs':[{'targets':['http://api:3000/health/ready']}],'relabel_configs':[{'source_labels':['__address__'],'target_label':'__param_target'},{'target_label':'__address__','replacement':'blackbox:9115'}]}]}
args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(data,indent=2)+'\n');print('Configuración de monitorización generada; no contiene secretos')
