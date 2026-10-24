---
name: update-readmes
description: In vigilant-broccoli, refresh every README.md against docs/app-readme-pattern.md and the current code.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Refresh every `README.md` against `docs/app-readme-pattern.md` and current code. Use the app pattern for apps and the infrastructure pattern for infrastructure components; follow directory-specific curation rules.

Also reconcile the generated repo counts by running `pnpm repo-stats`; never hand-edit them. Keep one conservative change of at most 20 files, edit nothing but `README.md` files and the repo-stats copies, never edit `TODO.md`, and report skipped candidates (including any over the cap) with reasons. A run with no drift makes no edits. Do not commit or publish.

Unattended entry point: `pnpm agentic-pr-create-readmes`.
