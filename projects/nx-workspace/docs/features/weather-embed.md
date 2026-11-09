# Weather Embed

local-manager-next's dashboard Weather card is weather-next's `/embed` page in an iframe, so the card has one deployed source.

## Ownership

- weather-next owns everything inside the card: geolocation (its own permission prompt, delegated by the iframe's `allow="geolocation"`), `/api/weather` fetching, the Nominatim city lookup and preparation badges.
- local-manager-next only embeds the frame, sends its light/dark appearance and sizes the frame to the reported content height. It passes no location.
- Every local-manager environment embeds `VB_APP_URL.WEATHER.URL`; staging weather-next is behind Vercel Authentication and cannot be framed. `NEXT_PUBLIC_WEATHER_URL` points it at a local weather-next instead.

## Messages

- Types and the type guard are `WEATHER_EMBED` / `isWeatherEmbedMessage` in `common-js`.
- The frame posts `READY` to its embedding origin once mounted. The parent answers with `THEME` and resends it on every appearance change. After the first `THEME` the frame applies it through `setPreference` and reports `HEIGHT` whenever its content resizes.
- The parent accepts messages only from the weather origin and its own frame window. The frame takes its parent origin from `location.ancestorOrigins` (referrer in Firefox), accepts it only when listed in `LOCAL_MANAGER_ORIGINS` (`infrastructure`), and posts only to it. Opened standalone, `/embed` renders the card without messaging.

## Framing

- weather-next sends `Content-Security-Policy: frame-ancestors 'self'` plus `LOCAL_MANAGER_ORIGINS` (proxied `manager.` host, PM2's `127.0.0.1:1337`, `next dev` on `localhost`/`127.0.0.1:3000`) on every path, from `local-manager-origins.json` so `next.config.js` can require it. Standalone visits are unaffected.
- local-manager-next sets no CSP or Permissions-Policy header, so `frame-src` and geolocation delegation are not blocked.

## Parent states

- A skeleton shows until the first `HEIGHT`; the frame loads transparently over it (not hidden, since Chrome throttles invisible cross-origin frames).
- Without a `HEIGHT` in 15 seconds the card shows a failure message with a link to weather.harryliu.dev and Retry, which remounts the frame.
- The card's loading glow is clipped by the frame edge.
