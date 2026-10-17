# Auth Providers

## Table of Contents

- [Products](#products)
- [Better Auth](#better-auth)

## Products

| Product                                                  | Description                                                                       | Pros                                                                               | Cons                                                                                                | Best Used For                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Better Auth](https://better-auth.com/docs/introduction) | TypeScript authentication framework running in your app.                          | Control over auth logic and storage; database adapters; extensible plugins.        | You manage deployment, database migrations, and auth configuration.                                 | TypeScript apps needing customizable auth in their own backend.            |
| [Supabase Auth](https://supabase.com/docs/guides/auth)   | Authentication service integrated with Supabase, available hosted or self-hosted. | Managed hosting option; client SDKs; integration with Postgres row-level security. | Hosted service limits; self-hosting adds maintenance; customization follows service APIs and hooks. | Apps using Supabase or wanting managed auth with database access policies. |

For the broader database and backend platform, see [Supabase](../database/supabase.md).

## Better Auth

[Installation](https://www.better-auth.com/docs/installation)

```
npm install better-auth
npx @better-auth/cli generate --config path/to/auth.ts
npx @better-auth/cli migrate --config path/to/auth.ts
```
