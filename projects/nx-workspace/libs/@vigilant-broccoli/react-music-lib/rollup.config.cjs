const { withNx } = require('@nx/rollup/with-nx');

// These options were migrated by @nx/rollup:convert-to-inferred from project.json
const options = {
  outputPath: '../../../dist/libs/@vigilant-broccoli/react-music-lib',
  tsConfig: './tsconfig.lib.json',
  project: './package.json',
  main: 'libs/@vigilant-broccoli/react-music-lib/src/index.ts',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  compiler: 'swc',
  assets: [
    {
      glob: 'libs/@vigilant-broccoli/react-music-lib/README.md',
      input: '.',
      output: '.',
    },
  ],
};

let config = withNx(options, {
  // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
  // e.g.
  // output: { sourcemap: true },
});

config = require('@nx/react/plugins/bundle-rollup')(config, options);

module.exports = config;
