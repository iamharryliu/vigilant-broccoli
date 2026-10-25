# Software Performance

## Table of Contents

- [CPU Bound vs IO Bound](#cpu-bound-vs-io-bound)

## CPU Bound vs IO Bound

| Aspect | CPU Bound | IO Bound |
| :-- | :-- | :-- |
| Limited by | Processor computation speed | Waiting on disk, network, databases or other services |
| Typical workloads | Systems, scientific, gaming, ML, encoding, hashing | Web and backend apps (APIs, databases, caches), file and network work |
| Speed it up with | Faster algorithms, more cores, parallelism | Caching, batching, fewer round trips, async or non-blocking I/O |
| Effect of more CPUs | Throughput scales with cores | Little gain; the CPU is mostly idle waiting |
