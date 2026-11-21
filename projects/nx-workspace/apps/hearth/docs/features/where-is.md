# Where Is

Household storage inventory — record storage areas by hand or from photos, AI suggests item tags, search by item.

## Stack

- Supabase — `where_is_items` + `where_is_images` tables
- Cloudflare R2 (`where-is` bucket) — image storage
- OpenAI GPT-4o — image analysis

## Data Model

- `where_is_items` — `id`, `user_id`, `home_id`, `title`, `description`, `tags[]`
- `where_is_images` — `id`, `item_id`, `r2_key`, `thumbnail_r2_key` (nullable; null for photos saved before thumbnails), `mime_type`, `sort_order`

## Features

- Tied to a home — dropdown selector always shown, home persisted in `?home=` query param, defaults to first home, redirects to `/homes` if none
- Shared with accepted home members — full CRUD access
- Only a title is required; photos are optional, up to 10 per item (max 10MB each, max 50MB total)
- Create: Submit and Suggest tags are separate form actions; the header X closes the dialog without saving
- Update: the header X, Escape and overlay clicks behave like Done through the dialog's close guard
- Update autosaves with no Save button: title and description after an 800ms pause, tags and photo changes immediately; saves are serialized, photo controls lock while one runs, a pending edit is flushed when the dialog closes, Done waits for the save and stays open if it fails, and leaving the page with unsaved changes prompts the browser's warning
- Update photos reorder by drag and drop (mouse, long-press on touch, keyboard); the order persists to `where_is_images.sort_order`
- Removing a photo asks for confirmation first
- Image processing — resize to 1920px max, convert to JPEG, strip EXIF
- Each saved photo also gets a 256px list thumbnail (media-service `/api/where-is/thumbnail`, stored at `<key>.thumb.jpg`), on save and on import; generating it is best effort and never fails the save or import
- The list shows one photo per item: the first photo's thumbnail, or the full image when it has none. While the list loads, the search box and placeholder rows show
- Image links are presigned in one batch per request (`POST /api/storage/download-urls` on vb-express, which bucket-service signs locally): the list signs only each item's cover, and `?id=` signs the item's full-size photos too. An edit opened from the list fetches its item once for those full-size links
- AI suggests tags from images on demand via a Suggest tags badge at the end of the tag list (create analyzes the new photos, update re-analyzes stored plus new ones); suggestions not already on the item appear as a checklist with Select all / Clear all, and only confirmed tags are added; it never touches the user-entered description
- Fuzzy search across title, description, tags
- Tags display alphabetically and animate when added or removed in the form
- Delete removes DB rows + R2 objects, thumbnails included
- Export all items to JSON (includes base64 images)
- Import from export JSON into any home

## Save Path Timeouts and Errors

- Client uploads images to R2 staging via presigned URLs, then `POST`/`PATCH /api/where-is` reads each staged object, processes it, deletes the staged object (best effort) and uploads the final image (`read`, `process`, `delete-staged`, `upload-final`)
- Every fetch in `api/where-is/r2.ts` has an `AbortSignal.timeout`: 10s for vb-express presign and delete calls, 20s for R2 transfers (the read signal also covers the body)
- `processImage` is raced against a 20s timeout in `route.ts`; the race stops the wait, not the underlying work
- A failed or timed-out step returns JSON `{ error, step }` with 504 (timeout) or 500; `ImageValidationError` stays 400
- `POST` deletes the just-inserted `where_is_items` row (images cascade) when a final upload or image insert fails, so a retry does not duplicate it; `PATCH` applies title and tags first but still returns the error
- Each step logs `step`, R2 key and duration (`console.info` on success, `console.error` on failure or timeout) to Vercel runtime logs; presigned URLs, tokens and image data are never logged
- The client checks `.ok` on upload-url, R2 PUTs, save and refetch; the form shows the error and stays open with previews intact

## RLS

- Owner: full CRUD via `auth.uid() = user_id`
- Accepted home members: full CRUD via `is_home_member()` + `is_home_owner()` security definer functions

## Routes

- `GET /api/where-is?homeId=` — list items for a home, each with `thumbnailUrl` and an empty `imageUrls`
- `GET /api/where-is?id=` — one item with its full-size `imageUrls` and `thumbnailUrl`
- `POST /api/where-is/upload-url` — mint presigned staging upload URLs for the browser
- `POST /api/where-is` — create item + upload images; returns the new `id`
- `PATCH /api/where-is` — update title, description, tags; delete `removedImageKeys`, rewrite photo order from `imageKeyOrder` (scoped to the item), append `newImages`
- `DELETE /api/where-is` — delete item + R2 images
- `POST /api/where-is/analyze` — AI tag suggestions from images
- `POST /api/where-is/reanalyze` — AI tag suggestions from an item's stored images plus any newly added ones
- `GET /api/where-is/export?homeId=` — export all items + images as JSON (base64-embedded)
- `POST /api/where-is/import` — import items + images from export JSON, creating a list thumbnail per image

## Env Vars

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
OPENAI_API_KEY
```
