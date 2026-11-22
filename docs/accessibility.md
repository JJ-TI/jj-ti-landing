# Accesibilidad de la landing

## Alcance

Objetivo: WCAG 2.1 AA. Esta página registra las verificaciones de la entrega
correspondiente a los puntos 1–8; no constituye una declaración de conformidad
integral. La auditoría automática no sustituye una revisión humana.

## Controles implementados

- HTML semántico, etiquetas de campos, grupos con leyenda y estados `aria-live`.
- Enlace para saltar al contenido y foco visible sobre superficies claras/oscuras.
- Menú con nombre y `aria-expanded` sincronizados, cierre con Escape y devolución
  del foco; cierre al salir del menú, elegir un enlace o pasar a escritorio.
- Navegación y contacto disponibles sin JavaScript; formulario deshabilitado y
  oculto hasta registrar su manejador de envío.
- Texto oscuro sobre verde del botón de WhatsApp y variantes más oscuras de azul
  y dorado para texto sobre fondos claros. Se aumenta contraste del pie de página.
- Respeto a `prefers-reduced-motion`, márgenes de anclaje para el encabezado fijo
  y enlaces de contacto subrayados.

## Verificación automatizada reproducible

```bash
npm run test:accessibility
npm test
```

axe comprueba las etiquetas `wcag2a`, `wcag2aa`, `wcag21a` y `wcag21aa` sin excluir
reglas. Se prueban temas claro/oscuro, menú cerrado y abierto en móvil/tablet y el
formulario preparado en oscuro. Los adjuntos JSON de axe
quedan asociados a cada caso en el reporte de Playwright. Las pruebas funcionales
comprueban Tab, Enter, Escape, foco y anchos 320, 390, 820 y 1440 px; el barrido de layout incluye 768 y 1024 px. No son una
validación humana de teclado o lector de pantalla.

Las pruebas bloquean Google Fonts y otras peticiones externas para ser
reproducibles sin enviar datos. Por eso falta validar la tipografía remota real.

## Revisión humana pendiente antes de afirmar conformidad

- [ ] Recorrer la página completa con Tab/Shift+Tab, Enter y Espacio; confirmar que
  foco y contenido no quedan ocultos por encabezado o botón flotante.
- [ ] Probar lector de pantalla (por ejemplo, NVDA o VoiceOver): títulos, menú,
  etiquetas, errores y aviso de mensaje preparado.
- [ ] Probar zoom al 200% y 400%, reflujo y orientación horizontal.
- [ ] Revisar contraste y legibilidad con las fuentes reales, estados hover/focus,
  alto contraste del sistema y reducción de movimiento.
- [ ] Confirmar que la transición a WhatsApp es comprensible y que no se confunde
  preparar un mensaje con haber enviado una solicitud.

Registrar fecha, navegador, tecnología asistiva y resultados cuando se complete
esta revisión. No marcar estas casillas por el simple resultado verde de axe.
