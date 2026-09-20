# Cloudflare

## Table of Contents

- [Commands](#commands)
- [Free Tier](#free-tier)
- [References](#references)

## Commands

```
npm install wrangler --save-dev

wrangler --version
wrangler login
wrangler whoami
wrangler logout

# Workers
npm i -D wrangler @cloudflare/kv-asset-handler
npx wrangler deploy --config [path to wrangler.toml file]
npx wrangler delete [name of worker]
```

## Free Tier

- Proxied DNS records, CDN, and TLS: free, unlimited zones.
- Tunnels (`cloudflared`): free, no bandwidth cap; an outbound-only tunnel replaces every inbound firewall rule on the origin.
- Zero Trust Access: free for up to 50 users (email OTP, identity providers, service tokens included) — enough to gate every self-hosted admin UI behind an owner-email policy.
- Workers: 100k requests/day; Pages: 500 builds/month, unlimited bandwidth.

## References

- [Cloudflare Pages](./cloudflare-pages.md) - Deploy static sites
- [R2](./r2.md) - Object storage
- [Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Github Actions](https://developers.cloudflare.com/workers/wrangler/ci-cd)
- [Subdomain Redirect Rules](https://www.youtube.com/watch?v=Bw5LUF0x7wo)
