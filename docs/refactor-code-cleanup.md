# Refactor & Code Cleanup Checklist

Review the current diff; used by `/refactor-code-cleanup` and `agentic-pr-create`.

## Checklist

- Reuse consts for repeated literals, except styling strings (CSS, Tailwind classes, colors and sizing tokens).
- Remove unused imports/code, leftover debug logs and redundant comments per [Coding Conventions](../CONTEXT.md#coding-conventions): comments restating the next line, labelling a block in its own code's words (`// Helper function to ...`, `// Start a single container`) or explaining a self-describing flag (`agentRules: false`). Preserve comments explaining constraints, worked examples (`// Example input: "0.0.0.0:8080->80/tcp"`), empty blocks and TODO/FIXME/lint directives.
- Format touched files after cleanup; deleting a comment can change how Prettier wraps the surrounding lines.
- Record uncovered external constraints per [nuance-pattern.md](./nuance-pattern.md); keep new documentation in its [owning location](./agent-support.md#documentation-placement).
- Report critical issues and recommendations that materially improve the implementation.

Repository-wide dead-code, stale-documentation and backlog audits are separate [agentic operations](./agent-support.md#agentic-commands).
