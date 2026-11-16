# Brief — Landing v2

Estado: PROPOSED, pendiente de revisión del propietario. Épica: #13.

## Objetivo
Convertir visitas de empresas de El Salvador en consultas atendibles en info@jj-ti.net. Mantener el sitio estático y aplicar SEGAF proporcionalmente.

## Alcance
Formulario FormSubmit, planes seleccionables, accesibilidad básica, SEO, CI, documentación y backlog real. Conservar catálogo y nombres actuales. No agregar precios, horarios o SLA sin confirmación comercial (#21).

## Aceptación funcional
- El plan consultado se conserva y permite cambios.
- Campos y consentimiento obligatorios; al menos una necesidad seleccionada con JavaScript.
- Éxito solo tras respuesta positiva del proveedor; no se afirma entrega al buzón.
- Error, timeout y respuesta inválida conservan la consulta y permiten reintento.
- Sin JavaScript, POST nativo al proveedor con verificación y selección del plan manual.
- Teclado, menú móvil, Escape y movimiento reducido verificados.

## Clasificación provisional
Perfil S, frontend-app, internal-product, exposición pública, riesgo MEDIUM por contacto externo y PII. El enum RESTRICTED_PII_FINANCIAL se usa por PII, no implica información financiera. BUSINESS_CRITICAL refleja el propósito de captación, no un SLA aprobado. EXISTING significa base de código previa; clasificación operativa y uso productivo siguen UNKNOWN. Topología solo_with_ai y propietario propuestos a partir de esta sesión, pendientes de ratificación; no atribuyen al agente autoridad humana. Ningún resultado PACA se declara aquí.

## Dependencias externas
Activación de FormSubmit en buzón autorizado, alojamiento y dominio confirmados, aceptación de tratamiento y retención. #15 y #20 permanecen abiertos hasta comprobar entrega y operación real. FormSubmit fue elegido como integración inicial sin credenciales; no se crea una cuenta ni se contrata un plan.
