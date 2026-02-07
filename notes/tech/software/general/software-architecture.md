# Software Architecture

- **Layered** – Organizes code into layers (e.g., presentation, business, data); used in Spring and .NET.
- **Component** – Structures software into reusable components; seen in Angular and React.
- **Event-Driven Architecture** – Reacts to events asynchronously; used in Kafka and RabbitMQ.
  - **CQRS** – Separates read and write operations; seen in EventStore and Axon Framework.
- **Microservices** – Breaking applications into tiny remote services that run independently of each other. Builds systems as independent services; used in Netflix and Kubernetes.
    - Pros: Developers/teams are able to work on independent services without affecting each other.
    - Cons: Services that are dependent on other services require code changes on both services.
- **Monolith** – A single unified codebase; common in traditional Django and Rails apps.

## API Architecture

- **SOAP** – XML-based protocol; used in legacy enterprise systems like Salesforce.
- **REST** – Resource-based with HTTP methods; used in GitHub and Twitter APIs.
- **GraphQL** – Query-based API for flexible data retrieval; used by Facebook and Shopify.
- **gRPC** – High-performance RPC framew ork; used in Kubernetes and TensorFlow.
- **WebSocket** – Bi-directional communication; used in Slack and Discord.
- **WebHook** – Event-driven callbacks; used in Stripe and GitHub.



- Integrated system vs independent systems
