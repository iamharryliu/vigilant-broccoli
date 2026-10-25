# UI application pattern

What every UI app in this workspace must have, and the shared building blocks to use. Each deploy destination has its own pattern doc: [vercel-deploy-pattern.md](./deployment/vercel-deploy-pattern.md), [cloudflare-pages-deploy-pattern.md](./deployment/cloudflare-pages-deploy-pattern.md), [github-pages-deploy-pattern.md](./deployment/github-pages-deploy-pattern.md).

## Table of Contents

- [Where UI apps live](#where-ui-apps-live)
- [Shared components (react-lib)](#shared-components-react-lib)
- [i18n (required)](#i18n-required)
- [Page titles (required)](#page-titles-required)
- [Home screen icons (required)](#home-screen-icons-required)
- [Theme (system light/dark)](#theme-system-lightdark)
  - [Consistency requirements](#consistency-requirements)
  - [Avoiding a wrong-theme flash](#avoiding-a-wrong-theme-flash)
  - [Manual verification](#manual-verification)
- [pages-index card (required)](#pages-index-card-required)
- [Local dev](#local-dev)
- [New UI app checklist (app-side)](#new-ui-app-checklist-app-side)

## Where UI apps live

- Static UIs → `apps/ui/*`, Vite + React → Cloudflare Pages.
- Next.js static exports (`apps/findme`, `apps/whiteboard`) → Cloudflare Pages.
- Next.js server apps → `apps/*` (`hearth`) or `apps/ui/*` (`employee-handler-ui`, `weather-next`, `balloono`) → Vercel; `employee-handler-ui`'s `deploy`/`deploy:production` only push the Docker image; its only Vercel deploy is `deploy:demo` (project `demo-employee-handler-ui`), run by `deploy-demo-apps`. `vb-manager-next` is the exception: PM2 on the VM, no nx `deploy` target.
- GitHub Pages hosts only the `pages-index` landing site; `component-library` is a Cloudflare Pages site like the other static UIs.

## Shared components (react-lib)

Check the `libs/@vigilant-broccoli/react-lib/src/components` barrel (atoms), the `react-lib-auth`, `react-lib-calendar` and `react-lib-media` domain libs, and the `react-lib-higher-level` lib (composites) before building new UI — prefer existing shared components over hand-rolled equivalents, unless told otherwise. Frequently needed: `CardContainer`, `Button`, `IconButton`, `Dialog`, `Tabs`, `Select`, `Input`, `ThemeProvider` from `react-lib`; `CRUDItemList` (CRUD list management, exported from `CRUDListManagement.tsx`) and `Sidebar` from `react-lib-higher-level`.

User-facing auth is `createSupabaseAuth` from `react-lib-auth` — read [supabase-auth-pattern.md](./auth/supabase-auth-pattern.md) first, never hand-roll per-app auth. Supabase auth is UI-app-only: its server half (bearer-token middleware, admin client, per-route helpers) lives inside the Next.js apps, and no fly API service uses it.

## i18n (required)

All user-facing copy goes through the shared `createI18n` from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/i18n`), English locale at minimum — no hardcoded copy in components, no per-app i18n mechanism.

- Copy lives in a per-locale JSON dictionary (e.g. `src/app/i18n/en.json`) keyed with SCREAMING_SNAKE dot-paths (e.g. `SHARING.OPEN_IN_GOOGLE_MAPS`); values are the display strings.
- Instantiate in an app i18n module marked `'use client'` (it imports the `react-lib` barrel and provides React context/hooks), wrap the app in the returned `I18nProvider`, read copy via `t('...')` from `useTranslation`.
- Not translatable copy (stays inline): styling strings (Tailwind classes, CSS values), icon glyphs, storage keys, library config (e.g. Leaflet attribution).
- Reference implementations (`src/app/i18n/index.ts`): `hearth`, `findme`, `whiteboard`, `employee-handler-ui`, `pages-index`.

## Page titles (required)

Every route-level page sets a document title of `Page Name | Site Name`, so browser tabs, history, and bookmarks identify the page rather than just the app.

- The shared primitive is `useDocumentTitle` from `@vigilant-broccoli/react-lib`; each app wraps it in a local `usePageTitle` that appends the app name (e.g. `apps/hearth/src/lib/page-title.ts`).
- Titles come from the app's existing page-name source — i18n keys where the app has them (`employee-handler-ui`, `pages-index`), otherwise a `PAGE_TITLE`/`APP_ROUTE` const module.
- Next.js server-component pages use `export const metadata` instead, with a `title.template` on the root layout (`vb-manager-next-mobile`).
- Home, login, callback, and error pages follow the same convention; initial HTML/root metadata defaults also include both names. Keep Open Graph and Twitter title tags consistent where present.
- `DocsViewer` and `ComponentSandbox` accept `siteName` so their selected document/component titles retain the hosting app suffix. Pass it from the app; the viewer must not overwrite a formatted title with a bare document name.
- Detail pages title themselves after the record they render (doc name, project title, org name), falling back to a generic label while loading.

## Home screen icons (required)

Every UI app provides an opaque 180×180 PNG for Safari’s Add to Home Screen, using its existing favicon or logo with padding on a solid background. SVG browser favicons alone do not provide the Apple home screen icon.

- Vite apps: keep `public/apple-touch-icon.png` and declare `<link rel="apple-touch-icon" sizes="180x180" href="%BASE_URL%apple-touch-icon.png" />` in `index.html`. Vite replaces `%BASE_URL%` with the configured deployment base, so the icon resolves on nested routes and deployments under a subpath.
- Next.js apps: keep `src/app/apple-icon.png`. The App Router automatically serves the image and adds the Apple touch icon link on every route, including login pages. Keep metadata image routes accessible without authentication.
- When changing an app’s favicon or logo, regenerate its PNG to keep the home screen icon consistent. Preserve a square canvas and let iOS apply the corner mask.
- Verify the deployed icon URL returns a PNG, then use Safari → Share → Add to Home Screen on an iPhone or iPad. Remove and re-add an existing shortcut when checking a changed icon, because installed shortcuts may retain their previous image.

References: [Apple web application configuration](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [Next.js app icon conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons).

## Theme (system light/dark)

UI apps follow the OS/browser `prefers-color-scheme` through the shared `ThemeProvider`. A manual toggle is optional: it saves an override, and toggling back to the system appearance clears it. Deviate only when the user explicitly requests another behavior.

```tsx
import { ThemeProvider } from '@vigilant-broccoli/react-lib';

export function App() {
  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-gray-900">{/* app */}</div>
    </ThemeProvider>
  );
}
```

Reference implementations: `docs-md` and `context-md` (`src/app/app.tsx`); `hearth` adds a toggle. The component is `libs/@vigilant-broccoli/react-lib/src/components/ThemeProvider.tsx`; shared behavior is documented in [theme.md](../../../projects/nx-workspace/libs/@vigilant-broccoli/react-lib/docs/features/theme.md).

Behavior (`useThemePreference`, shared by `ThemeProvider` and apps that own their theme context):

- Without a saved `theme` in `localStorage`, the appearance tracks `prefers-color-scheme` live through a media-query listener. The page is not reloaded, so UI state survives a switch.
- `toggleTheme` from `useTheme` saves the opposite appearance as an override; toggling back to the system appearance removes it. Cross-tab `storage` updates apply the override everywhere.

### Consistency requirements

- Use the existing `light`/`dark` classes and `ThemeScope` tokens that `ThemeProvider` renders; do not add app-specific theme state or duplicate class toggling. An app that must put the class on `<html>` builds on `useThemePreference` (see `personal-website-react`'s `theme-context.tsx`).
- Tailwind only emits classes it scans, so add the shared lib globs (`react-lib`, `react-utility`, ...) the app imports to its `content` — see the workspace [Nuances](../../../projects/nx-workspace/CONTEXT.md#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it).
- Give `dark:` variants to every surface: page background, text, markdown and code blocks, and native controls (inputs, scrollbars, `color-scheme`).
- Do not use raw light-only palette utilities (`bg-white`, `bg-gray-*`, `border-gray-*`, `text-gray-*`) on surfaces. Build surfaces from react-lib `Card`/`CardContainer` or from tokens that swap per theme: the `ThemeScope` variables (`var(--gray-3)`..`var(--gray-12)`, `--gray-a*`) and the semantic utilities from the react-lib Tailwind preset (`bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`). A `dark:` twin is only a fallback. The `vigilant-broccoli/require-dark-variant` ESLint rule fails `nx lint` on a static `className` (or `cn`/`clsx` argument) with such a utility and no `dark:bg-*`/`dark:border-*`/`dark:text-*` of the same property; arbitrary token values (`bg-[var(--gray-2)]`) never trigger it. Exempt an intentionally light-only surface (printable page, overlay on media) with `// eslint-disable-next-line vigilant-broccoli/require-dark-variant -- <reason>`.
- Overlays rendered through portals must use the shared primitives (`Dialog`, `Popover`, `Select`, `DropdownMenu`, `Tooltip`; see `usePortalTheme`), which copy the originating scope's variables and dark class.
- Canvas and graph visuals must read the theme actually in effect, not assume `<html>` owns the class or guess from the media query, and must redraw when it changes. `react-utility`'s `graph-view.tsx` observes class/style changes on every ancestor of its container plus the media query.

### Avoiding a wrong-theme flash

- Vite apps: set `<meta name="color-scheme" content="light dark" />` and a `prefers-color-scheme: dark` body background in `index.html` so the page is not light before React mounts. See `apps/ui/docs-md/index.html`.
- SSR/Next apps: do not copy that browser-only code indiscriminately. Guard `window`/`matchMedia` access, and keep the first client render identical to the server HTML to stay hydration-compatible, applying the system preference after mount.

### Manual verification

- Initial load in OS light and in OS dark.
- Switch the OS preference while the app is open: the theme follows live and open dialogs, filters and scroll position are kept.
- With a toggle: toggling saves an override that survives reloads; toggling back follows the system again.
- Portals (dialogs, popovers, menus) and canvas/graph visuals redraw on a switch, and text and lines stay legible in both themes.
- With the [local dev](#local-dev) server running, `pnpm screenshot:themes -- <url> [<url>...]` writes light and dark PNGs at phone and desktop widths to the gitignored `projects/nx-workspace/screenshots/` and prints their paths; open each changed page and check the dark shots for white or light-gray surfaces. It refuses non-local URLs; if Chromium is missing run `npx playwright install chromium` in `projects/nx-workspace`.

## pages-index card (required)

Every UI application with a public URL appears as a card in `apps/ui/pages-index/src/app/pages/WebApplicationsPage.tsx` (the GitHub Pages "Web Applications" page; demo-only deploys go in its Demo section). Each public URL also needs an Upptime entry and a quick-links browser entry — see [Public URL registration](../app-development.md#deployment).

## Local dev

- Mock backends live under `apps/api/mock/*` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing a local UI at live services.
- Running against real secrets: the app's `serve` target (Vault-wrapped).
- Every UI app's local dev server defaults to port 3000 (Vite `server.port`, or Next's own unset-port default) — API services default to 3001 (see [fly-service-pattern.md](../api/deployment/fly-service-pattern.md#local-dev)). Since only one app on each side can hold its default port at a time, a new UI app should follow this default rather than picking its own — reach for a `PORT`/`--port` override only for genuinely concurrent local multi-service dev (e.g. Playwright driving two apps at once).

## New UI app checklist (app-side)

1. Project under `apps/ui/*` (or `apps/*` for Next.js), deploy targets per the destination's pattern doc.
2. i18n wired via `createI18n` (above).
3. Per-page document titles via `usePageTitle` (above).
4. Web Applications card in `WebApplicationsPage.tsx`, plus the Upptime and quick-links entries above.
5. Theme follows the system via `<ThemeProvider>` unless told otherwise (above).
6. Apple home screen PNG and link via the framework convention above.
