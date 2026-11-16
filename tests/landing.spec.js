const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function fillForm(page) {
  await page.getByLabel('Nombre', { exact: true }).fill('Consulta de prueba');
  await page.getByLabel('Empresa', { exact: true }).fill('Empresa de prueba');
  await page.getByLabel('WhatsApp / Teléfono').fill('50370000000');
  await page.getByLabel('Correo electrónico').fill('test@example.com');
  await page.getByLabel('Cuéntanos brevemente', { exact: true }).fill('Consulta sintética, no enviar a un buzón real.');
  await page.locator('[name="privacy_consent"]').check();
}

test.beforeEach(async ({ page }) => {
  // Ninguna prueba puede enviar consultas, fuentes o telemetría a terceros.
  await page.route('https://**/*', (route) => route.abort());
  await page.goto('/');
});

test('cada plan conserva contexto y permite cambiarlo', async ({ page }) => {
  const plans = ['Operación Esencial', 'Gestión Activa', 'Gestión Integral'];
  for (const plan of plans) {
    await page.locator(`[data-plan="${plan}"]`).click();
    await expect(page.getByLabel('Plan de interés')).toHaveValue(plan);
    await expect(page.getByLabel('Soporte TI', { exact: true })).toBeChecked();
  }
  await page.getByLabel('Plan de interés').selectOption('Proyecto puntual');
  await expect(page.getByLabel('Plan de interés')).toHaveValue('Proyecto puntual');
});

test('necesidades y consentimiento impiden envío vacío', async ({ page }) => {
  let requests = 0;
  await page.route('https://formsubmit.co/**', (route) => { requests++; return route.abort(); });
  await fillForm(page);
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  expect(requests).toBe(0);
  expect(await page.locator('[name="needs"]').first().evaluate((input) => input.validity.customError)).toBe(true);
  await page.getByLabel('CCTV', { exact: true }).check();
  await page.locator('[name="privacy_consent"]').uncheck();
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  expect(requests).toBe(0);
});

test('POST aceptado contiene contexto y múltiples necesidades', async ({ page }) => {
  let received;
  await page.route('https://formsubmit.co/ajax/info@jj-ti.net', async (route) => {
    received = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
  });
  await page.locator('[data-plan="Gestión Activa"]').click();
  await fillForm(page);
  await page.getByLabel('CCTV', { exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  await expect(page.getByRole('status')).toContainText('El servicio aceptó tu solicitud');
  expect(received.plan).toBe('Gestión Activa');
  expect(received.needs).toBe('Soporte TI, CCTV');
  expect(received.reference).toMatch(/^JJTI-/);
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Consulta de prueba');
  await expect(page.getByRole('status')).not.toContainText('entregado');
});

for (const failure of ['network', 'http', 'provider', 'invalid-json']) {
  test(`error ${failure} conserva datos y permite reintento`, async ({ page }) => {
    await page.route('https://formsubmit.co/ajax/**', async (route) => {
      if (failure === 'network') return route.abort();
      return route.fulfill({
        status: failure === 'http' ? 503 : 200,
        contentType: 'application/json',
        body: failure === 'invalid-json' ? 'invalid' : '{"success":false}',
      });
    });
    await fillForm(page);
    await page.getByLabel('CCTV', { exact: true }).check();
    await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
    await expect(page.getByRole('status')).toContainText('No pudimos confirmar');
    await expect(page.getByLabel('Empresa', { exact: true })).toHaveValue('Empresa de prueba');
    await expect(page.getByRole('button', { name: 'Solicitar diagnóstico' })).toBeEnabled();
    await page.route('https://formsubmit.co/ajax/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
    await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
    await expect(page.getByRole('status')).toContainText('El servicio aceptó');
  });
}

test('no duplica solicitudes mientras el proveedor responde', async ({ page }) => {
  let requests = 0;
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  await page.route('https://formsubmit.co/ajax/**', async (route) => {
    requests++;
    await pending;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await fillForm(page);
  await page.getByLabel('CCTV', { exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  await expect(page.getByRole('button', { name: 'Solicitar diagnóstico' })).toBeDisabled();
  await page.locator('form').evaluate((form) => form.dispatchEvent(new Event('submit', { cancelable: true })));
  expect(requests).toBe(1);
  release();
  await expect(page.getByRole('status')).toContainText('El servicio aceptó');
});

test('menú móvil cierra con Escape, devuelve foco y desbloquea scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.locator('[data-nav-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation').getByRole('link', { name: 'Soluciones', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
});

test('teclado permite saltar al contenido y respeta movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();
  expect(await page.locator('html').evaluate((html) => getComputedStyle(html).scrollBehavior)).toBe('auto');
});

test('sin JavaScript conserva contacto y POST nativo', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route('https://**/*', (route) => route.abort());
  await page.goto(baseURL);
  await expect(page.locator('form')).toHaveAttribute('action', 'https://formsubmit.co/info@jj-ti.net');
  await expect(page.locator('form')).toHaveAttribute('method', 'post');
  for (const link of await page.locator('a[href*="wa.me"]').all()) {
    await expect(link).toHaveAttribute('href', /wa.me\/50379124962/);
  }
  await context.close();
});

test('axe WCAG AA y página sin desbordamiento', async ({ page }, testInfo) => {
  await page.screenshot({ path: testInfo.outputPath('landing.png'), fullPage: true });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, reason: n.failureSummary })) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/privacidad.html');
  const privacy = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(privacy.violations).toEqual([]);
});


test('timeout conserva datos y libera el formulario', async ({ page }) => {
  await page.clock.install();
  await page.route('https://formsubmit.co/ajax/**', () => {});
  await fillForm(page);
  await page.getByLabel('CCTV', { exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  await expect(page.getByRole('button', { name: 'Solicitar diagnóstico' })).toBeDisabled();
  await page.clock.fastForward(21000);
  await expect(page.getByRole('status')).toContainText('No pudimos confirmar');
  await expect(page.getByRole('button', { name: 'Solicitar diagnóstico' })).toBeEnabled();
  await expect(page.getByLabel('Empresa', { exact: true })).toHaveValue('Empresa de prueba');
});


test('diseño de software conserva la necesidad en la consulta', async ({ page }) => {
  let received;
  await page.route('https://formsubmit.co/ajax/**', async (route) => {
    received = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.getByRole('link', { name: 'Hablemos de tu idea' }).click();
  await expect(page.getByLabel('Plan de interés')).toHaveValue('Proyecto puntual');
  await expect(page.getByLabel('Diseño de software', { exact: true })).toBeChecked();
  await fillForm(page);
  await page.getByRole('button', { name: 'Solicitar diagnóstico' }).click();
  await expect(page.getByRole('status')).toContainText('El servicio aceptó');
  expect(received.needs).toBe('Diseño de software');
  expect(received.plan).toBe('Proyecto puntual');
});
