# Local Manager Next

Management dashboard with calendar, notepad and quick links home tabs.

## Table of Contents

- [Stack](#stack)
- [App Dependencies](#app-dependencies)
- [Environment](#environment)

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
  - `@harry/personal`
  - `@harry/private`
  - `chatbot`
  - `common-browser`
  - `common-js`
  - `common-node`
  - `deployment`
  - `devops-cli`
  - `file-explorer`
  - `github-workspace`
  - `github-workspace-js`
  - `google-workspace`
  - `infrastructure`
  - `llm-schemas`
  - `manager`
  - `money-movement`
  - `private-infrastructure`
  - `public-links`
  - `react-lib`
  - `react-lib-auth`
  - `react-lib-calendar`
  - `react-lib-crud-list`
  - `react-lib-higher-level`
  - `react-lib-media`
  - `react-lib-quick-links`
  - `react-lib-tasks`
  - `react-utility`
  - `realtime`
  - `resume`
  - `security-news`
  - `sidebar`
  - `storage`
- Cloud services
  - Cloudflare R2
  - GitHub REST API
  - Google OAuth
  - Google Tasks & Calendar
  - MongoDB
  - Open-Meteo
  - OpenAI API
  - OpenWeatherMap
  - Stripe
  - Supabase

## App Dependencies

- [Cloud Services Next](../cloud-services-next) - embeds
- [Context MD](../context-md) - embeds
- [Docs MD](../docs-md) - embeds
- [Job Hunt](../job-hunt-next) - embeds
- [Local Services Next](../local-services-next) - embeds
- [Music Next](../music-next) - embeds
- [Pages Index](../pages-index) - embeds
- [Personal Website (React)](../personal-website-react) - embeds
- [Socket Server (Socket.IO)](../../socket-server-socketio) - calls
- [Tasks](../tasks-next) - embeds
- [Text Tools UI](../text-tools-ui) - embeds
- [Utilities UI](../utilities-ui) - embeds
- [VB Express](../../api/vb-express) - calls
- [Weather](../weather-next) - embeds

## Environment

- [.env.local.example](./.env.local.example)
