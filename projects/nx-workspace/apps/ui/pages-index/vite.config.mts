import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const inventoryPath = fileURLToPath(
  new URL('../../../../../.upptimerc.yml', import.meta.url),
);
const readSites = (): { name: string; url: string }[] =>
  parse(readFileSync(inventoryPath, 'utf8')).sites.map(
    ({ name, url }: { name: string; url: string }) => ({ name, url }),
  );

export default defineConfig(() => ({
  root: import.meta.dirname,
  base: process.env.VITE_BASE_PATH ?? '/',
  cacheDir: '../../../node_modules/.vite/pages-index',
  server: {
    port: 3000,
    host: 'localhost',
  },
  preview: {
    port: 3000,
    host: 'localhost',
  },
  plugins: [
    react(),
    {
      name: 'upptime-inventory',
      configureServer(server) {
        server.watcher.add(inventoryPath);
        server.watcher.on('change', path => {
          if (path === inventoryPath) void server.restart();
        });
      },
    },
  ],
  resolve: { tsconfigPaths: true },
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
    __UPPTIME_SITES__: JSON.stringify(readSites()),
  },
}));
