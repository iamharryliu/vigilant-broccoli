# Cloudflare

# Commands

```
npm install wrangler --save-dev

# Pages
npx wrangler pages dev [path to app dist]
npx wrangler pages deploy [path to app dist]
npx wrangler pages deploy [path to app dist] --project name [project-name]
npx wrangler pages project delete [project-name]
npx wrangler pages project list

code node_modules/.cache/wrangler/pages.json

# Workers
npm i -D wrangler @cloudflare/kv-asset-handler
npx wrangler deploy --config [path to wrangler.toml file]
npx wrangler delete [name of worker]
```

## References

- [Wrangler CLI](https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/workers-and-pages/create-with-cli)
- [Deploy an existing static site](https://developers.cloudflare.com/workers/configuration/sites/start-from-existing/)
- [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/#deploy)
