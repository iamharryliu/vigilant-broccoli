# Preparation Badges

How today's weather becomes glanceable "what to wear or bring" badges.

## Table of Contents

- [Flow](#flow)
- [Failure behaviour](#failure-behaviour)
- [Configuration](#configuration)
- [Limits](#limits)

## Flow

1. `WeatherApp.tsx` loads the weather from `/api/weather`, renders it, then POSTs it to `/api/preparation`. While that request is pending, badge skeletons and “Checking what to wear or bring…” appear below the weather in a live status region.
2. `src/app/api/preparation/route.ts` validates the payload and calls vb-express `POST /api/llm` with a JSON schema holding one boolean per badge (`wind-`, `rain-`, `snow-resistant clothing`, `sunglasses`).
3. The client renders only the badges that are `true`, labelled from `i18n/en.json` (`PREPARATION.*`).

## Failure behaviour

Any LLM failure (network, non-2xx, malformed output) returns 502 and the client renders no badges; the weather card is unaffected. The loading indicator disappears when the request finishes, including on failure or when no badges are recommended.

## Configuration

`VB_EXPRESS_URL` and `VB_EXPRESS_API_KEY` (see `.env.example`). `deploy-vercel.ts` hardcodes the per-environment `VB_EXPRESS_URL` and pulls the key from Vault. Locally, export `VB_EXPRESS_API_KEY` before `nx serve`.

## Limits

- The weather payload carries current and daily-max wind speed (km/h) and current and daily-total precipitation (mm), which are passed to the LLM alongside the condition.
- `/api/preparation` is unauthenticated and calls an LLM, so it allows 10 requests per minute per client IP (`x-forwarded-for`) and answers 429 with `Retry-After` beyond that. The counter lives in module memory, so on Vercel it limits per warm instance, not globally.
