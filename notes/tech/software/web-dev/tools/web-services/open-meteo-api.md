# Open-Meteo API

- [API Docs](https://open-meteo.com/en/docs)
- [WMO Weather Codes](https://open-meteo.com/en/docs#weather_variable_documentation)

Open weather API that needs no API key and no account. A single `/v1/forecast`
call returns current conditions, hourly series, and daily aggregates together,
selected via the `current` / `hourly` / `daily` comma-separated field lists.

- `timezone=auto` resolves the timezone from the coordinates and returns local
  wall-clock timestamps plus a `utc_offset_seconds` field — timestamps carry no
  offset of their own, so that field is what makes them absolute.
- Conditions are reported as [WMO 4677](https://en.wikipedia.org/wiki/WMO_cloud_and_weather_codes)
  `weather_code` integers rather than a vendor-specific vocabulary.
- Forecasts blend national models (ICON, GFS, MET Norway, ECMWF), picking the
  highest-resolution one available for the coordinates.

## Free Tier

- 10,000 calls/day, roughly 5,000 calls/hour and 600/minute, with no API key.
- Non-commercial use only. Commercial use needs a paid plan from $29/mo, which
  also raises the limits and moves traffic to `customer-api.open-meteo.com`.
- 16-day forecasts and ~80 years of historical reanalysis are both included.
- Exceeding the limits returns HTTP 429 with a JSON `reason` until the window
  resets.
