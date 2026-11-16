/** Analítica propia, opt-in y sin contenido de formularios, URLs ni huellas digitales. */
(() => {
  const cfg=window.JJTI_CONFIG;
  if(!cfg?.analyticsEnabled||cfg.preview)return;
  const consentKey='jjti-consent-v1', visitorKey='jjti-visitor-v1', sessionKey='jjti-session-v1';
  const blocked=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
  const banner=document.querySelector('[data-analytics-consent]');
  const notice=document.querySelector('[data-analytics-status]');
  let accepted=false, token=null, queue=[], pending=false, starting=null, visibleSince=null, visibleMs=0, lastSent=Date.now();
  const seenSections=new Set();
  const read=(storage,key)=>{try{return JSON.parse(storage.getItem(key));}catch{return null;}};
  const write=(storage,key,value)=>{try{value===null?storage.removeItem(key):storage.setItem(key,JSON.stringify(value));}catch{/* Almacenamiento bloqueado: identificación solo en memoria. */}};
  const post=(path,body,keepalive=false)=>fetch(`${cfg.apiBase||''}/api/v1/analytics/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive,credentials:'omit'});
  const page=document.body.dataset.page||'inicio';
  const event=(kind,target)=>{if(accepted&&!blocked()&&queue.length<40)queue.push({id:crypto.randomUUID(),kind,target});};
  function accrue(){const now=Date.now();if(visibleSince!==null)visibleMs+=Math.min(45000,Math.max(0,now-visibleSince));visibleSince=document.visibilityState==='visible'&&document.hasFocus()?now:null;}
  async function start(){
    if(!accepted||blocked())return;
    if(starting)return starting;
    starting=(async()=>{
      let visitor=read(localStorage,visitorKey);
      if(!visitor||Date.now()-visitor.created>90*86400000){visitor={id:crypto.randomUUID(),created:Date.now()};write(localStorage,visitorKey,visitor);}
      const cached=read(sessionStorage,sessionKey);
      if(cached&&Date.now()-cached.last<30*60000){token=cached.token;return;}
      const response=await post('session',{visitor_id:visitor.id,consent:true});
      if(!response.ok)return;
      const result=await response.json();if(!accepted||blocked()){await post('forget',{token:result.token}).catch(()=>{});return;}
      token=result.token;write(sessionStorage,sessionKey,{token,last:Date.now()});
    })().catch(()=>{}).finally(()=>{starting=null;});return starting;
  }
  async function flush(keepalive=false){
    if(!accepted||blocked()||pending)return;
    pending=true;accrue();
    try{
      await start();if(!token||!accepted)return;
      const batch=queue.slice(0,20), delta=Math.min(45000,Math.round(visibleMs));
      if(batch.length){const r=await post('events',{token,events:batch},keepalive);if(r.ok)queue.splice(0,batch.length);else if([401,410].includes(r.status)){token=null;write(sessionStorage,sessionKey,null);}}
      if(token){const r=await post('heartbeat',{token,visible_ms:delta,ended:false},keepalive);if(r.ok){visibleMs=Math.max(0,visibleMs-delta);write(sessionStorage,sessionKey,{token,last:Date.now()});}else if([401,410].includes(r.status)){token=null;write(sessionStorage,sessionKey,null);}}
      lastSent=Date.now();
    }catch{/* Analítica best-effort: nunca bloquear navegación ni el formulario. */}finally{pending=false;}
  }
  function enable(){
    accepted=true;visibleSince=document.visibilityState==='visible'&&document.hasFocus()?Date.now():null;
    event('page',page);start().then(()=>flush());
  }
  async function choose(value){
    if(value==='accepted'&&!blocked()){write(localStorage,consentKey,{value,at:Date.now()});if(!accepted)enable();}
    else{
      accepted=false;queue=[];visibleMs=0;visibleSince=null;
      const current=token||read(sessionStorage,sessionKey)?.token;token=null;
      write(localStorage,consentKey,{value:'rejected',at:Date.now()});write(localStorage,visitorKey,null);write(sessionStorage,sessionKey,null);
      if(current){try{const response=await post('forget',{token:current});if(!response.ok)throw new Error('Not deleted');if(notice)notice.textContent='Analítica desactivada y datos de este navegador eliminados del servidor.';}
      catch{if(notice)notice.textContent='Analítica desactivada en este navegador. No pudimos confirmar el borrado remoto; puedes solicitarlo en info@jj-ti.net.';}}
    }
    if(banner)banner.hidden=!(notice?.textContent);
  }
  document.querySelector('[data-analytics-close]')?.addEventListener('click',()=>{if(banner)banner.hidden=true;});
  document.querySelector('[data-analytics-accept]')?.addEventListener('click',()=>choose('accepted'));
  document.querySelector('[data-analytics-reject]')?.addEventListener('click',()=>choose('rejected'));
  document.querySelectorAll('[data-analytics-settings]').forEach(button=>button.addEventListener('click',()=>{if(banner)banner.hidden=false;if(notice)notice.textContent=blocked()?'Tu navegador solicita no ser rastreado. La analítica permanecerá desactivada.':'';}));
  document.addEventListener('click',e=>{const link=e.target.closest('[data-track]');if(link){event('click',link.dataset.track);flush(true);}});
  window.addEventListener('jjti:event',e=>{event(e.detail.kind,e.detail.target);flush();});
  window.addEventListener('error',e=>event('error',e instanceof ErrorEvent?'runtime':'resource'),true);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&!seenSections.has(entry.target.id)){seenSections.add(entry.target.id);event('section',entry.target.id);}},{threshold:0});
  document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
  for(const name of ['focus','blur'])window.addEventListener(name,accrue);
  document.addEventListener('visibilitychange',()=>{accrue();if(document.hidden)flush(true);});
  window.addEventListener('pagehide',()=>flush(true));
  window.addEventListener('storage',e=>{if(accepted&&e.key===consentKey&&read(localStorage,consentKey)?.value!=='accepted')choose('rejected');});
  setInterval(()=>{if(!accepted||blocked())return;if(document.visibilityState==='visible'&&document.hasFocus())flush();else if(Date.now()-lastSent>30*60000){token=null;write(sessionStorage,sessionKey,null);}},30000);
  const choice=read(localStorage,consentKey);
  if(blocked())choose('rejected');
  else if(choice?.value==='accepted'&&Date.now()-choice.at<180*86400000)enable();
  else if(!choice||Date.now()-choice.at>=180*86400000){if(banner)banner.hidden=false;}
})();
