# CQRS and Event-Driven Architecture

## Table of Contents

- [Event-Driven Architecture](#event-driven-architecture)
  - [Building Blocks](#building-blocks)
  - [Delivery Guarantees](#delivery-guarantees)
- [CQRS](#cqrs)
  - [Commands and Queries](#commands-and-queries)
  - [Relationship to Event Sourcing](#relationship-to-event-sourcing)
  - [When to Use](#when-to-use)
- [Write and Read Database Implementation](#write-and-read-database-implementation)
  - [Write Side](#write-side)
  - [Read Side](#read-side)
  - [Data Flow](#data-flow)
  - [Handling Eventual Consistency](#handling-eventual-consistency)
- [Synchronization Strategies](#synchronization-strategies)

## Event-Driven Architecture

Components communicate by publishing **events** (facts that already happened, named in the past tense such as `OrderPlaced`) instead of calling each other directly. Producers do not know who consumes an event, so consumers can be added, removed or replayed without changing the producer.

### Building Blocks

- **Event** – Immutable record of something that happened, carrying an id, timestamp, type and payload.
- **Producer** – Emits events after a state change.
- **Broker / event log** – Transports and stores events; Kafka and Pulsar keep a replayable log, RabbitMQ and SQS are queues that delete messages once consumed.
- **Consumer** – Reacts to events by updating its own state, calling other systems or emitting further events.
- **Topic / queue** – Named channel; a queue delivers each message to one consumer, a topic fans out to every subscriber group.

### Delivery Guarantees

- **At-most-once** – Messages may be lost, never duplicated.
- **At-least-once** – Messages are never lost but may be redelivered, so consumers must be idempotent (dedupe by event id or make updates naturally repeatable). This is the common default.
- **Exactly-once** – Only achievable as an effect, via idempotent consumers or transactional read-process-write inside the broker.
- **Ordering** – Usually guaranteed only per partition or key, so route events for one aggregate (e.g. one order id) to the same partition.

## CQRS

Command Query Responsibility Segregation splits the model that **changes** state (commands) from the model that **reads** it (queries). Each side gets its own code path and optionally its own database, so each can be shaped and scaled for its job.

### Commands and Queries

| Aspect | Command (write) | Query (read) |
| :-- | :-- | :-- |
| Intent | Change state (`PlaceOrder`, `CancelSubscription`) | Return data (`GetOrderSummary`, `ListOpenOrders`) |
| Return value | Success/failure or an id, not data | Data, with no side effects |
| Model | Normalized domain model enforcing invariants | Denormalized view shaped for each screen or API |
| Typical store | Relational database or event store | Search index, document store, cache or replica |
| Scaling profile | Lower volume, needs strong consistency | Much higher volume, tolerates slightly stale data |

### Relationship to Event Sourcing

CQRS and event sourcing are independent but often combined. Event sourcing stores state as an append-only sequence of events and rebuilds current state by replaying them; that log is a natural feed for the read-side projections. CQRS works equally well with a plain relational write database that publishes events on change.

### When to Use

- Reads and writes have very different load, shape or scaling needs.
- Screens need joined or aggregated data that is expensive to compute from the normalized write model.
- Multiple read representations are needed (search, reporting, cache) from one source of truth.
- Avoid for simple CRUD: it adds a second model, a synchronization pipeline and eventual consistency for little gain.

## Write and Read Database Implementation

### Write Side

- Holds the source of truth and enforces business rules (aggregates, constraints, optimistic concurrency via a version column).
- A command handler loads the aggregate, validates the command, applies the change and persists it.
- Optimized for consistency and small transactions: normalized tables, few indexes, no reporting queries.
- Every committed change must also produce an event; see the outbox pattern below to do this atomically.

### Read Side

- One or more **projections** (read models) built by consumers of the write-side events.
- Denormalized and pre-joined so a query is a single lookup: no joins or aggregation at request time.
- Free to use a different engine per use case: Postgres read replica or materialized view for reporting, Elasticsearch for search, Redis for hot lookups, a document store for API payloads.
- Disposable: a projection can be dropped and rebuilt by replaying the event log, which also makes adding a new view cheap.
- Projectors must be idempotent and track the last processed event position (offset or sequence number) so replays and redeliveries do not double-apply.

### Data Flow

1. Client sends a command to the write API.
2. The command handler validates it and commits the state change.
3. In the same transaction, an event is written to an **outbox** table (avoids the dual-write problem where the database commit succeeds but the broker publish fails, or the reverse).
4. A relay (poller or change data capture) publishes outbox rows to the broker.
5. Projectors consume the events and update the read databases.
6. Queries hit the read database only.

### Handling Eventual Consistency

- **Read-your-writes** – After a command, return the new version or event position and have the client query with a minimum version, or serve that user's reads from the write side briefly.
- **Optimistic UI** – Show the expected result immediately and reconcile when the read model catches up.
- **Versioned reads** – Read models store the last applied event position so staleness can be measured and alerted on as projection lag.
- **Rebuild path** – Keep a documented way to replay events into a fresh projection and swap it in.

## Synchronization Strategies

| Strategy | How it works | Consistency | Pros | Cons | Examples |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Change data capture (CDC) | Tails the write database's transaction log and streams row changes | Eventual, usually sub-second | No application changes; captures every committed change | Events mirror table schema; needs log access and connector ops | Debezium, AWS DMS, Postgres logical replication |
| Dual write | Application writes to both databases in the same request | Immediate if both succeed | Simple to build | No atomicity: failures leave stores diverged; avoid in production | Hand-written service code |
| Event-sourced projection | Read models are built by replaying the append-only event log | Eventual | Full history, rebuildable views, new projections at any time | Event versioning and replay time grow with the log | EventStore, Axon Framework |
| Materialized view refresh | Database stores a precomputed query result and refreshes it | Stale between refreshes | No extra infrastructure; declarative | Refresh cost grows with data; limited to one database engine | Postgres `REFRESH MATERIALIZED VIEW` |
| Message broker publish | Application publishes domain events and consumers update their stores | Eventual | Decoupled; domain-level events; many consumers | Needs outbox to be reliable; duplicates and ordering to handle | Kafka, RabbitMQ, SNS/SQS |
| Polling / batch ETL | Scheduled job copies rows changed since a watermark | Stale up to the schedule | Easiest to retrofit onto legacy systems | High lag; misses deletes without soft-delete or tombstones | Cron jobs, Airflow, Fivetran |
| Synchronous projection | Read model updates inside the command's transaction | Strong | No lag, no extra pipeline | Couples read and write; slows commands; same database only | Triggers, in-transaction view updates |
| Transactional outbox | Event row is written in the same transaction as the state change, then relayed to the broker | Eventual, reliable delivery | Atomic state and event; fixes dual write | Extra table and relay process; at-least-once delivery | Outbox table plus Debezium or a poller |
