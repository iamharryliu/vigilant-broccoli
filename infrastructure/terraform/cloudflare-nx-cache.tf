# Nx self-hosted remote cache storage. The Nx workspace (projects/nx-workspace)
# caches task outputs (build/lint/test) in this R2 bucket via the `s3` config in
# nx.json, so CI runners reuse each other's results instead of rebuilding from
# cold every run. R2's S3-compatible API is free-tier friendly (10 GB storage,
# 1M Class-A + 10M Class-B ops/month) — the lifecycle rule below keeps storage
# under the free ceiling by expiring cache entries.
#
# The S3 access-key pair the cache authenticates with is NOT minted here: R2 S3
# tokens are created manually via the dashboard and stored in Vault, matching the
# existing CLOUDFLARE_R2_ACCESS_KEY_ID pattern (see docs/infrastructure/
# secret-management.md). The cloudflare_api_token resource cannot yet scope a
# token to a single R2 bucket cleanly (provider issue #6626), so a hand-created,
# bucket-scoped "Object Read & Write" R2 token is both simpler and tighter. Store
# its keys in Vault as NX_CACHE_R2_ACCESS_KEY_ID / NX_CACHE_R2_SECRET_ACCESS_KEY.

resource "cloudflare_r2_bucket" "nx_cache" {
  account_id = var.cloudflare_account_id
  name       = var.nx_cache_r2_bucket
  location   = "ENAM"
}

# Free-tier guard: expire cached task artifacts so the bucket never accumulates
# past R2's 10 GB free allotment. Nx re-populates any evicted entry on the next
# run (a cache miss just rebuilds), so a short TTL trades a little compute for
# bounded storage. max_age is in seconds. NOTE: verify the applied value in the
# dashboard — provider issue #5186 has reported max_age silently deploying as 0
# (which would expire objects immediately). Tune var.nx_cache_r2_ttl_seconds.
resource "cloudflare_r2_bucket_lifecycle" "nx_cache" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.nx_cache.name

  rules = [{
    id      = "expire-nx-cache-entries"
    enabled = true
    conditions = {
      prefix = ""
    }
    delete_objects_transition = {
      condition = {
        type    = "Age"
        max_age = var.nx_cache_r2_ttl_seconds
      }
    }
  }]
}
