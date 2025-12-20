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
