# vb-manager-next

Management dashboard app.

## Table of Contents

- [Stack](#stack)
- [Agent Context](#agent-context)

## Stack

- Language - TypeScript
- Framework - Next.js
- Build Tool - Next.js
- External libs
  - dnd-kit
  - jsQR
  - Leaflet / react-leaflet
  - lucide-react
  - react-markdown
  - Socket.IO client
  - Tailwind CSS
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
- Cloud services
  - Google OAuth
  - Google Tasks & Calendar
  - MongoDB
  - Open-Meteo
  - OpenAI API
  - OpenWeatherMap
  - Spotify Web API
  - Stripe
  - Supabase

## Agent Context

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.
