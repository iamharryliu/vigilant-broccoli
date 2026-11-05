//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');
/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  nx: {},
  env: SUPABASE_NEXT_ENV,
  distDir: '../../../dist/apps/ui/gravity-guy/.next',
  agentRules: false,
};
module.exports = composePlugins(withNx)(nextConfig);
