# Nuance Pattern

Record non-obvious repository constraints that code alone does not explain.

## Table of Contents

- [Where a nuance goes](#where-a-nuance-goes)
- [File shape](#file-shape)
- [Harness portability](#harness-portability)
- [Entry shape](#entry-shape)
- [Upkeep](#upkeep)

## Where a nuance goes

Use `## Nuances` in the deepest `CONTEXT.md` containing every affected surface: component, workspace, or repository root. A trap affecting a class of components belongs at their shared ancestor, with a concrete sighting, rather than copied into each component.

Applicable ancestor context is read before subtree edits. Discover nuance files with `rg -l '^## Nuances' --glob CONTEXT.md --hidden`; do not maintain a separate index.

## File shape

Create context only when there are instructions to retain:

- `# Agent Context — <component or directory>`
- A derived `## Table of Contents` linking `##` sections and nested `###` entries; omit it if there are no section headings.
- Directory-specific conventions, followed by `## Nuances` when needed.

README files describe the component; context records its constraints. Do not repeat inherited rules or add empty sections.

## Harness portability

Each source needs an adjacent committed `AGENTS.md` symlink pointing to `CONTEXT.md`. Add, move or delete it with the source. See [agent support](./agent-support.md#adding-a-context-source-or-skill) for adapter validation and [context discovery](./agent-support.md#context-discovery) for instruction limits.

## Entry shape

Use one `###` per trap, appended oldest-first. State the symptom/rule in the heading, then briefly explain its mechanism, affected files/identifiers, current workaround and recovery checks. Mention other affected surfaces when the trap generalizes.

Retain enough evidence to recognize the problem, not an incident transcript. Omit implementation inventories, obvious behavior, repeated instructions and bugs now guarded by code. External workarounds still need their reason until the underlying constraint disappears.

## Upkeep

- Retire entries when the upstream issue is fixed or the workaround disappears; remove empty Nuances sections and rebuild the ToC.
- Repair incoming paths/anchors after moves or heading changes and verify adapter symlinks.
- New directory contexts are discovered automatically by the context site's `snapshot.config.json`; no manual index/config update is needed.
