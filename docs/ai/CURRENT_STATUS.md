# Estado real — Landing v2

La rama implementa mejoras; no equivale a release aprobado. Backlog: #13–#21.

| Capacidad | Estado |
|---|---|
| Brief, ADR y manifiesto | PROPOSED; estructura validable, clasificación pendiente de revisión humana |
| Formulario FormSubmit, planes, privacidad | IMPLEMENTED; proveedor requiere activación y comprobación de buzón (#15) |
| Navegación, contraste y movimiento reducido | IMPLEMENTED y TESTED localmente; revisión manual completa pendiente |
| Lint, pruebas y controles estáticos | IMPLEMENTED y TESTED localmente; ejecución remota se verifica en el PR |
| SEO y contacto sin JS | IMPLEMENTED; origen de producción pendiente de confirmación |
| Despliegue, rollback y monitorización productiva | PROPOSED, NOT_ASSESSED (#20) |
| Oferta, testimonios y analítica | PROPOSED, pendiente de datos reales (#21) |
| Evaluación PACA formal | NOT_ASSESSED; no hay puntuación ni certificación |
| Vista previa Pages | ENABLED como preview en https://jj-ti.github.io/jj-ti-landing/; HTTP 200 y controles de preview verificados, sin modificar jj-ti.net |

No se han ratificado excepciones, roles de seguridad ni aprobación de producción. El validador ui-tokens-check sigue PLANNED/advisory en SEGAF. Las pruebas mock no envían correos reales.

Evidencia: [validación local](../../reports/BASELINE-VALIDATION.md), 26/26 pruebas de navegador. No valida entrega de correo.
