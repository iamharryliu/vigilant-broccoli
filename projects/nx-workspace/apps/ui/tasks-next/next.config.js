//@ts-check
const { composePlugins, withNx } = require('@nx/next');

// No `env` or headers(): both are fixed at build time, so the Supabase project
// and the Content-Security-Policy come from the runtime environment instead
// (libs/runtime-config.ts, src/proxy.ts).
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  distDir: '../../../dist/apps/ui/tasks-next/.next',
  agentRules: false,
  output: 'standalone',
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
