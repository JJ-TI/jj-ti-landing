# Validación local de Landing v2

Fecha: 2026-11-16. Rama: ai/chatgpt/13-landing-v2-segaf. Base: 85189cf7d22e985cf046f74aeaf33ccd0f271f09.
Estado de implementación: IMPLEMENTED y TESTED localmente; no ENABLED en producción. Informe preliminar, no PACA formal.

## Evidencia ejecutada

| Comando | Resultado |
|---|---|
| npm run lint | PASS: ESLint, Stylelint y HTML Validate |
| npm run check | PASS: esquema SEGAF, blob canónico, IDs, enlaces y recursos locales |
| PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test | 26/26 PASS, Chromium, escritorio 1440×1000 y móvil 390×844 |
| npm audit | 0 vulnerabilidades reportadas en el lockfile evaluado |
| detect-secrets scan --all-files | 0 hallazgos tras excluir exclusivamente los dos hashes Git públicos de referencia; comando completo en CI |
| Lectura YAML del workflow | PASS sintáctico; ejecución GitHub Actions pendiente al emitir este informe |

Entorno: Node 24.22.1, Python 3.12.14; versiones de herramientas en package-lock.json y requirements-dev.txt. Paquetes npm solo para desarrollo.

Las 26 pruebas incluyen planes, obligatoriedad de necesidades y consentimiento, payload con múltiples necesidades, aceptación del proveedor, fallo de red/HTTP/proveedor/JSON, reintento, bloqueo de duplicados mientras se envía, timeout, menú y Escape, salto al contenido, movimiento reducido, contactos sin JS, axe WCAG A/AA y ausencia de desbordamiento. Se revisó además la captura completa de escritorio.

## Límites

Las peticiones a terceros se interceptaron: no se enviaron correos reales ni se activó FormSubmit. axe sin violaciones no certifica conformidad WCAG completa; faltan lector de pantalla, fuentes externas reales, dispositivos adicionales y evaluación manual de todos los controles. No hay medición de Core Web Vitals de producción. Protección de ramas, alojamiento, TLS, entrega al buzón, retención y rollback productivo no se han verificado.

## Pendientes trazados

- #15: activación por el propietario del correo y recepción de consulta sintética desde origen autorizado.
- #17: revisión humana ampliada de accesibilidad y consolidación adicional de tokens.
- #20: alojamiento, preview, publicación y ensayo de rollback.
- #21: confirmación de oferta, evidencia comercial, medición y política de conservación.

El manifiesto es una propuesta, no una ratificación de autoridades o riesgo. Ningún issue con dependencias externas se considera cerrado por este informe.
