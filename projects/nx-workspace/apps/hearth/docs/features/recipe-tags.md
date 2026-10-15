# Recipe Tags

Optional, additive AI tagging of Food Planner recipes by flavour, serving temperature, cooking method and texture.

## Table of Contents

- [Stack](#stack)
- [Categories](#categories)
- [Data Model](#data-model)
- [Routes](#routes)
- [Inference Rules](#inference-rules)
- [Additive Regeneration](#additive-regeneration)
- [Manual Edits](#manual-edits)
- [Upload and Creation Choice](#upload-and-creation-choice)
- [Status, Failures and Retries](#status-failures-and-retries)
- [Interrupted Batches](#interrupted-batches)
- [Search and Display](#search-and-display)
- [Model Usage and Cost](#model-usage-and-cost)

## Stack

- Supabase — `recipes.tags*` columns and the `merge_recipe_tags` function (`20261008000038_add_recipe_tags.sql`)
- VB Express `POST /api/llm` with a JSON schema, model `ANTHROPIC_MODEL.CLAUDE_4_HAIKU` — the same path as `extract-ingredients`; no provider SDK, key or service is added
- Vocabulary and types: `src/app/food-planner/recipe-tags.consts.ts`

## Categories

Machine values are stable snake_case strings; labels live under `FOOD_PLANNER.RECIPES.TAGS` in `i18n/en.json`.

| Category (`key`)                     | Values                                                                                                                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flavour (`flavours`)                 | sweet, salty, sour, bitter, umami, spicy, smoky, tangy, earthy, fruity, herbal, nutty                                                                                                                                 |
| Serving temperature (`temperatures`) | hot, warm, room_temperature, cold, frozen                                                                                                                                                                             |
| Cooking method (`methods`)           | baking, roasting, grilling, broiling, frying, deep_frying, stir_frying, sauteing, boiling, simmering, steaming, poaching, braising, stewing, slow_cooking, pressure_cooking, sous_vide, fermenting, pickling, no_cook |
| Texture (`textures`)                 | crispy, crunchy, creamy, smooth, chewy, tender, juicy, soft, firm, flaky, crumbly, fluffy, sticky                                                                                                                     |

Each category holds any number of values. Generated values are appended in vocabulary order; stored order is otherwise preserved.

## Data Model

`recipes` gains `tags` (JSONB, four arrays, default empty), `tags_status` (`SUCCEEDED` | `FAILED` | null), `tags_attempted_at`, `revision` and `tags_revision`.

- Existing rows load with empty tags and a null status ("never generated / skipped"); there is no backfill.
- A `before update` trigger bumps `revision` when title, description or markdown change and `tags_revision` when `tags` change.
- `SUCCEEDED` with empty tags is a valid outcome (nothing in the recipe clearly matched); it is shown differently from `FAILED` and from never-generated.

## Routes

- `POST /api/food-planner/recipes` batch import now also returns `recipeIds` (input order). Saving never calls the classifier; the 200-recipe limit is unchanged.
- `POST /api/food-planner/recipes/{id}/generate-tags` — one recipe, initial generation and additive regeneration. Order: authenticate → read the recipe through RLS (home access check; 404 otherwise) → call VB Express → validate → `merge_recipe_tags` → return the persisted recipe.
- `PATCH /api/food-planner/recipes` accepts `tags` plus `tagsRevision`. Tags are validated against the vocabulary; a `tagsRevision` mismatch returns 409 `TAGS_CONFLICT` and the client reloads.

Errors carry a `code` (`TAGGING_NOT_CONFIGURED`, `TAGGING_FAILED`, `RECIPE_STALE`, `TAGS_CONFLICT`) and a generic message; provider details and secrets are never returned.

## Inference Rules

The system prompt tells the model to classify the **finished dish** from title, description, ingredients and method together, conservatively, leaving unsupported categories empty. Specifically:

- Temperature is **serving** temperature, not chilli heat or oven temperature (spicy chilled noodles → `spicy` + `cold`, not `hot`); several temperatures only when the recipe supports them.
- A crunchy raw ingredient does not make the finished dish crunchy.
- `no_cook` is never combined with real cooking methods in one generated result (the server drops `no_cook` if the model returns both).

Recipe text is sent as a JSON object and declared untrusted data in the system prompt. Input is truncated (title 200, description 1,000, markdown 12,000 characters) and the call times out after 45 s. Output is validated with Zod, normalised, whitelisted against the vocabulary and de-duplicated; malformed output is a failure, never an empty success.

## Additive Regeneration

Regeneration only adds. `merge_recipe_tags` locks the row, appends candidates the recipe lacks per category and keeps every stored tag, so manual tags survive and repeats never duplicate: `[umami, smoky]` + `[umami, spicy]` → `[umami, smoky, spicy]`. There is no reset action. If the content `revision` changed since the recipe was read (an edit landed during the model call), the function returns nothing and the route answers 409 `RECIPE_STALE`; nothing is applied and the user retries.

## Manual Edits

The Edit Recipe form shows every vocabulary value as a toggle per category. Tags are sent only when changed, with the `tagsRevision` they were loaded at, so a concurrent generation produces a visible conflict instead of silently overwriting its tags. A manually removed tag may be suggested and added again by a later explicit regeneration. Ordinary content edits never trigger tagging.

## Upload and Creation Choice

File and folder import show **Generate tags automatically** (checked by default); the Add Recipe form has the same checkbox. Unchecked: recipes are saved with empty tags and no classifier call is made. Checked: recipes are saved first, then the browser calls `generate-tags` for the returned IDs, three at a time, with a progress banner. The result reports saved counts separately from tagging succeeded/failed counts.

## Status, Failures and Retries

Every recipe detail (desktop and mobile) shows a tags panel with the grouped tags, a status line and one action: **Generate tags** (no tags), **Regenerate tags** (has tags) or **Retry tagging** (last attempt failed). Failures (missing VB Express configuration, non-2xx, timeout, malformed output) keep the recipe and its tags and record `FAILED`; a later success sets `SUCCEEDED`.

## Interrupted Batches

Tagging is orchestrated by the browser, not by background server work. Closing the page leaves every saved recipe usable; untagged ones show **Generate tags** later. Nothing classifies the existing library on page load or in a migration.

## Search and Display

Both recipe search interfaces (mobile list filter, desktop explorer search) match title, description, markdown and tag values and their translated labels.

## Model Usage and Cost

One Haiku call per explicit request (typically a few hundred input tokens plus a short JSON answer). An upload with tagging on is at most one call per recipe, up to 200, three concurrent; unchecked uploads make none. No new secrets or services; pricing context is in [free-tier-infrastructure.md](../../../../../../docs/infrastructure/free-tier-infrastructure.md).
