# Application Security Layers

Part of [Network Security](./network-security.md).

## Table of Contents

- [Principles](#principles)
- [UI Layers](#ui-layers)
- [Service Layers](#service-layers)
- [Choosing Layers](#choosing-layers)
- [Common Mistakes](#common-mistakes)

## Principles

- Layer controls outside-in; each layer should still hold if the one before it is bypassed.
- Edge controls decide who may reach the app. App controls decide what a user may do.
- A hidden URL or an unlisted origin is not a control.
- A UI bundle is public to anyone who can load it; the bundle must never hold secrets (see [General Guidelines](./network-security.md#general-guidelines)).

## UI Layers

| Layer | Control | What it protects | Limits |
| --- | --- | --- | --- |
| 1. DNS / CDN edge | WAF, bot protection, rate limiting, DDoS absorption (Cloudflare, Vercel Firewall) | Origin from floods, scrapers and known-bad traffic | Does not know who the user is |
| 2. Access wrapper | Identity-aware proxy in front of the whole site (Cloudflare Access, Vercel Deployment Protection, basic auth) | Entire site: only allowed emails/groups ever receive the HTML and JS | Coarse: all-or-nothing per host or path; no per-user data rules |
| 3. Login provider | App-level sign-in via OAuth/OIDC or a hosted/embedded auth library (see [Auth Providers](../../tools/auth-providers.md), [Authentication](../../authentication.md)) | Identity and session inside the app | Proves identity only; each data request still needs authorization |
| 4. Session handling | `HttpOnly`/`Secure`/`SameSite` cookies, short expiry, CSRF tokens | Stolen or forged sessions | Depends on the framework configuring them correctly |
| 5. Authorization | Role or ownership checks, row-level security | Each user's own data | Must run server-side; client checks are cosmetic |
| 6. Browser hardening | CSP, HSTS, `frame-ancestors`, Subresource Integrity | XSS, clickjacking, downgrade | Reduces impact, does not replace output escaping |

## Service Layers

| Layer | Control | What it protects | Limits |
| --- | --- | --- | --- |
| 1. Network reachability | Private network, VPN/mesh, firewall allowlist, no public IP, private service-to-service networking | Service is unreachable to the public internet | Anything inside the perimeter is implicitly trusted unless layers below exist |
| 2. Edge / gateway | TLS termination, WAF, rate limits, IP allowlist, mTLS | Protocol abuse and floods; restricts callers to known clients | IP allowlists break for roaming or serverless callers |
| 3. Service credential | API key, service token, or signed request for machine callers | Identifies which application is calling | Static secrets leak and rarely expire; store in a secret manager and rotate; one key per caller |
| 4. User identity | Bearer JWT or session from the login provider, verified by the service (signature, issuer, audience, expiry) | Identifies which user is calling | Token validity is not permission; add authorization |
| 5. Authorization | Scopes, roles, per-resource ownership checks | What the caller may do | Must check every request, not only at login |
| 6. Request hygiene | Schema validation, parameterized queries, size limits, per-caller rate limits | Injection, abuse, noisy neighbours | Does not replace identity |
| 7. Data and secrets | Least-privilege DB accounts, secret manager, audit logging | Blast radius after a breach | Logging must not capture tokens or PII |

## Choosing Layers

| Scenario | Minimum layers |
| --- | --- |
| Internal admin UI, few known users | UI 2 (access wrapper with email allowlist); add UI 3 if the app needs per-user data |
| Private service called only by your own UI server | Service 1 (private network) and 3 (service credential) |
| Public marketing site | UI 1 and 6 |
| Public multi-user app | UI 1, 3, 4, 5, 6 |
| Public service called from a browser | Service 2, 4, 5, 6; an API key in browser code is public, so it only identifies the app, never the user |
| Third-party or machine integration | Service 2, 3, 5, 6 with per-integration keys and scopes |

## Common Mistakes

- Gating the UI behind an access wrapper but leaving the backing service publicly reachable; the API is then reachable without going through the UI.
- Treating an API key shipped in client code as a secret.
- Verifying a token's signature but not its audience, issuer or expiry.
- Authenticating users but never checking ownership of the requested resource (IDOR).
- Relying on a preview or staging URL staying unguessable.
- Sharing a single API key across callers, so one leak forces rotating all of them.
