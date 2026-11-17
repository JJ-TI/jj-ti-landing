/** Reflejo local del puntero. Sin red, almacenamiento ni lectura de formularios. */
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.button').forEach(button => {
    let frame = null;
    let point = null;
    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      point = null;
      button.style.removeProperty('--pointer-x');
      button.style.removeProperty('--pointer-y');
    };
    button.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse' || button.matches(':disabled, [aria-disabled="true"]')) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        const bounds = button.getBoundingClientRect();
        button.style.setProperty('--pointer-x', `${Math.round(point.x - bounds.left)}px`);
        button.style.setProperty('--pointer-y', `${Math.round(point.y - bounds.top)}px`);
        frame = null;
      });
    }, { passive: true });
    button.addEventListener('pointerleave', reset, { passive: true });
    button.addEventListener('pointercancel', reset, { passive: true });
    reducedMotion.addEventListener('change', reset);
    finePointer.addEventListener('change', reset);
  });
})();
