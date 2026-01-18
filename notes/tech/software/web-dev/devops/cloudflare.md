# Cloudflare

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

# Workers
npm i -D wrangler @cloudflare/kv-asset-handler
npx wrangler deploy --config [path to wrangler.toml file]
npx wrangler delete [name of worker]
```

### R2

- Configure access tokens to access desired buckets.

```
wrangler r2 bucket create [YOUR_BUCKET_NAME]
wrangler r2 bucket list
wrangler r2 bucket delete [BUCKET_TO_DELETE]
```

## References

- [Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Deploy an existing static site](https://developers.cloudflare.com/workers/configuration/sites/start-from-existing/)
- [Github Actions](https://developers.cloudflare.com/workers/wrangler/ci-cd)
- [Python and R2](https://developers.cloudflare.com/r2/examples/aws/boto3/)
- [R2 Bucket CLI](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/#5-access-your-r2-bucket-from-your-worker)
- [Subdomain Redirect Rules](https://www.youtube.com/watch?v=Bw5LUF0x7wo)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
  - Storage 10 GB / month
  - Class A Operations 1 million requests / month
  - Class B Operations 10 million requests / month
