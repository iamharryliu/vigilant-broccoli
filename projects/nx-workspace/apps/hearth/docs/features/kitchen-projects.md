# Kitchen Projects

Mise en place tracking for the Food Planner — the ferments, proofs, marinades and
prepped components that are _in progress_ rather than done. Modelled on how a
professional kitchen runs a prep list: every item carries a start time, a ready
time and a use-by date instead of a checkbox, and status is derived from the
clock.

## Stack

- Supabase — `kitchen_project_items` table

## Data Model

`kitchen_project_items` — `id`, `name`, `kind`, `location`, `notes`,
`started_at`, `ready_at`, `use_by_at`, `resolution`, `resolved_at`, `home_id`

- `kind` — `FERMENT` | `PROOF` | `MARINATE` | `THAW` | `COMPONENT`
- `location` — `COUNTER` | `FRIDGE` | `FREEZER` | `PANTRY`
- `resolution` — `USED` | `DISCARDED` (null while the item is live)

## Derived Status

Computed client-side in `kitchen-projects.consts.ts`, re-evaluated every minute:

| Status     | Condition                          | Badge |
| ---------- | ---------------------------------- | ----- |
| `WAITING`  | `now < ready_at`                   | blue  |
| `READY`    | past `ready_at`, use-by > 24h away | green |
| `USE_SOON` | use-by within 24h                  | amber |
| `EXPIRED`  | `now >= use_by_at`                 | red   |

Active items sort by urgency (expired → use soon → ready → waiting), then by
nearest deadline — the order a walk-in check reads in.

## Features

- Templates prefill the timings (starter feed, levain, bulk ferment, cold
  retard, marinate, thaw, cooked component, stock, freezer)
- Terminal actions are "Used it up" / "Tossed it", not "complete" — discards
  stay visible under Finished so waste is countable
- Shown as the third sub-tab of the Food Planner list column (Grocery / Chores /
  Projects), and standalone at `/kitchen-projects`

## RLS

Accepted home members get full CRUD via the `homes` + `home_members` subquery
policy, matching `kitchen_chore_items`.

## Routes

- `GET /api/kitchen-projects?homeId=` — list items for a home
- `POST /api/kitchen-projects` — create
- `PATCH /api/kitchen-projects` — update fields or set `resolution`
- `DELETE /api/kitchen-projects` — delete
