---
name: update-readmes
description: In vigilant-broccoli, refresh every README.md against docs/app-readme-pattern.md and the current code.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Review and refresh every `README.md` in the repo to match `docs/app-readme-pattern.md`:

- Apps under `projects/nx-workspace/apps/*` — follow the app pattern.
- Components under `infrastructure/*` (e.g. `terraform`, `local`, `agent-sandbox`) — follow the infrastructure pattern.

Double check each README against the code and fix anything missing or incorrect.
