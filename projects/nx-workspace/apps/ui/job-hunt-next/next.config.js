//@ts-check
const { join } = require('path');
const { composePlugins, withNx } = require('@nx/next');

// Newer than the builtin list webpack knows, so it must be marked external.
const SERVER_ONLY_EXTERNALS = ['node:sqlite'];

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  env: {
    NEXT_PUBLIC_JOB_HUNT_DEMO:
      process.env.NEXT_PUBLIC_JOB_HUNT_DEMO === 'true' ? 'true' : 'false',
  },
  distDir: '../../../dist/apps/ui/job-hunt-next/.next',
  agentRules: false,
  output: 'standalone',
  outputFileTracingExcludes: {
    '*': ['../../../../../package.json'],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      include: join(__dirname, 'templates/sample'),
      type: 'asset/source',
    });
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
};
module.exports = composePlugins(withNx)(nextConfig);
