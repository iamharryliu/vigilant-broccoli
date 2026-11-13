//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');
const LOCAL_MANAGER = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/local-manager-origins.json');
const MOBILE_MANAGER = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/mobile-manager-origins.json');

const IS_DEV = process.env.NODE_ENV !== 'production';
const SUPABASE_URL = SUPABASE_NEXT_ENV.NEXT_PUBLIC_SUPABASE_URL;

// Only the manager apps may frame this app, which limits clickjacking on a
// signed-in frame; the same lists gate the weather embed's messaging.
const FRAME_ANCESTORS = [
  "'self'",
  LOCAL_MANAGER.url,
  ...LOCAL_MANAGER.loopbackOrigins,
  ...MOBILE_MANAGER.origins,
];

// Sessions live in localStorage, so the policy blocks third-party scripts and
// any request off this origin and Supabase. Next's App Router inlines its
// hydration scripts, hence 'unsafe-inline' (a nonce would force dynamic
// rendering); dev adds eval and the HMR socket.
const CONTENT_SECURITY_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    ...(IS_DEV ? ["'unsafe-eval'"] : []),
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    SUPABASE_URL,
    SUPABASE_URL.replace('https://', 'wss://'),
    ...(IS_DEV ? ['ws:'] : []),
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': FRAME_ANCESTORS,
};

const CSP_HEADER = Object.entries(CONTENT_SECURITY_POLICY)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  env: SUPABASE_NEXT_ENV,
  distDir: '../../../dist/apps/ui/tasks-next/.next',
  agentRules: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: CSP_HEADER }],
      },
    ];
  },
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
