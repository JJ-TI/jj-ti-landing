const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

test('tema sigue al sistema y conserva elección local al recargar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('tema funciona aunque almacenamiento local esté bloqueado', async ({ page }) => {
  await page.addInitScript(() => {
    for (const key of ['getItem', 'setItem', 'removeItem']) {
      window.Storage.prototype[key] = () => { throw new Error('Storage blocked'); };
    }
  });
  await page.goto('/');
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('accesibilidad del tema oscuro, formulario preparado y menú', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('[data-theme-toggle]').click();
  const audit = async state => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach(`axe-dark-${state}`, { body: JSON.stringify(result), contentType: 'application/json' });
    expect(result.violations.flatMap(v => v.nodes.map(n => ({ id: v.id, target: n.target, reason: n.failureSummary })))).toEqual([]);
  };
  await audit('closed');
  if (page.viewportSize().width <= 1023) {
    await page.locator('[data-nav-toggle]').click();
    await audit('open');
    await page.keyboard.press('Escape');
  }
  await page.locator('#name').fill('Prueba');
  await page.locator('#company').fill('Empresa');
  await page.locator('#phone').fill('00000000');
  await page.locator('#email').fill('qa@example.invalid');
  await page.locator('#message').fill('Mensaje de prueba local');
  await page.getByLabel('Soporte TI', { exact: true }).check();
  await page.getByRole('button', { name: 'Preparar mensaje de WhatsApp' }).click();
  await expect(page.locator('[data-whatsapp-request]')).toBeVisible();
  await audit('prepared');
});

test('diagramas, enlaces visuales y redes pendientes no simulan servicios activos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.specialties')).toHaveCount(1);
  await expect(page.locator('.specialty-link')).toHaveCount(5);
  await expect(page.locator('.problem-visual img')).toHaveCount(4);
  await expect(page.locator('.software-blueprint img')).toHaveCount(1);
  for (const image of await page.locator('.problem-visual img, .software-blueprint img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveAttribute('alt', '');
  }
  await expect(page.locator('.footer-social .is-pending')).toHaveCount(4);
  await expect(page.locator('.footer-social .is-pending a')).toHaveCount(0);
  await page.getByRole('link', { name: 'Consultar mi proyecto de software' }).click();
  await expect(page.getByLabel('Desarrollo de software', { exact: true })).toBeChecked();
  for (const width of [1440, 1024, 820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('movimiento reducido evita reflejo y animación del menú', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.locator('.hero__actions .button').first();
  await button.hover();
  await expect.poll(() => button.evaluate(node => window.getComputedStyle(node).transitionDuration)).toBe('0s');
  expect(await button.evaluate(node => node.style.getPropertyValue('--pointer-x'))).toBe('');
  if (page.viewportSize().width <= 1023) {
    await page.locator('[data-nav-toggle]').click();
    expect(await page.locator('[data-navigation]').evaluate(node => window.getComputedStyle(node).animationName)).toBe('none');
  }
});
