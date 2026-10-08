# FindMe Tabs

Map, Nearby and People tabs in `FindMeApp.tsx`; the username and sharing controls sit above the tab bar so they stay visible on every tab.

## Table of Contents

- [Overview](#overview)
- [Map](#map)
- [Nearby](#nearby)
- [People](#people)
- [Limitations](#limitations)

## Overview

- Map is the default tab. The tab bar is an ARIA tablist (arrow keys, Home/End, roving `tabIndex`).
- `useGeolocation`, `useLiveLocations` and `useNearbyPlaces` are called in `FindMeApp`, above the tab content, and every panel stays mounted (`hidden` when inactive), so switching tabs keeps the username, sharing state, geolocation watch, Supabase presence channel and Leaflet map.

## Map

- `FindMeMap.tsx` (client-only, shared OSM tile layer and attribution). Own location always renders locally; it is broadcast only while sharing is on.
- Showing a POI sets a `requestKey`; the map recentres and opens the POI popup (name, category, live distance) once per key, so distance updates never re-pan it.
- `invalidateSize` runs when the tab becomes active and on container resize (a hidden Leaflet container measures 0×0).

## Nearby

- Overpass query (`lib/overpass.ts`) for `nwr` elements within `NEARBY_RADIUS_METRES` (250 m) of the device location. Category filters are explicit in `CATEGORY_FILTERS` (`consts/nearby.consts.ts`): shops, food and drink, parks, named natural features, tourism and historic attractions.
- Results are deduplicated by `type/id`, then by same name + category within 30 m. Name falls back to `brand`, `operator`, then "Unnamed <category>".
- **Area distance rule:** nodes use the straight line to the point; ways and relations use the straight line to the nearest point of their bounding box (0 m when inside it). Overpass `around` already matches area geometry within 250 m, so a park whose centre is farther than 250 m is kept. A box over-covers irregular shapes, so the distance is a lower-bound approximation.
- Distances are recomputed from the live device location on every update, independent of network refreshes. Results sort nearest first.
- **Refresh rules** (`hooks/useNearbyPlaces.ts`, constants in `consts/nearby.consts.ts`):
  - First visit to Nearby with a location fetches immediately; a failed first fetch waits for a manual retry.
  - Automatic refresh while Nearby is active needs both ≥ 50 m moved from the last successful query location and ≥ 60 s since the last request started; eligibility is re-checked on location change, every 5 s, and on returning to the tab.
  - Otherwise cached results are reused.
  - Manual refresh skips the movement/interval checks but is ignored while a request is in flight or within 5 s of the last start.
  - Each request has a 15 s client timeout (10 s server `timeout`) and an abort controller; stale responses are ignored, and a failed refresh keeps the cached list with an error banner.
- Works without enabling sharing. States: location unavailable, loading, empty, error (with Retry).

## People

- Lists other presence users from the existing `live-locations` channel, including viewers who share no coordinates. Sharers show coordinates and a Google Maps link; viewers show only "Viewing".

## Limitations

- OSM coverage varies: missing, unnamed or outdated places will not appear, and the public Overpass server can rate-limit or time out.
- Distances are great-circle (haversine) approximations, not walking distance, and inherit GPS error.
