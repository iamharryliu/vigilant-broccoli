# Service Communication

## Table of Contents

- [Usage](#usage)
- [Terminology](#terminology)

## Usage

| Method                   | Communication model                                                                                                                         | Data format                                                   | Pros                                                          | Cons                                                                                                        | Used for                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| gRPC                     | Client calls a server method over HTTP/2; supports single request/response, client streaming, server streaming, and bidirectional streaming | Usually binary Protocol Buffers with a defined schema         | Efficient serialization and generated clients                 | Requires schema tooling, and browser access typically uses gRPC-Web with an adapter or proxy                | Typed service-to-service APIs and streaming between services |
| HTTP                     | Client sends a request; server returns a response, which can be streamed                                                                    | Any media type, commonly JSON, HTML, or binary                | Broad support and familiar tooling                            | Live updates need polling or a streaming mechanism such as SSE                                              | Web pages, REST APIs, file transfers, and webhooks           |
| Message queues           | Producers enqueue messages; consumers process them asynchronously. Acknowledgements and redelivery depend on the broker and configuration   | Application-defined, such as JSON or binary                   | Buffers work and supports independent producers and consumers | Adds broker operations, delayed processing, and potentially duplicate deliveries that consumers must handle | Background jobs, buffering work, and decoupling services     |
| SSE (Server-Sent Events) | Server pushes events to a client through a long-lived HTTP response; browser EventSource supports automatic reconnection                    | UTF-8 text using the event-stream format; often contains JSON | Simple browser support for server push                        | Text only and one-way, so clients send data through separate requests                                       | Live notifications, progress updates, and streamed text      |
| WebSocket                | Persistent connection allowing both client and server to send messages independently                                                        | Text or binary messages                                       | Supports two-way live communication                           | Applications must manage reconnection and any replay of missed messages                                     | Chat, multiplayer games, and interactive live updates        |

## Terminology

| Term              | Definition                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP relationship | gRPC uses HTTP/2, and SSE streams events over HTTP. These methods overlap with HTTP rather than being entirely separate alternatives.                                         |
| Socket            | A communication endpoint used by an application to send or receive data, commonly through TCP or UDP. WebSocket is a specific application protocol, not a synonym for socket. |
