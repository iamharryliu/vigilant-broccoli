import { CONTENT_TYPE_HEADER } from '@vigilant-broccoli/common-js';
import { getClientRuntimeConfig } from '../../../libs/runtime-config';
import { RUNTIME_CONFIG } from '../app.const';

// The root layout loads this before hydration so the browser reads Supabase
// settings from the server's environment instead of a build-time inline.
export const dynamic = 'force-dynamic';

const CACHE_CONTROL_HEADER = 'Cache-Control';
const JAVASCRIPT_CONTENT_TYPE = 'text/javascript; charset=utf-8';
const NO_STORE = 'no-store';

export function GET() {
  const config = JSON.stringify(getClientRuntimeConfig());
  return new Response(`window.${RUNTIME_CONFIG.GLOBAL}=${config};`, {
    headers: {
      [CONTENT_TYPE_HEADER]: JAVASCRIPT_CONTENT_TYPE,
      [CACHE_CONTROL_HEADER]: NO_STORE,
    },
  });
}
