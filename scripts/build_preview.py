"""Genera el sitio de revisión; no publica ni envía datos a servicios externos."""
import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--output", type=Path, default=ROOT / "_preview")
args = parser.parse_args()
output = args.output.resolve()
if output == ROOT or output in ROOT.parents:
    parser.error("El destino debe ser un directorio separado del código fuente")
output.mkdir(parents=True, exist_ok=True)
# Directorio exclusivo: evitar publicar archivos residuales de otra aplicación.
if any(output.iterdir()):
    parser.error("El directorio de salida debe estar vacío; usa uno nuevo")
for folder in ("assets", "css", "js", "servicios"):
    shutil.copytree(ROOT / folder, output / folder)
for name in ("index.html", "privacidad.html", "gracias.html", "favicon.svg"):
    shutil.copy2(ROOT / name, output / name)
for page in output.rglob("*.html"):
    text = page.read_text().replace(
        "<head>", '<head>\n<meta name="robots" content="noindex,nofollow,noarchive">'
    )
    text = re.sub(r'<link rel="canonical"[^>]+>', "", text)
    text = text.replace(
        "<body>",
        '<body>\n<aside class="preview-banner" aria-label="Vista previa">'
        'Vista previa de diseño de JJ-TI · Envío de formularios deshabilitado · '
        '<a href="https://github.com/JJ-TI/jj-ti-landing/issues/13">Backlog</a></aside>',
    )
    if page.name == "index.html":
        text = text.replace('action="api/v1/leads"', 'action="#"')
        text = text.replace('data-endpoint="/api/v1/leads"', 'data-endpoint="#"')
        text = text.replace('type="submit">Solicitar diagnóstico</button>',
                            'type="submit" disabled>Envío deshabilitado en vista previa</button>')
        text = text.replace('data-form-status></p>',
                            'data-form-status>Esta es una vista previa del diseño. El formulario no envía consultas.</p>')
    page.write_text(text)
with (output / "css/base.css").open("a") as style:
    style.write('\n.preview-banner { padding: 12px 20px; background: #fff4c2; color: #191970; text-align: center; font: 600 14px/1.5 system-ui, sans-serif; }\n.preview-banner a { text-decoration: underline; }\n')
form = output / "js/form.js"
text = form.read_text()
text = text[:text.index("  form.addEventListener('submit'")]
text += "  form.addEventListener('submit', (event) => {\n    event.preventDefault();\n    setStatus('Vista previa de diseño: el envío está deshabilitado.', 'info');\n  });\n})();\n"
form.write_text(text.replace("  let sending = false;\n", ""))
(output / "js/config.js").write_text("window.JJTI_CONFIG = Object.freeze({apiBase: '', analyticsEnabled: false, preview: true});\n")
(output / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
(output / ".nojekyll").write_text("")
assert "fetch(" not in form.read_text(), "El preview no debe enviar formularios"
assert not (output / "CNAME").exists(), "El preview no debe cambiar el dominio comercial"
print(f"Preview generado: {output}")
