"""Verifica recursos, fragmentos HTML, URLs CSS y enlaces Markdown locales."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.refs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for name in ("href", "src"):
            if name in attrs:
                self.refs.append(attrs[name])


def check_ref(ref, source, ids=None):
    url = urlsplit(ref)
    if url.scheme or url.netloc or not ref:
        return
    target = (source.parent / unquote(url.path)).resolve() if url.path else source
    if not target.is_relative_to(ROOT) or not target.exists():
        errors.append(f"{source.relative_to(ROOT)}: no existe {ref}")
    elif url.fragment and ids is not None and not url.path and unquote(url.fragment) not in ids:
        errors.append(f"{source.relative_to(ROOT)}: destino ausente {ref}")


for source in ROOT.glob("*.html"):
    page = Page()
    page.feed(source.read_text())
    for name, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f"{source.name}: id duplicado {name}")
    for ref in page.refs:
        check_ref(ref, source, page.ids)
for source in (ROOT / "css").glob("*.css"):
    for ref in re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", source.read_text()):
        check_ref(ref, source)
for source in [*ROOT.glob("*.md"), *(ROOT / "docs").rglob("*.md")]:
    for ref in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", source.read_text()):
        check_ref(ref, source)
if errors:
    raise SystemExit("\n".join(errors))
print("PASS: recursos, fragmentos HTML, URLs CSS y enlaces Markdown locales")
