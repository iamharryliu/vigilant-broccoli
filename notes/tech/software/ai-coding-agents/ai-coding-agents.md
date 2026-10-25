# AI Coding Agents

## Table of Contents

- [Shared Features](#shared-features)
- [Commands](#commands)
- [Permission Modes](#permission-modes)
- [Performance](#performance)
- [Plans and Billing](#plans-and-billing)
- [Non-Interactive Authentication](#non-interactive-authentication)
- [Why the Sandbox Credential Matters](#why-the-sandbox-credential-matters)
- [Nuances](#nuances)
- [References](#references)

## Shared Features

| Dimension | Claude Code and Codex |
| --- | --- |
| Context compaction | Auto-compacts as the window fills; `/compact` forces it. |
| Hooks | Lifecycle hooks that run scripts around tool use and turn end. |
| MCP servers | Added with `<agent> mcp add`; `/mcp` inspects the connected servers. |
| Project instructions | A markdown file read at session start (`AGENTS.md` in both; `CLAUDE.md` also in Claude Code). |
| Session resume | Continue an earlier conversation from the CLI or a slash command. |
| Skills | A `SKILL.md` per skill, chosen by the model from its `description` or typed explicitly. `/skills` browses what is loaded in Codex. |
| Subagents | Named definitions in an agents directory, each with a description and instructions, delegated to for focused or parallel work. |

## Commands

| Purpose | Claude Code | Codex |
| --- | --- | --- |
| Change settings | `/config` | Edit `~/.codex/config.toml`; `/permissions` for sandbox and approvals |
| Choose the active model | `/model` | `/model` |
| Continue an earlier conversation | `/resume` | `codex resume --last` |
| Open the interactive session | `claude` | `codex` |
| Project instructions file | `CLAUDE.md` or `AGENTS.md` (v2.1.277+) | `AGENTS.md` |
| Roll back to an earlier checkpoint | `/rewind` | No checkpoint rollback; `codex fork` branches a session instead |
| Show version, model, account, and limits | `/status`, `/usage` | `/status` |
| Sign in or switch accounts | `/login` | `codex login` |
| Sign out | `/logout` | `codex logout` |
| Start a fresh conversation | `/clear` | `/new` |
| Summarize context to free up space | `/compact` | `/compact` |

## Permission Modes

| Mode | Claude Code | Codex | Use for |
| --- | --- | --- | --- |
| Plan | `plan`: reads and explores but makes no edits or state-changing commands; ends with a proposed plan to approve. | `--sandbox read-only`, so the agent can inspect but not write. | Scoping unfamiliar or risky work before any change lands. |
| Default | `manual`: prompts before every edit and command not already allowed by settings rules. | `--ask-for-approval untrusted`: prompts before anything outside a trusted read-only set. | Unfamiliar repos and sensitive machines. |
| Accept edits | `acceptEdits`: file edits in the working directory go through; other commands still prompt. | `--sandbox workspace-write --ask-for-approval on-request` (`--full-auto`): writes in the workspace freely. | Routine interactive coding where you review the diff afterwards. |
| Auto | `auto`: a classifier reviews each action, approving routine edits and checks and blocking risky ones such as exfiltration, credential reads or running downloaded code. Headless, a blocked action is refused rather than asked. | `approvals_reviewer = "auto_review"`: an automated reviewer answers on-request approvals. | Long or unattended runs where nobody is watching but a guard is still wanted. |
| Allow-list only | `dontAsk`: anything not pre-approved by allow rules is denied instead of prompted. | `--ask-for-approval never` inside a sandbox: failures return to the model instead of prompting. | Locked-down headless jobs with a known, fixed tool set. |
| Dangerous / bypass | `bypassPermissions` (`--dangerously-skip-permissions`): no checks at all; the CLI recommends it only for sandboxes without internet access. | `--dangerously-bypass-approvals-and-sandbox`: no sandbox and no approvals. | Disposable, network-restricted containers where the container is the guard. |

## Performance

For an unattended `issue/prompt → inspect repo → implement → test → commit → PR` loop (e.g. both run as GitHub Actions agents), the gap is agent behavior more than raw model speed: Codex is tuned for long-horizon autonomy and leans on repeated implement → verify → repair cycles, where Claude Code tends to start editing sooner and reach a PR faster on straightforward tasks.

| Dimension | Claude Code | Codex |
| --- | --- | --- |
| Complex, long-horizon debugging | Excellent | Excellent — this is the case it's optimized for |
| Repo exploration | Fast | More methodical |
| Risk of over-investigating | Moderate | Higher |
| Starts editing | Usually sooner | Usually later |
| Testing/verification | Good | Very thorough — implement → verify → repair, repeated |
| Time to PR on routine tasks | Usually faster | Often slower |
| Tool calls | Moderate | Often more |

## Plans and Billing

| Dimension | Claude Code | Codex |
| --- | --- | --- |
| Free access | None — the agent requires a paid plan. | Included on the free ChatGPT tier at small limits. |
| Metered alternative | An Anthropic API key, billed to the Console organization at API rates. | An OpenAI Platform API key, billed to the Platform account at API rates. |
| Overage | No top-up — wait for the window to reset or switch that session to API billing. | Plus and Pro can buy credits to keep working past the included allowance. |
| Paid plans | Pro, Max 5x, and Max 20x on individual accounts; Team and Enterprise seats for organizations. | ChatGPT Plus and Pro on individual accounts; Business, Edu, and Enterprise seats for organizations. |
| Shared allowance | Agent usage draws on the same subscription limits as the chat product. | Agent usage draws on the same plan allowance as the chat product. |
| Usage limits | A rolling five-hour window plus a per-account weekly cap that applies across models. | A rolling five-hour window on the lower tiers; the Pro tiers lift most five-hour limits, and the top tiers meter by credits. |

## Non-Interactive Authentication

| Dimension | Claude Code | Codex |
| --- | --- | --- |
| Available on individual plans | Yes — any Pro or Max subscriber can mint one. | No — Plus and Pro do not get Codex access tokens; they are supported for Business and Enterprise workspaces. |
| Credential for headless runs | `claude setup-token` mints an OAuth token, consumed as `CLAUDE_CODE_OAUTH_TOKEN`. | A workspace Codex access token for `codex exec`, or otherwise an API key. |
| Draws on the subscription | Yes — runs authenticated with the OAuth token count against the plan's limits instead of API billing. | Only through a workspace access token. An API key is separate API billing, not subscription usage. |
| Official CI action | `anthropics/claude-code-action`, which accepts either the OAuth token or an API key. | `openai/codex-action`, which fronts an API key with a proxy so shell steps never see it. |
| Scope restrictions | Model requests only — no remote-control sessions or account-side connectors. Some fast-start modes ignore the variable. | Documented for trusted local automation; the vendor warns against exposing them to public CI, forked pull requests, or shared machines. |
| Token lifetime | One year. | Finite and workspace-capped, on the order of weeks to a few months. |

## Why the Sandbox Credential Matters

An agentic sandbox — a disposable container or CI runner that clones a repo, runs the agent unattended, and opens a pull request — needs a credential with no browser in the loop. Which credential is available decides the cost model of the whole pipeline:

- **Claude Code on a personal subscription**: the OAuth token makes sandbox runs draw on the flat monthly plan. Marginal cost per run is zero until the window's limits are hit, so the budgeting question is throughput, not spend. The tradeoff is that the token is tied to one person's account and to their limits, which is why sharing it across a team is discouraged in favour of an API key.
- **Codex on a personal subscription**: there is no Plus/Pro subscription-backed access token for headless runs. The supported automation default is an API key, so every run is metered per token. The subscription keeps paying for interactive work while automation bills separately — two budgets for one tool. Device-code login or copying `~/.codex/auth.json` can carry a personal ChatGPT login into a headless machine, but those are cached-login workarounds rather than a managed CI token.
- **Codex on a business workspace**: a Business or Enterprise workspace access token closes the gap, with shorter expiry and an explicit steer away from public CI.

The practical consequence is that unattended, high-volume agent loops are cheap to prototype on a Claude subscription and carry a variable per-token bill on Codex unless the account sits on a business workspace.

## Nuances

| Dimension | Claude Code | Codex |
| --- | --- | --- |
| Context compaction | Re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000 tokens each within a 25,000 budget. | Threshold capped at 90% of the context window and lowerable in config, firing before the next user message or at a tool-loop boundary. |
| Hooks | Declared in settings; an individual skill can also carry its own `hooks` entries. | Shell scripts (beta) on events such as pre-tool-use, post-tool-use, and turn end. `/hooks` lists them, and untrusted projects skip them. |
| MCP servers | Can be committed per project. | Recorded in `config.toml`. |
| Permissions and approvals | Named session modes, cycled with Shift+Tab or set with `--permission-mode <mode>` at launch. Per-tool prompts are pre-approved through settings rules or a skill's `allowed-tools`. Deny rules (`--disallowedTools`) apply in every mode, bypass included, so a headless run in auto can still keep `git push` out of the agent's hands. | No named modes; the same spectrum is composed from an explicit `sandbox_mode` paired with a separate `approval_policy`, changeable mid-session with `/permissions`. See [Sandbox](./codex.md#sandbox). |
| Project instructions | `CLAUDE.md` (or `AGENTS.md` from v2.1.277), merged from the user-level file down through the directory tree. | `AGENTS.md`, found by walking up to the project root, with a 32 KiB default byte cap and configurable fallback filenames. See [config.toml](./codex.md#configtoml). |
| Session resume | `/resume` picks up an earlier conversation; `/rewind` rolls back to an earlier checkpoint; `/clear` starts fresh. | `codex resume --last` continues the most recent session; `codex fork --last` branches a copy so an alternative approach doesn't cost the original. |
| Skill invocation | Typed as `/<name>`; custom commands and skills share one `/` namespace. | Typed as `$<name>`; `/` stays reserved for built-ins, so a skill and a built-in never shadow each other. |
| Skill locations | `.claude/skills/`, `~/.claude/skills/`, a nested directory, managed settings, or a plugin. Frontmatter can restrict tools, bind arguments, scope to file globs, or fork the skill into a subagent. | `.agents/skills/` in the repo or a parent, `$HOME/.agents/skills/`, `/etc/codex/skills`, plus the set bundled with the CLI. |
| Slash commands | Custom commands _are_ skills, so `/<name>` comes from the skill directory. Arguments substitute as `$ARGUMENTS` or by name, and a command can inject shell output before the turn. | Reusable prompt files under `~/.codex/prompts/` still appear as `/prompts:<name>`, but skills are now the recommended authoring format for them. |
| Subagents | Markdown definitions in `.claude/agents/`. The main agent delegates on its own reading of the task, and a skill can fork into one. | TOML definitions in `.codex/agents/` or `~/.codex/agents/`, requiring `name`, `description`, and `developer_instructions`. Spawns one only on an explicit request, or when `AGENTS.md` or a skill says to, which makes parallelism explicit rather than emergent. |

## References

- [Codex](./codex.md) — commands, `config.toml`, sandbox modes
- [LLM Chat Services](../llm-chat-services.md) — the chat products these subscriptions also cover
