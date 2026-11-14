import { RUNTIME_CONFIG } from '../src/app/app.const';
import type { ClientRuntimeConfig } from './runtime-config';

const MISSING_CONFIG_ERROR = `${RUNTIME_CONFIG.PATH} did not load before the app`;

const readConfig = (): ClientRuntimeConfig => {
  const config = (
    window as unknown as Record<string, ClientRuntimeConfig | undefined>
  )[RUNTIME_CONFIG.GLOBAL];
  if (!config) throw new Error(MISSING_CONFIG_ERROR);
  return config;
};

export const getSupabaseUrl = () => readConfig().supabaseUrl;
export const getSupabasePublishableKey = () =>
  readConfig().supabasePublishableKey;
