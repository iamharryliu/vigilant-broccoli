# Build

## Pre-build Steps

- Download resume PDF from Google Docs export → `assets/resume.pdf`
- Generate markdown library JSON from notes directory
- Sync notes to `assets/md-library/`
- Sync grind-75 solutions to `assets/grind-75/`
- Generate grind-75 JSON index

## Deploy

- Cloudflare Pages via Wrangler
- Project: `harryliu-dev-angular`

## Resume

- PDF exported from Google Docs at build time
- Served as static asset at `/assets/resume.pdf`
- `resume.pdf` is gitignored (generated)
