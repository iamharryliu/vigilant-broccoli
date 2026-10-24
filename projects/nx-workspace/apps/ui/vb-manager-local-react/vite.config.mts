import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import SUPABASE_PUBLIC from '../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-public.json' with { type: 'json' };

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
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  build: {
    outDir: '../../../dist/vb-manager-local-react',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    // A set environment variable still overrides the committed public defaults.
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL || SUPABASE_PUBLIC.url,
    ),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLIC.publishableKey,
    ),
    'import.meta.vitest': undefined,
  },
}));
