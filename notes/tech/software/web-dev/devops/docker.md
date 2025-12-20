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
docker-compose -f DOCKER_COMPOSE_FILE up -d # Start
docker-compose -f DOCKER_COMPOSE_FILE logs -f # View logs
docker-compose -f DOCKER_COMPOSE_FILE down # Sop
```
