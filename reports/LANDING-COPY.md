# Optimización de contenido — #32

Estado: IMPLEMENTED y TESTED localmente; revisión humana y merge pendientes. Rama ai/chatgpt/32-landing-copy, base funcional PR #30. El usuario aprobó aplicar la revisión editorial manteniendo diseño, estructura, navegación y lógica.

## Criterio de edición previa por sección

| Sección | Evaluación y decisión |
|---|---|
| Marca y navegación | Identidad y destinos claros: conservar marca, nombres del menú y rutas. Cambiar únicamente CTA de contacto para describir una consulta, sin prometer diagnóstico incluido. |
| Hero | Oferta comprensible pero genérica; concretar administración/protección, software e integraciones con resultado empresarial. Conservar ambos canales de contacto y el énfasis tipográfico. |
| Especialidades | Conservar cinco especialidades; precisar soporte empresarial, infraestructura TI y desarrollo de software. |
| Problemas | Conservar los cuatro problemas y sus ilustraciones; explicar el efecto en usuarios, tareas, atención y recuperación sin alarmismo. |
| Soluciones | Conservar seis tarjetas, categorías y destinos; explicitar utilidad y alinear CTA con páginas informativas, no acciones que el enlace no ejecuta. |
| Software | El texto cubría sobre todo diseño/prototipos. Incluir desarrollo web empresarial, sistemas internos, APIs RESTful, integración, pruebas y evolución según alcance autorizado por el usuario. |
| Planes/MSP | Conservar nombres, progresión y cinco prestaciones por plan. Sustituir equivalencia con un departamento completo y precisar recursos incluidos/prioridades acordadas. Conservar mantenimiento preventivo y administración de servidores. |
| Proyectos | Conservar seis ámbitos. Explicar inversión con alcance, compatibilidad, modernización y automatización. |
| Posicionamiento | La evaluación conjunta aporta valor: conservar esa idea y vincular consultoría TI con prioridades y transformación digital. |
| Proceso | Conservar cinco etapas; describir acuerdos, verificación y continuidad contratada. |
| Formulario | Conservar todos los campos, consentimientos, validaciones y valores API. Facilitar describir un problema sin conocer la solución; usar Enviar mi consulta en el envío real. |
| Mensajes | Mantener diferencias entre registro durable, aviso SMTP y revisión humana. Conservar referencia y reintento idempotente; evitar garantizar ausencia de duplicados fuera de la misma página/datos. Mensaje contextual neutro para no mostrar denominaciones internas de API. |
| Footer y WhatsApp | Conservar identidad, datos de contacto y canales; reforzar gestión/software y conversación consultiva. Mensaje prellenado equivalente con y sin JS. |
| Consentimiento | Conservar acciones aceptar/rechazar/retirar y privacidad; explicar finalidad y elección sin presión. Política de privacidad no alterada. |
| SEO | Priorizar servicios TI y desarrollo de software en El Salvador; alinear títulos/descripciones sociales y software visible con JSON-LD. Conservar canonical, URLs, sitemap y alt de imagen social. |

No se añaden secciones, certificaciones, testimonios, cifras de experiencia, garantías de seguridad, atención 24/7, diagnóstico gratuito o tiempos de respuesta. La capacidad de desarrollo procede del alcance comercial indicado por el usuario; no constituye evidencia de proyectos entregados.

## Cambios por archivo

- index.html: copy de las secciones anteriores, etiquetas y CTA; título y descripciones SEO/sociales; texto prellenado WhatsApp sin JS.
- js/form.js: mensajes de validación, selección, registro, confirmación, fallo y reintento; sin cambios de control de flujo, payload, contrato, eventos, idempotencia o timeout.
- js/whatsapp.js: solo mensaje prellenado; mismo número y comportamiento.
- content/services.json: actualizar únicamente contenido del servicio de software; conservar slug, clave, otras cinco entradas y FAQ de viabilidad de integraciones.
- scripts/generate_services.py: solo textos compartidos sobre consulta inicial y consentimiento, evitando prometer diagnóstico; misma generación y estructura.
- servicios/diseno-software.html: página regenerada, metadatos/JSON-LD y contenido de desarrollo empresarial; URL histórica conservada para no romper enlaces.
- servicios/soporte-ti.html, infraestructura-redes.html, cloud-microsoft365.html, seguridad-continuidad.html y cctv.html: únicamente dos párrafos compartidos (consulta inicial y consentimiento); demás contenido útil conservado.
- llms.txt: denominación y descripción de software alineadas, sin prometer indexación/citas.
- scripts/build_preview.py: actualizar literal del botón que el generador deshabilita; mismo bloqueo de envío, sin fetch ni analítica en preview.
- tests/landing.spec.js y tests/analytics.spec.js: actualizar selectores accesibles y expectativas de mensajes; mismos escenarios y aserciones del contrato API.
- docs/BACKLOG.md y docs/ai/CURRENT_STATUS.md: trazabilidad y estado real de esta iteración.
- reports/LANDING-COPY.md: evaluación por sección, cambios, evidencia y límites editoriales.

## Verificación

- Comparación con snapshot anterior: mismo árbol HTML y atributos funcionales en landing y seis servicios. Solo se permiten metadatos de copy, placeholder y mensaje de WhatsApp; mismo destino/número.
- Hashes comparados: CSS, assets, servidor, infraestructura, navegación/analítica/configuración, sitemap, privacidad y gracias sin cambios.
- Comparación AST de formulario/WhatsApp: misma estructura de código y control de flujo; cambios restringidos a literales/mensajes de presentación.
- Preview regenerado: botón deshabilitado, ausencia de fetch en formulario y analyticsEnabled false.
- Revisión de ajuste con Chromium en 1440, 390 y 320 px: sin desbordamiento horizontal del documento ni de títulos/botones/alcances. Capturas revisadas, sin cambios de CSS o componentes.
- npm run verify: PASS local (lint, HTML, esquema/enlaces y 38/38 pruebas de navegador con Chromium del sistema). Ver checks del PR para evidencia remota por SHA. No se repite integración backend porque servidor/contrato no cambian.

## Impacto y puntuación editorial

Confianza: expectativas y alcances más precisos. Autoridad: explicación de procesos, desarrollo e integración. Diferenciación: decisiones con contexto, documentación y seguimiento. Conversión: CTA acordes al destino y menos esfuerzo para describir la necesidad.

| Dimensión | Antes | Después estimado |
|---|---:|---:|
| Credibilidad | 72/100 | 84/100 |
| Profesionalismo | 76/100 | 88/100 |
| Capacidad persuasiva/conversión | 68/100 | 83/100 |
| Experiencia textual de usuario | 78/100 | 85/100 |

Son valoraciones editoriales subjetivas, no métricas de usuarios, auditoría UX o tasas de conversión. La impresión en menos de 10 segundos es un objetivo no verificado mediante estudio de usuarios. Validar consultas calificadas y avances a propuesta cuando el backend esté habilitado con analítica consentida. Incorporar evidencia comercial real solo cuando exista autorización y datos verificables.
