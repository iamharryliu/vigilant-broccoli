# Dev Dashboard

## Render Services

- The Cloud Services tab lists Render services alphabetically, with service type, suspension status, and links to the service dashboard and public app URL when available. Not suspended does not imply a healthy deployment or an awake free instance.
- `GET /api/render/services` uses the existing authenticated API proxy and a server-only `RENDER_API_KEY` injected from Vault by the app environment example. It follows the [Render service API](https://api-docs.render.com/reference/list-services) cursor pagination and returns only display fields.
- The card refreshes every minute while visible, with loading, empty and error states. Provider failures do not appear as an empty account.

## Local Credentials

- The Local Service tab's Local Credentials card copies the local k3s cluster's Grafana admin password and a 24-hour Headlamp login token, the same values as `pnpm local:k3s:grafana:password` and `pnpm local:k3s:headlamp:token`.
- Each copy calls `GET /api/local-credentials?service=<grafana|headlamp>`, which runs `kubectl --context k3d-vb-local` on the host; the value is fetched on click, never polled or rendered.
- The service is matched against `LOCAL_CREDENTIAL_SERVICE` in `src/app/constants/local-credentials.ts`; add a service there and in the route's `READ_CREDENTIAL` map.
- `kubectl` must be on PM2's `PATH` (Docker Desktop's `/usr/local/bin/kubectl` is) and `~/.kube/config` must hold the `k3d-vb-local` context, which `pnpm local:k3s:up` writes.

## TODO

- The TODO tab is read-only: it parses the main checkout's `TODO.md` (`GET /api/todo`), groups rows into sections and a table of contents by `Type` (ordered by `TODO_TYPE_ORDER` in `src/app/constants/todo.ts`), and sorts each section by Priority, Effort, Agent or Model. Rows show Status (priority · effort · agent · model) and Brief; the help icon on the Status header explains the values, and clicking a Brief opens the full Description and Recommended Fix. The legend and sort ranks both come from `TODO_STATUS_LEGEND`, so keep it in step with `docs/todo-pattern.md`.
- Run agentic solve dispatches `manual-agentic-pr-create` with `prompt: solve <id>` and the row's Model as `model` when it is one of `TODO_DISPATCH_MODELS` (otherwise the workflow default). Dispatch results and load failures show as toasts.
- Delete asks for a reason and dispatches the same workflow with `Remove TODO.md row <id>. Reason: <reason>`; that exact form is what `solve-todo-runner.sh` lets through as a TODO-only PR, so keep `dispatchTodoRemoval` in `src/app/api/todo/_lib/todo-dispatch.ts` and `TODO_REMOVAL_REQUEST_RE` in sync. The row stays on the page until that PR merges and the checkout is pulled.

## Free Tier

- This card creates no Render resources and polls the management API rather than the service URL. Render free web services share 750 instance-hours per workspace per calendar month and spin down after 15 minutes without inbound traffic ([Render free instance limits](https://render.com/docs/free)).
