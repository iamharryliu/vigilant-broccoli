# Shared Supabase project ("vb-supabase", ref jrdosjjgmsoodpjmjqxx) backing
# Google-provider auth for hearth, employee-handler-ui, small-business-next,
# and vb-manager-next, plus hearth's Postgres DB. Settings were originally
# configured by hand via the dashboard. Within `auth`, only the fields set
# below are managed — every other auth setting (mailer templates, MFA, rate
# limits, etc.) stays dashboard-managed and untouched by apply. The other
# top-level blocks (api/database/network/storage) mirror live values because
# the provider nulls any attribute left unset.
#
# Before first apply: `terraform import supabase_settings.vb_auth jrdosjjgmsoodpjmjqxx`
# (pnpm tf:import -- supabase_settings.vb_auth jrdosjjgmsoodpjmjqxx), then
# `pnpm tf:plan` and confirm the only diff is the auth attribute before
# applying.

variable "supabase_project_ref" {
  description = "Project ref for the shared vb-supabase project"
  type        = string
  default     = "jrdosjjgmsoodpjmjqxx"
}

# Must match the client already configured on the Supabase dashboard's Google
# provider; kept out of state as a secret so it's never written to a plan
# file or the repo. Set via TF_VAR_supabase_google_client_secret in the
# Terraform Cloud workspace.
variable "supabase_google_client_secret" {
  description = "Google OAuth client secret for the Supabase Google provider"
  type        = string
  sensitive   = true
}

resource "supabase_settings" "vb_auth" {
  project_ref = var.supabase_project_ref

  # Provider's auth attribute is a JSON string of the Management API's auth
  # config object, not a native HCL object.
  auth = jsonencode({
    # Fallback redirect target when redirectTo isn't on the allow list below.
    # Previously pointed at hearth's dead pre-rename Vercel domain
    # (vb-next-demo.vercel.app), which silently 404s any sign-in whose
    # redirectTo doesn't match uri_allow_list instead of erroring loudly.
    site_url = "https://vb-hearth.vercel.app"

    # One allow-listed entry per app per environment. Comma-separated per the
    # Management API's wire format (not a JSON array).
    uri_allow_list = join(",", [
      "http://localhost:4200/*",                              # hearth local dev
      "https://vb-hearth.vercel.app/*",                       # hearth prod
      "http://localhost:4000/auth/callback",                  # employee-handler-ui local dev
      "https://employee-handler-ui.vercel.app/*",             # employee-handler-ui prod
      "http://localhost:3000/*",                              # vb-manager-next local dev
      "http://127.0.0.1:3000/*",                              # vb-manager-next local dev (127.0.0.1 form)
      "https://manager.vigilant-broccoli.app/*",              # vb-manager-next prod (PM2)
      "https://vb-manager-next-mobile.fly.dev/auth/callback", # vb-manager-next mobile
    ])

    external_google_enabled          = true
    external_google_client_id        = "88091895337-6a9shp2ld016cncsdr1u0esso80jsr1o.apps.googleusercontent.com"
    external_google_secret           = var.supabase_google_client_secret
    external_google_skip_nonce_check = false
  })

  # The provider nulls out any top-level attribute left unset (it manages the
  # whole project config as one resource), so the remaining blocks mirror the
  # live values captured at import time — matching state exactly so apply
  # never touches them. Change these only when intentionally changing the
  # corresponding dashboard setting.
  api = jsonencode({
    db_extra_search_path = "public, extensions"
    db_schema            = "public,graphql_public"
    max_rows             = 1000
  })

  database = jsonencode({})

  network = jsonencode({
    restrictions = ["0.0.0.0/0", "::/0"]
  })

  storage = jsonencode({
    capabilities = {
      iceberg_catalog = true
      list_v2         = true
    }
    databasePoolMode = ""
    external = {
      upstreamTarget = "canary"
    }
    features = {
      icebergCatalog = {
        enabled       = false
        maxCatalogs   = 2
        maxNamespaces = 10
        maxTables     = 10
      }
      imageTransformation = {
        enabled = false
      }
      s3Protocol = {
        enabled = true
      }
      vectorBuckets = {
        enabled    = false
        maxBuckets = 10
        maxIndexes = 5
      }
    }
    fileSizeLimit    = 52428800
    migrationVersion = "optimize-existing-functions-again"
  })
}
