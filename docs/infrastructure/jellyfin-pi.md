# Jellyfin Pi

The homelab media server: a Raspberry Pi on the home LAN running Jellyfin in
Docker Compose, provisioned with Ansible from
[infrastructure/jellyfin-pi/](../../infrastructure/jellyfin-pi/).

## Table of Contents

- [Why Ansible and not Terraform](#why-ansible-and-not-terraform)
- [Why Tailscale for remote access](#why-tailscale-for-remote-access)
- [Prerequisites](#prerequisites)
- [The provisioned host](#the-provisioned-host)
- [On-disk layout](#on-disk-layout)
- [Variables and secrets](#variables-and-secrets)
- [From scratch](#from-scratch)
- [First-boot Jellyfin setup](#first-boot-jellyfin-setup)
- [Adding and managing media](#adding-and-managing-media)
- [Operations](#operations)
- [Replacing the Pi](#replacing-the-pi)
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

- A Raspberry Pi (arm64) on Ethernet. **Provisioned and verified on a Pi 3
  Model B+ Rev 1.3 (1GB RAM, Debian 13 trixie);** a Pi 4 or 5 with 4GB+ is
  comfortably better. Jellyfin on a Pi is a direct-play server: no Pi has a
  video encoder Jellyfin can use and the playbook deliberately maps no
  `/dev/dri` device, so anything needing transcoding is CPU-bound. Keep the
  library in formats the clients play natively.
- On a 3B+ specifically, mind two hardware limits. Its 1GB of RAM leaves
  roughly 600MB free with Jellyfin running, so the library database is the
  constraint rather than playback; and Ethernet hangs off the USB 2.0 bus,
  capping the network near 300Mbit. The microSD slot is separate (SDIO), so
  the library does not contend with the network the way the old USB drive did.
  One or two direct-play streams are fine. Several are not.
- Ethernet, not Wi-Fi. Beyond the shared-bus limit, Raspberry Pi OS ships the
  Wi-Fi radio rfkill-soft-blocked until a WLAN country is set, which is an easy
  trap on a headless box (see [CLAUDE.md](../../infrastructure/jellyfin-pi/CLAUDE.md#a-headless-pi-boots-pings-and-has-no-user-account)).
- A reliable boot device (SD card or, better, USB SSD) holding the OS, config,
  cache **and the media library** — there is no external drive. **Size it for
  the library plus headroom; 128GB is the verified configuration.** Jellyfin
  refuses to start when its data path has less than 2GiB free, and the Docker
  image alone is ~1.3GB: an 8GB card leaves no headroom, and the failure
  arrives weeks later as a service that crash-loops with `SQLite Error 8` or
  `insufficient free space ... Available: 2GiB, Required: 2GiB` rather than as
  anything that looks like a disk problem. `tasks/preflight.yml` refuses to
  provision below `pi_min_free_gib` (3GiB) for this reason.
- Because the library shares that device, **it has no independent durability**.
  A reflash wipes it, and a card failure takes the media with it. Keep a second
  copy of anything irreplaceable somewhere else — see
  [Backups and monitoring](#backups-and-monitoring).

Software:

- **Pi**: Raspberry Pi OS (64-bit), Bookworm or newer, flashed with SSH enabled
  and the operator's public key installed. The playbook asserts
  `os_family=Debian` and `architecture=aarch64` before touching anything.
- **Control node** (the laptop): `ansible` (in [setup/mac/Brewfile](../../setup/mac/Brewfile),
  or `pipx install ansible-core`), `jq`, and `gcloud` logged in for the Vault
  fetch. Collections come from `requirements.yml`, installed by `provision.sh`
  on every run.

## The provisioned host

The inventory is gitignored, so these values live only on the operator's
laptop. None of them are secrets — per
[secret-management.md](./secret-management.md), non-secret identifiers are
recorded rather than routed through Vault — so they are written down here to
keep rebuilding independent of any one machine. The three real secrets — the
Tailscale auth key, the SMB password and the Jellyfin API key — stay in Vault.

| Value                 | Current                                                    | Where it goes           |
| --------------------- | ---------------------------------------------------------- | ----------------------- |
| Board                 | Raspberry Pi 3 Model B+ Rev 1.3, Debian 13 trixie arm64    | —                       |
| `ansible_host`        | `192.168.0.11` (DHCP lease)                                | `inventory/hosts.yml`   |
| `ansible_user`        | `hliu`                                                     | `inventory/hosts.yml`   |
| Ethernet MAC          | `b8:27:eb:23:4d:e0`                                        | router DHCP reservation |
| Boot device           | 128GB microSD, ext4, holding OS + config + cache + library | —                       |
| `media_library_dir`   | `/srv/media/library` (the committed default)               | `group_vars/`           |
| `pi_timezone`         | `Europe/Stockholm`                                         | `host_vars/`            |
| `ssh_authorized_keys` | the operator's `id_ed25519.pub`                            | `host_vars/`            |

The address is a DHCP lease and every client hardcodes it, so **reserve it on
the router against the MAC above**. Without that, the lease eventually moves
and every TV, phone and browser bookmark breaks at once.

## On-disk layout

Everything lives on the one boot device — there is no external drive. Nothing
below is in Git: media files and Jellyfin's runtime state are gitignored in
[infrastructure/jellyfin-pi/.gitignore](../../infrastructure/jellyfin-pi/.gitignore),
and the repo carries only the playbook, the compose file and the `.example`
inventory.

| Path on the Pi                     | Contents                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `/opt/jellyfin/docker-compose.yml` | Copy of the repo's compose file                                          |
| `/opt/jellyfin/.env`               | Rendered from `templates/jellyfin.env.j2` — uids, paths, timezone, URL   |
| `/opt/jellyfin/config`             | Jellyfin config, users, library database, metadata (container `/config`) |
| `/var/cache/jellyfin`              | Transcode and image cache (container `/cache`) — disposable              |
| `/srv/media/library`               | The media library, bind-mounted read-only into the container at `/media` |

The library is under `/srv` rather than `/mnt/media` deliberately. `/srv` is
where Debian puts data a host serves, and `/mnt` is for mount points — so if a
drive is ever mounted at `/mnt/media` later, it cannot shadow a library that
already has files in it. A shadowed library reads exactly like deleted media
and is unpleasant to diagnose.

The media bind mount keeps `create_host_path: false`. The playbook creates
`/srv/media/library`, so if a run ever failed to, Docker would otherwise
helpfully create an empty one and Jellyfin would come up with an empty library
that looks exactly like data loss. Refusing to start is the better outcome.

Config and cache are separate paths from the library so that the distinction
still means something: config is reproducible by re-running the setup wizard
and the cache is disposable, while the library is the only part worth backing
up.

## Variables and secrets

Committed defaults live in
[group_vars/jellyfin_pi.yml](../../infrastructure/jellyfin-pi/group_vars/jellyfin_pi.yml);
everything host-specific is operator-supplied and gitignored.

| Value                                  | Where it goes                            | Notes                                                                                       |
| -------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ansible_host`, `ansible_user`         | `inventory/hosts.yml`                    | The Pi's LAN address (or MagicDNS name after enrolment) and the admin account from flashing |
| `media_library_dir`                    | `group_vars/jellyfin_pi.yml`             | `/srv/media/library` on the boot device; the container and the SMB share both resolve it    |
| `ssh_authorized_keys`                  | `inventory/host_vars/<host>.yml`         | Required — the same run disables password authentication                                    |
| `pi_timezone`                          | `inventory/host_vars/<host>.yml`         | Also becomes the container's `TZ`, which is what Jellyfin schedules tasks against           |
| `jellyfin_uid` / `jellyfin_gid`        | `group_vars/jellyfin_pi.yml` (2000/2000) | Pinned, not system-assigned — they are baked into the library's file ownership              |
| `tailnet_domain`, `tailscale_hostname` | `group_vars/jellyfin_pi.yml`             | Non-secret identifiers, hardcoded like the account/zone ids in `variables.tf`               |
| `TAILSCALE_AUTH_KEY`                   | Vault `kv/data/secrets`                  | Never in the repo, never in the inventory                                                   |
| `SAMBA_PASSWORD`                       | Vault `kv/data/secrets`                  | Login for the `jellyfin` SMB account; read only when the account does not exist yet         |
| `JELLYFIN_API_KEY`                     | Vault `kv/data/secrets`                  | Minted in Dashboard → API Keys; used by `pnpm jellyfin:scan`, never by the playbook         |
| `samba_*`                              | `group_vars/jellyfin_pi.yml`             | Share name, path, allowed networks, mDNS — all non-secret                                   |

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
   Ethernet over Wi-Fi; leave "Configure wireless LAN" unchecked.

   Use Imager's customisation rather than hand-writing config, because the
   first-boot mechanism keeps moving: `custom.toml` (Bookworm era), then
   `firstrun.sh` plus a `systemd.run=` hook in `cmdline.txt`, and as of Imager
   2.x a **cloud-init seed** (`user-data`, `meta-data`, `network-config`) on
   the boot partition. Older guides describe mechanisms current images ignore.

2. **Verify the customisation actually landed — before first boot.** Imager
   2.0.11 has been observed writing the card correctly while leaving
   `user-data` as the stock all-commented template, which produces a Pi that
   boots, answers ping and has no user account. Re-insert the card and check:

   ```bash
   grep -E '^(hostname|users|ssh_pwauth):' /Volumes/bootfs/user-data
   ```

   Three matches means it applied. No output means it did not, and booting
   that card wastes a round trip. Write it by hand instead — the card has
   never booted, so cloud-init runs every per-instance module on first boot:

   ```yaml
   #cloud-config
   hostname: jellyfin-pi
   manage_etc_hosts: true
   timezone: Europe/Stockholm
   ssh_pwauth: false
   users:
     - name: hliu
       groups: sudo
       shell: /bin/bash
       lock_passwd: false
       passwd: '<openssl passwd -6 output>'
       sudo: 'ALL=(ALL) NOPASSWD:ALL'
       ssh_authorized_keys:
         - ssh-ed25519 AAAA... you@your-laptop
   ```

   List only `sudo` under `groups` — cloud-init errors on a group that does
   not exist yet, and the Pi-specific ones (`gpio`, `spi`, `i2c`) are not
   guaranteed on a Lite image. Nothing here needs them.

   Fix `meta-data` in the same pass: the shipped file spells the key
   `instance_id`, which the NoCloud datasource does not read, so the id falls
   back to the literal `nocloud` and never changes — see
   [CLAUDE.md](../../infrastructure/jellyfin-pi/CLAUDE.md#a-headless-pi-boots-pings-and-has-no-user-account).
   Replace it with `instance-id: jellyfin-pi-<date>`. Also `touch
/Volumes/bootfs/ssh`: Raspberry Pi OS keeps `sshd` disabled until
   `sshswitch.service` finds that file, independent of cloud-init.

3. **Boot and find it.** `ssh <admin-user>@jellyfin-pi.local` (mDNS) or the
   address from the router's DHCP table. First boot resizes the root partition
   to fill the card and runs cloud-init, so give it 2–3 minutes. Connect once
   to accept the host key — Ansible will not prompt for it.

4. **Fill in the inventory.**
   ```bash
   cd infrastructure/jellyfin-pi
   cp inventory/hosts.example.yml inventory/hosts.yml
   cp inventory/host_vars/jellyfin-pi.example.yml inventory/host_vars/jellyfin-pi.yml
   ```
   Set `ansible_host`/`ansible_user` in the first and `ssh_authorized_keys`
   plus `pi_timezone` in the second. Both are gitignored. There is no drive
   UUID to supply — the library lives on the boot device at
   `media_library_dir`.
5. **Put the auth key in Vault** if it is not there yet (see above), or skip
   Tailscale entirely:

   ```bash
   pnpm jellyfin:provision -- --skip-tags tailscale
   ```

   Enrolment is the only step that needs a secret, so skipping it makes the
   run self-contained. Two consequences, both easy to miss:

   - The host is reachable on the LAN only. Nothing is exposed to the internet
     either way, so this is a reduction in reach, not in security.
   - `jellyfin_published_server_url` defaults to the tailnet MagicDNS name,
     which now resolves nowhere. Jellyfin hands that URL to clients as its own
     address, so **Chromecast casting fails and native clients can stumble on
     discovery** while the web UI works fine — a confusing pairing. Override it
     in `host_vars` with the LAN address:

     ```yaml
     jellyfin_published_server_url: 'http://192.168.0.11:8096'
     ```

6. **Dry run, then provision.**
   ```bash
   pnpm jellyfin:provision:check   # --check --diff, changes nothing
   pnpm jellyfin:provision
   ```
   The run installs base packages and unattended security upgrades, creates the
   `jellyfin` service user and the library directory, hardens sshd (key-only,
   no root login), installs Docker and the Compose plugin, enrols the node in
   the tailnet, exports the SMB share, and starts `jellyfin-compose.service`.
   A dry run reports what it would do, but on a never-provisioned Pi it cannot
   fully simulate the steps that depend on earlier ones (Docker and Samba are
   not installed yet) — `--check` earns its keep on re-runs, where it shows
   exactly what has drifted.
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
   `/srv/media/library`. Use Jellyfin's expected folder names underneath
   (`Movies`, `Shows`, `Music`), one library per content type.
3. Leave remote access at its default. Do not forward a port on the router:
   remote access is the tailnet, and `JELLYFIN_PublishedServerUrl` already
   points clients at the MagicDNS name.
4. Mint an API key — Dashboard → API Keys → **+**, named `media-scan` — and put
   it in Vault as `JELLYFIN_API_KEY` so `pnpm jellyfin:scan` can trigger
   library scans. See [Adding and managing media](#adding-and-managing-media)
   for the whole loop.

5. **Casting has a constraint worth knowing before you fight it.** The web
   client's Cast button lists other Jellyfin sessions and Google Cast devices.
   Google Cast needs a secure context — over plain `http://` on a LAN address
   no cast targets are discovered at all, and no amount of configuration
   changes that without putting a real certificate in front of Jellyfin. The
   workable paths are the Jellyfin app on the TV (which then appears as a
   session target in the web UI, no HTTPS involved) or the mobile apps, which
   use the native Cast SDK rather than the browser one.

The wizard only appears once — the answers land in `/opt/jellyfin/config`, which
survives every re-provision.

## Adding and managing media

The library is a writable SMB share, so content goes on the drive by dragging
into Finder with the server running — no unplugging the drive, no rsync
invocation to get right. Two steps, always:

```bash
pnpm jellyfin:media   # mount smb://jellyfin@<pi>/media in Finder
# …drag files in…
pnpm jellyfin:scan    # tell Jellyfin to look
```

`pnpm jellyfin:scan` posts to `/Library/Refresh` with `JELLYFIN_API_KEY` from
Vault — the same thing as Dashboard → Libraries → Scan All Libraries.

Now that the library sits on local ext4 rather than a USB drive, the kernel
does deliver inotify events and Jellyfin's real-time monitoring should notice
new files on its own, including ones written over the share. Treat that as a
convenience, not a guarantee: monitoring can be switched off per library and
is not reliable for large files still being written. Running the scan costs
seconds and removes the question — if a title is missing, scan before
investigating anything else.

Name files `Title (Year).ext`, one folder per title, under `movies/`, `shows/`
or `music/`, or metadata matching silently returns nothing.

### How the share is put together

`tasks/samba.yml` and `templates/smb.conf.j2` export `/srv/media/library` as
`[media]`, and the defaults are in `group_vars/jellyfin_pi.yml` under
`samba_*`. Four decisions worth knowing:

- **It writes to the host path, not through the container.** Jellyfin's own
  bind mount of the same directory stays `read_only: true`; nothing in
  `docker-compose.yml` changed to add the share.
- **`force user = jellyfin`.** The library directory is owned by the Jellyfin
  service user (uid/gid 2000), so forcing every write to that identity is what
  keeps files arriving over the share readable by the container without a
  second ownership pass.
- **Authenticated, not guest.** The login is the `jellyfin` service account and
  the password is `SAMBA_PASSWORD` in Vault. The library is the one
  irreplaceable thing on this host, and the home LAN carries guest phones and
  IoT devices; a guest-writable share means any of them can empty it.
- **No `fruit` VFS.** ext4 could support it, but a media library has no use
  for Finder resource forks and colour labels, and it is one more moving part
  between Samba and the files. The share vetoes `.DS_Store`,
  `.Spotlight-V100` and friends instead — `.Spotlight-V100` in particular
  grows without bound on a card the library already shares with Jellyfin's
  cache. The `._` AppleDouble files that remain are harmless; Jellyfin skips
  dotfiles.

Reach is the same as Jellyfin's: the LAN and the tailnet (`hosts allow` covers
`192.168.0.0/16` and the Tailscale CGNAT range `100.64.0.0/10`), and nothing is
port-forwarded. `avahi-daemon` advertises the host so it appears in Finder's
sidebar rather than needing the address typed.

On a Pi 3B+ the ceiling is the network, not the card: Ethernet hangs off the
USB 2.0 bus and tops out near 300Mbit in practice, so expect roughly
25–35 MB/s depending on the card's write speed. The microSD slot is on its own
SDIO interface, so unlike the old USB drive it does not contend with Ethernet
for bandwidth.

### Rotating the SMB password

The playbook only reads `SMB_PASSWORD` when the Samba account does not exist
yet, so routine converge runs work with Vault sealed. To change it on an
existing account, patch Vault and then force the task:

```bash
pnpm jellyfin:provision -- --tags samba -e samba_reset_password=true
```

### Falling back to rsync

Still the right tool for a bulk first load, where Finder's copy dialog is a
liability:

```bash
rsync -rh --info=progress2 "local/Film (2019).mkv" \
  "jellyfin-pi:/srv/media/library/movies/Film (2019)/"
```

On ext4 a plain `rsync -a` works too — the `--no-owner --no-group --no-perms`
dance the exFAT drive needed no longer applies. Write as a user in the
`jellyfin` group, or with `--rsync-path="sudo rsync"`, since the library
directory is `0775` owned by `jellyfin:jellyfin`.

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

## Replacing the Pi

Nothing on this host is irreplaceable except the library, and the library has
no independent existence — it is on the boot card with everything else. So a
replacement is a restore, not a transplant:

1. Copy the library off the old card first, while the old Pi still boots:
   `rsync -rh pi-old:/srv/media/library/ ./library-backup/`, or pull it over
   the SMB share. If the card is dead, the library is gone — which is the
   trade made by dropping the external drive.
2. Flash the replacement per [From scratch](#from-scratch), including the
   verification step, then `pnpm jellyfin:provision`.
3. Copy the library back into `/srv/media/library` and run `pnpm
jellyfin:scan`. The `jellyfin` user is recreated with uid/gid 2000, so
   ownership lines up — that is why those numbers are pinned in `group_vars`
   rather than left to `useradd`.
4. Jellyfin config does not survive unless you bring it: the replacement comes
   up on a fresh setup wizard. To keep users, playback positions and metadata,
   copy `/opt/jellyfin/config` off the old Pi first (with the stack stopped)
   and restore it before the first start.

## Backups and monitoring

Neither of the repo-wide rules applies here, deliberately:

- **No backup job in `cron-backup.yml`.** The Pi is LAN-only and unreachable
  from GitHub Actions, and the library is bulk media, not a store that can be
  dumped into `gs://vigilant-broccoli-backup` nightly.
- **No Upptime entry.** `.upptimerc.yml` monitors public URLs; a tailnet-only
  host has none to poll. `pnpm jellyfin:status` is the check.

What that leaves is worth stating plainly, because dropping the external drive
removed the one piece of redundancy this host had. The library now shares a
single microSD card with the OS, and cards fail. There is no RAID, no second
copy and no snapshot: **anything irreplaceable needs a copy somewhere else** —
the simplest being a periodic pull over the SMB share to a machine that is
itself backed up. Jellyfin's config is reproducible by re-running the wizard,
and the manual copy in [Replacing the Pi](#replacing-the-pi) covers the case
where that is not good enough.
