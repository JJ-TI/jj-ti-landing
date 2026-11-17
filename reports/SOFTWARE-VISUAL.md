# Software empresarial — visual #41

IMPLEMENTED en misma rama experimental/PR #35. Usuario pidió más riqueza visual manteniendo exactamente el contenido. Revisión visual y merge pendientes.

## Cambios

- index.html: añadir diagrama y tres iconos decorativos únicamente en #software, más referencia css/software.css.
- assets/software/blueprint.svg: ilustración propia de flujo, interfaz e integraciones; sin texto, cifras, clientes, estados operativos o afirmaciones nuevas.
- css/software.css: fondo técnico tenue, composición de dos columnas, diagrama bajo CTA y etapas conectadas con superficies y numeración decorativa. Un solo eje en móvil. Temas con tokens existentes; ilustración en superficie clara legible. Sin animación continua, dependencia o JavaScript.
- docs/BACKLOG.md, docs/ai/CURRENT_STATUS.md y este informe: trazabilidad.

Iconos/numeración dentro de contenedores aria-hidden; imagen con alt vacío, dimensiones explícitas y carga diferida. Ningún elemento decorativo aparenta ser control. El texto permanece HTML legible sin imágenes.

## Verificación

Comparación de contenido y CTA: mismo texto y atributos de enlace; resto del HTML idéntico salvo nueva referencia CSS. Revisión responsive 1440/1024/768/390/320 y capturas de ambos temas. npm run verify y resultado final del SHA en checks/comentario PR. No se declara certificación de accesibilidad ni mejora comercial medida.

Preview experimental/problemas conserva bloqueo de envío/analítica; portada estable preservada. Sin cambios de API, formularios, navegación o infraestructura.
