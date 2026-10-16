# OpenWeather API

- [API Docs](https://openweathermap.org/api)
- [API Weather Conditions](https://openweathermap.org/weather-conditions)

## Free Tier

- 60 calls/minute and 1,000,000 calls/month across the free endpoints.
- Included: Current Weather (`/data/2.5/weather`, carries `sys.sunrise`/`sys.sunset` for the current day), 5 day / 3 hour Forecast (`/data/2.5/forecast`), Air Pollution, and Geocoding.
- One Call API 3.0 (the only endpoint with per-day sunrise/sunset) is a separate subscription — 1,000 calls/day free, billed beyond that, and requires a card on file.
- Exceeding the limits returns HTTP 429 until the next window.
