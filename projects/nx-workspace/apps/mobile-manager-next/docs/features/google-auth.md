# Google Auth

- Sign-in (`signInWithGoogle` in `src/app/providers/auth-provider.tsx`) asks for Tasks and Calendar scopes with offline access (`access_type: 'offline'`, `prompt: 'consent'`), so every sign-in shows Google's consent screen.
- After the OAuth redirect, the provider POSTs the session's `provider_refresh_token` to `/api/auth/google-token`, which checks the allowed email and upserts it into the `google_oauth_tokens` table shared with local-manager-next.
- Google-backed routes (`/api/tasks`, `/api/tasks/lists`, `/api/tasks/move`, `/api/tasks/create`, `/api/calendar/events`) call `requireGoogleAuth` (`libs/api-auth.ts`), which resolves a cached or refreshed access token from that row (`libs/google-token.ts`, a wrapper over `@vigilant-broccoli/react-lib-auth/google-token-server` shared with local-manager-next). The client neither stores nor sends a Google token.
- A missing row or a refresh token Google revoked returns 401 `{ error: 'google_token_expired' }`: the agenda calls `reconnectGoogle` and the Tasks tab shows react-lib's `GoogleReconnectView`. Reconnecting never signs out of Supabase.
- Needs `GOOGLE_AUTH_PROVIDER_CLIENT_ID` and `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET` (`.env.example`, pushed from Vault by `scripts/deploy-vercel.ts`).
