# pm2

```
npm install -g pm2

pm2 start app.js # Start a file with default settings
pm2 start app.js --watch # Start and watch for file changes

pm2 start "npm run start" --name APP_NAME
pm2 start "npm run start" --name APP_NAME --cwd [dist]
pm2 start FILENAME.ts --interpreter npx --interpreter-args "tsx" --name APP_NAME
pm2 start ecosystem.config.js


pm2 list

pm2 save
pm2 startup launchd
pm2 unstartup launchd

pm2 reload APP_NAME
pm2 reload all
pm2 restart APP_NAME
pm2 restart all
pm2 stop APP_NAME
pm2 stop all

pm2 delete APP_ NAME
pm2 delete all
pm2 kill


# Debug
pm2 monit
pm2 show
pm2 show APP_NAME
pm2 logs
pm2 logs --lines 100
pm2 logs APP_NAME
pm2 flush
```
