# JJ-TI — Landing MVP v1

Landing MVP para **JJ-TI — Soluciones Tecnológicas**.

## Stack
- HTML5 semántico
- CSS3
- JavaScript vanilla
- Inter vía Google Fonts

No requiere framework ni build para esta primera versión.

## Ejecutar localmente

Puedes abrir `index.html` directamente, o usar un servidor local:

```bash
python -m http.server 8080
```

Luego visita `http://localhost:8080`.

## Estructura

```text
jj-ti-landing/
├── index.html
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo/
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   ├── sections.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── navigation.js
│   ├── form.js
│   └── whatsapp.js
└── README.md
```

## Pendiente para v2
1. Logo oficial y favicon.
2. Número real de WhatsApp en `js/whatsapp.js`.
3. Backend/servicio para recibir el formulario.
4. Imágenes definitivas.
5. SEO técnico adicional: canonical, Open Graph image, Schema.org, sitemap y robots.
6. Auditoría de accesibilidad y rendimiento.
7. Despliegue.

## Principios
Separación de responsabilidades, variables centralizadas, componentes reutilizables, JavaScript modular, HTML semántico, responsive-first, accesibilidad, SEO y dependencias mínimas.
