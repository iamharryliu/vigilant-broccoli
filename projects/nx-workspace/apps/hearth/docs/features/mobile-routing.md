# Mobile Routing

Desktop-only dashboards render their mobile default child in place on mobile (`useIsMobile`, max-width 767px). The URL never changes: redirecting makes iOS wrap the page with an external app navbar and footer.

## Routes

- `/` — mobile renders the Whiteboard body (first mobile child of the Home nav link); desktop renders the dashboard
- `/kitchen-planner` — mobile renders the Grocery body (first mobile child of the Kitchen Planner nav link); desktop renders the dashboard
- `/where-is?item=<id>` — mobile renders the detail body in place; the desktop redirect in `where-is/[id]/page.tsx` to this URL stays
- Other mobile children (In Season, Kitchen Chores, Kitchen Notes, Kitchen Projects, Kitchen Events, Food Assistant, Calendar) are real routes reached by the sidebar's `Link`s

## Architecture

- `src/lib/use-mobile-view.ts` — `useMobileView(parentHref)` returns `{ ready, MobileView }`; `useMobileReady()` and `getFirstMobileChildHref(href)` back it
- `src/app/mobile-views.ts` — maps a default child href to its shared page-content component (`WhiteboardPageContent`, `GroceryPageContent`); route files are thin wrappers that keep `usePageTitle`
- The default child comes from `mobileOnlyChildren` in `app.consts.ts` and `ROUTES`, never hardcoded paths
- Render nothing until `ready` (`useIsMobile` starts `false` before mount) so neither view flashes or fetches before the choice is made
- New desktop dashboard whose sections are mobile pages: set `mobileOnlyChildren` on its nav link, extract the first child's body into a content component, register it in `MOBILE_VIEWS`, and gate the dashboard with the hook

## Sidebar

- On mobile at a parent URL (`/`, `/kitchen-planner`), the default child (Whiteboard, Grocery List) shows active in `Sidebar.tsx` `isLinkActive`, since that URL shows its content
