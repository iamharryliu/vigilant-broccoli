# Cloudflare Workers

Edge Workers that front the projects-hub build and the Nx remote cache.

## Table of Contents

- [Stack](#stack)

## Stack

- Language - JavaScript
- Cloud providers
  - Cloudflare
- Services
  - `nx-cache` - Nx self-hosted remote cache in front of an R2 bucket
  - `status-proxy` - pass-through serving the projects-hub build under the status and career hostnames
