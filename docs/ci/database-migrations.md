# Database Migrations

How the one shared Supabase project is migrated, on deploy and on `nx serve`.

- The one shared Supabase project is migrated by `projects/nx-workspace/scripts/migrate.ts`, which applies every `.sql` under the `--migrations-dir` folders it's given, tracking applied files in a `schema_migrations` table (idempotent — re-running skips what's already applied). It accepts multiple `--migrations-dir` flags and applies the union in one global filename order, so a migration in one app's folder that depends on an object created earlier in another's still runs after it.
- `deploy.yml`'s `deploy-apps` job runs it (step "Apply Supabase migrations") **before** deploying any app, auto-discovering every `apps/**/supabase/migrations` folder, so a deploy never ships code expecting a table/policy that isn't there yet. It needs `SUPABASE_DB_PASSWORD` from Vault (already imported in that job). New migration folders are picked up automatically — no workflow edit needed.
- The per-app `serve` targets still run `migrate.ts` for their own folder on `nx serve`, so local dev applies pending migrations against the shared project too. That remains the way to apply a migration that hasn't merged yet; on merge, `deploy.yml` is the authoritative apply.
- Migration filenames must be unique across all folders (they share one `schema_migrations` keyed by filename) — `migrate.ts` aborts on a collision.
