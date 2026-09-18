import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const isLocalServer = !process.env.BASE_URL;

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: BASE_URL,
  },
  webServer: isLocalServer
    ? {
        command: 'npx nx run component-library:preview',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      }
    : undefined,
  projects: [
    { name: 'default', use: {} },
    { name: 'slow', use: { launchOptions: { slowMo: 500 } } },
  ],
});
