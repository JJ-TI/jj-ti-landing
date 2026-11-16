# Revisión de diseño glass — #23

Estado: IMPLEMENTED y TESTED localmente, pendiente de aceptación estética del usuario. Base: f9135e934cc52376e0e65934d29d6d91c2ea5f5d.

## Cambios

Se conservan la paleta y la familia Inter. Hero, servicios, planes y formulario usan bordes luminosos, transparencias contenidas y superficies con blur; se incluyen fondos sólidos cuando no hay soporte de backdrop-filter. Las tarjetas dejan de repetir numeración e iconos hexagonales: dos servicios principales y cuatro especialidades con gráficos SVG/CSS propios. Seguridad y Respaldo se presentan juntos como Seguridad y Continuidad, manteniendo ambas necesidades seleccionables.

Diseño de software aparece en la introducción, navegación, tarjeta propia, sección detallada, proyectos y formulario. El CTA de software selecciona Proyecto puntual y la necesidad correspondiente, sin cambiar precios, SLA ni afirmar entregables no acordados. El usuario autorizó ampliar el catálogo en esta conversación.

## Evidencia

- npm run verify con PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium: 28/28 pruebas PASS, incluidos axe y el contexto de consulta de software en escritorio/móvil.
- npm run lint y npm run check: PASS. git diff --check: PASS.
- Generación de preview y comprobación en Chromium de 1440, 1024, 820, 768, 390 y 320 px: sin desbordamiento horizontal; envío deshabilitado.
- Capturas de servicios en 1440 y 390 px revisadas visualmente. Los gráficos no presentan métricas ni testimonios inventados.

El blur no se considera un requisito funcional y no hay animaciones continuas nuevas. Las pruebas no certifican accesibilidad completa ni rendimiento de campo. La recepción productiva del correo sigue pendiente de verificación. Pages se actualiza por separado con el artefacto de preview, sin transmitir formularios.
