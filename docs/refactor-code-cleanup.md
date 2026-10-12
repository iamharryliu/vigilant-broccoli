# Refactor & Code Cleanup Checklist

Review the current diff; used by `/refactor-code-cleanup` and `agentic-pr-create`.

## Checklist

- Reuse consts for repeated literals, except styling strings (CSS, Tailwind classes, colors and sizing tokens).
- Remove unused imports/code, leftover debug logs and redundant comments per [Coding Conventions](../CONTEXT.md#coding-conventions). Preserve comments explaining constraints, worked examples, empty blocks and TODO/FIXME/lint directives.
- Format touched files after cleanup.
- Record uncovered external constraints per [nuance-pattern.md](./nuance-pattern.md); keep new documentation in its [owning location](./agent-support.md#documentation-placement).
- Report critical issues and recommendations that materially improve the implementation.

Repository-wide dead-code, stale-documentation and backlog audits are separate [agentic operations](./agent-support.md#agentic-commands).
