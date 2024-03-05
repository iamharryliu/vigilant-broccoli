# Cloudflare

# Commands

```
npm install wrangler --save-dev

# Development
npx wrangler pages dev [path_to_app_dist]

# Deployment
CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ID npx wrangler pages deploy [path_to_app_dist]
# New project.
npx wrangler pages deploy [path_to_app_dist]
# Existing project
npx wrangler pages deploy [path_to_app_dist] --project-name [project_name]
npx wrangler pages project delete [project_name]
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
