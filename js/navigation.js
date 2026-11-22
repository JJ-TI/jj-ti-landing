/** Navegación móvil con alternativa CSS sin JavaScript. */
(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  if (!toggle || !navigation) return;
  const label = toggle.querySelector('.sr-only');
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    label.textContent = 'Abrir menú';
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    label.textContent = isOpen ? 'Cerrar menú' : 'Abrir menú';
    document.body.classList.toggle('menu-open', isOpen);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('focusin', (event) => {
    if (!navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) closeMenu();
  });
  document.documentElement.classList.add('navigation-ready');
})();
