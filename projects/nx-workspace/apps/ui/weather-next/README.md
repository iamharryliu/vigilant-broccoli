# Weather

Current weather for the browser's location: city, temperature, condition, today's high and low, feels-like, humidity, wind and precipitation, a swipeable forecast of every day the provider returns (up to 16; click the weather tile), the clock, sun times and moon phase, plus badges for what to wear or bring (wind-, rain- or snow-resistant clothing, sunglasses) decided by the vb-express LLM endpoint from that weather. If the LLM call fails, no badges are shown. The UI is the shared `DashboardInfoCardUtilityContent` from `react-utility` (see [Dashboard Info Card](../../../libs/@vigilant-broccoli/react-utility/docs/features/dashboard-info-card.md)); this app only supplies the `/api/weather` and `/api/preparation` data fetching.

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Attribution](#attribution)
- [Stack](#stack)

## Deployment URLs

- [weather.harryliu.dev](https://weather.harryliu.dev)

## Attribution

The footer credits Open-Meteo (CC BY 4.0) and OpenStreetMap contributors (Nominatim usage policy); both licences require it, so keep it when changing the layout.

## Stack

- Language - TypeScript
- Framework - Next.js (React)
- Build Tool - Next.js
- External libs
  - Tailwind CSS
- Internal libs
  - `common-browser`
  - `common-js`
  - `common-node`
  - `react-lib`
  - `react-utility`
- Cloud services
  - Open-Meteo (weather)
  - vb-express (`/api/llm`, preparation badges)
  - Nominatim / OpenStreetMap (reverse geocoding)
  - Vercel
