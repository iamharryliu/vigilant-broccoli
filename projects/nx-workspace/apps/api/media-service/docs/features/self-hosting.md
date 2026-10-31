# Self-Hosting

Run the media-service image and file processor from the `iamharryliu/media-service` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64`, listens on port 3000 and runs as a non-root user.

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e SHARED_APP_TOKEN=<token> \
  iamharryliu/media-service:latest
```

Send a multipart upload with a `file` part and `x-api-key: <token>` to `POST /api/receipts/image`, `/api/receipts/llm-image`, `/api/where-is/image`, `/api/where-is/llm-image` or `/api/docs/file`. `GET /` and the API reference at `/docs` need no key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `SHARED_APP_TOKEN` | Yes | API key every `/api/*` request must send in the `x-api-key` header. |

## Nuances

- With `SHARED_APP_TOKEN` unset, every `/api/*` request returns 500 `Unauthorized`.
- Uploads are capped at 20 MB; each endpoint also enforces its own limit (10 MB for images, 20 MB for documents).
- CORS has no allowed origins, so browsers on any origin are blocked; server-to-server calls are unaffected.
