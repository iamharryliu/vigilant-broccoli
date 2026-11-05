# Render

## Table of Contents

- [Free Tier](#free-tier)
- [References](#references)

Docker/native runtime PaaS with managed Postgres/Redis add-ons — deploy a web service, static site, and DB without touching Terraform or a Dockerfile.

## Free Tier

No credit card required.

| Resource | Free Tier Limit | Notes |
| --- | --- | --- |
| PostgreSQL | 1GB storage, 1 free DB per workspace | Expires 30 days after creation, then a 14-day grace period before deletion |
| Static sites | Unlimited, free | Includes CDN + custom domains |
| Web services | 750 shared instance-hours/workspace/calendar month | 512MB RAM / 0.1 CPU; spins down after 15 min idle, cold-starts on next request |

## References

- [Render Pricing](https://render.com/pricing)
