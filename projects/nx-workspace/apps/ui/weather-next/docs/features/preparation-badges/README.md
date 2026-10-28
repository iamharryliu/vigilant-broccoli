# Preparation Badges

Deterministic product heuristics for today's what-to-wear-or-bring badges.

## Table of Contents

- [Behaviour](#behaviour)
- [Thresholds](#thresholds)
- [Limitations](#limitations)

## Behaviour

- The shared card calculates badges synchronously from loaded weather using `calculateWeatherPreparation` in browser-safe `common-js`, also used by both manager apps through `useLocalWeather`.
- Identical weather inputs produce identical booleans; there is no preparation request, LLM, credential, cache or independent loading/failure state.
- Existing translated labels and boolean fields are preserved; only true badges render, with the existing expansion and reduced-motion behaviour.
- Weather fetching, clock ticks and forecast interaction retain their existing behaviour; clock ticks do not fetch weather or preparation.

## Thresholds

- Wind-resistant clothing: current or daily-max wind strictly above 25 km/h, or current feels-like strictly below 10°C.
- Rain-resistant clothing: current or today's forecast condition is drizzle, rain or thunderstorm; otherwise current precipitation at least 0.1 mm or today's total at least 1 mm, subject to the snow exclusions below.
- Snow-resistant clothing: current or today's forecast condition is snow; also wet current conditions at actual temperature at or below 0°C, or wet daily conditions with today's low at or below 0°C.
- Sunglasses: daytime and current clear or partly cloudy condition; never at night, in cloud, fog, drizzle, rain, snow or thunderstorms.
- Current snow suppresses precipitation-only rain recommendations; a snow condition for today's forecast also suppresses the daily-total rain fallback. Explicit current or daily rain still recommends rain protection for mixed weather.
- Freezing wet means a drizzle/rain/thunderstorm condition or measurable precipitation using the same thresholds and snow exclusions. Daily evidence uses the daily low; current evidence uses current actual temperature, never feels-like.

## Limitations

- These named thresholds (`WEATHER_PREPARATION_THRESHOLDS`) are product heuristics, not safety advice.
- Provider-neutral conditions merge freezing drizzle/rain into drizzle/rain and sleet into snow. Actual temperature and the daily low approximate freezing wet weather; the available data cannot establish whether the low coincides with precipitation.
- Precipitation totals include snow water equivalent. Snow exclusions avoid snow-only rain badges where the condition provides that evidence; mixed precipitation cannot be separated precisely.
- Today's forecast is the first forecast entry, matching `toLocalWeather`. Without it, only current condition and the top-level daily totals/low/max are available.
