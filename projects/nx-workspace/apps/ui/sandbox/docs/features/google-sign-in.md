# Google sign-in

Proves a browser on its own `*.harryliu.dev` origin can sign in through Better Auth on VB Express (`api.harryliu.dev`) before Tasks moves off Supabase Auth.

- `createAuthClient` from `better-auth/react` points at `VITE_VB_EXPRESS_URL` (default `https://api.harryliu.dev`) with `credentials: 'include'`. The variable is a build input, so set it before building; local dev uses `.env.local` with `http://localhost:3001`.
- **Sign in with Google** calls `signIn.social({ provider: 'google', callbackURL })` with the current page as callback; Google redirects to `<api>/api/auth/callback/google`, which sets the session cookie on the API host and returns to the page.
- The session panel reads `get-session` through `useSession` and shows name, email, avatar and expiry. **Sign out** clears it. Errors render as plain text.
- VB Express must list the page's origin in Better Auth `trustedOrigins` (`src/auth.ts`) and in the auth-only credentialed CORS list `AUTH_CLIENT_ORIGINS` (`src/main.ts`). `http://localhost:3000` is already in both.
- The session cookie is `SameSite=None; Secure; Partitioned` on the API host. The sandbox and API are same-site, so a top-level page sends it.
- One environment, deployed from `main`: `sandbox.harryliu.dev` on Pages project `production-sandbox`, owner-only Cloudflare Access (`infrastructure/terraform/cloudflare-sandbox.tf`). Its only deploy target is `deploy`, so pushes to `main` publish it and production runs skip it, an exception to the staging/production target pair. Redeploy with `gh workflow run manual-deploy-app --ref main -f project=sandbox -f environment=staging`.
