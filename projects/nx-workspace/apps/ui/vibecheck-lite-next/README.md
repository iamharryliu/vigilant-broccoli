# VibeCheck Lite

Current weather for the browser's location: city, temperature, condition, and today's high and low, plus badges for what to wear or bring (wind-, rain- or snow-resistant clothing, sunglasses) decided by the vb-express LLM endpoint from that weather. If the LLM call fails, no badges are shown.

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Stack](#stack)

## Deployment URLs

- [vibecheck-lite.harryliu.dev](https://vibecheck-lite.harryliu.dev)

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
- Cloud services
  - Open-Meteo (weather)
  - vb-express (`/api/llm`, preparation badges)
  - Nominatim / OpenStreetMap (reverse geocoding)
  - Vercel
