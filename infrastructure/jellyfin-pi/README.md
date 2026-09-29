# Jellyfin Pi

Ansible provisioning for the homelab Raspberry Pi that runs Jellyfin from Docker Compose.

## Table of Contents

- [Networking](#networking)
- [Layout](#layout)
- [Stack](#stack)

## Networking

- [jellyfin-pi.echidna-rohu.ts.net:8096](http://jellyfin-pi.echidna-rohu.ts.net:8096/) - Jellyfin web UI and client API, reachable from tailnet devices (and on the Pi's LAN address from home)
- `smb://jellyfin@jellyfin-pi/media` - writable SMB share of the media library at `/srv/media/library`, same LAN + tailnet reach (`pnpm jellyfin:media`)

## Layout

| Path                                   | What                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `ansible.cfg`                          | Inventory path and SSH defaults for every `ansible-*` call in this folder |
| `docker-compose.yml`                   | The Jellyfin stack, copied to `/opt/jellyfin/` on the Pi                  |
| `group_vars/jellyfin_pi.yml`           | Committed non-secret defaults                                             |
| `inventory/*.example.yml`              | Templates for the gitignored, operator-supplied inventory and host vars   |
| `jellyfin-scan.sh`                     | Trigger a library scan over the API (`pnpm jellyfin:scan`)                |
| `load-tailscale-authkey.sh`            | Vault → `TS_AUTHKEY`, session only                                        |
| `load-vault-secret.sh`                 | Prints one Vault secret to stdout; used for the SMB password and API key  |
| `pi-ssh.sh`                            | SSH using the inventory's address (`pnpm jellyfin:ssh`)                   |
| `playbook.yml`, `tasks/`, `templates/` | The provisioning run itself                                               |
| `provision.sh`                         | Entry point (`pnpm jellyfin:provision`)                                   |

Prerequisites, every variable and secret, the from-scratch sequence, and
re-provisioning onto a replacement Pi:
[docs/infrastructure/jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md).

## Stack

- Language
  - YAML
  - Bash
- Tooling
  - Ansible
  - Docker
  - Docker Compose
- Cloud providers
  - Tailscale
- Services
  - Jellyfin
  - Samba
- Secrets
  - HashiCorp Vault
  - Google Secret Manager
