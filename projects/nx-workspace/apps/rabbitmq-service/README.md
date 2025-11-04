# RabbitMQ

```
# Run local docker container.
docker build -t DOCKER_IMAGE_NAME .
docker run -p 15672:15672 -p 5672:5672 DOCKER_IMAGE_NAME

fly launch

# Proxy RabbitMQ server.
fly proxy -a vb-rabbitmq-service 5672
# Proxy RabbitMQ admin portal.
fly proxy -a vb-rabbitmq-service 15672

CONNECTION_STRING="amqp://USERNAME:PASSWORD@APP_NAME.internal:5672"
```
