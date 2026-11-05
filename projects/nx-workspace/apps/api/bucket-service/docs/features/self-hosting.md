# Self-Hosting

Run the bucket-service object storage proxy from the `iamharryliu/bucket-service` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Providers](#providers)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64`, listens on port 3000 and runs as a non-root user. This keeps files on the local provider in a volume; set the variables of the providers you use (see [Providers](#providers)).

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e SHARED_APP_TOKEN=<token> \
  -e BUCKET_PATH=/data \
  -v bucket-data:/data \
  iamharryliu/bucket-service:latest
```

Call it with `x-api-key: <token>`, for example `GET /api/bucket?provider=local`. `GET /` and the API reference at `/docs` need no key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | `aws-s3` | S3 credentials and bucket. |
| `AWS_REGION` | No | S3 region; defaults to `us-east-1`. |
| `BUCKET_PATH` | No | Directory for the `local` provider; defaults to `storage-buckets` under the working directory. |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_BUCKET_NAME`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | `cloudflare-r2` | R2 account, bucket and S3-compatible credentials. |
| `GOOGLE_GCS_BUCKET_NAME`, `GOOGLE_GCS_PROJECT_ID` | `gcs` | Google Cloud Storage project and bucket. |
| `GOOGLE_GCS_SA_CREDENTIALS` | No | Base64-encoded service-account JSON; unset, the Google client falls back to its default credentials. |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `SHARED_APP_TOKEN` | Yes | API key every `/api/*` request must send in the `x-api-key` header. |

## Providers

Each request names its backend with the `provider` query parameter (or body field): `local`, `cloudflare-r2`, `aws-s3` or `gcs`. A provider is built on first use from its variables, so only the ones you call need configuring. An optional `bucketName` parameter overrides the configured bucket; for `local` it is the directory path.

## Nuances

- With `SHARED_APP_TOKEN` unset, every `/api/*` request, `/api/__ping` included, returns 500 `Unauthorized`.
- Without a volume on `BUCKET_PATH` the `local` provider writes inside the container, and the files are lost with it.
- CORS allows only `localhost` and `127.0.0.1` origins on ports 1337, 3000, 4200 and 5173. Other browser origins are blocked; server-to-server calls are unaffected.
- Request bodies are capped at 10 MB, except `POST /api/bucket/stream`, which allows 100 MB.
