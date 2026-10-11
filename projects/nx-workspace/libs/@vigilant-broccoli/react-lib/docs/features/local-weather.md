# Local Weather

- Shared weather UI for the browser's location: city, temperature, condition, today's high and low, optional "what to wear or bring" badges and the Open-Meteo / OpenStreetMap attribution.
- Single implementation consumed by `weather-next` (the standalone site) and by `vb-manager-next`'s `w` weather dialog.

## Usage

- `LocalWeatherPanel` asks the browser for its location, then calls the injected `fetchWeather(location)`. It renders locating, loading, denied, unavailable and error states with a retry button.
- `fetchPreparation(weather)` is optional; when omitted, no badge request or skeleton is shown. A failed or `null` result renders no badges.
- `LocalWeatherDialog` wraps the panel in a `Dialog` (`open`, `onOpenChange` plus the panel props) and mounts the panel only while open, so closing and reopening re-fetches.
- Pass `fetchWeather` and `fetchPreparation` with a stable identity (module-level functions); a new function each render reloads the weather.
- The lib has no API paths or app dependencies: each app supplies the data fetching. `weather-next` calls its own `/api/weather` and `/api/preparation`; `vb-manager-next` maps its `/api/weather` snapshot to `LocalWeather` and shows no badges.
- English strings live in `weather.i18n.ts` behind an internal provider; the panel needs no app-level `I18nProvider`.
- `LocalWeather`, `Preparation` and `PREPARATION_KEY` are exported for API routes; use `import type` in server code to avoid loading the client barrel.
