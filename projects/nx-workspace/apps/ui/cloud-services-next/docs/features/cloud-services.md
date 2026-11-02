# Cloud Services

- The Dev Dashboard's Cloud Services tab in `local-manager-next` is an iframe of this app at `/dev-dashboard/cloud`. `local-manager-next` rewrites that prefix to this app's PM2 process on `127.0.0.1:1338`; the app's `basePath` is the same prefix, so its `_next` assets and `/api` routes live under it and never collide with the manager's.
- The page lists gcloud auth and projects, AWS profiles, Terraform workspaces, Fly.io apps, Render services, Vercel projects, Cloudflare Pages and GitHub Pages. Each card's API route runs the host's CLI or provider API as before the split; only the process moved.
- Every `/api` route requires a Supabase bearer token (`src/proxy.ts`). The session comes from `local-manager-next`'s sign-in through the shared origin's `localStorage`.
- The frame is same-origin only: `next.config.js` sends `Content-Security-Policy: frame-ancestors 'self'`.
- Deploy with `pnpm deploy:local` (pull, then `startOrReload` of this app, then reload of the manager). `pnpm cloud-services-next:logs` tails its PM2 logs.

## Render Services

- The card lists Render services alphabetically, with service type, suspension status, and links to the service dashboard and public app URL when available. Not suspended does not imply a healthy deployment or an awake free instance.
- `GET /api/render/services` uses a server-only `RENDER_API_KEY` injected from Vault by `.env.local.example`. It follows the [Render service API](https://api-docs.render.com/reference/list-services) cursor pagination and returns only display fields.
- The card refreshes every minute while visible, with loading, empty and error states. Provider failures do not appear as an empty account.

## Free Tier

- The Render card creates no Render resources and polls the management API rather than the service URL. Render free web services share 750 instance-hours per workspace per calendar month and spin down after 15 minutes without inbound traffic ([Render free instance limits](https://render.com/docs/free)).
