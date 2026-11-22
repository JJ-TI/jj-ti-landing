/* Preferencia visual local; independiente del consentimiento y sin identificadores. */
(() => {
  const key = 'jjti-theme-v1';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(window.localStorage.getItem(key)); } catch { /* Almacenamiento opcional. */ }
  let cleanup = null;
  const apply = () => {
    root.classList.add('theme-changing');
    if (cleanup !== null) window.cancelAnimationFrame(cleanup);
    root.dataset.theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const dark = root.dataset.theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    });
    cleanup = window.requestAnimationFrame(() => {
      cleanup = window.requestAnimationFrame(() => { root.classList.remove('theme-changing'); cleanup = null; });
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === 'dark' ? '#0c1222' : '#191970';
  };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try {
          if (preference === 'system') window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, preference);
        } catch { /* La elección funciona durante la página aun sin persistencia. */ }
        apply();
      });
    });
    apply();
  });
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });
})();
