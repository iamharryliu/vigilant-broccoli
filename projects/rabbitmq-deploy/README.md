# RabbitMQ

```
# Run local docker container.
docker build -t DOCKER_IMAGE_NAME .
docker run -p 15672:15672 -p 5672:5672 DOCKER_IMAGE_NAME

fly launch

# Proxy RabbitMQ server.
fly proxy -a rabbitmq-deploy 5672
# Proxy RabbitMQ admin portal.
fly proxy -a rabbitmq-deploy 15672
```
