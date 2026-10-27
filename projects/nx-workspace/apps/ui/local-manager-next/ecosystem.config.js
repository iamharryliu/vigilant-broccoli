const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const NODE_INTERPRETER =
  process.env.NODE_INTERPRETER || '/opt/homebrew/bin/node';

const GH_AUTH_ENV_VAR = 'GITHUB_TOKEN';
const scrubbedEnv = { ...process.env };
delete scrubbedEnv[GH_AUTH_ENV_VAR];

module.exports = {
  apps: [
    {
      name: 'local-manager-next',
      script: path.join(WORKSPACE_ROOT, 'node_modules/next/dist/bin/next'),
      args: 'start --port 1337 --hostname 127.0.0.1',
      cwd: path.join(WORKSPACE_ROOT, 'dist/apps/ui/local-manager-next'),
      exec_mode: 'fork',
      interpreter: NODE_INTERPRETER,
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
        VB_EXPRESS_URL: 'https://api.harryliu.dev',
        // Not derived from request.nextUrl.origin: the reverse proxy fronting
        // this PM2 process doesn't forward a Host header Next can trust, so
        // that resolves to the internal bind address (127.0.0.1:1337)
        // instead. Used to build the Spotify OAuth redirect_uri.
        SPOTIFY_REDIRECT_BASE_URL: 'https://manager.vigilant-broccoli.app',
        ...scrubbedEnv,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
