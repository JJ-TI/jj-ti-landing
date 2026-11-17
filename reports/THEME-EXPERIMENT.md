# Tema y especialidades — #37

IMPLEMENTED en ai/chatgpt/34-experimental-problem-visual, PR #35. Revisión visual y merge pendientes; backend no habilitado.

## Alcance

- js/theme.js: carga síncrona antes de CSS; preferencia inicial del sistema, selector Sistema/Claro/Oscuro, almacenamiento opcional únicamente de light/dark; cambios del sistema y sincronización entre pestañas. Sistema elimina la elección guardada. No genera identificadores, peticiones o eventos de analítica. Cambiar tema suspende transiciones brevemente para evitar contraste transitorio incorrecto.
- css/theme.css: tokens oscuros y overrides de superficies, formulario, cabecera, paneles y mensajes; identidad navy/dorado conservada. Ilustraciones de producto sobre superficies claras para legibilidad. Foco visible y selector nativo.
- index.html: selector en cabecera y cinco accesos con iconos a páginas existentes. Diseño responsive 5/3/2 columnas. Sin enlaces vacíos o controles decorativos que aparenten acciones.
- servicios/*.html y scripts/generate_services.py: recursos y selector consistente, sin perder elección al navegar.
- privacidad.html: selector y explicación de preferencia local, separada de analítica.
- gracias.html: tema y selector coherentes, sin modificar semántica de recepción.
- tests/theme.spec.js: sistema/persistencia/reset/navegación, storage bloqueado, contraste oscuro y overflow; escritorio y móvil.
- docs/BACKLOG.md y docs/ai/CURRENT_STATUS.md: trazabilidad.

No se modifican API, payload, idempotencia, envío, consentimiento o backend. Nuevos enlaces usan taxonomía de clic existente. Sin JS el sitio queda claro y los selectores no se muestran; enlaces y contenido permanecen utilizables.

## Verificación

Validación final en curso: npm run verify (incluye 6 escenarios de tema añadidos a los 38 existentes), revisión de capturas y preview aislado. Primer intento paralelo de suites compartió directorio de artefactos y produjo ENOENT; se repite en una sola ejecución. Prueba inicial de contraste detectó transición de colores no sincronizada; corregida antes de la ejecución final. No se presentan esos intentos como PASS.

Capturas de tema oscuro revisadas; mediciones de ancho 1440/1024/768/390/320 sin overflow. Preview experimental/problemas mantiene noindex, formulario y analítica desactivados; portada principal preservada. No implica certificación WCAG ni comprobación exhaustiva en todos los navegadores.
