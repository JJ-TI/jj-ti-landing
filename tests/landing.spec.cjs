const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const blockExternal = route => new URL(route.request().url()).hostname === '127.0.0.1'
  ? route.continue() : route.abort();

test.beforeEach(async ({ page }) => { await page.route('**/*', blockExternal); });

async function fillContact(page) {
  await page.getByLabel('Nombre', { exact: true }).fill('Prueba & QA');
  await page.getByLabel('Empresa', { exact: true }).fill('Empresa de prueba');
  await page.getByLabel('WhatsApp / Teléfono').fill('00000000');
  await page.getByLabel('Correo electrónico').fill('qa@example.invalid');
  await page.getByLabel('Cuéntanos brevemente', { exact: true }).fill('Redes & cloud <prueba>');
}

test('carga recursos, destinos internos y layout sin desbordamiento', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const assets = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes =>
    nodes.map(node => node.src || node.href).filter(url => new URL(url).hostname === '127.0.0.1'));
  expect(assets.length).toBe(10);
  for (const url of assets) expect((await page.request.get(url)).status()).toBe(200);
  expect(await page.locator('a[href^="#"], use[href^="#"]').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute('href').slice(1)).filter(id => !document.getElementById(id)))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('navegación por teclado, Escape y cambio a escritorio', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido principal' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (page.viewportSize().width > 767) return;
  const toggle = page.locator('[data-nav-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('Cerrar menú');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Soluciones', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.getByRole('navigation').getByRole('link', { name: 'Soluciones', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
});

test('formulario valida, prepara un mensaje y descarta enlaces obsoletos', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  const prepare = page.getByRole('button', { name: 'Preparar mensaje de WhatsApp' });
  const next = page.locator('[data-whatsapp-request]');
  await prepare.click();
  await expect(next).toBeHidden();
  await fillContact(page);
  await prepare.click();
  await expect(page.getByRole('status')).toContainText('Selecciona al menos una necesidad');
  await expect(next).toBeHidden();
  await page.getByLabel('Soporte TI', { exact: true }).check();
  await page.getByLabel('Microsoft 365 / Cloud', { exact: true }).check();
  await prepare.click();
  await expect(next).toBeVisible();
  await expect(next).toBeFocused();
  const url = new URL(await next.getAttribute('href'));
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/50379124962');
  expect(url.searchParams.get('text')).toContain('Prueba & QA');
  expect(url.searchParams.get('text')).toContain('Soporte TI, Microsoft 365 / Cloud');
  expect(url.searchParams.get('text')).toContain('Redes & cloud <prueba>');
  await expect(page.getByRole('status')).toContainText('todavía no se ha enviado');
  expect(new URL(page.url()).search).toBe('');
  expect(requests.some(url => url.includes('example.invalid') || url.includes('wa.me'))).toBe(false);
  await page.getByLabel('Empresa', { exact: true }).fill('Otra empresa');
  expect(await page.getByLabel('Empresa', { exact: true }).evaluate(node => window.getComputedStyle(node).outlineStyle)).toBe('solid');
  await expect(next).toBeHidden();
  await expect(next).not.toHaveAttribute('href');
  await page.getByLabel('Nombre', { exact: true }).fill('   ');
  await prepare.click();
  await expect(next).toBeHidden();
  await expect(page.getByRole('status')).toContainText('información válida');
});

test('sin JavaScript hay navegación y contacto, sin formulario enviable', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize() });
  await context.route('**/*', blockExternal);
  const noJs = await context.newPage();
  await noJs.goto('http://127.0.0.1:8765/');
  await expect(noJs.getByRole('navigation')).toBeVisible();
  expect(await noJs.evaluate(() => document.querySelector('main').getBoundingClientRect().top >= document.querySelector('header').getBoundingClientRect().bottom)).toBe(true);
  expect(await noJs.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(noJs.locator('[data-nav-toggle]')).toBeHidden();
  await expect(noJs.locator('form')).toBeHidden();
  await expect(noJs.locator('.diagnosis-fields')).toHaveAttribute('disabled', '');
  await expect(noJs.locator('#name')).toBeDisabled();
  await expect(noJs.locator('form')).toHaveAttribute('method', 'post');
  const hrefs = await noJs.locator('a[href^="https://wa.me/"]').evaluateAll(nodes => nodes.map(node => node.href));
  expect(hrefs.length).toBeGreaterThanOrEqual(2);
  for (const href of hrefs) expect(new URL(href).pathname).toBe('/50379124962');
  await expect(noJs.getByRole('link', { name: 'escribirnos directamente por WhatsApp' })).toBeVisible();
  await context.close();
});

test('si falla form.js, el formulario sigue protegido', async ({ page }) => {
  await page.route('**/js/form.js', route => route.abort());
  await page.goto('/');
  await expect(page.locator('form')).toBeHidden();
  await expect(page.locator('.diagnosis-fields')).toHaveAttribute('disabled', '');
  await expect(page.locator('#name')).toBeDisabled();
  await expect(page.getByRole('link', { name: 'escribirnos directamente por WhatsApp' })).toBeVisible();
});

test('accesibilidad WCAG AA con menú cerrado y abierto', async ({ page }, testInfo) => {
  await page.goto('/');
  const audit = async (state) => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach(`axe-${state}`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
    expect(result.violations.flatMap(v => v.nodes.map(n => ({ id: v.id, target: n.target, reason: n.failureSummary })))).toEqual([]);
  };
  await audit('closed');
  if (page.viewportSize().width <= 767) {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await audit('open');
  }
});
