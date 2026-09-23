# CLAUDE — vb-manager-next

## Table of Contents

- [Nuances](#nuances)
  - [`@nx/next` build doesn't copy `deprecation.js` into `dist/.nx-helpers`](#nxnext-build-doesnt-copy-deprecationjs-into-distnx-helpers)
  - [A failed kanban board fetch used to look like a brand-new account](#a-failed-kanban-board-fetch-used-to-look-like-a-brand-new-account)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../../docs/nuance-pattern.md) is the convention.

### `@nx/next` build doesn't copy `deprecation.js` into `dist/.nx-helpers`

`@nx/next@23.0.1`'s build step copies its own `compose-plugins.js` helper into
`dist/apps/ui/vb-manager-next/.nx-helpers/` so the built app doesn't depend on
`@nx/next` at runtime. In this version, `compose-plugins.js` itself does
`require('./deprecation')` — but Nx's copy logic
(`create-next-config-file.js`) only walks and copies the relative imports of
the app's own `next.config.js`, not the imports of the helper file it just
copied. So `deprecation.js` never lands in `dist/.nx-helpers/`, and
`next start` throws `Error: Cannot find module './deprecation'` on every
boot — PM2 crash-loops the process (`errored`, restart count climbing, pid 0),
which surfaces as a 502 from anything proxying to it (e.g.
`manager.vigilant-broccoli.app` → `host.docker.internal:1337`).

This isn't caused by anything in this repo — it's an upstream Nx bug that
hits any fresh build of `vb-manager-next` with this `@nx/next` version.

Worked around in `projects/nx-workspace/apps/ui/vb-manager-next/project.json`:
the `build` target now chains
`node scripts/fix-next-config-helpers.js dist/apps/ui/vb-manager-next/.nx-helpers`
after `nx run vb-manager-next:build:next`, which copies the missing
`deprecation.js` from the installed `@nx/next` package (resolved via
`require.resolve('@nx/next/package.json')` rather than a hardcoded pnpm
content-hash path, since that hash changes across installs). Since
`pm2:start`/`pm2:reload` both `dependsOn: ["build"]`, this fixes it
transparently without patching vendored `node_modules` code.

### A failed kanban board fetch used to look like a brand-new account

`vb-manager-next`'s kanban board (`src/app/components/kanban.component.tsx`,
`useBoards`) persists boards to MongoDB per `userEmail`
(`src/app/api/kanban/db.ts`). `fetchKanbanState` used to return `null` for
_any_ non-OK HTTP response from `GET /api/kanban/boards` — collapsing a real
error (an expired/invalid auth token, a transient failure in
`getUserEmail`'s `supabase.auth.getUser(token)` call, a Mongo connection
blip) into the exact same value as "this user has never saved a board."

`hydrate()` treated that value as license to fall through its full
first-time-user path: check `localStorage` (empty, since existing users'
local boards were already migrated and cleared), find nothing, then create a
default empty board and immediately `PUT` it — upserting over the real saved
document. One transient GET failure was enough to permanently wipe a user's
boards on the very next write, with no merge or backup: `saveKanbanState`
does a plain `$set` upsert.

Fixed by making `fetchKanbanState` return a tagged result
(`{ ok: true, state } | { ok: false }`) so `hydrate()` can bail out on a
failed fetch without ever reaching the default-board-creation/persist path.
Any other client-side hydration flow that falls back to "create and save a
default" needs to make the same distinction between a failed load and a
confirmed-empty one.
