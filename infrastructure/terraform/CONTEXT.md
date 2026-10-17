# Agent Context — infrastructure/terraform

Never change Terraform-managed configuration in a provider dashboard or the GitHub UI — the next apply reverts it. Where state lives, why applies stay local, and how `cron-terraform-drift` detects divergence are in [terraform.md](../../docs/ci/terraform.md); `main`'s ruleset and its bypass actors are in [github-repo-protection.md](../../docs/infrastructure/github-repo-protection.md).

## Table of Contents

- [Nuances](#nuances)
  - [A partial `observability` block on `cloudflare_workers_script` replans forever](#a-partial-observability-block-on-cloudflare_workers_script-replans-forever)
  - [A replaced OCI VM dies on `container name "/watchtower" is already in use`](#a-replaced-oci-vm-dies-on-container-name-watchtower-is-already-in-use)
  - [A new OCI API key returns 401 for ~5 minutes while reporting `ACTIVE`](#a-new-oci-api-key-returns-401-for-5-minutes-while-reporting-active)
  - [Pinning a Supabase-advanced key in a `supabase_settings` JSON attribute fails with `inconsistent result after apply`](#pinning-a-supabase-advanced-key-in-a-supabase_settings-json-attribute-fails-with-inconsistent-result-after-apply)
  - [`vault:set-secrets` rewrites every secret through an `eval`](#vaultset-secrets-rewrites-every-secret-through-an-eval)

## Nuances

### A partial `observability` block on `cloudflare_workers_script` replans forever

Cloudflare provider 5.x treats omitted `observability` fields as null, while the API returns defaults. A partial object therefore produces a perpetual diff and re-uploads the Worker on each apply. Specify `head_sampling_rate`, `logs` and `traces` fully, matching the API defaults as in `cloudflare-nx-cache.tf`; apply the same pattern to new Worker resources.

### A replaced OCI VM dies on `container name "/watchtower" is already in use`

Any change to `oci_core_instance.rabbitmq`'s `metadata.user_data` forces replacement, which puts `post-apply` and a fresh cloud-init run on the same clock. `packer/scripts/sync-socket-server-token.sh` must wait for cloud-init to finish (`done` or `degraded done`) before running Compose. The compose file and Docker daemon exist earlier; starting then races cloud-init for explicit container names (the clash can name `caddy` or `socket-server-socketio` instead of `/watchtower`) and can leave Watchtower running with literal `DOCKER_API_VERSION_PLACEHOLDER`, silently disabling updates.

After a replacement failure, check `cloud-init status --long`, `grep DOCKER_API_VERSION /opt/socket-server/docker-compose.yml`, then `sudo docker inspect watchtower --format '{{.Config.Env}}'`. Once cloud-init is done, recover with `sudo docker compose -f /opt/socket-server/docker-compose.yml up -d --force-recreate`, then rerun `pnpm tf:post-apply`.

### A new OCI API key returns 401 for ~5 minutes while reporting `ACTIVE`

New keys report `ACTIVE` before signed requests are accepted; propagation took about five minutes in this tenancy. Poll a signed request, not lifecycle state. `packer/scripts/rotate-oci-api-key.sh` waits 180 seconds, then retries for another 450. Retry verification after propagation before diagnosing a signing bug.

### Pinning a Supabase-advanced key in a `supabase_settings` JSON attribute fails with `inconsistent result after apply`

The provider refreshes only keys present in the configured JSON (`storage`, `auth`, etc.), so a key Supabase changes on its own, such as `storage.migrationVersion`, conflicts once pinned and needs a manual bump after every service migration. Omit such keys; omitted keys are never read back. If an apply reports this error for a key you did set, remove it rather than copying the live value from the error.

### `vault:set-secrets` rewrites every secret through an `eval`

`packer/scripts/run-vault-set-secrets.sh` does a whole-map `vault kv put`, rewriting every key in `~/Desktop/vault-secrets.json`, and builds the command by `eval`-ing a `jq`-assembled string (`eval "vault kv put kv/secrets $KV_ARGS"`). Values holding a newline, double quote, backslash or `$` do not survive. Five of sixty-nine secrets are affected: `OCI_CONFIG`, `OCI_PRIVATE_KEY` and `PROFILE_REPO_DEPLOY_KEY` carry newlines; `EMAIL_SERVICE_API_KEY` and `SUPABASE_DB_PASSWORD` carry shell metacharacters. The save-local → edit → set-secrets flow can therefore corrupt `SUPABASE_DB_PASSWORD` and break migrations while reporting success. Check first:

```bash
jq -r 'to_entries | map(select(.value | tostring | test("[\"\\\\`$]") or contains("\n"))) | .[].key' ~/Desktop/vault-secrets.json
```

To add or rotate one key, patch it: `printf %s "$VALUE" | infrastructure/jellyfin-pi/save-vault-secret.sh MY_KEY` reads stdin and lets `jq` escape. `kv put` stays correct for a deliberate full rewrite.
