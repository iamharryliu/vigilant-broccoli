//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  outputFileTracingRoot: path.join(__dirname, '../..'),
  outputFileTracingIncludes: {
    '/api/where-is': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
  },
  transpilePackages: [
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
  ],
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
