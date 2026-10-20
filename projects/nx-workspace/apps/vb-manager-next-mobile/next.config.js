//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../libs/@vigilant-broccoli/common-node/src/lib/supabase/supabase-next-env.js');
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
  env: SUPABASE_NEXT_ENV,
  distDir: '../../dist/apps/vb-manager-next-mobile/.next',
  agentRules: false,
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
