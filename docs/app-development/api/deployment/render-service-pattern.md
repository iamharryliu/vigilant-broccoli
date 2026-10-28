# Render service pattern

Deploy llm-service staging to Render alongside Fly using the shared Docker Hub image.

## Table of Contents

- [Pilot scope](#pilot-scope)
- [Targets](#targets)
- [Setup](#setup)
- [CI deployment](#ci-deployment)

## Pilot scope

`llm-service` staging also has a Render deploy path for comparison and fallback; Fly stays the live deploy and its targets are untouched. It reuses the Docker Hub image `deploy-container` pushes, so there is no second build. Render is not a public URL change: an `onrender.com` URL is not registered in Upptime or pages-index.

## Targets

| Target | Runs |
| --- | --- |
| `deploy:render` | `scripts/deploy-render.ts deploy llm-service staging`: `POST /v1/services/{id}/deploys` with `iamharryliu/llm-service:${COMMIT_SHA:-latest}`, then polls until `live` or failed; depends on `lint`, `deploy-container` and `deploy:render:secrets` |
| `deploy:render:secrets` | `scripts/deploy-render.ts secrets llm-service staging`: `PUT /v1/services/{id}/env-vars` with the `.env.example` keys, values from Vault `kv/data/secrets` (replaces the service's whole env var set) |

Both accept `--dry-run` when run directly. `RENDER_API_KEY` comes from Vault, or the env var for local runs. Service ids are non-secret and live in `scripts/render-services.config.ts`.

## Setup

1. Create a Docker-image web service in the Render dashboard from `iamharryliu/llm-service` and copy its `srv-...` id into `render-services.config.ts`.
2. Mint a Render API key (Account Settings → API Keys) and store it in Vault `kv/data/secrets` as `RENDER_API_KEY`.
3. The image is private, so add a registry credential under Account Settings → Registry Credentials: Docker Hub, username `iamharryliu`, password the existing `DOCKERHUB_TOKEN` (a read-capable token is enough), then select it on the service. No new secret is introduced.
4. After the service id and credentials are configured, set the GitHub Actions repository variable `RENDER_LLM_STAGING_ENABLED` to `true`. Until then CI deploys only to Fly.

## CI deployment

With the variable enabled, `deploy.yml` includes `deploy:render` in the same Nx invocation as staging `deploy`, using the existing affected project selection (or all deployable projects for a manual/full deploy). `manual-deploy-app` does the same for `llm-service` staging. Nx shares the `deploy-container` dependency between both targets, building and pushing the commit-tagged image once. Production and demo runs keep their existing targets. Both workflows already export the Vault token and Cloudflare Access credentials; the Render script reads `RENDER_API_KEY` from Vault without a new GitHub secret. Render failures fail the deployment job and appear in its existing summary. Disable the variable to return CI to Fly-only deployment.
