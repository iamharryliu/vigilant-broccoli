# AI Coding Agents

Terminal coding agents: how they are used day to day, and how their subscription plans translate into automated, unattended runs. Per-agent command and config reference lives in [Claude Code](./claude-code.md) and [Codex](./codex.md).

## Table of Contents

- [Usage](#usage)
- [Plans and Billing](#plans-and-billing)
- [Non-Interactive Authentication](#non-interactive-authentication)
- [Why the Sandbox Credential Matters](#why-the-sandbox-credential-matters)
- [References](#references)

## Usage

Both agents have converged on the same primitives — a markdown instruction file, `SKILL.md` skills, MCP servers, lifecycle hooks, subagents — so the differences are in where files live, how a capability is invoked, and how much the agent does without being asked.

| Dimension                 | Claude Code                                                                                                                                                                                                         | Codex                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context compaction        | Auto-compacts when the window fills, or on demand with `/compact`. Compaction re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000 tokens each within a 25,000 budget.   | Auto-compacts at a threshold capped at 90% of the context window and lowerable in config, firing before the next user message or at a tool-loop boundary. `/compact` forces it.                                  |
| Hooks                     | Lifecycle hooks declared in settings; an individual skill can also carry its own `hooks` entries.                                                                                                                   | Lifecycle shell scripts (beta) on events such as pre-tool-use, post-tool-use, and turn end. `/hooks` lists them, and untrusted projects skip them.                                                               |
| MCP servers               | Added with `claude mcp add` or committed per project; `/mcp` inspects the connected servers.                                                                                                                        | Added with `codex mcp add` and recorded in `config.toml`; `/mcp` inspects the connected servers.                                                                                                                 |
| Permissions and approvals | Per-tool permission prompts, pre-approved through settings rules or a skill's `allowed-tools`.                                                                                                                      | An explicit `sandbox_mode` paired with a separate `approval_policy`, changeable mid-session with `/permissions`. See [Sandbox](./codex.md#sandbox).                                                              |
| Project instructions      | `CLAUDE.md`, read at session start and merged from the user-level file down through the directory tree.                                                                                                             | `AGENTS.md`, found by walking up to the project root, with a 32 KiB default byte cap and configurable fallback filenames. See [config.toml](./codex.md#configtoml).                                              |
| Session resume            | `/resume` picks up an earlier conversation; `/rewind` rolls back to an earlier checkpoint; `/clear` starts fresh.                                                                                                   | `codex resume --last` continues the most recent session; `codex fork --last` branches a copy so an alternative approach doesn't cost the original.                                                               |
| Skills                    | `SKILL.md` under `.claude/skills/`, `~/.claude/skills/`, a nested directory, managed settings, or a plugin. Frontmatter can restrict tools, bind arguments, scope to file globs, or fork the skill into a subagent. | `SKILL.md` under `.agents/skills/` in the repo or a parent, `$HOME/.agents/skills/`, `/etc/codex/skills`, plus the set bundled with the CLI. `/skills` browses what is loaded.                                   |
| Skill invocation          | Typed as `/<name>`, or chosen by the model from the skill's `description`.                                                                                                                                          | Typed as `$<name>`, or chosen by the model from the skill's `description`.                                                                                                                                       |
| Slash commands            | Built-ins cover session control; custom commands _are_ skills, so `/<name>` comes from the skill directory. Arguments substitute as `$ARGUMENTS` or by name, and a command can inject shell output before the turn. | Built-ins cover session control. Reusable prompt files under `~/.codex/prompts/` still appear as `/prompts:<name>`, but skills are now the recommended authoring format for them.                                |
| Subagents                 | Markdown definitions in `.claude/agents/`. The main agent can delegate on its own judgement, and a skill can fork into one.                                                                                         | TOML definitions in `.codex/agents/` or `~/.codex/agents/`, requiring `name`, `description`, and `developer_instructions`. Local releases spawn one only on an explicit request or an instruction asking for it. |

Two differences matter more than the file paths:

- **Invocation sigil.** Claude Code collapses custom commands and skills into one `/` namespace; Codex keeps `/` for built-ins and uses `$` for skills, so a skill and a built-in can never shadow each other.
- **How much is automatic.** Claude Code will delegate to a subagent on its own reading of the task. Codex spawns one only when asked, or when `AGENTS.md` or a skill tells it to, which makes parallelism explicit rather than emergent.

## Plans and Billing

Both agents are bundled into the vendor's consumer chat subscription rather than sold separately, and both also accept a pay-per-token API key instead.

| Dimension           | Claude Code                                                                                   | Codex                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Free access         | None — the agent requires a paid plan.                                                        | Included on the free ChatGPT tier at small limits.                                                                           |
| Metered alternative | An Anthropic API key, billed to the Console organization at API rates.                        | An OpenAI Platform API key, billed to the Platform account at API rates.                                                     |
| Overage             | No top-up — wait for the window to reset or switch that session to API billing.               | Plus and Pro can buy credits to keep working past the included allowance.                                                    |
| Paid plans          | Pro, Max 5x, and Max 20x on individual accounts; Team and Enterprise seats for organizations. | ChatGPT Plus and Pro on individual accounts; Business, Edu, and Enterprise seats for organizations.                          |
| Shared allowance    | Agent usage draws on the same subscription limits as the chat product.                        | Agent usage draws on the same plan allowance as the chat product.                                                            |
| Usage limits        | A rolling five-hour window plus a per-account weekly cap that applies across models.          | A rolling five-hour window on the lower tiers; the Pro tiers lift most five-hour limits, and the top tiers meter by credits. |

## Non-Interactive Authentication

This is where the two diverge most. Interactive login is a browser flow in both, but only one of them hands an individual subscriber a credential that an unattended container can use while still billing against the subscription.

| Dimension                     | Claude Code                                                                                                             | Codex                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Available on individual plans | Yes — any Pro or Max subscriber can mint one.                                                                           | No — Plus and Pro do not get Codex access tokens; they are supported for Business and Enterprise workspaces.                            |
| Credential for headless runs  | `claude setup-token` mints an OAuth token, consumed as `CLAUDE_CODE_OAUTH_TOKEN`.                                       | A workspace Codex access token for `codex exec`, or otherwise an API key.                                                               |
| Draws on the subscription     | Yes — runs authenticated with the OAuth token count against the plan's limits instead of API billing.                   | Only through a workspace access token. An API key is separate API billing, not subscription usage.                                      |
| Official CI action            | `anthropics/claude-code-action`, which accepts either the OAuth token or an API key.                                    | `openai/codex-action`, which fronts an API key with a proxy so shell steps never see it.                                                |
| Scope restrictions            | Model requests only — no remote-control sessions or account-side connectors. Some fast-start modes ignore the variable. | Documented for trusted local automation; the vendor warns against exposing them to public CI, forked pull requests, or shared machines. |
| Token lifetime                | One year.                                                                                                               | Finite and workspace-capped, on the order of weeks to a few months.                                                                     |

## Why the Sandbox Credential Matters

An agentic sandbox — a disposable container or CI runner that clones a repo, runs the agent unattended, and opens a pull request — needs a credential with no browser in the loop. Which credential is available decides the cost model of the whole pipeline:

- **Claude Code on a personal subscription**: the OAuth token makes sandbox runs draw on the flat monthly plan. Marginal cost per run is zero until the window's limits are hit, so the budgeting question is throughput, not spend. The tradeoff is that the token is tied to one person's account and to their limits, which is why sharing it across a team is discouraged in favour of an API key.
- **Codex on a personal subscription**: there is no Plus/Pro subscription-backed access token for headless runs. The supported automation default is an API key, so every run is metered per token. The subscription keeps paying for interactive work while automation bills separately — two budgets for one tool. Device-code login or copying `~/.codex/auth.json` can carry a personal ChatGPT login into a headless machine, but those are cached-login workarounds rather than a managed CI token.
- **Codex on a business workspace**: a Business or Enterprise workspace access token closes the gap, with shorter expiry and an explicit steer away from public CI.

The practical consequence is that unattended, high-volume agent loops are cheap to prototype on a Claude subscription and carry a variable per-token bill on Codex unless the account sits on a business workspace.

## References

- [Claude Code](./claude-code.md) — commands, context handling, settings
- [Codex](./codex.md) — commands, `config.toml`, sandbox modes
- [LLM Chat Services](../llm-chat-services.md) — the chat products these subscriptions also cover
- [OpenAI Codex access tokens](https://learn.chatgpt.com/docs/enterprise/access-tokens) — Business/Enterprise token availability
- [OpenAI Codex authentication](https://learn.chatgpt.com/docs/auth) — API-key billing and headless login fallbacks
- [OpenAI Codex pricing](https://learn.chatgpt.com/docs/pricing) — plan feature availability
