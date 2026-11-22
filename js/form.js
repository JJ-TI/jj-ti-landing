/** Prepara una solicitud localmente; el visitante decide cuándo enviarla. */
(() => {
  const form = document.querySelector('[data-diagnosis-form]');
  const status = document.querySelector('[data-form-status]');
  const requestLink = document.querySelector('[data-whatsapp-request]');
  const contactLink = document.querySelector('[data-contact-whatsapp]');
  if (!form || !status || !requestLink || !contactLink) return;

  const clearRequest = () => {
    requestLink.hidden = true;
    requestLink.removeAttribute('href');
    status.textContent = '';
    status.className = 'form-status';
  };
  form.addEventListener('input', clearRequest);
  form.addEventListener('change', clearRequest);
  form.addEventListener('reset', clearRequest);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearRequest();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const needs = data.getAll('needs');
    if (needs.length === 0) {
      status.textContent = 'Selecciona al menos una necesidad para continuar.';
      status.className = 'form-status is-error';
      form.querySelector('[name="needs"]').focus();
      return;
    }
    const fields = ['name', 'company', 'phone', 'email', 'message'];
    if (fields.some((name) => !String(data.get(name) || '').trim())) {
      status.textContent = 'Completa los campos con información válida.';
      status.className = 'form-status is-error';
      return;
    }
    const text = [
      'Hola, JJ-TI. Quisiera solicitar un diagnóstico.',
      `Nombre: ${String(data.get('name')).trim()}`,
      `Empresa: ${String(data.get('company')).trim()}`,
      `Teléfono: ${String(data.get('phone')).trim()}`,
      `Correo: ${String(data.get('email')).trim()}`,
      `Necesidades: ${needs.join(', ')}`,
      `Detalle: ${String(data.get('message')).trim()}`,
    ].join('\n');
    const url = new URL(contactLink.href);
    url.search = '';
    url.searchParams.set('text', text);
    requestLink.href = url.href;
    requestLink.hidden = false;
    status.textContent = 'Mensaje preparado. Revisa y envíalo en WhatsApp; todavía no se ha enviado.';
    status.className = 'form-status is-success';
    requestLink.focus();
  });
  // Se habilita únicamente después de registrar el bloqueo del envío nativo.
  form.querySelector('.diagnosis-fields').disabled = false;
  form.hidden = false;
})();
