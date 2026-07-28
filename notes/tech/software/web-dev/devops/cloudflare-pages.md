# Cloudflare Pages

Deploy static sites with Wrangler. See [Cloudflare](./cloudflare.md) for the broader Wrangler / Workers / R2 context.

## Table of Contents

- [Commands](#commands)
- [References](#references)

## Commands

```
npm install wrangler --save-dev

# Development
npx wrangler pages dev [path_to_app_dist]

# Deployment
# New project.
npx wrangler pages project create PROJECT_NAME
CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy [dist] --project-name PROJECT_NAME
npx wrangler pages deploy DIST_PATH
# Existing project
npx wrangler pages deploy [dist] --project-name PROJECT_NAME
npx wrangler pages project delete PROJECT_NAME
npx wrangler pages project list


code node_modules/.cache/wrangler/pages.json
```

## References

- [Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Deploy an existing static site](https://developers.cloudflare.com/workers/configuration/sites/start-from-existing/)
