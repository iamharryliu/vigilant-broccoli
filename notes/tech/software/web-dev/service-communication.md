# Service Communication

## Table of Contents

- [Usage](#usage)
- [RPC and Typed API Tools](#rpc-and-typed-api-tools)
- [Terminology](#terminology)

## Usage

| Method | Communication model | Data format | Pros | Cons | Used for |
| --- | --- | --- | --- | --- | --- |
| HTTP | Client sends a request; server returns a response, which can be streamed | Any media type, commonly JSON, HTML, or binary | Broad support and familiar tooling | Live updates need polling or a streaming mechanism such as SSE | Web pages, REST APIs, file transfers, and webhooks |
| Message queues | Producers enqueue messages; consumers process them asynchronously. Acknowledgements and redelivery depend on the broker and configuration. Common protocols include AMQP and MQTT, and Kafka uses its own protocol | Application-defined, such as JSON or binary | Buffers work and supports independent producers and consumers | Adds broker operations, delayed processing, and potentially duplicate deliveries that consumers must handle | Background jobs, buffering work, and decoupling services |
| REST | Client sends stateless HTTP requests to resource URLs, using methods such as GET, POST, PUT, and DELETE | Usually JSON, though any media type works | Works with any HTTP client, is easy to cache, and has widespread tooling such as OpenAPI | No enforced schema, so types and docs can drift, and fixed endpoints can cause over-fetching or many round trips | Public APIs, browser and mobile backends, and webhooks |
| RPC | Client calls a remote function as if it were local, and a generated or shared contract defines the arguments and result. gRPC does this over HTTP/2 with single request/response, client streaming, server streaming, and bidirectional streaming. See [RPC and Typed API Tools](#rpc-and-typed-api-tools) for gRPC, JSON-RPC, tRPC, and ts-rest | Depends on the implementation: gRPC uses binary Protocol Buffers, JSON-RPC and tRPC use JSON | Typed calls with generated or inferred clients, and efficient serialization in gRPC | Requires a shared contract or schema tooling. gRPC browser access typically needs gRPC-Web with an adapter or proxy, and tRPC works only between TypeScript codebases | Typed service-to-service APIs and streaming between services |
| SSE (Server-Sent Events) | Server pushes events to a client through a long-lived HTTP response; browser EventSource supports automatic reconnection | UTF-8 text using the event-stream format; often contains JSON | Simple browser support for server push | Text only and one-way, so clients send data through separate requests | Live notifications, progress updates, and streamed text |
| WebSocket | Persistent connection allowing both client and server to send messages independently | Text or binary messages | Supports two-way live communication | Applications must manage reconnection and any replay of missed messages | Chat, multiplayer games, and interactive live updates |

## RPC and Typed API Tools

| Tool | Style | Transport and format | Pros | Cons | Fits when |
| --- | --- | --- | --- | --- | --- |
| gRPC | RPC with a Protocol Buffers contract and generated clients | HTTP/2, binary | Efficient, supports streaming, works across languages | Needs codegen, and browsers need gRPC-Web or a proxy | Polyglot or high-volume service-to-service calls |
| JSON-RPC | RPC with a minimal spec of method name, params, and id | Any transport, JSON | Very simple, transport-agnostic, easy to implement anywhere | No built-in schema or codegen, and the spec does not cover streaming | Small protocols and tool or editor integrations |
| tRPC | RPC with types inferred from server code | Own HTTP conventions, JSON | No codegen, end-to-end types | TypeScript only, and not a plain REST surface for external callers | Full-stack TypeScript apps where one team owns both ends |
| ts-rest | Contract-first REST with a shared TypeScript contract | Plain HTTP, JSON | Keeps REST semantics, can generate OpenAPI, typed client | TypeScript only, and the contract is a library dependency | TypeScript monorepos where REST consumers must keep working |

## Terminology

| Term | Definition |
| --- | --- |
| AMQP | Advanced Message Queuing Protocol, an open wire protocol for message brokers such as RabbitMQ that covers queues, routing, and acknowledgements. |
| Contract-first | The API shape is defined in a shared schema from which clients and docs derive, as in Protocol Buffers or a ts-rest contract. |
| HTTP relationship | gRPC uses HTTP/2, REST is a style of designing HTTP APIs, and SSE streams events over HTTP. These methods overlap with HTTP rather than being entirely separate alternatives. |
| MQTT | Message Queuing Telemetry Transport, a lightweight publish/subscribe protocol over TCP, designed for constrained devices and unreliable networks such as IoT sensors. Clients publish to topics on a broker, with three delivery guarantees (QoS 0, 1, and 2). |
| Socket | A communication endpoint used by an application to send or receive data, commonly through TCP or UDP. WebSocket is a specific application protocol, not a synonym for socket. |
