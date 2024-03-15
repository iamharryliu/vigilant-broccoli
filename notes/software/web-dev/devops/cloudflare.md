# Cloudflare

## Commands

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

### R2

```
wrangler r2 bucket create [YOUR_BUCKET_NAME]
wrangler r2 bucket list
wrangler r2 bucket delete [BUCKET_TO_DELETE]
```

## References

- [Deploy an existing static site](https://developers.cloudflare.com/workers/configuration/sites/start-from-existing/)
- [Github Actions](https://developers.cloudflare.com/workers/wrangler/ci-cd)
- [Python and R2](https://developers.cloudflare.com/r2/examples/aws/boto3/)
- [R2 Bucket CLI](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/#5-access-your-r2-bucket-from-your-worker)
