# ADR-002 — API propia, analítica consentida y observabilidad abierta

Estado: PROPOSED para despliegue; implementación autorizada por el usuario. Sustituye la integración FormSubmit propuesta en ADR-001. Épica #24; tareas #25–#29. El usuario pidió despliegue reproducible sin habilitar infraestructura externa y aceptó analítica seudónima con consentimiento.

## Decisión

Conservar el frontend estático y el diseño. Añadir un servicio Node 24/Fastify con PostgreSQL. El contacto se confirma tras persistir, con clave idempotente, payload AES-256-GCM y cola SMTP transaccional. Un worker procesa una fila bloqueada por transacción con SKIP LOCKED, reintento exponencial y máximo de cinco intentos. La clave de cifrado se custodia fuera del repositorio y debe acompañar las copias de seguridad de forma separada.

La entrega SMTP es al menos una vez: un fallo entre aceptación SMTP y COMMIT puede duplicar el aviso. Message-ID estable ayuda, pero no garantiza deduplicación en todos los servidores. La solicitud durable sí se deduplica por clave durante su retención. `sent` significa aceptación SMTP, no entrega ni lectura. No se afirma producción habilitada sin probar el buzón real.

La API pública acepta únicamente Origin configurado, valida esquemas y tipos, limita cuerpos y peticiones, firma tokens de sesión y permite solo una taxonomía finita de eventos. Es una API pública de captación; no permite consultar ni exportar prospectos o identidades. Origin y límites reducen abuso, no autentican a un humano ni eliminan spam distribuido. Trust proxy queda restringido a la red del reverse proxy, que es el único acceso público. La primera topología es una instancia de API; escalar exige rate limiter compartido.

## Analítica

Consentimiento previo; GPC/DNT deshabilitan identificación. IDs aleatorios de navegador transformados mediante HMAC antes de persistir, sin huellas, IP o agente persistentes y sin unión con leads. Una visita agrupa pestañas con el mismo identificador dentro de 30 minutos. Una sesión corresponde a una pestaña; activo es último heartbeat menor a 90 s. Tiempo visible se acota al intervalo servidor y a 45 s por actualización. Los valores siguen siendo estimaciones de navegadores consentidos: bots, clientes manipulados, bloqueadores y cambios de dispositivo limitan exactitud.

La revocación borra estado local e intenta borrar las visitas del navegador con su token. Si no se confirma el borrado remoto, la UI lo comunica. Retenciones configuradas: solicitudes 30 días, analítica 90 días, logs/trazas 7 días, métricas 15 días. Las copias y el buzón requieren política operativa adicional. No son una aprobación legal ni de riesgo.

## Observabilidad

SDK OpenTelemetry nativo: métricas Prometheus internas, trazas y logs OTLP/HTTP al Collector. Logs JSON con versión, ruta normalizada, estado y trace/span/request IDs; sin body, query, error crudo, IP ni cabeceras. Histogramas RED y etiquetas de cardinalidad acotada; ningún visitante/sesión/correo como etiqueta Prometheus.

Prometheus recopila métricas y sondas Blackbox; Grafana provisiona un dashboard. Loki recibe logs y Tempo trazas. Grafana consulta solo vistas SQL agregadas mediante un rol sin acceso a tablas de solicitudes o identificadores. Todos estos servicios permanecen en red interna o enlazados a localhost. Credenciales aleatorias, sin usuarios anónimos. No hay acceso público al puerto de métricas.

Alertas de indisponibilidad, fallo de telemetría, errores, DB y cola de correo se evalúan en Prometheus. Los umbrales son iniciales propuestos; no son un SLA. Falta configurar un receptor de notificaciones y un responsable de guardia antes de producción.

## SEO e IA

Seis páginas HTML por servicio, contenido visible equivalente a JSON-LD Organization/Service/Breadcrumb, canonical, sitemap y contacto verificable. llms.txt es un índice complementario, no un estándar de posicionamiento ni una garantía de citación. No se publican ratings, direcciones, horarios o certificaciones inventadas. Se conserva noindex y robots de bloqueo en el preview.

Fuentes: https://developers.google.com/search/docs/appearance/ai-features · https://developers.google.com/search/docs/fundamentals/ai-optimization-guide · https://developers.openai.com/api/docs/bots · https://opentelemetry.io/docs/languages/js/ · https://prometheus.io/docs/practices/naming/
