# Nx remote cache: a Cloudflare Worker (self-hosted remote cache API) in front
# of an R2 bucket. Deliberately not the deprecated @nx/s3-cache plugin (CVE-2025-36852
# "CREEP") — no R2 credential is ever handed out; the Worker is the only thing
# with a binding to the bucket, and it enforces immutable writes itself.

resource "random_password" "nx_cache_write_token" {
  length  = 48
  special = false
}

resource "random_password" "nx_cache_read_token" {
  length  = 48
  special = false
}

resource "cloudflare_r2_bucket" "nx_cache" {
  account_id = var.cloudflare_account_id
  name       = "nx-cache"
  location   = "ENAM"
}

resource "cloudflare_r2_bucket_lifecycle" "nx_cache" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.nx_cache.name

  rules = [
    {
      id      = "expire-cache-objects"
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

      abort_multipart_uploads_transition = {
        condition = {
          type    = "Age"
          max_age = 86400
        }
      }
    }
  ]
}

resource "cloudflare_workers_script" "nx_cache" {
  account_id  = var.cloudflare_account_id
  script_name = "nx-cache"

  content_file   = "${path.module}/../cloudflare-workers/nx-cache/index.js"
  content_sha256 = filesha256("${path.module}/../cloudflare-workers/nx-cache/index.js")
  main_module    = "index.js"

  compatibility_date = "2026-07-01"

  bindings = [
    {
      name        = "CACHE"
      type        = "r2_bucket"
      bucket_name = cloudflare_r2_bucket.nx_cache.name
    },
    {
      name = "WRITE_TOKEN"
      type = "secret_text"
      text = random_password.nx_cache_write_token.result
    },
    {
      name = "READ_TOKEN"
      type = "secret_text"
      text = random_password.nx_cache_read_token.result
    },
  ]

  observability = {
    enabled = true
  }
}

# Cloudflare provisions and manages the DNS record for a Workers custom domain
# itself — unlike the Pages sites in this repo (cloudflare-docs.tf etc.),
# which each own an explicit cloudflare_dns_record.
resource "cloudflare_workers_custom_domain" "nx_cache" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = var.nx_cache_domain
  service    = cloudflare_workers_script.nx_cache.script_name
}
