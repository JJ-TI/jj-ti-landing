# Experimento visual de problemas — #34

El usuario aprobó explorar iconografía de la propuesta 01 y estilo de la 03. Rama ai/chatgpt/34-experimental-problem-visual; base #33. IMPLEMENTED y TESTED localmente; aprobación visual y merge pendientes.

## Cambios

- index.html: sustituir los cuatro símbolos abstractos por números decorativos y diagramas locales. Conservar encabezado, textos, orden de tarjetas y toda sección externa a #problema.
- assets/problems/fallas.svg: equipo con alerta, línea de incidentes y lupa.
- assets/problems/procesos.svg: aplicaciones, tabla de datos y flujo de información.
- assets/problems/red.svg: punto de acceso, dispositivos y topología.
- assets/problems/recuperacion.svg: servidores, nube, respaldo y camino de recuperación.
- css/glass.css: estilos acotados a #problema; tarjetas claras, numeración dorada, geometría cyan sutil, acento inferior navy. Cuatro columnas escritorio, dos tablet/móvil y una por debajo de 359 px. Sin animaciones nuevas ni apariencia de botones en tarjetas informativas.
- docs/BACKLOG.md y docs/ai/CURRENT_STATUS.md: trazabilidad y carácter experimental.
- reports/PROBLEM-VISUAL-EXPERIMENT.md: evidencia y límites.

Los SVG son ilustraciones vectoriales propias basadas en los motivos del mockup 01, no recortes raster del mockup. Sin librerías, scripts, fuentes o peticiones externas nuevas. Imágenes decorativas con alt vacío/aria-hidden; números no duplican la lectura accesible. Dimensiones explícitas y carga diferida. El texto sigue siendo HTML seleccionable y legible sin imágenes.

## Validación

- Comparación de HTML: fuera de #problema idéntico a la base. Encabezados y párrafos de la sección idénticos.
- Ajuste Chromium 1440/768/390/320 px: sin overflow horizontal, cuatro SVG cargados, columnas 4/2/2/1 respectivamente.
- Capturas de la sección: en las capturas de revisión se ocultan solo overlays fijos (header/WhatsApp/skip-link) para inspeccionar las tarjetas completas; el sitio conserva esos componentes.
- npm run verify: PASS (lint, HTML, esquema/enlaces y 38/38 pruebas de navegador). No se modifica backend ni contratos funcionales.
- Preview estático aislado: experimental/problemas/, sin envío ni analítica. Portada de Pages preservada. Confirmar build y HTTP tras publicar.

No se declara mejora de conversión medida, validación con usuarios ni aprobación de producción. El usuario revisará la sensación visual antes de adoptar el cambio.
