# Bookmarks

The Bookmarks tab wraps `QuickLinksPanel` with search autofocus. Manage adds, edits and deletes bookmarks by subgroup; deletion requires confirmation. Existing subgroup names are offered as suggestions.

`use-bookmarks.ts` stores `{ bookmarks: QuickLink[], tab }` under `bookmarks:v1`. Reads and writes are guarded: corrupt data falls back to an empty list, while failed writes keep the current session usable and show an export reminder. Data stays on this browser origin; there is no backend, auth or cross-device sync. Clearing browser data removes it, and staging, previews and production each have separate storage.

Only non-empty labels and HTTP(S) targets with `type: OPEN_TYPE.BROWSER` are accepted. The same validator handles forms, stored data and imports; shell types, args and embed options are rejected. Optional subgroup text is trimmed.

Export downloads `bookmarks.json`, an array of QuickLink objects. Import validates the entire file before offering Merge or Replace. Merge keeps existing entries and skips exact label/target/subgroup duplicates; Replace replaces the entire list, including with an empty array. Cancel leaves bookmarks unchanged.

## Free Tier

Cloudflare Pages uses three projects (staging, production and preview) within the shared 100-project allowance. Builds run in Actions and upload through Wrangler; Pages allows 20,000 files per site and 25 MiB per asset. No database or server runtime is provisioned.

Apply staging Access protection before the first staging deployment. Create/deploy the production Pages project before applying its custom-domain attachment and DNS record. No deployment or Terraform apply is part of local validation.
