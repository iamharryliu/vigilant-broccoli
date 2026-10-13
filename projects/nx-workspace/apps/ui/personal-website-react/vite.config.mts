import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

const PRODUCTION_ENV_MODE = 'production-env';

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  base: process.env.VITE_BASE_PATH ?? '/',
  cacheDir: '../../../node_modules/.vite/personal-website-react',
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    host: 'localhost',
  },
  resolve: {
    alias:
      mode === PRODUCTION_ENV_MODE
        ? [
            {
              find: /^(.*\/environments\/environment)$/,
              replacement: '$1.production',
            },
          ]
        : [],
  },
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: '../../../dist/apps/ui/personal-website-react',
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
