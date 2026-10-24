import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/libs/@vigilant-broccoli/react-lib-auth',

  resolve: { tsconfigPaths: true },
});
