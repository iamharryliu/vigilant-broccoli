# Nominatim API

## Table of Contents

- [Free Tier](#free-tier)

- [API Docs](https://nominatim.org/release-docs/latest/api/Overview/)
- [Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

OpenStreetMap's geocoder. `/search` turns a place name into coordinates and
`/reverse` turns coordinates into an address, with no API key and no account.

- `/reverse?format=jsonv2&lat=..&lon=..&zoom=10` resolves to city level; the
  place sits in whichever of `address.city` / `town` / `village` /
  `municipality` fits its size, so read them in that order.
- `accept-language` picks the language of returned names, falling back to the
  local name.
- Data is ODbL-licensed — any surface showing results must credit
  "© OpenStreetMap contributors".

## Free Tier

- The public instance at `nominatim.openstreetmap.org` is free, keyless, and
  run by the OSM Foundation on donated servers with no SLA.
- Hard limit of 1 request/second per application, no bulk or systematic
  geocoding, and no client-side autocomplete.
- Requests must carry an identifying `User-Agent` (or `Referer`); generic
  library defaults are blocked.
- Results must be cached client-side; repeat lookups of the same point are
  treated as abuse.
- Violations get the client or its IP blocked. Heavier use needs a
  self-hosted instance or a commercial provider.
