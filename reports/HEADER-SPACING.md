# Cabecera — #39

Misma rama experimental/PR #35. Se corrige el margen automático anterior, que dejaba la navegación pegada a la marca y el hueco grande antes del tema. Ahora la navegación ocupa el área derecha, con aire tras la marca, enlaces a 30 px, separación adicional para CTA y tema. En escritorio compacto se mantienen 22 px, sin comprimir a 14 px como antes.

Hasta 1023 px: menú flotante con 12 px de separación vertical, márgenes laterales, esquinas y sombra discretas. Cada enlace tiene área de pulsación holgada; altura máxima según viewport y scroll interno. En móvil conserva 20 px de margen. Toggle y tema quedan a la derecha, separados. JS de cierre al redimensionar y animación actualizados a 1023 px. Escape, foco, selección y bloqueo de scroll mantienen comportamiento.

Archivos de producto: css/theme.css, css/interactions.css y js/navigation.js (solo umbral de resize). HTML, contenido, destinos, tema y API no modificados. Documentación: docs/BACKLOG.md, docs/ai/CURRENT_STATUS.md y este informe.

Verificación local de geometría: 1440/1280/1150/1024/1023/768/390/320 sin overflow; navegación separada de la marca en escritorio. Recorrido tablet→escritorio comprobó cierre y desbloqueo de scroll. Capturas de escritorio y menú móvil revisadas. npm run verify y CI: ver resultado final en checks/comentario del PR; no se presenta resultado pendiente como aprobado.

Preview aislado experimental/problemas; portada estable conservada. Revisión visual pendiente. Sin cambios de infraestructura ni backend.

## Ajuste de amplitud solicitado

Solo desde 1024 px: .site-header .header__inner pasa a máximo 1320 px con márgenes mínimos de 24 px. En viewport de 1440 px, los márgenes pasan de 120 a 60 px; logo y conjunto menú/tema se acercan 60 px a sus respectivos extremos. Por debajo de 1024 px la regla no aplica. No cambia HTML, JS, cuerpo, tipografía, distancias entre enlaces o altura. La comprobación final se registra por SHA en el PR #35.
