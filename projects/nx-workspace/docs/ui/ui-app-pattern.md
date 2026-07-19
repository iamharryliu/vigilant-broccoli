# UI application pattern

What every UI app in this workspace must have, and the shared building blocks to use — this doc owns the UI-specific requirements ([APP_DEVELOPMENT.md](../../../../APP_DEVELOPMENT.md) points here rather than restating them); which app deploys where is mapped in [repo-patterns.md](../../../../docs/repo-patterns.md). Each deploy destination has its own pattern doc: [vercel-deploy-pattern.md](./deployment/vercel-deploy-pattern.md), [cloudflare-pages-deploy-pattern.md](./deployment/cloudflare-pages-deploy-pattern.md), [github-pages-deploy-pattern.md](./deployment/github-pages-deploy-pattern.md).

## Where UI apps live

- Static UIs → `apps/ui/*`, Vite + React for new apps (`cloud-8-skate-angular` is a legacy Angular exception) → Cloudflare Pages.
- Next.js apps → `apps/*` (`hearth`, `findme`, `whiteboard`) or `apps/ui/*` (`employee-handler-ui`) → Vercel. `vb-manager-next` is the exception: PM2 on the VM, no nx `deploy` target.
- GitHub Pages hosts the `pages-index` landing site and `component-library`.

## Shared components (react-lib)

Check the `libs/@vigilant-broccoli/react-lib/src/components` barrel before building new UI — prefer existing shared components over hand-rolled equivalents, unless told otherwise. Frequently needed: `CRUDItemList` (CRUD list management, exported from `CRUDListManagement.tsx`), `CardContainer`, `Button`, `IconButton`, `Dialog`, `Sidebar`, `Tabs`, `Select`, `Input`, `ThemeProvider`.

User-facing auth is `createSupabaseAuth` from the same lib — read [supabase-auth-pattern.md](../auth/supabase-auth-pattern.md) first, never hand-roll per-app auth.

## i18n (required)

All user-facing copy goes through the shared `createI18n` from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/i18n`), English locale at minimum — no hardcoded copy in components, no per-app i18n mechanism.

- Copy lives in a per-locale JSON dictionary (e.g. `src/app/i18n/en.json`) keyed with SCREAMING_SNAKE dot-paths (e.g. `SHARING.OPEN_IN_GOOGLE_MAPS`); values are the display strings.
- Instantiate in an app i18n module marked `'use client'` (it imports the `react-lib` barrel and provides React context/hooks), wrap the app in the returned `I18nProvider`, read copy via `t('...')` from `useTranslation`.
- Not translatable copy (stays inline): styling strings (Tailwind classes, CSS values), icon glyphs, storage keys, library config (e.g. Leaflet attribution).
- Reference implementations (`src/app/i18n/index.ts`): `hearth`, `findme`, `whiteboard`, `employee-handler-ui`, `pages-index`.

## pages-index card (required)

Every UI application appears as a card under "UI Apps" in `apps/ui/pages-index/src/app/pages/UiPage.tsx` (the GitHub Pages "UI" page).

## Env vars

- Follow the env var access rules in [APP_DEVELOPMENT.md](../../../../APP_DEVELOPMENT.md): direct `process.env.NEXT_PUBLIC_*` access client-side, `getEnvironmentVariable` from `@vigilant-broccoli/common-node` server-side.

## Local dev

- Mock backends live under `apps/api/mock/*` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing a local UI at live services.
- Running against real secrets: the app's `serve` target (Vault-wrapped; see repo-patterns.md).

## New UI app checklist

1. Project under `apps/ui/*` (or `apps/*` for Next.js), deploy targets per the destination's pattern doc.
2. i18n wired via `createI18n` (above).
3. UI Apps card in `UiPage.tsx`.
4. The rest of the deployable-app checklist (Upptime, `manual-deploy-app.yml` entry, secrets mapping) is in repo-patterns.md.
