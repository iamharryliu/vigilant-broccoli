# RabbitMQ

RabbitMQ is an open-source **_message broker_** that enables applications, services, and systems to communicate with each other asynchronously.

- Producer – The component that sends messages.
- Queue – The buffer where messages are stored.
- Consumer – The component that processes messages from the queue.

## Getting Started

```
npm i amqplib
fly proxy -a rabbitmq-deploy 5672
```

- Run a local docker container `docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management`
- Visit `http://localhost:15672/` and use `guest` for username and password.
