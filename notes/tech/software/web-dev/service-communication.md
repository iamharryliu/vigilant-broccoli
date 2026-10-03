# Service Communication

## Usage

| Type             | Description                                                                                                         | Usage                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Socket           | Persistent connection for live, push-style communication between client and server.                                 | Data hydration and live notifications or alerts.          |
| Queue (RabbitMQ) | Message broker that holds tasks until a worker processes them asynchronously. Supports rate limits and retry logic. | Background tasks and communication between microservices. |
