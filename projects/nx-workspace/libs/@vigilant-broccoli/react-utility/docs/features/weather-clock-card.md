# Weather Clock Card

- One card for the clock, the current weather with its details, an optional forecast carousel, the next sunrise/sunset and the moon phase.
- Single weather UI consumed by `weather-next` (weather.harryliu.dev), `vb-manager-local-react`'s dashboard and `vb-manager-next-mobile`'s Weather tab; production and staging of each app share one codebase.

## Usage

- `WeatherClockCardUtilityContent` runs in one of two modes:
  - **Injected data**: pass `weather` (`LocalWeather` plus optional `preparation`), `location` and `timezoneOffsetSeconds`; use `loading`, `error` (a `LocalWeatherFailure`) and `onRetry` for the other states.
  - **Self-locating**: pass `fetchWeather(location)` and optionally `fetchPreparation(weather)`. The card asks the browser for its location through `useLocalWeather` (`react-utility`) and renders the locating/loading skeleton, the denied/unavailable/error message with a retry button (`LocalWeatherMessage`), then the weather. Sun times use the browser's UTC offset unless `timezoneOffsetSeconds` is passed.
- The card always calls the latest `fetchWeather` / `fetchPreparation`, so inline functions do not reload the weather. Only adding or removing `fetchPreparation` changes whether badges are requested; a failed or `null` result renders no badges, and the badge skeleton shows while it is pending, and once loaded with no badges the badge row is removed so no empty space remains.
- `fetchPreparation` receives the weather without its `forecast`.
- The card wraps itself in the internal weather i18n provider and carries the Open-Meteo / OpenStreetMap attribution footer once weather is shown, so apps need no provider or footer.

## Layout

- The summary is a wrapping horizontal row: the clock hero on one side and a 2-column grid of stat tiles (weather, sunrise, moon, sunset) beside it. The grid only drops under the clock when the card is too narrow for both.
- The humidity/wind/precipitation tiles, preparation badges, forecast carousel and attribution footer stack below the summary row; they never move the tiles into a vertical column.

## Weather data

- `WeatherClockCardWeather` is `LocalWeather` (from `common-js`) plus `preparation`. Fields shown: temperature with feels-like in brackets (the word "Feels" is dropped when the card itself is narrower than 420px) and high/low as small stacked text beside it in the weather tile, then humidity, wind (max in the label) and precipitation (day sum in the label) as a row of icon stat tiles like the summary tiles, and the Preparation badges built from `PREPARATION_BADGES` (`react-lib`).
- `toLocalWeather(snapshot, city)` in `common-js` is the single snapshot-to-`LocalWeather` mapper used by the `weather-next` route and by `vb-manager-local-react`'s `fetchLocalWeather`. It returns `null` when the snapshot has no daily entry and fills `forecast` from every daily entry, today first.
- Each app's `/api/weather` requests `OPEN_METEO_MAX_FORECAST_DAYS` (16, the Open-Meteo `forecast_days` maximum; `fetchOpenMeteoSnapshot` clamps to it). The OpenWeather provider folds days out of its 5-day / 3-hour list, so it returns fewer days; the carousel shows whatever the provider returns, with no padding.

## Forecast carousel

- The whole card is the toggle (`role="button"`, `aria-expanded`, Enter/Space) only when `weather.forecast` has entries and the weather is loaded; otherwise it is plain. There is no caret. Clicks on inner buttons/links and inside the carousel do not toggle.
- Clicking the card toggles a horizontally scrolling list built on native scroll with scroll-snap. It is swipeable on touch, draggable with a mouse, scrollable by wheel/trackpad, and the focusable list scrolls with the arrow keys. There are no previous/next buttons and the scrollbar is hidden.
- State is internal (`defaultExpanded`) and optionally controlled through `expanded` / `onExpandedChange`.

## Tailwind

The card is styled with Tailwind classes and the Radix Themes variables the apps' `ThemeProvider` supplies (`--gray-*`, `--color-background`), as the original card was, so it matches in every app regardless of shadcn tokens. Every app that imports `react-utility` must list `libs/@vigilant-broccoli/react-utility/src/**` (and `react-lib`) in its Tailwind `content` globs; see the nuance in [nx-workspace CONTEXT.md](../../../../../CONTEXT.md#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it).

## Data fetching per app

- `weather-next`: its own `/api/weather` (`getLocalWeather` from `common-node`: Open-Meteo plus Nominatim city) and rate-limited `/api/preparation`.
- `vb-manager-next-mobile`: `WeatherView` over auth-guarded `/api/weather` (`getLocalWeather` from `common-node`, as in `weather-next`) and `/api/preparation` (`fetchWeatherPreparation` / `isPreparationWeather`).
- `vb-manager-local-react`: `fetchLocalWeather` over auth-guarded `/api/weather` plus `/api/weather/city`, and `fetchLocalPreparation` over `/api/preparation` (`fetchWeatherPreparation` / `isPreparationWeather` from `common-node`). City names come from `reverseGeocodeCity` from `common-node` with the app's Nominatim User-Agent.
