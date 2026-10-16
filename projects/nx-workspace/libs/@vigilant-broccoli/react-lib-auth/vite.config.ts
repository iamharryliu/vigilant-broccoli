import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/libs/@vigilant-broccoli/react-lib-auth',

  plugins: [tsconfigPaths()],
});
