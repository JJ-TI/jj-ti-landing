# Brief — Sitio funcional y plataforma operativa

Estado: PROPOSED para revisión de despliegue, implementación autorizada. Épica #24; base visual #13/#23.

## Objetivo

Convertir consultas en solicitudes durables, hacer observable la salud del sitio y conocer intereses y visitas recurrentes de navegadores que aceptan analítica. Mantener colores, tipografía y diseño. El usuario decidió dejar infraestructura y habilitación pendientes.

## Alcance

Frontend estático con seis servicios y contacto contextual; API Node/PostgreSQL; outbox SMTP; analítica seudónima sin unión a leads; OTLP/Prometheus/Grafana; SEO HTML/JSON-LD y fuentes accesibles a buscadores/IA; despliegue Docker reproducible y pruebas.

## Aceptación

- Todos los enlaces internos tienen destino; teléfono/correo/WhatsApp expresan acciones reales. Proveedores externos no tienen disponibilidad garantizada por el sitio.
- Confirmación solo tras persistencia; idempotencia para reintentos JS y referencia durable. SMTP aceptado no equivale a correo recibido/ leído.
- API valida consentimiento y campos. Cliente y servidor respetan GPC/DNT para analítica. No se envían contenido de formularios, queries, IP o huellas como eventos.
- Visitas agrupadas entre pestañas; active significa heartbeat de 90 s y tiempo visible no garantiza atención.
- Logs correlacionados y métricas con cardinalidad acotada; paneles no públicos y rol SQL de agregados.
- No declarar ENABLED sin host, TLS/DNS, recepción real, notificaciones, restore y aceptación humana.

## Clasificación propuesta

M / fullstack-monorepo / internal-product / PUBLIC_INTERNET / MEDIUM / A1_STANDARD / solo_with_ai. PII cifrada requiere custodia de claves y revisión de privacidad; no hay datos financieros solicitados. No se inventan roles aprobadores, SLA, certificaciones, testimonios o resultados PACA.

ADR-002 sustituye el receptor FormSubmit propuesto en ADR-001. El correo y los secretos son configuración externa, no entregables ficticiamente habilitados por esta rama.
