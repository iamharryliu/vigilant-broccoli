# Secret Rotation — Implementation Roadmap

## Pattern

Every rotator follows **mint → verify → store → revoke**: mint the new credential at source, verify it read-only, write it to Vault (`vault kv patch`), and only then revoke predecessors. Vault never holds a dead credential, and any failure aborts with the old credential still valid. Propagation is two-track: CI/workflows read Vault fresh per run (free), running apps get secrets at deploy time — which is why `secret-rotation:all` ends by dispatching the `rotate-secrets` workflow (full redeploy).

## Keys still to automate

### Cloudflare — `CLOUDFLARE_API_TOKEN_VB_DEPLOY_NX_APPS`, `CLOUDFLARE_R2_ACCESS_KEY_ID` / `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

- Wrangler cannot manage API tokens (no command, and its OAuth session lacks the scope) — only the dashboard or REST API, and rolling via API requires a credential with _API Tokens: Edit_.
- **Decision pending**: dedicated roller token in Vault (fully unattended, but a mint-capable credential at rest) vs **paste-assisted script** (preferred: script opens the dashboard token pages, you roll/create and paste values, script verifies via the token verify endpoint, patches Vault, dispatches deploy).
- R2 facts: access key ID = token ID; secret access key = SHA-256 of the token value; the dashboard shows both on creation. Deploy token can be rolled in place (instant cutover is fine — CI-only consumer). R2 should be two-phase (create new token, delete old after redeploy) because `bucket-service`/`hearth` hold the creds until deployed.

### `OCI_CONFIG` / `OCI_PRIVATE_KEY` — self-succession

`openssl genrsa` → `oci iam user api-key upload` (authed by the current key) → update fingerprint + key in Vault → verify `oci iam user get` → delete old key. OCI allows 3 keys per user, so the overlap window is safe.

## Manual only (no mint API)

Rotate at source, then `vault kv patch` (or `gh secret set`):

- `VERCEL_TOKEN` — no public API to mint tokens
- `GH_PAT` / `TF_GITHUB_TOKEN` — PATs can't mint PATs (a GitHub App would automate this, but is a bigger project)
- `SANITY_AUTH_TOKEN`
- `DOCKERHUB_TOKEN` — mint API requires password auth; storing the password is worse than manual
- `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET`, `RECAPTCHA_V3_SECRET_KEY`
- LLM keys — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GROK_API_KEY`, `ELEVENLABS_API_KEY`
- Resilio secrets

Deliberately excluded from automation: `MONGODB_URI`, `SUPABASE_DB_URL` / `SUPABASE_SECRET_KEY` — rotating via their management APIs means storing a credential more powerful than the one being rotated.
Suggestion: have `secret-rotation:all` print this checklist (with dashboard URLs) as its final output, so the command's output is the complete semi-annual procedure.
