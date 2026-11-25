# Agent Context — local-manager-next

## Table of Contents

- [Nuances](#nuances)
  - [PM2 reload needs `pm2 save` for boot resurrect](#pm2-reload-needs-pm2-save-for-boot-resurrect)
  - [Lib-only class changes ship stale CSS from Next's build cache](#lib-only-class-changes-ship-stale-css-from-nexts-build-cache)
  - [Native server dependencies can fail under PM2's Node](#native-server-dependencies-can-fail-under-pm2s-node)

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/(pages)/layout.tsx` (`processKeyboardInput` or `useFocusSearchShortcut`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.

## Nuances

### PM2 reload needs `pm2 save` for boot resurrect

Keep `pm2 save` as the final successful step of start/reload: boot restore reads the saved dump, not PM2's current process list. The host also needs `pm2 startup`. The reload wrapper first runs `git pull --ff-only` and aborts if it fails.

### Lib-only class changes ship stale CSS from Next's build cache

Next's webpack cache can miss Tailwind classes added only in workspace libs. `next.config.js` includes lib source paths, mtimes and sizes in `cache.version` to invalidate it on lib changes. If CSS remains stale, remove `dist/apps/ui/local-manager-next/.next/cache` and rebuild.

### Native server dependencies can fail under PM2's Node

PM2 runs the app with `NODE_INTERPRETER` (`/opt/homebrew/bin/node`), which can be a different major than the shell's Node. A native binding such as `better-sqlite3`'s is built for the shell's Node and fails to load under PM2's, and the failure only appears after `pnpm deploy:local-manager`. For SQLite use Node's built-in `node:sqlite` and add it to the app's `SERVER_ONLY_EXTERNALS` in `next.config.js`, since webpack does not know it as a builtin. Check a new native dependency with `/opt/homebrew/bin/node -e "require('<pkg>')"` before using it in a server route.
