---
document_id: "JJTI-LANDING-AGENTS-001"
title: "Directrices para Trabajo Asistido por IA en JJ-TI Landing"
version: "1.0.0"
date: "2026-11-22"
status: "PROPOSED"
approval: "PENDING_HUMAN_REVIEW"
owner: "jagvortex-droid"
---

# Trabajo asistido por IA

Lee [README.md](README.md), [project.yaml](project.yaml), [ADR-001-static-site-architecture.md](docs/architecture/adrs/ADR-001-static-site-architecture.md), [docs/accessibility.md](docs/accessibility.md) y [docs/visual-integration.md](docs/visual-integration.md) antes de editar.

## Prohibición de Auto-Aprobación (DEC-010 / AGF-002)

> **PROHIBICIÓN CATEGÓRICA DE AUTO-APROBACIÓN (`DEC-010` / `AGF-002`):**
> - No publiques directamente a `main` ni apruebes tus propios cambios o Pull Requests.
> - Ningún agente IA puede asumir el rol de autoridad final (`Accountable`), autorizar excepciones (`EXC-YYYY-NNN`) ni aceptar riesgos residuales en nombre del Tech Lead o del propietario del negocio.
> - La revisión, ratificación y aprobación final corresponden exclusivamente a una persona calificada.

## Reglas Operativas

- Trabaja en ramas `ai/<agente>/<issue>-<descripcion>` y abre Pull Requests enlazados explícitamente a un Issue real (`Closes #N`, `Fixes #N` o `Relates to #N`).
- No inventes precios, SLA, testimonios, autoridades, excepciones ni evidencia de producción.
- No guardes credenciales, secretos, tokens ni datos personales en Git, logs o artefactos de CI.
- Conserva la arquitectura estática y la separación entre marcado (`index.html`, `servicios/`), contenido (`content/services.json`), presentación (`css/`) y comportamiento (`js/`).
- Ejecuta las comprobaciones locales vigentes (`npm run check`, validación HTML con `html5validator index.html servicios/*.html` y `npm run scan:secrets`) y mantén sincronizada la documentación afectada.
- Las pruebas automatizadas de navegador bloquean el tráfico externo; una prueba en verde no demuestra recepción real en WhatsApp ni en correo, ni operación en hosting productivo.
- Consumimos SEGAF fijado por commit en `project.yaml`; los resultados dinámicos de evaluación pertenecen a reportes o artefactos de CI, nunca dentro de `project.yaml` (`D-01`).
- `ui-tokens-check` permanece `PLANNED` / informativo según `DEC-008`, no es un gate ejecutable.
- No ejecutes `SATS Provisioner --mode apply` sobre repositorios reales (`D-06` / `DEC-010`). Introducir backend o un proveedor externo de formularios requiere un nuevo ADR y revisión humana de privacidad, retención y contrato.

## Diferenciación de Estados

Los estados **`PROPOSED`**, **`IMPLEMENTED`**, **`TESTED`** y **`ENABLED`** deben documentarse explícitamente por separado. Nunca declarar una capacidad como `ENABLED` en producción sin verificación humana independiente.
