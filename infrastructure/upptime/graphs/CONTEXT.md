# Graph Runtime Context

Locked dependencies for the isolated monitoring repository's README graph and badge generation.

## Nuances

### Canvas 2 fails on Node 24

`@upptime/graphs@1.2.31` resolves `chartjs-node-canvas@3.2.0`, which depends on `canvas@2.11.2`. Its native installation fails on Node 24. The pinned Upptime action's `graphs` command invokes floating `npx` packages through ShellJS without checking exit codes, then commits and reports success even when no graphs or badge JSON were generated. Run 37381017613 failed only because the subsequent asset validation detected missing `api/staging-docs/uptime.json`.

The isolated package overrides canvas to `3.2.0`, using the Node-API implementation introduced in canvas 3. The same graph generator produced all 240 badge endpoints and weekly PNGs for the 24 migrated services on Node 24 with this override. Keep the lockfile, run `npm ci`, invoke the CLI directly, and validate assets before committing them. Do not restore the upstream action's graph wrapper or relax validation to hide a failed install. This override belongs only to the graph runtime; do not add it to the application workspace's dependency overrides.
