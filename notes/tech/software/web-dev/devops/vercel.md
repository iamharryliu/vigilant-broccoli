# Vercel

## Free Tier

Hobby plan — free, but restricted to non-commercial personal use (any deployment tied to financial gain for anyone involved requires Pro/Enterprise). Limits reset monthly; hitting one pauses the project rather than billing overage, and in most cases you wait ~30 days before the feature works again.

- Fast Data Transfer (bandwidth): up to 100 GB/mo.
- Fast Origin Transfer: up to 10 GB/mo.
- Edge Requests: up to 1,000,000/mo.
- Function Invocations: up to 1,000,000/mo.
- Active CPU: up to 4 CPU-hrs/mo.
- Provisioned Memory: up to 360 GB-hrs/mo.
- Function max duration: 300s (5 min).
- Build machine: 2 vCPUs, 8GB memory, 32GB disk.
- Projects: up to 200. Domains per project: up to 50. Deployments per day: up to 100.
- Runtime logs retained: 1 hour.
- Image transformations: 5,000/mo; image cache reads 300K/mo; image cache writes 100K/mo.

Pro is $20/developer-seat/month with usage-based overage on most of the above instead of a hard pause.

## References

- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [vercel-deploy-pattern.md](../../../../../docs/ui/deployment/vercel-deploy-pattern.md) — how this repo deploys Next.js apps to Vercel
