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

## Types of Attacks

| Type of Attack                     | Category           | Description                                                                                                                                                                           | Methods to Prevent                                                                                                             |
| ---------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ARP Spoofing                       | Network            | Forges ARP replies on a local network so traffic meant for another host is routed through the attacker.                                                                               | Static ARP entries, dynamic ARP inspection, port security, encrypted transport                                                 |
| Brute Force / Password Cracking    | Credential         | Systematically guesses credentials; effective on short or low-entropy passwords.                                                                                                      | Strong password policy, rate limiting, account lockout, MFA, slow hashing (bcrypt/argon2)                                      |
| Buffer Overflow                    | Memory Safety      | Writes past the bounds of a buffer to corrupt adjacent memory and redirect execution.                                                                                                 | Memory-safe languages, bounds checking, ASLR, stack canaries, compiler hardening flags                                         |
| Clickjacking                       | Browser            | Layers an invisible frame over a page so a user's clicks land on attacker-chosen controls.                                                                                            | `X-Frame-Options`, CSP `frame-ancestors`, confirmation steps on destructive actions                                            |
| Command Injection                  | Injection          | Passes attacker input into a shell command so arbitrary commands run on the host.                                                                                                     | Avoid shelling out, pass arguments as arrays instead of strings, allowlist input, least-privilege processes                    |
| Credential Stuffing                | Credential         | Replays username/password pairs leaked from other breaches against your login.                                                                                                        | MFA, breached-password checks, device fingerprinting, rate limiting, CAPTCHA                                                   |
| Cross-Site Request Forgery (CSRF)  | Browser            | Tricks a logged-in user's browser into sending an unwanted request to a site they're authenticated on — works because cookies are sent automatically with every request to that site. | Anti-CSRF tokens, `SameSite` cookies, verify `Origin`/`Referer` headers                                                        |
| Cross-Site Scripting (XSS)         | Injection          | Injects malicious scripts into pages viewed by other users to steal data or hijack sessions.                                                                                          | Output encoding/escaping, Content Security Policy (CSP), sanitize input, `HttpOnly` cookies                                    |
| Directory Traversal                | Web                | Uses `../` sequences in a path parameter to read files outside the intended directory.                                                                                                | Resolve and verify canonical paths, allowlist filenames, serve files by id instead of path                                     |
| Distributed Denial of Service      | Availability       | Floods a service with traffic from many sources to exhaust resources and cause downtime.                                                                                              | Firewall, rate limiting, CDN, traffic monitoring, blacklist/whitelist, autoscaling                                             |
| DNS Spoofing / Cache Poisoning     | Network            | Feeds forged DNS responses to a resolver so a hostname resolves to the attacker's server.                                                                                             | DNSSEC, DNS over HTTPS/TLS, trusted resolvers, short TTLs, certificate validation                                              |
| Insecure Deserialization           | Injection          | Feeds crafted serialized objects to a parser that instantiates them, leading to code execution.                                                                                       | Avoid deserializing untrusted data, use data-only formats (JSON), schema validation, signed payloads                           |
| Malware                            | Malicious Software | Runs attacker-controlled code on a host to steal data, persist, or spread — trojans, worms, spyware, keyloggers.                                                                      | Endpoint protection, patch management, least privilege, application allowlisting, restricted macros/downloads                  |
| Man-in-the-Middle (MITM)           | Network            | Intercepts or alters traffic between two parties who believe they are communicating directly.                                                                                         | TLS/HTTPS everywhere, certificate pinning, HSTS, avoid untrusted networks                                                      |
| Phishing / Social Engineering      | Social Engineering | Manipulates people into revealing credentials or secrets via deceptive messages or sites.                                                                                             | Security awareness training, MFA, email filtering, domain verification (SPF/DKIM/DMARC)                                        |
| Privilege Escalation               | Post-Exploitation  | Exploits flaws to gain higher access than granted.                                                                                                                                    | Least privilege, patch management, input validation, audit logging                                                             |
| Prompt Injection                   | Injection          | Hides instructions in content an LLM reads so the model ignores its own rules or leaks data through its tools.                                                                        | Treat model output as untrusted, scope tool permissions, confirm side effects, separate instructions from retrieved content    |
| Ransomware                         | Malicious Software | Encrypts data and withholds the key until a ransom is paid, often exfiltrating first for extra leverage.                                                                              | Offline/immutable backups, restore drills, network segmentation, least privilege, patch management                             |
| Replay Attack                      | Protocol           | Captures and re-sends valid requests/tokens to gain unauthorized access.                                                                                                              | Nonces, timestamps, short-lived tokens, idempotency keys                                                                       |
| Server-Side Request Forgery (SSRF) | Web                | Tricks a server into making a request on the attacker's behalf to somewhere it shouldn't reach, like an internal-only service or a cloud metadata endpoint.                           | Block/allowlist outbound destinations, reject private/internal IP ranges (re-check after DNS resolution), network segmentation |
| Session Hijacking                  | Browser            | Steals or fixates a session identifier to act as an already-authenticated user.                                                                                                       | `HttpOnly`/`Secure` cookies, rotate session ids on login, short expiry, bind sessions to device signals                        |
| SQL Injection                      | Injection          | Injects malicious SQL through unsanitized input to read or modify the database.                                                                                                       | Parameterized queries / prepared statements, ORM, input validation, least-privilege DB accounts                                |
| Supply Chain Attack                | Supply Chain       | Compromises a dependency, build step, or vendor so malicious code ships inside trusted software.                                                                                      | Pinned dependencies with lockfiles, provenance/signature verification, vulnerability scanning, minimal build permissions       |
| Timing Attack                      | Side Channel       | Infers secrets by measuring how long an operation takes (e.g. char-by-char string comparison).                                                                                        | Constant-time comparison functions, avoid early-exit on secret comparisons, add uniform response time                          |
| Watering Hole                      | Social Engineering | Compromises a site the target group already visits and waits for them to come to it.                                                                                                  | Patch management, browser isolation, endpoint protection, CSP and subresource integrity                                        |
| XML External Entity (XXE)          | Injection          | Abuses an XML parser's external entity support to read local files or reach internal services.                                                                                        | Disable external entities and DTDs, prefer JSON, use hardened parser configurations                                            |
| Zero-Day Exploit                   | Exploitation       | Exploits a vulnerability before a patch exists, so signatures and advisories offer no cover.                                                                                          | Defense in depth, network segmentation, behavioural detection, rapid patch pipeline, minimal attack surface                    |

## References

- [Have I Been Pwned?](https://haveibeenpwned.com/)
- [Password Generator](https://passwordsgenerator.net/)
- [How to Choose a Password - Computerphile](https://www.youtube.com/watch?v=3NjQ9b3pgIg)
