# Agent Context — projects/nx-workspace

## Table of Contents

- [Nuances](#nuances)
  - [`sharp` must stay in the nx-workspace root `dependencies`](#sharp-must-stay-in-the-nx-workspace-root-dependencies)
  - [A `react-lib` component renders unstyled in an app that never scanned it](#a-react-lib-component-renders-unstyled-in-an-app-that-never-scanned-it)
  - [The three link surfaces share one section structure and drift silently](#the-three-link-surfaces-share-one-section-structure-and-drift-silently)
  - [Nx formatting must not hand the agent symlinks to Prettier](#nx-formatting-must-not-hand-the-agent-symlinks-to-prettier)
  - [Next.js workspace-root inference warnings are accepted](#nextjs-workspace-root-inference-warnings-are-accepted)
  - [`fileReplacements` in a Vite app's `project.json` is ignored](#filereplacements-in-a-vite-apps-projectjson-is-ignored)

## Nuances

### `sharp` must stay in the nx-workspace root `dependencies`

Keep `sharp` in `projects/nx-workspace/package.json`'s `dependencies`. Although only hearth's `/api/where-is` imports it, Vercel failed to bundle the native dependency when it was declared solely in hearth's `package.json`.

### A `react-lib` component renders unstyled in an app that never scanned it

When an app starts importing an internal UI lib, add its `src/**` glob to the app's Tailwind `content`. Classes used only by that lib otherwise disappear silently from the CSS; build and lint still pass. This affected `react-lib`'s Sidebar in `personal-website-react`.

### The three link surfaces share one section structure and drift silently

When editing one of these, check all three; their URLs are shared but their section structures are not:

- `apps/ui/personal-website-react/src/app/content/about.md` (also the GitHub profile README).
- `apps/ui/personal-website-react/src/app/components/pages/link-tree.page.tsx` (`LINK_TREE_SECTIONS`).
- `libs/@vigilant-broccoli/public-links/src/lib/pastebin.consts.ts` (`PASTEBIN_GROUPS`).

Keep matching links under the same headings and order: Personal, Contact, Address, Career, Software, Business, Community, Interests and Hobbies. Exceptions: Address is pastebin-only, Maps is `about.md`-only, and no surface links to itself.

Use `libs/@vigilant-broccoli/personal-common-js/src/index.ts` for URLs; manually check `about.md` against those consts because Markdown cannot import them.

### Nx formatting must not hand the agent symlinks to Prettier

Prettier rejects explicitly passed symlinks ("Explicitly specified pattern is a symbolic link", exit 2) before applying `.prettierignore`. Nx uses this workspace's ignore files when building its file list, so keep `AGENTS.md` in its `.gitignore` even though they are tracked. Format `CONTEXT.md` sources; the root hook filters symlinks in `scripts/shell/format-staged.sh`.

### Next.js workspace-root inference warnings are accepted

The root and workspace `pnpm-lock.yaml` files trigger Next.js's "Next.js inferred your workspace root, but it may not be correct" warning. Keep both lockfiles and current configs; do not add `outputFileTracingRoot`/`turbopack.root` or reopen TODO `1f0a7e` solely to silence the warning.

Revisit only for a reproduced build, file-tracing or deployed-dependency failure attributable to inference. Check the affected app's build/deploy; for hearth's missing `sharp`, check dependency placement first.

### `fileReplacements` in a Vite app's `project.json` is ignored

`@nx/vite/plugin` infers plain `vite build`, which ignores `fileReplacements` and can silently bake staging URLs into production. `calendars`, `cloud-8-skate-react` and `personal-website-react` use `mode: production-env` plus an environment-module alias in `vite.config.mts`. Verify the expected host in built `assets/*.js`, not just `project.json`.
