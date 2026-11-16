# ADR-001 — Mantener sitio estático y usar servicio de formularios

Estado: PROPOSED. Referencias: #14, #15; SEGAF D-01, D-02, DEC-009 y DEC-012.

## Contexto
La landing es una página HTML con CSS y JS separados. El formulario anterior validaba sin enviar. El usuario eligió recepción en info@jj-ti.net mediante un servicio de formularios.

## Decisión propuesta
Conservar HTML/CSS/JS y usar FormSubmit con POST JSON y fallback HTML nativo. No introducir servidor, base de datos o framework UI. Mantener la activación como dependencia explícita del propietario del buzón.

El proveedor valida recepción; el navegador valida experiencia, longitudes y selección. El código cliente no impone seguridad al servidor externo. Honeypot y verificación del proveedor reducen abuso, sin prometer rate limits, deduplicación o SLA. JSON/AJAX no ofrece las mismas verificaciones que el flujo nativo; supervisar abuso y cambiar a receptor controlado si hace falta.

## Consecuencias
No hay credenciales en frontend. Los datos se transfieren a un tercero, cuya política se enlaza. Los controles y retención de correo requieren revisión humana. La referencia JJTI es generada por el cliente para correlación, no es un ticket confirmado. No hay reenvío automático ante timeout para evitar duplicados. No se guarda PII en almacenamiento persistente del navegador.

## Evidencia y consumo
SEGAF se referencia por commit en project.yaml. El esquema v2 se conserva en governance/ con blob SHA de origen; no se copian los handbooks. El manifiesto usa JSON, subconjunto válido de YAML 1.2. No se interpreta validar estructura como aprobación de clasificación.

## Reversión
Restaurar la versión previa del sitio o cambiar receptor mediante PR y repetir pruebas. Si falla la recepción, mantener correo y WhatsApp visibles y suspender el formulario; no mostrar un éxito simulado.

Documentación del proveedor: https://formsubmit.co/documentation y https://formsubmit.co/ajax-documentation.

El escaneo de secretos excluye únicamente los dos hashes Git exactos de referencia, falsos positivos de entropía. El esquema se verifica por blob SHA en cada ejecución. No se excluyen archivos de aplicación o manifiestos completos.
