# Render service pattern

Provision and deploy llm-service staging on Render alongside Fly using the shared Docker Hub image.

## Table of Contents

- [Pilot scope](#pilot-scope)
- [Targets](#targets)
- [Setup](#setup)
- [CI deployment](#ci-deployment)
- [Free Tier](#free-tier)

## Pilot scope

`llm-service` staging has a Render deploy path for comparison and fallback; Fly stays the live deploy. Render reuses the Docker Hub image pushed by `deploy-container`. The pilot's `onrender.com` URL is not registered in Upptime or pages-index.

## Targets

| Target | Runs |
| --- | --- |
| `deploy:render` | Builds/pushes the shared image, resolves or creates the service, syncs Vault environment variables and waits for deployment to reach `live`. A newly created service's initial deploy is reused; existing services receive a commit-tagged image deploy. |
| `deploy:render:secrets` | Builds/pushes the image before resolving or creating the service and syncing environment variables. Creating a missing service also starts its initial deploy. Does not wait for deployment completion. |

Both targets depend on `lint` and `deploy-container`. The underlying commands are `npx tsx scripts/deploy-render.ts <deploy|secrets> llm-service staging`; append `--dry-run` to perform discovery and show planned actions without creating credentials/services, updating secrets or deploying. Dry runs still need Vault access and a valid Render API key.

## Setup

1. Store `RENDER_API_KEY` in Vault `kv/data/secrets`. Local commands can override it through the environment. The existing `DOCKERHUB_TOKEN` supplies the Docker Hub pull credential when one needs to be created; it is read from the environment or Vault.
2. If the API key can access more than one workspace, set the non-secret repository variable `RENDER_OWNER_ID` to the intended workspace ID (or export it for local commands). With exactly one accessible workspace, the script discovers it automatically; zero or multiple workspaces fail before any writes.
3. Enable the repository variable `RENDER_LLM_STAGING_ENABLED=true` to include Render in staging CI. No new GitHub Actions secret is required.

The script resolves `staging-llm-service` by exact name and owner, with paginated service lookup. If missing, it reuses or creates the workspace's `vb-render-dockerhub` registry credential using the existing Docker Hub account/token, then creates an image-backed web service in Frankfurt on the explicit `free` plan. Names, plan, region and health-check path live in `scripts/render-services.config.ts`; no generated service ID is committed. Existing services must be web services; a conflicting registry credential name/account fails rather than being overwritten. Registry credentials are reused without rotating their stored token; rotate that credential in Render when the Docker Hub token changes.

Creation includes the commit-tagged image and Vault-backed app environment variables in one request, so its initial deployment has its secrets immediately. `SHARED_APP_TOKEN` is required before provisioning this public endpoint. The image already binds to `0.0.0.0` and sets its port. Health checks use `/` without making LLM requests. Later secret syncs replace the complete environment variable set, including dashboard additions, as in the Fly flow.

## CI deployment

With the variable enabled, `deploy.yml` includes `deploy:render` in the same Nx invocation as staging `deploy`, using the existing affected project selection (or all deployable projects for a manual/full deploy). `manual-deploy-app` does the same for `llm-service` staging. Nx shares `deploy-container` between both targets, building and pushing the commit-tagged image once. Production and demo runs keep their existing targets.

The two staging paths share a `render-llm-staging` job concurrency group with cancellation disabled. Automatic staging workflows also stop cancelling in-progress runs when the pilot is enabled, so provisioning is not interrupted. Local invocations do not participate in GitHub concurrency: do not run initial provisioning locally and in CI at the same time.

Both workflows export the Vault token and Cloudflare Access credentials, and pass the optional `RENDER_OWNER_ID` variable. Render failures fail the deployment job and appear in its existing summary. Disable `RENDER_LLM_STAGING_ENABLED` to return CI to Fly-only deployment; this does not delete existing Render resources.

## Free Tier

[Render's free web services](https://render.com/docs/free) share 750 instance-hours per workspace per calendar month and spin down after 15 minutes without inbound traffic. The provisioner explicitly requests the `free` plan; it does not fall back to paid compute if provisioning is rejected. The local-manager card only polls the management API and creates no services.
