# Footer — definición visual #40

IMPLEMENTED en misma rama experimental/PR #35. Revisión visual y habilitación de perfiles pendientes. Esta entrega es una propuesta en código, no publicación de cuentas o acreditación de cumplimiento SEGAF.

## Decisiones

Cuatro áreas: marca y CTA, soluciones, contacto y redes. Paleta navy/dorado, contraste legible, superficies discretas, iconografía SVG local con nombres visibles y responsive. Se conservan los servicios, datos de contacto, privacidad y preferencias. Solo cambia footer de la landing; el footer compacto de servicios queda para una eventual adopción visual posterior.

LinkedIn, Instagram, Facebook y TikTok: cada nombre se acompaña de «Por configurar». Son elementos de lista, no controles, sin tabindex/href, sin dominio inventado y sin apariencia de enlace activo al hover. WhatsApp sí enlaza al número existente mediante URL segura, rel noopener noreferrer y evento de taxonomía existente. No se añaden embeds, píxeles, SDKs, sameAs o scripts de redes. El usuario suministrará cuentas para activar enlaces verificados en otra iteración.

Alineación con AGENTS.md y SEGAF fijado en project.yaml: no inventar evidencia, perfiles, certificaciones, SLA o terceros; preservar separación de HTML/CSS y lógica, rama/issue/PR, validación, revisión humana y estados IMPLEMENTED/TESTED/ENABLED. No se declara aprobación formal de seguridad ni privacidad por esta mejora visual.

## Archivos

index.html (solo footer y referencia CSS), css/footer.css, docs/BACKLOG.md, docs/ai/CURRENT_STATUS.md y este informe. Sin cambios en JS/API, formulario, identificadores de analítica, infraestructura o cabecera. No se agregan valores nuevos al catálogo de eventos.

## Validación

Comprobar 4 redes pendientes no interactivas y 1 enlace real WhatsApp, destinos existentes, foco, responsive y contraste de ambos temas. npm run verify y checks del SHA final en PR registran resultado final. El primer lint detectó espacios ordinarios en número telefónico, corregidos por espacios no separables antes de la ejecución final.

Preview experimental/problemas mantiene formulario/analítica desactivados y portada estable intacta. Capturas de revisión ocultan overlays fijos solo durante captura, sin alterar su funcionamiento en el sitio. No se presume mejora comercial medida ni aceptación visual.
