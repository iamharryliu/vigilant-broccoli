# RabbitMQ Demo

## Setup

```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
npx tsx receive.ts
npx tsx send.ts
```
