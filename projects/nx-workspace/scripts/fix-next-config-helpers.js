const fs = require('fs');
const path = require('path');

// Works around an @nx/next build bug: compose-plugins.js requires ./deprecation,
// but Nx only copies files reachable from the app's next.config.js, so
// deprecation.js never lands in dist/.nx-helpers and `next start` crashes.
const HELPERS_DIR = process.argv[2];

const nxNextPkgPath = require.resolve('@nx/next/package.json');
const deprecationPath = path.join(
  path.dirname(nxNextPkgPath),
  'dist/src/utils/deprecation.js',
);

fs.copyFileSync(deprecationPath, path.join(HELPERS_DIR, 'deprecation.js'));
