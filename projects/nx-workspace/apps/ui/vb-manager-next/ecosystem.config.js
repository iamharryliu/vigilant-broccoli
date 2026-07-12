const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const NODE_INTERPRETER =
  process.env.NODE_INTERPRETER || '/opt/homebrew/bin/node';

module.exports = {
  apps: [
    {
      name: 'vb-manager-next',
      script: path.join(WORKSPACE_ROOT, 'node_modules/next/dist/bin/next'),
      args: 'start --port 1337 --hostname 127.0.0.1',
      cwd: path.join(WORKSPACE_ROOT, 'dist/apps/ui/vb-manager-next'),
      exec_mode: 'fork',
      interpreter: NODE_INTERPRETER,
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
        NEXTAUTH_URL: 'https://manager.vigilant-broccoli.app',
        NEXTAUTH_SECRET: 'your-secret-key-here-change-this-in-production',
        VB_EXPRESS_URL: 'https://staging-vb-express.fly.dev',
        VB_STORAGE_SERVICE_URL: 'https://staging-vb-storage-service.fly.dev',
        EMAIL_SERVICE_URL: 'https://staging-vb-email-service.fly.dev',
        LLM_SERVICE_URL: 'https://staging-vb-llm-service.fly.dev',
        NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
        ...process.env,
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
