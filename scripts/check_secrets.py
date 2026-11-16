"""Escanea código; exceptúa únicamente hashes de procedencia verificados, no archivos."""
import json,re,subprocess,sys
from pathlib import Path
tracked=subprocess.run(['git','ls-files','-z'],capture_output=True,text=True,check=True).stdout.split('\0')
if any((Path(name).name.startswith('.env') and Path(name).name!='.env.example') or name.startswith(('backups/','.runtime/')) for name in tracked if name):raise SystemExit('Private runtime files must not be tracked')
roots=[json.loads(Path('project.yaml').read_text())['adoption']['segaf_commit'],json.loads(Path('project.yaml').read_text())['adoption']['schema_blob_sha']]
images=json.loads(Path('infra/images.lock.json').read_text())
for value in images.values():
    match=re.fullmatch(r'[a-z0-9./-]+@sha256:([a-f0-9]{64})',value)
    if not match:raise SystemExit('Invalid image integrity reference')
    roots.append(match[1])
command=['detect-secrets','scan','--all-files','--exclude-files',r'(^|/)(\.git|node_modules|playwright-report|test-results|public|_preview|\.runtime|backups)/|(^|/)\.env($|\.)','--exclude-secrets','^('+'|'.join(roots)+')$']
result=subprocess.run(command,capture_output=True,text=True)
if result.returncode:raise SystemExit('Secret scan could not execute')
report=json.loads(result.stdout)
if report['results']:
    print('Potential secret locations (no values):',', '.join(report['results']))
    sys.exit(1)
print('Secret scan: PASS; only immutable provenance hashes excepted')
