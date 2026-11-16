/**
 * JJ-TI — configuración central de WhatsApp.
 *
 * Para activar el número real, asigna a `phone` el número internacional sin
 * espacios, signos ni guiones. Ejemplo conceptual: 503XXXXXXXX.
 *
 * El archivo busca todos los enlaces que actualmente apuntan a `wa.me` y les
 * aplica una única URL con mensaje prellenado. Así se evita repetir el número
 * en el HTML y se facilita su mantenimiento.
 */
(() => {
  /**
   * Número de WhatsApp de JJ-TI en formato internacional sin `+`.
   * Número comercial ya configurado; los enlaces HTML ofrecen fallback sin JS.
   */
  const phone = '50379124962';

  /** Mensaje inicial utilizado por los CTA de WhatsApp. */
  const message = 'Hola, JJ-TI. Quiero consultar una necesidad tecnológica de mi empresa. ¿Podemos conversar sobre el siguiente paso?';

  // Mientras el número esté vacío, dejamos los enlaces de demostración intactos.
  if (!phone) return;

  /** URL única reutilizada por todos los CTA de WhatsApp. */
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.href = url;
  });
})();

