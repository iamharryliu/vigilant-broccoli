# Dev Dashboard

## Local Credentials

- The Local Service tab's Local Credentials card copies the local k3s cluster's Grafana admin password and a 24-hour Headlamp login token, the same values as `pnpm local:k3s:grafana:password` and `pnpm local:k3s:headlamp:token`.
- Each copy calls `GET /api/local-credentials?service=<grafana|headlamp>`, which runs `kubectl --context k3d-vb-local` on the host; the value is fetched on click, never polled or rendered.
- The service is matched against `LOCAL_CREDENTIAL_SERVICE` in `vb-manager-local-common`'s `src/lib/local-credentials.ts`; add a service there and in the API route's `READ_CREDENTIAL` map (`vb-manager-local-fastify` `src/routes/local-credentials/local-credentials.route.ts`).
- `kubectl` must be on PM2's `PATH` (Docker Desktop's `/usr/local/bin/kubectl` is) and `~/.kube/config` must hold the `k3d-vb-local` context, which `pnpm local:k3s:up` writes.
