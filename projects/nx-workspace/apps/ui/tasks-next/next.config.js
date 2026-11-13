//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const SUPABASE_NEXT_ENV = require('../../../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-next-env.js');

// No frame-ancestors or X-Frame-Options: any site may embed /embed.
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  env: SUPABASE_NEXT_ENV,
  distDir: '../../../dist/apps/ui/tasks-next/.next',
  agentRules: false,
};
const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
