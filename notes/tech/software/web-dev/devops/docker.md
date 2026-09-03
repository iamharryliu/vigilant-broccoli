# Docker

## Free Tier

Docker Hub, personal (free) account — hosts `iamharryliu/vb-code-server`, built by
`deploy-code-server-image`:

| Resource             | Free allowance            |
| -------------------- | ------------------------- |
| Public repositories  | Unlimited                 |
| Private repositories | 1                         |
| Authenticated pulls  | 200 per 6 hours           |
| Anonymous pulls      | 100 per 6 hours, per IPv4 |

The code-server VM pulls without logging in, so it spends the anonymous
allowance — fine for an image fetched once per VM recreate, but it means the
Docker Hub repo has to stay **public** or cloud-init can't pull it.

```
sudo systemctl start docker         # Start Docker daemon
sudo systemctl status docker        # Show Docker service status (running/stopped, logs, uptime, errors)
sudo systemctl stop docker          # Stop Docker daemon (all containers stop)
sudo systemctl restart pm2-root     # Restart PM2 running under root (reloads managed processes/services)
sudo systemctl enable docker        # Enable Docker to auto-start on boot

sudo systemctl stop USERNAME        # Stop PM2 systemd service for a specific user (kills managed Node processes)
sudo systemctl start USERNAME       # Start PM2 systemd service for that user (restores saved processes)

docker ps # View running containers
docker pull IMAGE_NAME
docker run IMAGE_NAME
docker build

docker start CONTAINER_NAME
docker stop CONTAINER_NAME
docker rm CONTAINER_NAME
docker rmi IMAGE_NAME:latest

# Run with environment variables.
docker run -e ENV="ENV" IMAGE_NAME:latest

# Debugging
docker logs CONTAINER_NAME
docker logs -f CONTAINER_NAME  # Follow logs
docker run -it --rm IMAGE_NAME sh # Container shell.
```

## Docker Compose

```
docker compose DOCKER_COMMAND

docker compose up
docker compose up -d # Start
docker compose logs -f # View logs
docker compose down # Stop

docker compose -p APP_NAME DOCKER_COMMAND
docker compose -p APP_NAME -f DOCKER_COMPOSE_FILE DOCKER_COMMAND

# Restart
docker compose up -d --force-recreate APP_NAME

# Debug
docker compose logs -f APP_NAME
```
