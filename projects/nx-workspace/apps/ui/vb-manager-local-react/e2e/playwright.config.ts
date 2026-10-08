import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    { name: 'default', use: {} },
    { name: 'slow', use: { launchOptions: { slowMo: 500 } } },
  ],
});
