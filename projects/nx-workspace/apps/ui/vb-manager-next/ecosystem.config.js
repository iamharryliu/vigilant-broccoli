module.exports = {
  apps: [
    {
      name: 'vb-manager-next',
      script: './node_modules/.bin/next',
      args: 'start --port 1337',
      cwd: './dist/apps/ui/vb-manager-next',
      env: {
        NODE_ENV: 'production',
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
