//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');

// local-manager-next rewrites this prefix to this app and embeds it in an
// iframe; basePath also moves /_next assets under it, so the two apps' bundles
// never collide on the shared origin.
const BASE_PATH = '/dev-dashboard/local';

// `node:sqlite` is a builtin webpack doesn't recognize, so the connection
// collector's flow store needs it required at runtime instead of bundled.
const SERVER_ONLY_EXTERNALS = ['node:sqlite'];

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  basePath: BASE_PATH,
  env: { ...SUPABASE_NEXT_ENV, NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  distDir: '../../../dist/apps/ui/local-services-next/.next',
  agentRules: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals)
          ? config.externals
          : [config.externals].filter(Boolean)),
        (
          /** @type {{ request?: string }} */ { request },
          /** @type {(err?: unknown, result?: string) => void} */ cb,
        ) =>
          request && SERVER_ONLY_EXTERNALS.includes(request)
            ? cb(null, `commonjs ${request}`)
            : cb(),
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
