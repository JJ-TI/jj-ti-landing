"""Genera HTML estático y datos estructurados desde el mismo contenido visible."""
import html
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
services=json.loads((ROOT/'content/services.json').read_text())
origin='https://jj-ti.net'
e=html.escape
for service in services:
    slug=service['slug']; title=service['title']; url=f'{origin}/servicios/{slug}.html'
    schema={"@context":"https://schema.org","@graph":[
      {"@type":"Organization","@id":origin+'/#organization',"name":"JJ-TI — Soluciones Tecnológicas","url":origin+'/',"email":"info@jj-ti.net","telephone":"+50379124962","areaServed":{"@type":"Country","name":"El Salvador"}},
      {"@type":"Service","@id":url+'#service',"name":title,"description":service['description'],"url":url,"provider":{"@id":origin+'/#organization'},"areaServed":{"@type":"Country","name":"El Salvador"}},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Inicio","item":origin+'/'},{"@type":"ListItem","position":2,"name":title,"item":url}]}
    ]}
    body=f'''<!DOCTYPE html>
<html lang="es-SV">
<head>
<script src="../js/theme.js"></script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} para empresas en El Salvador | JJ-TI</title>
<meta name="description" content="{e(service['description'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="{e(title)} | JJ-TI">
<meta property="og:description" content="{e(service['description'])}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{origin}/assets/social-card.png">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/variables.css"><link rel="stylesheet" href="../css/base.css"><link rel="stylesheet" href="../css/components.css"><link rel="stylesheet" href="../css/glass.css">
<link rel="stylesheet" href="../css/theme.css">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')}</script>
</head>
<body data-page="{slug}">
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="service-page-header"><div class="container"><a class="brand" href="../index.html" data-track="nav-inicio"><span class="brand__mark">JJ-TI</span><span>Soluciones Tecnológicas</span></a><a href="../index.html#soluciones">Todas las soluciones</a></div></header>
<main id="contenido" tabindex="-1" class="container service-detail">
<nav aria-label="Ruta de navegación"><a href="../index.html">Inicio</a> / <span>{e(title)}</span></nav>
<p class="eyebrow">SOLUCIONES PARA EMPRESAS EN EL SALVADOR</p>
<h1>{e(title)}</h1><p class="service-detail-lead">{e(service['intro'])}</p>
<a class="button button--secondary" href="../index.html?servicio={service['key']}#diagnostico" data-track="contact-diagnostico">Consultar este servicio</a>
<section aria-labelledby="alcance"><h2 id="alcance">Qué podemos trabajar contigo</h2><ul>{''.join('<li>'+e(item)+'</li>' for item in service['items'])}</ul><p>Primero revisamos tu necesidad para definir prioridades. Los entregables, condiciones y costos se acuerdan en una propuesta antes de contratar.</p></section>
<section aria-labelledby="preguntas"><h2 id="preguntas">Preguntas frecuentes</h2>{''.join('<details><summary>'+e(q)+'</summary><p>'+e(a)+'</p></details>' for q,a in service['faq'])}</section>
<section aria-labelledby="contacto"><h2 id="contacto">Hablemos de tu necesidad</h2><p>Comparte el contexto de tu empresa sin incluir contraseñas ni información sensible.</p><a href="mailto:info@jj-ti.net" data-track="contact-email">info@jj-ti.net</a> · <a href="tel:+50379124962" data-track="contact-phone">+503&nbsp;7912&nbsp;4962</a> · <a href="https://wa.me/50379124962" data-track="contact-whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a></section>
</main>
<footer class="service-page-footer container"><label class="theme-control" hidden><span class="sr-only">Apariencia</span><select aria-label="Apariencia" data-theme-select><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label><a href="../privacidad.html" data-track="privacy">Privacidad</a><button type="button" class="privacy-settings" data-analytics-settings>Preferencias de analítica</button><p>© 2026 JJ-TI · El Salvador</p></footer>
<section class="consent-panel" data-analytics-consent hidden aria-label="Preferencias de analítica"><p>Si aceptas, mediremos visitas, tiempo visible y enlaces consultados mediante identificadores aleatorios para mejorar el sitio. Estos datos no se vinculan con tu formulario. Puedes rechazar la analítica o retirar tu permiso.</p><div><button type="button" data-analytics-accept>Aceptar analítica</button><button type="button" data-analytics-reject>Rechazar o retirar</button><a href="../privacidad.html">Más información</a></div><p data-analytics-status role="status"></p><button type="button" data-analytics-close>Cerrar preferencias</button></section>
<script src="../js/config.js" defer></script><script src="../js/analytics.js" defer></script>
</body></html>
'''
    (ROOT/'servicios'/f'{slug}.html').write_text(body)
urls=[origin+'/',origin+'/privacidad.html']+[f'{origin}/servicios/{x["slug"]}.html' for x in services]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+u+'</loc></url>' for u in urls)+'</urlset>\n')
(ROOT/'llms.txt').write_text('# JJ-TI — Soluciones Tecnológicas\n\n> Servicios tecnológicos para empresas en El Salvador. Esta guía facilita descubrir contenido público; no establece una certificación ni garantiza aparición en respuestas de IA.\n\n## Información oficial\n\n- [Inicio]('+origin+'/): oferta, planes y contacto.\n'+''.join(f'- [{x["title"]}]({origin}/servicios/{x["slug"]}.html): {x["description"]}\n' for x in services)+'- [Privacidad]('+origin+'/privacidad.html): tratamiento de consultas y analítica.\n\nContacto: info@jj-ti.net · +503 7912 4962. El alcance, horarios, precios y condiciones se acuerdan en propuesta; no se publican cifras o garantías no verificadas.\n')
print('Servicios, sitemap y llms.txt generados')
