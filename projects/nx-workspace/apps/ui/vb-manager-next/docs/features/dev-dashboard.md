# Dev Dashboard

## Local Credentials

- The Local Service tab's Local Credentials card copies the local k3s cluster's Grafana admin password and a 24-hour Headlamp login token, the same values as `pnpm local:k3s:grafana:password` and `pnpm local:k3s:headlamp:token`.
- Each copy calls `GET /api/local-credentials?service=<grafana|headlamp>`, which runs `kubectl --context k3d-vb-local` on the host; the value is fetched on click, never polled or rendered.
- The service is matched against `LOCAL_CREDENTIAL_SERVICE` in `src/app/constants/local-credentials.ts`; add a service there and in the route's `READ_CREDENTIAL` map.
- `kubectl` must be on PM2's `PATH` (Docker Desktop's `/usr/local/bin/kubectl` is) and `~/.kube/config` must hold the `k3d-vb-local` context, which `pnpm local:k3s:up` writes.

## TODO

- The TODO tab is read-only: it parses the main checkout's `TODO.md` (`GET /api/todo`) and shows each row's Status (priority · effort · agent) and Brief. Clicking a Brief opens the full Description and Recommended Fix.
- Run agentic solve dispatches `manual-agentic-pr-create` with `prompt: solve <id>`.
- Delete asks for a reason and dispatches the same workflow with `Remove TODO.md row <id>. Reason: <reason>`; that exact form is what `solve-todo-runner.sh` lets through as a TODO-only PR, so keep `dispatchTodoRemoval` in `src/app/api/todo/_lib/todo-dispatch.ts` and `TODO_REMOVAL_REQUEST_RE` in sync. The row stays on the page until that PR merges and the checkout is pulled.
