//@ts-check
const { join } = require('path');
const { composePlugins, withNx } = require('@nx/next');

// The Job Hunt Workflow note the Workflow page renders, so the page and the
// note cannot drift apart.
const NOTES_DIR = join(__dirname, '../../../../../notes');
const WORKFLOW_NOTE = join(NOTES_DIR, 'career/job-hunt-workflow.md');

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
  // Bookmarklets installed before the Job postings rename, and embedding
  // pages' `?path=` links, still open the old path; the query string carries
  // over.
  redirects: async () => [
    { source: '/matches', destination: '/job-postings', permanent: false },
  ],
  outputFileTracingExcludes: {
    '*': ['../../../../../package.json'],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      include: [join(__dirname, 'templates/sample'), WORKFLOW_NOTE],
      type: 'asset/source',
    });
    config.resolve.alias['@notes'] = NOTES_DIR;
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
