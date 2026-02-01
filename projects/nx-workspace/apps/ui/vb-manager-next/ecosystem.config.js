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
        NEXTAUTH_URL: 'http://localhost:1337',
        NEXTAUTH_SECRET: 'your-secret-key-here-change-this-in-production',
        VB_EXPRESS_URL: 'https://vb-express.fly.dev',
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
