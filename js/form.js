/** Registro durable de solicitudes; nunca equipara recepción a correo entregado. */
(() => {
  const form=document.querySelector('[data-diagnosis-form]');
  const status=document.querySelector('[data-form-status]');
  if(!form||!status)return;
  const button=form.querySelector('[type="submit"]');
  const needs=[...form.querySelectorAll('[name="needs"]')];
  const plan=form.querySelector('[name="plan"]');
  let sending=false;
  let attempt=null;
  const setStatus=(message,type)=>{status.textContent=message;status.className=`form-status is-${type}`;};
  const validateNeeds=()=>{
    const valid=needs.some(input=>input.checked);
    needs[0]?.setCustomValidity(valid?'':'Selecciona al menos una necesidad.');return valid;
  };
  needs.forEach(input=>input.addEventListener('change',validateNeeds));validateNeeds();
  const select=(value,need)=>{
    if(![...plan.options].some(option=>option.value===value))return;
    plan.value=value;
    const chosen=needs.find(input=>input.value===need);if(chosen)chosen.checked=true;
    validateNeeds();setStatus(`Consulta sobre ${need||value}. Puedes cambiarla antes de enviar.`,'info');
  };
  document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>select(link.dataset.plan,link.dataset.need||'Soporte TI')));
  const services={software:'Diseño de software',soporte:'Soporte TI',infraestructura:'Redes / Infraestructura',cloud:'Microsoft 365 / Cloud',seguridad:'Ciberseguridad',cctv:'CCTV',respaldo:'Backup / Continuidad'};
  const selected=new URLSearchParams(location.search).get('servicio');
  if(services[selected])select('Proyecto puntual',services[selected]);
  const emit=target=>window.dispatchEvent(new CustomEvent('jjti:event',{detail:{kind:'click',target}}));
  form.addEventListener('focusin',()=>emit('lead-start'),{once:true});
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setStatus('Vista previa de diseño: el envío está deshabilitado.', 'info');
  });
})();
