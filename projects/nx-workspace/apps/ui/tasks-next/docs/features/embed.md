# Embed

`/embed` is the task list for iframes in the manager apps; `/` is the standalone page. Both render `GoogleTasksComponent` against this app's `/api/tasks/**` (the shared `google-tasks-server` handlers) with voice input off, since the app has no speech-to-text or AI parse routes.

## Sign-in

- A frame cannot sign in itself: Google refuses to be framed, and a cross-site frame's storage is partitioned away from the first-party session.
- The frame's sign-in (and Reconnect Google) opens `/auth/popup` in a named popup, which runs Google sign-in first-party. `/auth/callback` in the popup hands the session over and closes; the frame adopts it with `setSession`. Logic: `libs/sign-in-popup.ts`.
- The handoff is only `postMessage` to `window.opener` with this app's origin as the target, so a popup that another site opened cannot deliver the session to it. Any site can open `/auth/popup` and stand by for its result, so never add a delivery channel the popup cannot tie to its opener: a Realtime broadcast keyed by values in the popup URL was removed because it handed sessions to whoever supplied them. Without an opener the popup stays open with a retry message. The popup marker lives in `sessionStorage` as well as `window.name`.
- The handoff only runs on `/auth/callback`, so its Supabase allow-list entries must be the exact `/auth/callback` path: a `/*` entry does not match it, and Supabase falls back to the `Referer` root, where the popup signs itself in and stays open.
- The popup keeps its session under its own storage key and deletes it after the handoff, without a server sign-out (which would revoke the handed-off session). It therefore never shares a rotating refresh token with a first-party tab.
- Google's and Supabase's sign-in hops send COOP only as report-only. Do not add a `Cross-Origin-Opener-Policy` header to this app.
- Sign-in requests only the Tasks scope with `include_granted_scopes`, because the stored Google refresh token is shared per email with the manager apps, which also need Calendar.

## Framing

- `src/proxy.ts` sends `Content-Security-Policy: frame-ancestors` with `'self'` and the origins in `TASKS_FRAME_ANCESTORS`, so other sites cannot frame a (possibly signed-in) task list to clickjack it. `deploy-vercel.ts` sets it to the manager origins from `infrastructure`'s `local-manager-origins.json` and `mobile-manager-origins.json`; a new embedder needs its origin added there. Same-site `*.harryliu.dev` pages are not trusted by default. Dev also allows any `localhost`/`127.0.0.1` port.
- The same header carries the rest of the CSP: scripts, styles and requests stay on this origin plus the runtime `SUPABASE_URL` (sessions live in `localStorage`). Next's App Router inlines hydration scripts, so `script-src` keeps `'unsafe-inline'`; a nonce would force dynamic rendering. Dev adds `'unsafe-eval'` and the HMR socket. A new third-party script, image host or API call needs its origin added in `src/proxy.ts`. The policy is built per request, not in `next.config.js` `headers()`, which are fixed at build time ([Self-Hosting](./self-hosting.md)).
- Embedders should sandbox the frame without `allow-top-navigation`, so a compromised tasks-next cannot redirect them: `allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox` (the sign-in popup needs the last two).
- Staging is behind Vercel Authentication and cannot be framed.
- The frame does not report its height or sync its theme; embedders give it a fixed size.

## Consumers

- `local-manager-next`'s home page frames `tasks.harryliu.dev/embed`; the build-time `NEXT_PUBLIC_TASKS_URL` points it at another instance.
- Local testing: `localhost:4000/auth/callback` and `localhost:3000` are on the Supabase redirect allow-list, so run this app on port 4000 when the manager holds 3000.
