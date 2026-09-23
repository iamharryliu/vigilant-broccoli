# CLAUDE — projects/nx-workspace

## Table of Contents

- [Nuances](#nuances)
  - [`sharp` must stay in the nx-workspace root `dependencies`](#sharp-must-stay-in-the-nx-workspace-root-dependencies)
  - [A `react-lib` component renders unstyled in an app that never scanned it](#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it)

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
