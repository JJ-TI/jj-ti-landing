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
   * Vacío por seguridad hasta que se configure el número comercial definitivo.
   */
  const phone = '';

  /** Mensaje inicial utilizado por los CTA de WhatsApp. */
  const message = 'Hola, JJ-TI. Me gustaría conocer sus servicios porque necesito ayuda con tecnología para mi empresa.';

  // Mientras el número esté vacío, dejamos los enlaces de demostración intactos.
  if (!phone) return;

  /** URL única reutilizada por todos los CTA de WhatsApp. */
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.href = url;
  });
})();
