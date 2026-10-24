# Demo Mode

- `DEMO_MODE=true` lets anonymous visitors use the app without Google sign-in. `deploy-vercel.ts` sets it only for the `demo` environment (the `demo-employee-handler-ui` Vercel project); the Docker image never gets it.
- `isDemoMode()` (`src/lib/handler-backend.ts`) is true only when `DEMO_MODE=true` and `EMPLOYEE_HANDLER_URL` is unset, so sign-in is only skipped while `/api/*` runs the bundled `EMPLOYEE_HANDLER_CONFIG_MOCK`. A deployment proxying to a real upstream always requires auth, even if `DEMO_MODE` leaks into its environment.
- `src/proxy.ts` skips the bearer and allowlist checks in demo mode. `/api/config` returns `demo`, which the client reads through `getRuntimeConfig()` (`libs/supabase.ts`); Supabase is never contacted, so the demo needs no Supabase env.
- `AuthProvider` exposes `{ session, isDemo }`. In demo mode `AppLayout` treats the visitor as signed in, so `/login` redirects to the dashboard, a sticky `DemoBanner` sits above every dashboard page, and the sidebar drops Logout.
- The mock keeps its state in module memory, so all visitors served by the same instance share it, and it resets when the instance cold-starts. The banner says so.
