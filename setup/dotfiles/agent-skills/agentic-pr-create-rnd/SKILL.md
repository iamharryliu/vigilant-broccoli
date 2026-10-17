---
name: agentic-pr-create-rnd
description: In vigilant-broccoli, research a question and write an R&D note under docs/rnd/ from the R&D template.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Research the supplied question and write `docs/rnd/<concise-kebab-slug>.md` using `docs/rnd/rnd-template.md` exactly.

For repo questions, inspect relevant code/context and cite concrete paths/lines in Context and Sample Implementation. Prefer existing patterns. Multi-change recommendations use ordered mergeable increments per [pull request scope](../../../../docs/agent-support.md#pull-request-scope), each usable as an `agentic-pr-create --prompt` request. If an existing note already answers the question, write nothing and give the reason, naming that note, per [no-change decisions](../../../../docs/agent-support.md#task-contract).

Only `docs/rnd/` may change. Do not commit.

Unattended entry point: `pnpm agentic-pr-create-rnd "<question>"`.
