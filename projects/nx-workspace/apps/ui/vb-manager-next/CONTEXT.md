# Agent Context — vb-manager-next

## Table of Contents

- [Nuances](#nuances)
  - [PM2 reload needs `pm2 save` for boot resurrect](#pm2-reload-needs-pm2-save-for-boot-resurrect)
  - [Lib-only class changes ship stale CSS from Next's build cache](#lib-only-class-changes-ship-stale-css-from-nexts-build-cache)
  - [A failed kanban board fetch must not look like a brand-new account](#a-failed-kanban-board-fetch-must-not-look-like-a-brand-new-account)
  - [Kanban's cross-lane drag reads CheckList's internal dnd-kit payload](#kanbans-cross-lane-drag-reads-checklists-internal-dnd-kit-payload)
  - [Server SQLite uses `node:sqlite`, not `better-sqlite3`](#server-sqlite-uses-nodesqlite-not-better-sqlite3)

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.

## Nuances

### PM2 reload needs `pm2 save` for boot resurrect

Keep `pm2 save` as the final successful step of start/reload: boot restore reads the saved dump, not PM2's current process list. The host also needs `pm2 startup`. The reload wrapper first runs `git pull --ff-only` and aborts if it fails.

### Lib-only class changes ship stale CSS from Next's build cache

Next's webpack cache can miss Tailwind classes added only in workspace libs. `next.config.js` includes lib source paths, mtimes and sizes in `cache.version` to invalidate it on lib changes. If CSS remains stale, remove `dist/apps/ui/vb-manager-next/.next/cache` and rebuild.

### A failed kanban board fetch must not look like a brand-new account

Keep failed loads distinct from confirmed-empty state in `kanban.component.tsx`: `fetchKanbanState` returns `{ ok: false }` on failure and hydration exits. Falling through to default-board creation would immediately upsert over the user's saved MongoDB boards. The same distinction is necessary in any new hydration flow that saves defaults.

### Kanban's cross-lane drag reads CheckList's internal dnd-kit payload

`kanban.component.tsx` owns the `DndContext` around lanes using `GoogleTasksComponent` with `disableInternalDndContext`. Its handlers and `TaskDragOverlay` read CheckList's untyped payload: `type: 'task'`, `task`, `taskListId`, and droppable `type: 'taskList'`.

Despite CheckList's generic typed props, these literals remain task-specific for this consumer. If changing `libs/@vigilant-broccoli/react-lib/src/components/CheckList.tsx`'s payload, update the kanban handlers together; TypeScript does not check this coupling.

### Server SQLite uses `node:sqlite`, not `better-sqlite3`

PM2 runs the app with `NODE_INTERPRETER` (`/opt/homebrew/bin/node`), which can be a different major than the shell's Node. `better-sqlite3`'s native binding is built for the shell's Node and fails to load under PM2's, and the failure only appears after `pnpm deploy:vb-manager`. `src/lib/job-application-runs.db.ts` uses Node's built-in `node:sqlite` instead, and `next.config.js` lists `node:sqlite` in `SERVER_ONLY_EXTERNALS` because webpack does not know it as a builtin. Check a new native dependency with `/opt/homebrew/bin/node -e "require('<pkg>')"` before using it in a server route.
