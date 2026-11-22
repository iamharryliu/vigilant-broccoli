# Where Is

Household storage inventory — record storage areas by hand or from photos, AI suggests item tags, search by item.

## Stack

- Supabase — `where_is_rooms`, `where_is_items` + `where_is_images` tables
- Cloudflare R2 (`where-is` bucket) — image storage
- OpenAI GPT-4o — image analysis

## Data Model

- `where_is_rooms` — `id`, `user_id`, `home_id`, `name` (unique per home, case-insensitive)
- `where_is_items` — `id`, `user_id`, `home_id`, `room_id` (nullable; `on delete set null`, so deleting a room leaves its storage areas unassigned), `title`, `description`, `tags[]`
- `where_is_images` — `id`, `item_id`, `r2_key`, `thumbnail_r2_key` (nullable; null for photos saved before thumbnails), `mime_type`, `sort_order`

## Features

- Tied to a home — dropdown selector always shown, home persisted in `?home=` query param, defaults to first home, redirects to `/homes` if none
- Shared with accepted home members — full CRUD access
- Only a title is required; photos are optional, up to 10 per item (max 10MB each, max 50MB total)
- Create: Submit and Suggest tags are separate form actions; the header X closes the dialog without saving
- Update: the header X, Escape and overlay clicks save pending edits first through the dialog's close guard, with no Done button
- Rooms group storage areas: the page's Rooms tab (beside Storage Areas) is a `CRUDItemList` with a name search in place of its title: the create button floats right of the tab selection and the row menu renames (dialog) or deletes it (delete confirms that its storage areas become unassigned); no nesting, photos or ordering
- One Storage Areas list holds every item, each with its room in a badge beside the title; the search box (in place of the list title; the Create Storage Area button floats right of the tab selection) also matches room names, so there is no separate room filter
- The form's Room select offers No room, each room and "+ Add new room…", which swaps it for an inline name input that creates the room immediately and selects it (a name matching an existing room, case-insensitively, selects that room instead); the detail view (mobile page and desktop panel) shows the room
- While an update form is open its row stays in the filtered list, so a room change does not unmount the dialog; it drops out once the form closes
- Update autosaves with no Save button: title and description after an 800ms pause, room, tags and photo changes immediately; saves are serialized, photo controls lock while one runs, a pending edit is flushed when the dialog closes, closing waits for the save and the dialog stays open if it fails, and leaving the page with unsaved changes prompts the browser's warning
- Update photos reorder by drag and drop (mouse, long-press on touch, keyboard); the order persists to `where_is_images.sort_order`
- Removing a photo asks for confirmation first
- Image processing — resize to 1920px max, convert to JPEG, strip EXIF
- Each saved photo also gets a 256px list thumbnail (media-service `/api/where-is/thumbnail`, stored at `<key>.thumb.jpg`), on save and on import; generating it is best effort and never fails the save or import
- The list shows one photo per item: the first photo's thumbnail, or the full image when it has none. While the list loads, placeholder rows show
- Image links are presigned in one batch per request (`POST /api/storage/download-urls` on vb-express, which bucket-service signs locally): the list signs only each item's cover, and `?id=` signs the item's full-size photos too. An edit opened from the list fetches its item once for those full-size links
- AI suggests tags from images on demand via a Suggest tags badge at the end of the tag list (create analyzes the new photos, update re-analyzes stored plus new ones); suggestions not already on the item appear as a checklist with Select all / Clear all, and only confirmed tags are added; it never touches the user-entered description
- Fuzzy search across title, description, tags and room name
- Tags display alphabetically and animate when added or removed in the form
- Delete removes DB rows + R2 objects, thumbnails included
- Export all items to JSON (includes base64 images, the home's room names and each item's room)
- Import from export JSON into any home; rooms match the target home's by name case-insensitively, missing ones are created, and exports from before rooms import unassigned

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
- `where_is_rooms` and `where_is_items` share these two policies

## Routes

- `GET /api/where-is?homeId=` — list items for a home, each with `roomId`, `thumbnailUrl` and an empty `imageUrls`
- `GET /api/where-is?id=` — one item with its full-size `imageUrls` and `thumbnailUrl`
- `POST /api/where-is/upload-url` — mint presigned staging upload URLs for the browser
- `POST /api/where-is` — create item (optional `roomId`) + upload images; returns the new `id`
- `PATCH /api/where-is` — update title, description, tags and `roomId` (`null` clears it, omitted leaves it); delete `removedImageKeys`, rewrite photo order from `imageKeyOrder` (scoped to the item), append `newImages`
- `DELETE /api/where-is` — delete item + R2 images
- `POST /api/where-is/analyze` — AI tag suggestions from images
- `POST /api/where-is/reanalyze` — AI tag suggestions from an item's stored images plus any newly added ones
- `GET /api/where-is/rooms?homeId=` — list a home's rooms by name
- `POST /api/where-is/rooms` — create a room (`name`, `homeId`, `userId`); a duplicate name returns 409
- `PATCH /api/where-is/rooms` — rename a room (`id`, `name`); a duplicate name returns 409
- `DELETE /api/where-is/rooms` — delete a room (`id`); its items become unassigned
- `GET /api/where-is/export?homeId=` — export rooms, items + images as JSON (base64-embedded)
- `POST /api/where-is/import` — import rooms, items + images from export JSON, creating a list thumbnail per image

## Env Vars

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
OPENAI_API_KEY
```
