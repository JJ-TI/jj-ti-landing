# Producción y salud — procedimiento

Estado: código y laboratorio separables de ENABLED. El alojamiento sigue sin decidirse. No hay despliegue externo autorizado ni credenciales reales de SMTP en el repositorio.

## Preparar un host

1. Elegir host, dominio y responsable. Verificar compatibilidad Docker Compose actual, recursos, puertos 80/443, DNS y discos cifrados. El stack completo requiere dimensionamiento; no se presupone un VPS mínimo ni alta disponibilidad.
2. Revisar el ADR-002 y privacidad. Confirmar retención, proveedor de correo, backups, destinatario de alertas y responsable operativo. Fijar RELEASE_SHA e IMAGE_TAG a la versión revisada.
3. Generar `.env` local con permisos 0600: `python3 scripts/setup_environment.py --origin https://jj-ti.net`. Completar SMTP (host, TLS, remitente autorizado y credenciales) sin subir el archivo. Usar claves independientes; nunca regenerarlas sobre una DB existente.
4. Generar la configuración de sondas con `python3 scripts/configure_monitoring.py --origin https://jj-ti.net`. Verificar que el origen corresponde al sitio de esta entrega.
5. `docker compose config --quiet`, `docker compose build api`, `docker compose up -d`. Si una red corporativa inspecciona TLS, el Dockerfile permite una CA de compilación mediante un certificado temporal de compilación (`build_ca`); nunca deshabilitar verificación TLS. La CA no se incorpora a la imagen final.
6. La API arranca aplicando migración transaccional con bloqueo asesor. Docker conserva datos en volúmenes. No publicar el directorio del repositorio entero ni puertos DB, métricas, Collector, Loki o Tempo. Grafana/Prometheus solo en localhost, mediante túnel o acceso administrativo autenticado.

## Antes de declarar ENABLED

- HTTPS y DNS correctos; sin mezcla de contenido; páginas, enlaces, metadatos, sitemap y política de robots corresponden al origen final.
- `/health/live` 200 y `/health/ready` 200. Ready verifica DB y SMTP con caché de 60 s; no prueba llegada al buzón.
- Enviar una consulta sintética controlada y verificar su referencia en DB, aceptación SMTP y llegada al buzón real; eliminar datos de prueba. No pegar datos ni credenciales en issues.
- Reintento de la misma clave devuelve la misma referencia; el receptor atiende la cola y los fallos generan alerta.
- Consentimiento rechazado: sin identificadores de visita ni peticiones analíticas. Aceptado: sesiones, eventos y tiempo visible se muestran agregados. Retirada y GPC probados.
- Verificar `up`, `probe_success`, latencia, eventos, DB y cola en Grafana. Buscar un request_id y su trace_id en Loki/Tempo. Configurar notificaciones de alertas en Grafana/Alertmanager y probar que una persona las recibe. Sin esto hay reglas, no guardia habilitada.
- Confirmar lector de Grafana: solo SELECT sobre vistas agregadas; sin SELECT sobre leads, sesiones o eventos.
- Copia y restauración ensayadas. Aceptación humana registrada en el PR y en #29. No equivale a PASS PACA automático.

## Cómo leer las señales

| Señal | Significado |
|---|---|
| `jjti_active_browsers` | Navegadores consentidos con heartbeat en 90 s; no clientes identificados |
| `jjti_active_sessions` | Pestañas/sesiones recientes |
| `analytics_daily` | Visitas agrupadas en 30 min, navegadores y segundos visibles |
| `analytics_interests` | Páginas, secciones y enlaces de taxonomía fija |
| `analytics_returning` | Navegadores con más de una visita dentro de la retención |
| `jjti_http_requests_total` / histograma de duración | Tráfico, errores y latencia por rutas acotadas |
| `jjti_store_up` | Capacidad de consultar PostgreSQL |
| `jjti_mail_queue`, `jjti_mail_oldest_seconds`, `jjti_mail_failed` | Cola pendiente, antigüedad y avisos que agotaron reintentos |
| `probe_success` | Resultado de sonda, no promesa de disponibilidad futura |

SLO inicial para discutir: disponibilidad de ruta pública >=99.5% y recepción durable p95 <1 s en 30 días. No se declara alcanzado sin ventana de datos. Concurrencia/tiempo incluyen solo consentimiento y son estimaciones; no usarlos como facturación o identidad de cliente.

## Incidentes y trazabilidad

Consultar por referencia con `DATABASE_URL` configurado de forma segura y `node scripts/lead_status.mjs <uuid>`. Devuelve solo estado, intentos, fechas y trace_id, sin descifrar ni imprimir datos del cliente. No usar etiquetas Prometheus de referencia o usuario. No exponer este comando como API pública.

Si hay errores de contacto: revisar health/ready, DB, credenciales SMTP, cola y dead letters. Un 202 significa registro durable; no reenviar solicitudes enteras por múltiples canales automáticamente. Restaurar el transporte y reintentar avisos fallidos mediante cambio operativo revisado; conservar Message-ID y no borrar evidencia del fallo.

## Backups y rollback

Crear backups con `scripts/backup.sh` (dump sin contenido en logs). Cifrarlos fuera del host, separar custodia de DATA_KEY y claves de analítica, definir acceso/retención y borrar conforme a política. El dump contiene PII cifrada e identificadores seudónimos: no subirlo a Git ni a artefactos públicos.

Ensayar restauración en una DB aislada vacía con `scripts/restore.sh <dump>` y comprobar conteos, descifrado de una consulta sintética y funcionamiento sin enviar correos a clientes. Una copia sin la clave no permite recuperar las consultas; rotar claves exige migración de datos controlada. Nunca ejecutar restore sobre producción por defecto.

Rollback: volver a la imagen anterior y verificar compatibilidad del esquema. La migración inicial es aditiva; cambios posteriores requieren plan explícito. Un rollback de código no revierte automáticamente datos. Conservar el artefacto y las claves de la versión anterior; no usar down -v en un host con datos reales.

## Laboratorio reproducible

`infra/compose.laboratory.yaml` añade Mailpit sintético, HTTP y puertos solo loopback; no es configuración de producción. Usa un proyecto Compose separado y datos sintéticos. El entorno de laboratorio no se considera un receptor real ni demuestra TLS o entrega externa. Las imágenes base se fijan por digest en infra/images.lock.json y deben revisarse/actualizarse regularmente.
