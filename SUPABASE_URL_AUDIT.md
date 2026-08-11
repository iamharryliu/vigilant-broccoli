# SUPABASE_URL Special-Character Audit

Audit of every `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` (and per-app prefixed variant) usage across `projects/nx-workspace/` and `.github/workflows/`, focused on where special characters (or percent-encoded special characters) in the value would matter.

Current fact: every real Supabase URL value in the repo is the same fixed literal `https://jrdosjjgmsoodpjmjqxx.supabase.co` — lowercase alphanumeric + `.`/`/`/`:` only. Nothing breaks today. The findings below are about which *usage patterns* would need quoting/encoding if the value ever changed to something with shell/TOML/dotenv-special characters.

## Should quote/escape if the value ever changes

Unquoted `KEY=value` env-var prefixes in Nx `run-commands` shell strings — safe only because the current literal has no shell metacharacters:

- `projects/nx-workspace/apps/ui/employee-handler-ui/project.json:34` (`serve`)
- `projects/nx-workspace/apps/ui/vb-manager-next/project.json:11,44` (`build`, `serve`)
- `projects/nx-workspace/apps/hearth/project.json:35` (`serve`)

If parameterized from a less-trusted source, these need the same quoting `deploy-flyio-secrets.ts:151-152` already uses elsewhere in the repo (POSIX single-quote escape: `'${value.replace(/'/g, "'\\''")}'`).

## Already handled correctly

- `projects/nx-workspace/scripts/deploy-vercel.ts:96,104,157,250-252` — secret values are piped via `execSync`'s `input:` stdin, never shell-interpolated.
- `projects/nx-workspace/scripts/deploy-flyio-secrets.ts:151-163` — correct POSIX single-quote shell escaping (not currently exercised for `SUPABASE_URL` since it's excluded from the Fly secrets sync, see `secrets-mapping.config.ts:56-60`, and hardcoded in the `.toml` instead).
- `.github/workflows/cron-backup.yml:172,203,208` — `SUPABASE_DB_URL` (Postgres connection string, likely containing `@`/`:`/password special chars) is passed through the `env:` block and double-quoted in the shell command (`pg_dump "$SUPABASE_DB_URL"`) — the correct pattern, and the best example in the repo for this risk category.
- All `createClient(supabaseUrl, key, ...)` call sites (`apps/*/src/lib/supabase.ts`, `apps/*/libs/supabase*.ts`, both `proxy.ts` files) — the URL is passed opaquely to `@supabase/supabase-js`, never string-concatenated with a path or query param, so no manual encoding is needed there.

## No concern

- Fly `.toml` configs (`deployment-configs/fly-configs/*-vb-manager-next-mobile.toml`) — TOML literal strings (`'...'`); the URL's charset can't produce the one character (`'`) that would break a TOML literal string.
- `.env*` files across all apps and `ecosystem.config.js` — plain literal value, no spaces/`#`/quotes to escape. Quoting style is inconsistent between files (some quote example values, some don't) but that's cosmetic, not a correctness issue given the current value.
- No GitHub Actions workflow references `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` directly.
- No open-proxy or query-string-concatenation pattern exists in either `proxy.ts` (`apps/ui/employee-handler-ui/src/proxy.ts`, `apps/ui/vb-manager-next/src/proxy.ts`) — both only forward a bearer token to `supabase.auth.getUser(token)`, never build a URL from it.

## Bottom line

No instance currently requires percent-encoding — the URL and publishable-key charsets (`sb_publishable_...`, not a legacy JWT) contain nothing that needs escaping in TOML, dotenv, or JS string contexts. The one latent gap is the three `project.json` Nx `run-commands` that splice the URL unquoted into a shell command string; those should adopt the same single-quote escaping `deploy-flyio-secrets.ts` already uses if the value is ever sourced dynamically instead of hardcoded.
