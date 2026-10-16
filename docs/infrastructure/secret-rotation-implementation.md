# Secret Rotation — Implementation Roadmap

## Pattern

Every rotator follows **mint → verify → store → revoke**: mint the new credential at source, verify it read-only, write it to Vault (`vault kv patch`), and only then revoke predecessors. Vault never holds a dead credential, and any failure aborts with the old credential still valid. Propagation is two-track: CI/workflows read Vault fresh per run (free), running apps get secrets at deploy time — which is why `secret-rotation:all` dispatches the `rotate-secrets` workflow (full redeploy).

## Keys still to automate

### Cloudflare — `CLOUDFLARE_API_TOKEN_VB_DEPLOY_NX_APPS`, `CLOUDFLARE_R2_ACCESS_KEY_ID` / `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

- Wrangler cannot manage API tokens (no command, and its OAuth session lacks the scope) — only the dashboard or REST API, and rolling via API requires a credential with _API Tokens: Edit_.
- **Decision pending**: dedicated roller token in Vault (fully unattended, but a mint-capable credential at rest) vs **paste-assisted script** (preferred: script opens the dashboard token pages, you roll/create and paste values, script verifies via the token verify endpoint, patches Vault, re-runs `pnpm tf:post-apply`, dispatches deploy).
- The deploy token has a second reader: `tf:post-apply` mirrors it (with `CLOUDFLARE_ACCOUNT_ID`) from `kv/data/secrets` into `kv/data/deploy-preview` for `deploy-preview.yml`. Until post-apply re-runs, branch previews hold the old token, so it is no longer safe to roll in place — create the new token, patch Vault, re-mirror, then revoke the old one.
- R2 facts: access key ID = token ID; secret access key = SHA-256 of the token value; the dashboard shows both on creation. R2 should be two-phase (create new token, delete old after redeploy) because `bucket-service`/`hearth` hold the creds until deployed.

### `UPPTIME_SYNC_GH_APP_PRIVATE_KEY` — guided rotation (not yet built)

GitHub App private keys can only be generated in the App settings UI (downloaded as a `.pem`), so this is a guided manual rotation rather than an unattended one. A `upptime:sync:store-key` script used to cover the store step; it was removed pending a guided rotator. What that rotator needs to do:

1. **Mint** — open `https://github.com/settings/apps/<app-slug>` for sync App `5202397` and have the operator generate a new private key and pass the downloaded `.pem` path.
2. **Validate** — `openssl pkey -in "$KEY_FILE" -noout` so a truncated or wrong download fails before anything is written.
3. **Store** — base64-encode to one line (`base64 < "$KEY_FILE" | tr -d '\n'`) and write it to its own path, not `kv/secrets`: `vault kv put kv/upptime-sync UPPTIME_SYNC_GH_APP_PRIVATE_KEY=<b64>`. `kv put` is fine because the path holds only this field. The removed script fetched `VB_VM_VAULT_ROOT_TOKEN` from GCP Secret Manager and ran the write on the Vault VM via `gcloud_ssh_secrets` (`infrastructure/lib/ssh-secrets.sh`, with `infrastructure/config.sh` for the VM name and zone), passing the token and key as SSH-side env vars with `VAULT_ADDR=https://127.0.0.1:8200` and `VAULT_CACERT=/etc/vault/tls/vault.crt`, so it needed no local WireGuard session; a WireGuard `vault kv put` works equally well. `mint-github-app-token.sh` accepts raw or base64 PEM, but keep base64 for consistency with the other stored keys.
4. **Verify** — `gh workflow run ci-sync-upptime --ref main` and wait for `ci-sync-upptime` to succeed; it mints an installation token with the new key, so success proves the key works.
5. **Revoke** — delete the previous key in the App settings only after the sync passes, then refresh the Bitwarden backup (`projects/nx-workspace/scripts/shell/backup-secrets.sh`).

Nothing to redeploy: only `ci-sync-upptime.yml` reads the key, fresh per run. The removed script is a starting point: `git log --diff-filter=D -1 -- infrastructure/upptime/store-sync-key.sh` finds the removing commit, and `git show <commit>^:infrastructure/upptime/store-sync-key.sh` prints it.

## Manual only (no mint API)

Rotate at source, then `vault kv patch` (or `gh secret set`):

- `VERCEL_TOKEN` — no public API to mint tokens
- `TF_GITHUB_TOKEN` — PATs can't mint PATs (a GitHub App would automate this, but is a bigger project)
- `SANITY_AUTH_TOKEN`
- `DOCKERHUB_TOKEN` — mint API requires password auth; storing the password is worse than manual
- `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET`, `RECAPTCHA_V3_SECRET_KEY`
- LLM keys — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GROK_API_KEY`, `ELEVENLABS_API_KEY`
- `AGENT_CODEX_ACCESS_TOKEN` — rotate in ChatGPT workspace settings, then `vault kv patch kv/secrets AGENT_CODEX_ACCESS_TOKEN=...`; no redeploy, the agent sandbox reads Vault per run
- `UPPTIME_SYNC_GH_APP_PRIVATE_KEY` — until the guided rotator above exists, follow its steps by hand
- Resilio secrets

Deliberately excluded from automation: `MONGODB_URI`, `SUPABASE_DB_PASSWORD` / `SUPABASE_SECRET_KEY` — rotating via their management APIs means storing a credential more powerful than the one being rotated.
Suggestion: have `secret-rotation:all` print this checklist (with dashboard URLs) as its final output, so the command's output is the complete semi-annual procedure.
