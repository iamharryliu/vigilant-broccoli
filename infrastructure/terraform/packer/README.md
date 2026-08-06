# Packer — vb-vm Image

Builds the `vb-free-vm` GCE image (Vault + WireGuard + cloudflared) and manages its lifecycle — secret rotation, Vault init/seal, Gitea backup/restore.

## Table of Contents

- [Stack](#stack)

## Stack

- Language
  - HCL
  - Bash
- Tooling
  - Packer
  - Docker
- Cloud providers
  - Google Cloud
  - Cloudflare
  - Fly.io
  - Twilio
  - Resend
- Services
  - HashiCorp Vault
  - WireGuard
  - cloudflared
  - Gitea
  - RabbitMQ
- Secrets
  - Google Secret Manager
  - HashiCorp Vault
