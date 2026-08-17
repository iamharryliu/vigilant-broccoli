import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const isLocalServer = !process.env.BASE_URL;

// The two Supabase values below are the publishable anon key + project URL -
// not secret, and already hardcoded the same way in hearth's own `serve`
// nx target (project.json). They just let the Supabase client construct;
// /dev/sidebar-sandbox itself makes no Supabase calls.
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
          'NEXT_PUBLIC_SUPABASE_URL=https://jrdosjjgmsoodpjmjqxx.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0 npx nx run hearth:serve:local',
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
