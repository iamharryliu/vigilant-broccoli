# Network Security

## Table of Contents

- [Lingo](./network-security-lingo.md)
- [Access Methods](#access-methods)
- [Security Classification Mapping](#security-classification-mapping)
- [General Guidelines](#general-guidelines)
- [Types of Authentication](#types-of-authentication)
- [Types of Vulnerabilities](#types-of-vulnerabilities)
- [Types of Attacks](#types-of-attacks)
- [IP Addresses](./ip-address.md)
- [Network Tools](./network-tools.md)
- [Security Hardening](./security-hardening.md)
- [References](#references)

## Access Methods

| Access Method                       | Description                                                                 | More                        |
| ----------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| SSH Tunneling                       | Secure remote access and port forwarding over an encrypted SSH connection.  | [ssh](./ssh.md)             |
| VPN Access                          | Encrypted tunnel into a private network.                                    | [WireGuard](./wireguard.md) |
| Dynamic Whitelisting IP/Port Access | Grant time-boxed IP/port access on demand instead of static firewall rules. | —                           |
| Token Authentication (JWT)          | Bearer-token format for authn/authz.                                        | [jwt](./jwt.md)             |

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

## Types of Attacks

| Type of Attack                    | Description                                                                                    | Methods to Prevent                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Timing Attack                     | Infers secrets by measuring how long an operation takes (e.g. char-by-char string comparison). | Constant-time comparison functions, avoid early-exit on secret comparisons, add uniform response time |
| Brute Force / Password Cracking   | Systematically guesses credentials; effective on short or low-entropy passwords.               | Strong password policy, rate limiting, account lockout, MFA, slow hashing (bcrypt/argon2)             |
| Distributed Denial of Service     | Floods a service with traffic from many sources to exhaust resources and cause downtime.       | Firewall, rate limiting, CDN, traffic monitoring, blacklist/whitelist, autoscaling                    |
| SQL Injection                     | Injects malicious SQL through unsanitized input to read or modify the database.                | Parameterized queries / prepared statements, ORM, input validation, least-privilege DB accounts       |
| Cross-Site Scripting (XSS)        | Injects malicious scripts into pages viewed by other users to steal data or hijack sessions.   | Output encoding/escaping, Content Security Policy (CSP), sanitize input, `HttpOnly` cookies           |
| Cross-Site Request Forgery (CSRF) | Tricks an authenticated user's browser into submitting unwanted actions to a trusted site.     | Anti-CSRF tokens, `SameSite` cookies, verify `Origin`/`Referer` headers                               |
| Man-in-the-Middle (MITM)          | Intercepts or alters traffic between two parties who believe they are communicating directly.  | TLS/HTTPS everywhere, certificate pinning, HSTS, avoid untrusted networks                             |
| Phishing / Social Engineering     | Manipulates people into revealing credentials or secrets via deceptive messages or sites.      | Security awareness training, MFA, email filtering, domain verification (SPF/DKIM/DMARC)               |
| Replay Attack                     | Captures and re-sends valid requests/tokens to gain unauthorized access.                       | Nonces, timestamps, short-lived tokens, idempotency keys                                              |
| Privilege Escalation              | Exploits flaws to gain higher access than granted.                                             | Least privilege, patch management, input validation, audit logging                                    |

## References

- [Have I Been Pwned?](https://haveibeenpwned.com/)
- [Password Generator](https://passwordsgenerator.net/)
- [How to Choose a Password - Computerphile](https://www.youtube.com/watch?v=3NjQ9b3pgIg)
