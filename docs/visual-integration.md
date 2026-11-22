# Integración de la capa visual experimental

## Alcance autorizado

El usuario autorizó incorporar solo la capa visual del experimento de
`ai/chatgpt/34-experimental-problem-visual` (PR #35), consultado en
`fea4b36c9d63ba69c94ce03524c7a93ad015689f`, encima de los puntos 1–8 ya aprobados.
Es una adaptación selectiva; no un merge completo de la rama.

## Componentes incorporados y adaptaciones

- Diagramas SVG locales y tarjetas editoriales en problemas. Se conserva el texto
  previo de esas tarjetas y se ajusta la asociación de ilustraciones al contenido.
- Material glass en hero, servicios, planes, proyectos y formulario; presentación
  de software y su diagrama, con el contenido de servicio del experimento.
- Cabecera más amplia, menú responsive y selector de tema; footer con contacto y
  perfiles sociales explícitamente pendientes hasta disponer de URLs reales.
- Tema del sistema o preferencia local persistida sin identificadores; funciona
  durante la visita si el almacenamiento está bloqueado.
- Microinteracciones de botones, navegación y campos, con movimiento reducido y
  sin interceptar clics o envíos. Coordenadas del puntero efímeras, sin red.
- Enlaces de páginas de servicio del experimento adaptados a las secciones de esta
  landing. El CTA de software selecciona su necesidad en el formulario existente.
- Se conserva navegación sin JavaScript hasta 1023 px y se ajustan variantes de
  contraste oscuro para mantener legibilidad sobre diagramas claros.

## Exclusiones expresas

No se incorporan `server/`, `infra/`, Docker/Compose, esquemas de base de datos,
SMTP, endpoints de contacto, persistencia de solicitudes, métricas, analítica,
consentimiento de seguimiento, preferencias de analítica ni credenciales.
Tampoco se simulan páginas de privacidad o enlaces sociales que no existen aquí.

El formulario mantiene el flujo previamente aprobado: preparar un enlace y
revisar/enviar desde WhatsApp. No se comunica entrega ni recepción automática.

## Resultado local

Estado: IMPLEMENTED y TESTED localmente. Suite completa: 44/44 pruebas aprobadas,
incluidas auditorías axe en claro/oscuro, formulario preparado, teclado,
JavaScript ausente/fallido, preferencias del sistema, almacenamiento bloqueado,
movimiento reducido y layout. HTML, linters, enlaces locales, Gitleaks y
`git diff --check` correctos. No se declara ENABLED en producción.

Se revisaron capturas de problemas, servicios, software y footer en 1440 y
390 px, con temas claro/oscuro. En esas capturas se ocultaron únicamente los
overlays fijos para inspeccionar las secciones; las pruebas se ejecutan con
los componentes normales, sin esa alteración visual.

## Evidencias y límites

Las pruebas están en `tests/landing.spec.cjs` y `tests/visual.spec.cjs`. Ejecutar:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run check
```

Los adjuntos axe quedan en los artefactos de Playwright. Las comprobaciones usan
peticiones locales y datos sintéticos. La revisión de capturas es visual y no
prueba conversión, rendimiento en producción ni compatibilidad con todos los
navegadores. La revisión humana de accesibilidad sigue registrada en
[el checklist de accesibilidad](accessibility.md).

La integración en código y su validación local no equivalen a publicación,
recepción real de WhatsApp ni habilitación del backend. El backend se evaluará
por separado antes de decidir su adopción.
