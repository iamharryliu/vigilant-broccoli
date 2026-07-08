# Home Lab

Dormant Caddy + tailnet path-routing scaffold for self-hosting services. Currently has no backends — add one under "Adding a service".

## Tailnet access

`npm run homelab:up` chains `tailscale serve --tcp=80 tcp://127.0.0.1:22100`.

**Why `--tcp=80` not `--http=80`:** HTTP mode virtual-hosts by `Host:` header and returns 404 when the header doesn't match exactly (raw-IP requests, iOS Safari quirks). TCP mode is pure byte forwarding and sidesteps the issue entirely.

**Port 80 conflicts with `infrastructure/local`'s nginx.** Bring local down first, or move Serve to another port.

## Adding a service

Add the service to `docker-compose.yml` and route it in the `Caddyfile`. Backends don't need a `ports:` block — Caddy reaches them by Docker service name. If the service generates its own URLs, set its base-path / root-URL config so it knows it's mounted at `/<name>/`.
