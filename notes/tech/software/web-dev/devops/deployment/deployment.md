# Deployment

- [PM2](./pm2.md)

```
pm2 list
sudo systemctl stop pm2-USER
sudo systemctl start pm2-USER

sudo systemctl enable caddy
systemctl is-enabled caddy
sudo systemctl status caddy
sudo systemctl restart caddy

docker ps
sudo systemctl stop docker
sudo systemctl start docker

sudo systemctl stop docker
sudo systemctl restart pm2-root

sudo systemctl status docker
??
sudo systemctl enable docker
sudo systemctl start docker

pm2 startup
pm2 save
```
