const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  workers: 2,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8080', trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
  webServer: { command: 'python3 -m http.server 8080 --bind 127.0.0.1', url: 'http://127.0.0.1:8080', reuseExistingServer: !process.env.CI, stdout: 'ignore', stderr: 'ignore' },
});
