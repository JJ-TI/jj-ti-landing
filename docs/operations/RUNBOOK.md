# Publicación y recepción — Runbook

Estado: procedimiento PROPOSED; producción NOT_ASSESSED. Seguimiento: #15 y #20.

## Antes de publicar
1. Confirmar con el propietario que https://jj-ti.net/ es el origen público y seleccionar alojamiento estático. Si cambia, ajustar canonical, og:url, og:image, sitemap y robots juntos.
2. Revisar PR y npm run verify. Publicar solo index.html, privacidad.html, gracias.html, favicon.svg, robots.txt, sitemap.xml, assets/, css/ y js/. No publicar node_modules, docs, pruebas o governance.
3. Crear una vista previa del artefacto y probar móvil y teclado. No activar publicación automática a producción desde este PR.
4. Revisar aviso de privacidad, proveedor y política de retención con el responsable. El borrado del buzón y los datos del tercero no están automatizados por esta landing.

## Activar FormSubmit
1. Desde un origen HTTP(S) de prueba autorizado, enviar una consulta sintética por el POST nativo https://formsubmit.co/info@jj-ti.net. Se puede desactivar JS temporalmente para activar el flujo nativo. No utilizar datos de clientes.
2. El propietario abre el mensaje de activación en info@jj-ti.net y confirma personalmente. Revisar spam. El agente no tiene acceso al buzón y no afirma activación.
3. Probar después el flujo AJAX desde el origen final y verificar la recepción de un correo con todas las necesidades, plan, referencia y correo para responder.
4. Registrar solo fecha, origen, versión y resultado en #15; no adjuntar PII, contenidos del buzón ni enlaces de activación. Eliminar los datos de prueba según política acordada.
5. Solo entonces cambiar estado a ENABLED. Un HTTP 200 o success:true no prueba entrega al buzón.

## Smoke test
Confirmar HTTPS, carga de CSS/JS/favicon, enlaces WhatsApp con número, menú, planes y contacto. Confirmar entrega de correo sintético controlado al cambiar proveedor o configuración. Mantener revisión de disponibilidad y alertas del alojamiento y revisar rebotes/spam del buzón. No existe monitor productivo instalado en este PR.

## Rollback
Guardar el identificador del artefacto anterior en el alojamiento; volver a publicar ese artefacto y repetir smoke tests. Ensayar esta operación en preview antes de darla por TESTED. Si se pierde recepción, retirar temporalmente el formulario y conservar contacto directo, indicando el estado real.

## Incidentes
Errores repetidos o falta de correo: comprobar activación, estado de FormSubmit, restricciones del dominio, buzón y spam. Evitar reintentos automáticos masivos. Abrir issue sin datos personales. Responsable propuesto para coordinar: jagvortex-droid; roles de operaciones y seguridad pendientes de confirmación.
