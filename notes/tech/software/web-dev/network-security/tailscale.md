# Tailscale

Mesh VPN built on [WireGuard](./wireguard.md) — devices in a _tailnet_ connect peer-to-peer with keys, DNS, and ACLs handled by a hosted control plane instead of hand-written configs.

## Table of Contents

- [Free Tier](#free-tier)
- [Concepts](#concepts)
- [Install](#install)
- [Commands](#commands)
  - [Login](#login)
  - [Status](#status)
  - [Connectivity](#connectivity)
  - [Exit Nodes](#exit-nodes)
  - [Subnet Routes](#subnet-routes)
  - [SSH](#ssh)
  - [File Transfer](#file-transfer)
  - [Serve and Funnel](#serve-and-funnel)
  - [Certificates](#certificates)
- [References](#references)

## Free Tier

- Personal plan: free for 3 users and 100 devices, one tailnet.
- Included at no cost: MagicDNS, exit nodes, subnet routers, Tailscale SSH, Taildrop, Serve/Funnel, HTTPS certs, ACL policy file.
- No bandwidth charge — traffic is peer-to-peer; only relayed (DERP) fallback traffic crosses Tailscale servers, and it is unmetered but throughput-limited.
- Paid tiers add more users, SSO/SCIM, audit logs, and longer key expiry controls.

## Concepts

| Term           | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| ACL            | JSON policy file in the admin console defining which devices/users may reach which ports.     |
| Auth Key       | Pre-generated key for non-interactive enrolment (servers, CI, containers); can be ephemeral.  |
| DERP           | Tailscale-hosted relay used when two peers cannot establish a direct connection.              |
| Exit Node      | Device that routes a peer's full internet traffic, like a traditional VPN egress.             |
| Ephemeral Node | Device that removes itself from the tailnet once it goes offline — for short-lived workloads. |
| Funnel         | Exposes a Serve endpoint to the public internet over HTTPS.                                   |
| MagicDNS       | Resolves devices by hostname (`host.tailnet-name.ts.net`) without manual DNS.                 |
| Serve          | Publishes a local port/path to other devices in the tailnet over HTTPS.                       |
| Subnet Router  | Device advertising a LAN CIDR so peers reach non-Tailscale hosts behind it.                   |
| Tailnet        | The private mesh network belonging to one account or organization.                            |
| Taildrop       | Direct file transfer between devices in the tailnet.                                          |

## Install

```
# macOS
brew install --cask tailscale-app

# Linux
curl -fsSL https://tailscale.com/install.sh | sh
sudo systemctl enable --now tailscaled
sudo tailscale set --operator=$USER # run tailscale without sudo
```

## Commands

### Login

```
tailscale up                            # start and open the browser auth flow
tailscale login                         # re-authenticate an already running node
tailscale up --authkey=tskey-auth-XXXX  # unattended (servers, CI, containers)
tailscale up --hostname=HOST_NAME
tailscale logout
tailscale switch --list                 # multiple accounts
tailscale switch ACCOUNT
```

### Status

```
tailscale version
tailscale status
tailscale status --json
tailscale ip -4
tailscale ip -6
tailscale netcheck                      # NAT/DERP diagnostics
tailscale bugreport
```

### Connectivity

```
tailscale ping HOST                     # reports direct vs relayed path
tailscale down                          # disconnect, leave daemon running
tailscale up                            # reconnect
tailscale set --accept-dns=false        # opt out of MagicDNS
```

### Exit Nodes

```
tailscale exit-node list
tailscale up --exit-node=HOST
tailscale up --exit-node=HOST --exit-node-allow-lan-access
tailscale up --exit-node=                # clear
tailscale up --advertise-exit-node       # offer this device as an exit node
```

### Subnet Routes

```
tailscale up --advertise-routes=10.0.0.0/24
tailscale up --accept-routes             # on the peers that need the LAN
```

Advertised routes and exit nodes must be approved once in the admin console.

### SSH

```
tailscale up --ssh                       # enable Tailscale SSH on this device
tailscale ssh USER@HOST
```

### File Transfer

```
tailscale file cp FILE HOST:
tailscale file get .
```

### Serve and Funnel

```
tailscale serve --bg 3000                # share localhost:3000 inside the tailnet
tailscale serve status
tailscale serve reset
tailscale funnel --bg 3000               # expose it to the public internet
tailscale funnel status
```

### Certificates

```
tailscale cert HOST.TAILNET_NAME.ts.net  # Let's Encrypt cert for a tailnet hostname
```

## References

- [Tailscale CLI Docs](https://tailscale.com/kb/1080/cli)
- [Tailscale Pricing](https://tailscale.com/pricing)
- [How Tailscale Works](https://tailscale.com/blog/how-tailscale-works)
