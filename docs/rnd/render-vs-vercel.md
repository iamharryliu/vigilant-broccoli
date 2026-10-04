# R&D: Render vs Vercel

> Should we migrate Next.js apps from Vercel to Render? · 2026-10-04

## Context

The repo currently deploys five Next.js apps to Vercel (`hearth`, `findme`, `whiteboard`, `vb-manager-next-mobile`, `employee-handler-ui`) using the Hobby plan. Vercel's free tier restricts use to non-commercial projects and serializes builds (1 concurrent deployment), mitigated by prebuilt deploys on CI (see `scripts/deploy-vercel.ts` and [vercel-deploy-pattern.md](../app-development/ui/deployment/vercel-deploy-pattern.md)). Render is a simpler alternative that may reduce operational overhead or unlock commercial use without upgrading.

## Alternatives

| Option | Pros | Cons | Cost | Security | Scalability |
| ------ | ---- | ---- | ---- | -------- | ----------- |
| **A — Vercel (current)** | Built for Next.js; optimized build pipeline; Supabase OIDC integration; strong free tier limits (100 deploys/day, 1M requests/mo); Edge Functions; built-in preview deployments | Non-commercial only on Hobby; 1 concurrent build serializes Multi-app deploys; standalone output breaks Nx cache; `.vercel` directory gotchas; upgrade to Pro ($20/mo/seat) for commercial; hitting limits pauses projects 30 days | Free (Hobby); Pro $20/mo/seat | OIDC tokens stored locally; sensitive env vars not fetchable via API; `.vercel/.env.*.local` contains live tokens (requires gitignore) | Limited on Hobby (pauses on overage); scales via Pro but capped per plan tier |
| **B — Render** | Free tier for all use cases (commercial included); simpler git-based deployment; automatic SSL; built-in observability; no concurrent-build limits on free tier; gradual overage billing (no hard pause) | No Next.js-specific optimizations; no prebuilt deploy (Render always builds); preview deployments not automatic; smaller ecosystem; less mature Next.js support; API Functions different model than Vercel Edge | Free tier (no cap); Pro $7/mo for static + $7/mo for services | Environment secrets stored in web console; no OIDC; simpler threat model (fewer tokens in CI) | Scales smoothly via usage-based billing; no overage pause |

## Recommendation

Stay with Vercel for now. The prebuilt-deploy pattern works well and the Hobby plan's limits are adequate for current scale — the non-commercial restriction is the only pain point, and it's easily resolved by upgrading to Pro ($20/mo) if/when revenue materializes. Render's simpler model appeals only if (1) commercial use becomes urgent before affordability and (2) rebuilding the CI deploy pipeline is acceptable. The cost delta ($20/mo vs free) is small enough to pay for the architectural fit (fewer `.vercel` gotchas, standby-time-zero staging builds for preview, Supabase OIDC). Render is a valid fallback if Vercel's concurrency limits start hurting CI throughput or if a provider change becomes necessary for other reasons.

## Sample Implementation

No changes needed. If commercial use is required now, upgrade the five Vercel projects to Pro via `vercel billing --set-default-plan pro` (or via the Vercel dashboard), which adds usage-based overage billing while keeping the same deploy pipeline (`scripts/deploy-vercel.ts` and the `deploy` / `deploy:production` targets in each app's `project.json`). No CI changes.

If a future Render migration is chosen, migrate incrementally: pick one staging app (e.g. `staging-findme`), move it to Render, run `test-e2e-*` against it for a week, then move production if stable. Add a `deploy:render` target to that app's `project.json` alongside the existing Vercel targets, commit `.render` to a `.gitignore`, and delete the Render app when done.
