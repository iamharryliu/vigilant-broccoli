import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

const API_PATH = '/api';
const API_DEV_SERVER_URL = 'http://127.0.0.1:3003';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/vb-manager-local-react',
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      [API_PATH]: API_DEV_SERVER_URL,
    },
  },
  preview: {
    port: 3000,
    host: '127.0.0.1',
  },
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: '../../../dist/vb-manager-local-react',
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
