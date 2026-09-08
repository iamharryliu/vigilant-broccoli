# vb-manager-next

Management dashboard app.

## Stack

- Language - TypeScript
- Framework - Next.js (App Router, React)
- Build Tool - Next.js
- External libs
  - Radix Themes + Tailwind CSS, lucide-react icons
  - dnd-kit (drag-and-drop)
  - Leaflet / react-leaflet, react-markdown, fuse.js
  - Socket.IO client (chat demo)
- Internal libs
  - `ci`
  - `common-browser`
  - `common-js`
  - `common-node`
  - `deployment`
  - `github-workspace`
  - `github-workspace-js`
  - `google-workspace`
  - `links`
  - `llm-schemas`
  - `money-movement`
  - `next-lib`
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
  - OpenWeatherMap
  - Self-hosted (PM2)

## Agent Context

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.
