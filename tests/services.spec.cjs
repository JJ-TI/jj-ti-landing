const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const services = [
  ['soporte-ti', 'Soporte y Gestión TI', 'Soporte TI'],
  ['diseno-software', 'Desarrollo de software', 'Diseño de software'],
  ['infraestructura-redes', 'Infraestructura y Redes', 'Redes / Infraestructura'],
  ['cloud-microsoft365', 'Cloud y Microsoft 365', 'Microsoft 365 / Cloud'],
  ['seguridad-continuidad', 'Seguridad, Respaldo y Continuidad', 'Ciberseguridad'],
  ['cctv', 'CCTV y Videovigilancia', 'CCTV'],
];
const blockExternal = route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort();
test.beforeEach(async ({page}) => { await page.route('**/*', blockExternal); });
test('cada servicio abre su descripción y conserva tema y contexto de consulta', async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.emulateMedia({colorScheme:'light'});
  await page.locator('[data-theme-toggle]').click();
  for (let i=0;i<services.length;i++) {
    const [slug,title,need]=services[i];
    await page.goto('/');
    const link=i<5?page.locator('.specialty-link').nth(i):page.locator(`.services-grid a[href="servicios/${slug}.html"]`);
    await expect(link).toHaveAttribute('href',`servicios/${slug}.html`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/servicios/${slug}\\.html$`));
    await expect(page.getByRole('heading',{level:1})).toHaveText(title);
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await page.getByRole('link',{name:'Consultar este servicio',exact:true}).click();
    await expect(page.locator('[name="needs"]:checked')).toHaveCount(1);
    await expect(page.locator('[name="needs"]:checked')).toHaveValue(need);
    await expect(page.locator('[data-whatsapp-request]')).toBeHidden();
  }
  await page.goto('/?servicio=__proto__#diagnostico');
  await expect(page.locator('[name="needs"]:checked')).toHaveCount(0);
});
test('descripción accesible en ambos temas y disponible sin JavaScript', async ({page,browser,baseURL}) => {
  await page.goto('/servicios/diseno-software.html');
  for(const mode of ['light','dark']) {
    await page.emulateMedia({colorScheme:mode});
    await expect(page.locator('html')).toHaveAttribute('data-theme',mode);
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(audit.violations.flatMap(v=>v.nodes.map(n=>({id:v.id,target:n.target,reason:n.failureSummary})))).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const fallback=await context.newPage();
  await fallback.route('**/*',blockExternal);
  await fallback.goto(`${baseURL}/servicios/soporte-ti.html`);
  await expect(fallback.getByRole('heading',{level:1})).toHaveText('Soporte y Gestión TI');
  await expect(fallback.getByRole('link',{name:'Consultar este servicio',exact:true})).toHaveAttribute('href','../index.html?servicio=soporte#diagnostico');
  await expect(fallback.locator('[data-theme-toggle]')).toBeHidden();
  await context.close();
});
