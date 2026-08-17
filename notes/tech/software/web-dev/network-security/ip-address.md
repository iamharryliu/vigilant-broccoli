# IP Addresses

An IP (Internet Protocol) address identifies a device on a network. IPv4 addresses are 32-bit, written as four dotted decimal octets (`0.0.0.0`–`255.255.255.255`); IPv6 addresses are 128-bit, written as colon-separated hex groups. A trailing `/n` (CIDR prefix) marks how many leading bits are fixed, defining an address range (block).

Back to [Network Security](./network-security.md).

## Special-Use IPv4 Ranges

| Address Range        | Name / Purpose        | Description                                                                                      |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `0.0.0.0/8`          | "This" network        | Source-only; `0.0.0.0` means "this host on this network" or "any address" when binding a socket. |
| `10.0.0.0/8`         | Private (Class A)     | RFC 1918 private range, not routable on the public internet. ~16.7M addresses.                   |
| `100.64.0.0/10`      | Carrier-grade NAT     | RFC 6598 shared address space for ISP-level NAT between subscribers and the public internet.     |
| `127.0.0.0/8`        | Loopback              | Traffic to the local host; `127.0.0.1` is `localhost`. Never leaves the machine.                 |
| `169.254.0.0/16`     | Link-local (APIPA)    | Auto-assigned when no DHCP server responds; valid only on the local link.                        |
| `172.16.0.0/12`      | Private (Class B)     | RFC 1918 private range (`172.16.0.0`–`172.31.255.255`).                                          |
| `192.0.0.0/24`       | IETF protocol assign. | Reserved for IANA/IETF protocol assignments.                                                     |
| `192.0.2.0/24`       | TEST-NET-1            | RFC 5737 documentation/example range — safe to use in docs, never routed.                        |
| `192.88.99.0/24`     | 6to4 relay anycast    | Formerly used for 6to4 IPv6 relays (now deprecated).                                             |
| `192.168.0.0/16`     | Private (Class C)     | RFC 1918 private range, the common home/office LAN range (e.g. `192.168.1.1`).                   |
| `198.18.0.0/15`      | Benchmarking          | RFC 2544 network device benchmark testing; should not appear on the public internet.             |
| `198.51.100.0/24`    | TEST-NET-2            | RFC 5737 documentation/example range.                                                            |
| `203.0.113.0/24`     | TEST-NET-3            | RFC 5737 documentation/example range — use in examples and tutorials, guaranteed not routed.     |
| `224.0.0.0/4`        | Multicast (Class D)   | One-to-many delivery to subscribed hosts (e.g. `224.0.0.1` all-hosts).                           |
| `240.0.0.0/4`        | Reserved (Class E)    | Reserved for future use / experimental; not routable.                                            |
| `255.255.255.255/32` | Broadcast             | Limited broadcast — delivered to all hosts on the local network segment.                         |

## TEST-NET Ranges

The three TEST-NET blocks (RFC 5737) exist so documentation, examples, and lab configs use addresses that are guaranteed **never routed** on the public internet — avoiding accidental traffic to a real host that happens to own the address:

| Address Range     | Name       |
| ----------------- | ---------- |
| `192.0.2.0/24`    | TEST-NET-1 |
| `198.51.100.0/24` | TEST-NET-2 |
| `203.0.113.0/24`  | TEST-NET-3 |

`example.com`-style domains play the same role for hostnames as TEST-NET does for IPs.

## Notable Single Addresses

| Address           | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| `127.0.0.1`       | IPv4 loopback (`localhost`).                                            |
| `0.0.0.0`         | Bind to all interfaces / unspecified address.                           |
| `8.8.8.8`         | Google Public DNS (public, routable — often used to test connectivity). |
| `1.1.1.1`         | Cloudflare Public DNS.                                                  |
| `255.255.255.255` | Limited broadcast address.                                              |

## Special-Use IPv6 Ranges

| Address Range   | Name          | Description                                                            |
| --------------- | ------------- | ---------------------------------------------------------------------- |
| `::/128`        | Unspecified   | Equivalent of IPv4 `0.0.0.0`.                                          |
| `::1/128`       | Loopback      | Equivalent of IPv4 `127.0.0.1`.                                        |
| `fe80::/10`     | Link-local    | Auto-configured, valid only on the local link (like `169.254.0.0/16`). |
| `fc00::/7`      | Unique local  | Private addressing (like RFC 1918); `fd00::/8` is the used half.       |
| `2001:db8::/32` | Documentation | RFC 3849 example range — the IPv6 counterpart to TEST-NET.             |
| `ff00::/8`      | Multicast     | One-to-many delivery.                                                  |

## References

- [RFC 1918 — Private Address Space](https://datatracker.ietf.org/doc/html/rfc1918)
- [RFC 5737 — IPv4 Address Blocks Reserved for Documentation](https://datatracker.ietf.org/doc/html/rfc5737)
- [RFC 3849 — IPv6 Address Prefix Reserved for Documentation](https://datatracker.ietf.org/doc/html/rfc3849)
- [IANA IPv4 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml)
