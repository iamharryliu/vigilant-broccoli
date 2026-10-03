# Networking

## Table of Contents

- [IP Addresses](./ip-address.md)
- [URI Anatomy](#uri-anatomy)
- [Remote Access and VPN](#remote-access-and-vpn)
- [Network Security](./network-security/network-security.md)

## URI Anatomy

| Term      | Description                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Scheme    | Protocol or namespace that defines how to interpret the rest (`foo`, `https`).                        |
| Authority | Host (`example.com`) plus optional userinfo and `:port` (`8042`); who serves the resource.            |
| Path      | Hierarchical location of the resource on the host (`/over/there`).                                    |
| Query     | Key-value parameters after `?` that refine the request (`name=ferret`).                               |
| Hash      | Fragment after `#` that points at a secondary resource or section (`nose`); never sent to the server. |

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
