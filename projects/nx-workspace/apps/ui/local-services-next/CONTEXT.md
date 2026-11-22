# Agent Context — local-services-next

## Table of Contents

- [Nuances](#nuances)
  - [This app is a zone under local-manager-next's origin](#this-app-is-a-zone-under-local-manager-nexts-origin)

## Nuances

### This app is a zone under local-manager-next's origin

`basePath` is `/dev-dashboard/local`; `local-manager-next` rewrites that prefix to `127.0.0.1:1339` and iframes it in the Local Service dashboard tab. The app has no hostname of its own and nothing is registered as a public URL. Keep the prefix identical in this app's `next.config.js` and `local-manager-next`'s `next.config.js` (`LOCAL_SERVICES_PATH`) and dashboard page, and deploy through `pnpm deploy:local`, which reloads this app before the manager.

Sign-in happens in `local-manager-next`. `libs/auth.ts` builds a Supabase client on the same project, so it reads the session that app stored in this origin's `localStorage`; opening the app standalone without a session returns 401 from every `/api` route (`src/proxy.ts`). Client fetches need the [basePath prefix](../../../CONTEXT.md#client-fetches-in-a-basepath-zone-app-need-the-basepath-prefix).
