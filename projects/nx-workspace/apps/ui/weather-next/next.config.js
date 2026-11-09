//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const LOCAL_MANAGER = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/local-manager-origins.json');
const MOBILE_MANAGER = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/mobile-manager-origins.json');
// Only weather-next itself, local-manager-next and mobile-manager-next (their
// deployed hosts and local dev ports) may frame the card; every other site is
// refused. Standalone visits are unaffected because frame-ancestors only
// applies when framed.
const CONTENT_SECURITY_POLICY = `frame-ancestors 'self' ${[
  LOCAL_MANAGER.url,
  ...LOCAL_MANAGER.loopbackOrigins,
  ...MOBILE_MANAGER.origins,
].join(' ')}`;
const configValues = {
  default: {},
  development: {},
};
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';
const options = {
  ...configValues.default,
  // @ts-expect-error: Ignore TypeScript error for indexing configValues with a dynamic key
  ...configValues[configuration],
};
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { ...options },
  distDir: '../../../dist/apps/ui/weather-next/.next',
  agentRules: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
        ],
      },
    ];
  },
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
