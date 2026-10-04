# vb-manager-next

Management dashboard app.

## Table of Contents

- [Stack](#stack)
- [Agent Context](#agent-context)

## Stack

- Language - TypeScript
- Framework - Next.js (App Router, React)
- Build Tool - Next.js
- External libs
  - Tailwind CSS, lucide-react icons
  - dnd-kit (drag-and-drop)
  - jsQR (QR code decoding)
  - Leaflet / react-leaflet, react-markdown
  - Socket.IO client (chat demo)
- Internal libs
  - `common-browser`
  - `common-js`
  - `common-node`
  - `deployment`
  - `devops-cli`
  - `github-workspace`
  - `github-workspace-js`
  - `google-workspace`
  - `links`
  - `llm-schemas`
  - `money-movement`
  - `personal-common-js`
  - `react-lib`
  - `react-music-lib`
  - `react-utility`
  - `resume`
  - `vibecheck-lite`
- Cloud services
  - Google OAuth
  - Google Tasks & Calendar
  - MongoDB
  - Supabase
  - Stripe
  - Tailscale
  - OpenAI API
  - Open-Meteo (default weather provider)
  - OpenWeatherMap (alternate weather provider)
  - Self-hosted (PM2)

## Agent Context

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.
