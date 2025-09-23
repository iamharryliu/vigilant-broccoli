# pm2

```
npm install -g pm2

pm2 start "npm run start" --name APP_NAME
pm2 start "npm run start" --name APP_NAME --cwd [dist]
pm2 start FILENAME.ts --interpreter npx --interpreter-args "tsx" --name APP_NAME

pm2 list

pm2 save
pm2 startup launchd
pm2 unstartup launchd

pm2 stop APP_NAME
pm2 delete APP_ NAME

pm2 kill

pm2 restart APP_NAME
pm2 restart all
```
