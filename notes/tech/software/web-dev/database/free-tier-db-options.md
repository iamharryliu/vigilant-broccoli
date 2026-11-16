# Free-Tier Cloud Database Options

## Table of Contents

- [Comparison](#comparison)
- [References](#references)

## Comparison

Limits as of November 2026; they change often, so verify against each pricing page.

| Service | Type | Free Tier Limit | Over the limit | Gotchas |
| --- | --- | --- | --- | --- |
| Cloudflare D1 | SQLite | 5 GB total storage; 5M rows read/day; 100k rows written/day | Queries error until the daily reset (00:00 UTC) | Reads count rows scanned, so index queries; Workers-centric |
| CockroachDB Basic | Postgres-compatible | $15/month credit: 50M request units + 10 GiB storage | Cluster disabled until the cycle ends unless a limit is raised | Credit applies to pay-as-you-go orgs only; set resource limits after the first free cluster |
| Firestore | Document | 1 GiB storage; 50k reads, 20k writes, 20k deletes/day; 10 GiB egress/month | Operations fail until the daily reset (midnight Pacific) | Free quota covers only the default database per project |
| [MongoDB Atlas](./mongodb.md) | Document | M0: 512 MB storage, shared CPU | Writes blocked at the cap | One free cluster per project; no backups on M0 |
| Neon | Postgres | Per project: 1 GB storage, 100 CU-hours/month; 100 projects, 20 GB across all; 5 GB egress | No overage billing; writes that grow storage fail | Autosuspends after 5 min idle (cold starts); 10 branches/project |
| [Supabase](./supabase.md) | Postgres + backend platform | 2 active projects; 500 MB DB/project; 1 GB files; 5 GB egress/month | Upgrade required | Paused after 7 days inactivity; no backups |
| Turso | SQLite (libSQL) | 100 databases; 5 GB storage; 500M rows read and 10M rows written/month | Upgrade required, no overage charge | Figures vary across secondary sources; confirm on the pricing page |
| Upstash Redis | Key-value | 256 MB data; 500k commands/month; 1 free database | Pay-as-you-go beyond the cap | Cache/queue use, not a primary store |

## References

- [CockroachDB pricing](https://www.cockroachlabs.com/docs/cockroachcloud/learn-about-pricing)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Firestore pricing](https://cloud.google.com/firestore/pricing)
- [Neon free plan limits](https://neon.com/faqs/free-plan-limits-and-quotas)
- [Turso pricing](https://turso.tech/pricing)
- [Upstash Redis pricing](https://upstash.com/pricing/redis)
