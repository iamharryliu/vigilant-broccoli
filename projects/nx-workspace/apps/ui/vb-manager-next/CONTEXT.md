# Agent Context — vb-manager-next

## Table of Contents

- [Nuances](#nuances)
  - [`@nx/next` build doesn't copy `deprecation.js` into `dist/.nx-helpers`](#nxnext-build-doesnt-copy-deprecationjs-into-distnx-helpers)
  - [PM2 reload needs `pm2 save` for boot resurrect](#pm2-reload-needs-pm2-save-for-boot-resurrect)
  - [Lib-only class changes ship stale CSS from Next's build cache](#lib-only-class-changes-ship-stale-css-from-nexts-build-cache)
  - [A failed kanban board fetch used to look like a brand-new account](#a-failed-kanban-board-fetch-used-to-look-like-a-brand-new-account)
  - [Kanban's cross-lane drag reads CheckList's internal dnd-kit payload](#kanbans-cross-lane-drag-reads-checklists-internal-dnd-kit-payload)

## Nuances

### `@nx/next` build doesn't copy `deprecation.js` into `dist/.nx-helpers`

`@nx/next@23.0.1` copies `compose-plugins.js` but misses its `./deprecation` dependency, so `next start` throws `Error: Cannot find module './deprecation'` and PM2 crash-loops (a 502 through `manager.vigilant-broccoli.app`). Keep the post-build `scripts/fix-next-config-helpers.js` step in `project.json` until the upstream copy logic is fixed. It resolves the installed package rather than relying on pnpm's changing hash paths; both PM2 targets depend on the patched build.

### PM2 reload needs `pm2 save` for boot resurrect

Keep `pm2 save` as the final successful step of start/reload: boot restore reads the saved dump, not PM2's current process list. The host also needs `pm2 startup`. The reload wrapper first runs `git pull --ff-only` and aborts if it fails.

### Lib-only class changes ship stale CSS from Next's build cache

Next's webpack cache can miss Tailwind classes added only in workspace libs. `next.config.js` includes lib source paths, mtimes and sizes in `cache.version` to invalidate it on lib changes. If CSS remains stale, remove `dist/apps/ui/vb-manager-next/.next/cache` and rebuild.

### A failed kanban board fetch used to look like a brand-new account

Keep failed loads distinct from confirmed-empty state in `kanban.component.tsx`: `fetchKanbanState` returns `{ ok: false }` on failure and hydration exits. Falling through to default-board creation would immediately upsert over the user's saved MongoDB boards. The same distinction is necessary in any new hydration flow that saves defaults.

### Kanban's cross-lane drag reads CheckList's internal dnd-kit payload

`kanban.component.tsx` owns the `DndContext` around lanes using `GoogleTasksComponent` with `disableInternalDndContext`. Its handlers and `TaskDragOverlay` read CheckList's untyped payload: `type: 'task'`, `task`, `taskListId`, and droppable `type: 'taskList'`.

Despite CheckList's generic typed props, these literals remain task-specific for this consumer. If changing `libs/@vigilant-broccoli/react-lib/src/components/CheckList.tsx`'s payload, update the kanban handlers together; TypeScript does not check this coupling.
