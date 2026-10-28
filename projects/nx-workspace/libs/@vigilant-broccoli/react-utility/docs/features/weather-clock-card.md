# Weather Clock Card

- One card for the clock, the current weather with its details, an optional forecast carousel, the next sunrise/sunset and the moon phase.
- Single weather UI consumed by `weather-next` (weather.harryliu.dev), `local-manager-next`'s dashboard and `mobile-manager-next`'s Weather tab; production and staging of each app share one codebase.

## Usage

- `WeatherClockCardUtilityContent` runs in one of two modes:
  - **Injected data**: pass `weather` (`LocalWeather` plus optional `preparation`), `location` and `timezoneOffsetSeconds`; use `loading`, `error` (a `LocalWeatherFailure`) and `onRetry` for the other states.
  - **Self-locating**: pass `fetchWeather(location)` and optionally `fetchPreparation(weather)`. The card asks the browser for its location through `useLocalWeather` (`react-utility`) and shows the clock while locating/loading without skeletons or reserved weather space, the denied/unavailable/error message with a retry button (`LocalWeatherMessage`), then the weather. Sun times use the browser's UTC offset unless `timezoneOffsetSeconds` is passed.
- The card always calls the latest `fetchWeather` / `fetchPreparation`, so inline functions do not reload the weather. Only adding or removing `fetchPreparation` changes whether badges are requested; a failed or `null` result renders no badges, and nothing renders for the badges while it is pending, and the badge row expands open with a height/opacity transition (disabled under `prefers-reduced-motion`) only once there are badges, so no empty space remains.
- `fetchPreparation` receives the weather without its `forecast`.
- The card wraps itself in the internal weather i18n provider and carries the Open-Meteo / OpenStreetMap attribution footer once weather is shown, so apps need no provider or footer.

## Layout

- Loading shows the clock without skeleton tiles or invisible placeholder details. Actual weather tiles and details expand into view with a height/opacity transition; preparation badges arrive independently using their existing expansion transition. Reduced-motion preferences disable these transitions.

- The summary is a wrapping horizontal row: the clock hero on one side and a 2-column grid of stat tiles (weather, sunrise, moon, sunset) beside it. The grid only drops under the clock when the card is too narrow for both.
- The humidity/wind/precipitation tiles, preparation badges, forecast carousel and attribution footer stack below the summary row; they never move the tiles into a vertical column.

## Weather data

- `WeatherClockCardWeather` is `LocalWeather` (from `common-js`) plus `preparation`. Fields shown: temperature with feels-like in brackets (the word "Feels" is dropped when the card itself is narrower than 420px) and high/low as small stacked text beside it in the weather tile, then humidity, wind (max in the label) and precipitation (day sum in the label) as a row of icon stat tiles like the summary tiles, and the Preparation badges built from `PREPARATION_BADGES` (`react-lib`).
- `toLocalWeather(snapshot, city)` in `common-js` is the single snapshot-to-`LocalWeather` mapper used by the `weather-next` route and by `local-manager-next`'s `fetchLocalWeather`. It returns `null` when the snapshot has no daily entry and fills `forecast` from every daily entry, today first.
- Each app's `/api/weather` requests `OPEN_METEO_MAX_FORECAST_DAYS` (16, the Open-Meteo `forecast_days` maximum; `fetchOpenMeteoSnapshot` clamps to it). The OpenWeather provider folds days out of its 5-day / 3-hour list, so it returns fewer days; the carousel shows whatever the provider returns, with no padding.

## Forecast carousel

- The whole card is the toggle (`role="button"`, `aria-expanded`, Enter/Space) only when `weather.forecast` has entries and the weather is loaded; otherwise it is plain. There is no caret. Clicks on inner buttons/links and inside the carousel do not toggle.
- Clicking the card expands and collapses a horizontally scrolling list built on native scroll with scroll-snap. It is swipeable on touch, draggable with a mouse, scrollable by wheel/trackpad, and the focusable list scrolls with the arrow keys. There are no previous/next buttons and the scrollbar is hidden.
- The carousel stays mounted and animates both ways: a `grid-template-rows` 0fr/1fr transition with opacity (300ms), so no height is measured. Collapsed, it is `inert`, `aria-hidden` and `invisible` (visibility flips after the transition) and a negative top margin cancels the card's flex gap; `aria-controls` always points at it. `prefers-reduced-motion` disables the transition (`motion-reduce:transition-none`) so it toggles instantly.
- State is internal (`defaultExpanded`) and optionally controlled through `expanded` / `onExpandedChange`.

## Tailwind

The card is styled with Tailwind classes and the Radix Themes variables the apps' `ThemeProvider` supplies (`--gray-*`, `--color-background`), as the original card was, so it matches in every app regardless of shadcn tokens. Every app that imports `react-utility` must list `libs/@vigilant-broccoli/react-utility/src/**` (and `react-lib`) in its Tailwind `content` globs; see the nuance in [nx-workspace CONTEXT.md](../../../../../CONTEXT.md#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it).

## Data fetching per app

- `weather-next`: its own `/api/weather` (`getLocalWeather` from `common-node`: Open-Meteo plus Nominatim city) and rate-limited `/api/preparation`.
- `mobile-manager-next`: `WeatherView` over auth-guarded `/api/weather` (`getLocalWeather` from `common-node`, as in `weather-next`) and `/api/preparation` (`fetchWeatherPreparation` / `isPreparationWeather`).
- `local-manager-next`: `fetchLocalWeather` over auth-guarded `/api/weather` plus `/api/weather/city`, and `fetchLocalPreparation` over `/api/preparation` (`fetchWeatherPreparation` / `isPreparationWeather` from `common-node`). City names come from `reverseGeocodeCity` from `common-node` with the app's Nominatim User-Agent.
