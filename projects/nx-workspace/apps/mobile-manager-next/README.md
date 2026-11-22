# Mobile Manager Next

Mobile dashboard with calendar, tasks, notepad, weather, language learning and quick links including Agentic workflows.

## Table of Contents

- [Stack](#stack)
- [App Dependencies](#app-dependencies)
- [Environment](#environment)

## Stack

- Language - TypeScript
- Framework - Next.js
- Build Tool - Next.js
- External libs
  - lucide-react
  - Zod
- Internal libs
  - `@harry/personal`
  - `@harry/private`
  - `common-browser`
  - `common-js`
  - `common-node`
  - `google-workspace`
  - `infrastructure`
  - `llm-schemas`
  - `manager`
  - `public-links`
  - `react-lib`
  - `react-lib-auth`
  - `react-lib-calendar`
  - `react-lib-higher-level`
  - `react-lib-media`
  - `react-lib-quick-links`
  - `react-lib-tasks`
  - `realtime`
  - `security-news`
  - `sidebar`
- Cloud services
  - Google Workspace APIs
  - Nominatim / OpenStreetMap
  - Open-Meteo
  - Supabase

## App Dependencies

- [Context MD](../ui/context-md) - embeds
- [Docs MD](../ui/docs-md) - embeds
- [Projects Hub](../ui/projects-hub) - embeds
- [Personal Website (React)](../ui/personal-website-react) - embeds
- [Tasks](../ui/tasks-next) - embeds
- [Utilities UI](../ui/utilities-ui) - embeds
- [VB Express](../api/vb-express) - calls
- [Weather](../ui/weather-next) - embeds

## Environment

- [.env.example](./.env.example)
