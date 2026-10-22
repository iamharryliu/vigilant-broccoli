# In Season Produce

The `InSeasonCard` lists the fruits and vegetables in season as badges, on its own `/in-season` page, linked as "In Season" under Food Planner after Grocery List.

## Data source

- `notes/hobbies/cooking/ingredients/fruits.md` and `vegetables.md` are the single source of truth; their `Seasonal Timeline` Mermaid `gantt` blocks must stay parseable.
- `apps/hearth/scripts/generate-in-season-produce.ts` turns each block into `{ name, months[] }` (wrap-around entries merge) and writes the gitignored `src/lib/generated/in-season-produce.json`. Unknown gantt lines, a missing heading or block, or an empty block throw and fail the build.
- The `build` and `serve:local` targets run the script first; `generate-in-season-produce` is a cached target that `lint` and `typecheck` depend on. Its inputs hash the notes via a `runtime` input because Nx file sets cannot reach outside `projects/nx-workspace`.

## Vercel

`scripts/deploy-vercel.ts` runs `vercel build --cwd <repo root>` on the runner, which executes `nx build hearth` against the full checkout, so `notes/` is on disk when the script runs. The `rootDirectory` setting only affects the upload, so nothing is copied into `projects/nx-workspace`. A build that uploads source and builds on Vercel would not see `notes/`.

## Hemisphere and season

- `src/lib/in-season.ts` holds the pure logic. Latitude from `useGeolocation` decides the hemisphere; until it arrives, or if denied or unsupported, the browser time zone decides (known Southern zones, otherwise Northern).
- Rendering never waits for the permission prompt; the card updates when latitude arrives. Longitude is ignored.
- Northern uses the note months as-is; Southern shifts each month window by 6 months. The current month selects items.

## Grocery list

- Each badge is a button that adds the item to the selected home's grocery list through `/api/grocery` (the `grocery_items` table the grocery page uses). Nothing new is stored.
- Names already on the uncompleted list (case-insensitive) render as a solid badge with a check, disabled so they cannot be added twice. The badge state change is the add feedback; a failed add reverts it.
