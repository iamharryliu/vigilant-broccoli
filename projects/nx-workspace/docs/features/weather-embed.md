# Weather Embed

The Weather cards in local-manager-next and mobile-manager-next are weather-next's `/embed` page in an iframe, so the card has one deployed source. Both render the shared `WeatherEmbedCard` from `react-lib-higher-level`, which takes the weather URL as a prop.

## Ownership

- weather-next owns everything inside the card: geolocation (its own permission prompt, delegated by the iframe's `allow="geolocation"`), `/api/weather` fetching, the Nominatim city lookup and preparation badges.
- The embedding apps only embed the frame, sends its light/dark appearance and sizes the frame to the reported content height. It passes no location.
- Every embedding environment uses `VB_APP_URL.WEATHER.URL`; staging weather-next is behind Vercel Authentication and cannot be framed. `NEXT_PUBLIC_WEATHER_URL` points it at a local weather-next instead.

## Messages

- Types and the type guard are `WEATHER_EMBED` / `isWeatherEmbedMessage` in `common-js`.
- The frame posts `READY` to its embedding origin once mounted. The parent answers with `THEME` and resends it on every appearance change. After the first `THEME` the frame applies it through `setPreference` and reports `HEIGHT` whenever its content resizes.
- The parent accepts messages only from the weather origin and its own frame window. The frame takes its parent origin from `location.ancestorOrigins` (referrer in Firefox), accepts it only when listed in `WEATHER_EMBED_PARENT_ORIGINS` (`infrastructure`), and posts only to it. Opened standalone, `/embed` renders the card without messaging.

## Framing

- weather-next sends no framing restriction (no `frame-ancestors` or `X-Frame-Options`), so any site may frame it. Messaging stays limited to `WEATHER_EMBED_PARENT_ORIGINS`: local-manager-next (proxied `manager.` host, PM2's `127.0.0.1:1337`, `next dev` on `localhost`/`127.0.0.1:3000`) and mobile-manager-next (`manager.harryliu.dev` and its production and staging `vercel.app` hosts). Other embedders get the card without theme sync or auto-height.
- Neither embedding app sets a CSP or Permissions-Policy header, so `frame-src` and geolocation delegation are not blocked.

## Parent states

- A skeleton shows until the first `HEIGHT`; the frame loads transparently over it (not hidden, since Chrome throttles invisible cross-origin frames).
- Without a `HEIGHT` in 15 seconds the card shows a failure message with a link to weather.harryliu.dev and Retry, which remounts the frame.
- The card's loading glow is clipped by the frame edge.
