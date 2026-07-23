# Nx self-hosted remote build cache, backed by an S3-compatible R2 bucket.
# Consumed by the @nx/s3-cache plugin via the `s3` block in
# projects/nx-workspace/nx.json. CI deploys read and write task artifacts here
# so unchanged projects skip their rebuilds across runs.
resource "cloudflare_r2_bucket" "nx_cache" {
  account_id = var.cloudflare_account_id
  name       = "vigilant-broccoli-nx-cache"
  location   = "ENAM"
}

# Free-tier guard: R2 bills on storage-months (10 GB-month free) and Nx cache
# artifacts are disposable and keyed by input hash, so stale entries are never
# re-read. Expire objects after 7 days to keep the bucket well under the free
# allowance, and drop incomplete multipart uploads after a day so orphaned parts
# never silently accrue storage.
resource "cloudflare_r2_bucket_lifecycle" "nx_cache" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.nx_cache.name

  rules = [{
    id      = "expire-cache-artifacts"
    enabled = true

    conditions = {
      prefix = ""
    }

    delete_objects_transition = {
      condition = {
        max_age = 604800 # 7 days
        type    = "Age"
      }
    }

    abort_multipart_uploads_transition = {
      condition = {
        max_age = 86400 # 1 day
        type    = "Age"
      }
    }
  }]
}
