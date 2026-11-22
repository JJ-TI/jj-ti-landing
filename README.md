# JJ-TI — Landing MVP v1

Landing estática de **JJ-TI — Soluciones Tecnológicas**, para presentar servicios
y preparar solicitudes de diagnóstico por WhatsApp.

## Stack y estado funcional

- HTML5, CSS3 y JavaScript vanilla; sin framework ni compilación para publicar.
- Inter mediante Google Fonts, con fuentes del sistema como alternativa.
- Navegación responsive con enlaces disponibles incluso sin JavaScript.
- El formulario valida los datos y prepara un enlace de WhatsApp. **El visitante
  debe revisar el mensaje y pulsar Enviar en WhatsApp**; preparar el enlace no
  confirma envío ni recepción. No existe backend de formularios.
- Sin JavaScript, o si falla `form.js`, el formulario permanece oculto y
  deshabilitado. Los enlaces directos de WhatsApp y correo siguen disponibles.
- Los datos no se envían automáticamente ni se guardan por el código de esta
  página. Al continuar al enlace preparado se comparten en la URL de WhatsApp;
  no deben incluirse contraseñas ni información sensible. No hay analítica propia.

## Ejecutar localmente

Para servir la web solo necesitas Python 3:

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080`. Node y las herramientas siguientes solo se necesitan
para desarrollar y verificar cambios, no para servir el sitio publicado.

## Herramientas y verificaciones

Requisitos: Node 24 (`.nvmrc`), Python 3.12+, Java 17+ y Bash/curl para el
escaneo de secretos. El script de Gitleaks admite Linux x64 y ARM64.

```bash
npm ci --ignore-scripts
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
npx playwright install chromium
```

En una máquina Linux sin bibliotecas de navegador, instala también los
prerrequisitos con `npx playwright install --with-deps chromium`.

```bash
npm run check
.venv/bin/html5validator index.html
npm run scan:secrets
```

`npm run check` ejecuta ESLint, Stylelint, enlaces locales y pruebas de navegador.
Playwright inicia y detiene su propio servidor en el puerto 8765; ese puerto debe
estar libre. No reutiliza servidores ajenos. Las pruebas bloquean peticiones
externas y no envían mensajes de WhatsApp ni correos.

Para usar un Chromium ya instalado puedes indicar
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`. En entornos con
caché de navegadores en otra ubicación, usa `PLAYWRIGHT_BROWSERS_PATH` tanto al
instalar como al ejecutar Playwright.

Los 44 casos se distribuyen entre escritorio (1440 px), tablet (820 px), móvil
(390 px) y móvil pequeño (320 px). Cubren recursos, fragmentos internos, ausencia de desbordamiento,
teclado, menú, validación y preparación de contacto, ausencia/fallo de JavaScript
y accesibilidad automatizada con axe en temas claro y oscuro. También cubren
preferencias del sistema, almacenamiento bloqueado, movimiento reducido,
diagramas y selección de consulta de software. Los resultados y adjuntos axe quedan en
`playwright-report/` y `test-results/` (ignorados por Git).

Consulta [el alcance y las comprobaciones de accesibilidad](docs/accessibility.md).

## Integración continua y seguridad

[CI](.github/workflows/ci.yml) conserva el check `Validate project` e incorpora
HTML, linters, enlaces, Playwright y axe. El job `Secret scan` comprueba historial
y árbol de trabajo con Gitleaks 8.30.0, descargado desde su release oficial y
verificado contra SHA256 fijado. Los resultados del scanner se redactan.

Las acciones se fijan a SHA y usan permisos de lectura por job, sin persistir
credenciales Git. Dependabot revisa semanalmente las acciones y herramientas npm.
Las dependencias npm son de desarrollo y están fijadas en `package-lock.json`.

El workflow está definido en el repo; su ejecución remota y la protección de
ramas/checks obligatorios deben comprobarse en GitHub. Los cambios locales no
habilitan por sí solos esas protecciones ni publican la web.

## Estructura

```text
jj-ti-landing/
├── .github/                 # CI y Dependabot
├── assets/                  # diagramas SVG locales de problemas y software
├── css/                     # base visual, glass, interacciones, temas, footer y software
├── docs/accessibility.md    # alcance y checklist de accesibilidad
├── js/                      # main, navigation, form, whatsapp, theme, interactions
├── scripts/                 # enlaces locales y escaneo de secretos
├── tests/                   # pruebas funcionales y axe
├── index.html
├── package.json             # herramientas de desarrollo
├── package-lock.json
├── playwright.config.cjs
├── requirements-dev.txt
└── README.md
```

## Capa visual experimental integrada

Se incorporan los diagramas de problemas y software, tarjetas glass,
especialidades con iconos, microinteracciones, cabecera, footer y temas claro/oscuro
procedentes del experimento visual del PR #35 (commit
`fea4b36c9d63ba69c94ce03524c7a93ad015689f`). Se adaptan a esta landing estática;
los enlaces conducen a secciones presentes y el contacto continúa por WhatsApp.

El tema sigue al sistema hasta que el visitante elige otro. Solo esa preferencia
visual se guarda en `localStorage`, bajo `jjti-theme-v1`; no se almacena el
contenido del formulario ni se incorpora analítica. Si el almacenamiento falla,
el cambio de tema sigue funcionando durante la visita. Las redes sociales sin
URL real se muestran como pendientes, sin enlaces falsos.

[Alcance de la integración visual](docs/visual-integration.md): no se integra el
backend, base de datos, proveedores, analítica, contenedores ni infraestructura
de la rama experimental. Su evaluación queda para una entrega posterior.

## Configuración de contacto

El número público actual es `50379124962`. Los enlaces HTML de WhatsApp deben
conservar ese destino incluso sin JavaScript. Al cambiarlo, actualiza todos los
enlaces `https://wa.me/` de `index.html` y la expectativa de destino en las pruebas.
`form.js` toma el destinatario del enlace marcado `data-contact-whatsapp`;
`whatsapp.js` añade el saludo a los contactos que no lo incluyen.
El teléfono es información pública de contacto, no una credencial.

## Pendientes de producto y operación

- Logo oficial, favicon y recursos visuales definitivos.
- Confirmar recepción real del mensaje desde la cuenta comercial de WhatsApp.
- Definir hosting, despliegue, rollback y cabeceras de seguridad.
- Completar canonical, metadatos sociales, sitemap/robots según el hosting.
- Medir Core Web Vitals en el sitio publicado.
- Completar revisión humana con lector de pantalla, zoom y fuentes reales.
- Si se incorpora backend: definir privacidad, retención, validación del servidor
  y protección contra abuso antes de activarlo.

## Referencia de la mejora

Esta entrega aborda los puntos 1–8 de la evaluación contra SEGAF, consultado en
el commit `e0693ac41dd3f6b190e3104180b7164f226ab412`. Se toman como referencia
[UIX](https://github.com/JJ-TI/segaf/blob/e0693ac41dd3f6b190e3104180b7164f226ab412/handbooks/ui-ux/README.md),
[SEH](https://github.com/JJ-TI/segaf/blob/e0693ac41dd3f6b190e3104180b7164f226ab412/handbooks/software-engineering/README.md),
[SEC](https://github.com/JJ-TI/segaf/blob/e0693ac41dd3f6b190e3104180b7164f226ab412/handbooks/security/README.md)
y [DOCSYNC](https://github.com/JJ-TI/segaf/blob/e0693ac41dd3f6b190e3104180b7164f226ab412/standards/global/DOCUMENT_SYNCHRONIZATION.md).
No constituye certificación integral ni adopción de los puntos 9–16.
