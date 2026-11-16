# Evidencia funcional — #24

Estado: IMPLEMENTED y TESTED en laboratorio; producción NOT_ENABLED. Rama ai/chatgpt/24-production-observability. Base visual: 8b438e485e8aba3cc1d239fae24934e6f56c2707.

## Verificación ejecutada

- `npm run verify` con Chromium del sistema: lint, HTML, schema/enlaces y 38 pruebas de navegador PASS. Incluye seis páginas de servicio, contexto de consulta, consentimiento, revocación, GPC, ausencia de identificadores antes de aceptar, errores, retry, timeout, móvil y axe.
- `npm run test:integration`: 11 pruebas PASS contra PostgreSQL real en Docker y SMTP local sintético. Incluye payload cifrado, idempotencia/conflicto, validación/origen/cuerpo, rate limit, formulario sin JS, retries/dead letter SMTP, TTL/borrado, visitas agrupadas, permisos SQL y backup/restore aislado.
- Los hooks de integración verificaron exportaciones OTLP reales a `/v1/traces` y `/v1/logs` y ausencia del correo sintético en sus buffers. Prometheus respondió en puerto privado de prueba con contadores/histogramas reales.
- `npm audit`: 0 vulnerabilidades reportadas en el lockfile evaluado.
- Escaneo de secretos: PASS con excepción exclusiva de hashes de procedencia (Git/imágenes), no de archivos de aplicación. Se rechazan archivos privados forzados al índice.
- `docker compose ... config --quiet`: PASS. Imagen API construida con Node por digest; la CA de compilación del entorno se pasó mediante BuildKit, sin deshabilitar TLS ni incorporarla a la imagen final.
- Caddy: configuración adaptada con el binario oficial. Métricas/DB/OTLP no publicados en puertos públicos.

## Límites de la evidencia

El stack completo Grafana/Prometheus/Loki/Tempo/Collector no llegó a arrancar junto en este entorno: la descarga/extracción agotó el disco de Docker (driver VFS, entorno de 8 GiB). Se recuperaron cachés de esta tarea; esto no se presenta como una validación completa. Los validadores nativos de Prometheus/Collector y el build se incluyen en CI. La ejecución de CI se registra en el PR por SHA.

La restauración probada es aislada y con datos sintéticos; no acredita backups externos, custodia de claves o RTO de producción. No se enviaron correos reales, no se contrató infraestructura ni se modificó el dominio comercial. Se debe completar el runbook antes de declarar producción.

Las mediciones de visitas son seudónimas, dependientes de consentimiento y manipulables por clientes/bots; no representan personas exactas ni clientes autenticados. La duración es visible/foco, no atención certificada. SMTP es al menos una vez y no garantiza entrega/lectura. No hay certificación WCAG, PACA, SLA o posicionamiento SEO/IA por pasar estos checks.
