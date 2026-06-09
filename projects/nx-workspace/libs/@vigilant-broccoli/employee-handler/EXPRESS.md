# Express Wrapper

`createEmployeeHandlerApp(config, options?)` builds an Express app that exposes your `EmployeeHandlerConfig` over HTTP. Point your deployment of `employee-handler-ui` at it via the `EMPLOYEE_HANDLER_URL` env var.

## Usage

```ts
import {
  createEmployeeHandlerApp,
  EmployeeHandlerConfig,
} from '@vigilant-broccoli/employee-handler';

const myConfig: EmployeeHandlerConfig = {
  onboardUtilities: {
    /* your impl */
  },
  activeMaintenanceUtilities: {
    /* your impl */
  },
  offboardUtilities: {
    /* your impl */
  },
  postRetentionUtilities: {
    /* your impl */
  },
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

All routes are mounted under `/api` and mirror the paths the UI calls:

- `GET /api/employees/{incoming,active,inactive}`
- `GET /api/onboard`, `POST /api/onboard/manualOnboard`
- `GET /api/offboard`, `POST /api/offboard/manualOffboard`
- `POST /api/recover`
- `GET /api/sync`
- `GET /api/postRetentionCleanup`
- `GET /api/signature/list`
- `POST /api/signature/update`, `POST /api/signature/updateAll`
- `GET /api/signature/updateEmailSignatures`
- `POST /api/signature/emailZippedSignatures`
- `GET /api/signature/downloadZippedSignatures`
- `GET|POST /api/signature-templates`, `PATCH|DELETE /api/signature-templates/:id`

## Local Dev

A reference service is at `apps/api/mock/mock-employee-handler-service` — runs the mock config:

```
nx serve mock-employee-handler-service
```
