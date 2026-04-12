# Where Is

Household storage inventory — upload photos of storage areas, AI identifies contents, search by item.

## Stack

- Supabase — `where_is_items` + `where_is_images` tables
- Cloudflare R2 (`home-management` bucket) — image storage
- OpenAI GPT-4o — image analysis

## Data Model

- `where_is_items` — `id`, `user_id`, `home_id`, `title`, `description`, `tags[]`
- `where_is_images` — `id`, `item_id`, `r2_key`, `mime_type`, `sort_order`

## Features

- Tied to a home — auto-selects if user has 1 home, dropdown if multiple, redirects to `/homes` if none
- Upload up to 10 images per item (max 10MB each, max 50MB total)
- Image processing — resize to 1920px max, convert to JPEG, strip EXIF
- AI generates description + tags from images
- Fuzzy search across title, description, tags
- Update title, description, and tags inline
- Delete removes DB rows + R2 objects

## Routes

- `GET /api/where-is?homeId=` — list items for a home
- `POST /api/where-is` — create item + upload images
- `PATCH /api/where-is` — update title, description, tags
- `DELETE /api/where-is` — delete item + R2 images
- `POST /api/where-is/analyze` — AI analysis of images

## Env Vars

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
OPENAI_API_KEY
```
