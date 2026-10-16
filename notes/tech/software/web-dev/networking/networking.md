# Networking

## Table of Contents

- [IP Addresses](./ip-address.md)
- [URI Anatomy](#uri-anatomy)
- [Remote Access](#remote-access)
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

## Remote Access

| Method          | Description                                                                                               | Best Used For                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [SSH](./ssh.md) | Encrypted remote shell, file transfer, and port forwarding.                                               | Run commands on a remote machine or forward access to a specific service. |
| [VPN](./vpn.md) | Encrypted network connectivity between devices or networks; compares WireGuard, Tailscale, and Headscale. | Reach private services across devices or connect entire networks.         |
