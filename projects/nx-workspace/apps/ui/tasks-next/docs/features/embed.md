# Embed

`/embed` is the task list for iframes on any site; `/` is the standalone page. Both render `GoogleTasksComponent` against this app's `/api/tasks/**` (the shared `google-tasks-server` handlers) with voice input off, since the app has no speech-to-text or AI parse routes.

## Sign-in

- A frame cannot sign in itself: Google refuses to be framed, and a cross-site frame's storage is partitioned away from the first-party session.
- The frame's sign-in (and Reconnect Google) opens `/auth/popup` in a named popup, which runs Google sign-in first-party. `/auth/callback` in the popup posts the session to `window.opener` (same origin) and closes; the frame adopts it with `setSession`. Logic: `libs/sign-in-popup.ts`.
- The popup keeps its session under its own storage key and deletes it after the handoff, without a server sign-out (which would revoke the handed-off session). It therefore never shares a rotating refresh token with a first-party tab.
- Google's and Supabase's sign-in hops send COOP only as report-only, so `window.opener` survives the redirects. Do not add a `Cross-Origin-Opener-Policy` header to this app.
- Sign-in requests only the Tasks scope with `include_granted_scopes`, because the stored Google refresh token is shared per email with the manager apps, which also need Calendar.

## Framing

- No `frame-ancestors` or `X-Frame-Options`: any site may frame the app.
- Staging is behind Vercel Authentication and cannot be framed.
- The frame does not report its height or sync its theme; embedders give it a fixed size.

## Consumers

- `local-manager-next`'s home page frames `${NEXT_PUBLIC_TASKS_URL}/embed` when that build-time variable is set, and keeps its native task list otherwise.
- Local testing: `localhost:4000/auth/callback` and `localhost:3000` are on the Supabase redirect allow-list, so run this app on port 4000 when the manager holds 3000.
