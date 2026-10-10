# Employee Handler

Employee lifecycle automation — onboarding, offboarding, signatures, data sync.

## Table of Contents

- [CLI Script Implementation](#cli-script-implementation)
- [Building a custom upstream](#building-a-custom-upstream)
- [Stack](#stack)

## CLI Script Implementation

```
// script.ts
(async () => {
    try {
        await EmployeeHandlerService.handleInput(YOUR_EMPLOYEE_HANDLER_CONFIG);
    } catch (err) {
        console.error(err);
    } finally {
        console.log('Finally.')
    }
})();
```

```
npx tsx script.ts ACTION

# Onboard
npx tsx script.ts onboardIncomingEmployees

# Active Maintenance
npx tsx script.ts generateLocalSignatures
npx tsx script.ts updateEmailSignatures
npx tsx script.ts emailZippedSignatures
npx tsx script.ts syncData

# Offboard
npx tsx script.ts offboardInactiveEmployees

# Post Retention
npx tsx script.ts postRetentionCleanup
```

## Building a custom upstream

`employee-handler-ui` talks to an upstream over HTTP when `EMPLOYEE_HANDLER_URL` is set. The contract (zod route definitions, exported from this lib) is the single source of truth; pick one way to satisfy it:

- **Auth** — the UI forwards the `x-api-key` header; reject requests whose key does not match yours.
- **TypeScript** — pass your `EmployeeHandlerConfig` to `createEmployeeHandlerApp` (see [EXPRESS.md](./EXPRESS.md)); it mounts every route, validates request bodies and serves the spec.
- **Any other language** — implement the OpenAPI spec directly. Fetch it from `GET /api/openapi.json` on a running wrapper, or from the build-generated `employee-handler.json` in `apps/ui/pages-index/public/openapi/`.

## Stack

- Language - TypeScript
- External libs
  - `express`
  - `nodemailer`
  - `zod`
- Internal libs
  - `common-js`
  - `common-node`
  - `google-workspace`
- Cloud services
  - Google Workspace
  - npm
