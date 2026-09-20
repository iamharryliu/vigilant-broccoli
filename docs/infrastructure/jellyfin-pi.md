# Jellyfin Pi

The homelab media server: a Raspberry Pi on the home LAN running Jellyfin in
Docker Compose, provisioned with Ansible from
[infrastructure/jellyfin-pi/](../../infrastructure/jellyfin-pi/).

## Table of Contents

- [Why Ansible and not Terraform](#why-ansible-and-not-terraform)
- [Why Tailscale for remote access](#why-tailscale-for-remote-access)
- [Prerequisites](#prerequisites)
- [On-disk layout](#on-disk-layout)
- [Variables and secrets](#variables-and-secrets)
- [From scratch](#from-scratch)
- [First-boot Jellyfin setup](#first-boot-jellyfin-setup)
- [Operations](#operations)
- [Replacing the Pi with the same media drive](#replacing-the-pi-with-the-same-media-drive)
- [Backups and monitoring](#backups-and-monitoring)

## Why Ansible and not Terraform

The Pi is hardware on the LAN. There is no instance, disk, VPC or DNS record
for a provider to create, so Terraform has nothing to own here — modelling the
Pi as a cloud VM would mean a resource graph that can never be applied.
Everything this box needs is post-boot host configuration, which is Ansible's
job and the direct analogue of the `cloud-init-*.yaml` files the cloud VMs use
(`infrastructure/terraform/cloud-init-immich.yaml` and friends): same shape —
packages, a compose file, a mounted data volume — just pushed over SSH to an
existing host instead of baked into first boot.

The one thing Ansible does that cloud-init does not is converge. cloud-init
runs once per instance and the VMs are cattle (`pnpm immich:replace` rebuilds
the host); the Pi is not, so its provisioning has to be re-runnable. Every task
in the playbook is idempotent, and a second run reports zero changes.

Nothing about this service touches `infrastructure/terraform/`. It gets no
Cloudflare DNS record and no Cloudflare Access application, because it is not
served over the public internet at all (see below).

## Why Tailscale for remote access

The repo already has two remote-access patterns, and both are a poor fit:

- **cloudflared tunnel + Cloudflare Access** (Immich, Grafana, Vault). Access
  gates on a browser login or a service-token header pair. Jellyfin's clients
  are native apps — Android TV, iOS, Kodi — which cannot complete an Access
  login, and streaming video through the Cloudflare proxy is outside what the
  free plan is for. This is the same constraint that already forced
  `loki.harryliu.dev` off Access and onto basic auth
  ([network-management.md](./network-management.md)).
- **WireGuard** (GCP Vault VM). Hand-managed keys and endpoints for one
  point-to-point tunnel; adding every phone, TV and laptop that should reach
  the media server means hand-editing configs on both ends.

Tailscale is already in use in this repo — the tailnet is `echidna-rohu.ts.net`
and `vb-manager-next`'s dev dashboard lists its machines via
`TAILSCALE_API_KEY` — so this adds a node to an existing tailnet rather than a
new vendor. It is WireGuard with the key distribution handled: native clients
see a plain `http://jellyfin-pi.echidna-rohu.ts.net:8096`, nothing is published
to the internet, no ports are forwarded on the home router, and the Pi keeps no
inbound public surface. Free tier (3 users, 100 devices, unmetered
peer-to-peer traffic) is documented in
[tailscale.md](../../notes/tech/software/web-dev/network-security/tailscale.md#free-tier);
one more node costs nothing.

## Prerequisites

Hardware:

- Raspberry Pi 4 or 5 (arm64), 4GB+, on Ethernet. Jellyfin on a Pi is a
  direct-play server: the Pi 5 has no hardware video encoder and the playbook
  deliberately maps no `/dev/dri` device, so anything that needs transcoding is
  CPU-bound. Keep the library in formats the clients play natively.
- A reliable boot device (SD card or, better, USB SSD) for the OS, config and
  cache.
- An external USB drive for the media library, already partitioned and
  formatted (the playbook never formats — see [From scratch](#from-scratch)).
  Self-powered drives are worth it; a bus-powered drive browning out mid-write
  is the most common way this host loses data.

Software:

- **Pi**: Raspberry Pi OS (64-bit), Bookworm or newer, flashed with SSH enabled
  and the operator's public key installed. The playbook asserts
  `os_family=Debian` and `architecture=aarch64` before touching anything.
- **Control node** (the laptop): `ansible` (in [setup/mac/Brewfile](../../setup/mac/Brewfile),
  or `pipx install ansible-core`), `jq`, and `gcloud` logged in for the Vault
  fetch. Collections come from `requirements.yml`, installed by `provision.sh`
  on every run.

## On-disk layout

Nothing below lives in Git. Media files and Jellyfin's runtime state are
gitignored in [infrastructure/jellyfin-pi/.gitignore](../../infrastructure/jellyfin-pi/.gitignore);
the repo carries only the playbook, the compose file and the `.example`
inventory.

| Path on the Pi                     | Storage         | Contents                                                                 |
| ---------------------------------- | --------------- | ------------------------------------------------------------------------ |
| `/opt/jellyfin/docker-compose.yml` | Internal (boot) | Copy of the repo's compose file                                          |
| `/opt/jellyfin/.env`               | Internal (boot) | Rendered from `templates/jellyfin.env.j2` — uids, paths, timezone, URL   |
| `/opt/jellyfin/config`             | Internal (boot) | Jellyfin config, users, library database, metadata (container `/config`) |
| `/var/cache/jellyfin`              | Internal (boot) | Transcode and image cache (container `/cache`) — disposable              |
| `/mnt/media`                       | External USB    | Mount point for the media drive, in `/etc/fstab` by UUID                 |
| `/mnt/media/library`               | External USB    | The media library, bind-mounted read-only into the container at `/media` |

Config and cache stay on internal storage on purpose: they are small, they are
rebuildable from the library, and keeping them off the external drive means the
drive carries media and nothing else — so it can move to a replacement Pi
without dragging a stale server identity with it.

The media bind mount is declared with `create_host_path: false`. If the
external drive is not mounted, Docker would otherwise create an empty
`/mnt/media/library` on the boot device and Jellyfin would come up with an
empty library that looks exactly like data loss. Instead the container refuses
to start, and `jellyfin-compose.service`'s `RequiresMountsFor=/mnt/media` keeps
systemd from even trying. The fstab entry carries `nofail`, so a missing drive
costs you Jellyfin, not the ability to SSH in and fix it.

## Variables and secrets

Committed defaults live in
[group_vars/jellyfin_pi.yml](../../infrastructure/jellyfin-pi/group_vars/jellyfin_pi.yml);
everything host-specific is operator-supplied and gitignored.

| Value                                  | Where it goes                            | Notes                                                                                       |
| -------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ansible_host`, `ansible_user`         | `inventory/hosts.yml`                    | The Pi's LAN address (or MagicDNS name after enrolment) and the admin account from flashing |
| `media_drive_uuid`                     | `inventory/host_vars/<host>.yml`         | `lsblk -f` on the Pi. Required — preflight fails without it                                 |
| `media_fs_type`                        | `inventory/host_vars/<host>.yml`         | Must match the drive's existing filesystem; defaults to `ext4`                              |
| `ssh_authorized_keys`                  | `inventory/host_vars/<host>.yml`         | Required — the same run disables password authentication                                    |
| `pi_timezone`                          | `inventory/host_vars/<host>.yml`         | Also becomes the container's `TZ`, which is what Jellyfin schedules tasks against           |
| `jellyfin_uid` / `jellyfin_gid`        | `group_vars/jellyfin_pi.yml` (2000/2000) | Pinned, not system-assigned — they are baked into file ownership on the media drive         |
| `tailnet_domain`, `tailscale_hostname` | `group_vars/jellyfin_pi.yml`             | Non-secret identifiers, hardcoded like the account/zone ids in `variables.tf`               |
| `TAILSCALE_AUTH_KEY`                   | Vault `kv/data/secrets`                  | The only secret. Never in the repo, never in the inventory                                  |

`TAILSCALE_AUTH_KEY` is a reusable, pre-approved, non-ephemeral auth key minted
in the Tailscale admin console (ephemeral keys delete the node when it goes
offline — wrong for a server that reboots for unattended upgrades). Store it
the same way as every other Vault secret — `pnpm gcp:vm:vault:save-secrets-local`,
add the key to `~/Desktop/vault-secrets.json`, `pnpm gcp:vm:vault:set-secrets`
— and see [secret-management.md](./secret-management.md) for rotation.

`provision.sh` fetches it through `load-tailscale-authkey.sh` and hands it to
the playbook as the `TS_AUTHKEY` environment variable, never as `--extra-vars`;
on the Pi it is staged in `/run` (tmpfs, `0600`) and passed as
`tailscale up --auth-key file:…`, so the key is never in anyone's `argv` and
never written to the SD card. It is only read when the node is not on the
tailnet yet, so routine converge runs work with Vault unreachable.

## From scratch

1. **Flash.** Raspberry Pi Imager → Raspberry Pi OS Lite (64-bit). In OS
   customisation set the hostname (`jellyfin-pi`), create the admin user, paste
   your SSH public key, and enable SSH with public-key auth only. Prefer
   Ethernet over Wi-Fi.
2. **Boot and find it.** `ssh <admin-user>@jellyfin-pi.local` (mDNS) or the
   address from the router's DHCP table. Connect once to accept the host key —
   Ansible will not prompt for it.
3. **Attach the media drive.** Plug it in and read `lsblk -f`. For a brand new
   drive, partition and format it first (destroys everything on it):
   `sudo mkfs.ext4 -L media /dev/sda1`. For a drive that already holds media —
   the replacement-Pi case — do not format; just note the `UUID`.
4. **Fill in the inventory.**
   ```bash
   cd infrastructure/jellyfin-pi
   cp inventory/hosts.example.yml inventory/hosts.yml
   cp inventory/host_vars/jellyfin-pi.example.yml inventory/host_vars/jellyfin-pi.yml
   ```
   Set `ansible_host`/`ansible_user` in the first and `media_drive_uuid`,
   `ssh_authorized_keys`, `pi_timezone` in the second. Both are gitignored.
5. **Put the auth key in Vault** if it is not there yet (see above).
6. **Dry run, then provision.**
   ```bash
   pnpm jellyfin:provision:check   # --check --diff, changes nothing
   pnpm jellyfin:provision
   ```
   The run installs base packages and unattended security upgrades, creates the
   `jellyfin` service user, hardens sshd (key-only, no root login), mounts the
   drive by UUID via fstab, installs Docker and the Compose plugin, enrols the
   node in the tailnet, and starts `jellyfin-compose.service`.
   A dry run reports what it would do, but on a never-provisioned Pi it cannot
   fully simulate the steps that depend on earlier ones (Docker is not
   installed yet, the drive is not mounted yet) — `--check` earns its keep on
   re-runs, where it shows exactly what has drifted.
7. **Re-run it.** A second `pnpm jellyfin:provision` must report `changed=0`.
   That is the convergence check; treat any recurring change as a bug in the
   playbook.
8. **Approve the node** in the Tailscale admin console if the tailnet requires
   device approval, then confirm `pnpm jellyfin:status`.

## First-boot Jellyfin setup

`pnpm jellyfin:open` (or `http://jellyfin-pi.echidna-rohu.ts.net:8096`) lands on
the setup wizard the first time only:

1. Language, then create the admin user. That password is a personal login, not
   an app secret: it belongs in Bitwarden, not Vault, not the repo.
2. Add a library pointing at `/media` — the read-only bind mount of
   `/mnt/media/library`. Use Jellyfin's expected folder names underneath
   (`Movies`, `Shows`, `Music`), one library per content type.
3. Leave remote access at its default. Do not forward a port on the router:
   remote access is the tailnet, and `JELLYFIN_PublishedServerUrl` already
   points clients at the MagicDNS name.
4. Add media by copying into `/mnt/media/library/...` (the directory is
   group-writable by `jellyfin`; add yourself to that group or use `sudo`), then
   trigger a library scan.

The wizard only appears once — the answers land in `/opt/jellyfin/config`, which
survives every re-provision.

## Operations

All the `pnpm jellyfin:*` scripts are in [cheatsheet.md](../cheatsheet.md).
`provision` and `provision:check` run the playbook; the rest go over SSH using
the address from the inventory. Useful extras:

```bash
# Re-run one part of the playbook — e.g. after bumping the pinned image tag in
# docker-compose.yml — then bounce the stack onto it
infrastructure/jellyfin-pi/provision.sh --tags jellyfin
pnpm jellyfin:docker:restart
```

The image tag in `docker-compose.yml` is pinned and bumped deliberately
(Renovate raises the PR); unattended upgrades cover Debian security updates
only and deliberately exclude the Docker and Tailscale repos, so the container
runtime never changes under a running library at 04:00.

## Replacing the Pi with the same media drive

The media drive is the only irreplaceable part. Everything else is rebuilt by
the playbook:

1. Flash the replacement Pi (steps 1–2 above), move the drive over, and read
   its UUID again — it does not change with the host, but it does change if you
   ever reformat.
2. Update `ansible_host` (and `media_drive_uuid` if it changed) in the
   inventory, then `pnpm jellyfin:provision`.
3. The `jellyfin` user is recreated with uid/gid 2000, so every file already on
   the drive keeps a valid owner. This is why those numbers are pinned in
   `group_vars` — letting `useradd` pick them would silently orphan the entire
   library on a rebuild.
4. Jellyfin config does not move with the drive by design, so the replacement
   comes up on a fresh setup wizard: recreate the admin user and re-add the
   library, then let it rescan. To keep users, playback positions and metadata
   instead, copy `/opt/jellyfin/config` off the old Pi first (with the stack
   stopped) and restore it before the first start.

## Backups and monitoring

Neither of the repo-wide rules applies here, deliberately:

- **No backup job in `cron-backup.yml`.** The Pi is LAN-only and unreachable
  from GitHub Actions, and the library is bulk media, not a store that can be
  dumped into `gs://vigilant-broccoli-backup` nightly. Media durability is the
  drive's problem (and a second copy of anything irreplaceable); Jellyfin's
  config is reproducible by re-running the wizard, and the manual copy above
  covers the case where that is not good enough.
- **No Upptime entry.** `.upptimerc.yml` monitors public URLs; a tailnet-only
  host has none to poll. `pnpm jellyfin:status` is the check.
