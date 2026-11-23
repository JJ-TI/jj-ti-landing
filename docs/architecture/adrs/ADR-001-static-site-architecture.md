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

En `main`, el formulario (`js/form.js`) captura en el navegador datos personales de contacto comercial (`name`, `company`, `phone`, `email`) junto con las necesidades y el detalle de la consulta, los valida localmente y prepara un enlace manual hacia WhatsApp (`https://wa.me/50379124962?text=...`). Los enlaces directos de correo y WhatsApp permanecen accesibles incluso sin JavaScript. No existe backend de formularios ni envío automático a terceros.

## Decisión propuesta

1. **Mantener el estilo arquitectónico `static-site`:** Conservar HTML5, CSS3 y JavaScript vanilla con separación por responsabilidad (marcado, estilos, scripts modulares y datos de servicios en `content/services.json`), sin introducir servidor, base de datos ni framework UI mientras el alcance del sitio sea presentación comercial y derivación manual de contacto.
2. **Declarar `target_paca_level: "L1"` como nivel PACA objetivo:** Justificado por el perfil de tamaño reducido (`size_profile: "S"`), la ausencia de backend, persistencia de datos de negocio y lógica transaccional de servidor, y el nivel de protección de dominio `A1_STANDARD`. Este valor fija el objetivo proporcional para evaluaciones futuras y no representa una certificación PACA emitida.
3. **Clasificar `data_sensitivity` como `CONFIDENTIAL` (provisional `PROPOSED`) y distinguir las tres fases del flujo real de datos:**
   - **Datos personales procesados en el navegador:** El cliente lee en memoria (`FormData`) nombre, empresa, teléfono/WhatsApp, correo electrónico, necesidades y mensaje para validar la entrada y construir el parámetro `text` de la URL `https://wa.me/`; ante cualquier edición o reinicio (`input`, `change`, `reset`), descarta el enlace preparado. Dado que el sitio procesa datos personales de contacto en el navegador, `PUBLIC` subestimaría la sensibilidad real; se propone `CONFIDENTIAL` (sin escalar a `RESTRICTED_PII_FINANCIAL` porque no se procesan datos financieros, fiscales ni regulados y la interfaz advierte explícitamente no ingresar contraseñas ni información sensible).
   - **Apertura voluntaria de WhatsApp:** Enviar el formulario bloquea la transmisión HTTP nativa (`event.preventDefault()`), no dispara peticiones de red automáticas y solo habilita el enlace *"Revisar y enviar en WhatsApp"* (`target="_blank" rel="noopener noreferrer"`). La apertura de WhatsApp y la transmisión efectiva del mensaje dependen exclusivamente de una acción voluntaria del visitante primero en el enlace y después dentro de WhatsApp.
   - **Ausencia de almacenamiento por parte del sitio:** El sitio no dispone de backend, base de datos, envío automático a terceros ni analítica propia, y no persiste ningún dato del formulario en `localStorage`, `sessionStorage` ni cookies (en `localStorage` únicamente se almacena la preferencia visual de tema `jjti-theme-v1`).
   - Cualquier futura incorporación de backend, persistencia, servicio externo de formularios o datos regulados/financieros exigirá un nuevo ADR y la reevaluación humana de `data_sensitivity` (p. ej. hacia `RESTRICTED_PII_FINANCIAL`), privacidad, retención, validación en servidor y protección contra abuso.

## Consecuencias

- **Superficie operativa mínima y cero credenciales en cliente:** El sitio publicado no requiere secretos, servidores ni bases de datos, reduciendo la superficie de ataque y simplificando el despliegue estático.
- **Trazabilidad honesta sobre datos de contacto:** Aunque el sitio no almacena ni transmite automáticamente el formulario, los datos personales ingresados existen temporalmente en el DOM/memoria del navegador y pasan al parámetro `text` de la URL únicamente si el visitante decide abrir WhatsApp; clasificar `data_sensitivity: "CONFIDENTIAL"` refleja esa exposición sin sobredimensionarla como procesamiento financiero/regulado. En `localStorage` solo persiste `jjti-theme-v1`, con degradación elegante si el almacenamiento está bloqueado.
- **Alcance real de las pruebas:** La suite de Playwright y axe valida comportamiento en navegador, accesibilidad y degradación sin JavaScript bloqueando tráfico externo; por diseño, no acredita recepción real en WhatsApp/correo ni la operación del hosting productivo.
- **Alineación con controles SEGAF:** La ausencia de carpetas `src/` o `app/` responde de forma deliberada al diseño estático raíz (`index.html`, `css/`, `js/`), por lo que el aviso `ARCH-RULE-003` se documenta como característica esperada del arquetipo estático.

## Evidencia y consumo de SEGAF

- [project.yaml](../../../project.yaml) almacena únicamente estado declarativo estable conforme a `D-01` y referencia el commit de SEGAF utilizado como baseline, sin copiar los handbooks al repositorio consumidor ni almacenar resultados dinámicos de evaluación en el manifiesto.
- Validar la estructura de `project.yaml` frente a `project-v2.schema.json` verifica conformidad sintáctica y de contrato, pero no sustituye la aprobación humana de la clasificación provisional (`PROPOSED`) ni constituye certificación PACA.
- Las directrices operativas para agentes de IA se consolidan en [AGENTS.md](../../../AGENTS.md) bajo la prohibición categórica de auto-aprobación (`DEC-010` / `AGF-002`).

## Reversión

Si en una iteración posterior se decide migrar a un framework, incorporar un backend propio o conectar un servicio externo de recepción de formularios, deberá aprobarse un ADR sucesor mediante Pull Request dedicado y actualizar la clasificación de `project.yaml`. En cualquier contingencia o reversión, se preservarán los enlaces directos de correo y WhatsApp como canal de respaldo sin simular envíos exitosos.
