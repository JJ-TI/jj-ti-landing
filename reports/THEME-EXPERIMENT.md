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

## Refinamiento #38 — botón de tema

El usuario aprobó el tema y la franja, y pidió sustituir únicamente el selector. Botón sol/luna, objetivo 44×44 px, esquinas de 13 px, colores de marca, foco visible, título que anuncia la acción y aria-pressed con nombre estable «Modo oscuro». La primera visita sigue al sistema; sin preferencia manual responde a sus cambios. Cada pulsación alterna y guarda light/dark, también al navegar. Storage bloqueado conserva funcionamiento en la página. No se fuerza un modo fijo por defecto ni se borra una elección anterior del usuario.

Se conserva preferencia v1 para usuarios del experimento anterior. Ya no hay opción Sistema en la interfaz; borrar esa preferencia del navegador restablece seguimiento automático. Privacidad actualizada. Las pruebas existentes de tema verifican alternancia, estado accesible, sistema, persistencia, navegación, storage bloqueado y contraste. Resultado final por SHA en comentario de PR/checks. No modifica envío ni backend.
