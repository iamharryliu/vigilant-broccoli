# Embed

`/embed` is the task list for iframes on any site; `/` is the standalone page. Both render `GoogleTasksComponent` against this app's `/api/tasks/**` (the shared `google-tasks-server` handlers) with voice input off, since the app has no speech-to-text or AI parse routes.

## Sign-in

- A frame cannot sign in itself: Google refuses to be framed, and a cross-site frame's storage is partitioned away from the first-party session.
- The frame's sign-in (and Reconnect Google) opens `/auth/popup` in a named popup, which runs Google sign-in first-party. `/auth/callback` in the popup hands the session over and closes; the frame adopts it with `setSession`. Logic: `libs/sign-in-popup.ts`.
- The handoff goes two ways at once: `postMessage` to `window.opener` (same origin), and a one-time Supabase Realtime broadcast for when the browser drops the opener during Google's redirects. The frame picks a random channel and AES-GCM key per sign-in and passes them in the popup URL's fragment, which never reaches a server; the popup keeps them, and its popup marker, in `sessionStorage`. Adopting the same tokens twice is a no-op.
- The handoff only runs on `/auth/callback`, so its Supabase allow-list entries must be the exact `/auth/callback` path: a `/*` entry does not match it, and Supabase falls back to the `Referer` root, where the popup signs itself in and stays open.
- The popup keeps its session under its own storage key and deletes it after the handoff, without a server sign-out (which would revoke the handed-off session). It therefore never shares a rotating refresh token with a first-party tab.
- Google's and Supabase's sign-in hops send COOP only as report-only. Do not add a `Cross-Origin-Opener-Policy` header to this app.
- Sign-in requests only the Tasks scope with `include_granted_scopes`, because the stored Google refresh token is shared per email with the manager apps, which also need Calendar.

## Framing

- No `frame-ancestors` or `X-Frame-Options`: any site may frame the app.
- Staging is behind Vercel Authentication and cannot be framed.
- The frame does not report its height or sync its theme; embedders give it a fixed size.

## Consumers

- `local-manager-next`'s home page frames `tasks.harryliu.dev/embed`; the build-time `NEXT_PUBLIC_TASKS_URL` points it at another instance.
- Local testing: `localhost:4000/auth/callback` and `localhost:3000` are on the Supabase redirect allow-list, so run this app on port 4000 when the manager holds 3000.
