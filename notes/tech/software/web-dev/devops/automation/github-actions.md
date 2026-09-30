# Github Actions

## Table of Contents

- [Free Tier](#free-tier)
- [Concurrency](#concurrency)

```
on:
  workflow_dispatch:
  push:
  pull_request:
    branches:
      - main
      - "release/*" # supports wildcards
    types: [opened, synchronize, reopened]
  schedule:
    - cron: "0 3 * * *" # every day at 3 AM UTC
```

## Free Tier

- Public repos: unlimited Actions minutes and storage, free.
- Private repos — monthly included minutes reset each billing cycle, unused minutes don't roll over:
  - Free: 2,000 min, 500 MB storage
  - Pro: 3,000 min, 1 GB storage
  - Team: 3,000 min, 2 GB storage
  - Enterprise Cloud: 50,000 min, 50 GB storage
- Minutes are metered per runner OS with a multiplier against the included minutes: Linux 1x, Windows 2x, macOS 10x (a 10-minute macOS job burns 100 included minutes).
- Self-hosted runners bypass the minutes/storage quota entirely — only the (unlimited on all plans) job/workflow API usage limits apply.
- `manual-agentic-solve` runs the agent sandbox on a hosted Linux runner: each dispatch rebuilds the container image and runs a Claude Code solve, so it is a long job (tens of minutes, 1x Linux rate) — free on public repos, but it draws proportionally more included minutes on private plans than the short workflows here.

## Concurrency

`concurrency.group` serialises runs sharing a key; `cancel-in-progress` decides the fate of the run already executing.

- A newly queued run **always** cancels any previously _pending_ run in the same group — "any existing `pending` job or workflow in the same concurrency group will be canceled and the new queued job or workflow will take its place". `cancel-in-progress: true` only extends that to the run currently executing.
- So with `cancel-in-progress: false`, a busy branch does not build up a backlog of runs; the cost surfaces as **wall-clock queueing behind the running job**. A run can sit pending for as long as its predecessor takes and then act on a commit that has already been superseded — which looks like a slow workflow when the work itself was fast.
- `cancel-in-progress` accepts an expression, so it can differ per branch or input: cancel superseded runs for a disposable environment, never interrupt one that must not be left half-applied.
- Workflow-level `concurrency` can only read the `github`, `inputs` and `vars` contexts — not `env`, `secrets` or `needs`. A group that needs anything else has to be computed in a job and keyed at job level.
