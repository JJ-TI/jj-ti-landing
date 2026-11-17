# Estado real — Funcionalidad y observabilidad

Épica #24; tareas #25–#29. Rama ai/chatgpt/24-production-observability, basada en el diseño de PR #22. El usuario pidió preparar despliegue reproducible y no ha seleccionado infraestructura.

| Capacidad | Estado y evidencia |
|---|---|
| Diseño glass, paleta e Inter | Conservados; revisión visual anterior #23 |
| Navegación y páginas de servicios | IMPLEMENTED; enlaces/fragmentos/recursos validados y recorridos de navegador probados |
| Registro durable, cifrado e idempotencia | IMPLEMENTED y TESTED con PostgreSQL real |
| Worker SMTP, reintentos y dead letters | IMPLEMENTED y TESTED con servidor SMTP de laboratorio; no correo real a JJ-TI |
| Analítica consentida y seudónima | IMPLEMENTED y TESTED: consentimiento, retirada, GPC, eventos, visitas entre pestañas, TTL y tiempo visible |
| OpenTelemetry y Prometheus nativos | IMPLEMENTED y TESTED: métricas HTTP, logs/trazas enviados a receptor OTLP de laboratorio, sin PII evaluada |
| Grafana/Prometheus/Collector/Loki/Tempo | Configuración y dashboards IMPLEMENTED; stack completo NO habilitado ni validado extremo a extremo localmente (límite de disco) |
| Docker y gateway | Imagen API construida y Caddy adaptado; validación Compose PASS; configuración adicional se verifica en CI |
| Backup/restore | TESTED en base aislada con datos sintéticos; custodiar claves y backups reales pendiente |
| SEO y búsqueda con IA | HTML por servicio, JSON-LD, sitemap y llms.txt IMPLEMENTED y validados; ranking, indexación y citas NOT_ASSESSED |
| Producción y notificaciones | PROPOSED; host, DNS/TLS real, SMTP real, destino de alertas, claves y aceptación humana pendientes |
| PACA formal | NOT_ASSESSED; no puntuación ni certificación |

Evidencia: reports/FUNCTIONAL-READINESS.md y checks del PR. Preview Pages: solo frontend, sin envío ni analítica. No confundir preview con backend habilitado o pruebas de laboratorio con entrega al buzón.

## Iteración de contenido — #32

Rama ai/chatgpt/32-landing-copy sobre PR #30. Copy revisado por sección: propuesta de valor, servicios/MSP, desarrollo de software, alcance de planes, proyectos, consultoría, proceso, CTA, formulario, WhatsApp y metadatos. Se conservan estructura, navegación, CSS, recursos gráficos, lógica de API y valores técnicos del formulario. Página de software y fuente/generador alineados; pruebas existentes adaptadas solo a etiquetas/mensajes. Evaluación editorial y evidencia en reports/LANDING-COPY.md. Sin resultados comerciales medidos ni producción habilitada.

## Experimento visual — #34

El usuario eligió combinar diagramas 01 con estilo editorial 03. Rama ai/chatgpt/34-experimental-problem-visual sobre #33. Solo #problema: SVG decorativos locales, números dorados, tarjetas claras y acentos navy/cyan. Copy aprobado y demás secciones intactos; sin cambios JS/API. Estado IMPLEMENTED y TESTED localmente (verify: 38/38); aceptación visual pendiente. Evidencia: reports/PROBLEM-VISUAL-EXPERIMENT.md. Preview aislado bajo experimental/problemas/, sin envío/analítica, no reemplaza la portada de Pages.

Continuación #36 en la misma rama y PR #35: microinteracciones en botones, menú y formulario mediante css/interactions.css y js/interactions.js, cargados solo en la landing. Contenido, destinos, JS funcional y API conservados; script visual sin red/almacenamiento/lectura de datos. Validación y límites en reports/INTERACTIONS-EXPERIMENT.md. La referencia a 2027 es una dirección de diseño, no una predicción acreditada. Aceptación visual sigue pendiente.

Continuación #37: tema Sistema/Claro/Oscuro en landing, servicios, privacidad y confirmación; preferencia visual independiente de analítica. Franja de especialidades transformada en accesos reales con iconos. Misma rama experimental/PR #35; validación y aceptación visual pendientes. Detalle: reports/THEME-EXPERIMENT.md.

#38 sustituye el select de #37 por un botón sol/luna de 44 px, alineado al menú, con aria-pressed y foco visible. Sin elección guardada sigue al sistema; cada pulsación alterna y recuerda preferencia. Generador, servicios, privacidad y confirmación alineados. Validación final en checks del PR #35; aceptación visual pendiente.
