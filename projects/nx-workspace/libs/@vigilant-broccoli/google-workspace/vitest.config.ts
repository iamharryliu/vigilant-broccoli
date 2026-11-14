import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/libs/@vigilant-broccoli/google-workspace',
  resolve: { tsconfigPaths: true },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory:
        '../../../coverage/libs/@vigilant-broccoli/google-workspace',
      provider: 'v8',
    },
  },
});
