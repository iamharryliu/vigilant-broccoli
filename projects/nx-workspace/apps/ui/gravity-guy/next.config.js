//@ts-check
const { composePlugins, withNx } = require('@nx/next');
/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  nx: {},
  distDir: '../../../dist/apps/ui/gravity-guy/.next',
  agentRules: false,
};
module.exports = composePlugins(withNx)(nextConfig);
