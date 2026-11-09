const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const NODE_INTERPRETER =
  process.env.NODE_INTERPRETER || '/opt/homebrew/bin/node';
const PORT = 1340;

const GH_AUTH_ENV_VAR = 'GITHUB_TOKEN';
const scrubbedEnv = { ...process.env };
delete scrubbedEnv[GH_AUTH_ENV_VAR];

module.exports = {
  apps: [
    {
      name: 'music-next',
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
        // Requests arrive through local-manager-next's rewrite, so
        // request.nextUrl.origin is this bind address (127.0.0.1:1340), not
        // the manager's public origin Spotify has registered as the redirect
        // URI and the post-callback redirect must land on.
        SPOTIFY_REDIRECT_BASE_URL: 'https://manager.vigilant-broccoli.app',
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
