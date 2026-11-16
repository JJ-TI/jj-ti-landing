# Microinteracciones — #36

Continuación autorizada de ai/chatgpt/34-experimental-problem-visual y PR #35. Estado IMPLEMENTED y TESTED localmente; revisión visual pendiente. No se abre una rama paralela ni se integra a main.

## Diseño

- Botones: reflejo radial contenido que responde al mouse, elevación mínima y compresión al pulsar. El objetivo no se desplaza con el cursor; no hay magnetismo ni cursor personalizado. Estados disabled excluidos.
- Menú: subrayado desde el origen y visible con teclado; apertura breve de 180 ms y hamburguesa que cambia a cierre. Se conserva el controlador existente de apertura, Escape, foco y scroll. El cierre no demora la semántica ni deja un menú oculto interactuable.
- Formulario: foco visible, borde del panel activo, opciones seleccionables con objetivo de 44 px, estado nativo user-invalid/user-valid después de interacción y mensajes en contenedor legible. No cambia cuándo se valida, acepta o envía. Un estado válido del navegador no verifica identidad ni seguridad del dato.
- Envío: estilo para aria-busy real y disabled, sin porcentajes ficticios, promesas nuevas ni animación que anuncie éxito antes de respuesta.

Tecnología: CSS :has, :user-invalid y @starting-style como mejora progresiva; navegadores sin soporte mantienen controles y mensajes nativos. Estas técnicas son una dirección contemporánea, no prueba de adopción futura en 2027. Sin librerías, WebGL, vídeo o animación continua.

## Límites y accesibilidad

Movimiento reducido elimina transiciones, elevación y reflejo; cambios de preferencia en vivo cancelan el frame pendiente y limpian coordenadas. Touch conserva respuesta de pulsación sin efecto de mouse. Modo de colores forzados omite reflejo y marca selección. Foco visible permanece en teclado; no se interceptan eventos de clic, envío o navegación.

El script solo escribe coordenadas efímeras como propiedades CSS del botón, como máximo una actualización por frame activo. Limpia al salir/cancelar y no usa red, almacenamiento, analítica ni contenidos de formulario. No registra recorridos ni huellas. CSP y dependencias no modificadas.

## Archivos

- css/interactions.css: presentación de estados/interacción, cargada solo en index.
- js/interactions.js: reflejo local opcional con requestAnimationFrame y cancelación.
- index.html: dos referencias a los recursos anteriores; copy, estructura y atributos funcionales intactos.
- docs/BACKLOG.md y docs/ai/CURRENT_STATUS.md: trazabilidad.
- reports/INTERACTIONS-EXPERIMENT.md: evidencia y límites.

## Verificación

- Chromium: reflejo en mouse; cambio dinámico a reduce limpia propiedades y deja duración de transición 0; Escape devuelve foco; campos vacíos no muestran error prematuro; selección y navegación touch operan sin reflejo. Sin errores JS detectados en ese recorrido.
- Captura del formulario revisada. npm run verify: PASS local (lint, HTML, enlaces y 38/38 navegador). Ajuste 1440/768/390/320 px sin overflow horizontal.
- Preview aislado experimental/problemas conserva envío y analítica deshabilitados. No acredita correo real ni backend habilitado.

Pendiente aceptación subjetiva de la interacción; sin mejora de conversión medida. No se declara prueba exhaustiva en todos los navegadores o dispositivos.
