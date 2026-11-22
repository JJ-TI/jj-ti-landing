"""Genera descripciones estáticas aprobadas; sin backend ni analítica."""
import html
import json
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
services = json.loads((ROOT / 'content/services.json').read_text())
toggle = re.search(r'<button type="button" class="theme-control theme-toggle".*?</button>', (ROOT / 'index.html').read_text(), re.S).group()
e = html.escape
for service in services:
    title = e(service['title'])
    schema = {'@context': 'https://schema.org', '@type': 'Service', 'name': service['title'], 'description': service['description'], 'provider': {'@type': 'Organization', 'name': 'JJ-TI — Soluciones Tecnológicas'}, 'areaServed': {'@type': 'Country', 'name': 'El Salvador'}}
    body = f'''<!DOCTYPE html>
<html lang="es-SV">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="../js/theme.js"></script>
<title>{title} para empresas en El Salvador | JJ-TI</title>
<meta name="description" content="{e(service['description'])}">
<meta property="og:type" content="website"><meta property="og:title" content="{title} | JJ-TI">
<meta property="og:description" content="{e(service['description'])}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/variables.css"><link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/components.css"><link rel="stylesheet" href="../css/glass.css">
<link rel="stylesheet" href="../css/interactions.css"><link rel="stylesheet" href="../css/theme.css"><link rel="stylesheet" href="../css/services.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False).replace('<', chr(92)+'u003c')}</script>
</head>
<body>
<a class="skip-link" href="#contenido">Saltar al contenido principal</a>
<header class="service-header"><div class="container"><a class="brand" href="../index.html"><span class="brand__mark">JJ-TI</span><span class="brand__text">Soluciones Tecnológicas</span></a><div class="service-header-actions"><a href="../index.html#soluciones">Todas las soluciones</a>{toggle}</div></div></header>
<main class="container service-detail" id="contenido" tabindex="-1">
<nav aria-label="Ruta de navegación"><a href="../index.html">Inicio</a><span aria-hidden="true"> / </span><span>{title}</span></nav>
<section class="service-intro" aria-labelledby="servicio"><p class="eyebrow">SOLUCIONES PARA EMPRESAS EN EL SALVADOR</p><h1 id="servicio">{title}</h1><p class="service-summary">{e(service['intro'])}</p><a class="button button--primary" href="../index.html?servicio={service['key']}#diagnostico">Consultar este servicio</a></section>
<section class="service-chapter" aria-labelledby="alcance"><h2 id="alcance">Qué podemos trabajar contigo</h2><ul>{''.join('<li>'+e(item)+'</li>' for item in service['items'])}</ul><p>Primero revisamos tu necesidad para definir prioridades. Los entregables, condiciones y costos se acuerdan en una propuesta antes de contratar.</p></section>
<section class="service-chapter" aria-labelledby="preguntas"><h2 id="preguntas">Preguntas frecuentes</h2>{''.join('<details><summary>'+e(q)+'</summary><p>'+e(a)+'</p></details>' for q,a in service['faq'])}</section>
<section class="service-chapter" aria-labelledby="contacto"><h2 id="contacto">Hablemos de tu necesidad</h2><p>Comparte el contexto de tu empresa sin incluir contraseñas ni información sensible.</p><div class="service-contact"><a href="mailto:info@jj-ti.net">info@jj-ti.net</a><a href="https://wa.me/50379124962" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></section>
</main>
<footer class="service-footer"><div class="container"><span>© 2026 JJ-TI — Soluciones Tecnológicas</span><a href="../index.html">Volver a JJ-TI</a></div></footer>
<script src="../js/interactions.js" defer></script>
</body></html>
'''
    (ROOT / 'servicios' / (service['slug'] + '.html')).write_text(body)
print('PASS: seis páginas de servicio generadas')
