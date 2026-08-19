# Cloud Services

Comparison of managed/cloud hosting solutions by category, to guide picking a destination for new apps/services.

## Table of Contents

- [Backend / API Hosting](#backend--api-hosting)
- [Frontend / Static Hosting](#frontend--static-hosting)
- [Database Hosting](#database-hosting)
- [CDN / Edge / DNS](#cdn--edge--dns)
- [Object Storage](#object-storage)
- [CI/CD](#cicd)
- [Secrets Management](#secrets-management)
- [IaC State Backend](#iac-state-backend)
- [Container Registry](#container-registry)
- [VM / Compute](#vm--compute)
- [CMS](#cms)
- [Email](#email)
- [APIs / Data](#apis--data)
- [Security / Access](#security--access)

## Backend / API Hosting

| Name               | Usage                                                       | Free Tier                                      | When to Use                                                                                |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Fly.io             | Deploys Docker containers as Firecracker VMs close to users | Limited free allowance, no perpetual free tier | Long-running containerized services needing WebSockets or a persistent process             |
| Render             | Docker/native runtime PaaS, managed Postgres/Redis add-ons  | Free web services (spin down on idle)          | Simple API + managed DB in one place without touching Terraform                            |
| Cloudflare Workers | V8 isolate serverless functions, runs on Cloudflare's edge  | Generous free tier (100k req/day)              | Latency-sensitive, stateless, short-lived request handlers; not for long-lived connections |
| Google Cloud Run   | Serverless containers, scale to zero                        | Free tier (2M req/month)                       | Need GCP-native integration (Secret Manager, IAM) alongside container flexibility          |

## Frontend / Static Hosting

| Name             | Usage                                                                          | Free Tier                                        | When to Use                                                                                  |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Cloudflare Pages | Static site hosting + Pages Functions, deployed via wrangler                   | Unlimited sites/requests, generous build minutes | Static SPA hosting (Vite/React, etc.) needing fast global CDN delivery                       |
| GitHub Pages     | Static hosting straight from a repo/branch                                     | Free for public repos                            | Simple static hosting, no build infra needed beyond Actions                                  |
| Vercel           | Git-integrated hosting with first-class Next.js support (ISR, edge middleware) | Free hobby tier, usage caps                      | Next.js apps needing SSR/ISR — Cloudflare Pages doesn't run Next.js server features natively |
| Netlify          | Static hosting + serverless functions, similar to Cloudflare Pages             | Free tier with build-minute/bandwidth caps       | Alternative to Cloudflare Pages if forms/identity add-ons are needed                         |

## Database Hosting

| Name               | Usage                                           | Free Tier                                     | When to Use                                                                          |
| ------------------ | ----------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| Supabase           | Managed Postgres + auth/storage/realtime on top | Free tier (500MB DB, pauses after inactivity) | Managed auth/realtime without standing up own infra, especially on a serverless host |
| Neon / PlanetScale | Serverless/branchable managed Postgres/MySQL    | Free tier (usage-capped)                      | Serverless-first app needing DB branching per PR                                     |
| MongoDB Atlas      | Managed MongoDB                                 | Free tier (M0, 512MB)                         | App needing managed MongoDB without running it on own infra                          |

## CDN / Edge / DNS

| Name       | Usage                                              | Free Tier                                        | When to Use                                                              |
| ---------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| Cloudflare | DNS, CDN, Access (zero-trust auth), Pages, Workers | Free tier covers DNS/CDN/Access for personal use | Default edge layer for public-facing domains and internal access control |

## Object Storage

| Name                 | Usage                                        | Free Tier                   | When to Use                                                         |
| -------------------- | -------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| Cloudflare R2        | S3-compatible object storage, no egress fees | 10GB free storage           | Default for app file storage — avoids AWS egress costs              |
| Google Cloud Storage | GCS buckets, used alongside other GCP infra  | 5GB free (always-free tier) | Storage tied to GCP-native workflows (e.g. Terraform state, images) |

## CI/CD

| Name           | Usage                                                                        | Free Tier                                         | When to Use                                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| GitHub Actions | CI/CD runners triggered on push/PR/schedule, deploys to hosting destinations | 2,000 free minutes/month (public repos unlimited) | Default when GitHub is already the repo host, no separate CI vendor |

## Secrets Management

| Name                  | Usage                            | Free Tier                                           | When to Use                                                  |
| --------------------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Google Secret Manager | Managed secrets store, IAM-gated | Free tier (6 active versions, 10k access ops/month) | Root of trust for bootstrap secrets (e.g. Vault unseal keys) |

## IaC State Backend

| Name                            | Usage                                          | Free Tier                 | When to Use                                                             |
| ------------------------------- | ---------------------------------------------- | ------------------------- | ----------------------------------------------------------------------- |
| HCP Terraform (Terraform Cloud) | Remote Terraform state storage + run execution | Free tier (up to 5 users) | Default remote backend for Terraform — avoids local state drift/locking |

## Container Registry

| Name                     | Usage                         | Free Tier                                              | When to Use                                                                  |
| ------------------------ | ----------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Docker Hub               | Public/private image registry | Free tier (unlimited public repos, rate-limited pulls) | Default registry for self-hosted images pulled by an updater like Watchtower |
| Google Artifact Registry | GCP-native image registry     | Free tier (0.5GB storage)                              | GCP-native workflows needing tighter IAM integration than Docker Hub         |

## VM / Compute

| Name                                   | Usage                                                            | Free Tier                                       | When to Use                                                                 |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Google Cloud Platform (Compute Engine) | VMs for self-hosted services (Git server, dev environment, etc.) | Always-free e2-micro instance (limited regions) | Default compute for anything needing a persistent, fully-controlled VM      |
| Oracle Cloud Infrastructure            | VMs, alternate compute provider                                  | Always-free tier (Ampere A1 + 2 AMD micro VMs)  | Extra always-free capacity — offloads services from GCP's smaller free tier |

## CMS

| Name   | Usage                                  | Free Tier                           | When to Use                                                      |
| ------ | -------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Sanity | Hosted structured-content CMS + Studio | Free tier (1 project, usage-capped) | Default for structured content needs — avoids self-hosting a CMS |

## Email

| Name     | Usage                                       | Free Tier                                                                                                           | When to Use                                                                                 |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Resend   | Transactional email API (REST + SMTP relay) | 3,000 emails/month, capped at 100/day; 1 domain; 1k contacts/month                                                  | Default for transactional email sending                                                     |
| SendGrid | Transactional/marketing email API (Twilio)  | 100 emails/day (~3k/mo), 100 marketing contacts — as of 2025 gated behind a 60-day trial, not a perpetual free tier | Alternative if built-in marketing-campaign tooling is needed; free tier no longer perpetual |

## APIs / Data

| Name                | Usage                                                        | Free Tier                                                                                    | When to Use                                                                                      |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Google Calendar API | Calendar read/write, via per-user OAuth or a service account | No billing tied to usage; default quota 1,000,000 queries/day/project, 500 queries/100s/user | Reading/writing calendar events programmatically, including calendars owned by a service account |

## Security / Access

| Name              | Usage                                                                                                   | Free Tier                                   | When to Use                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Cloudflare Access | Zero-trust reverse-proxy auth in front of Cloudflare-proxied origins (identity login or service tokens) | Free for up to 50 users                     | Gating web UIs on a public hostname without exposing them directly                     |
| Cloudflare Tunnel | Outbound-only tunnel exposing a local service publicly without opening inbound ports                    | Free (self-hosted `cloudflared` daemon)     | Exposing a VM-local service behind Cloudflare Access without a public IP/firewall rule |
| Tailscale         | Mesh VPN (WireGuard-based) with automatic peer discovery/ACLs, hosted control plane                     | Free tier (up to 100 devices, personal use) | Ad hoc mesh access across many devices/services without managing keys/routes by hand   |
