# Refactor & Code Cleanup Checklist

Shared checklist behind `/refactor-code-cleanup`. Two triggers:

- Manual — run `/refactor-code-cleanup` in an interactive session.
- Automatic — unattended `agentic:task:solve` runs apply this before finishing, per [CLAUDE.md](../CLAUDE.md).

## Checklist

- Double check the implementation and perform necessary cleanups.
- Reduce string literals by using consts. Skip styling-related strings (CSS values, Tailwind classes, inline style objects, color/sizing tokens) — leave those inline.
- Remove unused imports and dead code — variables, functions, or exports that are never referenced.
- Remove debug `console.log` statements left over from development.
- Remove unnecessary comments — inline comments that just restate what the code clearly does.
- Report if there are any critical issues with the implementation.
- Give any recommendations that would significantly improve the implementation, if any.
