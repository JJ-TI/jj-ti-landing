"""Validación reproducible sin red: esquema, procedencia y recursos locales."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

from jsonschema import Draft7Validator

ROOT = Path(__file__).resolve().parents[1]
schema_bytes = (ROOT / "governance/project-v2.schema.json").read_bytes()
# apply_patch añade un salto de línea: el blob canónico ya lo contiene.
blob = hashlib.sha1(b"blob " + str(len(schema_bytes)).encode() + b"\0" + schema_bytes).hexdigest()
manifest = json.loads((ROOT / "project.yaml").read_text())
assert blob == manifest["adoption"]["schema_blob_sha"], "El esquema no coincide con su blob de origen"
schema = json.loads(schema_bytes)
Draft7Validator.check_schema(schema)
Draft7Validator(schema).validate(manifest)
assert len(manifest["adoption"]["segaf_commit"]) == 40

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            assert values["id"] not in self.ids, f"ID duplicado: {values['id']}"
            self.ids.add(values["id"])
        for attr in ("href", "src"):
            if attr in values:
                self.links.append(values[attr])

pages = {}
for path in [*ROOT.glob("*.html"), *(ROOT / "servicios").glob("*.html")]:
    page = Page(path)
    page.feed(path.read_text())
    pages[path.resolve()] = page

for page in pages.values():
    for link in page.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        target = (page.path.parent / unquote(parsed.path)).resolve() if parsed.path else page.path
        assert target.is_relative_to(ROOT), f"Enlace fuera del proyecto: {link}"
        assert target.exists(), f"Recurso inexistente: {page.path.name} -> {link}"
        if parsed.fragment and target.suffix == ".html":
            assert parsed.fragment in pages[target].ids, f"Fragmento inexistente: {link}"
print("PASS: esquema SEGAF y blob de origen; IDs, enlaces y recursos locales")
