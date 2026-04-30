# Packer — vb-vm Image

Builds a custom GCE image for `vb-free-vm` with:

- **Vault** — systemd service, TLS on `:8200`, file storage, UI enabled
- **Docker** — enabled on boot
- **WireGuard** — server on `10.0.1.1/24:51820`, auto-configured on first boot from Secret Manager
- **gcloud CLI** — for Secret Manager access

## Prerequisites

- [Packer](https://www.packer.io/downloads) installed
- `gcloud auth application-default login` completed
- GCP project `vigilant-broccoli` accessible

See [deployment-instructions.md](./deployment-instructions.md) for full deployment steps.

## Makefile targets

```bash
make init           # init Packer plugins
make validate       # validate template
make build          # build VM image
make list-images    # list built images
make prune-images   # keep 3 newest, delete rest
make clean          # remove local artifacts
```
