# Local Services

- The Dev Dashboard's Local Service tab in `local-manager-next` is an iframe of this app at `/dev-dashboard/local`. `local-manager-next` rewrites that prefix to this app's PM2 process on `127.0.0.1:1339` (`LOCAL_SERVICES_ORIGIN` overrides the target); the app's `basePath` is the same prefix, so its `_next` assets and `/api` routes live under it and never collide with the manager's.
- The page shows public/local IP with disk and speed test, WireGuard, Tailscale machines, listening local services, Local Credentials, Docker containers and PM2 processes, followed by the network monitor: Connection Map, LAN devices and outbound connections. Each card's API route runs the host's CLI as before the split; only the process moved.
- Every `/api` route requires a Supabase bearer token (`src/proxy.ts`). The session comes from `local-manager-next`'s sign-in through the shared origin's `localStorage`.
- The frame is same-origin only: `next.config.js` sends `Content-Security-Policy: frame-ancestors 'self'`.
- Deploy with `pnpm deploy:local` (pull, then `startOrReload` of both zone apps, then reload of the manager). `pnpm local-services-next:logs` tails its PM2 logs.

## Local Credentials

- The Local Credentials card copies the local k3s cluster's Grafana admin password and a 24-hour Headlamp login token, the same values as `pnpm local:k3s:grafana:password` and `pnpm local:k3s:headlamp:token`.
- Each copy calls `GET /api/local-credentials?service=<grafana|headlamp>`, which runs `kubectl --context k3d-vb-local` on the host; the value is fetched on click, never polled or rendered.
- The service is matched against `LOCAL_CREDENTIAL_SERVICE` in `src/app/constants/local-credentials.ts`; add a service there and in the route's `READ_CREDENTIAL` map.
- `kubectl` must be on PM2's `PATH` (Docker Desktop's `/usr/local/bin/kubectl` is) and `~/.kube/config` must hold the `k3d-vb-local` context, which `pnpm local:k3s:up` writes.

## Connection Map

- The Connection Map draws great-circle arcs from this machine's public-IP location to every external TCP/UDP peer, coloured by direction, with a filterable flow list beside it. Clicking a flow highlights its arc.
- An always-on collector (`src/app/api/network-monitor/_lib/connection-collector.ts`) samples `lsof` every second from server boot, started by `src/instrumentation.ts` and kept on `globalThis` so instrumentation and routes share one loop. A socket is inbound when its local port is one this host is listening on. Loopback, private, CGNAT and link-local peers are dropped.
- Flows are upserted into SQLite (`node:sqlite`) at `~/.local/share/vigilant-broccoli/network-flows.sqlite` and pruned after 7 days, so history survives PM2 reloads. `GET /api/network-monitor/connection-map?window=15m|1h|24h|7d` reads flows seen in that window (newest 2,000) and marks those open in the latest sample.
- Each sample also reads per-socket cumulative byte counters from `nettop` (`_lib/nettop.ts`), joined to `lsof` sockets by PID, protocol and endpoints. The difference from the previous sample gives each flow's live bytes/s and is added to its `bytes_in`/`bytes_out` totals. The first sample after boot only sets the baseline, and bytes sent between a socket's last sample and its close are not counted, so totals run low.
- Open connections animate dashes along their arc: outward for upload, homeward for download, faster in five tiers from under 1 KB/s to over 1 MB/s. An open but idle connection trickles slowly in the direction it was opened. Arc width scales with the destination's total bytes.
- Connections that open and close within one second can still be missed, and `lsof` runs as the PM2 user, so other users' and root-owned processes' sockets are not visible.
- The basemap is OpenStreetMap's standard tiles, inverted by a CSS filter on Leaflet's tile pane: CARTO's dark basemap now serves "API KEY REQUIRED" placeholder tiles with a 200 status.
- Geolocation is a local lookup against DB-IP Lite City (`_lib/mmdb.ts` is a minimal MaxMind DB reader). The first request downloads the ~60MB gzip into `~/.cache/vigilant-broccoli/dbip-city-lite.mmdb`, refreshed after 35 days. The map lists flows without locations until the download finishes. The ~120MB file is held in memory. DB-IP Lite is CC BY 4.0, so the map keeps the DB-IP attribution.
