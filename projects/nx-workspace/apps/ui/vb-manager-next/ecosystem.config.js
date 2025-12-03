const path = require('path');
const dotenv = require('dotenv');

// Load .env.local from the app directory
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = dotenv.config({ path: envPath });

module.exports = {
  apps: [
    {
      name: 'vb-manager-next',
      script: './node_modules/.bin/next',
      args: 'dev --port 1337',
      cwd: './apps/ui/vb-manager-next',
      env: {
        NODE_ENV: 'development',
        PORT: 1337,
        // Merge .env.local variables
        ...(envConfig.parsed || {}),
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      time: true,
      merge_logs: true,
    },
  ],
};
