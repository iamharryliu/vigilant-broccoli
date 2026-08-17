# Github Actions

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
