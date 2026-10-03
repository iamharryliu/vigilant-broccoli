# Networking

## Table of Contents

- [IP Addresses](./ip-address.md)
- [URI Anatomy](#uri-anatomy)
- [Remote Access and VPN](#remote-access-and-vpn)
- [Network Security](./network-security/network-security.md)

## URI Anatomy

The parts of a URI, labelled.

```
foo://example.com:8042/over/there?name=ferret#nose
\_/   \______________/\_________/ \_________/ \__/
 |           |            |            |        |
scheme    authority      path        query     hash
```

## Remote Access and VPN

| Tool                        | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| [SSH](./ssh.md)             | Secure remote access and port forwarding over an encrypted SSH connection. |
| [WireGuard](./wireguard.md) | Encrypted point-to-point VPN tunnel into a private network.                |
| [Tailscale](./tailscale.md) | Mesh VPN built on WireGuard with a hosted control plane.                   |
