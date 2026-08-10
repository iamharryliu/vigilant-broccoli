//@ts-check
const { composePlugins, withNx } = require('@nx/next');
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
// Playwright is a Node-only, server-side dependency of the event scraper.
// serverExternalPackages alone did not stop the webpack build from tracing
// into playwright-core and failing on its optional `chromium-bidi` require, so
// force these to be required at runtime instead of bundled.
const SERVER_ONLY_EXTERNALS = ['playwright', 'playwright-core', 'chromium-bidi'];
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: { ...options },
  distDir: '../../../dist/apps/ui/vb-manager-next/.next',
  serverExternalPackages: ['socket.io-client', 'better-sqlite3'],
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
          request &&
          SERVER_ONLY_EXTERNALS.some(
            pkg => request === pkg || request.startsWith(`${pkg}/`),
          )
            ? cb(null, `commonjs ${request}`)
            : cb(),
      ];
    }
    return config;
  },
};
const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];
module.exports = composePlugins(...plugins)(nextConfig);
