# Refactor & Code Cleanup Checklist

Shared checklist behind `/refactor-code-cleanup`. Two triggers:

- Manual — run `/refactor-code-cleanup` in an interactive session.
- Automatic — unattended `agentic-pr-create` runs apply this before finishing, per [CONTEXT.md](../CONTEXT.md).

This checklist is diff-scoped: it only reviews the change in front of it, so code orphaned later by an unrelated change is never revisited. Two Maintain-phase operations cover what it cannot see — `agentic-pr-create-prune` sweeps the whole tree for dead code, unused dependencies and stale docs with zero verified references, and `agentic-pr-create-todo-audit` re-verifies `TODO.md` rows, which the prune never touches. See the [agent sandbox README](../infrastructure/agent-sandbox/README.md#pruning-dead-code-and-stale-docs).

## Checklist

- Double check the implementation and perform necessary cleanups.
- Reduce string literals by using consts. Skip styling-related strings (CSS values, Tailwind classes, inline style objects, color/sizing tokens) — leave those inline.
- Remove unused imports and dead code — variables, functions, or exports that are never referenced.
- Remove debug `console.log` statements left over from development.
- Remove unnecessary comments, per the comment rule in [CONTEXT.md](../CONTEXT.md)'s Coding Conventions. The test: delete the comment and ask whether anything was lost.
  - Remove — restates the next line; labels a block with its own code's words (`// Helper function to ...`, `// Convert project map to array`, `// GET - Fetch public IP address`); explains a self-describing config flag; generator scaffolding left behind by `nx generate`.
  - Keep — why a non-obvious approach was chosen; an external constraint or API quirk; a gotcha; a worked example (`// Example input: "0.0.0.0:8080->80/tcp"`); the sole body of an otherwise-empty block; `TODO`/`FIXME`/lint directives.
  - Deleting a comment can change how Prettier wraps the surrounding lines (a one-item array collapses onto one line), so re-run the formatter on files you touched.
- If the work turned up a non-obvious trap — something that cost real time and isn't derivable from the code — record it per [nuance-pattern.md](./nuance-pattern.md): a `### ` entry in the `## Nuances` section of the `CONTEXT.md` at the deepest directory it affects, plus its Table of Contents line. A workaround left in the code because of an upstream bug is always one of these.
- If the diff adds documentation or context, check each addition sits in its owner per [documentation placement](./agent-support.md#documentation-placement): no domain-specific rule added to the root `CONTEXT.md` that an existing read-first link already covers.
- Report if there are any critical issues with the implementation.
- Give any recommendations that would significantly improve the implementation, if any.
