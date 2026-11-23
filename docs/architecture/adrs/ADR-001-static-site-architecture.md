---
document_id: "JJTI-LANDING-ADR-001"
title: "ADR-001 — Conservar arquitectura de sitio estático y flujo de contacto sin backend"
version: "1.0.0"
date: "2026-11-22"
status: "PROPOSED"
approval: "PENDING_HUMAN_REVIEW"
owner: "jagvortex-droid"
references:
  - "Issue #14 (JJ-TI/jj-ti-landing)"
  - "SEGAF D-01, D-02, DEC-009, DEC-010, DEC-012, AGF-002"
---

# ADR-001 — Conservar arquitectura de sitio estático y flujo de contacto sin backend

- **Estado:** `PROPOSED` (pendiente de revisión y ratificación humana; no equivale a certificación PACA).
- **Referencias:** Issue `#14` (`JJ-TI/jj-ti-landing`); SEGAF `D-01`, `D-02`, `DEC-009`, `DEC-010`, `DEC-012` y `AGF-002`.

## Contexto

La landing corporativa de JJ-TI es un sitio web estático compuesto por HTML5 (`index.html` y páginas descriptivas en `servicios/` generadas desde `content/services.json`), CSS3 modular (`css/*.css`) y JavaScript vanilla (`js/*.js`), sin servidor de aplicaciones, base de datos ni paso de compilación para publicar.

En `main`, el formulario valida los datos localmente en el navegador y prepara un enlace manual hacia WhatsApp (`https://wa.me/`), mientras los enlaces directos de correo y WhatsApp permanecen accesibles incluso sin JavaScript. No existe backend de formularios ni envío automático a terceros.

## Decisión propuesta

1. **Mantener el estilo arquitectónico `static-site`:** Conservar HTML5, CSS3 y JavaScript vanilla con separación por responsabilidad (marcado, estilos, scripts modulares y datos de servicios en `content/services.json`), sin introducir servidor, base de datos ni framework UI mientras el alcance del sitio sea presentación comercial y derivación manual de contacto.
2. **Declarar `target_paca_level: "L1"` como nivel PACA objetivo:** Justificado por el perfil de tamaño reducido (`size_profile: "S"`), la ausencia de backend, persistencia de datos de negocio y lógica transaccional de servidor, y el nivel de protección de dominio `A1_STANDARD`. Este valor fija el objetivo proporcional para evaluaciones futuras y no representa una certificación PACA emitida.
3. **Mantener el contacto sin backend ni persistencia de PII:** Continuar con la preparación local de enlaces de WhatsApp y enlaces directos de correo/WhatsApp. Cualquier futura incorporación de backend o servicio externo de formularios exigirá un nuevo ADR y la reevaluación humana de `data_sensitivity`, privacidad, retención, validación del lado del servidor y protección contra abuso.

## Consecuencias

- **Superficie operativa mínima y cero credenciales en cliente:** El sitio publicado no requiere secretos, servidores ni bases de datos, reduciendo la superficie de ataque y simplificando el despliegue estático.
- **Sin almacenamiento persistente de datos personales:** El código cliente no envía ni guarda el contenido del formulario; únicamente persiste en `localStorage` la preferencia visual de tema (`jjti-theme-v1`), con degradación elegante si el almacenamiento está bloqueado.
- **Alcance real de las pruebas:** La suite de Playwright y axe valida comportamiento en navegador, accesibilidad y degradación sin JavaScript bloqueando tráfico externo; por diseño, no acredita recepción real en WhatsApp/correo ni la operación del hosting productivo.
- **Alineación con controles SEGAF:** La ausencia de carpetas `src/` o `app/` responde de forma deliberada al diseño estático raíz (`index.html`, `css/`, `js/`), por lo que el aviso `ARCH-RULE-003` se documenta como característica esperada del arquetipo estático.

## Evidencia y consumo de SEGAF

- [project.yaml](../../../project.yaml) almacena únicamente estado declarativo estable conforme a `D-01` y referencia el commit de SEGAF utilizado como baseline, sin copiar los handbooks al repositorio consumidor ni almacenar resultados dinámicos de evaluación en el manifiesto.
- Validar la estructura de `project.yaml` frente a `project-v2.schema.json` verifica conformidad sintáctica y de contrato, pero no sustituye la aprobación humana de la clasificación provisional (`PROPOSED`) ni constituye certificación PACA.
- Las directrices operativas para agentes de IA se consolidan en [AGENTS.md](../../../AGENTS.md) bajo la prohibición categórica de auto-aprobación (`DEC-010` / `AGF-002`).

## Reversión

Si en una iteración posterior se decide migrar a un framework, incorporar un backend propio o conectar un servicio externo de recepción de formularios, deberá aprobarse un ADR sucesor mediante Pull Request dedicado y actualizar la clasificación de `project.yaml`. En cualquier contingencia o reversión, se preservarán los enlaces directos de correo y WhatsApp como canal de respaldo sin simular envíos exitosos.
