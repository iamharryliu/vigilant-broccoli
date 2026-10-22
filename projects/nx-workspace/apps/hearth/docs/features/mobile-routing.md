# Mobile Routing

Desktop-only dashboards redirect mobile users (`useIsMobile`, max-width 767px) to their mobile pages with `router.replace`.

## Routes

- `/` — redirects to the first mobile child of the Home nav link (`/whiteboard`)
- `/food-planner` — redirects to the first mobile child of the Food Planner nav link (`/grocery`)
- `/where-is?item=<id>` — redirects to `/where-is/<id>`; the mirror of the desktop redirect in `where-is/[id]/page.tsx`

## Architecture

- `src/lib/use-mobile-redirect.ts` — `useMobileRedirect(target)` and `getFirstMobileChildHref(href)`
- Targets come from `mobileOnlyChildren` in `app.consts.ts` and `ROUTES`, never hardcoded paths
- Dashboards render only when `shouldRender` is true, so they neither flash nor fetch before the redirect fires
- New desktop dashboard whose sections are mobile pages: set `mobileOnlyChildren` on its nav link and gate it with the hook
