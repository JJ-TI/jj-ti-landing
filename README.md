# JJ-TI — Sitio y plataforma operativa

Frontend HTML/CSS/JS con diseño conservado, API Node 24/Fastify, PostgreSQL y observabilidad abierta. [Backlog](docs/BACKLOG.md) · [ADR-002](docs/architecture/adrs/ADR-002-production-observability.md) · [Producción](docs/operations/PRODUCTION.md) · [OpenAPI](docs/api/openapi.json) · [Estado](docs/ai/CURRENT_STATUS.md).

## Estado

Implementación para revisión y despliegue reproducible. **No hay backend habilitado en Internet ni entrega real de correo verificada.** El usuario aún no elige infraestructura. La [vista previa Pages](https://jj-ti.github.io/jj-ti-landing/) es estática, sin analítica ni transmisión de formularios. GitHub Pages no ejecuta esta API.

## Desarrollo y pruebas

Requisitos: Node 24+, Python 3.12+, Docker y Chromium.

```bash
npm ci
python3 -m pip install -r requirements-dev.txt
npx playwright install chromium
npm run verify
npm run test:integration
python3 scripts/check_secrets.py
```

El servidor estático Python solo permite revisar frontend; no recibe consultas. Para ensayar la recepción y analítica se necesita la API. Las pruebas de navegador interceptan peticiones; las pruebas de integración usan PostgreSQL real en contenedor y SMTP sintético local, sin correo a clientes.

## Producción reproducible

```bash
python3 scripts/setup_environment.py --origin https://jj-ti.net
# Completar SMTP y custodiar secretos en .env, fuera de Git.
python3 scripts/configure_monitoring.py --origin https://jj-ti.net
docker compose config --quiet
docker compose build api
docker compose up -d
```

No ejecutar hasta seleccionar infraestructura y revisar [runbook](docs/operations/PRODUCTION.md). El Compose expone solo gateway público; Grafana y Prometheus quedan en loopback. Node corre sin root, recursos persistentes en volúmenes e imágenes base por digest. Los secretos y el cifrado del disco/backups deben gestionarse en el despliegue. La topología inicial es una instancia; escalado requiere límites de tasa compartidos.

## Funcionalidad

- Seis páginas estáticas por servicio, consultas con contexto, teléfono, correo, WhatsApp y enlaces comprobables.
- Solicitud persistida y cifrada, referencia durable, idempotencia y outbox SMTP con reintentos. Aceptación SMTP no prueba entrega final.
- Analítica de navegador opcional: consentimiento, GPC/DNT, visitas agrupadas entre pestañas, tiempo visible e intereses por eventos finitos. Retirada con borrado; nunca unir a formularios.
- OpenTelemetry para métricas/trazas/logs, Collector OTLP, Prometheus/Blackbox, Grafana, Loki y Tempo. SQL de dashboards mediante rol de agregados, sin acceso a prospectos.
- SEO HTML, JSON-LD coherente, canonical, sitemap y llms.txt complementario. No se promete posicionamiento o citas en IA.

## Estructura y publicación

`node scripts/build_site.mjs` o `python3 scripts/build_site.py` crea `public/` con archivos permitidos. Solo este artefacto es público; no servir todo el repositorio. `server/` contiene API y contrato de datos; `infra/` el stack; `content/services.json` alimenta `python3 scripts/generate_services.py`.

El preview se genera mediante `scripts/build_preview.py` con destino vacío. Su configuración impide recopilar analítica y el envío de consultas. SEO indexable corresponde al dominio final, no al preview.

## Gobernanza

SEGAF por commit inmutable en project.yaml; evidencias dinámicas en reports/ y CI. Clasificación ampliada PROPOSED. Leer AGENTS.md. No se declara PASS PACA, aprobación de seguridad ni producción ENABLED sin evidencia externa.
