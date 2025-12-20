# Docker

```
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

# Docker Compose

```
docker compose DOCKER_COMMAND
docker compose up -d # Start
docker compose logs -f # View logs
docker compose down # Stop

docker compose -p APP_NAME DOCKER_COMMAND
docker compose -p APP_NAME -f DOCKER_COMPOSE_FILE DOCKER_COMMAND
```
