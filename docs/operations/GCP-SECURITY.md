# Seguridad y consumo en GCP — #31

Estado: PROPOSED; proveedor probable, servicio y región sin elegir. No hay recursos GCP creados, controles de cuenta verificados ni autorización de gasto. Complementa [producción](PRODUCTION.md), no es configuración aplicada. Fuente SEC: SEGAF b33555bdfb50fc558d73c4a96a0fc1264fd7d2df, handbooks/security/README.md y handbooks/architecture/SECURITY_STANDARDS.md.

## Responsabilidad y arquitectura

JJ-TI responde por IAM, red, aplicación, datos, secretos, parches que correspondan, backups, monitoreo y consumo. Un contenedor no es una frontera suficiente contra compromiso del host. GCP mantiene la infraestructura física; Cloud Run administra además el host, pero no decide nuestros permisos, ingreso, lógica o límites económicos. Compute Engine requiere administrar SO y runtime. Compose no implementa hardening del host ni IAM de GCP.

| Opción | Requisitos antes de publicar |
|---|---|
| Compute Engine | SO soportado y parchado, Shielded VM cuando sea compatible, OS Login/IAP y MFA administrativo; sin SSH abierto a Internet. Preferir VM sin IP pública detrás de LB y acceso de salida controlado. Firewall permite únicamente tráfico y sondas necesarios según topología. Administración Docker restringida: su socket/grupo equivale a privilegios sobre el host. |
| Cloud Run | Adaptar contenedor al contrato de puerto HTTP de Cloud Run y TLS terminado en plataforma; no trasladar Compose completo. Limitar ingreso al LB compatible y probar que run.app/rutas alternativas no eludan WAF. Definir cuenta dedicada, concurrencia, timeouts e instancias máximas; verificar comportamiento de límites del servicio/revisión con documentación vigente. |

Para ambas opciones: HTTPS LB compatible con Cloud Armor si se elige ese perímetro, políticas WAF y rate limiting ensayadas, CDN solo para contenido estático cacheable. Formularios, analítica y health no se cachean. La mitigación volumétrica depende de la topología/producto; no se declara protección total ni activación por usar GCP. LB, WAF, reglas y logs pueden generar costos incluso al rechazar ataques.

Impedir acceso directo al origen: firewall/ingreso según plataforma, no confiar en ocultar la IP. Verificar IP cliente y cadena de proxies sin aceptar X-Forwarded-For arbitrario; la configuración Compose actual no se debe reutilizar sin revisar el nuevo LB. Nunca publicar PostgreSQL, Docker API, métricas, OTLP, Loki, Tempo o Grafana. Administración con identidad autenticada, acceso mínimo y auditoría.

## Identidad y datos

- MFA para administradores; evitar cuentas compartidas y roles Owner/Editor en workloads. Cuenta de servicio por función con permisos mínimos y sin claves descargables cuando sea posible.
- CI con Workload Identity Federation restringida a repo/rama/entorno revisados; sin claves JSON permanentes. No otorgar automáticamente permisos de despliegue al workflow actual.
- Secret Manager con acceso por secreto, custodia y rotación planificada. Rotar DATA_KEY exige migrar datos; nunca regenerarla sobre DB existente.
- Revisar acceso al servidor de metadatos e identidad de runtime, prevenir SSRF y limitar salida. Una app comprometida puede abusar de permisos de su cuenta aunque el host esté administrado.
- DB privada y roles mínimos, conexiones y TLS según producto; backups cifrados con retención, acceso separado y restauración probada. El cifrado de disco no sustituye el cifrado del formulario.
- Audit Logs para cambios IAM/infraestructura y accesos necesarios; definir retención y costo, evitando cuerpos, credenciales y datos personales en logs.

## Compatibilidad pendiente de Cloud Run

La versión actual combina API, migración, worker por intervalos y exportador Prometheus en un segundo puerto; mantiene rate limits en memoria. No está validada para Cloud Run. Separar o adaptar procesamiento durable, migración de release y telemetría: CPU/suspensión/escalado a cero pueden detener intervalos, y el puerto privado de métricas no equivale a endpoint accesible. Usar PostgreSQL persistente externo, limitar conexiones por instancia y límite global. Rate limiter compartido para múltiples instancias. No almacenar DB, backups o estado durable en filesystem efímero. Registrar decisión y ensayar fallos antes del despliegue.

## Protección económica y agotamiento de recursos

Presupuestos y alertas de facturación NO son un tope de gasto y pueden llegar tarde. Máximo de instancias tampoco limita por sí solo LB, WAF, DB, almacenamiento, red o logs. No se promete gasto máximo con esos controles.

Antes de ENABLED, el responsable define valores revisados para: instancias/tamaño o grupo de VMs, CPU/memoria/PIDs y disco de contenedores, conexiones DB, crecimiento de tablas/cola, tráfico y salida, envíos SMTP, ingesta/retención de logs/trazas/métricas y backups. Compose actual no incluye límites completos de recursos o rotación de logs Docker: siguen pendientes para un host real.

Configurar cuotas disponibles, alertas de presupuesto con varios umbrales acordados, avisos de anomalías/consumo y responsables con acceso. Verificar comportamiento y costo vigente de cada producto. Reducir muestreo/volumen de telemetría ante abuso; los rechazos también pueden inundar logs. Mantener límites perimetrales y de aplicación; Origin no detiene bots y límites por IP no detienen DDoS distribuido.

Preparar y ensayar contención reversible: restringir temporalmente ingreso o endpoints atacados, limitar escalado y procesamiento, preservar DB/claves/evidencia y notificar al responsable. No automatizar borrado de datos ni desactivar facturación como supuesto corte seguro; puede interrumpir servicios y recuperación.

## Evidencia necesaria

Issue #31 contiene el checklist vivo. Antes de habilitar: elegir plataforma, documentar flujo y fronteras de confianza, completar scanners SEC pendientes (SAST, Gitleaks/TruffleHog, imágenes, SBOM, SCA periódico), verificar protecciones de repositorio, probar origen bloqueado y privilegios mínimos. Ejecutar carga acotada solo en entorno autorizado, comprobar límites y alertas de seguridad/costos, restauración y procedimiento de incidentes. Registrar versión, resultados y revisión humana sin publicar secretos. No ejecutar ataques de saturación al sitio público ni crear infraestructura desde esta guía.

