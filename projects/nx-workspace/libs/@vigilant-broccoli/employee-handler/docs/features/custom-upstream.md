# Building a Custom Upstream

Satisfy the `employee-handler-ui` upstream contract.

`employee-handler-ui` talks to an upstream over HTTP when `EMPLOYEE_HANDLER_URL` is set. The contract (zod route definitions, exported from this lib) is the single source of truth; pick one way to satisfy it:

- **Auth** — the UI forwards the `x-api-key` header; reject requests whose key does not match yours.
- **TypeScript** — pass your `EmployeeHandlerConfig` to `createEmployeeHandlerApp` (see [EXPRESS.md](../../EXPRESS.md)); it mounts every route, validates request bodies and serves the spec.
- **Any other language** — implement the OpenAPI spec directly. Fetch it from `GET /api/openapi.json` on a running wrapper, or from the build-generated `employee-handler.json` in `apps/ui/pages-index/public/openapi/`.
