/** Recepción mediante FormSubmit; nunca confirma entrega al buzón. */
(() => {
  const form = document.querySelector('[data-diagnosis-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form || !status) return;
  const button = form.querySelector('[type="submit"]');
  const needs = [...form.querySelectorAll('[name="needs"]')];
  const plan = form.querySelector('[name="plan"]');
  let sending = false;
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
      const support = needs.find((input) => input.value === 'Soporte TI');
      if (support) support.checked = true;
      validateNeeds();
      setStatus(`Consulta sobre ${plan.value}. Puedes cambiar el plan antes de enviar.`, 'info');
    });
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    validateNeeds();
    if (!form.reportValidity()) return;
    if (form.elements.namedItem('_honey').value) return;
    const data = new FormData(form);
    const payload = Object.fromEntries(data);
    payload.needs = data.getAll('needs').join(', ');
    payload.reference = `JJTI-${crypto.randomUUID()}`;
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setStatus('Enviando tu solicitud…', 'info');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Submission not accepted');
      setStatus(`El servicio aceptó tu solicitud. Referencia de consulta: ${payload.reference}. Si no recibes respuesta, contáctanos por WhatsApp o en info@jj-ti.net.`, 'success');
      // Aceptar el POST no garantiza la entrega del correo; conservamos los datos.
    } catch {
      setStatus('No pudimos confirmar la recepción. Tus datos siguen aquí. Antes de reintentar, considera que el envío pudo haberse procesado. También puedes escribirnos a info@jj-ti.net o por WhatsApp.', 'error');
    } finally {
      clearTimeout(timer);
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();

