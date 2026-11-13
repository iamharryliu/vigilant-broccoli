# Photography

Public album gallery at photography.harryliu.dev. Albums are the subfolders of `photography/` in the default Cloudflare R2 bucket, managed in `local-manager-next`'s `/cms` ([CMS](../../../local-manager-next/docs/features/cms.md)); the site holds no photos and needs no rebuild when they change.

## Table of Contents

- [Albums](#albums)
- [Public endpoints](#public-endpoints)
- [Viewer](#viewer)
- [Environments](#environments)

## Albums

- Keys must be `photography/<album>/<image>`; anything shallower, deeper or not an image (`avif`, `gif`, `jpeg`, `jpg`, `png`, `webp`) is ignored
- The folder name is the album slug and URL (`#/<slug>`); its title is the slug title-cased with `-`/`_` as spaces
- Photos sort by filename with numeric awareness, so `2.jpg` precedes `10.jpg`; the first is the album cover; albums are ordered by their newest upload
- Photos render at their uploaded size with no thumbnails, so upload web-sized images (about 2000 px on the long edge)

## Public endpoints

`GET /api/public/photography/albums` and `GET /api/public/photography/photos/<album>/<file>` in `apps/api/vb-express` (`src/routes/public-photography.ts`) need no API key and are registered outside every protected scope, like the public event-calendars route. They read through `bucket-service` with `provider=cloudflare-r2`, so neither the site nor VB Express holds R2 credentials.

- `albums` lists the bucket on each request and sends `Cache-Control: public, max-age=60`. The bucket list is unprefixed, so its cost grows with the total object count of the shared bucket
- `photos` serves only `photography/<album>/<image>` keys (two segments, image extension, no `..`), never other bucket content, and sends `Cache-Control: public, max-age=86400`. `api.harryliu.dev` is proxied by Cloudflare, so repeat views are served from its edge cache; the staging API on `fly.dev` is not
- CORS for the Pages origins is scoped to the `/api/public/` prefix without credentials in `main.ts`; `<img>` loads need none

## Viewer

Clicking a photo opens `ImageCarouselDialog` from `react-lib-media`: full-screen on phones, arrow keys and swipe to move, one indicator dot per photo.

## Environments

`src/environments/environment.ts` points at `staging-vb-express.fly.dev`; `environment.production.ts` (used by `deploy:production` through the `production-env` mode) at `api.harryliu.dev`. There is no `:preview` trio, because preview origins are not in the public CORS allowlist.
