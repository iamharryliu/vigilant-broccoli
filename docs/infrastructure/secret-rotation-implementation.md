# Secret Rotation — Implementation Roadmap

## Pattern

Every rotator follows **mint → verify → store → revoke**: mint the new credential at source, verify it read-only, write it to Vault (`vault kv patch`), and only then revoke predecessors. Vault never holds a dead credential, and any failure aborts with the old credential still valid. Propagation is two-track: CI/workflows read Vault fresh per run (free), running apps get secrets at deploy time — which is why `secret-rotation:all` ends by dispatching the `rotate-secrets` workflow (full redeploy).

## Keys still to automate

### Cloudflare — `CLOUDFLARE_API_TOKEN_VB_DEPLOY_NX_APPS`, `CLOUDFLARE_R2_ACCESS_KEY_ID` / `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

- Wrangler cannot manage API tokens (no command, and its OAuth session lacks the scope) — only the dashboard or REST API, and rolling via API requires a credential with _API Tokens: Edit_.
- **Decision pending**: dedicated roller token in Vault (fully unattended, but a mint-capable credential at rest) vs **paste-assisted script** (preferred: script opens the dashboard token pages, you roll/create and paste values, script verifies via the token verify endpoint, patches Vault, dispatches deploy).
- R2 facts: access key ID = token ID; secret access key = SHA-256 of the token value; the dashboard shows both on creation. Deploy token can be rolled in place (instant cutover is fine — CI-only consumer). R2 should be two-phase (create new token, delete old after redeploy) because `bucket-service`/`hearth` hold the creds until deployed.

### `OCI_CONFIG` / `OCI_PRIVATE_KEY` — self-succession

`pnpm secret-rotation:oci` (`packer/scripts/rotate-oci-api-key.sh`). **Not yet run end to end against the live tenancy and not yet wired into `ci-rotate-secrets.yml`** — do a local run first, then add the workflow step plus the two keys to that workflow's `vault-secrets` import list. The read paths (`GET /users/{id}`, `GET .../apiKeys`) are verified against the live API; `POST` and `DELETE` are not.

`openssl genrsa` → upload the public key (signed by the current key) → verify → patch fingerprint + key into Vault → revoke the superseded key. Three things the script exists to get right:

- **Both Vault fields are patched in one call.** `OCI_CONFIG` carries the `fingerprint=` line identifying the key in `OCI_PRIVATE_KEY`; a config left pointing at the previous fingerprint authenticates nothing.
- **It signs its own requests.** There is no `oci` CLI dependency: OCI has no token endpoint, every call is a draft-cavage HTTP signature, and `openssl` produces one directly.
- **It revokes only the key it replaced.** OCI API keys carry no name, so a key this script did not mint is indistinguishable from an operator's working credential — the same convention as the Gitea and HCP Terraform rotators, which report unmanaged tokens and leave them alone. At the 3-key-per-user cap it stops and lists the keys rather than pruning to make room.

Rotation also has to reach the operator's laptop, which the other rotators never do: Terraform's `oci` provider reads `~/.oci/config` off disk (`main.tf`'s `config_file_profile = "DEFAULT"`) and, unlike every other provider, is not fed by `load-vault-tf-env.sh` — so a rotation the local files don't know about breaks every `tf:*` command with a 401. `lib/oci-local-config.sh` refreshes them: the rotator calls it directly after patching Vault, `post-apply.sh` calls it on both of its paths, and `pnpm oci:config:sync-local` is the standalone recovery command after a rotation that ran in CI. It only ever updates an existing `~/.oci/config` and no-ops under `CI`, so it cannot plant a tenancy-admin key on a host that never had one.

Worth noting for later: the key belongs to `harryliu1995@gmail.com`, a member of `Administrators`, so it grants full control of the tenancy. OCI keys take their permissions from the user and cannot be scoped, so narrowing this means a separate IAM user in a scoped group — a bigger job than the rotator, and the same theme as TODO `21290b`/`306cc4`.

## Manual only (no mint API)

Rotate at source, then `vault kv patch` (or `gh secret set`):

- `VERCEL_TOKEN` — no public API to mint tokens
- `GH_PAT` / `TF_GITHUB_TOKEN` — PATs can't mint PATs (a GitHub App would automate this, but is a bigger project)
- `SANITY_AUTH_TOKEN`
- `DOCKERHUB_TOKEN` — mint API requires password auth; storing the password is worse than manual
- `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET`, `RECAPTCHA_V3_SECRET_KEY`
- LLM keys — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GROK_API_KEY`, `ELEVENLABS_API_KEY`
- Resilio secrets

Deliberately excluded from automation: `MONGODB_URI`, `SUPABASE_DB_PASSWORD` / `SUPABASE_SECRET_KEY` — rotating via their management APIs means storing a credential more powerful than the one being rotated.
Suggestion: have `secret-rotation:all` print this checklist (with dashboard URLs) as its final output, so the command's output is the complete semi-annual procedure.
