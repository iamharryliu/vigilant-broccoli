# Sidebar

`libs/@vigilant-broccoli/react-lib` — collapsible/drawer nav rail shared across hearth, vb-manager-next, employee-handler-ui, and component-library.

## Exports

- `Sidebar` — main component
- `SidebarCTA` — item type (`id`, `label`, `icon`, `href`, `onClick`, `isActive`, `title`, `children`)
- `SidebarBranding` — optional header logo/label type

## Modes

- **Desktop rail** (`mobileOpen` prop omitted): fixed `w-14` icon rail, `hover:w-48` full width on hover (CSS-only, `group-hover/sidebar`)
- **Mobile drawer** (`mobileOpen`/`onMobileClose` passed): off-canvas `w-64` panel, slides via `translate-x` on `mobileOpen`, dims background with a backdrop that closes on click
- Whichever mode, if **no item (recursively) has an `icon`**, the sidebar is always fixed-width `w-48`/expanded — a rail with no icons would be blank, so hover-collapse and mobile-icon-rail are both skipped (`canCollapse`/`hasIcon`)

## Nested groups

- An item with `children` renders as a toggle button + collapsible list, one group open at a time per nesting level (`openId` at the top level, a separate `openChildId` per parent for deeper nesting), keyed by `id` ?? `href` ?? `label`
- `defaultOpenId` seeds the open group on mount **and re-applies whenever it changes** — a consumer that recomputes `defaultOpenId` from its own selection state (e.g. "open the group containing the active item") gets it re-expanded automatically without extra wiring
- Group toggle buttons carry `aria-expanded`
- Icon-less items/groups always show their label (no icon to fall back to when collapsed)

## Mobile drawer + hover interaction

- Hovering out of the aside collapses any open nested group (`onMouseLeave` → `setOpenId(null)`) — this is desktop rail behavior only
- Guarded off when: the drawer is currently open (`forceExpanded`), sidebar has no icons (`forceExpanded` again), **or the viewport is narrow** (`isNarrowViewport`, `max-width: 767px` matching Tailwind `md`)
- The narrow-viewport guard exists because closing the drawer (nav click, backdrop tap) can trigger a native `mouseout` on the aside as page content shifts under a stationary pointer — without the guard this silently collapsed the just-opened group before the user reopened the drawer
- Search input clears and collapses all groups on the same hover-out logic
- Hovering **into** a collapsed desktop rail re-expands straight to the active group (`onMouseEnter` → `setOpenId(defaultOpenId)`), rather than requiring a fresh click every time — same guards as above (skipped when already `forceExpanded`, on a narrow viewport, or when the consumer passes no `defaultOpenId`)

## Search

- `searchable` shows a filter input; results are a flattened list (all nesting removed) of items whose label matches
- Selecting a result or a normal item calls `onMobileClose` (if provided) — closes the drawer, no-op on desktop

## Testing

- `apps/ui/component-library` (react-sandbox's `ComponentSandbox`) is the canonical test surface for both icon-bearing and icon-less nav — its sidebar's `Settings` group has an `Icons: On/Off` toggle that switches every item's `icon` on/off at runtime, so both `canCollapse` branches are reachable from one app without needing a second demo/auth-bypass route
- `apps/ui/component-library/e2e/sidebar.spec.ts` covers: icon-less always-expanded behavior, `defaultOpenId` reactivity, (with Icons toggled on) the narrow-viewport mouseleave guard, and the desktop hover-into-active-group behavior
