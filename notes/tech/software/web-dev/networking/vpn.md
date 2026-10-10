# VPN

## Table of Contents

- [Products](#products)

## Products

| Product                                            | Description                                        | Pros                                                       | Cons                                                                | Best Used For                                                          |
| -------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [WireGuard](./wireguard.md)                        | VPN protocol and tools for encrypted peer tunnels. | Lightweight; direct control over configuration.            | Manual key distribution, peer setup, and routing.                   | Laptop-to-server or site-to-site tunnels with explicit configuration.  |
| [Tailscale](./tailscale.md)                        | WireGuard mesh VPN with a hosted control plane.    | Easy setup; automatic peer discovery and key distribution. | Depends on a hosted control service.                                | Private access across laptops, phones, and servers with minimal setup. |
| [Headscale](https://github.com/juanfont/headscale) | Self-hosted control server for Tailscale clients.  | Open source; control over server hosting.                  | Requires server maintenance; narrower feature scope than Tailscale. | Homelabs and small groups wanting a self-hosted mesh.                  |
