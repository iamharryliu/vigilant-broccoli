# Cloudflare

## Table of Contents

- [Commands](#commands)
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

## References

- [Cloudflare Pages](./cloudflare-pages.md) - Deploy static sites
- [R2](./r2.md) - Object storage
- [Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Github Actions](https://developers.cloudflare.com/workers/wrangler/ci-cd)
- [Subdomain Redirect Rules](https://www.youtube.com/watch?v=Bw5LUF0x7wo)
