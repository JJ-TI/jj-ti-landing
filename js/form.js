/**
 * JJ-TI — validación del formulario de diagnóstico.
 *
 * Esta versión todavía no envía información a un backend. Su propósito es
 * dejar preparada la experiencia y validar los datos antes de conectar el
 * formulario con el canal definitivo de recepción.
 */
(() => {
  /** Formulario principal de diagnóstico. */
  const form = document.querySelector('[data-diagnosis-form]');
  /** Área accesible donde se comunica el resultado de la validación. */
  const status = document.querySelector('[data-form-status]');

  if (!form || !status) return;

  /**
   * Muestra un mensaje de validación y aplica la variante visual correspondiente.
   * @param {string} message - Texto que verá el usuario.
   * @param {'success'|'error'} type - Variante visual del mensaje.
   */
  const setStatus = (message, type) => {
    status.textContent = message;
    status.className = `form-status is-${type}`;
  };

  /**
   * Valida la información básica del formulario sin realizar todavía un envío.
   */
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    /** FormData facilita consultar los checkbox seleccionados sin depender del DOM. */
    const formData = new FormData(form);

    /** Lista de servicios seleccionados por el visitante. */
    const selectedNeeds = formData.getAll('needs');

    if (selectedNeeds.length === 0) {
      setStatus('Selecciona al menos una necesidad para continuar.', 'error');
      return;
    }

    setStatus(
      'Formulario validado. En la siguiente fase conectaremos este formulario con el canal de recepción de JJ-TI.',
      'success',
    );
  });
})();
