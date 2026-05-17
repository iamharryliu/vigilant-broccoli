# pm2

```
# SETUP
npm install -g pm2        # installs PM2 globally (Node.js process manager)

pm2 startup               # configures PM2 to auto-start on boot using your OS init system
pm2 unstartup            # removes PM2 auto-start configuration from the system
pm2 startup launchd      # sets up PM2 auto-start on macOS using launchd
pm2 unstartup launchd    # removes PM2 auto-start setup from macOS launchd

pm2 save                  # saves current running processes so they restart after reboot

# CREATE
pm2 start app.js # Start a file with default settings
pm2 start app.js --watch # Start and watch for file changes
pm2 start "npm run start" --name APP_NAME
pm2 start "npm run start" --name APP_NAME --cwd [dist]
pm2 start FILENAME.ts --interpreter npx --interpreter-args "tsx" --name APP_NAME
pm2 start ecosystem.config.js
pm2 save

# READ
pm2 list
pm2 monit
pm2 show
pm2 show APP_NAME

# UPDATE
pm2 reload APP_NAME
pm2 reload all
pm2 restart APP_NAME
pm2 restart all
# While restart kills and boots all application instances simultaneously (causing brief downtime), reload restarts them one by one to ensure at least one instance is always online for zero-downtime updates.

# DELETE
pm2 stop APP_NAME
pm2 stop all
pm2 delete APP_ NAME
pm2 delete all
pm2 kill

# Debug
pm2 logs
pm2 logs APP_NAME
pm2 logs --lines N
pm2 flush
```
