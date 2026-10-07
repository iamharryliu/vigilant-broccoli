# Express Wrapper

`createEmployeeHandlerApp(config, options?)` builds an Express app that exposes your `EmployeeHandlerConfig` over HTTP. Point your deployment of `employee-handler-ui` at it via the `EMPLOYEE_HANDLER_URL` env var.

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

app.listen(3000);
```

## Options

| Option             | Type                  | Description                                                                |
| ------------------ | --------------------- | -------------------------------------------------------------------------- |
| `apiKey`           | `string`              | If set, all routes require matching `x-api-key` header.                    |
| `defaultTemplates` | `SignatureTemplate[]` | Seed templates for the in-memory signature templates store. Defaults `[]`. |

## Routes

Routes are defined once as zod schemas in `src/employee-handler/employee-handler.contract.ts`; the Express wrapper mounts and validates request bodies from that contract. The OpenAPI document generated from it is the route reference:

- Live: `GET /api/openapi.json` on any `createEmployeeHandlerApp` instance (behind `apiKey` when set).
- Build-generated: `employee-handler.json`, published by `scripts/generate-openapi-specs.ts` (`pages-index` `generate-openapi` target) to `apps/ui/pages-index/public/openapi/`.

## Local Dev

A reference service is at `apps/api/mock/mock-employee-handler-service` — runs the mock config:

```
nx serve mock-employee-handler-service
```
