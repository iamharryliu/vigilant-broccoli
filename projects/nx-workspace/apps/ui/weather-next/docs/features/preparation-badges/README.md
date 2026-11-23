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

- Wind-resistant clothing: current or today's maximum gust strictly above 50 km/h. Cold is not a trigger; feels-like temperature is display-only.
- Rain-resistant clothing: current condition is rain or thunderstorm; otherwise current precipitation at least 0.1 mm (this also gates a current drizzle condition) or today's total at least 1 mm. A daily rain condition alone never triggers it, since it is the day's worst code and fires on trace amounts.
- Snow-resistant clothing: current condition is snow, current snowfall at least 0.1 cm or today's snowfall total at least 0.5 cm. Freezing temperatures with rain do not trigger it.
- Sunglasses: daytime and current clear or partly cloudy condition; never at night, in cloud, fog, drizzle, rain, snow or thunderstorms.
- Current snow suppresses precipitation-only rain recommendations; a snow condition for today's forecast also suppresses the daily-total rain fallback. Explicit current rain still recommends rain protection for mixed weather.

## Limitations

- These named thresholds (`WEATHER_PREPARATION_THRESHOLDS`) are product heuristics, not safety advice.
- Provider-neutral conditions merge freezing drizzle/rain into drizzle/rain and sleet into snow.
- Precipitation totals include snow water equivalent. Snow exclusions avoid snow-only rain badges where the condition provides that evidence; mixed precipitation cannot be separated precisely.
- Snowfall comes from Open-Meteo `snowfall`/`snowfall_sum` (cm); OpenWeather's water-equivalent snow millimetres are used as centimetres (about 10:1 ratio). OpenWeather gusts fall back to the sustained wind speed when `wind.gust` is absent.
- Today's forecast is the first forecast entry, matching `toLocalWeather`. Without it, only current condition and the top-level daily totals/low/max are available.
