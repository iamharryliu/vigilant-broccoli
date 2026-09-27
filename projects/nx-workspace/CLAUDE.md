# CLAUDE — projects/nx-workspace

## Table of Contents

- [Nuances](#nuances)
  - [`sharp` must stay in the nx-workspace root `dependencies`](#sharp-must-stay-in-the-nx-workspace-root-dependencies)
  - [A `react-lib` component renders unstyled in an app that never scanned it](#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it)
  - [The three link surfaces share one section structure and drift silently](#the-three-link-surfaces-share-one-section-structure-and-drift-silently)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../docs/nuance-pattern.md) is the convention.

### `sharp` must stay in the nx-workspace root `dependencies`

`sharp` is only imported by the `hearth` app's `/api/where-is` route, so it
would normally belong in that app's own `package.json`. But Vercel's
serverless bundler for `hearth` only picks up native/optional deps like
`sharp` when they're hoisted into the workspace root `dependencies`
(`projects/nx-workspace/package.json`) — a dep declared solely in the app's
own `package.json` doesn't get bundled the same way, and the deployed
function fails to resolve `sharp` at runtime.

Keep `sharp` in the root `dependencies`, even though nothing at the root
imports it directly.

### A `react-lib` component renders unstyled in an app that never scanned it

Tailwind only generates classes it finds in its `content` globs, and each
app's `tailwind.config.js` lists the internal libs it scans by hand. When
`personal-website-react` started using `react-lib`'s `Sidebar`, the lib's
glob was never added, so every class that only appears inside the lib
(`max-md:-translate-x-full`, `max-md:w-64`, `md:w-14`, ...) was missing from
the CSS. Classes the app happened to use elsewhere still worked, so the
sidebar half-rendered: on mobile it sat on-screen over the page instead of
sliding off-canvas and blocked the menu button. Nothing fails at build or
lint time. Whenever an app starts importing a new internal UI lib, add that
lib's `src/**` glob to the app's Tailwind `content`.

### The three link surfaces share one section structure and drift silently

Three files publish the same set of personal links, each rendering it its own
way, and nothing checks them against each other:

- `apps/ui/personal-website-react/src/app/content/about.md` — a shields.io
  badge table, one row per section. Also the `iamharryliu/iamharryliu` profile
  README (see that app's own `CLAUDE.md`), so a drift here ships to GitHub.
- `apps/ui/personal-website-react/src/app/components/pages/link-tree.page.tsx`
  — `LINK_TREE_SECTIONS`, rendered at `harryliu.dev/links`.
- `libs/@vigilant-broccoli/links/src/lib/pastebin.consts.ts` —
  `PASTEBIN_GROUPS`, rendered by `vb-manager-next`'s `/pastebin`.

They must carry the **same section headings in the same order, with the same
links under each**: Personal, Contact, Address, Career, Software, Business,
Community, Interests and Hobbies. Three exceptions, and only these three:
Address is pastebin-only, Maps is `about.md`-only, and no surface links to
itself (so `/links` omits its own Links entry).

The drift is silent because only the URLs are shared — the section structure is
hand-copied in three renderers with no common type. Before this was written
down, `about.md` called the code section "Portfolio" while the other two called
it "Software", `/links` had no Interests section at all, `harrysellsshit` sat in
a different section in each file, and `about.md`'s IMDb badge pointed at
MyAnimeList.

URLs belong in `libs/@vigilant-broccoli/personal-common-js/src/index.ts`
(`SOCIAL_LINK`, `COMMUNITY_LINK`, `PROJECT_LINK`, `BUSINESS_LINK`,
`INTEREST_LINK`, `EMAIL_LINK`) so at least the addresses can't disagree —
`about.md` is the one surface that can't import them, so check it by hand
against those consts. When editing any one of the three, open the other two in
the same change.
