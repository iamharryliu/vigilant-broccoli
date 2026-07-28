import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: import.meta.dirname,
  base: process.env.VITE_BASE_PATH ?? '/',
  cacheDir: '../../../node_modules/.vite/pages-index',
  server: {
    port: 4202,
    host: 'localhost',
  },
  preview: {
    port: 4202,
    host: 'localhost',
  },
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: '../../../dist/pages-index',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    'import.meta.vitest': undefined,
  },
}));
