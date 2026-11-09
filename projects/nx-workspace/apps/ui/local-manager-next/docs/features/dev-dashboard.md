# Dev Dashboard

## Local

- The Local tab iframes `local-services-next` at `/dev-dashboard/local`, which this app rewrites to the PM2 process on `127.0.0.1:1339` (`LOCAL_SERVICES_ORIGIN` overrides the target). It holds the host cards plus the Connection Map, LAN devices and outbound connections. See [local-services.md](../../../local-services-next/docs/features/local-services.md).

## Cloud Services

- The Cloud Services tab iframes `cloud-services-next` at `/dev-dashboard/cloud`, which this app rewrites to the PM2 process on `127.0.0.1:1338` (`CLOUD_SERVICES_ORIGIN` overrides the target). See [cloud-services.md](../../../cloud-services-next/docs/features/cloud-services.md).

## Text Tools

- The Text Tools tab iframes the static `text-tools-ui` site (`VB_APP_URL.TEXT_TOOLS.URL`, `text-tools.harryliu.dev`). The site's `_headers` allows framing only from `https://manager.vigilant-broccoli.app`, so the tab does not render from other origins. See [text-tools.md](../../../text-tools-ui/docs/features/text-tools.md).

## TODO

- The TODO tab is read-only: it parses the main checkout's `TODO.md` (`GET /api/todo`), groups rows into sections and a table of contents by `Type` (ordered by `TODO_TYPE_ORDER` in `src/app/constants/todo.ts`), and sorts each section by Priority, Effort, Agent or Model. Rows show Status (priority · effort · agent · model) and Brief; the help icon on the Status header explains the values, and clicking a Brief opens the full Description and Recommended Fix. The legend and sort ranks both come from `TODO_STATUS_LEGEND`, so keep it in step with `docs/todo-pattern.md`.
- Run agentic solve dispatches `manual-agentic-pr-create` with `prompt: solve <id>` and the row's Model as `model` when it is one of `TODO_DISPATCH_MODELS` (otherwise the workflow default). `QA` rows (`TODO_QA_TYPE`) are manual checks, so their menu omits it and offers only Delete, used once the checks pass. Dispatch results and load failures show as toasts.
- Delete asks for a reason and dispatches the same workflow with `Remove TODO.md row <id>. Reason: <reason>`; that exact form is what `solve-todo-runner.sh` lets through as a TODO-only PR, so keep `dispatchTodoRemoval` in `src/app/api/todo/_lib/todo-dispatch.ts` and `TODO_REMOVAL_REQUEST_RE` in sync. The row stays on the page until that PR merges and the checkout is pulled.
