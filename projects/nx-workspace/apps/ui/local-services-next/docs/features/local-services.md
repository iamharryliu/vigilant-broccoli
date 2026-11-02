# Local Services

- The Dev Dashboard's Local Service tab in `local-manager-next` is an iframe of this app at `/dev-dashboard/local`. `local-manager-next` rewrites that prefix to this app's PM2 process on `127.0.0.1:1339` (`LOCAL_SERVICES_ORIGIN` overrides the target); the app's `basePath` is the same prefix, so its `_next` assets and `/api` routes live under it and never collide with the manager's.
- The page shows public/local IP with disk and speed test, WireGuard, Tailscale machines, listening local services, Local Credentials, Docker containers and PM2 processes. Each card's API route runs the host's CLI as before the split; only the process moved.
- Every `/api` route requires a Supabase bearer token (`src/proxy.ts`). The session comes from `local-manager-next`'s sign-in through the shared origin's `localStorage`.
- The frame is same-origin only: `next.config.js` sends `Content-Security-Policy: frame-ancestors 'self'`.
- `local-manager-next` keeps its own `LocalServicesComponent` and `/api/local-services` route for the Network Tools tab; this app carries a copy for its Local Services card.
- Deploy with `pnpm deploy:local` (pull, then `startOrReload` of both zone apps, then reload of the manager). `pnpm local-services-next:logs` tails its PM2 logs.

## Local Credentials

- The Local Credentials card copies the local k3s cluster's Grafana admin password and a 24-hour Headlamp login token, the same values as `pnpm local:k3s:grafana:password` and `pnpm local:k3s:headlamp:token`.
- Each copy calls `GET /api/local-credentials?service=<grafana|headlamp>`, which runs `kubectl --context k3d-vb-local` on the host; the value is fetched on click, never polled or rendered.
- The service is matched against `LOCAL_CREDENTIAL_SERVICE` in `src/app/constants/local-credentials.ts`; add a service there and in the route's `READ_CREDENTIAL` map.
- `kubectl` must be on PM2's `PATH` (Docker Desktop's `/usr/local/bin/kubectl` is) and `~/.kube/config` must hold the `k3d-vb-local` context, which `pnpm local:k3s:up` writes.
