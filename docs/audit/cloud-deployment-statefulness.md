# Audit: Cloud Deployment Statefulness

> Deployed apps/services checked for local-disk or in-process state vs. managed cloud state · refreshed 2026-10-16

| App / service | Host | State kind | Risk |
| --- | --- | --- | --- |
| `vb-express` | Fly (staging + prod) | SQLite auth DB + generated secret on Fly volume `vb_express_data` | High |
| `socket-server-socketio` | OCI VM (Docker) | In-memory Socket.IO rooms, no Redis adapter | High |
| `office-presence-socket-server-demo` | Docker Hub image, no tracked deploy | `state.db` SQLite in container layer, no volume in tracked config | Medium |
| Gitea, Immich, Seafile | OCI / AWS VMs | DBs + files on attached block volumes | Medium |
| Vault | GCP `vb-free-vm` | Self-hosted; storage backend not verified here (KMS auto-unseal) | Medium |
| RabbitMQ, code-server | OCI VMs | Docker volumes on boot disk | Low |
| `vb-manager-next` | GCP `vb-free-vm` (PM2, 1 instance) | Reads host Docker/LAN by design; data in Supabase | Info |
| `bucket-service` | Fly | Module `Map` caches provider clients only | None |

## Evidence

- `vb-express`: `apps/api/vb-express/src/auth.ts` uses `DatabaseSync` at `/data/vb-express.sqlite`; both `fly-configs/*-vb-express.toml` have `[mounts]`. Without `BETTER_AUTH_SECRET`, the secret is also stored on the volume, so volume loss kills all sessions. Capped at one machine.
- `socket-server-socketio`: `src/main.ts:140` uses `io.sockets.adapter.rooms`; runs via `cloud-init-rabbitmq.yaml` with Watchtower, so each image update drops rooms.
- `office-presence-socket-server-demo`: `libs/@vigilant-broccoli/slackbots/src/office-presence-app/utils/db.utils.ts:14` opens `new Database('state.db')`; confirm any untracked mount.
- Block-volume VMs: `oci-gitea.tf`, `aws-immich.tf`, `aws-seafile.tf` (`*_volume` resources); confirm snapshots.
- Vault: `cloudflare-vault.tf` and `main.tf` (`google_kms_crypto_key.vault_unseal`); check its storage backend and backups.
- RabbitMQ/code-server: `rabbitmq_data` and `code_server_config` volumes in `cloud-init-{rabbitmq,code-server}.yaml`; no separate block volume.
- `vb-manager-next`: `ecosystem.config.js:32` `instances: 1`.

## Stateless (no local state)

- Fly: `llm-service`, `email-service`, `email-subscription-service`.
- Static/edge: `cloud-8-skate-angular`, `docs-md`, `journal`, `personal-website-react`, `pages-index`, `component-library`, `nx-cache` Worker (R2).
- Vercel: `hearth`, `findme`, `whiteboard`, `vb-manager-next-mobile`, `small-business-next`, `employee-handler-ui`. The Yjs whiteboard and notepad sync keep the Y.Doc client-side and relay via Supabase Realtime.
- `cloud8skate-sanity` (Sanity).

## Actions

1. Decide whether `vb-express` single-volume auth is acceptable or should move to managed Postgres.
2. Confirm `office-presence-socket-server-demo` persistence and VM/Vault volume backups.
