# Backlog operativo

Fuente de verdad: [épica #13](https://github.com/JJ-TI/jj-ti-landing/issues/13). Los issues contienen prioridad, criterios y responsable. Este índice no sustituye su estado vivo.

| Issue | Entrega |
|---|---|
| #14 | Base SEGAF |
| #15 | Recepción por correo y activación |
| #16 | Contexto comercial de planes |
| #17 | Accesibilidad y navegación |
| #18 | CI y pruebas |
| #19 | SEO y documentación |
| #20 | Publicación y rollback |
| #21 | Oferta, casos y medición |

Flujo: issue abierto → PR enlazado → revisión → merge → verificación externa cuando aplique → cierre con evidencia. No cerrar #15/#20 por pruebas simuladas. No hay tablero GitHub Projects creado: esta integración gestiona Issues y PR, no Projects.

P0: recepción y épica. P1: calidad, gobierno y preparación operativa. P2: SEO y decisiones comerciales. Responsable de coordinación: jagvortex-droid. Dependencias: #15 depende de activación del buzón y #20; #20 depende de CI y revisión; #21 depende de información comercial real.

Revisión de diseño: #23 — estilo glass, tarjetas con gráficos propios e incorporación de diseño de software. Implementación en PR #22 y vista previa en Pages.

## Funcionalidad y operación

Épica #24: #25 API/SMTP, #26 analítica consentida, #27 observabilidad nativa, #28 enlaces/SEO/IA, #29 despliegue y evidencia. El diseño se conserva. Las capacidades se revisan en un PR separado y la habilitación externa sigue pendiente por decisión del usuario.

P0 #31: seguridad y costos GCP antes de habilitar backend; host, IAM, perímetro, límites económicos y adaptación VM/Cloud Run. [Guía](operations/GCP-SECURITY.md). Controles PROPOSED, no infraestructura aplicada.

Contenido #32: copy empresarial, CTA, software, microcopy y SEO conservando estructura y lógica. Rama ai/chatgpt/32-landing-copy, apilada sobre PR #30. Evaluación y evidencia: [LANDING-COPY](../reports/LANDING-COPY.md). No supone habilitación del backend ni mejora de conversión medida.

Experimento #34: diagramas técnicos del mockup 01 + tarjetas editoriales del 03, exclusivamente en #problema. Rama ai/chatgpt/34-experimental-problem-visual sobre #33. Revisión visual pendiente; no reemplazar main. [Evidencia](../reports/PROBLEM-VISUAL-EXPERIMENT.md).

Interacciones #36: continuar en la misma rama/PR #35 con respuesta de botones, menú y formulario. Mejora progresiva local, movimiento reducido, teclado y touch; sin cambios de lógica de envío. [Evidencia](../reports/INTERACTIONS-EXPERIMENT.md).

Tema y especialidades #37: selector Sistema/Claro/Oscuro, persistencia visual opcional y cinco accesos de servicios en la misma rama/PR experimental #35. Evidencia: reports/THEME-EXPERIMENT.md.

Refinamiento #38: selector sustituido por botón sol/luna junto al menú; sistema por defecto y alternancia binaria con preferencia manual recordada. Misma rama experimental/PR #35.
