/* Preferencia visual local; independiente del consentimiento y sin identificadores. */
(() => {
  const key = 'jjti-theme-v1';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(localStorage.getItem(key)); } catch { /* Almacenamiento opcional. */ }
  let cleanup = null;
  const apply = () => {
    root.classList.add('theme-changing');
    if (cleanup !== null) cancelAnimationFrame(cleanup);
    root.dataset.theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
    cleanup = requestAnimationFrame(() => {
      cleanup = requestAnimationFrame(() => { root.classList.remove('theme-changing'); cleanup = null; });
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === 'dark' ? '#0c1222' : '#191970';
  };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-select]').forEach(select => {
      select.closest('.theme-control').hidden = false;
      select.addEventListener('change', () => {
        preference = valid(select.value);
        try {
          if (preference === 'system') localStorage.removeItem(key);
          else localStorage.setItem(key, preference);
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
