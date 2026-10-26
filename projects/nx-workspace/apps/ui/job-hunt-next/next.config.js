//@ts-check
const { join } = require('path');
const { composePlugins, withNx } = require('@nx/next');

// The resume lib's barrel imports the owner's resume.json. The image must not
// ship personal data, so the bundle gets the blank template instead; the app
// reads the user's resume from RESUME_PATH at runtime.
const LIB_RESUME_JSON = join(
  __dirname,
  '../../../libs/@vigilant-broccoli/resume/src/resume.json',
);
const TEMPLATE_RESUME_JSON = join(__dirname, 'templates/resume.json');
// Newer than the builtin list webpack knows, so it must be marked external.
const SERVER_ONLY_EXTERNALS = ['node:sqlite'];

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  distDir: '../../../dist/apps/ui/job-hunt-next/.next',
  agentRules: false,
  output: 'standalone',
  // Tracing follows the lib's source imports and would copy the real
  // resume.json into the standalone output despite the alias.
  outputFileTracingExcludes: {
    '*': ['../../../libs/@vigilant-broccoli/resume/src/resume.json'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      [LIB_RESUME_JSON]: TEMPLATE_RESUME_JSON,
    };
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
