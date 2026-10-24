# In Season Produce

The `InSeasonCard` lists the fruits and vegetables in season as badges, on the food planner (under the grocery list in the Grocery tab) and on its own `/in-season` page, linked as "In Season" under Food Planner after Grocery List.

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

- Each badge is a button that adds the item to the selected home's grocery list through `/api/grocery` (the `grocery_items` table the grocery page uses). Nothing new is stored. On the food planner the card's `onGroceryAdded` callback refreshes the grocery list after a successful add.
- Names already on the uncompleted list (case-insensitive) render as a solid badge with a check, disabled so they cannot be added twice. The badge state change is the add feedback; a failed add reverts it.

## Season status

- `getSeasonStatus` in `src/lib/in-season.ts` uses the same hemisphere month shift as `getInSeason`. A month is "just in" when the previous month is not in the item's months and "last chance" when the next month is not, wrapping across December (Nov-Feb works). All-year items and mid-run months are regular, with no marker; a one-month run counts as just in.
- The badge is prefixed with 🌱 (just in) or ⏳ (last chance); the aria-label and title append the status text.
- A help icon beside the card title opens a legend dialog listing each emoji and its meaning.

## Month browsing

- ‹ › icon buttons beside the month name step through the year, wrapping across December. The card defaults to the current month; the name comes from `Intl.DateTimeFormat`.
- A "Back to this month" control appears only while another month is shown.
- Items, season statuses and the add-to-grocery action all use the browsed month, with the same hemisphere shift. Browsing is local state and resets on reload.
