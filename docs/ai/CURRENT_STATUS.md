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
