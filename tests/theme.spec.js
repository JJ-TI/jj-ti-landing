const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
test.beforeEach(async({page})=>{await page.route('https://**/*',r=>r.abort());});
test('tema sigue sistema, persiste elección y se restablece',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Rechazar o retirar'}).click();
 await page.getByLabel('Apariencia').selectOption('light');await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('.specialty-link').nth(1).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Desarrollo de software');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Apariencia').selectOption('system');
 expect(await page.evaluate(()=>localStorage.getItem('jjti-theme-v1'))).toBeNull();
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('tema funciona con storage bloqueado',async({page})=>{
 await page.addInitScript(()=>{for(const key of ['getItem','setItem','removeItem'])Storage.prototype[key]=()=>{throw new Error('blocked');};});
 await page.goto('/');await page.getByLabel('Apariencia').selectOption('dark');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByLabel('Apariencia').selectOption('light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('contraste oscuro y especialidades sin overflow',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Rechazar o retirar'}).click();await page.getByLabel('Apariencia').selectOption('dark');
 await expect(page.locator('.specialty-link')).toHaveCount(5);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))}))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
