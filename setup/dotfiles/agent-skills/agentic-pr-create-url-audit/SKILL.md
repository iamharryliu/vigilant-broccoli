---
name: agentic-pr-create-url-audit
description: In vigilant-broccoli, verify every public URL has synchronized Upptime entries, pages-index cards and browser quick links for every environment and demo, and every published Docker image its pages-index card and README Containers row, and fix drift.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Audit [public URL registration](../../../../docs/app-development/app-development.md#deployment) and the published Docker image listings ([Containers](../../../../docs/app-readme-pattern.md)), and fix drift. Follow applicable context; keep one conservative change of at most 10 files, with remaining drift reported as skipped candidates.

## Inventory

- Public URLs: every app with a `deploy`, `deploy:production` or `deploy:demo` target in `project.json` (Cloudflare Pages, Vercel, Fly, GitHub Pages) plus self-hosted services, with each environment's URL and each demo-only deploy. Private services (no public URL, e.g. PM2-on-VM, RabbitMQ) are exempt and covered by `ci-health-check`.
- Published Docker images: every `iamharryliu/*` image a `project.json` target or `.github/workflows/*.yml` pushes (the set `scripts/node/repo-stats.mjs` counts).
- Registries: `.upptimerc.yml` `sites` (staging-/production-/demo- names), `apps/ui/pages-index` `WebApplicationsPage.tsx` cards with their i18n keys, and `OPEN_TYPE.BROWSER` entries in `libs/@vigilant-broccoli/public-links/src/lib/quick-links.consts.ts` (URL literals in `infrastructure/src/lib/app.consts.ts` or `monitoring.consts.ts`); for images, `apps/ui/pages-index/src/app/consts/dockerImages.json` (which renders the Docker page cards and `/docker/:image` READMEs) with its `DOCKER_IMAGES_PAGE.*.DESCRIPTION` i18n keys, and the root README `## Containers` table.

## Checks

- Every public URL and environment has an Upptime entry, a pages-index card (with i18n keys in every locale) and a browser quick link.
- Every `.upptimerc.yml` site has a matching quick link, including non-proxied `*.pages.dev`/`*.vercel.app`/`fly.dev` and health endpoints.
- No registry entry points at an app, environment or URL that no longer exists.
- The `repo-stats` application count matches the `WebApplicationsPage.tsx` cards; run `pnpm repo-stats` after card changes.
- Every published image has a `dockerImages.json` entry whose `readmePath` exists and describes that image, a description string in every locale that still matches what the image runs, and a README `## Containers` row whose Pushed by and Runs on match the pushing target or workflow. `pnpm repo-stats` fails on a missing or extra registry entry; the audit covers what it cannot judge.

## Guardrails

- Never edit `TODO.md`. Do not change deploy targets, Terraform, domains or Cloudflare/Vercel/Fly configuration; registries only.
- Add or remove only entries the deploy targets prove missing or stale, copying neighbouring entries' shape. Skip and report anything ambiguous (unclear owner, unknown URL, intentionally unlisted), and any drift over the file cap.
- Apply `docs/refactor-code-cleanup.md`; do not commit or publish. No drift means no edits.

Report fixes grouped by registry, with the evidence (the deploy target, pushing command or URL that proves each). List skipped candidates and reasons.

Unattended entry point: `pnpm agentic-pr-create-url-audit`.
