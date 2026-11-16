/** Recepción mediante FormSubmit; nunca confirma entrega al buzón. */
(() => {
  const form = document.querySelector('[data-diagnosis-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form || !status) return;
  const button = form.querySelector('[type="submit"]');
  const needs = [...form.querySelectorAll('[name="needs"]')];
  const plan = form.querySelector('[name="plan"]');
  const setStatus = (message, type) => {
    status.textContent = message;
    status.className = `form-status is-${type}`;
  };
  const validateNeeds = () => {
    const valid = needs.some((input) => input.checked);
    needs[0]?.setCustomValidity(valid ? '' : 'Selecciona al menos una necesidad.');
    return valid;
  };
  needs.forEach((input) => input.addEventListener('change', validateNeeds));
  validateNeeds();
  document.querySelectorAll('[data-plan]').forEach((link) => {
    link.addEventListener('click', () => {
      plan.value = link.dataset.plan;
      const selectedNeed = needs.find((input) => input.value === (link.dataset.need || 'Soporte TI'));
      if (selectedNeed) selectedNeed.checked = true;
      validateNeeds();
      setStatus(`Consulta sobre ${plan.value}. Puedes cambiar el plan antes de enviar.`, 'info');
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setStatus('Vista previa de diseño: el envío está deshabilitado.', 'info');
  });
})();
