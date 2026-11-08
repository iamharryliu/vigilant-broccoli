//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');

// local-manager-next rewrites this prefix to this app and embeds it in an
// iframe on /music; basePath also moves /_next assets under it, so the two
// apps' bundles never collide on the shared origin.
const BASE_PATH = '/music/app';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  basePath: BASE_PATH,
  env: { ...SUPABASE_NEXT_ENV, NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  distDir: '../../../dist/apps/ui/music-next/.next',
  agentRules: false,
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
