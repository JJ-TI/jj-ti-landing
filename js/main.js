/**
 * JJ-TI — comportamiento global de la página.
 *
 * Responsabilidad única de este archivo:
 * - Detectar el desplazamiento de la página.
 * - Añadir/quitar la clase visual `is-scrolled` al header.
 *
 * No contiene lógica de navegación, formularios ni WhatsApp; cada responsabilidad
 * vive en su propio módulo JS.
 */
(() => {
  /** Elemento header que recibe el estado visual al hacer scroll. */
  const header = document.querySelector('[data-header]');

  // Si la página no tiene header compatible, no hay nada que inicializar.
  if (!header) return;

  /**
   * Actualiza el estado visual del header.
   * Se usa una clase CSS para mantener la presentación fuera de JavaScript.
   */
  const updateHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  // Ejecutamos una vez para cubrir el caso en que la página cargue desplazada.
  updateHeaderState();

  // passive mejora el comportamiento del scroll porque el listener nunca cancela el evento.
  window.addEventListener('scroll', updateHeaderState, { passive: true });
})();
