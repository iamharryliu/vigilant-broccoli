import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
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
        command:
          'node node_modules/vite/bin/vite.js --config apps/ui/vb-manager-local-react/vite.config.mts',
        cwd: resolve(__dirname, '../../../..'),
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
        env: {
          VITE_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
          VITE_SUPABASE_PUBLISHABLE_KEY: 'e2e-dummy-key',
        },
      }
    : undefined,
  projects: [
    { name: 'default', use: {} },
    { name: 'slow', use: { launchOptions: { slowMo: 500 } } },
  ],
});
