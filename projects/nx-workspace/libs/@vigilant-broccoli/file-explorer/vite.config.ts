import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/@vigilant-broccoli/file-explorer',

  resolve: { tsconfigPaths: true },
});
