const path = require('path');
const dotenv = require('dotenv');

// Load .env.local from the app directory
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = dotenv.config({ path: envPath });

module.exports = {
  apps: [
    {
      name: 'vb-manager-next',
      script: 'npm',
      args: 'start',
      cwd: './dist/apps/ui/vb-manager-next',
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
        // Merge .env.local variables
        ...(envConfig.parsed || {}),
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './apps/ui/vb-manager-next/logs/vb-manager-next-error.log',
      out_file: './apps/ui/vb-manager-next/logs/vb-manager-next-out.log',
      log_file: './apps/ui/vb-manager-next/logs/vb-manager-next-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
