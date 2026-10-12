# Dashboard Info Card

- One card for the clock, the current weather with its details, an optional forecast carousel, the next sunrise/sunset and the moon phase.
- Single weather UI consumed by `weather-next` (weather.harryliu.dev), `vb-manager-next`'s dashboard and `vb-manager-next-mobile`'s `/weather` page; production and staging of each app share one codebase.

## Usage

- `DashboardInfoCardUtilityContent` runs in one of two modes:
  - **Injected data**: pass `weather` (`LocalWeather` plus optional `preparation`), `location` and `timezoneOffsetSeconds`; use `loading`, `error` (a `LocalWeatherFailure`) and `onRetry` for the other states.
  - **Self-locating**: pass `fetchWeather(location)` and optionally `fetchPreparation(weather)`. The card asks the browser for its location through `useLocalWeather` (`react-lib`) and renders the locating/loading skeleton, the denied/unavailable/error message with a retry button (`LocalWeatherMessage`), then the weather. Sun times use the browser's UTC offset unless `timezoneOffsetSeconds` is passed.
- The card always calls the latest `fetchWeather` / `fetchPreparation`, so inline functions do not reload the weather. Only adding or removing `fetchPreparation` changes whether badges are requested; a failed or `null` result renders no badges, and the badge skeleton shows while it is pending.
- `fetchPreparation` receives the weather without its `forecast`.
- The card wraps itself in the internal weather i18n provider and carries the Open-Meteo / OpenStreetMap attribution footer once weather is shown, so apps need no provider or footer.

## Weather data

- `DashboardInfoCardWeather` is `LocalWeather` (from `common-js`) plus `preparation`. Fields shown inline: temperature, feels-like, high/low, humidity, wind and wind max, precipitation and day sum, and the Preparation badges built from `PREPARATION_BADGES` (`react-lib`).
- `toLocalWeather(snapshot, city)` in `common-js` is the single snapshot-to-`LocalWeather` mapper used by the `weather-next` route and by both manager apps' `fetchLocalWeather`. It returns `null` when the snapshot has no daily entry and fills `forecast` from every daily entry, today first.
- Each app's `/api/weather` requests `OPEN_METEO_MAX_FORECAST_DAYS` (16, the Open-Meteo `forecast_days` maximum; `fetchOpenMeteoSnapshot` clamps to it). The OpenWeather provider folds days out of its 5-day / 3-hour list, so it returns fewer days; the carousel shows whatever the provider returns, with no padding.

## Forecast carousel

- The weather tile is a real `<button>` with `aria-expanded` only when `weather.forecast` has entries; otherwise it is a plain tile.
- Clicking it toggles a horizontally scrolling list built on native scroll with scroll-snap. It is swipeable on touch, scrollable by wheel/trackpad, and the focusable list scrolls with the arrow keys. Previous/next buttons are disabled at the ends.
- State is internal (`defaultExpanded`) and optionally controlled through `expanded` / `onExpandedChange`.

## Tailwind

The card is styled with Tailwind classes and the `react-lib` theme tokens (`border-border`, `bg-card`, `text-muted-foreground`). Every app that imports `react-utility` must list `libs/@vigilant-broccoli/react-utility/src/**` (and `react-lib`) in its Tailwind `content` globs; see the nuance in [nx-workspace CONTEXT.md](../../../../../CONTEXT.md#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it).

## Data fetching per app

- `weather-next`: its own `/api/weather` (Open-Meteo plus Nominatim city) and rate-limited `/api/preparation`.
- `vb-manager-next` and `vb-manager-next-mobile`: `fetchLocalWeather` over auth-guarded `/api/weather` plus `/api/weather/city`, and `fetchLocalPreparation` over `/api/preparation` (`fetchWeatherPreparation` / `isPreparationWeather` from `common-node`). City names come from `reverseGeocodeCity` from `common-node` with each app's own Nominatim User-Agent.
