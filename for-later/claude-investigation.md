# Claude Code Prompt Patterns (2026-07-21 → 2026-08-20)

**1,577 prompts** across 293 sessions in 7 project directories. 91% of prompts are short, direct instructions (median 69 chars); the rest are pasted logs/terraform plans/CI output attached to a debugging ask.

## Recurring themes (by % of prompts matching)

| Theme                                             | Count | Example                                                                                                 |
| ------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------- |
| Explain/question ("how/why/what/do you think")    | 198   | "Do you think this design is better if the purpose is to not expose the APIs directly"                  |
| Implement/build a feature                         | 194   | "Implement as list levels external libs, internal libs, deployment"                                     |
| UI/frontend (sidebar, hearth, react components)   | 182   | "sidebar working incorrectly ... not staying open when returning ... in mobile view"                    |
| Refactor/cleanup (move, remove, simplify, rename) | 154   | "remove the fallback from agent sandbox /ship-pr"                                                       |
| Infra/deploy/terraform/CI                         | 137   | "PR ci actions failing after `<commit>`, make sure that ..."                                            |
| PR / code review                                  | 121   | "Can you review current code and this PR ... assess ... safe to use and pose no security risks"         |
| Fix/debug a bug or error                          | 96    | "Investigate this issue `github.com/.../actions/runs/...`"                                              |
| Personal notes (cooking, career, journal)         | 95    | "make a document food-lingo.md with markdown table Term Description"                                    |
| Calendar / vb-manager-next work                   | 89    | "Can you add the socket server connection to vb-manager-next dev-dashboard ... under tailscale"         |
| Docs/notes maintenance                            | 57    | "double check accuracy and validity of current CLAUDE docs and secret-management"                       |
| Agent/Claude meta (subagents, skills, memory)     | 51    | "Can you look at pnpm agent commands and make an automated command to fix a PR"                         |
| Testing                                           | 33    | "let's implement step 2 but can you try test out a tmp local sample to see if the code actually works?" |

(Categories overlap — many prompts match more than one tag, e.g. a PR-review prompt about terraform.)

## By project

- **vigilant-broccoli** (1,152 prompts / 230 sessions) — dominant, split across feature implementation, infra/terraform, refactoring, PR review, and personal notes (cooking/career/journal live here too).
- **nx-workspace** (269 / 47) — mostly implementation + refactor + personal notes + bug fixes.
- **elva11-monorepo** (80 / 9) and **antelligence** (52 / 4) — work context, mostly implementation and PR review respectively.
- **journal, vigilant-broccoli-projects, employee-handler** — low volume, occasional use.

## Behavioral patterns

- **~11% of prompts are mid-task interruptions** (`[Request interrupted by user]`) — you frequently stop Claude partway through and redirect rather than letting a wrong-direction response finish.
- **Debugging by paste**: recurring pattern of pasting a Terraform plan, CI log, or `pnpm agentic:pr:fix` script output directly into the prompt and asking "does this look right?" / "why is this failing?" rather than describing the error.
- **Heavy reliance on repo-specific slash commands** for repeatable workflows — `/ship-pr`, `/refactor-code-cleanup`, `/update-feature-documentation`, `/create-todo-task` show up repeatedly as the last step of a task rather than as ad-hoc asks.
- **"Nudge and correct" loop**: several sessions show a live back-and-forth of quick corrections ("nvm don't test it this way...", "can we fix that gap?") rather than one long upfront spec — iterative steering is the default working style.
- **Two recurring non-code threads**: cooking/food-lingo notes and career/interview-prep notes appear steadily interleaved with engineering work in the same repo.
