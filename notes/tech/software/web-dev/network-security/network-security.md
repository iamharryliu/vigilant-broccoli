# Network Security

## Table of Contents

- [Lingo](./network-security-lingo.md)
- [Access Methods](#access-methods)
- [Security Classification Mapping](#security-classification-mapping)
- [General Guidelines](#general-guidelines)
- [Types of Authentication](#types-of-authentication)
- [Types of Vulnerabilities](#types-of-vulnerabilities)
- [Cyber Attack Types](./cyber-attack-types.md)
- [IP Addresses](./ip-address.md)
- [Network Tools](./network-tools.md)
- [Security Hardening](./security-hardening.md)
- [References](#references)

## Access Methods

| Access Method                       | Description                                                                 | More                                                     |
| ----------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| SSH Tunneling                       | Secure remote access and port forwarding over an encrypted SSH connection.  | [ssh](./ssh.md)                                          |
| VPN Access                          | Encrypted tunnel into a private network.                                    | [WireGuard](./wireguard.md), [Tailscale](./tailscale.md) |
| Dynamic Whitelisting IP/Port Access | Grant time-boxed IP/port access on demand instead of static firewall rules. | —                                                        |
| Token Authentication (JWT)          | Bearer-token format for authn/authz.                                        | [jwt](./jwt.md)                                          |

## Security Classification Mapping

| Sensitivity Level | Business Term                        | Example Use Case                         |
| ----------------- | ------------------------------------ | ---------------------------------------- |
| Lowest            | **Public**                           | Public websites, press releases          |
| Low               | **Internal / Restricted**            | Internal policies, internal emails       |
| Medium            | **Confidential**                     | Employee records, customer data (PII)    |
| High              | **Secret**                           | Trade secrets, defense logistics         |
| Highest           | **Highly Confidential / Top Secret** | Encryption keys, national security plans |

## General Guidelines

- Never trust user input.
- Never store secrets on a client-side application.

## Types of Authentication

| Type    | Description                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| API Key | Generated key used to pass through requests to access an API.                                                                   |
| OAuth   | Client-side application redirects to a third-party authorization (Google, Facebook, Apple, etc.) and is granted an OAuth token. |
| SSO     | On successful sign-in the user is granted an authentication token used to remember they are verified.                           |
| OTP     | One-time password passed to the user, usually via email or SMS.                                                                 |

## Types of Vulnerabilities

| Vulnerability     | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Permissions       | Over-broad or misconfigured access rights that let users or services do more than they should.  |
| Logs              | Sensitive data leaked into logs, or missing/tampered logs that hide malicious activity.         |
| Request Endpoints | Unauthenticated, unvalidated, or over-exposed API/HTTP endpoints that widen the attack surface. |
| People            | Human factors — weak passwords, social engineering, insider mistakes — the hardest to patch.    |

## References

- [Have I Been Pwned?](https://haveibeenpwned.com/)
- [Password Generator](https://passwordsgenerator.net/)
- [How to Choose a Password - Computerphile](https://www.youtube.com/watch?v=3NjQ9b3pgIg)
