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
      name: 'vb-manager-local-fastify',
      script: 'main.js',
      cwd: path.join(WORKSPACE_ROOT, 'dist/apps/api/vb-manager-local-fastify'),
      exec_mode: 'fork',
      interpreter: NODE_INTERPRETER,
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
        HOST: '127.0.0.1',
        STATIC_DIR: path.join(WORKSPACE_ROOT, 'dist/vb-manager-local-react'),
        VB_EXPRESS_URL: 'https://staging-vb-express.fly.dev',
        VB_STORAGE_SERVICE_URL: 'https://staging-vb-storage-service.fly.dev',
        EMAIL_SERVICE_URL: 'https://staging-vb-email-service.fly.dev',
        LLM_SERVICE_URL: 'https://staging-vb-llm-service.fly.dev',
        SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
        SUPABASE_PUBLISHABLE_KEY:
          'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
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
