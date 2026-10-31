# Fly Deployment

How media-service runs on Fly.io and why it differs from the other services.

## Table of Contents

- [Public Access](#public-access)
- [Free Tier](#free-tier)

## Public Access

`hearth` runs on Vercel and posts staged uploads here, and Vercel functions cannot reach Flycast, so the service is public (`<env>-media-service.fly.dev`, `force_https = true`) rather than `privateOnly`. Every `/api/*` route requires `x-api-key: $SHARED_APP_TOKEN` and is rate limited per client IP; `GET /` and `/docs` are open.

## Free Tier

- Fly has no free tier for this org, so the service is billed; staging and production each run one machine with `auto_stop_machines = 'suspend'` and `min_machines_running = 0`, so idle cost is about $0.
- The machine is `shared-cpu-1x` with 1 GB, double the other services: libvips decodes uploads of up to 20 MB (a 48 MP photo is about 190 MB uncompressed), and `hearth` sends up to 20 document files at once, each buffered in memory alongside its decode. 1 GB is within Fly's 2 GB suspend limit.
- A 1 GB `shared-cpu-1x` is about $5.70/mo if always on, billed per second only while the machine is started, so the extra memory costs cents at this traffic.
- Shared IPv4 and Anycast IPv6 are free.
