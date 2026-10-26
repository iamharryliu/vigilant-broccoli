//@ts-check
const { createHash } = require('crypto');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');
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
const SERVER_ONLY_EXTERNALS = [
  'playwright',
  'playwright-core',
  'chromium-bidi',
  // Newer than the builtin list webpack knows, so it must be marked external.
  'node:sqlite',
];
const LIBS_DIR = join(__dirname, '../../../libs/@vigilant-broccoli');
const LIB_SOURCE_PATTERN = /\.(tsx?|jsx?|html)$/;
// Tailwind scans lib sources by glob, but webpack's cache does not reliably
// notice a lib file being added or edited, so the built CSS misses new classes.
// Keying the cache on each lib source's path, mtime and size busts it exactly
// when a lib changes, and app-only edits keep the warm cache.
/** @type {(dir: string) => string[]} */
const listLibSources = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.name === 'node_modules') return [];
    if (entry.isDirectory()) return listLibSources(path);
    return LIB_SOURCE_PATTERN.test(entry.name) ? [path] : [];
  });
const libSourcesHash = () =>
  createHash('sha1')
    .update(
      listLibSources(LIBS_DIR)
        .sort()
        .map(path => {
          const { mtimeMs, size } = statSync(path);
          return `${path}:${mtimeMs}:${size}`;
        })
        .join('\n'),
    )
    .digest('hex');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { ...options },
  env: SUPABASE_NEXT_ENV,
  distDir: '../../../dist/apps/ui/vb-manager-next/.next',
  agentRules: false,
  serverExternalPackages: ['socket.io-client', 'better-sqlite3'],
  webpack: (config, { isServer }) => {
    if (config.cache && typeof config.cache === 'object') {
      config.cache.version = `${config.cache.version ?? ''}|${libSourcesHash()}`;
    }
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
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
