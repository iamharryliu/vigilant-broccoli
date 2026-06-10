import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
  base: process.env.VITE_BASE_PATH ?? '/',
  cacheDir: '../../../node_modules/.vite/personal-website-react',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['_redirects'])],
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
