import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir:
    '../../../node_modules/.vite/libs/@vigilant-broccoli/common-browser',

  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  build: {
    outDir: '../../../dist/libs/@vigilant-broccoli/common-browser',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: 'commonBrowser',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      external: [],
    },
  },
});
