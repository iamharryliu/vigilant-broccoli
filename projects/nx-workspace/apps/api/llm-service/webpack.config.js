const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

const configValues = {
  build: {
    default: {
      target: 'node',
      compiler: 'tsc',
      outputPath: '../../../dist/apps/api/llm-service',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      generatePackageJson: true,
      outputHashing: 'none',
    },
    development: {},
  },
};

const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';

const buildOptions = {
  ...configValues.build.default,
  ...configValues.build[configuration],
};

module.exports = async () => ({
  plugins: [
    new NxAppWebpackPlugin(buildOptions),
    {
      apply: compiler => {
        compiler.options.output = {
          ...compiler.options.output,
          ...(process.env.NODE_ENV !== 'production' && {
            clean: true,
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
          }),
        };
        compiler.options.devtool = 'source-map';
      },
    },
  ],
});
