# Cache

## Table of Contents

- [Cache Layers](#cache-layers)

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
