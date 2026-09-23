/**
 * JJ-TI — navegación responsive.
 *
 * Controla únicamente el menú móvil:
 * - apertura/cierre;
 * - atributo ARIA `aria-expanded`;
 * - bloqueo del scroll del body mientras el menú está abierto;
 * - cierre al seleccionar una opción o al volver a escritorio.
 */
(() => {
  /** Botón que abre/cierra el menú móvil. */
  const toggleButton = document.querySelector('[data-nav-toggle]');
  /** Contenedor de navegación que cambia entre abierto y cerrado. */
  const navigation = document.querySelector('[data-navigation]');

  // Evita errores si el componente no existe en otra página del proyecto.
  if (!toggleButton || !navigation) return;

  /**
   * Cierra el menú y sincroniza todos sus estados visuales y de accesibilidad.
   */
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  /**
   * Alterna el menú y conserva una única fuente de verdad: si la clase existe,
   * el menú está abierto.
   */
  toggleButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  // En móvil, cualquier enlace seleccionado debe cerrar el menú inmediatamente.
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Al pasar a escritorio no necesitamos conservar el estado móvil.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) closeMenu();
  });
})();
