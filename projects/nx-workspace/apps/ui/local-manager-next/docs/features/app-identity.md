# Local Manager Next identity

The local Next.js management dashboard uses `local-manager-next` for its Nx project, app directory, build and coverage output, PM2 process and local monitoring resources.

- Root commands are `local-manager-next:start`, `local-manager-next:delete`, `local-manager-next:logs`, `local-manager-next:status` and `deploy:local-manager`.
- The theme key `vb-manager-next-theme`, chat and notification storage keys, MongoDB database name and scraper data directory remain unchanged so existing preferences and data survive.
- The local host URL, OAuth callbacks and port 1337 remain unchanged. `vb-manager-next-mobile` is a separate application.
- On the host after merging, build with `pnpm nx run local-manager-next:build` before stopping the old process. Delete the old process with `pm2 delete vb-manager-next`, then run `pnpm local-manager-next:start` (including migrations and `pm2 save`). Do not run both process names on port 1337. If startup fails, repair and start the renamed process before saving the process list; do not resurrect a saved old process beside it.
- Apply the updated local k3s manifests after the host process transition so the ingress backend, Alloy log paths and Grafana dashboard use the new identities. Verify the existing URL, login, Spotify callback, chat, saved theme and logs. Confirm `pm2 status` lists only the renamed dashboard process and persist with `pm2 save` after successful recovery if needed.

This rename retains Next.js. The staged Vite/Fastify migration in root `TODO.md` remains separate.
