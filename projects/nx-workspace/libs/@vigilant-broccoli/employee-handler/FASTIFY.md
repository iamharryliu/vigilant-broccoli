# Fastify Wrapper

`createEmployeeHandlerApp(config, options?)` builds a Fastify instance that exposes your `EmployeeHandlerConfig` over HTTP. Point your deployment of `employee-handler-ui` at it via the `EMPLOYEE_HANDLER_URL` env var.

## Usage

```ts
import {
  createEmployeeHandlerApp,
  EmployeeHandlerConfig,
} from '@vigilant-broccoli/employee-handler';

const myConfig: EmployeeHandlerConfig = {
  onboardUtilities: {/* your impl */},
  activeMaintenanceUtilities: {/* your impl */},
  offboardUtilities: {/* your impl */},
  postRetentionUtilities: {/* your impl */},
};

const app = createEmployeeHandlerApp(myConfig, {
  apiKey: process.env.EMPLOYEE_HANDLER_API_KEY,
  defaultTemplates: [
    { id: 'standard', label: 'Standard', template: '<div>...</div>' },
  ],
});

await app.listen({ port: 3000, host: '0.0.0.0' });
```

## Options

| Option | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | If set, all routes require matching `x-api-key` header. |
| `defaultTemplates` | `SignatureTemplate[]` | Seed templates for the in-memory signature templates store. Defaults `[]`. |

## Routes

Routes are defined once as zod schemas in `src/employee-handler/employee-handler.contract.ts`; the Fastify wrapper mounts and validates request bodies from that contract. The OpenAPI document generated from it is the route reference:

- Live: `GET /api/openapi.json` on any `createEmployeeHandlerApp` instance (behind `apiKey` when set).
- Build-generated: `employee-handler.json`, published by `scripts/generate-openapi-specs.ts` (`project-overview` `generate-openapi` target) to `apps/ui/project-overview/public/openapi/`.

## Migrating from 0.0.x

`0.1.0` replaced Express with Fastify. `createEmployeeHandlerApp` now returns a `FastifyInstance` instead of an Express `Application`:

- Start it with `await app.listen({ port, host })` instead of `app.listen(port, host, cb)`.
- Extend it with Fastify plugins, hooks and routes; Express middleware no longer mounts on it.
- Routes, status codes, response bodies and the `apiKey` 401 `{ error: 'Unauthorized' }` are unchanged. Unknown routes and malformed JSON now answer with Fastify's JSON error bodies, and a request whose `Content-Type` has no parser returns 415.

## Local Dev

A reference service is at `apps/api/mock/mock-employee-handler-service` — runs the mock config:

```
nx serve mock-employee-handler-service
```
