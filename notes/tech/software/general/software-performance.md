# Software Performance

## Table of Contents

- [CPU Bound vs IO Bound](#cpu-bound-vs-io-bound)
- [Synchronous vs Asynchronous](#synchronous-vs-asynchronous)
- [Processes vs Threads](#processes-vs-threads)
- [Concurrency vs Parallelism](#concurrency-vs-parallelism)
- [Eager vs Lazy Loading](#eager-vs-lazy-loading)
- [Horizontal vs Vertical Scaling](#horizontal-vs-vertical-scaling)
- [Cache Layers](#cache-layers)

## CPU Bound vs IO Bound

| Type | Limited by | Typical workloads | Speed it up with | More CPUs |
| :-- | :-- | :-- | :-- | :-- |
| CPU bound | Processor computation speed | Systems, scientific, gaming, ML, encoding, hashing | Faster algorithms, more cores, parallelism | Throughput scales with cores |
| IO bound | Waiting on disk, network, databases or other services | Web and backend apps (APIs, databases, caches), file and network work | Caching, batching, fewer round trips, async or non-blocking I/O | Little gain; the CPU is mostly idle waiting |

## Synchronous vs Asynchronous

Synchronous code waits for each operation to finish before moving on, so the caller is blocked and the flow is easy to follow. Asynchronous code starts an operation and continues, handling the result later through a callback, promise or message, so waiting time is spent on other work.

| Style | Behavior | Use when |
| :-- | :-- | :-- |
| Synchronous | Caller blocks until the result arrives; sequential, simple | The result is needed now, steps depend on each other, work is fast |
| Asynchronous | Caller continues; result handled later, harder to debug | Slow IO, long or fire-and-forget tasks, spiky load |

## Processes vs Threads

| Type | Memory | Cost | Use when |
| :-- | :-- | :-- | :-- |
| Process | Isolated; talks through IPC or sockets | Heavier to start; a crash stays contained | Isolation or fault tolerance matters, or to bypass a single-thread limit |
| Thread | Shared with the other threads in its process | Lighter to start; needs locks, and a crash can take down the process | Tasks share data and need cheap communication |

## Concurrency vs Parallelism

| Type | Meaning | Use when |
| :-- | :-- | :-- |
| Concurrency | Several tasks make progress by interleaving, even on one core | IO-bound work: handling many requests while others wait |
| Parallelism | Several tasks run at the same instant on multiple cores | CPU-bound work: encoding, hashing, ML, data processing |

## Eager vs Lazy Loading

Eager loading fetches or initializes everything up front, paying the cost once and keeping later access fast and predictable. Lazy loading defers the work until first use, which cuts startup time and wasted work but can add latency at the moment of access and hide extra operations. Prefer eager when the data is almost always needed, lazy when it is often unused.

| Style | Frontend | Language | ORM relations |
| :-- | :-- | :-- | :-- |
| Eager | Single bundle with every route; preloaded fonts | Compute values at declaration or startup | `include`, `joinedload`, `JOIN FETCH` to load relations early |
| Lazy | Code splitting (`React.lazy`, `import()`), `loading="lazy"` | Lazy initialization, generators, memoized getters | Relations fetched on property access, which risks [N+1 queries](../web-dev/database/database.md#n1-query-problem) |

## Horizontal vs Vertical Scaling

Vertical scaling (scale up) gives one machine more CPU, memory or disk. Horizontal scaling (scale out) adds more machines and spreads load across them, usually behind a load balancer.

| Style | Use when | Trade-off |
| :-- | :-- | :-- |
| Vertical | Quick fix, stateful or hard-to-split workloads (a primary database), early stage | Hardware ceiling and a single point of failure; simple, but resizing may need a restart |
| Horizontal | Traffic keeps growing, stateless services, high availability needed | Effectively unlimited and survives node loss; needs load balancing, shared state and data partitioning |

## Cache Layers

| Layer | Where it lives | Examples | Where / when to use |
| :-- | :-- | :-- | :-- |
| CPU cache | L1/L2/L3 on the processor | Cache lines, instruction and data caches, TLB | Tight loops over contiguous arrays; keep hot data small and sequential |
| OS page cache | Kernel memory | Filesystem page cache, buffer cache, DNS resolver cache | Repeated file reads such as logs or static assets; free speedup, no code needed |
| Browser cache | Client device | HTTP cache, service worker, `localStorage`, IndexedDB | Fingerprinted JS/CSS bundles, images, and offline-capable apps |
| CDN / edge cache | Points of presence near users | Cloudflare, CloudFront, Fastly | Static sites, media and public API responses served to a global audience |
| Reverse proxy cache | In front of the origin servers | Nginx, Varnish, API gateway caching | Absorbing traffic spikes on anonymous, rarely changing pages |
| Application cache | Inside the app process | In-memory maps, memoization, LRU caches, ORM first-level | Memoizing expensive pure computations or config lookups within one instance |
| Distributed cache | Shared cache servers | Redis, Memcached, Hazelcast | Sessions, rate limits and hot query results shared across many instances |
| Database cache | Database engine memory | Buffer pool, query cache, materialized views, read replica | Repeated heavy aggregations (materialized views) or read-heavy workloads on replicas |
| Build / package cache | Developer machines and CI | Docker layers, npm/pnpm store, Nx cache, Gradle cache | Speeding up CI and local rebuilds when inputs are unchanged |
