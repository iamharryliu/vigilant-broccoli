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
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { ...options },
  distDir: '../../dist/apps/vb-manager-next-mobile/.next',
  output: 'standalone',
};
const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];
module.exports = composePlugins(...plugins)(nextConfig);
