const {test,expect}=require('@playwright/test');
const validToken='df1f839a-35e1-4af1-8406-6bd2f7caf8d0.1794830000000.abcdef';
test('sin consentimiento no hay IDs persistentes ni tráfico analítico',async({page})=>{
 const calls=[];await page.route('**/api/v1/analytics/**',r=>{calls.push(r.request().url());return r.abort();});
 await page.goto('/');await expect(page.getByRole('region',{name:'Preferencias de analítica'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('jjti-visitor-v1'))).toBeNull();expect(calls).toEqual([]);
 await page.getByRole('button',{name:'Rechazar o retirar'}).click();
 await page.locator('.services-grid a[href="servicios/diseno-software.html"]').click();expect(calls).toEqual([]);
});
test('consentimiento, eventos permitidos, ausencia de PII y revocación',async({page})=>{
 const requests=[];
 await page.route('**/api/v1/analytics/**',async route=>{
  const url=route.request().url(),body=route.request().postDataJSON();requests.push({url,body});
  await route.fulfill({status:url.endsWith('/session')?201:204,contentType:'application/json',body:url.endsWith('/session')?JSON.stringify({token:validToken}):''});
 });
 await page.goto('/?email=never-capture@example.com');
 await page.getByRole('button',{name:'Aceptar analítica'}).click();
 await expect.poll(()=>requests.filter(r=>r.url.endsWith('/session')).length).toBe(1);
 await page.locator('.services-grid a[href="servicios/diseno-software.html"]').click();
 await expect.poll(()=>requests.some(r=>r.body.events?.some(e=>e.target==='service-software'))).toBe(true);
 expect(JSON.stringify(requests)).not.toContain('never-capture');
 expect(await page.evaluate(()=>!!localStorage.getItem('jjti-visitor-v1'))).toBe(true);
 await page.getByRole('button',{name:'Preferencias de analítica'}).click();
 await page.getByRole('button',{name:'Rechazar o retirar'}).click();
 await expect.poll(()=>requests.some(r=>r.url.endsWith('/forget'))).toBe(true);
 await expect(page.locator('[data-analytics-status]')).toContainText('eliminados del servidor');
 expect(await page.evaluate(()=>localStorage.getItem('jjti-visitor-v1'))).toBeNull();
});
test('GPC bloquea identificación incluso al intentar aceptar',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));
 const calls=[];await page.route('**/api/v1/analytics/**',r=>{calls.push(r.request().url());return r.abort();});
 await page.goto('/');await page.getByRole('button',{name:'Preferencias de analítica'}).click();
 await page.getByRole('button',{name:'Aceptar analítica'}).click();expect(calls).toEqual([]);
 expect(await page.evaluate(()=>localStorage.getItem('jjti-visitor-v1'))).toBeNull();
});
test('cada tarjeta abre contenido estático y su consulta conserva servicio',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Rechazar o retirar'}).click();
 for(const [slug,title] of [['soporte-ti','Soporte y Gestión TI'],['diseno-software','Desarrollo de software'],['infraestructura-redes','Infraestructura y Redes'],['cloud-microsoft365','Cloud y Microsoft 365'],['seguridad-continuidad','Seguridad, Respaldo y Continuidad'],['cctv','CCTV y Videovigilancia']]){
  await page.goto('/');await page.locator(`.services-grid a[href="servicios/${slug}.html"]`).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(title);
  const data=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());expect(data['@graph'].some(x=>x['@type']==='Service')).toBe(true);
  await page.getByRole('link',{name:'Consultar este servicio'}).click();await expect(page.getByLabel('Servicio o plan de interés')).toHaveValue('Proyecto puntual');
  await expect(page.locator('[name=needs]:checked')).toHaveCount(1);
 }
});

test('tiempo visible no cuenta la pestaña desenfocada',async({page})=>{
 const sent=[];
 await page.route('**/api/v1/analytics/**',async route=>{const url=route.request().url();sent.push({url,body:route.request().postDataJSON()});await route.fulfill({status:url.endsWith('/session')?201:204,contentType:'application/json',body:url.endsWith('/session')?JSON.stringify({token:validToken}):''});});
 await page.clock.install();await page.goto('/');await page.getByRole('button',{name:'Aceptar analítica'}).click();
 await expect.poll(()=>sent.some(r=>r.url.endsWith('/heartbeat'))).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{value:()=>false,configurable:true});window.dispatchEvent(new Event('blur'));});
 const count=sent.filter(r=>r.url.endsWith('/heartbeat')).length;await page.clock.fastForward(31000);
 expect(sent.filter(r=>r.url.endsWith('/heartbeat')).length).toBe(count);
});
