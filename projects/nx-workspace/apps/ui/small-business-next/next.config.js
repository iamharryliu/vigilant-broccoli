//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const { resolve } = require('node:path');
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
  outputFileTracingRoot: resolve(__dirname, '../../..'),
  nx: { ...options },
  distDir: '../../../dist/apps/ui/small-business-next/.next',
  agentRules: false,
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
