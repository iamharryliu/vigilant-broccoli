# Software Architecture

| Architecture | Description | Used in | Pros | Cons |
| :-- | :-- | :-- | :-- | :-- |
| Component | Structures software into reusable components | Angular, React |  |  |
| Distributed System | Independent nodes that coordinate over a network and appear as one system | Kafka, Kubernetes | Scales horizontally; no single point of failure | Network failures, partial failure and consistency trade-offs (CAP theorem) |
| [Event-Driven Architecture](./cqrs-and-event-driven-architecture.md) (including CQRS) | Reacts to events asynchronously | Kafka, RabbitMQ |  |  |
| Layered | Organizes code into layers (e.g., presentation, business, data) | Spring, .NET |  |  |
| Microservices | Builds systems as tiny remote services that run independently of each other | Netflix, Kubernetes | Teams can work on independent services without affecting each other | Services that depend on other services require code changes on both services |
| Monolith | A single unified codebase | Traditional Django, Rails |  |  |
