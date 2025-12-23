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
        ...process.env,
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
