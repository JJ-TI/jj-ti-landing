# JJ-TI — Landing v2

Sitio estático de servicios tecnológicos para empresas de El Salvador. HTML, CSS y JS sin build de producción. [Backlog](docs/BACKLOG.md) · [Brief](docs/product/BRIEF.md) · [Operación](docs/operations/RUNBOOK.md) · [Estado real](docs/ai/CURRENT_STATUS.md).

## Desarrollo

Requisitos: Node 22+, Python 3.12+, Chromium de Playwright.

```bash
npm ci
python3 -m pip install -r requirements-dev.txt
npx playwright install chromium
npm run verify
python3 -m http.server 8080
```

Si ya tienes Chromium del sistema, usa PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium. Las dependencias npm son solo de desarrollo; no se cargan en el sitio.

## Recepción

Formulario configurado para FormSubmit → info@jj-ti.net, con errores recuperables y contexto de plan. Requiere activación del propietario del buzón y prueba real de entrega: [runbook](docs/operations/RUNBOOK.md). El envío mock en pruebas no habilita recepción productiva. WhatsApp: 50379124962, disponible también sin JS.

## Validación

- npm run lint: ESLint, Stylelint y HTML Validate.
- npm run check: manifiesto contra esquema SEGAF fijado, integridad del esquema y enlaces/recursos locales.
- npm test: flujos de navegador y axe en escritorio/móvil, con proveedor interceptado (sin correo real).
- CI ejecuta controles y escaneo de secretos; evidencias en cada PR. ui-tokens-check no se presenta como habilitado.

## Publicación

Para revisar el diseño sin publicar en el dominio comercial, hay una rama gh-pages con formulario deshabilitado. [Activar y actualizar la vista previa](docs/operations/PREVIEW.md). La activación requiere la configuración Pages del propietario.

Archivos públicos: index.html, privacidad.html, gracias.html, favicon.svg, robots.txt, sitemap.xml, assets/, css/ y js/. No subir documentación, dependencias o pruebas al alojamiento. No se configura despliegue automático en este cambio. Origen propuesto: https://jj-ti.net/; confirmar antes de publicar.

## Gobierno

project.yaml v2 usa JSON válido como YAML 1.2 y referencia SEGAF por commit inmutable. La clasificación es PROPOSED y requiere revisión humana; validar esquema no aprueba riesgos ni roles. Revisar AGENTS.md y ADR-001. No se afirma cumplimiento PACA ni producción habilitada.

