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
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(window.JJTI_CONFIG?.preview){setStatus('Vista previa: el envío está deshabilitado.','info');return;}
    if(sending)return;
    validateNeeds();if(!form.reportValidity())return;
    if(form.elements.namedItem('_honey')?.value)return;
    const fields=new FormData(form);
    const payload={name:fields.get('name'),company:fields.get('company'),phone:fields.get('phone'),email:fields.get('email'),plan:fields.get('plan'),needs:fields.getAll('needs'),message:fields.get('message'),privacy_consent:fields.get('privacy_consent')==='Aceptado'};
    const fingerprint=JSON.stringify(payload);
    if(!attempt||attempt.fingerprint!==fingerprint)attempt={fingerprint,id:crypto.randomUUID()};
    sending=true;button.disabled=true;form.setAttribute('aria-busy','true');setStatus('Registrando tu solicitud…','info');
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const base=window.JJTI_CONFIG?.apiBase||'';
      const response=await fetch(`${base}/api/v1/leads`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...payload,idempotency_key:attempt.id}),signal:controller.signal});
      const result=await response.json();
      if(response.status!==202||!['queued','sent','failed'].includes(result.status)||!/^[a-f0-9-]{36}$/.test(result.reference||''))throw new Error('Not registered');
      if(result.status==='failed')setStatus(`Tu solicitud está registrada (${result.reference}), pero el envío del aviso está pendiente de revisión. Puedes escribirnos directamente a info@jj-ti.net.`,'error');
      else setStatus(`Registramos tu solicitud. Referencia: ${result.reference}. ${result.status==='queued'?'El aviso al equipo está en cola.':'El servidor de correo aceptó el aviso.'} Esto no confirma su lectura. Conserva la referencia para consultar su estado.`,'success');
      emit('lead-accepted');
      // Misma clave al reintentar la misma consulta; nunca borrar datos ante resultado incierto.
    }catch{
      setStatus('No pudimos confirmar el registro. Tus datos siguen aquí y puedes reintentar sin duplicar esta solicitud. También puedes escribirnos a info@jj-ti.net o por WhatsApp.','error');emit('lead-error');
    }finally{clearTimeout(timer);sending=false;button.disabled=false;form.removeAttribute('aria-busy');}
  });
})();
