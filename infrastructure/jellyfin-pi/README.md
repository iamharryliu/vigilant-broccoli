# Jellyfin Pi

Ansible provisioning for the homelab Raspberry Pi that runs Jellyfin from Docker Compose.

## Table of Contents

- [Networking](#networking)
- [Layout](#layout)
- [Stack](#stack)

## Networking

- [jellyfin-pi.echidna-rohu.ts.net:8096](http://jellyfin-pi.echidna-rohu.ts.net:8096/) - Jellyfin web UI and client API, reachable from tailnet devices (and on the Pi's LAN address from home)

## Layout

| Path                                   | What                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `ansible.cfg`                          | Inventory path and SSH defaults for every `ansible-*` call in this folder |
| `docker-compose.yml`                   | The Jellyfin stack, copied to `/opt/jellyfin/` on the Pi                  |
| `group_vars/jellyfin_pi.yml`           | Committed non-secret defaults                                             |
| `inventory/*.example.yml`              | Templates for the gitignored, operator-supplied inventory and host vars   |
| `load-tailscale-authkey.sh`            | Vault → `TS_AUTHKEY`, session only                                        |
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
- Secrets
  - HashiCorp Vault
  - Google Secret Manager
