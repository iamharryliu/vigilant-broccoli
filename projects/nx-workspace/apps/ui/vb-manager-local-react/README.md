# VB Manager

Management dashboard SPA, served in production by [`vb-manager-local-fastify`](../../api/vb-manager-local-fastify/README.md) on the same origin as its `/api` routes.

## Table of Contents

- [Stack](#stack)
- [Agent Context](#agent-context)

## Stack

- Language - TypeScript
- Framework - React
- Build Tool - Vite
- External libs
  - React Router
  - Tailwind CSS, lucide-react icons, Radix icons
  - dnd-kit (drag-and-drop)
  - Leaflet / react-leaflet, react-markdown
  - Supabase JS client (auth, realtime)
  - Socket.IO client (chat demo, deploy notifications)
  - Playwright (e2e)
- Internal libs
  - `common-browser`
  - `common-js`
  - `deployment`
  - `github-workspace-js`
  - `links`
  - `llm-schemas`
  - `personal-common-js`
  - `react-lib`
  - `react-music-lib`
  - `react-utility`
  - `resume`
  - `vb-manager-local-common`
- Cloud services
  - Supabase
  - Google OAuth
  - Self-hosted (PM2, via `vb-manager-local-fastify`)

## Agent Context

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/layouts/main.layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.
- Routes live in `src/app/app.tsx`; every page under `MainLayout` gets the sidebar, dialogs and keyboard shortcuts. `nx serve vb-manager-local-react` starts the Vite dev server (port 3000) and the Fastify dev server it proxies `/api` to.
