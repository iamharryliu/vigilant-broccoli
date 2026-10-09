# FindMe Tabs

Map, Nearby and People tabs in `FindMeApp.tsx`; the username and sharing controls sit above the tab bar so they stay visible on every tab.

## Table of Contents

- [Overview](#overview)
- [Map](#map)
- [Nearby](#nearby)
- [People](#people)
- [Providers](#providers)
- [Limitations](#limitations)
- [Free Tier](#free-tier)
- [Sources](#sources)

## Overview

- Map is the default tab. The tab bar is an ARIA tablist (arrow keys, Home/End, roving `tabIndex`).
- `useGeolocation`, `useLiveLocations` and `useNearbyPlaces` are called in `FindMeApp`, above the tab content, and every panel stays mounted (`hidden` when inactive), so switching tabs keeps the username, sharing state, geolocation watch, Supabase presence channel and Leaflet map.

## Map

- `FindMeMap.tsx` (client-only, shared OSM tile layer and attribution). Own location always renders locally; it is broadcast only while sharing is on.
- Showing a POI sets a `requestKey`; the map recentres and opens the POI popup (name, category, live distance) once per key, so distance updates never re-pan it.
- `invalidateSize` runs when the tab becomes active and on container resize (a hidden Leaflet container measures 0×0).

## Nearby

- Overpass query (`lib/overpass.ts`, ending `out body bb;`) for `nwr` elements within `NEARBY_RADIUS_METRES` (250 m) of the device location. Category filters are explicit in `CATEGORY_FILTERS` (`consts/nearby.consts.ts`): shops, food and drink, parks, named natural features, tourism and historic attractions.
- Results are deduplicated by `type/id`, then by same name + category within 30 m. Name falls back to `brand`, `operator`, then "Unnamed <category>".
- **Area distance rule:** nodes use the straight line to the point; ways and relations use the straight line to the nearest point of their bounding box (0 m when inside it). `bb` is the only geometry modifier (`center` and `bb` are alternatives), so nodes keep `lat`/`lon` and an area's marker is the midpoint of its bounding box. Overpass `around` already matches area geometry within 250 m, so a park whose centre is farther than 250 m is kept. A box over-covers irregular shapes, so the distance is a lower-bound approximation.
- Distances are recomputed from the live device location on every update, independent of network refreshes. Results sort nearest first.
- **Refresh rules** (`hooks/useNearbyPlaces.ts`, constants in `consts/nearby.consts.ts`):
  - First visit to Nearby with a location fetches immediately; a failed first fetch waits for a manual retry.
  - Automatic refresh while Nearby is active needs both ≥ 50 m moved from the last successful query location and ≥ 60 s since the last request started; eligibility is re-checked on location change, every 5 s, and on returning to the tab.
  - Otherwise cached results are reused.
  - Manual refresh skips the movement/interval checks but is ignored while a request is in flight or within 5 s of the last start.
  - Each provider attempt has a 15 s client timeout (10 s server `timeout`), so a request takes at most 30 s; the abort controller cancels it, stale responses are ignored, and a failed refresh keeps the cached list with an error banner.
- Works without enabling sharing. States: location unavailable, loading, empty, error (with Retry).

## People

- Lists other presence users from the existing `live-locations` channel, including viewers who share no coordinates. Sharers show coordinates and a Google Maps link; viewers show only "Viewing".

## Providers

`OVERPASS_ENDPOINTS` are tried in order, one at a time, per refresh; refresh throttling is unchanged, so providers are not flooded.

- VK Maps `maps.mail.ru/osm/tools/overpass/api/interpreter`: primary; answered HTTP 200 with `Access-Control-Allow-Origin: *`.
- Private.coffee `overpass.private.coffee`: fallback; returned HTTP 500 in the last check, so it is unverified.
- `overpass-api.de` is not used: it answered HTTP 406 to browser requests, including `/api/status`.
- User cancellation (tab leave, unmount) throws immediately without trying the next provider.
- Network errors, timeouts, non-2xx statuses (except 400), invalid JSON, a missing `elements` array and a runtime-error `remark` fall through to the next provider; when all fail the last error is thrown. HTTP 400 is a query bug and stops immediately.
- Each attempted provider receives the query: the device coordinates and the category filters, plus the browser's IP address and standard headers. No username or sharing state is sent. Browsers cannot set `User-Agent`, so requests are not identified beyond that.

## Limitations

- OSM coverage varies: missing, unnamed or outdated places will not appear, and the public Overpass servers can rate-limit, time out or go offline, and both providers are third-party instances with no uptime guarantee.
- Distances are great-circle (haversine) approximations, not walking distance, and inherit GPS error.

## Free Tier

- Public Overpass instances are free with no key. The OSM wiki lists them as best-effort shared services with fair-use limits and no SLA; VK Maps and Private.coffee publish no separate quota. Usage here is one query per refresh, at most once per 5 s manually and 60 s automatically, per attempted provider.

## Sources

- [Overpass QL `out`](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#out)
- [Public Overpass API instances](https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances)
