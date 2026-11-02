const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const NODE_INTERPRETER =
  process.env.NODE_INTERPRETER || '/opt/homebrew/bin/node';
const PORT = 1338;

const GH_AUTH_ENV_VAR = 'GITHUB_TOKEN';
const scrubbedEnv = { ...process.env };
delete scrubbedEnv[GH_AUTH_ENV_VAR];

module.exports = {
  apps: [
    {
      name: 'cloud-services-next',
      script: path.join(WORKSPACE_ROOT, 'node_modules/next/dist/bin/next'),
      args: `start --port ${PORT} --hostname 127.0.0.1`,
      // Not dist/: `next start` there skips next.config.js and the basePath
      // root page 404s (the /api routes still answer).
      cwd: __dirname,
      exec_mode: 'fork',
      interpreter: NODE_INTERPRETER,
      env: {
        NODE_ENV: 'production',
        PORT,
        ...scrubbedEnv,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
